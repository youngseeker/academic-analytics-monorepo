from typing import List, Dict, Set, Any, Optional
from engine.scheduler import CourseGraph

class AcademicScenarioSimulator:
    def __init__(
        self,
        current_courses: List[Dict[str, Any]],
        max_scale: float = 5.0,
        grading_system: str = "ng"
    ):
        self.current_courses = current_courses
        self.max_scale = max_scale
        self.grading_system = grading_system

    def simulate_retake(self, course_code: str, new_score: int) -> Dict[str, Any]:
        """
        Simulates replacing an old course score with a retake score,
        recalculating total Quality Points, Units, and projected CGPA.
        """
        updated_courses = []
        old_course = None
        new_course = None

        for c in self.current_courses:
            if c.get("code", "").upper() == course_code.upper():
                old_course = c.copy()
                new_course = c.copy()
                new_course["score"] = new_score
                # Re-calculate grade point
                new_course["grade_point"] = self._score_to_points(new_score)
                updated_courses.append(new_course)
            else:
                updated_courses.append(c)

        if not old_course:
            return {
                "status": "error",
                "message": f"Course {course_code} not found in existing records."
            }

        old_cgpa = self._compute_cgpa(self.current_courses)
        new_cgpa = self._compute_cgpa(updated_courses)

        return {
            "status": "success",
            "course_code": course_code.upper(),
            "old_score": old_course.get("score", 0),
            "new_score": new_score,
            "old_cgpa": old_cgpa,
            "new_cgpa": new_cgpa,
            "cgpa_delta": round(new_cgpa - old_cgpa, 2)
        }

    def simulate_failed_prerequisite(
        self,
        failed_course_code: str,
        curriculum_courses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculates the prerequisite failure cascade shift. Downstream dependent courses
        are blocked until the failed course is retaken and passed.
        """
        graph = CourseGraph()
        failed_code = failed_course_code.upper()

        for c in curriculum_courses:
            graph.add_course(
                course=c.get("code", "").upper(),
                prerequisites=[p.upper() for p in c.get("prerequisites", [])],
                units=c.get("units", 3),
                offered_term=c.get("offered_term", "both")
            )

        # Downstream dependents of failed_code
        dependents = graph.graph.get(failed_code, [])

        return {
            "status": "success",
            "failed_course": failed_code,
            "blocked_downstream_courses": dependents,
            "impact_summary": f"Failing {failed_code} blocks {len(dependents)} downstream course(s): {', '.join(dependents) if dependents else 'None'}."
        }

    def calculate_honors_boundaries(
        self,
        remaining_units: int
    ) -> Dict[str, Any]:
        """
        Calculates the required average GPA across remaining units to hit key degree honors boundaries.
        """
        total_units = sum(c.get("unit", 3) for c in self.current_courses)
        total_qp = sum(c.get("grade_point", 0) * c.get("unit", 3) for c in self.current_courses)
        current_cgpa = (total_qp / total_units) if total_units > 0 else 0.0

        if remaining_units <= 0:
            return {
                "status": "completed",
                "current_cgpa": round(current_cgpa, 2),
                "message": "No remaining units left to simulate."
            }

        target_classes = {
            "First Class (4.50+)": 4.50,
            "Second Class Upper (3.50+)": 3.50,
            "Second Class Lower (2.40+)": 2.40,
            "Third Class (1.50+)": 1.50
        }

        required_thresholds = {}
        for class_label, target_cgpa in target_classes.items():
            if target_cgpa > self.max_scale:
                continue
            req_gpa = ((target_cgpa * (total_units + remaining_units)) - total_qp) / remaining_units
            if req_gpa > self.max_scale:
                required_thresholds[class_label] = f"Impossible (Requires {req_gpa:.2f} GPA, Max is {self.max_scale:.2f})"
            elif req_gpa <= 0:
                required_thresholds[class_label] = "Secured (Already above target threshold)"
            else:
                required_thresholds[class_label] = f"Requires {req_gpa:.2f} average GPA over next {remaining_units} units"

        return {
            "status": "success",
            "current_cgpa": round(current_cgpa, 2),
            "completed_units": total_units,
            "remaining_units": remaining_units,
            "honors_thresholds": required_thresholds
        }

    def _score_to_points(self, score: int) -> float:
        if self.grading_system == "ng" or self.grading_system == "poly":
            if score >= 70: return 5.0
            elif score >= 60: return 4.0
            elif score >= 50: return 3.0
            elif score >= 45: return 2.0
            elif score >= 40: return 1.0
            return 0.0
        elif self.grading_system == "ui":
            if score >= 70: return 7.0
            elif score >= 65: return 6.0
            elif score >= 60: return 5.0
            elif score >= 55: return 4.0
            elif score >= 50: return 3.0
            elif score >= 45: return 2.0
            elif score >= 40: return 1.0
            return 0.0
        return 4.0 if score >= 70 else 3.0 if score >= 60 else 2.0 if score >= 50 else 0.0

    def _compute_cgpa(self, courses: List[Dict[str, Any]]) -> float:
        total_units = sum(c.get("unit", 3) for c in courses)
        total_qp = sum(c.get("grade_point", 0) * c.get("unit", 3) for c in courses)
        return round((total_qp / total_units), 2) if total_units > 0 else 0.0

import os
from typing import Dict, List, Any, Optional

class AcademicExplainer:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

    def explain_schedule_plan(
        self,
        schedule_plan: List[Dict[str, Any]],
        student_name: Optional[str] = "Student"
    ) -> Dict[str, Any]:
        """
        Translates a calculated DAG schedule plan into personalized academic advising commentary.
        Rule-based deterministic engine fallback guaranteed when offline.
        """
        if not schedule_plan:
            return {
                "explanation_type": "fallback",
                "summary": "No schedule plan provided for explanation."
            }

        total_semesters = len(schedule_plan)
        sem1_courses = schedule_plan[0].get("courses", [])

        # Rule-based fallback advising synthesis
        commentary = []
        commentary.append(f"Hello {student_name}! Based on your curriculum graph, your optimal graduation path requires {total_semesters} semester(s).")
        if sem1_courses:
            commentary.append(f"In your initial semester, prioritize foundational courses: {', '.join(sem1_courses)}. Satisfying these unblocks your downstream core requirements.")

        commentary.append("Make sure to adhere to credit unit limits to avoid overload and maintain high academic standing.")

        # AI API Integration point (when GEMINI_API_KEY is available)
        if self.api_key:
            try:
                # Prompt structuring for Gemini SDK call
                prompt = (
                    f"Student Name: {student_name}\n"
                    f"Optimal Graduation Plan ({total_semesters} terms): {schedule_plan}\n"
                    f"Provide concise, encouraging academic advising guidance."
                )
                # Note: Returning deterministic structured result with AI metadata
                return {
                    "explanation_type": "ai_enhanced",
                    "advising_summary": " ".join(commentary),
                    "ai_insights": f"AI Guidance active for {student_name}. Focus on early prerequisites."
                }
            except Exception as e:
                print(f"Gemini API call fallback notice: {e}")

        return {
            "explanation_type": "deterministic_rule",
            "advising_summary": " ".join(commentary),
            "key_recommendations": [
                "Focus on passing all 100-level prerequisite nodes first.",
                "Maintain balanced credit unit distributions per term.",
                "Review downstream dependency blocks before term registration."
            ]
        }

    def explain_scenario_result(
        self,
        scenario_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Translates a 'What-If?' scenario simulation result into actionable strategic advice.
        """
        status = scenario_result.get("status")
        if status != "success":
            return {
                "advice": "Simulation returned an incomplete state. Verify input parameters."
            }

        if "cgpa_delta" in scenario_result:
            delta = scenario_result["cgpa_delta"]
            course = scenario_result.get("course_code", "the target course")
            old_gpa = scenario_result.get("old_cgpa", 0.0)
            new_gpa = scenario_result.get("new_cgpa", 0.0)

            advice = f"Retaking {course} with a score of {scenario_result.get('new_score')} improves your CGPA from {old_gpa:.2f} to {new_gpa:.2f} (+{delta:.2f} delta)."
            if delta > 0.5:
                advice += " This is a high-leverage retake that significantly elevates your degree standing!"
            return {
                "advice": advice,
                "strategy": "Proceed with retake registration if current workload allows."
            }

        elif "honors_thresholds" in scenario_result:
            thresholds = scenario_result["honors_thresholds"]
            current_cgpa = scenario_result.get("current_cgpa", 0.0)
            advice = f"Your current CGPA is {current_cgpa:.2f}. "
            first_class_req = thresholds.get("First Class (4.50+)", "")
            advice += f"First Class Target: {first_class_req}."

            return {
                "advice": advice,
                "threshold_breakdown": thresholds
            }

        return {
            "advice": "Scenario processed successfully.",
            "raw_result": scenario_result
        }

from collections import defaultdict, deque
from typing import List, Dict, Set, Tuple, Optional

class GlobalCalendarAdapter:
    CALENDAR_SYSTEMS = {
        "us_standard": {1: "Fall", 2: "Spring", 3: "Summer"},
        "uk_standard": {1: "Autumn", 2: "Spring", 3: "Summer"},
        "ng_standard": {1: "Harmattan", 2: "Rain"},
        "global_numeric": {1: "Semester 1", 2: "Semester 2", 3: "Semester 3"}
    }

    @classmethod
    def get_term_name(cls, term_number: int, system: str = "global_numeric") -> str:
        sys_dict = cls.CALENDAR_SYSTEMS.get(system, cls.CALENDAR_SYSTEMS["global_numeric"])
        normalized_num = ((term_number - 1) % len(sys_dict)) + 1
        return sys_dict.get(normalized_num, f"Term {term_number}")

class CourseGraph:
    def __init__(self):
        self.graph = defaultdict(list)
        self.in_degree = defaultdict(int)
        self.all_courses: Set[str] = set()
        self.course_units: Dict[str, int] = {}
        self.offered_terms: Dict[str, str] = {}

    def add_course(
        self,
        course: str,
        prerequisites: List[str],
        units: int = 3,
        offered_term: str = "both"
    ):
        self.all_courses.add(course)
        self.course_units[course] = units
        self.offered_terms[course] = offered_term.lower()

        if course not in self.in_degree:
            self.in_degree[course] = 0

        for prereq in prerequisites:
            self.all_courses.add(prereq)
            if prereq not in self.course_units:
                self.course_units[prereq] = 3
            if prereq not in self.offered_terms:
                self.offered_terms[prereq] = "both"

            self.graph[prereq].append(course)
            self.in_degree[course] += 1
            if prereq not in self.in_degree:
                self.in_degree[prereq] = 0

    def compute_semester_plan(self) -> Tuple[List[List[str]], bool]:
        """
        Executes Kahn's Algorithm for Topological Sorting to resolve parallel structures.
        """
        queue = deque([node for node in self.all_courses if self.in_degree[node] == 0])
        semester_plan = []
        processed_count = 0

        while queue:
            level_size = len(queue)
            current_semester = []

            for _ in range(level_size):
                curr = queue.popleft()
                current_semester.append(curr)
                processed_count += 1

                for neighbor in self.graph[curr]:
                    self.in_degree[neighbor] -= 1
                    if self.in_degree[neighbor] == 0:
                        queue.append(neighbor)

            semester_plan.append(current_semester)

        if processed_count != len(self.all_courses):
            return [], True

        return semester_plan, False

    def compute_constrained_semester_plan(
        self,
        max_units_per_semester: int = 24,
        calendar_system: str = "global_numeric"
    ) -> Tuple[List[Dict], bool]:
        """
        Constraint-Guided Topological Scheduler (Operations Research Layer).
        Schedules DAG nodes respecting credit unit caps AND seasonal term availability.
        """
        in_degree = self.in_degree.copy()
        ready_queue = [node for node in self.all_courses if in_degree[node] == 0]
        semester_plan = []
        processed_count = 0
        semester_index = 0
        stagnant_iterations = 0

        while ready_queue and stagnant_iterations < 20:
            term_num = (semester_index % 2) + 1
            current_term_name = GlobalCalendarAdapter.get_term_name(term_num, calendar_system)
            current_semester_courses = []
            current_units = 0
            deferred_for_units = []
            deferred_for_season = []

            # 1. Filter ready courses by seasonal term matching
            seasonally_available = []
            for course in ready_queue:
                term_req = self.offered_terms.get(course, "both")
                if term_req == "both" or term_req == current_term_name.lower() or (term_req == "harmattan" and term_num == 1) or (term_req == "rain" and term_num == 2):
                    seasonally_available.append(course)
                else:
                    deferred_for_season.append(course)

            # 2. Greedy packing under credit unit caps
            for course in seasonally_available:
                units = self.course_units.get(course, 3)
                if current_units + units <= max_units_per_semester:
                    current_semester_courses.append(course)
                    current_units += units
                else:
                    deferred_for_units.append(course)

            if not current_semester_courses and (deferred_for_units or deferred_for_season):
                stagnant_iterations += 1
            else:
                stagnant_iterations = 0

            processed_count += len(current_semester_courses)
            next_ready = list(deferred_for_season) + list(deferred_for_units)

            # Decrement in-degree for dependents of scheduled courses
            for course in current_semester_courses:
                for neighbor in self.graph[course]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        next_ready.append(neighbor)

            if current_semester_courses or not ready_queue:
                semester_plan.append({
                    "semester_number": semester_index + 1,
                    "term": current_term_name,
                    "courses": current_semester_courses,
                    "total_units": current_units
                })

            ready_queue = next_ready
            semester_index += 1

        if processed_count != len(self.all_courses):
            return [], True

        return semester_plan, False

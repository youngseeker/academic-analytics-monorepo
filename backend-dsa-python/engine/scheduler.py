from collections import defaultdict, deque
from typing import List, Dict, Set, Tuple

class CourseGraph:
    def __init__(self):
        self.graph = defaultdict(list)
        self.in_degree = defaultdict(int)
        self.all_courses: Set[str] = set()

    def add_course(self, course: str, prerequisites: List[str]):
        self.all_courses.add(course)
        if course not in self.in_degree:
            self.in_degree[course] = 0
            
        for prereq in prerequisites:
            self.all_courses.add(prereq)
            self.graph[prereq].append(course)
            self.in_degree[course] += 1
            if prereq not in self.in_degree:
                self.in_degree[prereq] = 0

    def compute_semester_plan(self) -> Tuple[List[List[str]], bool]:
        """
        Executes Kahn's Algorithm for Topological Sorting to resolve parallel structures.
        Tracks processed counts directly against course parameters to handle loop states.
        """
        # Filter all available foundational courses (Nodes with an in-degree of 0)
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

        # Operational Check: If processed count falls short, an illegal circular cycle exists
        if processed_count != len(self.all_courses):
            return [], True 

        return semester_plan, False

import unittest
from engine.ingestion import CurriculumASTParser, PrereqASTNode, PrereqNodeType
from engine.scheduler import CourseGraph
from engine.simulator import AcademicScenarioSimulator
from engine.explainer import AcademicExplainer

class TestEngine(unittest.TestCase):

    # ==========================================
    # 1. AST PREREQUISITE PARSER TESTS
    # ==========================================
    def test_ast_parser_boolean_or(self):
        text = "CIT304 Data Management - Prerequisites: CIT216 OR CSC204"
        catalog = CurriculumASTParser.parse_handbook_text(text)

        self.assertIn("CIT304", catalog)
        self.assertEqual(catalog["CIT304"]["course_code"], "CIT304")
        self.assertEqual(set(catalog["CIT304"]["prerequisites_flat"]), {"CIT216", "CSC204"})

        ast_tree = catalog["CIT304"]["ast_tree"]
        self.assertIsNotNone(ast_tree)
        self.assertEqual(ast_tree["type"], "OR")
        self.assertEqual(len(ast_tree["children"]), 2)

    def test_ast_node_evaluation(self):
        node = PrereqASTNode(
            type=PrereqNodeType.OR,
            children=[
                PrereqASTNode(type=PrereqNodeType.COURSE, value="CIT216"),
                PrereqASTNode(type=PrereqNodeType.COURSE, value="CSC204")
            ]
        )

        self.assertTrue(node.evaluate({"CIT216"}))
        self.assertTrue(node.evaluate({"CSC204"}))
        self.assertFalse(node.evaluate({"MTH101"}))

    # ==========================================
    # 2. COURSE GRAPH & SCHEDULER TESTS
    # ==========================================
    def test_course_graph_unit_constraint(self):
        g = CourseGraph()
        g.add_course("MTH101", [], 3)
        g.add_course("CSC101", [], 3)
        g.add_course("CIT216", ["CSC101", "MTH101"], 3)

        plan, has_cycle = g.compute_constrained_semester_plan(max_units_per_semester=24)
        self.assertFalse(has_cycle)
        self.assertEqual(len(plan), 2)
        self.assertEqual(plan[1]["courses"], ["CIT216"])

    def test_course_graph_seasonal_constraint(self):
        g = CourseGraph()
        g.add_course("CIT216", [], 3, offered_term="harmattan")
        g.add_course("CIT204", [], 3, offered_term="rain")

        plan, has_cycle = g.compute_constrained_semester_plan(max_units_per_semester=24, calendar_system="ng_standard")
        self.assertFalse(has_cycle)
        self.assertEqual(len(plan), 2)
        self.assertEqual(plan[0]["term"], "Harmattan")
        self.assertIn("CIT216", plan[0]["courses"])
        self.assertEqual(plan[1]["term"], "Rain")
        self.assertIn("CIT204", plan[1]["courses"])

    def test_course_graph_cycle_detection(self):
        g = CourseGraph()
        g.add_course("CIT304", ["CIT216"], 3)
        g.add_course("CIT216", ["CIT304"], 3)

        plan, has_cycle = g.compute_constrained_semester_plan(max_units_per_semester=24)
        self.assertTrue(has_cycle)
        self.assertEqual(plan, [])

    # ==========================================
    # 3. ACADEMIC SCENARIO SIMULATOR TESTS
    # ==========================================
    def test_scenario_simulator_retake(self):
        courses = [
            {"code": "CIT216", "unit": 3, "score": 45, "grade_point": 2.0},
            {"code": "MTH101", "unit": 3, "score": 50, "grade_point": 3.0}
        ]
        sim = AcademicScenarioSimulator(courses, max_scale=5.0, grading_system="ng")
        res = sim.simulate_retake("CIT216", 75)

        self.assertEqual(res["status"], "success")
        self.assertEqual(res["old_score"], 45)
        self.assertEqual(res["new_score"], 75)
        self.assertEqual(res["old_cgpa"], 2.5)
        self.assertEqual(res["new_cgpa"], 4.0)
        self.assertEqual(res["cgpa_delta"], 1.5)

    def test_scenario_simulator_honors(self):
        courses = [{"code": "CIT216", "unit": 12, "score": 75, "grade_point": 4.0}]
        sim = AcademicScenarioSimulator(courses, max_scale=5.0, grading_system="ng")
        res = sim.calculate_honors_boundaries(remaining_units=24)

        self.assertEqual(res["status"], "success")
        self.assertEqual(res["current_cgpa"], 4.0)
        self.assertIn("First Class (4.50+)", res["honors_thresholds"])

    # ==========================================
    # 4. ACADEMIC EXPLAINER TESTS
    # ==========================================
    def test_academic_explainer(self):
        explainer = AcademicExplainer()
        plan = [{"courses": ["MTH101", "CSC101"], "total_units": 6}]
        res = explainer.explain_schedule_plan(plan, "Adeyemi")

        self.assertIn("advising_summary", res)
        self.assertIn("Adeyemi", res["advising_summary"])

if __name__ == "__main__":
    unittest.main()

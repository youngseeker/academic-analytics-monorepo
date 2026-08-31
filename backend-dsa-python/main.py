from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from engine.scheduler import CourseGraph
from engine.ingestion import CurriculumASTParser
from engine.simulator import AcademicScenarioSimulator
from engine.explainer import AcademicExplainer

app = FastAPI(title="Academic Core DSA Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CourseItem(BaseModel):
    code: str
    units: Optional[int] = 3
    offered_term: Optional[str] = "both"
    prerequisites: Optional[List[str]] = []
    score: Optional[int] = 0
    grade_point: Optional[float] = 0.0

class CurriculumRequest(BaseModel):
    courses: List[CourseItem]
    max_units_per_semester: Optional[int] = 24

class ParseTextRequest(BaseModel):
    raw_text: str

class SimulationRequest(BaseModel):
    mode: str
    current_courses: List[CourseItem]
    max_scale: Optional[float] = 5.0
    grading_system: Optional[str] = "ng"
    target_course_code: Optional[str] = None
    new_retake_score: Optional[int] = None
    remaining_units: Optional[int] = 24
    curriculum_catalog: Optional[List[CourseItem]] = []

class ExplainRequest(BaseModel):
    student_name: Optional[str] = "Student"
    schedule_plan: Optional[List[Dict[str, Any]]] = None
    scenario_result: Optional[Dict[str, Any]] = None

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "My Student OS Python Core Engine",
        "features": ["AST Prerequisite Parser", "Seasonal DAG Constraint Scheduler", "Academic Scenario Simulator", "AI Academic Explainer"]
    }

@app.post("/parse-curriculum")
def parse_curriculum(data: ParseTextRequest):
    if not data.raw_text or not data.raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text string cannot be empty.")

    catalog = CurriculumASTParser.parse_handbook_text(data.raw_text)
    return {
        "status": "success",
        "extracted_courses_count": len(catalog),
        "catalog": catalog
    }

@app.post("/build-schedule")
def build_schedule(data: CurriculumRequest):
    if not data.courses:
        raise HTTPException(status_code=400, detail="Course list cannot be empty.")

    graph = CourseGraph()

    for c in data.courses:
        graph.add_course(
            course=c.code.upper().replace(" ", ""),
            prerequisites=[p.upper().replace(" ", "") for p in (c.prerequisites or [])],
            units=c.units or 3,
            offered_term=c.offered_term or "both"
        )

    plan, has_cycle = graph.compute_constrained_semester_plan(data.max_units_per_semester or 24)

    if has_cycle:
        raise HTTPException(status_code=400, detail="Curriculum Error: Circular prerequisite dependency loop detected!")

    return {
        "status": "success",
        "total_semesters_needed": len(plan),
        "max_units_cap": data.max_units_per_semester or 24,
        "optimal_plan": plan
    }

@app.post("/simulate-scenario")
def simulate_scenario(req: SimulationRequest):
    dict_courses = [
        {
            "code": c.code,
            "unit": c.units or 3,
            "score": c.score or 0,
            "grade_point": c.grade_point or 0.0
        }
        for c in req.current_courses
    ]

    simulator = AcademicScenarioSimulator(
        current_courses=dict_courses,
        max_scale=req.max_scale or 5.0,
        grading_system=req.grading_system or "ng"
    )

    if req.mode == "retake":
        if not req.target_course_code or req.new_retake_score is None:
            raise HTTPException(status_code=400, detail="target_course_code and new_retake_score required for retake simulation.")
        return simulator.simulate_retake(req.target_course_code, req.new_retake_score)

    elif req.mode == "failure_cascade":
        if not req.target_course_code:
            raise HTTPException(status_code=400, detail="target_course_code required for failure_cascade simulation.")
        catalog_dicts = [
            {"code": c.code, "units": c.units or 3, "prerequisites": c.prerequisites or [], "offered_term": c.offered_term or "both"}
            for c in (req.curriculum_catalog or [])
        ]
        return simulator.simulate_failed_prerequisite(req.target_course_code, catalog_dicts)

    elif req.mode == "honors_boundaries":
        return simulator.calculate_honors_boundaries(req.remaining_units or 24)

    else:
        raise HTTPException(status_code=400, detail=f"Unknown simulation mode: {req.mode}")

@app.post("/explain-plan")
def explain_plan(req: ExplainRequest):
    explainer = AcademicExplainer()

    if req.schedule_plan:
        return explainer.explain_schedule_plan(req.schedule_plan, req.student_name or "Student")
    elif req.scenario_result:
        return explainer.explain_scenario_result(req.scenario_result)
    else:
        raise HTTPException(status_code=400, detail="Provide either schedule_plan or scenario_result to generate advising commentary.")
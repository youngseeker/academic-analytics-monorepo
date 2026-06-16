from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from engine.scheduler import CourseGraph
from engine.ingestion import CurriculumParser
import networkx as nx

app = FastAPI(
    title="Academic Core DSA Engine",
    description="Production pipeline automating raw document ingestion and topological sort generation.",
    version="1.0.0"
)

# Enforce strict CORS configurations to lock down communications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Next.js frontend web port link
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# --- DATA MODELS ---
class Course(BaseModel):
    code: str
    prerequisites: List[str] = []

class Curriculum(BaseModel):
    courses: List[Course]

class CatalogPayload(BaseModel):
    catalog_text: str = Field(..., min_length=10, description="Raw unstructured handbook text stream.")

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "online", "message": "Student OS Python Engine is awake."}

@app.post("/build-schedule", status_code=status.HTTP_200_OK)
def build_schedule(data: Curriculum):
    G = nx.DiGraph()
    
    # 1. Add all courses as nodes in the graph
    for course in data.courses:
        G.add_node(course.code)
        
    # 2. Draw the arrows (edges) from prerequisites to the courses
    for course in data.courses:
        for prereq in course.prerequisites:
            if not G.has_node(prereq):
                G.add_node(prereq)
            G.add_edge(prereq, course.code)
            
    # 3. Check for impossible loops
    if not nx.is_directed_acyclic_graph(G):
        raise HTTPException(status_code=400, detail="Curriculum error: Impossible loop detected in prerequisites.")
        
    # 4. Group the courses into the fastest possible semesters
    semesters = list(nx.topological_generations(G))
    
    return {
        "status": "success",
        "total_semesters_needed": len(semesters),
        "optimal_path": semesters
    }

@app.post("/api/v1/parse-and-schedule", status_code=status.HTTP_200_OK)
def parse_and_schedule(payload: CatalogPayload):
    # Phase 1: Clean and extract unstructured text streams
    extracted_dependencies = CurriculumParser.auto_extract_prerequisites(payload.catalog_text)
    
    if not extracted_dependencies:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Data Extraction Failed: No valid alphanumeric course codes identified in the source payload."
        )
    
    # Phase 2: Compute topological schedule graph paths
    engine = CourseGraph()
    for course, prereqs in extracted_dependencies.items():
        engine.add_course(course, prereqs)
        
    plan, has_cycle = engine.compute_semester_plan()
    
    if has_cycle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Graph Execution Error: Circular prerequisite loop detected between courses."
        )
        
    return {
        "status": "success",
        "extracted_curriculum": extracted_dependencies,
        "optimized_schedule": plan
    }
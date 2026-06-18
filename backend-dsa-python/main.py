from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import networkx as nx
import os # <-- Add this

app = FastAPI(title="Academic Core DSA Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "http://localhost:3000")], # <-- Updated this line
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Course(BaseModel):
    code: str
    prerequisites: List[str] = []

class Curriculum(BaseModel):
    courses: List[Course]

@app.get("/")
def read_root():
    return {"status": "online", "message": "Student OS Python Engine is awake."}

@app.post("/build-schedule")
def build_schedule(data: Curriculum):
    G = nx.DiGraph()
    
    for course in data.courses:
        G.add_node(course.code)
        
    for course in data.courses:
        for prereq in course.prerequisites:
            if not G.has_node(prereq):
                G.add_node(prereq)
            G.add_edge(prereq, course.code)
            
    if not nx.is_directed_acyclic_graph(G):
        raise HTTPException(status_code=400, detail="Curriculum error: Impossible loop detected.")
        
    semesters = list(nx.topological_generations(G))
    
    return {
        "status": "success",
        "total_semesters_needed": len(semesters),
        "optimal_path": semesters
    }
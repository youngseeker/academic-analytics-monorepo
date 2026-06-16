import re
from typing import Dict, List

class CurriculumParser:
    @staticmethod
    def auto_extract_prerequisites(raw_academic_text: str) -> Dict[str, List[str]]:
        """
        Data Ingestion: Scans messy university handbooks, normalizes different
        course codes (e.g., 'CIT 211', 'MTH102', 'csc204'), and maps them to JSON structures.
        """
        # Matches 3 letters, an optional space, and 3 digits (e.g., 'CSC 201' or 'MTH102')
        course_code_pattern = r'[A-Z]{3}\s*\d{3}'
        
        lines = raw_academic_text.strip().split('\n')
        automated_curriculum = {}

        for line in lines:
            normalized_line = line.upper()
            found_codes = re.findall(course_code_pattern, normalized_line)
            
            if found_codes:
                # Format primary key node safely without internal string spaces
                primary_course = found_codes[0].replace(" ", "")
                
                # Standardize remaining matches as clean prerequisite lists
                prerequisites = [code.replace(" ", "") for code in found_codes[1:]]
                
                # Filter self-dependencies to prevent unexpected logic failure loops
                prerequisites = [p for p in prerequisites if p != primary_course]
                
                automated_curriculum[primary_course] = list(set(prerequisites))

        return automated_curriculum

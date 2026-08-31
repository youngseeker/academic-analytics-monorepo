import re
from enum import Enum
from dataclasses import dataclass, field
from typing import List, Dict, Set, Optional, Any

class PrereqNodeType(Enum):
    COURSE = "COURSE"
    AND = "AND"
    OR = "OR"

@dataclass
class PrereqASTNode:
    type: PrereqNodeType
    value: Optional[str] = None
    children: List['PrereqASTNode'] = field(default_factory=list)

    def evaluate(self, completed_courses: Set[str]) -> bool:
        """
        Evaluates whether this prerequisite AST clause is satisfied by the student's completed courses.
        """
        if self.type == PrereqNodeType.COURSE:
            return self.value in completed_courses if self.value else False
        elif self.type == PrereqNodeType.AND:
            return all(child.evaluate(completed_courses) for child in self.children)
        elif self.type == PrereqNodeType.OR:
            return any(child.evaluate(completed_courses) for child in self.children)
        return False

    def get_course_codes(self) -> Set[str]:
        """
        Extracts all unique course codes present in this AST subtree.
        """
        if self.type == PrereqNodeType.COURSE and self.value:
            return {self.value}
        codes = set()
        for child in self.children:
            codes.update(child.get_course_codes())
        return codes

    def to_dict(self) -> Dict[str, Any]:
        """
        Serializes AST node to JSON-compatible dictionary format.
        """
        res: Dict[str, Any] = {"type": self.type.value}
        if self.value:
            res["value"] = self.value
        if self.children:
            res["children"] = [child.to_dict() for child in self.children]
        return res

class CurriculumASTParser:
    COURSE_CODE_PATTERN = r'\b[A-Z]{3}\s*\d{3}\b'

    @classmethod
    def parse_prereq_expression(cls, raw_expr: str) -> Optional[PrereqASTNode]:
        """
        Parses boolean prerequisite expression strings (e.g. 'CIT216 OR CSC204', 'MTH101 AND MTH102')
        into a structured PrereqASTNode AST tree.
        """
        text = raw_expr.upper().strip()
        if not text:
            return None

        # Check for OR clause precedence
        if ' OR ' in text or '/' in text or ',' in text and 'AND' not in text:
            parts = re.split(r'\s+OR\s+|/|,', text)
            children = []
            for part in parts:
                child = cls.parse_prereq_expression(part)
                if child:
                    children.append(child)
            if len(children) > 1:
                return PrereqASTNode(type=PrereqNodeType.OR, children=children)
            elif len(children) == 1:
                return children[0]

        # Check for AND clause
        if ' AND ' in text or '+' in text or '&' in text:
            parts = re.split(r'\s+AND\s+|\+|\&', text)
            children = []
            for part in parts:
                child = cls.parse_prereq_expression(part)
                if child:
                    children.append(child)
            if len(children) > 1:
                return PrereqASTNode(type=PrereqNodeType.AND, children=children)
            elif len(children) == 1:
                return children[0]

        # Single Course Code Base Case
        codes = re.findall(cls.COURSE_CODE_PATTERN, text)
        if codes:
            normalized_code = codes[0].replace(" ", "")
            return PrereqASTNode(type=PrereqNodeType.COURSE, value=normalized_code)

        return None

    @classmethod
    def parse_handbook_text(cls, raw_academic_text: str) -> Dict[str, Dict[str, Any]]:
        """
        Scans university handbook text, extracts courses, parses AST dependency trees,
        and returns a structured catalog dictionary.
        """
        lines = raw_academic_text.strip().split('\n')
        curriculum = {}

        for line in lines:
            normalized_line = line.upper()
            found_codes = re.findall(cls.COURSE_CODE_PATTERN, normalized_line)
            if not found_codes:
                continue

            primary_course = found_codes[0].replace(" ", "")
            prereq_text = ""

            # Check for explicit prerequisite markers
            if "PREREQUISITE" in normalized_line or "PREREQ" in normalized_line:
                parts = re.split(r'PREREQUISITE[S]?:|PREREQ[S]?:', normalized_line)
                if len(parts) > 1:
                    prereq_text = parts[1]
            elif len(found_codes) > 1:
                prereq_text = " ".join(found_codes[1:])

            ast_root = cls.parse_prereq_expression(prereq_text) if prereq_text else None
            prereq_list = list(ast_root.get_course_codes()) if ast_root else []
            # Remove self-dependencies
            prereq_list = [c for c in prereq_list if c != primary_course]

            curriculum[primary_course] = {
                "course_code": primary_course,
                "prerequisites_flat": prereq_list,
                "ast_tree": ast_root.to_dict() if ast_root else None
            }

        return curriculum

    @classmethod
    def parse_csv_catalog(cls, csv_text: str) -> Dict[str, Dict[str, Any]]:
        """
        Parses structured CSV course catalogs (columns: course_code, units, prerequisites, term).
        """
        import csv
        import io

        lines = csv_text.strip().split('\n')
        reader = csv.DictReader(io.StringIO(csv_text))
        catalog = {}

        for row in reader:
            code = (row.get("course_code") or row.get("code") or "").upper().replace(" ", "")
            if not code:
                continue
            units = int(row.get("units") or row.get("unit") or 3)
            prereq_raw = row.get("prerequisites") or row.get("prereqs") or ""
            term = (row.get("term") or row.get("offered_term") or "both").lower()

            ast_root = cls.parse_prereq_expression(prereq_raw)
            prereq_list = list(ast_root.get_course_codes()) if ast_root else []
            prereq_list = [c for c in prereq_list if c != code]

            catalog[code] = {
                "course_code": code,
                "units": units,
                "offered_term": term,
                "prerequisites_flat": prereq_list,
                "ast_tree": ast_root.to_dict() if ast_root else None
            }

        return catalog

    @staticmethod
    def auto_extract_prerequisites(raw_academic_text: str) -> Dict[str, List[str]]:
        """
        Backward-compatible static method returning flat course -> prerequisites dictionary.
        """
        parsed = CurriculumASTParser.parse_handbook_text(raw_academic_text)
        return {code: info["prerequisites_flat"] for code, info in parsed.items()}


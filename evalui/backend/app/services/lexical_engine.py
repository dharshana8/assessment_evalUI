import re
from typing import List, Dict, Tuple

class LexicalEngine:
    @staticmethod
    def evaluate_keywords(
        required_keywords: List[str],
        full_student_text: str
    ) -> Tuple[float, List[str], List[str]]:
        """
        Evaluate keyword/concept coverage in student text.
        Returns:
            (coverage_score_0_to_1, present_keywords, missing_keywords)
        """
        if not required_keywords:
            return 1.0, [], []

        text_lower = full_student_text.lower()
        present = []
        missing = []

        for kw in required_keywords:
            kw_clean = kw.strip().lower()
            if not kw_clean:
                continue
            
            # Check exact substring match or word boundary match
            pattern = re.escape(kw_clean)
            if re.search(r'\b' + pattern + r'\b', text_lower) or kw_clean in text_lower:
                present.append(kw)
            else:
                missing.append(kw)

        total_req = len(required_keywords)
        score = len(present) / total_req if total_req > 0 else 1.0
        return score, present, missing

import re
import string
from typing import List, Dict, Any, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.similarity_engine import SimilarityEngine
from app.core.logging_config import logger

class DuplicateEngine:
    """
    Two-Stage Local Duplicate & Near-Duplicate Detection Engine.
    Stage 1: Lexical similarity (Text normalization, word n-grams, TF-IDF cosine similarity).
    Stage 2: Semantic similarity (MiniLM-L6-v2 vector embeddings).
    Prevents false positives on common domain terminology.
    """
    def __init__(
        self,
        exact_copy_threshold: float = 0.98,
        near_duplicate_threshold: float = 0.85,
        possible_similarity_threshold: float = 0.70,
        weight_tfidf: float = 0.20,
        weight_ngram: float = 0.10,
        weight_semantic: float = 0.70
    ):
        self.exact_copy_threshold = exact_copy_threshold
        self.near_duplicate_threshold = near_duplicate_threshold
        self.possible_similarity_threshold = possible_similarity_threshold

        self.weight_tfidf = weight_tfidf
        self.weight_ngram = weight_ngram
        self.weight_semantic = weight_semantic

        self._similarity_engine: Optional[SimilarityEngine] = None

    @property
    def similarity_engine(self) -> SimilarityEngine:
        if self._similarity_engine is None:
            self._similarity_engine = SimilarityEngine()
        return self._similarity_engine

    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Normalize text: lowercasing, punctuation stripping, and whitespace collapse.
        """
        if not text:
            return ""
        text = text.lower().strip()
        text = text.translate(str.maketrans("", "", string.punctuation))
        text = re.sub(r'\s+', ' ', text)
        return text

    def compute_ngram_jaccard(self, text1: str, text2: str, n: int = 2) -> float:
        """
        Compute word n-gram Jaccard similarity between two texts.
        """
        words1 = self.normalize_text(text1).split()
        words2 = self.normalize_text(text2).split()

        if len(words1) < n or len(words2) < n:
            # Fallback to unigram matching for short texts
            set1 = set(words1)
            set2 = set(words2)
        else:
            set1 = set(zip(*[words1[i:] for i in range(n)]))
            set2 = set(zip(*[words2[i:] for i in range(n)]))

        if not set1 or not set2:
            return 0.0

        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return intersection / union if union > 0 else 0.0

    def compute_tfidf_similarity(
        self,
        target_text: str,
        candidate_text: str,
        domain_keywords: Optional[List[str]] = None
    ) -> float:
        """
        Compute TF-IDF cosine similarity with domain keyword stop-word filtering.
        """
        norm_target = self.normalize_text(target_text)
        norm_candidate = self.normalize_text(candidate_text)

        if not norm_target or not norm_candidate:
            return 0.0

        # Build custom stop words list including domain keywords to avoid false positives
        custom_stop_words = ["the", "a", "an", "is", "are", "was", "were", "and", "or", "in", "on", "at", "to", "for", "of", "with"]
        if domain_keywords:
            for kw in domain_keywords:
                kw_norm = self.normalize_text(kw)
                if kw_norm:
                    custom_stop_words.extend(kw_norm.split())

        try:
            vectorizer = TfidfVectorizer(
                stop_words=list(set(custom_stop_words)),
                ngram_range=(1, 2)
            )
            tfidf_matrix = vectorizer.fit_transform([norm_target, norm_candidate])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(sim)
        except Exception:
            # Fallback if vocabulary is empty after stopword removal
            vectorizer = TfidfVectorizer(ngram_range=(1, 2))
            tfidf_matrix = vectorizer.fit_transform([norm_target, norm_candidate])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(sim)

    def compare_pair(
        self,
        target_text: str,
        candidate_text: str,
        domain_keywords: Optional[List[str]] = None
    ) -> Tuple[float, str]:
        """
        Compare target_text against a candidate_text using 2-stage lexical + semantic analysis.
        Returns (combined_score, duplicate_type).
        """
        norm1 = self.normalize_text(target_text)
        norm2 = self.normalize_text(candidate_text)

        if not norm1 or not norm2:
            return 0.0, "ORIGINAL"

        # Check exact string match
        if norm1 == norm2:
            return 1.0, "EXACT_COPY"

        # Stage 1: Lexical Similarity
        tfidf_score = self.compute_tfidf_similarity(target_text, candidate_text, domain_keywords)
        ngram_score = self.compute_ngram_jaccard(target_text, candidate_text, n=2)

        # Stage 2: Semantic Similarity
        sim_list = self.similarity_engine.compute_similarity(target_text, [candidate_text])
        semantic_score = sim_list[0] if sim_list else 0.0

        # Combined Weighted Score
        combined_score = (
            self.weight_tfidf * tfidf_score +
            self.weight_ngram * ngram_score +
            self.weight_semantic * semantic_score
        )
        combined_score = max(0.0, min(1.0, round(combined_score, 4)))

        # Categorize duplicate level
        if combined_score >= self.exact_copy_threshold:
            dup_type = "EXACT_COPY"
        elif combined_score >= self.near_duplicate_threshold:
            dup_type = "NEAR_DUPLICATE"
        elif combined_score >= self.possible_similarity_threshold:
            dup_type = "POSSIBLE_SIMILARITY"
        else:
            dup_type = "ORIGINAL"

        return combined_score, dup_type

    def check_duplicate(
        self,
        target_text: str,
        candidate_submissions: List[Dict[str, Any]],
        domain_keywords: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Check target_text against a list of existing submissions: [{"id": "S123", "content": "..."}, ...]
        Returns structured dictionary.
        """
        if not target_text or not candidate_submissions:
            return {
                "duplicate_flag": False,
                "duplicate_type": "ORIGINAL",
                "duplicate_score": 0.0,
                "matched_submission_id": None
            }

        best_score = 0.0
        best_type = "ORIGINAL"
        matched_id = None

        for sub in candidate_submissions:
            sub_id = str(sub.get("id", ""))
            sub_content = str(sub.get("content", ""))

            if not sub_content.strip():
                continue

            score, dup_type = self.compare_pair(target_text, sub_content, domain_keywords)

            if score > best_score:
                best_score = score
                best_type = dup_type
                matched_id = sub_id

        duplicate_flag = best_type in ("EXACT_COPY", "NEAR_DUPLICATE", "POSSIBLE_SIMILARITY")

        return {
            "duplicate_flag": duplicate_flag,
            "duplicate_type": best_type,
            "duplicate_score": round(best_score, 2),
            "matched_submission_id": matched_id
        }

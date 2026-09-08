import re
from typing import List, Dict, Any, Optional, Tuple
from app.core.config import settings
from app.core.logging_config import logger
from app.core.model_manager import model_manager
from app.services.text_processor import TextProcessor
from app.services.similarity_engine import SimilarityEngine
from app.services.nli_engine import NLIEngine
from app.services.lexical_engine import LexicalEngine

class ReliabilityEngine:
    """
    PS2 Reliability Gate Service.
    Assesses whether a question + reference answer + rubric are internally reliable
    enough to be used for evaluation without hallucination risk or internal contradictions.
    Works entirely locally using pre-loaded model manager components.
    """
    def __init__(
        self,
        contradiction_threshold: float = 0.60,
        question_alignment_threshold: float = 0.35,
        rubric_alignment_threshold: float = 0.40,
        high_reliability_threshold: float = 0.80,
        low_reliability_threshold: float = 0.50
    ):
        self.contradiction_threshold = contradiction_threshold
        self.question_alignment_threshold = question_alignment_threshold
        self.rubric_alignment_threshold = rubric_alignment_threshold
        self.high_reliability_threshold = high_reliability_threshold
        self.low_reliability_threshold = low_reliability_threshold

        self._similarity_engine: Optional[SimilarityEngine] = None
        self._nli_engine: Optional[NLIEngine] = None

    @property
    def similarity_engine(self) -> SimilarityEngine:
        if self._similarity_engine is None:
            self._similarity_engine = SimilarityEngine()
        return self._similarity_engine

    @property
    def nli_engine(self) -> NLIEngine:
        if self._nli_engine is None:
            self._nli_engine = NLIEngine()
        return self._nli_engine

    def extract_claims(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract important factual claims, noun phrases, and named entities from text using spaCy.
        """
        if not text or not text.strip():
            return []

        nlp = model_manager.get_spacy()
        doc = nlp(text)
        claims = []

        # Sentence-level claim extraction
        for sent_idx, sent in enumerate(doc.sents):
            sent_text = sent.text.strip()
            if not sent_text:
                continue

            entities = [
                {"text": ent.text, "label": ent.label_}
                for ent in sent.ents
            ]
            noun_chunks = [chunk.text for chunk in sent.noun_chunks if len(chunk.text.split()) > 1]
            numbers = [token.text for token in sent if token.like_num or token.pos_ == "NUM"]

            claims.append({
                "claim_id": sent_idx,
                "text": sent_text,
                "entities": entities,
                "noun_chunks": noun_chunks,
                "numbers": numbers
            })

        return claims

    def check_question_reference_alignment(
        self,
        question: str,
        reference_answer: str
    ) -> float:
        """
        Check semantic similarity between question and reference answer using MiniLM embeddings.
        """
        if not question or not question.strip() or not reference_answer or not reference_answer.strip():
            return 1.0  # Default if question is not provided

        sims = self.similarity_engine.compute_similarity(question, [reference_answer])
        return sims[0] if sims else 0.0

    def check_rubric_reference_alignment(
        self,
        reference_answer: str,
        rubric_criteria: List[Dict[str, Any]]
    ) -> Tuple[float, List[str]]:
        """
        Check whether rubric criteria concepts are represented in the reference answer.
        """
        if not rubric_criteria:
            return 1.0, []

        if not reference_answer or not reference_answer.strip():
            return 0.0, ["Reference answer is empty."]

        sentences = TextProcessor.segment_sentences(reference_answer)
        sentence_texts = [s["text"] for s in sentences]
        if not sentence_texts:
            return 0.0, ["Reference answer contains no valid sentences."]

        supported_count = 0
        issues = []

        for crit in rubric_criteria:
            crit_desc = str(crit.get("description", ""))
            crit_kws = crit.get("keywords", [])
            if isinstance(crit_kws, str):
                crit_kws = [k.strip() for k in crit_kws.split(",") if k.strip()]

            # Semantic check against reference sentences
            sim_scores = self.similarity_engine.compute_similarity(crit_desc, sentence_texts)
            max_sim = max(sim_scores) if sim_scores else 0.0

            # Lexical keyword check
            lex_score, _, _ = LexicalEngine.evaluate_keywords(crit_kws, reference_answer) if crit_kws else (1.0, [], [])

            combined_support = 0.7 * max_sim + 0.3 * lex_score

            if combined_support >= self.rubric_alignment_threshold:
                supported_count += 1
            else:
                issues.append(f"Rubric criterion '{crit_desc}' is missing or weakly represented in the reference answer.")

        alignment_score = supported_count / len(rubric_criteria)
        return alignment_score, issues

    def check_internal_contradictions(self, reference_answer: str) -> Tuple[int, List[str]]:
        """
        Use local NLI model to detect internal contradiction pairs within the reference answer.
        """
        if not reference_answer or not reference_answer.strip():
            return 0, []

        sentences = TextProcessor.segment_sentences(reference_answer)
        sentence_texts = [s["text"] for s in sentences]

        if len(sentence_texts) < 2:
            return 0, []

        contradiction_count = 0
        issues = []
        neg_words = ("not", "never", "no", "without", "cannot", "n't", "neither", "nor", "false", "incorrect", "untrue")

        # Check sentence pairs
        for i in range(len(sentence_texts)):
            for j in range(i + 1, len(sentence_texts)):
                s1 = sentence_texts[i]
                s2 = sentence_texts[j]

                nli_res = self.nli_engine.evaluate_pair(premise=s1, hypothesis=s2)
                contra_prob = nli_res.get("contradiction", 0.0)
                has_negation = any(w in s1.lower() or w in s2.lower() for w in neg_words)

                if contra_prob >= 0.85 and has_negation:
                    contradiction_count += 1
                    issues.append(
                        f"Internal contradiction detected between reference sentences: "
                        f"'{s1}' and '{s2}' (probability: {contra_prob:.2f})."
                    )

        return contradiction_count, issues

    def check_numeric_entity_consistency(self, reference_answer: str) -> Tuple[int, List[str]]:
        """
        Detect conflicting numbers, percentages, dates, or units within the reference answer.
        """
        if not reference_answer or not reference_answer.strip():
            return 0, []

        nlp = model_manager.get_spacy()
        doc = nlp(reference_answer)
        issues = []
        conflicts_count = 0

        # Extract numeric facts attached to root entities/nouns
        numeric_facts: Dict[str, List[Tuple[str, str]]] = {}

        for sent in doc.sents:
            nums = [tok for tok in sent if tok.like_num or tok.pos_ == "NUM"]
            nouns = [tok.lemma_.lower() for tok in sent if tok.pos_ in ("NOUN", "PROPN")]

            for noun in nouns:
                if noun not in numeric_facts:
                    numeric_facts[noun] = []
                for num in nums:
                    numeric_facts[noun].append((num.text, sent.text.strip()))

        # Check for conflicting numbers for the exact same entity noun
        for noun, num_list in numeric_facts.items():
            distinct_nums = set(val for val, _ in num_list)
            if len(distinct_nums) > 1 and len(noun) > 2:
                # Filter common words
                if noun in ("step", "handshake", "packet", "protocol", "port", "layer", "version", "percent", "score", "mark"):
                    conflicts_count += 1
                    vals_str = ", ".join(distinct_nums)
                    issues.append(f"Conflicting numerical values ({vals_str}) detected for concept '{noun}'.")

        # Explicit regex check for direct negation with conflicting numbers (e.g. 80 vs 443, 3 vs 5)
        num_patterns = re.findall(r'\b(\d+(?:\.\d+)?)\b', reference_answer)
        if len(num_patterns) >= 2 and len(set(num_patterns)) > 1:
            # Check if negative/contradictory words exist around numbers
            neg_words = ("not", "never", "unlike", "instead of", "rather than", "differ", "conflict")
            if any(w in reference_answer.lower() for w in neg_words):
                # Verify if this represents conflicting numeric specifications
                for sent in doc.sents:
                    stext = sent.text.lower()
                    if any(w in stext for w in neg_words) and len(re.findall(r'\b\d+\b', stext)) >= 1:
                        conflicts_count += 1
                        issues.append(f"Conflicting numeric/entity statement detected: '{sent.text.strip()}'.")
                        break

        return conflicts_count, issues

    def evaluate_reliability(
        self,
        reference_answer: str,
        question: Optional[str] = None,
        rubric_criteria: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate full internal reliability of reference answer + question + rubric.
        Returns a structured response dictionary.
        """
        rubric_criteria = rubric_criteria or []
        issues: List[str] = []

        # 1. Claim Extraction
        claims = self.extract_claims(reference_answer)
        claims_checked = len(claims)

        # 2. Question-Reference Alignment
        q_align_score = self.check_question_reference_alignment(question or "", reference_answer)
        if question and question.strip() and q_align_score < self.question_alignment_threshold:
            issues.append(
                f"Low semantic alignment between question and reference answer (score: {q_align_score:.2f})."
            )

        # 3. Rubric-Reference Alignment
        rubric_align_score, rubric_issues = self.check_rubric_reference_alignment(
            reference_answer, rubric_criteria
        )
        issues.extend(rubric_issues)

        # 4. Internal Contradiction Check
        contradictions_found, contra_issues = self.check_internal_contradictions(reference_answer)
        issues.extend(contra_issues)

        # 5. Numeric / Entity Consistency
        numeric_conflicts, numeric_issues = self.check_numeric_entity_consistency(reference_answer)
        issues.extend(numeric_issues)

        # 6. Overall Reliability Score Calculation
        overall_alignment = 0.5 * q_align_score + 0.5 * rubric_align_score
        
        # Penalties
        contra_penalty = 0.40 * min(contradictions_found, 2)
        numeric_penalty = 0.20 * min(numeric_conflicts, 2)
        align_penalty = 0.30 * max(0.0, (0.60 - overall_alignment))

        raw_score = overall_alignment - (contra_penalty + numeric_penalty + align_penalty)
        reliability_score = max(0.0, min(1.0, round(raw_score, 2)))

        # Status Determination
        if contradictions_found > 0 or numeric_conflicts > 0 or reliability_score < self.low_reliability_threshold:
            status = "UNRELIABLE" if (contradictions_found > 0 or reliability_score < 0.40) else "REVIEW_REQUIRED"
        elif reliability_score >= self.high_reliability_threshold and not issues:
            status = "RELIABLE"
        else:
            status = "REVIEW_REQUIRED"

        return {
            "reliability_score": reliability_score,
            "status": status,
            "issues": issues,
            "claims_checked": claims_checked,
            "contradictions_found": contradictions_found,
            "alignment_score": round(overall_alignment, 2)
        }

import torch
from typing import List, Tuple, Optional
from sentence_transformers import SentenceTransformer
from app.core.model_manager import model_manager

class SimilarityEngine:
    def __init__(self):
        self.model: SentenceTransformer = model_manager.get_semantic_model()

    def encode_sentences(self, sentences: List[str]) -> Optional[torch.Tensor]:
        """Precompute sentence embeddings under no_grad to reuse across multiple criteria."""
        if not sentences:
            return None
        with torch.no_grad():
            embs = self.model.encode(sentences, convert_to_tensor=True)
            if embs.ndim == 1:
                embs = embs.unsqueeze(0)
            return embs

    def compute_similarity_with_embs(self, criterion_desc: str, sentence_embs: torch.Tensor) -> List[float]:
        """Compute cosine similarity using precomputed sentence embeddings."""
        if sentence_embs is None or len(sentence_embs) == 0 or not criterion_desc:
            return []

        with torch.no_grad():
            criterion_emb = self.model.encode(criterion_desc, convert_to_tensor=True)
            similarities = torch.nn.functional.cosine_similarity(criterion_emb.unsqueeze(0), sentence_embs, dim=1)
            clamped_sims = torch.clamp(similarities, min=0.0, max=1.0)
            return [float(s) for s in clamped_sims.cpu().numpy()]

    def compute_similarity(self, criterion_desc: str, sentences: List[str]) -> List[float]:
        """
        Compute cosine similarity between a criterion description and candidate student sentences.
        Returns array of float scores between 0.0 and 1.0 for each sentence.
        """
        if not sentences or not criterion_desc:
            return []

        sentence_embs = self.encode_sentences(sentences)
        return self.compute_similarity_with_embs(criterion_desc, sentence_embs)


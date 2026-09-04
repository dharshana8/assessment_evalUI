import torch
from typing import List, Tuple
from sentence_transformers import SentenceTransformer
from app.core.model_manager import model_manager

class SimilarityEngine:
    def __init__(self):
        self.model: SentenceTransformer = model_manager.get_semantic_model()

    def compute_similarity(self, criterion_desc: str, sentences: List[str]) -> List[float]:
        """
        Compute cosine similarity between a criterion description and candidate student sentences.
        Returns array of float scores between 0.0 and 1.0 for each sentence.
        """
        if not sentences or not criterion_desc:
            return []

        # Encode criterion & sentences
        criterion_emb = self.model.encode(criterion_desc, convert_to_tensor=True)
        sentence_embs = self.model.encode(sentences, convert_to_tensor=True)

        if sentence_embs.ndim == 1:
            sentence_embs = sentence_embs.unsqueeze(0)

        # Compute cosine similarity
        similarities = torch.nn.functional.cosine_similarity(criterion_emb.unsqueeze(0), sentence_embs, dim=1)
        
        # Clamp to [0, 1] range safely
        clamped_sims = torch.clamp(similarities, min=0.0, max=1.0)
        return [float(s) for s in clamped_sims.cpu().numpy()]

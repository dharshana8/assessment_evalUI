import torch
from typing import List, Dict, Any
from app.core.model_manager import model_manager

class NLIEngine:
    def __init__(self):
        self.tokenizer, self.model, self.label_map = model_manager.get_nli()

    def evaluate_pair(self, premise: str, hypothesis: str) -> Dict[str, float]:
        """
        Evaluate NLI for premise (student sentence) and hypothesis (rubric criterion).
        Returns dictionary with probabilities for entailment, contradiction, and neutral.
        """
        if not premise or not hypothesis:
            return {"entailment": 0.0, "contradiction": 0.0, "neutral": 1.0}

        features = self.tokenizer(
            premise,
            hypothesis,
            padding=True,
            truncation=True,
            max_length=256,
            return_tensors="pt"
        )

        with torch.no_grad():
            logits = self.model(**features).logits
            probs = torch.softmax(logits, dim=-1)[0]

        contra_idx = self.label_map.get("contradiction", 0)
        entail_idx = self.label_map.get("entailment", 1)
        neutral_idx = self.label_map.get("neutral", 2)

        contra_prob = float(probs[contra_idx].item())
        entail_prob = float(probs[entail_idx].item())
        neutral_prob = float(probs[neutral_idx].item())

        return {
            "entailment": entail_prob,
            "contradiction": contra_prob,
            "neutral": neutral_prob
        }

    def evaluate_sentences(self, hypothesis: str, premises: List[str]) -> List[Dict[str, float]]:
        """Batch evaluate hypothesis against multiple premise sentences in a single tensor forward pass."""
        if not premises or not hypothesis:
            return [{"entailment": 0.0, "contradiction": 0.0, "neutral": 1.0} for _ in premises]

        hypotheses = [hypothesis] * len(premises)
        features = self.tokenizer(
            premises,
            hypotheses,
            padding=True,
            truncation=True,
            max_length=256,
            return_tensors="pt"
        )

        with torch.no_grad():
            logits = self.model(**features).logits
            probs_batch = torch.softmax(logits, dim=-1)

        contra_idx = self.label_map.get("contradiction", 0)
        entail_idx = self.label_map.get("entailment", 1)
        neutral_idx = self.label_map.get("neutral", 2)

        results = []
        for i in range(len(premises)):
            probs = probs_batch[i]
            results.append({
                "entailment": float(probs[entail_idx].item()),
                "contradiction": float(probs[contra_idx].item()),
                "neutral": float(probs[neutral_idx].item())
            })

        return results


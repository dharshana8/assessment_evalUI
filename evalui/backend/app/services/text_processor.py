import re
from typing import List, Dict
from app.core.model_manager import model_manager

class TextProcessor:
    @staticmethod
    def segment_sentences(text: str) -> List[Dict[str, any]]:
        """
        Segment input text into structured sentence objects with unique sentence IDs.
        Uses spaCy for robust linguistic sentence boundary detection.
        """
        if not text or not text.strip():
            return []

        nlp = model_manager.get_spacy()
        doc = nlp(text)
        
        sentences = []
        sentence_id = 0
        for sent in doc.sents:
            sent_text = sent.text.strip()
            if sent_text:
                sentences.append({
                    "sentence_id": sentence_id,
                    "text": sent_text,
                    "tokens": [token.text.lower() for token in sent if not token.is_punct]
                })
                sentence_id += 1
                
        # Fallback regex segmentation if spaCy yields single giant text without sents
        if not sentences and text.strip():
            raw_sents = re.split(r'(?<=[.!?]) +', text.strip())
            for idx, s in enumerate(raw_sents):
                if s.strip():
                    sentences.append({
                        "sentence_id": idx,
                        "text": s.strip(),
                        "tokens": s.lower().split()
                    })
                    
        return sentences

    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        """Extract key non-stopword tokens/lemmas from text."""
        nlp = model_manager.get_spacy()
        doc = nlp(text.lower())
        keywords = []
        for token in doc:
            if not token.is_stop and not token.is_punct and len(token.text) > 1:
                keywords.append(token.lemma_)
        return list(set(keywords))

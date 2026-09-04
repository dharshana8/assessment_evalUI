import pytest
from app.services.text_processor import TextProcessor

def test_sentence_segmentation():
    text = "TCP is connection-oriented. Client sends SYN. Server responds SYN-ACK!"
    sents = TextProcessor.segment_sentences(text)
    assert len(sents) == 3
    assert sents[0]["sentence_id"] == 0
    assert "connection-oriented" in sents[0]["text"]
    assert sents[1]["sentence_id"] == 1
    assert "SYN" in sents[1]["text"]

def test_empty_text():
    sents = TextProcessor.segment_sentences("")
    assert sents == []

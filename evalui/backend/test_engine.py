import json
import time
from app.services.evaluation_engine import EvaluationEngine

def run_tests():
    print("=" * 60)
    print("      EVALUI CORE EVALUATION ENGINE VERIFICATION")
    print("=" * 60)

    rubric = [
        {
            "id": "C1",
            "description": "TCP is a connection-oriented protocol.",
            "max_marks": 1.0,
            "keywords": ["connection-oriented"]
        },
        {
            "id": "C2",
            "description": "Client sends SYN to initiate communication.",
            "max_marks": 1.0,
            "keywords": ["SYN"]
        },
        {
            "id": "C3",
            "description": "Server responds with SYN-ACK.",
            "max_marks": 1.0,
            "keywords": ["SYN-ACK"]
        },
        {
            "id": "C4",
            "description": "Client sends ACK to complete the handshake.",
            "max_marks": 1.0,
            "keywords": ["ACK"]
        }
    ]

    test_cases = {
        "Case A — Correct": (
            "TCP is a connection-oriented protocol. The client sends a SYN packet. "
            "The server responds with SYN-ACK. Finally, the client sends ACK to complete the connection."
        ),
        "Case B — Contradiction": (
            "TCP is not a connection-oriented protocol and it does not use a three-way handshake."
        ),
        "Case C — Partial": (
            "TCP is connection-oriented. The client sends SYN and receives SYN-ACK."
        ),
        "Case D — Paraphrased": (
            "TCP establishes communication by performing a handshake between the client and server before data exchange."
        ),
        "Case E — Off Topic": (
            "Cricket is played between two teams. Players score runs by hitting the ball."
        ),
        "Case F — Keyword Stuffing": (
            "TCP SYN SYN-ACK ACK HTTP UDP IP TCP SYN ACK connection-oriented."
        )
    }

    engine = EvaluationEngine()

    for name, student_answer in test_cases.items():
        print(f"\n--- Testing {name} ---")
        print(f"Input Answer: \"{student_answer}\"")
        
        result = engine.evaluate_submission(student_answer, rubric)
        
        print(f"Total Score: {result['total_score']} / {result['max_score']} ({result['percentage']}%)")
        print(f"Processing Time: {result['processing_time']}s")
        print(f"Summary: {result['diagnostic_summary']}")
        
        for c in result['criteria']:
            status_symbol = "✓" if c['status'] == "ENTAILED" else ("⚠" if c['status'] == "PARTIAL" else "✗")
            ev_str = f" [Sentence {c['evidence']['sentence_id']}: '{c['evidence']['text']}']" if c['evidence'] else ""
            print(f"  {status_symbol} {c['criterion_id']} ({c['description']}): {c['awarded_marks']}/{c['max_marks']} | Status: {c['status']} | ContraProb: {c['contradiction_probability']} | Stuffing: {c['keyword_stuffing_detected']}{ev_str}")

if __name__ == "__main__":
    run_tests()

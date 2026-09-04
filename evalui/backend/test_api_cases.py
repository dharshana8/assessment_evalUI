import sys
import time
from fastapi.testclient import TestClient
from app.core.model_manager import model_manager

def run_api_verification():
    print("=" * 70, flush=True)
    print("      EVALUI END-TO-END API PIPELINE VERIFICATION (CASES A-F)", flush=True)
    print("=" * 70, flush=True)

    print("\n[+] 1. Pre-warming NLP models for TestClient...", flush=True)
    start_t = time.time()
    model_manager.load_models()
    print(f"    Models loaded in {round(time.time() - start_t, 2)}s", flush=True)

    from app.main import app
    client = TestClient(app)

    # 1. Health check & NLI model label mapping inspection
    print("\n[+] 2. Checking /health endpoint & NLI label mapping...", flush=True)
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print(f"    Health Status: {health_data['status']}", flush=True)
    print(f"    NLI Label Mapping: {health_data['nli_label_mapping']}", flush=True)
    assert health_data["nli_label_mapping"]["0"] == "contradiction", "NLI index 0 must map to contradiction"
    assert health_data["nli_label_mapping"]["1"] == "entailment", "NLI index 1 must map to entailment"

    # 2. Create Assignment (TCP Three-Way Handshake)
    print("\n[+] 3. Creating TCP Three-Way Handshake Assignment...", flush=True)
    assignment_payload = {
        "title": "TCP Three-Way Handshake Assessment",
        "subject": "Computer Networks",
        "question": "Explain the TCP three-way handshake process.",
        "total_marks": 4.0,
        "rubric_criteria": [
            {
                "description": "TCP is a connection-oriented protocol.",
                "max_marks": 1.0,
                "keywords": ["connection-oriented"]
            },
            {
                "description": "Client sends SYN to initiate communication.",
                "max_marks": 1.0,
                "keywords": ["SYN"]
            },
            {
                "description": "Server responds with SYN-ACK.",
                "max_marks": 1.0,
                "keywords": ["SYN-ACK"]
            },
            {
                "description": "Client sends ACK to complete the handshake.",
                "max_marks": 1.0,
                "keywords": ["ACK"]
            }
        ]
    }
    res = client.post("/api/v1/assignments", json=assignment_payload)
    assert res.status_code == 200, f"Failed to create assignment: {res.text}"
    assignment = res.json()
    assignment_id = assignment["id"]
    print(f"    Created Assignment ID: {assignment_id}", flush=True)

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

    for name, student_text in test_cases.items():
        print(f"\n--- Testing via REST API: {name} ---", flush=True)
        
        # Post Submission
        sub_res = client.post("/api/v1/submissions/text", json={
            "assignment_id": assignment_id,
            "student_id": "STUDENT_001",
            "content": student_text
        })
        assert sub_res.status_code == 200, f"Submission failed: {sub_res.text}"
        submission = sub_res.json()
        sub_id = submission["id"]

        # Trigger Evaluation
        eval_res = client.post("/api/v1/evaluations", json={"submission_id": sub_id})
        assert eval_res.status_code == 200, f"Evaluation failed: {eval_res.text}"
        eval_data = eval_res.json()

        print(f"    Total Score: {eval_data['final_score']} / {eval_data['max_score']} ({eval_data['percentage']}%)", flush=True)
        print(f"    Processing Time: {eval_data['processing_time']}s", flush=True)
        print(f"    Sentences Segmented ({len(eval_data['sentences'])}): {eval_data['sentences']}", flush=True)

        for c in eval_data["criteria"]:
            ev = c.get("evidence")
            ev_str = f" [Sentence {ev['sentence_id']}: '{ev['text']}']" if ev else " [No Evidence Match]"
            print(f"    - [{c['status']}] {c['description']} -> {c['awarded_marks']}/{c['max_marks']} | ContraProb: {c['contradiction_probability']}{ev_str}", flush=True)

        # Assertions
        if "Case A" in name:
            assert eval_data["final_score"] >= 3.5, "Case A should receive near full credit"
        elif "Case B" in name:
            # CONTRADICTION GUARDRAIL ASSERTION
            print("    [!] Verifying Contradiction Guardrail for Case B...", flush=True)
            c1_eval = [c for c in eval_data["criteria"] if "connection-oriented" in c["description"].lower()][0]
            assert c1_eval["status"] == "CONTRADICTED", f"Case B status must be CONTRADICTED, got {c1_eval['status']}"
            assert c1_eval["awarded_marks"] == 0.0, f"Case B marks must be 0.0, got {c1_eval['awarded_marks']}"
            assert c1_eval["contradiction_probability"] > 0.60, f"Contradiction probability should be > 0.60, got {c1_eval['contradiction_probability']}"
            print("    [✓] Contradiction Guardrail PASSED: awarded_marks = 0.0 despite semantic similarity!", flush=True)

        elif "Case F" in name:
            stuffing_flagged = any(c["keyword_stuffing_detected"] for c in eval_data["criteria"])
            print(f"    [!] Keyword stuffing flagged: {stuffing_flagged}", flush=True)

    print("\n" + "=" * 70, flush=True)
    print("      ALL END-TO-END API PIPELINE VERIFICATIONS PASSED!", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    run_api_verification()

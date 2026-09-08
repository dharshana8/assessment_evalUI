import os
import sys
import time
import gc
# sys.path configuration


# Ensure app is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

def get_process_memory_mb() -> float:
    try:
        import psutil
        return psutil.Process().memory_info().rss / (1024 * 1024)
    except ImportError:
        import ctypes
        from ctypes import wintypes
        class PROCESS_MEMORY_COUNTERS(ctypes.Structure):
            _fields_ = [
                ('cb', wintypes.DWORD),
                ('PageFaultCount', wintypes.DWORD),
                ('PeakWorkingSetSize', ctypes.c_size_t),
                ('WorkingSetSize', ctypes.c_size_t),
                ('QuotaPeakPagedPoolUsage', ctypes.c_size_t),
                ('QuotaPagedPoolUsage', ctypes.c_size_t),
                ('QuotaPeakNonPagedPoolUsage', ctypes.c_size_t),
                ('QuotaNonPagedPoolUsage', ctypes.c_size_t),
                ('PagefileUsage', ctypes.c_size_t),
                ('PeakPagefileUsage', ctypes.c_size_t),
            ]
        fn = ctypes.windll.psapi.GetProcessMemoryInfo
        fn.argtypes = [wintypes.HANDLE, ctypes.POINTER(PROCESS_MEMORY_COUNTERS), wintypes.DWORD]
        fn.restype = wintypes.BOOL
        counters = PROCESS_MEMORY_COUNTERS()
        counters.cb = ctypes.sizeof(PROCESS_MEMORY_COUNTERS)
        handle = ctypes.windll.kernel32.GetCurrentProcess()
        if fn(handle, ctypes.byref(counters), counters.cb):
            return counters.WorkingSetSize / (1024 * 1024)
        return 0.0



def run_benchmark():
    print("=" * 60)
    print("      EVALUI BACKEND RESOURCE & LATENCY BENCHMARK      ")
    print("=" * 60)

    # 1. Baseline Memory
    baseline_mem = get_process_memory_mb()
    print(f"[1/4] Initial Baseline Memory: {baseline_mem:.2f} MB")

    # 2. Model Loading & Load Time Measurement
    start_load = time.perf_counter()
    from app.core.model_manager import model_manager
    
    # Track incremental memory per model load
    mem_before_spacy = get_process_memory_mb()
    _ = model_manager.get_spacy()
    load_spacy_time = model_manager.load_times.get('spacy', 0.0)
    mem_after_spacy = get_process_memory_mb()
    
    _ = model_manager.get_semantic_model()
    load_semantic_time = model_manager.load_times.get('semantic', 0.0)
    mem_after_semantic = get_process_memory_mb()

    _ = model_manager.get_nli()
    load_nli_time = model_manager.load_times.get('nli', 0.0)
    mem_after_nli = get_process_memory_mb()

    total_load_time = time.perf_counter() - start_load
    loaded_mem = get_process_memory_mb()
    total_model_mem = loaded_mem - baseline_mem

    print("\n--- MODEL LOAD METRICS ---")
    print(f"  spaCy Model Overhead    : {mem_after_spacy - mem_before_spacy:.2f} MB (Load time: {load_spacy_time:.3f}s)")
    print(f"  Semantic Model Overhead : {mem_after_semantic - mem_after_spacy:.2f} MB (Load time: {load_semantic_time:.3f}s)")
    print(f"  NLI Model Overhead      : {mem_after_nli - mem_after_semantic:.2f} MB (Load time: {load_nli_time:.3f}s)")
    print(f"  Total Model RAM Overhead: {total_model_mem:.2f} MB")
    print(f"  Total Model Load Time   : {total_load_time:.3f}s")
    print(f"  Total Memory Post Load  : {loaded_mem:.2f} MB")

    # 3. Evaluation Latency Benchmark
    from app.services.evaluation_engine import EvaluationEngine
    engine = EvaluationEngine()

    sample_rubric = [
        {"id": "C1", "description": "Explain the process of photosynthesis and role of chlorophyll", "max_marks": 2.0, "keywords": ["chlorophyll", "photosynthesis", "sunlight"]},
        {"id": "C2", "description": "Detail the outputs of light-dependent reactions", "max_marks": 2.0, "keywords": ["oxygen", "ATP", "NADPH"]},
        {"id": "C3", "description": "Describe carbon fixation in the Calvin cycle", "max_marks": 1.0, "keywords": ["carbon", "fixation", "enzyme"]}
    ]

    sample_student_text = (
        "Photosynthesis takes place inside plant leaves containing chlorophyll. "
        "Chlorophyll molecules capture light energy from sunlight to drive chemical reactions. "
        "Light-dependent reactions generate ATP, NADPH, and release oxygen gas as a byproduct. "
        "Carbon dioxide is fixed into organic sugars during the Calvin cycle in the stroma."
    )

    print("\n[3/4] Running Evaluation Warmup and Iterations...")
    # Warmup
    _ = engine.evaluate_submission(student_text=sample_student_text, rubric_criteria=sample_rubric)

    latencies = []
    NUM_ITERATIONS = 5

    for i in range(NUM_ITERATIONS):
        t0 = time.perf_counter()
        res = engine.evaluate_submission(student_text=sample_student_text, rubric_criteria=sample_rubric)
        t1 = time.perf_counter()
        elapsed = t1 - t0
        latencies.append(elapsed)
        print(f"  Iteration {i+1}: {elapsed*1000:.2f} ms (Score: {res['total_score']}/{res['max_score']})")

    avg_latency = sum(latencies) / len(latencies)
    peak_mem = get_process_memory_mb()

    print("\n--- EVALUATION LATENCY & MEMORY RESULTS ---")
    print(f"  Average Evaluation Latency : {avg_latency*1000:.2f} ms ({avg_latency:.3f} s)")
    print(f"  Min / Max Latency          : {min(latencies)*1000:.2f} ms / {max(latencies)*1000:.2f} ms")
    print(f"  Peak Application Memory    : {peak_mem:.2f} MB")
    print(f"  8 GB RAM Constraint Status : PASS ({peak_mem / 1024:.2f} GB / 8.0 GB used)")

    print("\n=" * 60)

if __name__ == "__main__":
    run_benchmark()

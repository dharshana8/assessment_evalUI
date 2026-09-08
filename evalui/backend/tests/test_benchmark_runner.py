"""
Unit tests for EvalUI Reproducible Evaluation Benchmark Runner
===============================================================
Verifies that BenchmarkRunner executes cleanly on dataset, calculates metrics,
and generates JSON, CSV, and Markdown report outputs.
"""

import os
import json
import pytest
from run_benchmark import BenchmarkRunner


def test_benchmark_runner_execution(tmp_path):
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "benchmark_dataset.json")
    output_dir = str(tmp_path / "benchmark_results")

    runner = BenchmarkRunner(dataset_path=dataset_path, output_dir=output_dir)
    results = runner.run()

    # Check top-level payload structure
    assert "summary_metrics" in results
    assert "error_analysis_summary" in results
    assert "sample_details" in results

    metrics = results["summary_metrics"]
    assert "exact_score_agreement_rate" in metrics
    assert "mean_absolute_error_mae" in metrics
    assert "pearson_correlation_r" in metrics
    assert "partial_credit_agreement_rate" in metrics
    assert "contradiction_detection" in metrics
    assert "duplicate_detection" in metrics
    assert "confidence_vs_correctness_correlation" in metrics
    assert "reliability_gate_accuracy" in metrics

    # Check file generation
    assert os.path.exists(os.path.join(output_dir, "benchmark_results.json"))
    assert os.path.exists(os.path.join(output_dir, "benchmark_results.csv"))
    assert os.path.exists(os.path.join(output_dir, "benchmark_report.md"))

    # Verify JSON content readable
    with open(os.path.join(output_dir, "benchmark_results.json"), "r", encoding="utf-8") as f:
        json_data = json.load(f)
        assert json_data["summary_metrics"]["total_samples"] == len(results["sample_details"])

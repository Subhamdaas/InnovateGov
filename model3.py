# ==========================================================
# MODEL 3: AI PILOT RESULT RECOMMENDATION ENGINE
# ==========================================================

def evaluate_pilot_results(kpis: dict) -> dict:
    leakage_target = kpis["target_leakage_reduction"]
    leakage_actual = kpis["actual_leakage_reduction"]

    cost_target = kpis["target_cost_reduction"]
    cost_actual = kpis["actual_cost_reduction"]

    leakage_attainment = (leakage_actual / leakage_target) * 100
    cost_attainment = (cost_actual / cost_target) * 100
    avg_attainment = (leakage_attainment + cost_attainment) / 2

    if leakage_actual >= leakage_target and cost_actual >= cost_target:
        verdict = "PILOT SUCCESS"
        recommendation = "SCALE"
        confidence = min(95, round(70 + (avg_attainment - 100) * 0.7))
        reason = "Solution exceeded both primary KPIs and demonstrated deployment feasibility."

    elif leakage_actual >= leakage_target and cost_actual < cost_target:
        verdict = "PILOT PARTIAL SUCCESS"
        recommendation = "EXTEND PILOT"
        confidence = 74
        reason = "Target leakage reduction achieved, but operational cost targets require an extended trial."

    else:
        verdict = "PILOT UNSUCCESSFUL"
        recommendation = "REJECT"
        confidence = 88
        reason = "Core performance metrics failed to meet minimum municipal thresholds."

    print("\n" + "=" * 55)
    print("      PILOT RESULT EVALUATION (MODEL 3)")
    print("=" * 55)
    print("\nInput:")
    print(f"Target leakage reduction : {leakage_target}%")
    print(f"Actual reduction         : {leakage_actual}%")
    print(f"Target cost reduction    : {cost_target}%")
    print(f"Actual reduction         : {cost_actual}%")

    print("\nAI Verdict:")
    print(f"{verdict}")
    print(f"Recommendation: ✓ {recommendation}")
    print(f"Confidence    : {confidence}%")
    print(f"Reason        : {reason}")
    print("=" * 55 + "\n")

    return {
        "verdict": verdict,
        "recommendation": recommendation,
        "confidence": confidence,
        "reason": reason,
        "metrics": {
            "leakage_attainment_pct": round(leakage_attainment, 1),
            "cost_attainment_pct": round(cost_attainment, 1),
        },
    }


if __name__ == "__main__":
    pilot_metrics = {
        "target_leakage_reduction": 20,
        "actual_leakage_reduction": 27,
        "target_cost_reduction": 15,
        "actual_cost_reduction": 18,
    }
    evaluate_pilot_results(pilot_metrics)

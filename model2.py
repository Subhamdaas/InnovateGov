# =====================================================================
# MODEL 2: HYBRID EXPERT RUBRIC & OBJECTIVE READINESS AUDIT ENGINE
# =====================================================================

import json
from typing import Any, Dict, List, Tuple

# ---------------------------------------------------------------------
# 1. APPROACH 1: SUBJECTIVE EXPERT RUBRIC ENGINE (LEGACY BASELINE)
# ---------------------------------------------------------------------

def calculate_overall_score(scores: Dict[str, float]) -> float:
    return round(sum(scores.values()) / max(len(scores), 1), 2)


def evaluate_approach_1(rubric_scores: Dict[str, float]) -> Dict[str, Any]:
    """Calculates purely subjective average across evaluator criteria."""
    overall = calculate_overall_score(rubric_scores)
    tech = rubric_scores.get("Technical Feasibility", rubric_scores.get("technical_feasibility", 0.0))
    scalability = rubric_scores.get("Scalability", rubric_scores.get("scalability", 0.0))

    if overall >= 8.0 and tech >= 7.0 and scalability >= 7.0:
        verdict = "RECOMMEND FOR PILOT"
    elif overall >= 6.0 and tech >= 6.0:
        verdict = "FURTHER EVALUATION REQUIRED"
    else:
        verdict = "NOT RECOMMENDED"

    return {
        "overall_score": overall,
        "verdict": verdict,
        "strengths": [k for k, v in rubric_scores.items() if v >= 8.0],
        "concerns": [k for k, v in rubric_scores.items() if v <= 7.0],
    }


# Backward-compatible alias for existing pipelines
evaluate_startup = evaluate_approach_1


# ---------------------------------------------------------------------
# 2. APPROACH 2: HYBRID OBJECTIVE READINESS & STATUTORY AUDIT ENGINE
# ---------------------------------------------------------------------

class StartupReadinessScorer:
    """Evaluates technical capability weighted against corporate telemetry and statutory compliance."""

    @staticmethod
    def compute_objective_readiness(startup_data: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        trl = startup_data.get("trl_level", 4)
        pilots = min(startup_data.get("completed_government_pilots", 0), 5)
        dpiit = 1.0 if startup_data.get("dpiit_recognized", False) else 0.0
        turnover = min(startup_data.get("annual_turnover_lakhs_inr", 0.0), 500.0) / 500.0

        # Weighted calculation (Max 10.0 pts)
        # TRL: 4.0 pts | Verified Gov Pilots: 3.0 pts | DPIIT: 1.5 pts | Turnover: 1.5 pts
        trl_pts = (trl / 9.0) * 4.0
        pilots_pts = (pilots / 5.0) * 3.0
        dpiit_pts = dpiit * 1.5
        turnover_pts = turnover * 1.5

        total_objective = round(trl_pts + pilots_pts + dpiit_pts + turnover_pts, 2)
        breakdown = {
            "trl_points": round(trl_pts, 2),
            "pilots_points": round(pilots_pts, 2),
            "dpiit_points": round(dpiit_pts, 2),
            "turnover_points": round(turnover_pts, 2),
        }
        return total_objective, breakdown

    @classmethod
    def evaluate(cls, rubric_scores: Dict[str, float], startup_data: Dict[str, Any]) -> Dict[str, Any]:
        expert_avg = round(sum(rubric_scores.values()) / max(len(rubric_scores), 1), 2)
        objective_score, breakdown = cls.compute_objective_readiness(startup_data)

        # Composite score: 55% Expert Rubric + 45% Verified Objective Telemetry
        composite = round((expert_avg * 0.55) + (objective_score * 0.45), 2)

        # Strengths identification
        strengths = [crit for crit, val in rubric_scores.items() if val >= 8.0]
        trl = startup_data.get("trl_level", 0)
        pilots = startup_data.get("completed_government_pilots", 0)

        if trl >= 8:
            strengths.append(f"Field-Proven Technology Readiness (TRL {trl})")
        if startup_data.get("gov_pilot_experience", False):
            strengths.append(f"Demonstrated Municipal Track Record ({pilots} prior pilots)")
        if startup_data.get("dpiit_recognized", False):
            strengths.append("DPIIT Recognized (Statutory GFR Rule 170 Eligible)")

        # Risk & audit concerns identification
        concerns = [crit for crit, val in rubric_scores.items() if val <= 6.5]
        if trl <= 5:
            concerns.append(f"Early-stage TRL (TRL {trl}): Requires controlled isolation trial")
        if not startup_data.get("dpiit_recognized", False):
            concerns.append("Not DPIIT Recognized: Full Earnest Money Deposit (EMD) required")
        if startup_data.get("annual_turnover_lakhs_inr", 0.0) < 10.0:
            concerns.append("Limited balance sheet reserve (< 10 Lakhs INR) for hardware scaling")

        # Statutory Procurement Verdict
        tech_feasibility = rubric_scores.get("technical_feasibility", rubric_scores.get("Technical Feasibility", 0.0))
        if composite >= 7.8 and tech_feasibility >= 7.0 and trl >= 6:
            verdict = "APPROVE FOR PILOT DEPLOYMENT"
        elif composite >= 6.0:
            verdict = "CONDITIONAL APPROVAL (REVISED PILOT SCOPE)"
        else:
            verdict = "UNSUITABLE FOR MUNICIPAL DEPLOYMENT"

        return {
            "composite_score": composite,
            "expert_rubric_score": expert_avg,
            "objective_readiness_score": objective_score,
            "objective_breakdown": breakdown,
            "strengths": strengths,
            "risk_concerns": concerns,
            "verdict": verdict,
        }


# ---------------------------------------------------------------------
# 3. COMPARATIVE AUDIT TRAIL ENGINE
# ---------------------------------------------------------------------

def audit_evaluation(
    startup_name: str,
    rubric_scores: Dict[str, float],
    startup_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Runs both approaches side-by-side and detects evaluation bias or unverified hardware risks."""
    res1 = evaluate_approach_1(rubric_scores)
    res2 = StartupReadinessScorer.evaluate(rubric_scores, startup_data)

    divergence = round(res2["composite_score"] - res1["overall_score"], 2)

    # Risk anomaly detection
    risk_flag = "ALIGNED EVALUATION"
    if res1["verdict"] == "RECOMMEND FOR PILOT" and res2["verdict"] == "UNSUITABLE FOR MUNICIPAL DEPLOYMENT":
        risk_flag = "CRITICAL RISK: Paper Tiger Detected (Subjective pitch bias masked unverified hardware)"
    elif "CONDITIONAL" in res2["verdict"] and res1["verdict"] == "NOT RECOMMENDED":
        risk_flag = "OPPORTUNITY RESCUED: Battle-tested vendor salvaged despite conservative evaluator scores"

    return {
        "startup_name": startup_name,
        "approach_1": res1,
        "approach_2": res2,
        "divergence": divergence,
        "risk_flag": risk_flag,
    }


# ---------------------------------------------------------------------
# 4. CLI DEMONSTRATION & AUDIT SUITE
# ---------------------------------------------------------------------

if __name__ == "__main__":
    scenarios = [
        {
            "name": "AuraSense AI (Scenario A: Paper Tiger)",
            "rubric": {
                "technical_feasibility": 9.0,
                "innovation": 9.5,
                "cost_viability": 8.0,
                "scalability": 9.0,
            },
            "data": {
                "trl_level": 4,
                "completed_government_pilots": 0,
                "dpiit_recognized": False,
                "gov_pilot_experience": False,
                "annual_turnover_lakhs_inr": 2.5,
            },
        },
        {
            "name": "Nagar Flow Dynamics (Scenario B: Civic Veteran)",
            "rubric": {
                "technical_feasibility": 7.5,
                "innovation": 7.0,
                "cost_viability": 7.0,
                "scalability": 7.5,
            },
            "data": {
                "trl_level": 8,
                "completed_government_pilots": 4,
                "dpiit_recognized": True,
                "gov_pilot_experience": True,
                "annual_turnover_lakhs_inr": 185.0,
            },
        },
        {
            "name": "VayuGrid Systems (Scenario C: DeepTech Pioneer)",
            "rubric": {
                "technical_feasibility": 8.5,
                "innovation": 9.0,
                "cost_viability": 7.0,
                "scalability": 8.0,
            },
            "data": {
                "trl_level": 7,
                "completed_government_pilots": 0,
                "dpiit_recognized": True,
                "gov_pilot_experience": False,
                "annual_turnover_lakhs_inr": 18.0,
            },
        },
    ]

    print("=" * 80)
    print("        MODEL 2: MUNICIPAL PROCUREMENT AUDIT & EVALUATION SUITE")
    print("=" * 80)

    for case in scenarios:
        report = audit_evaluation(case["name"], case["rubric"], case["data"])
        a1 = report["approach_1"]
        a2 = report["approach_2"]

        print(f"\nSTARTUP: {report['startup_name']}")
        print("-" * 80)
        print(f"Approach 1 (Subjective Rubric) : Score: {a1['overall_score']}/10  | Verdict: {a1['verdict']}")
        print(f"Approach 2 (Hybrid Objective)  : Score: {a2['composite_score']}/10  | Verdict: {a2['verdict']}")
        print(f"Readiness Score Breakdown      : Expert: {a2['expert_rubric_score']} | Objective Telemetry: {a2['objective_readiness_score']}")
        print(f"Score Divergence               : {report['divergence']} pts")
        print(f"Audit Finding                  : {report['risk_flag']}")

        print("Key Strengths:")
        for s in a2["strengths"]:
            print(f"  ✓ {s}")

        if a2["risk_concerns"]:
            print("Risk Concerns:")
            for c in a2["risk_concerns"]:
                print(f"  ⚠ {c}")
        print("-" * 80)
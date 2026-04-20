"""
ArthTantra — Financial Calculation Tools
Deterministic tools (no LLM) for financial math.
"""
import random
from datetime import datetime, timedelta


def calculate_net_worth_velocity(
    current_net_worth: float,
    monthly_income: float,
    monthly_expenses: float,
    months_ahead: int = 12
) -> dict:
    """
    Stochastic net worth velocity model.
    Projects future net worth with confidence intervals.
    """
    monthly_savings = monthly_income - monthly_expenses
    savings_rate = monthly_savings / monthly_income if monthly_income > 0 else 0

    projections = []
    optimistic = []
    pessimistic = []

    for month in range(1, months_ahead + 1):
        # Base projection
        base = current_net_worth + (monthly_savings * month)
        # Investment returns (8% annual avg for India)
        investment_return = base * (0.08 / 12) * month
        base += investment_return

        # Optimistic: 15% better savings + 12% returns
        opt = current_net_worth + (monthly_savings * 1.15 * month)
        opt += opt * (0.12 / 12) * month

        # Pessimistic: 20% worse savings + 4% returns
        pess = current_net_worth + (monthly_savings * 0.80 * month)
        pess += pess * (0.04 / 12) * month

        projections.append(round(base, 2))
        optimistic.append(round(opt, 2))
        pessimistic.append(round(pess, 2))

    return {
        "current_net_worth": current_net_worth,
        "monthly_velocity": round(monthly_savings, 2),
        "savings_rate": round(savings_rate * 100, 1),
        "projections": projections,
        "optimistic": optimistic,
        "pessimistic": pessimistic,
        "annual_projected": projections[-1] if projections else current_net_worth,
        "velocity_score": round(min(savings_rate * 200, 100), 1),  # 0-100 score
    }


def calculate_opportunity_cost(
    monthly_expense: float,
    frequency: str = "monthly",
    years: int = 10,
    annual_return: float = 0.12  # 12% for Indian equity markets
) -> dict:
    """
    Calculate the opportunity cost of a recurring expense.
    Shows what you'd have if you invested that money instead.
    """
    if frequency == "daily":
        monthly = monthly_expense * 30
    elif frequency == "weekly":
        monthly = monthly_expense * 4.33
    elif frequency == "yearly":
        monthly = monthly_expense / 12
    else:
        monthly = monthly_expense

    monthly_rate = annual_return / 12
    months = years * 12

    # Future value of annuity
    if monthly_rate > 0:
        fv = monthly * (((1 + monthly_rate) ** months - 1) / monthly_rate)
    else:
        fv = monthly * months

    total_spent = monthly * months

    return {
        "monthly_amount": round(monthly, 2),
        "total_spent_over_period": round(total_spent, 2),
        "opportunity_cost": round(fv, 2),
        "money_lost_to_inflation": round(fv - total_spent, 2),
        "years": years,
        "assumed_return": f"{annual_return * 100}%",
    }


def detect_subscription_redundancy(subscriptions: list[dict]) -> list[dict]:
    """
    Detect potentially redundant subscriptions.
    Groups by category and flags overlaps.
    """
    categories = {}
    for sub in subscriptions:
        cat = sub.get("category", "other")
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(sub)

    redundancies = []
    for cat, subs in categories.items():
        if len(subs) > 1:
            total_cost = sum(s.get("amount", 0) for s in subs)
            redundancies.append({
                "category": cat,
                "subscriptions": [s.get("name", "Unknown") for s in subs],
                "individual_costs": [s.get("amount", 0) for s in subs],
                "total_monthly_cost": round(total_cost, 2),
                "recommendation": f"You have {len(subs)} {cat} subscriptions. Consider keeping only one to save ₹{round(total_cost - min(s.get('amount', 0) for s in subs), 2)}/month.",
            })

    return redundancies


def estimate_tax_liability(
    annual_income: float,
    deductions: dict = None,
    regime: str = "new"  # 'old' or 'new' Indian tax regime
) -> dict:
    """
    Estimate Indian income tax liability under old/new regime.
    """
    if deductions is None:
        deductions = {}

    if regime == "new":
        # New Tax Regime FY 2025-26 (India)
        slabs = [
            (400000, 0.00),
            (400000, 0.05),
            (400000, 0.10),
            (400000, 0.15),
            (400000, 0.20),
            (float('inf'), 0.30),
        ]
        taxable = annual_income - 75000  # Standard deduction
    else:
        # Old Tax Regime
        slabs = [
            (250000, 0.00),
            (250000, 0.05),
            (500000, 0.20),
            (float('inf'), 0.30),
        ]
        total_deductions = sum(deductions.values())
        taxable = annual_income - total_deductions - 50000  # Standard deduction

    taxable = max(0, taxable)
    tax = 0
    remaining = taxable

    slab_breakdown = []
    for slab_amount, rate in slabs:
        if remaining <= 0:
            break
        taxable_in_slab = min(remaining, slab_amount)
        tax_in_slab = taxable_in_slab * rate
        tax += tax_in_slab
        if tax_in_slab > 0:
            slab_breakdown.append({
                "slab": f"₹{taxable_in_slab:,.0f}",
                "rate": f"{rate * 100:.0f}%",
                "tax": round(tax_in_slab, 2),
            })
        remaining -= taxable_in_slab

    # Cess 4%
    cess = tax * 0.04
    total_tax = tax + cess

    return {
        "regime": regime,
        "gross_income": annual_income,
        "taxable_income": round(taxable, 2),
        "tax_before_cess": round(tax, 2),
        "cess_4_percent": round(cess, 2),
        "total_tax": round(total_tax, 2),
        "effective_rate": round((total_tax / annual_income) * 100, 2) if annual_income > 0 else 0,
        "slab_breakdown": slab_breakdown,
        "monthly_tax": round(total_tax / 12, 2),
    }


def generate_mock_transactions(count: int = 50) -> list[dict]:
    """Generate realistic mock Indian financial transactions."""
    merchants = [
        ("Swiggy", "food_delivery", 150, 800),
        ("Zomato", "food_delivery", 200, 1200),
        ("Amazon India", "shopping", 500, 15000),
        ("Flipkart", "shopping", 300, 8000),
        ("BigBasket", "groceries", 800, 3500),
        ("Zepto", "groceries", 200, 1500),
        ("Netflix", "entertainment", 199, 649),
        ("Spotify", "entertainment", 119, 179),
        ("Hotstar", "entertainment", 149, 299),
        ("YouTube Premium", "entertainment", 129, 189),
        ("Uber", "transport", 150, 800),
        ("Ola", "transport", 100, 600),
        ("Jio Recharge", "utilities", 239, 999),
        ("Electricity Bill", "utilities", 1500, 4000),
        ("Gym Membership", "health", 1500, 3000),
        ("Apollo Pharmacy", "health", 200, 2000),
        ("IRCTC", "travel", 500, 5000),
        ("MakeMyTrip", "travel", 2000, 25000),
        ("Starbucks", "cafe", 300, 800),
        ("Chai Point", "cafe", 80, 200),
    ]

    transactions = []
    now = datetime.now()

    for i in range(count):
        merchant, category, min_amt, max_amt = random.choice(merchants)
        amount = round(random.uniform(min_amt, max_amt), 2)
        days_ago = random.randint(0, 180)
        hour = random.randint(0, 23)

        # Emotional tagging based on time and amount
        if hour >= 23 or hour <= 4:
            emotional_tag = "impulse"
        elif category in ("groceries", "utilities"):
            emotional_tag = "routine"
        elif amount > max_amt * 0.8:
            emotional_tag = "splurge"
        else:
            emotional_tag = "planned"

        # Anomaly scoring
        anomaly_score = 0.0
        if hour >= 1 and hour <= 4 and amount > 2000:
            anomaly_score = 0.85  # Late night high spend
        elif amount > max_amt * 0.95:
            anomaly_score = 0.6  # Unusually high for merchant
        elif random.random() < 0.05:
            anomaly_score = 0.9  # Random anomaly for demo

        transactions.append({
            "id": f"txn_{i:04d}",
            "merchant": merchant,
            "category": category,
            "amount": amount,
            "currency": "INR",
            "timestamp": (now - timedelta(days=days_ago, hours=random.randint(0, 12))).isoformat(),
            "hour_of_day": hour,
            "emotional_tag": emotional_tag,
            "anomaly_score": round(anomaly_score, 2),
            "payment_method": random.choice(["UPI", "Credit Card", "Debit Card", "Net Banking"]),
            "reconciled": anomaly_score < 0.5,
        })

    transactions.sort(key=lambda x: x["timestamp"], reverse=True)
    return transactions


def generate_mock_portfolio() -> dict:
    """Generate a realistic mock Indian investment portfolio."""
    holdings = [
        {"name": "Nifty 50 Index Fund", "sector": "index", "value": 250000, "returns": 14.2, "allocation": 25},
        {"name": "HDFC Bank", "sector": "banking", "value": 120000, "returns": 8.5, "allocation": 12},
        {"name": "Infosys", "sector": "technology", "value": 95000, "returns": 22.1, "allocation": 9.5},
        {"name": "Reliance Industries", "sector": "conglomerate", "value": 85000, "returns": -3.2, "allocation": 8.5},
        {"name": "TCS", "sector": "technology", "value": 78000, "returns": 11.7, "allocation": 7.8},
        {"name": "SBI", "sector": "banking", "value": 65000, "returns": 18.4, "allocation": 6.5},
        {"name": "Bajaj Finance", "sector": "finance", "value": 55000, "returns": -8.1, "allocation": 5.5},
        {"name": "Asian Paints", "sector": "consumer", "value": 45000, "returns": 5.3, "allocation": 4.5},
        {"name": "PPF Account", "sector": "fixed_income", "value": 80000, "returns": 7.1, "allocation": 8},
        {"name": "Gold ETF", "sector": "commodity", "value": 60000, "returns": 24.5, "allocation": 6},
        {"name": "FD (SBI)", "sector": "fixed_income", "value": 50000, "returns": 6.8, "allocation": 5},
        {"name": "Crypto (BTC/ETH)", "sector": "crypto", "value": 17000, "returns": 45.2, "allocation": 1.7},
    ]

    total_value = sum(h["value"] for h in holdings)

    return {
        "total_value": total_value,
        "currency": "INR",
        "holdings": holdings,
        "sectors": list(set(h["sector"] for h in holdings)),
        "best_performer": max(holdings, key=lambda h: h["returns"])["name"],
        "worst_performer": min(holdings, key=lambda h: h["returns"])["name"],
        "weighted_return": round(sum(h["returns"] * h["allocation"] / 100 for h in holdings), 2),
    }


def generate_mock_subscriptions() -> list[dict]:
    """Generate mock active subscriptions for redundancy detection."""
    return [
        {"name": "Netflix", "category": "streaming", "amount": 649, "billing": "monthly", "since": "2023-05-01"},
        {"name": "Amazon Prime", "category": "streaming", "amount": 299, "billing": "monthly", "since": "2022-01-15"},
        {"name": "Disney+ Hotstar", "category": "streaming", "amount": 299, "billing": "monthly", "since": "2024-03-01"},
        {"name": "Spotify Premium", "category": "music", "amount": 119, "billing": "monthly", "since": "2023-08-20"},
        {"name": "YouTube Premium", "category": "music", "amount": 129, "billing": "monthly", "since": "2024-01-01"},
        {"name": "Zerodha", "category": "investing", "amount": 0, "billing": "free", "since": "2022-06-01"},
        {"name": "iCloud 50GB", "category": "storage", "amount": 75, "billing": "monthly", "since": "2023-01-01"},
        {"name": "Google One 100GB", "category": "storage", "amount": 130, "billing": "monthly", "since": "2023-11-01"},
        {"name": "Cult.fit", "category": "fitness", "amount": 1499, "billing": "monthly", "since": "2024-06-01"},
        {"name": "Headspace", "category": "wellness", "amount": 399, "billing": "monthly", "since": "2024-09-01"},
    ]

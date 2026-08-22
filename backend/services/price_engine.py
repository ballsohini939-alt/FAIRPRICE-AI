import math
from typing import Dict, Any

def get_deterministic_hash(query: str) -> int:
    """Generates a deterministic hash from the query to seed predictable numbers."""
    hash_val = 0
    for char in query:
        hash_val = ord(char) + ((hash_val << 5) - hash_val)
    return abs(hash_val)

def analyze_price(query: str, current_price: float, history: list[float]) -> Dict[str, Any]:
    """
    Deterministic engine for evaluating pricing signals and risk levels.
    """
    if not history:
        # Default mock history if not available
        base = current_price * 1.15
        hash_val = get_deterministic_hash(query)
        history = []
        cur = base
        for i in range(6):
            step = -1 if (hash_val + i) % 3 == 0 else 1
            pct = 0.03 * ((hash_val + i) % 5)
            cur += cur * step * pct
            history.append(round(cur))

    # Compute fair price as an exponentially weighted moving average or simple average
    # For this implementation, we will use a weighted average favoring recent prices
    weights = [0.1, 0.1, 0.15, 0.15, 0.2, 0.3]
    if len(history) == 6:
        fair_price = sum(h * w for h, w in zip(history, weights))
    else:
        fair_price = sum(history) / len(history)

    fair_price = round(fair_price)
    
    price_diff = current_price - fair_price
    price_diff_pct = round((price_diff / fair_price) * 100, 2)
    
    # Calculate Risk Score (0-100)
    # Risk increases if the current price is significantly higher than fair price
    # Risk decreases if it's lower.
    risk_score = 50 + int(price_diff_pct * 2)
    risk_score = max(0, min(100, risk_score)) # Clamp between 0 and 100

    if risk_score < 30:
        risk_level = "Low"
        badge_text = "Price Drop!"
        badge_class = "deal"
    elif risk_score < 70:
        risk_level = "Medium"
        badge_text = "Fair Price"
        badge_class = "fair"
    else:
        risk_level = "High"
        badge_text = "Priced High"
        badge_class = "high"

    # Pricing signals
    signals = []
    if current_price < min(history[:-1]):
        signals.append("Price is at a historical low.")
    if current_price > max(history[:-1]):
        signals.append("Price is at a historical high.")
    if price_diff_pct > 10:
        signals.append(f"Price is elevated by {price_diff_pct}% above the historical average.")
    elif price_diff_pct < -10:
        signals.append(f"Price is discounted by {abs(price_diff_pct)}% below the historical average.")

    return {
        "current_price": current_price,
        "fair_price": fair_price,
        "price_difference": price_diff,
        "price_difference_percentage": price_diff_pct,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "pricing_signals": signals,
        "history": history,
        "badgeText": badge_text,
        "badgeClass": badge_class,
    }

def mock_product_search(query: str) -> Dict[str, Any]:
    """Generates a complete mock dataset for a product query for demo purposes."""
    normalized = query.lower().strip()
    
    hash_val = get_deterministic_hash(normalized)
    
    # Generate base price between ₹1,000 and ₹50,000
    base_price = math.floor((hash_val % 49) * 1000) + 1200
    
    # Generate 6 month prices with random trend
    history = []
    cur = base_price * 1.15
    for i in range(6):
        step = -1 if (hash_val + i) % 3 == 0 else 1
        pct = 0.03 * ((hash_val + i) % 5)
        cur += cur * step * pct
        history.append(round(cur))
        
    final_price = history[5]
    
    analysis = analyze_price(normalized, final_price, history)
    
    retailers = [
        {"name": "Amazon Retail", "price": f"₹{final_price:,.0f}", "isBest": True},
        {"name": "Flipkart Online", "price": f"₹{round(final_price * 1.01):,.0f}", "isBest": False},
        {"name": "Local Store Average", "price": f"₹{round(final_price * 1.04):,.0f}", "isBest": False}
    ]
    
    return {
        "name": query.title(),
        "current_price": f"₹{final_price:,.0f}",
        "current_price_raw": final_price,
        "history": history,
        "retailers": retailers,
        "months": ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        "analysis": analysis
    }

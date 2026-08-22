from pydantic import BaseModel
from typing import List, Optional

class PriceCheckRequest(BaseModel):
    query: str

class RetailerInfo(BaseModel):
    name: str
    price: str
    isBest: bool

class PriceCheckResponse(BaseModel):
    name: str
    current_price: str
    fair_price: str
    price_difference: str
    price_difference_percentage: float
    risk_score: int
    risk_level: str
    pricing_signals: List[str]
    explanation: str
    suggestions: List[str]
    history: List[int]
    months: List[str]
    retailers: List[RetailerInfo]
    
    # UI specific fields that the frontend also uses
    badgeText: str
    badgeClass: str
    adviceTitle: str
    adviceDesc: str

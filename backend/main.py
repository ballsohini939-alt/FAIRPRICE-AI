import os
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
import uvicorn

# Ensure environment variables are loaded
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from . import models, schemas
from .database import engine, get_db
from .services import price_engine, gemini_service

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FairPrice API", description="AI-powered Price Checker Backend")

# Configure CORS so the frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/price/check", response_model=schemas.PriceCheckResponse)
def check_price(request: schemas.PriceCheckRequest, db: Session = Depends(get_db)):
    """
    Analyzes a product or booking price and returns deterministic metrics alongside
    neutral AI-generated explanations.
    """
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Record the price check
    db_check = models.PriceCheck(query=query)
    db.add(db_check)
    db.commit()
    db.refresh(db_check)

    # 1. Fetch mock data for the query (simulating fetching from a real database or scraping)
    product_data = price_engine.mock_product_search(query)
    
    analysis = product_data["analysis"]

    # 2. Use Gemini to generate the human-readable explanation and suggestions
    explanation, suggestions, advice_title, advice_desc = gemini_service.generate_explanation_and_suggestions(
        product_data["name"], 
        analysis
    )

    # Record the result in the database
    db_result = models.FairPriceResult(
        check_id=db_check.id,
        current_price=analysis["current_price"],
        fair_price=analysis["fair_price"],
        risk_score=analysis["risk_score"],
        risk_level=analysis["risk_level"]
    )
    db.add(db_result)
    db.commit()

    # 3. Construct the response expected by the frontend
    response = schemas.PriceCheckResponse(
        name=product_data["name"],
        current_price=f"₹{analysis['current_price']:,.0f}",
        fair_price=f"₹{analysis['fair_price']:,.0f}",
        price_difference=f"₹{analysis['price_difference']:,.0f}",
        price_difference_percentage=analysis["price_difference_percentage"],
        risk_score=analysis["risk_score"],
        risk_level=analysis["risk_level"],
        pricing_signals=analysis["pricing_signals"],
        explanation=explanation,
        suggestions=suggestions,
        history=product_data["history"],
        months=product_data["months"],
        retailers=[schemas.RetailerInfo(**r) for r in product_data["retailers"]],
        badgeText=analysis["badgeText"],
        badgeClass=analysis["badgeClass"],
        adviceTitle=advice_title,
        adviceDesc=advice_desc
    )

    return response

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8001, reload=True)

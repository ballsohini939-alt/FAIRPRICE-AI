import os
import json
import logging
import google.generativeai as genai
from typing import Dict, Any, Tuple, List

# Configure logger
logger = logging.getLogger(__name__)

# Try to configure Gemini API if key is present
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment. Gemini features will use fallback.")

def generate_explanation_and_suggestions(product_name: str, analysis: Dict[str, Any]) -> Tuple[str, List[str], str, str]:
    """
    Uses the Gemini API to generate a neutral explanation and practical suggestions
    based purely on the numerical analysis provided by the deterministic engine.
    
    Returns a tuple of (explanation, suggestions, adviceTitle, adviceDesc)
    """
    if not GEMINI_API_KEY:
        # Fallback if no API key is provided
        return _get_fallback_content(analysis)

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an AI assistant for a price-checking application called FairPrice.
        Your job is to provide a neutral, objective explanation and practical purchasing suggestions
        for the product "{product_name}" based on the following deterministic numerical analysis:
        
        - Current Price: ₹{analysis['current_price']}
        - Fair Price Estimate: ₹{analysis['fair_price']}
        - Price Difference: ₹{analysis['price_difference']}
        - Price Difference Percentage: {analysis['price_difference_percentage']}%
        - Risk Level: {analysis['risk_level']}
        - Pricing Signals: {', '.join(analysis['pricing_signals'])}
        
        RULES:
        1. NEVER state that a company is definitely manipulating prices based only on repeated searches, high prices, scarcity messages, countdown timers, price changes. 
        2. Provide a neutral, objective tone.
        3. Do not invent numerical prices. Only use the numbers provided above.
        
        Output your response exactly as a JSON object with the following keys:
        - "explanation": A 2-3 sentence explanation of the current pricing situation.
        - "suggestions": A list of 2-3 strings, each being a short practical counter-purchasing suggestion (e.g., "Wait for festive sales").
        - "adviceTitle": A short title for the verdict, e.g., "Deal Verdict: Recommended Buy" or "Deal Verdict: Wait for Drop".
        - "adviceDesc": A 2-3 sentence summary of the advice.
        
        Ensure the output is valid JSON without any markdown formatting blocks.
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # Clean up possible markdown code blocks around JSON
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        
        return (
            data.get("explanation", _get_fallback_content(analysis)[0]),
            data.get("suggestions", _get_fallback_content(analysis)[1]),
            data.get("adviceTitle", _get_fallback_content(analysis)[2]),
            data.get("adviceDesc", _get_fallback_content(analysis)[3])
        )
    except Exception as e:
        logger.error(f"Gemini API generation failed: {str(e)}")
        # Fail gracefully to ensure the endpoint doesn't crash
        return _get_fallback_content(analysis)


def _get_fallback_content(analysis: Dict[str, Any]) -> Tuple[str, List[str], str, str]:
    """Provides fallback content if Gemini API fails or is not configured."""
    risk = analysis.get("risk_level", "Medium")
    
    if risk == "Low":
        title = "Deal Verdict: Recommended Buy"
        desc = "The current price is at or below historical averages. It's a good time to buy."
        explanation = "The product is currently priced favorably compared to recent trends."
        suggestions = ["Buy now to lock in the deal", "Check for additional retailer cashback offers"]
    elif risk == "High":
        title = "Deal Verdict: Wait for Drop"
        desc = "The current price is elevated compared to recent trends. We recommend waiting."
        explanation = "The product is currently priced significantly above the fair market value."
        suggestions = ["Wait for upcoming seasonal sales", "Set a price drop alert", "Compare with older models"]
    else:
        title = "Deal Verdict: Fair Price"
        desc = "The price is within the normal range. Good time to buy if needed."
        explanation = "The product is priced consistently with historical averages."
        suggestions = ["Safe to purchase if needed urgently", "Look for bundled accessories"]
        
    return explanation, suggestions, title, desc

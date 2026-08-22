from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    base_price = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    history = relationship("PriceHistory", back_populates="product")

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    price = Column(Float)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="history")

class PriceCheck(Base):
    __tablename__ = "price_checks"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    result = relationship("FairPriceResult", back_populates="check", uselist=False)

class FairPriceResult(Base):
    __tablename__ = "fair_price_results"

    id = Column(Integer, primary_key=True, index=True)
    check_id = Column(Integer, ForeignKey("price_checks.id"))
    current_price = Column(Float)
    fair_price = Column(Float)
    risk_score = Column(Float)
    risk_level = Column(String)

    check = relationship("PriceCheck", back_populates="result")

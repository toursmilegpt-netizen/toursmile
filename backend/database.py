"""
Database configuration and models for TourSmile
PostgreSQL + Redis setup with SQLAlchemy
"""
from sqlalchemy import create_engine, Column, String, DateTime, Integer, Float, Boolean, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
import os
import redis

# Database configuration
POSTGRES_URL = os.getenv('POSTGRES_URL', 'postgresql://toursmile_user:toursmile_pass_2025@localhost:5432/toursmile')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# SQLAlchemy setup
engine = create_engine(POSTGRES_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis setup
redis_client = redis.from_url(REDIS_URL)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_redis():
    """Get Redis client"""
    return redis_client

# Database Models

class Waitlist(Base):
    __tablename__ = "waitlist"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    source = Column(String, default="website")
    timestamp = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Location tracking
    ip_address = Column(String)
    location = Column(JSON)  # Store location data as JSON
    user_agent = Column(String)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    country_code = Column(String, default="+91")
    first_name = Column(String)
    last_name = Column(String)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings = relationship("Booking", back_populates="user")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_reference = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey('users.id'))
    status = Column(String, default="confirmed")  # confirmed, cancelled, pending
    booking_type = Column(String)  # flight, hotel, package
    
    # Flight/Hotel/Package details stored as JSON
    flight_details = Column(JSON)
    hotel_details = Column(JSON)
    package_details = Column(JSON)
    
    # Fare and pricing
    selected_fare = Column(JSON)
    base_price = Column(Float)
    taxes = Column(Float)
    convenience_fee = Column(Float)
    final_price = Column(Float)
    
    # Passenger/Guest details
    passengers = Column(JSON)  # List of passenger details
    contact_info = Column(JSON)
    
    # Payment details
    payment_details = Column(JSON)
    
    # Metadata
    source = Column(String, default="website")
    passenger_count = Column(Integer)
    promo = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="bookings")

class Package(Base):
    __tablename__ = "packages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    duration_nights = Column(Integer, nullable=False)  # 2N/3D, 3N/4D, etc.
    duration_days = Column(Integer, nullable=False)
    
    # Package configuration
    package_type = Column(String)  # economy, premium, luxury
    includes_flight = Column(Boolean, default=True)
    includes_hotel = Column(Boolean, default=True)
    includes_activities = Column(Boolean, default=False)
    
    # Pricing
    base_price = Column(Float)
    price_per_person = Column(Float)
    
    # Package details
    description = Column(Text)
    highlights = Column(JSON)  # List of highlights
    inclusions = Column(JSON)  # List of what's included
    exclusions = Column(JSON)  # List of what's excluded
    
    # Flight and Hotel templates
    flight_search_params = Column(JSON)  # Default search parameters
    hotel_search_params = Column(JSON)   # Default hotel criteria
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class OTPVerification(Base):
    __tablename__ = "otp_verifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String, nullable=False)
    country_code = Column(String, default="+91")
    otp_code = Column(String, nullable=False)
    purpose = Column(String, nullable=False)  # registration, booking, etc.
    is_verified = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class CRMActivity(Base):
    __tablename__ = "crm_activities"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'))
    activity_type = Column(String, nullable=False)  # call, email, booking, reminder
    subject = Column(String)
    description = Column(Text)
    status = Column(String, default="pending")  # pending, completed, cancelled
    scheduled_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def test_connection():
    """Test database and Redis connections"""
    try:
        # Test PostgreSQL connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        print("✅ PostgreSQL connection successful!")
        
        # Test Redis connection
        redis_client.ping()
        print("✅ Redis connection successful!")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing database connections...")
    test_connection()
    create_tables()
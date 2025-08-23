"""
Admin Authentication and Management System
Role-based admin authentication separate from customer OTP system
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import hashlib
import jwt
import os
import uuid
import logging

from database import get_db, create_tables

# Admin-specific database models
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text
from database import Base, engine

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="admin")  # admin, super_admin, manager
    is_active = Column(Boolean, default=True)
    is_super_admin = Column(Boolean, default=False)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String)  # ID of admin who created this user

class AdminSession(Base):
    __tablename__ = "admin_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_id = Column(String, nullable=False)
    session_token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String)
    user_agent = Column(String)

# Create admin tables
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/admin")
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'toursmile_admin_secret_2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION = 24  # hours

# Pydantic models
class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminCreateRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: str = "admin"

class AdminLoginResponse(BaseModel):
    success: bool
    access_token: Optional[str] = None
    admin_info: Optional[Dict] = None
    message: str

class AdminDashboardStats(BaseModel):
    total_bookings: int
    total_revenue: float
    total_customers: int
    bookings_today: int
    revenue_today: float
    top_destinations: List[Dict]
    recent_bookings: List[Dict]

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

def create_access_token(admin_id: str, username: str, role: str) -> str:
    """Create JWT access token for admin"""
    payload = {
        'admin_id': admin_id,
        'username': username,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_access_token(token: str) -> Dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current admin from JWT token"""
    token = credentials.credentials
    payload = verify_access_token(token)
    
    admin = db.query(AdminUser).filter(AdminUser.id == payload['admin_id']).first()
    if not admin or not admin.is_active:
        raise HTTPException(status_code=401, detail="Admin not found or inactive")
    
    return admin

def get_super_admin(admin: AdminUser = Depends(get_current_admin)):
    """Require super admin privileges"""
    if not admin.is_super_admin:
        raise HTTPException(status_code=403, detail="Super admin privileges required")
    return admin

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    """Admin login with username/password"""
    try:
        # Find admin user
        admin = db.query(AdminUser).filter(AdminUser.username == request.username).first()
        
        if not admin or not verify_password(request.password, admin.password_hash):
            return AdminLoginResponse(
                success=False,
                message="Invalid username or password"
            )
        
        if not admin.is_active:
            return AdminLoginResponse(
                success=False,
                message="Account is disabled"
            )
        
        # Update last login
        admin.last_login = datetime.utcnow()
        db.commit()
        
        # Create access token
        access_token = create_access_token(admin.id, admin.username, admin.role)
        
        return AdminLoginResponse(
            success=True,
            access_token=access_token,
            admin_info={
                'id': admin.id,
                'username': admin.username,
                'email': admin.email,
                'full_name': admin.full_name,
                'role': admin.role,
                'is_super_admin': admin.is_super_admin
            },
            message="Login successful"
        )
        
    except Exception as e:
        logging.error(f"Admin login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@router.post("/create-admin")
async def create_admin(request: AdminCreateRequest, current_admin: AdminUser = Depends(get_super_admin), db: Session = Depends(get_db)):
    """Create new admin user (super admin only)"""
    try:
        # Check if username or email already exists
        existing = db.query(AdminUser).filter(
            (AdminUser.username == request.username) | (AdminUser.email == request.email)
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Username or email already exists")
        
        # Create new admin
        new_admin = AdminUser(
            username=request.username,
            email=request.email,
            password_hash=hash_password(request.password),
            full_name=request.full_name,
            role=request.role,
            created_by=current_admin.id
        )
        
        db.add(new_admin)
        db.commit()
        
        return {
            "success": True,
            "message": f"Admin user '{request.username}' created successfully",
            "admin_id": new_admin.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Create admin error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create admin")

@router.get("/profile")
async def get_admin_profile(current_admin: AdminUser = Depends(get_current_admin)):
    """Get current admin profile"""
    return {
        'id': current_admin.id,
        'username': current_admin.username,
        'email': current_admin.email,
        'full_name': current_admin.full_name,
        'role': current_admin.role,
        'is_super_admin': current_admin.is_super_admin,
        'last_login': current_admin.last_login.isoformat() if current_admin.last_login else None,
        'created_at': current_admin.created_at.isoformat() if current_admin.created_at else None
    }

@router.get("/users")
async def list_admin_users(current_admin: AdminUser = Depends(get_super_admin), db: Session = Depends(get_db)):
    """List all admin users (super admin only)"""
    try:
        admins = db.query(AdminUser).all()
        
        admin_list = []
        for admin in admins:
            admin_list.append({
                'id': admin.id,
                'username': admin.username,
                'email': admin.email,
                'full_name': admin.full_name,
                'role': admin.role,
                'is_active': admin.is_active,
                'is_super_admin': admin.is_super_admin,
                'last_login': admin.last_login.isoformat() if admin.last_login else None,
                'created_at': admin.created_at.isoformat() if admin.created_at else None
            })
        
        return {
            "success": True,
            "admins": admin_list,
            "total": len(admin_list)
        }
        
    except Exception as e:
        logging.error(f"List admins error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve admin users")

@router.post("/setup-default-admin")
async def setup_default_admin(db: Session = Depends(get_db)):
    """Setup default super admin (only if no admins exist)"""
    try:
        # Check if any admin exists
        existing_admin = db.query(AdminUser).first()
        if existing_admin:
            raise HTTPException(status_code=400, detail="Admin users already exist")
        
        # Create default super admin
        default_admin = AdminUser(
            username="admin",
            email="admin@toursmile.com",
            password_hash=hash_password("TourSmile@2025"),  # Default password
            full_name="TourSmile Administrator",
            role="super_admin",
            is_super_admin=True
        )
        
        db.add(default_admin)
        db.commit()
        
        return {
            "success": True,
            "message": "Default admin created successfully",
            "credentials": {
                "username": "admin",
                "password": "TourSmile@2025",
                "warning": "Please change the default password after first login"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Setup default admin error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to setup default admin")

@router.post("/change-password")
async def change_admin_password(old_password: str, new_password: str, current_admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Change admin password"""
    try:
        # Verify old password
        if not verify_password(old_password, current_admin.password_hash):
            raise HTTPException(status_code=400, detail="Invalid current password")
        
        # Update password
        current_admin.password_hash = hash_password(new_password)
        db.commit()
        
        return {
            "success": True,
            "message": "Password changed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Change password error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to change password")
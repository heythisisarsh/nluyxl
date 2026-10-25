from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    created_at: str


class MemberResponse(BaseModel):
    id: str
    user_id: str
    email: str
    full_name: str
    role: str  # owner, admin, member
    joined_at: str


class AddMemberRequest(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str = "member"


class OrganizationCreateRequest(BaseModel):
    name: str
    slug: Optional[str] = None
    plan_id: str = "free"


class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan_id: str
    credits_used: int
    credits_limit: int
    created_at: str
    member_count: Optional[int] = 0
    current_user_role: Optional[str] = None


class PlanResponse(BaseModel):
    id: str
    name: str
    price_monthly: float
    credits_monthly: int
    max_members: int
    features: List[str]


class ChangePlanRequest(BaseModel):
    plan_id: str


class BillingSummaryResponse(BaseModel):
    org_id: str
    plan_id: str
    plan_name: str
    price_monthly: float
    credits_used: int
    credits_limit: int
    credits_percent: float
    member_count: int
    max_members: int
    features: List[str]

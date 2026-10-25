"""Tenancy business service layer for multi-tenant SQLite architecture."""

import os
import uuid
import re
import json
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from app.tenancy.database import (
    get_master_connection,
    get_tenant_connection,
    TENANTS_DIR,
)
from app.tenancy.models import (
    OrganizationResponse,
    MemberResponse,
    PlanResponse,
    BillingSummaryResponse,
)


def slugify(text: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", slug)


class TenancyService:
    @staticmethod
    def list_user_organizations(user_id: str = "user_arshin") -> List[OrganizationResponse]:
        with get_master_connection() as conn:
            cursor = conn.cursor()
            query = """
            SELECT o.*, om.role as current_user_role,
                   (SELECT COUNT(*) FROM organization_members WHERE org_id = o.id) as member_count
            FROM organizations o
            JOIN organization_members om ON o.id = om.org_id
            WHERE om.user_id = ?
            ORDER BY o.created_at ASC;
            """
            rows = cursor.execute(query, (user_id,)).fetchall()
            return [
                OrganizationResponse(
                    id=r["id"],
                    name=r["name"],
                    slug=r["slug"],
                    plan_id=r["plan_id"],
                    credits_used=r["credits_used"],
                    credits_limit=r["credits_limit"],
                    created_at=str(r["created_at"]),
                    member_count=r["member_count"],
                    current_user_role=r["current_user_role"],
                )
                for r in rows
            ]

    @staticmethod
    def get_organization(org_id: str) -> OrganizationResponse:
        with get_master_connection() as conn:
            cursor = conn.cursor()
            query = """
            SELECT o.*,
                   (SELECT COUNT(*) FROM organization_members WHERE org_id = o.id) as member_count
            FROM organizations o
            WHERE o.id = ? OR o.slug = ?;
            """
            r = cursor.execute(query, (org_id, org_id)).fetchone()
            if not r:
                raise HTTPException(status_code=404, detail="Organization not found")
            return OrganizationResponse(
                id=r["id"],
                name=r["name"],
                slug=r["slug"],
                plan_id=r["plan_id"],
                credits_used=r["credits_used"],
                credits_limit=r["credits_limit"],
                created_at=str(r["created_at"]),
                member_count=r["member_count"],
            )

    @staticmethod
    def create_organization(name: str, slug: Optional[str] = None, plan_id: str = "free", creator_user_id: str = "user_arshin") -> OrganizationResponse:
        org_slug = slug or slugify(name)
        org_id = f"org_{org_slug.replace('-', '_')}_{uuid.uuid4().hex[:6]}"
        db_path = os.path.join(TENANTS_DIR, f"{org_id}.db")

        # Get plan credit limits
        with get_master_connection() as conn:
            cursor = conn.cursor()
            plan = cursor.execute("SELECT credits_monthly FROM plans WHERE id = ?", (plan_id,)).fetchone()
            credits_limit = plan["credits_monthly"] if plan else 20000

            # Insert into master organizations
            cursor.execute("""
            INSERT INTO organizations (id, name, slug, plan_id, credits_used, credits_limit, db_path)
            VALUES (?, ?, ?, ?, 0, ?, ?);
            """, (org_id, name, org_slug, plan_id, credits_limit, db_path))

            # Make creator the owner
            cursor.execute("""
            INSERT INTO organization_members (id, org_id, user_id, role)
            VALUES (?, ?, ?, 'owner');
            """, (f"mem_{uuid.uuid4().hex[:8]}", org_id, creator_user_id))

            conn.commit()

        # Initialize tenant SQLite database with tables & seed units
        get_tenant_connection(org_id)

        return TenancyService.get_organization(org_id)

    @staticmethod
    def list_members(org_id: str) -> List[MemberResponse]:
        with get_master_connection() as conn:
            cursor = conn.cursor()
            query = """
            SELECT om.id, om.user_id, om.role, om.joined_at, u.email, u.full_name
            FROM organization_members om
            JOIN users u ON om.user_id = u.id
            WHERE om.org_id = ?
            ORDER BY om.joined_at ASC;
            """
            rows = cursor.execute(query, (org_id,)).fetchall()
            return [
                MemberResponse(
                    id=r["id"],
                    user_id=r["user_id"],
                    email=r["email"],
                    full_name=r["full_name"],
                    role=r["role"],
                    joined_at=str(r["joined_at"]),
                )
                for r in rows
            ]

    @staticmethod
    def add_member(org_id: str, email: str, full_name: Optional[str] = None, role: str = "member") -> MemberResponse:
        with get_master_connection() as conn:
            cursor = conn.cursor()

            # Check if user exists or create them
            user = cursor.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
            if not user:
                user_id = f"user_{uuid.uuid4().hex[:8]}"
                name = full_name or email.split("@")[0].capitalize()
                cursor.execute("""
                INSERT INTO users (id, email, full_name, avatar_url)
                VALUES (?, ?, ?, ?);
                """, (user_id, email, name, f"https://avatar.vercel.sh/{email}"))
            else:
                user_id = user["id"]
                name = user["full_name"]

            # Check if already member
            existing = cursor.execute(
                "SELECT * FROM organization_members WHERE org_id = ? AND user_id = ?",
                (org_id, user_id)
            ).fetchone()
            if existing:
                raise HTTPException(status_code=400, detail="User is already a member of this organization")

            mem_id = f"mem_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
            INSERT INTO organization_members (id, org_id, user_id, role)
            VALUES (?, ?, ?, ?);
            """, (mem_id, org_id, user_id, role))

            conn.commit()

            return MemberResponse(
                id=mem_id,
                user_id=user_id,
                email=email,
                full_name=name,
                role=role,
                joined_at="Just now",
            )

    @staticmethod
    def remove_member(org_id: str, user_id: str):
        with get_master_connection() as conn:
            cursor = conn.cursor()
            # Prevent removing last owner
            owners = cursor.execute(
                "SELECT * FROM organization_members WHERE org_id = ? AND role = 'owner'",
                (org_id,)
            ).fetchall()
            if len(owners) == 1 and owners[0]["user_id"] == user_id:
                raise HTTPException(status_code=400, detail="Cannot remove the sole owner of an organization")

            cursor.execute(
                "DELETE FROM organization_members WHERE org_id = ? AND user_id = ?",
                (org_id, user_id)
            )
            conn.commit()

    @staticmethod
    def list_plans() -> List[PlanResponse]:
        with get_master_connection() as conn:
            cursor = conn.cursor()
            rows = cursor.execute("SELECT * FROM plans ORDER BY price_monthly ASC;").fetchall()
            return [
                PlanResponse(
                    id=r["id"],
                    name=r["name"],
                    price_monthly=r["price_monthly"],
                    credits_monthly=r["credits_monthly"],
                    max_members=r["max_members"],
                    features=json.loads(r["features_json"]),
                )
                for r in rows
            ]

    @staticmethod
    def change_plan(org_id: str, new_plan_id: str) -> BillingSummaryResponse:
        with get_master_connection() as conn:
            cursor = conn.cursor()
            plan = cursor.execute("SELECT * FROM plans WHERE id = ?", (new_plan_id,)).fetchone()
            if not plan:
                raise HTTPException(status_code=404, detail="Plan does not exist")

            cursor.execute("""
            UPDATE organizations
            SET plan_id = ?, credits_limit = ?
            WHERE id = ?;
            """, (new_plan_id, plan["credits_monthly"], org_id))

            # Record billing invoice
            invoice_id = f"inv_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
            INSERT INTO billing_invoices (id, org_id, plan_id, amount, status)
            VALUES (?, ?, ?, ?, 'paid');
            """, (invoice_id, org_id, new_plan_id, plan["price_monthly"]))

            conn.commit()

        return TenancyService.get_billing_summary(org_id)

    @staticmethod
    def get_billing_summary(org_id: str) -> BillingSummaryResponse:
        with get_master_connection() as conn:
            cursor = conn.cursor()
            org = cursor.execute("SELECT * FROM organizations WHERE id = ?", (org_id,)).fetchone()
            if not org:
                raise HTTPException(status_code=404, detail="Organization not found")

            plan = cursor.execute("SELECT * FROM plans WHERE id = ?", (org["plan_id"],)).fetchone()
            member_count = cursor.execute(
                "SELECT COUNT(*) as cnt FROM organization_members WHERE org_id = ?",
                (org_id,)
            ).fetchone()["cnt"]

            credits_limit = org["credits_limit"] or 20000
            credits_used = org["credits_used"] or 0
            pct = round((credits_used / credits_limit) * 100, 1) if credits_limit > 0 else 0

            return BillingSummaryResponse(
                org_id=org["id"],
                plan_id=plan["id"],
                plan_name=plan["name"],
                price_monthly=plan["price_monthly"],
                credits_used=credits_used,
                credits_limit=credits_limit,
                credits_percent=pct,
                member_count=member_count,
                max_members=plan["max_members"],
                features=json.loads(plan["features_json"]),
            )

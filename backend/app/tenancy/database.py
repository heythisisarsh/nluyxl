"""Multi-Tenant SQLite Database Manager (Database-per-Tenant Architecture).

Maintains:
1. Master DB (`data/master.db`): Organizations, Users, Membership, Plans, Billing.
2. Tenant DBs (`data/tenants/{org_id}.db`): Isolated per-tenant workspaces, jobs, units, audit logs.
"""

import os
import sqlite3
import json
import uuid
from typing import Optional, Dict, Any, List
from contextlib import contextmanager
import logging

logger = logging.getLogger("nluyxl.tenancy")

BASE_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
TENANTS_DIR = os.path.join(BASE_DATA_DIR, "tenants")
MASTER_DB_PATH = os.path.join(BASE_DATA_DIR, "master.db")

os.makedirs(TENANTS_DIR, exist_ok=True)


def get_master_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(MASTER_DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def get_tenant_connection(org_id: str) -> sqlite3.Connection:
    tenant_db_path = os.path.join(TENANTS_DIR, f"{org_id}.db")
    is_new = not os.path.exists(tenant_db_path)
    conn = sqlite3.connect(tenant_db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    if is_new:
        init_tenant_schema(conn, org_id)
    return conn


def init_master_schema():
    """Initializes master database with organizations, users, plans, and billing."""
    with get_master_connection() as conn:
        cursor = conn.cursor()
        
        # Organizations
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS organizations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            plan_id TEXT NOT NULL DEFAULT 'free',
            credits_used INTEGER NOT NULL DEFAULT 0,
            credits_limit INTEGER NOT NULL DEFAULT 20000,
            db_path TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Users
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Organization Members (Many-to-Many with roles)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS organization_members (
            id TEXT PRIMARY KEY,
            org_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(org_id, user_id)
        );
        """)

        # Billing Plans
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plans (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price_monthly REAL NOT NULL,
            credits_monthly INTEGER NOT NULL,
            max_members INTEGER NOT NULL,
            features_json TEXT NOT NULL
        );
        """)

        # Billing Subscriptions & Invoices
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS billing_invoices (
            id TEXT PRIMARY KEY,
            org_id TEXT NOT NULL,
            plan_id TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT NOT NULL,
            period_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            period_end TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
        );
        """)

        # Seed standard plans
        plans_data = [
            ("free", "Starter Free", 0.0, 20000, 3, json.dumps(["20,000 AI Credits", "Up to 3 Team Members", "Community Support", "Basic Background Routines"])),
            ("starter", "Team Growth", 29.0, 100000, 10, json.dumps(["100,000 AI Credits", "Up to 10 Team Members", "Slack & Gmail Automations", "High-Priority Execution"])),
            ("pro", "Business Pro", 79.0, 500000, 25, json.dumps(["500,000 AI Credits", "Up to 25 Team Members", "Full QuickBooks & Stripe Integration", "Dedicated Celery Worker Queue", "Audit Logging"])),
            ("enterprise", "Autonomous Enterprise", 299.0, 2500000, 100, json.dumps(["2,500,000 AI Credits", "Unlimited Team Members", "Custom Synthetic App Compiler", "FIPS 140-2 KMS Vault Encryption", "99.9% Uptime SLA"]))
        ]
        cursor.executemany("""
        INSERT OR IGNORE INTO plans (id, name, price_monthly, credits_monthly, max_members, features_json)
        VALUES (?, ?, ?, ?, ?, ?);
        """, plans_data)

        # Seed default Hashira organization & Arshin user
        cursor.execute("SELECT id FROM organizations WHERE slug = 'hashira';")
        if not cursor.fetchone():
            default_org_id = "org_hashira"
            default_user_id = "user_arshin"
            
            cursor.execute("""
            INSERT INTO organizations (id, name, slug, plan_id, credits_used, credits_limit, db_path)
            VALUES (?, ?, ?, 'free', 1580, 20000, ?);
            """, (default_org_id, "Hashira", "hashira", os.path.join(TENANTS_DIR, f"{default_org_id}.db")))

            cursor.execute("""
            INSERT OR IGNORE INTO users (id, email, full_name, avatar_url)
            VALUES (?, ?, ?, ?);
            """, (default_user_id, "arshinalbab@gmail.com", "Arshin", "https://avatar.vercel.sh/arshin"))

            cursor.execute("""
            INSERT OR IGNORE INTO organization_members (id, org_id, user_id, role)
            VALUES (?, ?, ?, 'owner');
            """, (f"mem_{uuid.uuid4().hex[:8]}", default_org_id, default_user_id))

            # Also seed a second demo org "Acme Dynamics" to prove multi-tenancy separation
            acme_org_id = "org_acme"
            cursor.execute("""
            INSERT INTO organizations (id, name, slug, plan_id, credits_used, credits_limit, db_path)
            VALUES (?, ?, ?, 'starter', 12400, 100000, ?);
            """, (acme_org_id, "Acme Dynamics", "acme", os.path.join(TENANTS_DIR, f"{acme_org_id}.db")))

            cursor.execute("""
            INSERT OR IGNORE INTO organization_members (id, org_id, user_id, role)
            VALUES (?, ?, ?, 'admin');
            """, (f"mem_{uuid.uuid4().hex[:8]}", acme_org_id, default_user_id))

            conn.commit()
            logger.info("Initialized Master database with Hashira & Acme organizations.")

    # Ensure default tenant databases are initialized
    get_tenant_connection("org_hashira")
    get_tenant_connection("org_acme")


def init_tenant_schema(conn: sqlite3.Connection, org_id: str):
    """Initializes isolated tables for a specific tenant's SQLite database."""
    cursor = conn.cursor()
    cursor.executescript(f"""
    CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        org_id TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS unit_layout (
        id TEXT PRIMARY KEY,
        unit_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        x INTEGER NOT NULL DEFAULT 0,
        y INTEGER NOT NULL DEFAULT 0,
        w INTEGER NOT NULL DEFAULT 4,
        h INTEGER NOT NULL DEFAULT 2,
        metadata_json TEXT DEFAULT '{{}}'
    );

    CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        account_identifier TEXT,
        status TEXT NOT NULL DEFAULT 'disconnected', -- connected, disconnected
        encrypted_payload TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        instruction TEXT NOT NULL,
        cron_expression TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active', -- active, paused, approval_required
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_runs (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        status TEXT NOT NULL,
        execution_time_seconds REAL,
        output_summary TEXT,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS security_audit_logs (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        actor_email TEXT,
        ip_address TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed default tenant data
    cursor.execute("SELECT id FROM workspaces;")
    if not cursor.fetchone():
        ws_id = f"ws_{org_id}"
        cursor.execute("INSERT INTO workspaces (id, org_id, name) VALUES (?, ?, ?);",
                       (ws_id, org_id, f"{org_id.replace('org_', '').capitalize()} Primary Workspace"))

        # Seed sample units
        sample_units = [
            ("unit_1", "unit_invoicing", "Weekly Invoicing Routine", "finance", 0, 0, 4, 2),
            ("unit_2", "unit_calendar", "Calendar Sync & Briefing", "operations", 4, 0, 4, 2),
            ("unit_3", "unit_metrics", "ARR & Cashflow Overview", "finance", 8, 0, 4, 2),
        ]
        cursor.executemany("""
        INSERT INTO unit_layout (id, unit_id, title, category, x, y, w, h)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, sample_units)

        # Seed default jobs
        sample_jobs = [
            ("job_001", "Chase Overdue Invoices", "Scan accounting records and draft reminder sequence.", "0 8 * * 1", "active"),
            ("job_002", "Daily Executive Financial Pulse", "Aggregate revenue and banking changes.", "0 9 * * *", "active"),
        ]
        cursor.executemany("""
        INSERT INTO jobs (id, title, instruction, cron_expression, status)
        VALUES (?, ?, ?, ?, ?);
        """, sample_jobs)

        # Seed default connections
        sample_conns = [
            ("conn_qb", "quickbooks", "Realm ID: 93847291", "connected"),
            ("conn_gcal", "google_calendar", "team@hashira.corp", "connected"),
            ("conn_gmail", "gmail", "team@hashira.corp", "connected"),
            ("conn_stripe", "stripe", "acct_1948270192847", "connected"),
            ("conn_slack", "slack", "Hashira Team (#alerts)", "connected"),
        ]
        cursor.executemany("""
        INSERT INTO connections (id, provider, account_identifier, status)
        VALUES (?, ?, ?, ?);
        """, sample_conns)

        conn.commit()
        logger.info(f"Initialized isolated tenant schema and seed data for {org_id}.")

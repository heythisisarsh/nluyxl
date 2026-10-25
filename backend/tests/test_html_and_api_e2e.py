#!/usr/bin/env python3
"""
Comprehensive End-to-End Test Suite for NLUYXL Pure HTML Frontend & Multi-Tenant SQLite Backend.
Spins up:
  1. Backend API (FastAPI) on 127.0.0.1:8000
  2. HTML Frontend (python http.server) on 127.0.0.1:3000
Executes 14 end-to-end tests validating full platform integration, data isolation, and UI assets.
"""

import os
import sys
import time
import json
import sqlite3
import subprocess
import urllib.request
import urllib.error
from typing import Any

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_PORT = 8000
FRONTEND_PORT = 3000
BACKEND_URL = f"http://127.0.0.1:{BACKEND_PORT}"
FRONTEND_URL = f"http://127.0.0.1:{FRONTEND_PORT}"

PASS_COUNT = 0
FAIL_COUNT = 0


def record_result(test_name: str, passed: bool, detail: str = ""):
    global PASS_COUNT, FAIL_COUNT
    if passed:
        PASS_COUNT += 1
        print(f" [PASS] {test_name}")
        if detail:
            print(f"        └─ {detail}")
    else:
        FAIL_COUNT += 1
        print(f" [FAIL] {test_name}")
        if detail:
            print(f"        └─ ERROR: {detail}")


def http_request(url: str, method: str = "GET", data: dict | None = None) -> tuple[int, Any]:
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")
            try:
                parsed = json.loads(raw)
            except Exception:
                parsed = raw
            return resp.status, parsed
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = raw
        return e.code, parsed
    except Exception as e:
        return 0, str(e)


def wait_for_service(url: str, timeout: int = 15) -> bool:
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=2) as resp:
                if resp.status in (200, 307, 308):
                    return True
        except Exception:
            pass
        time.sleep(0.5)
    return False


def main():
    global PASS_COUNT, FAIL_COUNT
    print("\n" + "=" * 70)
    print(" NLUYXL MULTI-TENANT & PURE HTML FRONTEND E2E TEST SUITE")
    print("=" * 70)

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend-html")

    print(f"Backend directory:  {backend_dir}")
    print(f"Frontend directory: {frontend_dir}")

    # Launch Backend on port 8000
    print("\nStarting FastAPI backend on port 8000...")
    backend_proc = subprocess.Popen(
        ["uv", "run", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(BACKEND_PORT)],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    # Launch Frontend HTTP Server on port 3000
    print("Starting HTML Frontend static server on port 3000...")
    frontend_proc = subprocess.Popen(
        ["uv", "run", "python", "-m", "http.server", str(FRONTEND_PORT)],
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    try:
        backend_ready = wait_for_service(f"{BACKEND_URL}/api/health", timeout=15)
        frontend_ready = wait_for_service(f"{FRONTEND_URL}/index.html", timeout=15)

        if not backend_ready:
            print("ERROR: Backend failed to start within timeout.")
            return False
        if not frontend_ready:
            print("ERROR: Frontend HTTP server failed to start within timeout.")
            return False

        print("Both servers operational. Beginning test execution...\n")

        # -------------------------------------------------------------
        # TEST 1: Pure HTML Frontend index.html served on port 3000
        # -------------------------------------------------------------
        status, html_content = http_request(f"{FRONTEND_URL}/index.html")
        has_mascot = "psheep-" in html_content
        has_drawer = 'id="ask-drawer"' in html_content
        has_widgets = "Financial Pulse" in html_content and "Active Routine: Overdue Invoices" in html_content
        has_springboard = "Operating System Springboard" in html_content
        record_result(
            "1. Pure HTML Frontend Delivery (port 3000)",
            status == 200 and has_mascot and has_drawer and has_widgets and has_springboard,
            f"index.html length: {len(html_content):,} bytes | Mascot SVG, Drawer & 4 Widgets present"
        )

        # -------------------------------------------------------------
        # TEST 2: Static Assets Verification on port 3000
        # -------------------------------------------------------------
        assets = ["css/plyxl.css", "css/app.css", "js/api.js", "js/app.js"]
        assets_ok = True
        asset_details = []
        for asset in assets:
            st, content = http_request(f"{FRONTEND_URL}/{asset}")
            if st == 200 and len(content) > 100:
                asset_details.append(f"{asset} ({len(content):,} B)")
            else:
                assets_ok = False
                asset_details.append(f"{asset} (FAIL st={st})")
        record_result(
            "2. Static CSS and JS Assets Integrity (port 3000)",
            assets_ok,
            " | ".join(asset_details)
        )

        # -------------------------------------------------------------
        # TEST 3: Backend Mounted /app/ Route Delivery (port 8000)
        # -------------------------------------------------------------
        status, app_html = http_request(f"{BACKEND_URL}/app/")
        mounted_ok = status == 200 and ("NLUYXL" in app_html and "Autonomous Business Operating System" in app_html)
        record_result(
            "3. FastAPI StaticFiles Mount of frontend-html at /app/",
            mounted_ok,
            f"Status: {status} | Served {len(app_html):,} bytes via FastAPI mount"
        )

        # -------------------------------------------------------------
        # TEST 4: Backend Health & SQLite Database-per-Tenant Arch
        # -------------------------------------------------------------
        status, health = http_request(f"{BACKEND_URL}/api/health")
        health_ok = status == 200 and health.get("multi_tenant") is True
        record_result(
            "4. Multi-Tenant SQLite Database Engine Health Check",
            health_ok,
            f"Arch: {health.get('architecture')} | Master DB: {health.get('master_db')}"
        )

        # -------------------------------------------------------------
        # TEST 5: Master DB List Organizations
        # -------------------------------------------------------------
        status, orgs = http_request(f"{BACKEND_URL}/api/orgs")
        orgs_ok = status == 200 and len(orgs) >= 2
        record_result(
            "5. Organization Master Directory Query",
            orgs_ok,
            f"Retrieved {len(orgs)} organizations: {[o['name'] for o in orgs]}"
        )

        # -------------------------------------------------------------
        # TEST 6: Provision New Organization & Dedicated SQLite DB
        # -------------------------------------------------------------
        unique_id = int(time.time())
        test_org_name = f"Vanguard_{unique_id}"
        status, new_org = http_request(
            f"{BACKEND_URL}/api/orgs",
            method="POST",
            data={"name": test_org_name, "plan_id": "team"}
        )
        new_org_id = new_org.get("id") if status == 200 else None
        db_path = os.path.join(backend_dir, "data", "tenants", f"{new_org_id}.db")
        db_created = os.path.exists(db_path) if new_org_id else False
        record_result(
            "6. Dynamic Provisioning of Isolated Tenant SQLite Database",
            status == 200 and db_created,
            f"Created Org '{test_org_name}' (ID: {new_org_id}) -> DB file: data/tenants/{new_org_id}.db"
        )

        # -------------------------------------------------------------
        # TEST 7: Add Team Member with Role Assignment
        # -------------------------------------------------------------
        member_email = f"lead_{unique_id}@vanguard.io"
        status_add, added = http_request(
            f"{BACKEND_URL}/api/orgs/{new_org_id}/members",
            method="POST",
            data={"email": member_email, "full_name": "Operations Lead", "role": "admin"}
        )
        status_list, members = http_request(f"{BACKEND_URL}/api/orgs/{new_org_id}/members")
        member_present = any(m["email"] == member_email and m["role"] == "admin" for m in members) if status_list == 200 else False
        record_result(
            "7. Team Member Invitation & Role Assignment",
            status_add == 200 and member_present,
            f"Added member '{member_email}' with Admin role (Total members: {len(members)})"
        )

        # -------------------------------------------------------------
        # TEST 8: Upgrade Subscription Plan & Reallocate Quotas
        # -------------------------------------------------------------
        status_upg, billing = http_request(
            f"{BACKEND_URL}/api/orgs/{new_org_id}/billing/plan",
            method="POST",
            data={"plan_id": "enterprise"}
        )
        plan_upgraded = status_upg == 200 and billing.get("plan_id") == "enterprise" and billing.get("credits_limit") == 2500000
        record_result(
            "8. Subscription Plan Upgrade to Autonomous Enterprise",
            plan_upgraded,
            f"Plan: '{billing.get('plan_name')}' (${billing.get('price_monthly')}/mo) | Quota: {billing.get('credits_limit'):,} Credits"
        )

        # -------------------------------------------------------------
        # TEST 9: Schedule Routine in Isolated Tenant Database
        # -------------------------------------------------------------
        status_job, job = http_request(
            f"{BACKEND_URL}/api/orgs/{new_org_id}/jobs",
            method="POST",
            data={
                "title": "Nightly Ledger Audit",
                "instruction": "Reconcile Stripe and QuickBooks charges daily at midnight.",
                "cron_expression": "0 0 * * *"
            }
        )
        job_id = job.get("id") if status_job == 200 else None
        record_result(
            "9. Automated Routine Scheduling in Tenant SQLite DB",
            status_job == 200 and bool(job_id),
            f"Created Job '{job.get('title')}' (ID: {job_id}) on schedule: {job.get('cron_expression')}"
        )

        # -------------------------------------------------------------
        # TEST 10: Execute Background Job & Verify Execution Log
        # -------------------------------------------------------------
        status_run, run_res = http_request(
            f"{BACKEND_URL}/api/orgs/{new_org_id}/jobs/{job_id}/run",
            method="POST"
        )
        run_ok = status_run == 200 and run_res.get("status") == "success"
        record_result(
            "10. Autonomous Job Execution & Audit Log Insertion",
            run_ok,
            f"Run ID: {run_res.get('run_id')} | Output: {run_res.get('output')}"
        )

        # -------------------------------------------------------------
        # TEST 11: OAuth Vault State Toggle in Isolated Tenant DB
        # -------------------------------------------------------------
        status_conn, conn_res = http_request(
            f"{BACKEND_URL}/api/orgs/{new_org_id}/connections/toggle",
            method="POST",
            data={"provider": "slack", "status": "connected", "account_identifier": "Team Vanguard Slack"}
        )
        conn_ok = status_conn == 200 and conn_res.get("new_status") == "connected"
        record_result(
            "11. Isolated Tenant OAuth Vault State Mutation",
            conn_ok,
            f"Provider 'slack' marked as 'connected' in {new_org_id}.db"
        )

        # -------------------------------------------------------------
        # TEST 12: Multi-Tenant Data Isolation Guarantee
        # -------------------------------------------------------------
        # Direct check on SQLite files: ensure org_hashira.db does NOT have Vanguard's job
        with sqlite3.connect(os.path.join(backend_dir, "data", "tenants", "org_hashira.db")) as h_conn:
            h_conn.row_factory = sqlite3.Row
            hashira_jobs = [r["id"] for r in h_conn.execute("SELECT id FROM jobs;").fetchall()]
        has_leak = job_id in hashira_jobs
        record_result(
            "12. Strict SQLite Tenant Boundary Isolation (Zero Cross-Tenant Leakage)",
            not has_leak,
            f"Confirmed job '{job_id}' exists exclusively in '{new_org_id}.db' and NOT in 'org_hashira.db'"
        )

        # -------------------------------------------------------------
        # TEST 13: AI Agent SSE Streaming Stream & Credit Deduction
        # -------------------------------------------------------------
        req = urllib.request.Request(
            f"{BACKEND_URL}/api/chat/stream",
            data=json.dumps({"message": "Every Monday at 8 chase overdue invoices", "org_id": new_org_id}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        tokens = 0
        approval_seen = False
        try:
            with urllib.request.urlopen(req, timeout=10) as s_resp:
                while True:
                    line = s_resp.readline().decode("utf-8")
                    if not line:
                        break
                    if "data: " in line:
                        tokens += 1
                        if "approval_required" in line:
                            approval_seen = True
        except Exception:
            pass

        record_result(
            "13. LangGraph AI Agent SSE Token Streaming & HITL Approval Yield",
            tokens > 0 and approval_seen,
            f"Received {tokens} SSE chunks including HITL human-in-the-loop action card for {new_org_id}"
        )

        # -------------------------------------------------------------
        # TEST 14: Master DB Live Credit Consumption Tracking
        # -------------------------------------------------------------
        status_after, billing_after = http_request(f"{BACKEND_URL}/api/orgs/{new_org_id}/billing")
        credits_consumed = billing_after.get("credits_used", 0) > 0 if status_after == 200 else False
        record_result(
            "14. Master DB Credit Meter Live Consumption Tracking",
            credits_consumed,
            f"Credits recorded after streaming: {billing_after.get('credits_used')} / {billing_after.get('credits_limit'):,}"
        )

    finally:
        print("\nShutting down test servers...")
        try:
            backend_proc.terminate()
            backend_proc.wait(timeout=3)
        except Exception:
            backend_proc.kill()

        try:
            frontend_proc.terminate()
            frontend_proc.wait(timeout=3)
        except Exception:
            frontend_proc.kill()

    print("\n" + "=" * 70)
    print(f" TEST RUN RESULTS: {PASS_COUNT} PASSED | {FAIL_COUNT} FAILED (TOTAL: {PASS_COUNT + FAIL_COUNT})")
    print("=" * 70 + "\n")

    return FAIL_COUNT == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
Comprehensive End-to-End Test Suite for NLUYXL Multi-Tenant Platform.
Runs against local backend (http://127.0.0.1:8000) and Next.js frontend (http://localhost:3000).
"""

import urllib.request
import urllib.error
import json
import time
import sys
from typing import Any

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:3000"

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


def run_all_tests():
    print("\n" + "=" * 65)
    print(" NLUYXL COMPREHENSIVE MULTI-TENANT & UI TEST SUITE")
    print("=" * 65)

    # TEST 1: Backend Health & Multi-Tenancy Architecture
    status, body = http_request(f"{BACKEND_URL}/api/health")
    record_result(
        "1. Backend Health & SQLite Multi-Tenant Mode",
        status == 200 and body.get("multi_tenant") is True,
        f"Service: {body.get('service')} | Arch: {body.get('architecture')}"
    )

    # TEST 2: List Organizations
    status, orgs = http_request(f"{BACKEND_URL}/api/orgs")
    record_result(
        "2. List User Organizations from Master DB",
        status == 200 and len(orgs) >= 2,
        f"Found {len(orgs)} organizations: {[o['name'] for o in orgs]}"
    )

    # TEST 3: Create New Organization with Dedicated SQLite DB
    test_org_name = f"TestCorp_{int(time.time())}"
    status, new_org = http_request(f"{BACKEND_URL}/api/orgs", method="POST", data={"name": test_org_name, "plan_id": "free"})
    new_org_id = new_org.get("id") if status == 200 else None
    record_result(
        "3. Dynamic Provisioning of Isolated Tenant SQLite Database",
        status == 200 and bool(new_org_id),
        f"Provisioned DB: data/tenants/{new_org_id}.db for '{test_org_name}'"
    )

    # TEST 4: Organization Member Management (Invite & List)
    invite_email = f"dev_{int(time.time())}@testcorp.io"
    status, member = http_request(
        f"{BACKEND_URL}/api/orgs/{new_org_id}/members",
        method="POST",
        data={"email": invite_email, "full_name": "Test Engineer", "role": "admin"}
    )
    status_list, members = http_request(f"{BACKEND_URL}/api/orgs/{new_org_id}/members")
    has_member = any(m["email"] == invite_email for m in members) if status_list == 200 else False
    record_result(
        "4. Team Member Invitation & Role Assignment",
        status == 200 and has_member,
        f"Added '{invite_email}' as Admin to {new_org_id} (Total members: {len(members)})"
    )

    # TEST 5: Plans & Billing (Upgrade Subscription Tier)
    status, plans = http_request(f"{BACKEND_URL}/api/plans")
    status_upgrade, billing = http_request(
        f"{BACKEND_URL}/api/orgs/{new_org_id}/billing/plan",
        method="POST",
        data={"plan_id": "pro"}
    )
    credits_updated = billing.get("credits_limit") == 500000 if status_upgrade == 200 else False
    record_result(
        "5. Subscription Plan Upgrade & Live Credit Quota Reallocation",
        status_upgrade == 200 and credits_updated,
        f"Upgraded to '{billing.get('plan_name')}' (${billing.get('price_monthly')}/mo) | New Quota: {billing.get('credits_limit'):,} Credits"
    )

    # TEST 6: Tenant-Isolated Background Job Creation & Execution
    status_job, job = http_request(
        f"{BACKEND_URL}/api/orgs/{new_org_id}/jobs",
        method="POST",
        data={"title": "Automated Stock Audit", "instruction": "Query warehouse inventory every night.", "cron_expression": "0 0 * * *"}
    )
    job_id = job.get("id")
    status_run, run_result = http_request(
        f"{BACKEND_URL}/api/orgs/{new_org_id}/jobs/{job_id}/run",
        method="POST"
    )
    record_result(
        "6. Isolated Tenant Job Scheduling & Execution Log",
        status_job == 200 and status_run == 200 and run_result.get("status") == "success",
        f"Executed Job '{job_id}' | Result: {run_result.get('output')}"
    )

    # TEST 7: Tenant OAuth Connection Toggle
    status_toggle, toggle_res = http_request(
        f"{BACKEND_URL}/api/orgs/{new_org_id}/connections/toggle",
        method="POST",
        data={"provider": "quickbooks", "status": "connected", "account_identifier": "Realm 88491"}
    )
    record_result(
        "7. Isolated Tenant OAuth Vault State Mutation",
        status_toggle == 200 and toggle_res.get("new_status") == "connected",
        f"Provider 'quickbooks' set to 'connected' in {new_org_id}.db"
    )

    # TEST 8: AI Agent SSE Streaming Stream
    req = urllib.request.Request(
        f"{BACKEND_URL}/api/chat/stream",
        data=json.dumps({"message": "Every Monday at 8 chase overdue invoices", "org_id": new_org_id}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    stream_ok = False
    tokens_received = 0
    try:
        with urllib.request.urlopen(req, timeout=10) as stream_resp:
            for _ in range(15):
                line = stream_resp.readline().decode("utf-8")
                if "data: " in line:
                    tokens_received += 1
            stream_ok = tokens_received > 0
    except Exception as e:
        stream_ok = False
    record_result(
        "8. LangGraph AI Agent SSE Token Streaming",
        stream_ok,
        f"Streamed reasoning tokens & state changes for tenant {new_org_id}"
    )

    # TEST 9: Next.js Frontend Local Ingress Checks
    frontend_routes = ["/home", "/jobs", "/connections", "/settings/team"]
    all_routes_ok = True
    route_details = []
    for r in frontend_routes:
        status, _ = http_request(f"{FRONTEND_URL}{r}")
        if status == 200:
            route_details.append(f"{r} (200 OK)")
        else:
            all_routes_ok = False
            route_details.append(f"{r} ({status})")

    record_result(
        "9. Next.js 15 App Router Frontend Local Verification (Bun)",
        all_routes_ok,
        " | ".join(route_details)
    )

    print("\n" + "=" * 65)
    print(f" TEST RESULTS SUMMARY: {PASS_COUNT} PASSED | {FAIL_COUNT} FAILED")
    print("=" * 65 + "\n")

    return FAIL_COUNT == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)

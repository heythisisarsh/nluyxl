/**
 * NLUYXL Lightweight Client API connector for FastAPI backend.
 */
const API_BASE = (typeof window !== "undefined" && window.location.origin.includes(":8000"))
  ? `${window.location.origin}/api`
  : "http://127.0.0.1:8000/api";


const API = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getOrgs() {
    const res = await fetch(`${API_BASE}/orgs`);
    return res.json();
  },

  async createOrg(name, plan_id = "free") {
    const res = await fetch(`${API_BASE}/orgs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, plan_id }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to create org");
    return res.json();
  },

  async getMembers(orgId) {
    const res = await fetch(`${API_BASE}/orgs/${orgId}/members`);
    return res.json();
  },

  async addMember(orgId, email, full_name, role = "member") {
    const res = await fetch(`${API_BASE}/orgs/${orgId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, full_name, role }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to add member");
    return res.json();
  },

  async removeMember(orgId, userId) {
    const res = await fetch(`${API_BASE}/orgs/${orgId}/members/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove member");
    return res.json();
  },

  async getPlans() {
    const res = await fetch(`${API_BASE}/plans`);
    return res.json();
  },

  async getBilling(orgId) {
    const res = await fetch(`${API_BASE}/orgs/${orgId}/billing`);
    return res.json();
  },

  async changePlan(orgId, plan_id) {
    const res = await fetch(`${API_BASE}/orgs/${orgId}/billing/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id }),
    });
    if (!res.ok) throw new Error("Failed to update plan");
    return res.json();
  },

  async getJobs(orgId) {
    const res = await fetch(`${API_BASE}/orgs/${orgId}/jobs`);
    return res.json();
  },

  async createJob(orgId, title, instruction, cron_expression = "0 8 * * 1") {
    const res = await fetch(`${API_BASE}/orgs/${orgId}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, instruction, cron_expression }),
    });
    if (!res.ok) throw new Error("Failed to create job");
    return res.json();
  },

  async runJob(orgId, jobId) {
    const res = await fetch(`${API_BASE}/orgs/${orgId}/jobs/${jobId}/run`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to run job");
    return res.json();
  },

  async getConnections(orgId) {
    const res = await fetch(`${API_BASE}/orgs/${orgId}/connections`);
    return res.json();
  },

  async toggleConnection(orgId, provider, status) {
    const res = await fetch(`${API_BASE}/orgs/${orgId}/connections/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, status }),
    });
    if (!res.ok) throw new Error("Failed to toggle connection");
    return res.json();
  },

  async streamChat(message, orgId, onToken, onStatus, onApproval, onDone) {
    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        org_id: orgId,
        workspace_id: `ws_${orgId}`,
      }),
    });

    if (!res.body) throw new Error("ReadableStream not supported");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "token") onToken(data.token);
            else if (data.type === "status" || data.type === "state_change") onStatus(data.status, data.message);
            else if (data.type === "approval_required") onApproval(data.card);
            else if (data.type === "done") onDone();
          } catch (e) {
            // ignore partial line parse
          }
        }
      }
    }
  },
};

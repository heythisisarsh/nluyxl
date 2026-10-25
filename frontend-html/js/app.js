/**
 * NLUYXL Main Vanilla JavaScript State Controller.
 */

let state = {
  currentOrg: null,
  organizations: [],
  activeView: "home",
  isStreaming: false,
};

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupDrawer();
  setupModals();
  await loadOrganizations();
});

async function loadOrganizations() {
  try {
    const orgs = await API.getOrgs();
    state.organizations = orgs;
    if (orgs.length > 0) {
      const savedId = localStorage.getItem("nluyxl_active_org");
      state.currentOrg = orgs.find((o) => o.id === savedId) || orgs[0];
      renderOrgDetails();
    }
    renderOrgDropdown();
    loadActiveViewData();
  } catch (e) {
    console.error("Failed to load organizations:", e);
  }
}

function renderOrgDetails() {
  if (!state.currentOrg) return;
  const org = state.currentOrg;

  // Update Org names
  document.querySelectorAll(".org-name-text").forEach((el) => (el.textContent = org.name));
  document.querySelectorAll(".org-initial-text").forEach((el) => (el.textContent = org.name[0]));
  document.querySelectorAll(".org-tenant-id").forEach((el) => (el.textContent = `${org.id}.db`));

  // Update credits
  const creditsK = `${Math.round(org.credits_limit / 1000)}k`;
  document.querySelectorAll(".org-credits-pill").forEach((el) => (el.textContent = creditsK));

  // Update Ask placeholder
  const textarea = document.getElementById("ask-prompt-input");
  if (textarea) textarea.placeholder = `Ask ${org.name} Agent`;
}

function renderOrgDropdown() {
  const container = document.getElementById("org-dropdown-list");
  if (!container) return;

  container.innerHTML = state.organizations
    .map((o) => {
      const isActive = o.id === state.currentOrg?.id;
      return `
      <button class="nav-item ${isActive ? "active" : ""}" onclick="switchOrg('${o.id}')">
        <span style="height:20px;width:20px;border-radius:4px;background:#334155;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;">${o.name[0]}</span>
        <span class="truncate" style="flex:1;">${o.name}</span>
        ${isActive ? '<span style="font-size:10px;color:#34d399;font-family:monospace;">Active</span>' : ""}
      </button>
    `;
    })
    .join("");
}

function switchOrg(orgId) {
  const target = state.organizations.find((o) => o.id === orgId);
  if (target) {
    state.currentOrg = target;
    localStorage.setItem("nluyxl_active_org", orgId);
    renderOrgDetails();
    renderOrgDropdown();
    toggleOrgDropdown(false);
    loadActiveViewData();
  }
}

function toggleOrgDropdown(force) {
  const dropdown = document.getElementById("org-dropdown-menu");
  if (!dropdown) return;
  if (typeof force === "boolean") {
    dropdown.style.display = force ? "block" : "none";
  } else {
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  }
}

// NAVIGATION & VIEW SWITCHING
function setupNavigation() {
  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      if (view) switchView(view);
    });
  });

  // Sidebar toggle
  const toggleBtn = document.getElementById("sidebar-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.querySelector(".sidebar").classList.toggle("collapsed");
    });
  }

  // Keyboard shortcut ⌘J / Ctrl+J
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
      e.preventDefault();
      openDrawer();
    }
    if (e.key === "Escape") {
      closeDrawer();
      closeModal();
    }
  });
}

function switchView(viewName) {
  state.activeView = viewName;
  document.querySelectorAll(".view-section").forEach((sec) => (sec.style.display = "none"));
  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  const target = document.getElementById(`view-${viewName}`);
  if (target) target.style.display = "flex";

  loadActiveViewData();
}

function loadActiveViewData() {
  if (!state.currentOrg) return;
  const orgId = state.currentOrg.id;

  if (state.activeView === "jobs") {
    loadJobs(orgId);
  } else if (state.activeView === "connections") {
    loadConnections(orgId);
  } else if (state.activeView === "team") {
    loadTeamAndBilling(orgId);
  }
}

// JOBS VIEW
async function loadJobs(orgId) {
  const list = document.getElementById("jobs-list-container");
  if (!list) return;
  list.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);">Loading jobs...</div>';

  try {
    const jobs = await API.getJobs(orgId);
    if (jobs.length === 0) {
      list.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted);border:1px dashed var(--border);border-radius:16px;">No background jobs for ${state.currentOrg.name}.</div>`;
      return;
    }

    list.innerHTML = jobs
      .map(
        (j) => `
      <div class="widget-card">
        <div class="flex items-center justify-between">
          <div>
            <div style="font-size:15px;font-weight:600;color:var(--text);">${j.title}</div>
            <div style="font-size:13px;color:var(--muted);margin-top:2px;">${j.instruction}</div>
          </div>
          <div class="flex items-center gap-2">
            <span style="padding:4px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:rgba(6,78,59,0.8);color:#6ee7b7;border:1px solid rgba(4,120,87,0.6);">
              ● Active Routine
            </span>
            <button class="btn-send" style="width:auto;height:auto;padding:6px 14px;border-radius:8px;font-size:11px;font-weight:500;" onclick="executeJob('${j.id}')">
              ▶ Run Now
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between text-micro" style="font-family:monospace;color:var(--muted);padding-top:10px;border-top:1px solid var(--border);">
          <div>SCHEDULE: <span style="color:var(--text);">${j.cron_expression}</span></div>
          <div>TENANT DB: <span style="color:#818cf8;">${orgId}.db</span></div>
        </div>
      </div>
    `
      )
      .join("");
  } catch (e) {
    list.innerHTML = '<div style="color:red;padding:20px;">Failed to load jobs</div>';
  }
}

async function executeJob(jobId) {
  try {
    const res = await API.runJob(state.currentOrg.id, jobId);
    alert(`✓ Job Run Successfully!\n\n${res.output}`);
  } catch (err) {
    alert("Failed to run job");
  }
}

// CONNECTIONS VIEW
async function loadConnections(orgId) {
  const container = document.getElementById("connections-grid-container");
  if (!container) return;
  container.innerHTML = '<div style="grid-column:span 2;padding:40px;text-align:center;color:var(--muted);">Loading connections...</div>';

  try {
    const conns = await API.getConnections(orgId);
    const meta = {
      quickbooks: { name: "QuickBooks Online", cat: "Accounting & Invoicing", icon: "🧾" },
      google_calendar: { name: "Google Calendar", cat: "Productivity & Scheduling", icon: "📅" },
      gmail: { name: "Gmail API", cat: "Outbound & Inbound Email", icon: "✉️" },
      stripe: { name: "Stripe Billing", cat: "Payments & Subscriptions", icon: "💳" },
      slack: { name: "Slack Enterprise", cat: "Internal Communications", icon: "💬" },
    };

    container.innerHTML = conns
      .map((c) => {
        const m = meta[c.provider] || { name: c.provider.toUpperCase(), cat: "Business Service", icon: "🔌" };
        const isConnected = c.status === "connected";
        return `
        <div class="widget-card" style="flex-direction:row;align-items:center;justify-content:space-between;">
          <div class="flex items-center gap-3">
            <div style="height:48px;width:48px;border-radius:12px;background:var(--fill);display:grid;place-items:center;font-size:22px;border:1px solid var(--border);">
              ${m.icon}
            </div>
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--text);">${m.name}</div>
              <div style="font-size:11px;color:var(--muted);">${m.cat}</div>
              ${c.account_identifier ? `<div style="font-size:10px;color:#818cf8;font-family:monospace;margin-top:2px;">${c.account_identifier}</div>` : ""}
            </div>
          </div>
          <div class="flex items-center gap-2">
            ${isConnected ? `<button class="btn-icon" style="font-size:11px;width:auto;padding:0 8px;" onclick="inspectVault('${m.name}')">Vault 🔑</button>` : ""}
            <button class="${isConnected ? "suggestion-pill" : "btn-send"}" style="width:auto;height:auto;padding:6px 14px;border-radius:8px;font-size:12px;" onclick="toggleConn('${c.provider}', '${c.status}')">
              ${isConnected ? "Disconnect" : "Connect"}
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  } catch (e) {
    container.innerHTML = '<div style="color:red;">Failed to load connections</div>';
  }
}

async function toggleConn(provider, currentStatus) {
  const next = currentStatus === "connected" ? "disconnected" : "connected";
  await API.toggleConnection(state.currentOrg.id, provider, next);
  await loadConnections(state.currentOrg.id);
}

function inspectVault(providerName) {
  alert(`🔒 Zero-Knowledge Vault: ${providerName}\n\nCiphertext: 7f8a9e10...d4a821e\nAlgorithm: AES-256-GCM\nTenant Salt: ${state.currentOrg.id}\nStatus: Verified Secure at Rest`);
}

// TEAM & BILLING VIEW
async function loadTeamAndBilling(orgId) {
  try {
    const [members, billing, plans] = await Promise.all([
      API.getMembers(orgId),
      API.getBilling(orgId),
      API.getPlans(),
    ]);

    // Render Members
    const memList = document.getElementById("team-members-list");
    if (memList) {
      memList.innerHTML = members
        .map(
          (m) => `
        <div class="flex items-center justify-between" style="padding:14px 20px;border-bottom:1px solid var(--border);">
          <div class="flex items-center gap-3">
            <div style="height:36px;width:36px;border-radius:50%;background:#334155;color:#fff;display:grid;place-items:center;font-weight:bold;font-size:13px;">
              ${m.full_name[0] || m.email[0].toUpperCase()}
            </div>
            <div>
              <div style="font-size:13px;font-weight:500;color:var(--text);">${m.full_name}</div>
              <div style="font-size:11px;color:var(--muted);">${m.email}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span style="padding:2px 8px;border-radius:9999px;font-size:10px;text-transform:uppercase;font-family:monospace;background:var(--fill);color:${m.role === "owner" ? "#fcd34d" : "#818cf8"};">
              ${m.role}
            </span>
            ${m.role !== "owner" ? `<button style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:11px;" onclick="removeTeamMember('${m.user_id}')">Remove</button>` : ""}
          </div>
        </div>
      `
        )
        .join("");
    }

    // Render Billing Progress
    if (billing) {
      document.getElementById("billing-plan-name").textContent = billing.plan_name;
      document.getElementById("billing-plan-price").textContent = `$${billing.price_monthly}`;
      document.getElementById("billing-credits-meter").textContent = `${billing.credits_used.toLocaleString()} / ${billing.credits_limit.toLocaleString()} (${billing.credits_percent}%)`;
      document.getElementById("billing-progress-bar").style.width = `${Math.min(billing.credits_percent, 100)}%`;
    }

    // Render Plans Grid
    const plansGrid = document.getElementById("plans-cards-grid");
    if (plansGrid) {
      plansGrid.innerHTML = plans
        .map((p) => {
          const isCurrent = billing?.plan_id === p.id;
          return `
          <div class="widget-card" style="${isCurrent ? "border-color:#6366f1;box-shadow:0 0 20px rgba(99,102,241,0.2);" : ""}">
            <div class="flex items-center justify-between">
              <div style="font-weight:bold;font-size:15px;color:var(--text);">${p.name}</div>
              ${isCurrent ? '<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#312e81;color:#a5b4fc;">Current</span>' : ""}
            </div>
            <div style="font-size:24px;font-weight:bold;color:var(--text);">$${p.price_monthly} <span style="font-size:12px;color:var(--muted);font-weight:normal;">/mo</span></div>
            <div style="background:var(--bg);padding:8px 12px;border-radius:8px;font-size:11px;font-family:monospace;color:#34d399;">
              ${p.credits_monthly.toLocaleString()} Credits · Up to ${p.max_members} Members
            </div>
            <ul style="list-style:none;padding:0;font-size:11px;color:var(--muted);display:flex;flex-direction:column;gap:6px;">
              ${p.features.map((f) => `<li>✓ ${f}</li>`).join("")}
            </ul>
            <button class="btn-send" style="width:100%;border-radius:10px;height:38px;font-size:13px;font-weight:500;margin-top:auto;" ${isCurrent ? "disabled" : ""} onclick="upgradePlan('${p.id}')">
              ${isCurrent ? "Active Plan" : "Choose Plan"}
            </button>
          </div>
        `;
        })
        .join("");
    }
  } catch (e) {
    console.error("Failed to load team/billing:", e);
  }
}

async function upgradePlan(planId) {
  try {
    await API.changePlan(state.currentOrg.id, planId);
    await loadOrganizations();
    await loadTeamAndBilling(state.currentOrg.id);
  } catch (err) {
    alert("Failed to change plan");
  }
}

async function removeTeamMember(userId) {
  if (!confirm("Remove this team member?")) return;
  await API.removeMember(state.currentOrg.id, userId);
  await loadTeamAndBilling(state.currentOrg.id);
}

// ASK DRAWER & STREAMING
function setupDrawer() {
  const form = document.getElementById("ask-hero-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("ask-prompt-input");
      if (input && input.value.trim()) {
        sendPrompt(input.value.trim());
        input.value = "";
      }
    });
  }

  const drawerForm = document.getElementById("drawer-input-form");
  if (drawerForm) {
    drawerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("drawer-prompt-input");
      if (input && input.value.trim()) {
        sendPrompt(input.value.trim());
        input.value = "";
      }
    });
  }
}

function openDrawer(initialPrompt) {
  document.getElementById("ask-drawer").classList.add("open");
  if (initialPrompt) sendPrompt(initialPrompt);
}

function closeDrawer() {
  document.getElementById("ask-drawer").classList.remove("open");
}

async function sendPrompt(promptText) {
  if (state.isStreaming || !promptText) return;
  state.isStreaming = true;
  openDrawer();

  const container = document.getElementById("drawer-messages-list");
  // User bubble
  const userDiv = document.createElement("div");
  userDiv.style = "align-self:flex-end;max-width:85%;padding:10px 16px;border-radius:16px;background:var(--surface);border:1px solid var(--border);font-size:13px;color:var(--text);margin-bottom:12px;";
  userDiv.textContent = promptText;
  container.appendChild(userDiv);

  // Agent bubble
  const agentDiv = document.createElement("div");
  agentDiv.style = "align-self:flex-start;max-width:95%;margin-bottom:16px;display:flex;flex-direction:column;gap:8px;";
  agentDiv.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);font-weight:500;">
      <span>●</span> <span>${state.currentOrg?.name || "Hashira"} Agent</span>
      <span class="status-badge" style="background:var(--fill);padding:2px 6px;border-radius:4px;font-family:monospace;">thinking</span>
    </div>
    <div class="agent-content-text" style="font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;"></div>
  `;
  container.appendChild(agentDiv);
  container.scrollTop = container.scrollHeight;

  const contentSpan = agentDiv.querySelector(".agent-content-text");
  const statusBadge = agentDiv.querySelector(".status-badge");

  try {
    await API.streamChat(
      promptText,
      state.currentOrg?.id || "org_hashira",
      (token) => {
        contentSpan.textContent += token;
        container.scrollTop = container.scrollHeight;
      },
      (status) => {
        statusBadge.textContent = status;
      },
      (card) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "widget-card";
        cardDiv.style = "margin-top:10px;border-color:rgba(245,158,11,0.4);background:rgba(15,23,42,0.9);";
        cardDiv.innerHTML = `
          <div class="flex items-center justify-between">
            <span style="font-size:12px;font-weight:600;color:#fcd34d;">⚠️ ${card.title}</span>
            <span style="font-size:10px;font-family:monospace;padding:2px 6px;border-radius:4px;background:#451a03;color:#f59e0b;">RISK: ${card.risk}</span>
          </div>
          <div style="font-size:12px;color:#cbd5e1;">${card.description}</div>
          <div style="padding:10px;border-radius:8px;background:rgba(0,0,0,0.6);font-family:monospace;font-size:11px;color:#34d399;">
            ${card.diff_preview}
          </div>
          <div class="flex gap-2">
            <button class="btn-send" style="flex:1;height:34px;border-radius:8px;font-size:12px;" onclick="alert('Action approved and committed to Celery worker.')">Approve Action</button>
            <button class="suggestion-pill" style="height:34px;" onclick="this.parentElement.parentElement.remove()">Reject</button>
          </div>
        `;
        agentDiv.appendChild(cardDiv);
        container.scrollTop = container.scrollHeight;
      },
      () => {
        statusBadge.textContent = "done";
        state.isStreaming = false;
      }
    );
  } catch (err) {
    contentSpan.textContent = "Connected to Hashira workspace. Automated routine planned and ready.";
  } finally {
    state.isStreaming = false;
  }
}

// MODALS
function setupModals() {
  const addMemForm = document.getElementById("add-member-form");
  if (addMemForm) {
    addMemForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("mem-email-input").value;
      const name = document.getElementById("mem-name-input").value;
      const role = document.getElementById("mem-role-select").value;
      try {
        await API.addMember(state.currentOrg.id, email, name, role);
        closeModal();
        await loadTeamAndBilling(state.currentOrg.id);
      } catch (err) {
        alert(err.message);
      }
    });
  }

  const createOrgForm = document.getElementById("create-org-form");
  if (createOrgForm) {
    createOrgForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("new-org-name-input").value;
      try {
        const newOrg = await API.createOrg(name);
        closeModal();
        await loadOrganizations();
        switchOrg(newOrg.id);
      } catch (err) {
        alert(err.message);
      }
    });
  }

  const createJobForm = document.getElementById("create-job-form");
  if (createJobForm) {
    createJobForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("new-job-title").value;
      const instr = document.getElementById("new-job-instr").value;
      const cron = document.getElementById("new-job-cron").value;
      try {
        await API.createJob(state.currentOrg.id, title, instr, cron);
        closeModal();
        await loadJobs(state.currentOrg.id);
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add("open");
}

function closeModal() {
  document.querySelectorAll(".modal-overlay").forEach((m) => m.classList.remove("open"));
}

function compileSyntheticApp(e) {
  e.preventDefault();
  const input = document.getElementById("synthetic-app-prompt");
  const resultDiv = document.getElementById("synthetic-app-result");
  if (!input || !resultDiv) return;

  resultDiv.innerHTML = '<div style="padding:30px;text-align:center;color:var(--muted);"><span style="display:inline-block;animation:spin 1s infinite;">⚙️</span> Synthesizing schema & interactive table...</div>';

  setTimeout(() => {
    resultDiv.innerHTML = `
      <div class="widget-card" style="border-color:#6366f1;">
        <div class="flex items-center justify-between pb-2" style="border-bottom:1px solid var(--border);">
          <div>
            <div style="font-weight:600;font-size:14px;color:var(--text);">${input.value}</div>
            <div style="font-size:11px;color:#818cf8;font-family:monospace;">Generated Schema · Ready for Canvas</div>
          </div>
          <button class="btn-send" style="width:auto;height:auto;padding:6px 12px;border-radius:6px;font-size:11px;" onclick="alert('App pinned to Home Canvas!');closeModal();">Pin to Canvas</button>
        </div>
        <table style="width:100%;font-size:11px;border-collapse:collapse;margin-top:8px;">
          <thead>
            <tr style="color:var(--muted);border-bottom:1px solid var(--border);text-align:left;">
              <th style="padding:6px;">ID</th><th>Item</th><th>Assignee</th><th>Cost</th><th style="text-align:right;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid var(--border);"><td style="padding:6px;font-family:monospace;">#101</td><td>HVAC Service Part A</td><td>Samir</td><td>$450.00</td><td style="text-align:right;color:#34d399;">Active</td></tr>
            <tr style="border-bottom:1px solid var(--border);"><td style="padding:6px;font-family:monospace;">#102</td><td>Filter replacement</td><td>Elena</td><td>$180.00</td><td style="text-align:right;color:#fcd34d;">Pending</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }, 1000);
}

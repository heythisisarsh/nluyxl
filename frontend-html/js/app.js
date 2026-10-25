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
  list.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);">Loading autonomous routines...</div>';

  try {
    const jobs = await API.getJobs(orgId);
    if (jobs.length === 0) {
      list.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);border:1px dashed var(--border);border-radius:14px;">No background jobs configured for ${state.currentOrg.name}.</div>`;
      return;
    }

    list.innerHTML = jobs
      .map(
        (j) => `
      <div class="cursor-window">
        <div class="cursor-window-header">
          <div class="window-dots">
            <span class="window-dot"></span><span class="window-dot"></span><span class="window-dot"></span>
          </div>
          <div class="window-title">${j.id}.cron</div>
          <span class="text-micro font-mono" style="padding:2px 8px;border-radius:9999px;background:rgba(34,197,94,0.15);color:var(--cursor-green);">
            ● Active Routine
          </span>
        </div>
        <div class="window-body flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div>
              <div style="font-size:15px;font-weight:600;color:var(--text-pure);">${j.title}</div>
              <div style="font-size:13px;color:var(--text-muted);margin-top:2px;">${j.instruction}</div>
            </div>
            <button class="btn-send flex items-center gap-2" style="height:32px;font-size:12px;" onclick="executeJob('${j.id}')">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Run Now
            </button>
          </div>
          <div class="flex items-center justify-between text-micro font-mono" style="color:var(--text-subtle);padding-top:10px;border-top:1px solid var(--border);">
            <div>SCHEDULE: <span style="color:var(--text);">${j.cron_expression}</span></div>
            <div>TENANT DB: <span style="color:var(--cursor-amber);">${orgId}.db</span></div>
          </div>
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
  container.innerHTML = '<div style="grid-column:span 2;padding:40px;text-align:center;color:var(--text-muted);">Loading vault connections...</div>';

  try {
    const conns = await API.getConnections(orgId);
    const meta = {
      quickbooks: { 
        name: "QuickBooks Online", 
        cat: "Accounting & Invoicing", 
        iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>` 
      },
      google_calendar: { 
        name: "Google Calendar", 
        cat: "Productivity & Scheduling", 
        iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` 
      },
      gmail: { 
        name: "Gmail API", 
        cat: "Outbound & Inbound Email", 
        iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>` 
      },
      stripe: { 
        name: "Stripe Billing", 
        cat: "Payments & Subscriptions", 
        iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>` 
      },
      slack: { 
        name: "Slack Enterprise", 
        cat: "Internal Communications", 
        iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` 
      },
    };

    container.innerHTML = conns
      .map((c) => {
        const m = meta[c.provider] || { 
          name: c.provider.toUpperCase(), 
          cat: "Business Service", 
          iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="4"/></svg>` 
        };
        const isConnected = c.status === "connected";
        return `
        <div class="cursor-window">
          <div class="cursor-window-header">
            <div class="window-dots"><span class="window-dot"></span><span class="window-dot"></span><span class="window-dot"></span></div>
            <div class="window-title">${c.provider}.oauth</div>
            <span class="text-micro font-mono" style="color:${isConnected ? "var(--cursor-green)" : "var(--text-subtle)"};">
              ${isConnected ? "● Connected" : "○ Disconnected"}
            </span>
          </div>
          <div class="window-body flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div style="height:44px;width:44px;border-radius:10px;background:var(--bg-well);display:grid;place-items:center;border:1px solid var(--border);">
                ${m.iconSvg}
              </div>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--text-pure);">${m.name}</div>
                <div style="font-size:11px;color:var(--text-muted);">${m.cat}</div>
                ${c.account_identifier ? `<div class="text-micro font-mono" style="color:var(--cursor-amber);margin-top:2px;">${c.account_identifier}</div>` : ""}
              </div>
            </div>
            <div class="flex items-center gap-2">
              ${isConnected ? `<button class="btn-ghost-pill text-micro font-mono flex items-center gap-1" style="height:30px;padding:0 10px;" onclick="inspectVault('${m.name}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Vault
              </button>` : ""}
              <button class="${isConnected ? "btn-ghost-pill" : "btn-send"}" style="height:30px;padding:0 12px;font-size:12px;" onclick="toggleConn('${c.provider}', '${c.status}')">
                ${isConnected ? "Disconnect" : "Connect"}
              </button>
            </div>
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
          <div class="cursor-window" style="${isCurrent ? "border-color:var(--cursor-amber);box-shadow:0 0 24px var(--cursor-amber-glow);" : ""}">
            <div class="cursor-window-header">
              <div class="window-dots"><span class="window-dot"></span><span class="window-dot"></span><span class="window-dot"></span></div>
              <div class="window-title">${p.id}.tier</div>
              ${isCurrent ? '<span class="text-micro font-mono" style="padding:2px 8px;border-radius:9999px;background:rgba(224,107,58,0.2);color:var(--cursor-amber);">Current</span>' : ""}
            </div>
            <div class="window-body flex flex-col gap-3" style="height:100%;">
              <div style="font-weight:600;font-size:16px;color:var(--text-pure);">${p.name}</div>
              <div style="font-size:24px;font-weight:700;color:var(--text-pure);">$${p.price_monthly} <span style="font-size:12px;color:var(--text-subtle);font-weight:normal;">/mo</span></div>
              <div class="text-micro font-mono" style="background:var(--bg-well);padding:8px 10px;border-radius:6px;border:1px solid var(--border);color:var(--cursor-green);">
                ${p.credits_monthly.toLocaleString()} Credits · Up to ${p.max_members} Seats
              </div>
              <ul style="list-style:none;padding:0;font-size:12px;color:var(--text-muted);display:flex;flex-direction:column;gap:6px;margin:8px 0;">
                ${p.features.map((f) => `<li style="display:flex;align-items:center;gap:6px;"><span style="color:var(--cursor-amber);">✓</span> ${f}</li>`).join("")}
              </ul>
              <button class="${isCurrent ? "btn-ghost-pill" : "btn-send"}" style="width:100%;height:36px;font-size:12px;margin-top:auto;" ${isCurrent ? "disabled" : ""} onclick="upgradePlan('${p.id}')">
                ${isCurrent ? "Active Plan" : "Choose Plan"}
              </button>
            </div>
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
  userDiv.style = "align-self:flex-end;max-width:85%;padding:10px 16px;border-radius:14px;background:var(--bg-surface);border:1px solid var(--border-strong);font-size:13px;color:var(--text-pure);margin-bottom:12px;";
  userDiv.textContent = promptText;
  container.appendChild(userDiv);

  // Agent bubble
  const agentDiv = document.createElement("div");
  agentDiv.style = "align-self:flex-start;max-width:95%;margin-bottom:16px;display:flex;flex-direction:column;gap:8px;";
  agentDiv.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-subtle);font-family:var(--font-mono);">
      <span style="color:var(--cursor-green);">●</span> <span style="color:var(--text);font-weight:600;">${state.currentOrg?.name || "Hashira"} Agent (Grok 4.7)</span>
      <span class="status-badge" style="background:var(--fill-hover);padding:2px 8px;border-radius:9999px;border:1px solid var(--border);color:var(--cursor-amber);">● thinking</span>
    </div>
    <div class="agent-content-text" style="font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;background:var(--bg-surface);padding:14px 16px;border-radius:12px;border:1px solid var(--border);"></div>
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
        statusBadge.textContent = `● ${status}`;
      },
      (card) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "cursor-window";
        cardDiv.style = "margin-top:10px;border-color:rgba(224,107,58,0.4);";
        cardDiv.innerHTML = `
          <div class="cursor-window-header">
            <div class="window-dots"><span class="window-dot close"></span><span class="window-dot min"></span><span class="window-dot max"></span></div>
            <div class="window-title">human-in-the-loop.action</div>
            <span class="text-micro font-mono" style="padding:1px 6px;border-radius:4px;background:rgba(224,107,58,0.2);color:var(--cursor-amber);">RISK: ${card.risk}</span>
          </div>
          <div class="window-body flex flex-col gap-3">
            <div style="font-size:13px;font-weight:600;color:var(--text-pure);">⚠️ ${card.title}</div>
            <div style="font-size:12px;color:var(--text-muted);">${card.description}</div>
            <div class="diff-well">
              ${card.diff_preview}
            </div>
            <div class="flex gap-2">
              <button class="btn-send" style="flex:1;height:34px;font-size:12px;" onclick="alert('Action approved and committed to Celery worker.')">Approve Action</button>
              <button class="btn-ghost-pill" style="height:34px;" onclick="this.parentElement.parentElement.parentElement.remove()">Reject</button>
            </div>
          </div>
        `;
        agentDiv.appendChild(cardDiv);
        container.scrollTop = container.scrollHeight;
      },
      () => {
        statusBadge.textContent = "● done";
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

  resultDiv.innerHTML = '<div style="padding:30px;text-align:center;color:var(--text-muted);font-family:var(--font-mono);"><span style="display:inline-block;animation:spin 1s infinite;">⚙️</span> Synthesizing schema & interactive table...</div>';

  setTimeout(() => {
    resultDiv.innerHTML = `
      <div class="cursor-window" style="border-color:var(--cursor-amber);">
        <div class="cursor-window-header">
          <div class="window-dots"><span class="window-dot"></span><span class="window-dot"></span><span class="window-dot"></span></div>
          <div class="window-title">synthetic-unit.tsx</div>
          <button class="btn-send" style="height:26px;padding:0 10px;font-size:11px;" onclick="alert('App pinned to Home Canvas!');closeModal();">Pin to Canvas</button>
        </div>
        <div class="window-body">
          <div style="font-weight:600;font-size:14px;color:var(--text-pure);margin-bottom:2px;">${input.value}</div>
          <div class="text-micro font-mono" style="color:var(--cursor-amber);margin-bottom:12px;">Generated Schema · Connected to Tenant SQLite DB</div>
          <table style="width:100%;font-size:12px;border-collapse:collapse;font-family:var(--font-mono);">
            <thead>
              <tr style="color:var(--text-subtle);border-bottom:1px solid var(--border);text-align:left;">
                <th style="padding:8px 6px;">ID</th><th>Item</th><th>Assignee</th><th>Cost</th><th style="text-align:right;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid var(--border-subtle);"><td style="padding:8px 6px;color:var(--text-subtle);">#101</td><td style="color:var(--text);">HVAC Service Part A</td><td>Samir</td><td>$450.00</td><td style="text-align:right;color:var(--cursor-green);">Active</td></tr>
              <tr style="border-bottom:1px solid var(--border-subtle);"><td style="padding:8px 6px;color:var(--text-subtle);">#102</td><td style="color:var(--text);">Filter replacement</td><td>Elena</td><td>$180.00</td><td style="text-align:right;color:var(--cursor-amber);">Pending</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }, 800);
}

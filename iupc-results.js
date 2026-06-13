// Ei block IUPC result page er DOM element reference dhore.
const iupcAdminPanel = document.getElementById("iupcAdminPanel");
const iupcResultForm = document.getElementById("iupcResultForm");
const iupcContestName = document.getElementById("iupcContestName");
const iupcContestYear = document.getElementById("iupcContestYear");
const iupcTeamName = document.getElementById("iupcTeamName");
const iupcMemberOne = document.getElementById("iupcMemberOne");
const iupcMemberTwo = document.getElementById("iupcMemberTwo");
const iupcMemberThree = document.getElementById("iupcMemberThree");
const iupcRankText = document.getElementById("iupcRankText");
const iupcResultStatus = document.getElementById("iupcResultStatus");
const iupcResultsList = document.getElementById("iupcResultsList");
const iupcAdminUser = document.getElementById("iupcAdminUser");

let isIupcAdmin = false;

// Ei function API path ke correct server URL e convert kore.
function iupcApiUrl(path) {
  if (!path.startsWith("/")) path = "/" + path;
  if (window.location.protocol === "file:") {
    return "http://localhost:5000" + path;
  }
  return window.location.origin + path;
}

// Ei function rendered IUPC data ke HTML injection theke safe kore.
function iupcEscapeHtml(value) {
  if (!value) return "";
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Ei function add/delete status message update kore.
function setIupcStatus(message) {
  if (iupcResultStatus) iupcResultStatus.textContent = message || "";
}

// Ei function admin session check kore admin panel show/hide kore.
async function checkIupcAdmin() {
  try {
    const response = await fetch(iupcApiUrl("/api/admin/session"), {
      credentials: "include"
    });
    if (!response.ok) throw new Error("Session check failed");
    const data = await response.json();
    isIupcAdmin = !!data.authenticated;
  } catch {
    isIupcAdmin = false;
  }

  if (iupcAdminPanel) iupcAdminPanel.hidden = !isIupcAdmin;
  if (iupcAdminUser) iupcAdminUser.textContent = localStorage.getItem("adminUsername") || "Admin";
  if (window.updateAdminAuthLinks) window.updateAdminAuthLinks(isIupcAdmin);
}

// Ei function database theke IUPC result list load kore.
async function loadIupcResults() {
  if (!iupcResultsList) return;
  iupcResultsList.innerHTML = '<p class="event-meta">Loading IUPC results...</p>';

  try {
    const response = await fetch(iupcApiUrl("/api/iupc-results"));
    if (!response.ok) throw new Error("Unable to load IUPC results");
    const results = await response.json();
    renderIupcResults(Array.isArray(results) ? results : []);
  } catch (error) {
    console.error("IUPC results load failed", error);
    iupcResultsList.innerHTML = '<p class="event-meta">Unable to load IUPC results.</p>';
  }
}

// Ei function IUPC result table-style list render kore.
function renderIupcResults(results) {
  if (!iupcResultsList) return;

  if (!results.length) {
    iupcResultsList.innerHTML = '<p class="event-meta">No IUPC results yet.</p>';
    return;
  }

  iupcResultsList.innerHTML = results.map((result) => `
    <div class="event-meta">
      <strong>${iupcEscapeHtml(result.contestName)}</strong> — ${iupcEscapeHtml(result.contestYear)}
      <div>Team: ${iupcEscapeHtml(result.teamName)}</div>
      <div>Members: ${iupcEscapeHtml(result.teamMembers)}</div>
      <div>Rank: ${iupcEscapeHtml(result.rankText)}</div>
      ${isIupcAdmin ? `<button class="btn-delete" type="button" data-delete-iupc="${iupcEscapeHtml(result.id)}">Delete</button>` : ""}
    </div>
  `).join("");

  if (isIupcAdmin) {
    iupcResultsList.querySelectorAll("[data-delete-iupc]").forEach((button) => {
      button.addEventListener("click", () => deleteIupcResult(button.dataset.deleteIupc));
    });
  }
}

// Ei function IUPC add form er input data payload hisebe collect kore.
function getIupcPayload() {
  return {
    contestName: iupcContestName.value.trim(),
    contestYear: iupcContestYear.value.trim(),
    teamName: iupcTeamName.value.trim(),
    teamMembers: [
      iupcMemberOne.value.trim(),
      iupcMemberTwo.value.trim(),
      iupcMemberThree.value.trim()
    ].join(", "),
    rankText: iupcRankText.value.trim(),
    remarks: ""
  };
}

// Ei function admin confirm korle selected IUPC result delete kore.
async function deleteIupcResult(id) {
  if (!confirm("Delete this IUPC result?")) return;

  try {
    const response = await fetch(iupcApiUrl(`/api/iupc-results/${encodeURIComponent(id)}`), {
      method: "DELETE",
      credentials: "include"
    });
    if (!response.ok) throw new Error("Delete failed");
    await loadIupcResults();
    setIupcStatus("Result deleted.");
  } catch {
    setIupcStatus("Could not delete result.");
  }
}

// Ei block IUPC add-result form submit handle kore.
if (iupcResultForm) {
  iupcResultForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = getIupcPayload();
    if (!payload.contestName || !payload.contestYear || !payload.teamName || !iupcMemberOne.value.trim() || !iupcMemberTwo.value.trim() || !iupcMemberThree.value.trim() || !payload.rankText) {
      setIupcStatus("Please fill in all fields before adding a result.");
      return;
    }

    setIupcStatus("Adding...");

    try {
      const response = await fetch(iupcApiUrl("/api/iupc-results"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Add failed");
      iupcResultForm.reset();
      await loadIupcResults();
      setIupcStatus("Result added.");
    } catch {
      setIupcStatus("Could not add result.");
    }
  });
}

// Ei init block admin state check kore tarpor result list load kore.
(async () => {
  await checkIupcAdmin();
  await loadIupcResults();
})();

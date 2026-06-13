// Ei block ICPC result page er DOM element reference dhore.
const icpcAdminPanel = document.getElementById("icpcAdminPanel");
const icpcResultForm = document.getElementById("icpcResultForm");
const icpcContestName = document.getElementById("icpcContestName");
const icpcContestYear = document.getElementById("icpcContestYear");
const icpcTeamName = document.getElementById("icpcTeamName");
const icpcMemberOne = document.getElementById("icpcMemberOne");
const icpcMemberTwo = document.getElementById("icpcMemberTwo");
const icpcMemberThree = document.getElementById("icpcMemberThree");
const icpcRankText = document.getElementById("icpcRankText");
const icpcResultStatus = document.getElementById("icpcResultStatus");
const icpcResultsList = document.getElementById("icpcResultsList");
const icpcAdminUser = document.getElementById("icpcAdminUser");

let isIcpcAdmin = false;

// Ei function API path ke correct server URL e convert kore.
function icpcApiUrl(path) {
  if (!path.startsWith("/")) path = "/" + path;
  if (window.location.protocol === "file:") {
    return "http://localhost:5000" + path;
  }
  return window.location.origin + path;
}

// Ei function rendered ICPC data ke HTML injection theke safe kore.
function icpcEscapeHtml(value) {
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
function setIcpcStatus(message) {
  if (icpcResultStatus) icpcResultStatus.textContent = message || "";
}

// Ei function admin session check kore admin panel show/hide kore.
async function checkIcpcAdmin() {
  try {
    const response = await fetch(icpcApiUrl("/api/admin/session"), {
      credentials: "include"
    });
    if (!response.ok) throw new Error("Session check failed");
    const data = await response.json();
    isIcpcAdmin = !!data.authenticated;
  } catch {
    isIcpcAdmin = false;
  }

  if (icpcAdminPanel) icpcAdminPanel.hidden = !isIcpcAdmin;
  if (icpcAdminUser) icpcAdminUser.textContent = localStorage.getItem("adminUsername") || "Admin";
  if (window.updateAdminAuthLinks) window.updateAdminAuthLinks(isIcpcAdmin);
}

// Ei function database theke ICPC result list load kore.
async function loadIcpcResults() {
  if (!icpcResultsList) return;
  icpcResultsList.innerHTML = '<p class="event-meta">Loading ICPC results...</p>';

  try {
    const response = await fetch(icpcApiUrl("/api/icpc-results"));
    if (!response.ok) throw new Error("Unable to load ICPC results");
    const results = await response.json();
    renderIcpcResults(Array.isArray(results) ? results : []);
  } catch (error) {
    console.error("ICPC results load failed", error);
    icpcResultsList.innerHTML = '<p class="event-meta">Unable to load ICPC results.</p>';
  }
}

// Ei function ICPC result table-style list render kore.
function renderIcpcResults(results) {
  if (!icpcResultsList) return;

  if (!results.length) {
    icpcResultsList.innerHTML = '<p class="event-meta">No ICPC results yet.</p>';
    return;
  }

  icpcResultsList.innerHTML = results.map((result) => `
    <div class="event-meta">
      <strong>${icpcEscapeHtml(result.contestName)}</strong> — ${icpcEscapeHtml(result.contestYear)}
      <div>Team: ${icpcEscapeHtml(result.teamName)}</div>
      <div>Members: ${icpcEscapeHtml(result.memberOne)}, ${icpcEscapeHtml(result.memberTwo)}, ${icpcEscapeHtml(result.memberThree)}</div>
      <div>Rank: ${icpcEscapeHtml(result.rankText)}</div>
      ${isIcpcAdmin ? `<button class="btn-delete" type="button" data-delete-icpc="${icpcEscapeHtml(result.id)}">Delete</button>` : ""}
    </div>
  `).join("");

  if (isIcpcAdmin) {
    icpcResultsList.querySelectorAll("[data-delete-icpc]").forEach((button) => {
      button.addEventListener("click", () => deleteIcpcResult(button.dataset.deleteIcpc));
    });
  }
}

// Ei function ICPC add form er input data payload hisebe collect kore.
function getIcpcPayload() {
  return {
    contestName: icpcContestName.value.trim(),
    contestYear: icpcContestYear.value.trim(),
    teamName: icpcTeamName.value.trim(),
    memberOne: icpcMemberOne.value.trim(),
    memberTwo: icpcMemberTwo.value.trim(),
    memberThree: icpcMemberThree.value.trim(),
    rankText: icpcRankText.value.trim()
  };
}

// Ei function admin confirm korle selected ICPC result delete kore.
async function deleteIcpcResult(id) {
  if (!confirm("Delete this ICPC result?")) return;

  try {
    const response = await fetch(icpcApiUrl(`/api/icpc-results/${encodeURIComponent(id)}`), {
      method: "DELETE",
      credentials: "include"
    });
    if (!response.ok) throw new Error("Delete failed");
    await loadIcpcResults();
    setIcpcStatus("Result deleted.");
  } catch {
    setIcpcStatus("Could not delete result.");
  }
}

// Ei block ICPC add-result form submit handle kore.
if (icpcResultForm) {
  icpcResultForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = getIcpcPayload();
    if (!payload.contestName || !payload.contestYear || !payload.teamName || !payload.memberOne || !payload.memberTwo || !payload.memberThree || !payload.rankText) {
      setIcpcStatus("Please fill in all fields before adding a result.");
      return;
    }

    setIcpcStatus("Adding...");

    try {
      const response = await fetch(icpcApiUrl("/api/icpc-results"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Add failed");
      icpcResultForm.reset();
      await loadIcpcResults();
      setIcpcStatus("Result added.");
    } catch {
      setIcpcStatus("Could not add result.");
    }
  });
}

// Ei init block admin state check kore tarpor result list load kore.
(async () => {
  await checkIcpcAdmin();
  await loadIcpcResults();
})();

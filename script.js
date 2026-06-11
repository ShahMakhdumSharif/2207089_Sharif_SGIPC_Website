const menuBtn = document.getElementById("menuBtn");
const siteNav = document.getElementById("siteNav");
const yearNode = document.getElementById("year");
const statNodes = document.querySelectorAll(".stat-value");
const revealNodes = document.querySelectorAll(".reveal");
const bannerImage = document.getElementById("bannerImage");
const bannerPrevBtn = document.getElementById("bannerPrevBtn");
const bannerNextBtn = document.getElementById("bannerNextBtn");
const teamsFormedBtn = document.getElementById("teamsFormedBtn");
const teamsFormedMessage = document.getElementById("teamsFormedMessage");

if (menuBtn && siteNav) {
  menuBtn.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => siteNav.classList.remove("open"));
  });
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const bannerSlides = [
  {
    src: "assets/banner/b1.png",
    alt: "SGIPC featured banner 1",
  },
  {
    src: "assets/banner/b2.jpg",
    alt: "SGIPC featured banner 2",
  },
  {
    src: "assets/banner/b3.jpg",
    alt: "SGIPC featured banner 3",
  },
  {
    src: "assets/banner/b4.jpg",
    alt: "SGIPC featured banner 4",
  },
];

let bannerSlideIndex = 0;

function updateBannerSlide() {
  if (!bannerImage) return;

  const slide = bannerSlides[bannerSlideIndex];
  bannerImage.src = slide.src;
  bannerImage.alt = slide.alt;
}

if (bannerPrevBtn && bannerNextBtn && bannerImage) {
  bannerPrevBtn.addEventListener("click", () => {
    if (bannerSlides.length < 2) return;
    bannerSlideIndex = (bannerSlideIndex - 1 + bannerSlides.length) % bannerSlides.length;
    updateBannerSlide();
  });

  bannerNextBtn.addEventListener("click", () => {
    if (bannerSlides.length < 2) return;
    bannerSlideIndex = (bannerSlideIndex + 1) % bannerSlides.length;
    updateBannerSlide();
  });

  updateBannerSlide();

  if (bannerSlides.length > 1) {
    setInterval(() => {
      bannerSlideIndex = (bannerSlideIndex + 1) % bannerSlides.length;
      updateBannerSlide();
    }, 5000);
  }
}

if (teamsFormedBtn && teamsFormedMessage) {
  teamsFormedBtn.addEventListener("click", () => {
    const shouldShow = teamsFormedMessage.hidden;
    teamsFormedMessage.hidden = !shouldShow;
    teamsFormedBtn.setAttribute("aria-expanded", String(shouldShow));
    if (shouldShow) {
      teamsFormedMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
}

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const node = entry.target;
      const target = Number(node.getAttribute("data-count"));
      const suffix = node.getAttribute("data-suffix") || "";
      let value = 0;
      const duration = 1200;
      const stepTime = 20;
      const increment = Math.max(1, Math.ceil((target * stepTime) / duration));

      const timer = setInterval(() => {
        value += increment;
        if (value >= target) {
          node.textContent = `${target}${suffix}`;
          clearInterval(timer);
          return;
        }
        node.textContent = `${value}${suffix}`;
      }, stepTime);

      observer.unobserve(node);
    });
  },
  { threshold: 0.35 }
);

statNodes.forEach((node) => counterObserver.observe(node));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.2 }
);

revealNodes.forEach((node) => revealObserver.observe(node));

// ===== Events API integration =====
// Determine API base: when opened as file:// use localhost:5000, otherwise use same origin.
let API_BASE = '';
try {
  if (location.protocol === 'file:') API_BASE = 'http://localhost:5000';
  else API_BASE = window.location.origin || '';
} catch (e) {
  API_BASE = 'http://localhost:5000';
}

function apiUrl(path) {
  // path should start with '/'
  if (!path.startsWith('/')) path = '/' + path;
  if (!API_BASE || API_BASE === 'null') return path;
  return API_BASE.replace(/\/$/, '') + path;
}

// DOM elements
const upcomingContainer = document.getElementById('upcomingEvents');
const pastContainer = document.getElementById('pastEvents');
const addEventForm = document.getElementById('addEventForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminCancelBtn = document.getElementById('adminCancelBtn');
const adminProfile = document.getElementById('adminProfile');
const adminUsername = document.getElementById('adminUsername');
const loginModal = document.getElementById('loginModal');
const goHomeBtn = document.getElementById('goHomeBtn');
const adminAddEventPrompt = document.getElementById('adminAddEventPrompt');
const eventAdminUser = document.getElementById('eventAdminUser');
const joinCommunityBtn = document.getElementById('joinCommunityBtn');
const joinFormPanel = document.getElementById('joinFormPanel');
const joinApplicantCard = document.getElementById('joinApplicantCard');
const joinForm = document.getElementById('joinForm');
const joinFormStatus = document.getElementById('joinFormStatus');
const joinAdminCard = document.getElementById('joinAdminCard');
const joinAdminUser = document.getElementById('joinAdminUser');
const joinRequestsList = document.getElementById('joinRequestsList');
const joinName = document.getElementById('joinName');
const joinRoll = document.getElementById('joinRoll');
const joinBatch = document.getElementById('joinBatch');
const joinDepartment = document.getElementById('joinDepartment');
const joinEmail = document.getElementById('joinEmail');
const joinCodeforces = document.getElementById('joinCodeforces');
const joinAtCoder = document.getElementById('joinAtCoder');
const joinReason = document.getElementById('joinReason');
let isAdminAuthenticated = false;

function updateAdminAuthLinks(authed) {
  document.querySelectorAll('[data-admin-auth-link]').forEach((link) => {
    if (!link.dataset.adminLoginHref) {
      link.dataset.adminLoginHref = link.getAttribute('href') || 'login.html';
    }

    if (authed) {
      link.textContent = 'Logout';
      link.setAttribute('href', '#');
      link.dataset.adminState = 'logout';
    } else {
      link.textContent = 'Admin Login';
      link.setAttribute('href', link.dataset.adminLoginHref || 'login.html');
      link.dataset.adminState = 'login';
    }
  });
}

async function performAdminLogout() {
  try {
    await fetch(apiUrl('/api/admin/logout'), { method: 'POST', credentials: 'include' });
  } catch {}
  localStorage.removeItem('adminUsername');
  window.location.reload();
}

window.updateAdminAuthLinks = updateAdminAuthLinks;
window.performAdminLogout = performAdminLogout;

async function fetchAndRenderEvents() {
  try {
    const res = await fetch(apiUrl('/api/events'));
    if (!res.ok) throw new Error('Failed to fetch events');
    const data = await res.json();
    renderEvents(data.upcoming || [], data.past || []);
  } catch (err) {
    console.error('events fetch error', err);
  }
}

function formatLocal(dtString) {
  try {
    const d = new Date(dtString);
    return d.toLocaleString();
  } catch {
    return dtString;
  }
}

function renderEvents(upcoming, past) {
  if (upcomingContainer) {
    upcomingContainer.innerHTML = upcoming.length ? upcoming.map(ev => {
      return `<div class="event-meta"><strong>${escapeHtml(ev.title)}</strong> — ${formatLocal(ev.dateTimeUtc)}${ev.location? ' | ' + escapeHtml(ev.location):''}<div class="muted">${escapeHtml(ev.description)}</div>${isAdminAuthenticated ? `<button class="btn-delete" data-event-id="${ev.id}">Delete</button>` : ''}</div>`;
    }).join('\n') : '<p class="event-meta">No upcoming events.</p>';
  }
  if (pastContainer) {
    pastContainer.innerHTML = past.length ? past.map(ev => {
      return `<div class="event-meta"><strong>${escapeHtml(ev.title)}</strong> — ${formatLocal(ev.dateTimeUtc)}${ev.location? ' | ' + escapeHtml(ev.location):''}<div class="muted">${escapeHtml(ev.description)}</div>${isAdminAuthenticated ? `<button class="btn-delete" data-event-id="${ev.id}">Delete</button>` : ''}</div>`;
    }).join('\n') : '<p class="event-meta">No past events.</p>';
  }
  
  // Attach delete event listeners
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (!confirm('Are you sure you want to delete this event?')) return;
      const eventId = e.target.dataset.eventId;
      try {
        const res = await fetch(apiUrl(`/api/events/${eventId}`), { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        await fetchAndRenderEvents();
      } catch (err) {
        console.error(err);
        alert('Could not delete event');
      }
    });
  });
}

async function fetchAndRenderJoinRequests() {
  if (!joinRequestsList || !joinAdminCard) return;

  if (!isAdminAuthenticated) {
    joinAdminCard.hidden = true;
    joinRequestsList.innerHTML = '<p class="join-empty">No join requests yet.</p>';
    return;
  }

  try {
    const res = await fetch(apiUrl('/api/join-requests'), { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch join requests');
    const requests = await res.json();
    renderJoinRequests(Array.isArray(requests) ? requests : []);
  } catch (err) {
    console.error('join requests fetch error', err);
    joinRequestsList.innerHTML = '<p class="join-empty">Unable to load join requests.</p>';
  }
}

function renderJoinRequests(requests) {
  if (!joinAdminCard || !joinRequestsList) return;

  joinAdminCard.hidden = false;
  if (!requests.length) {
    joinRequestsList.innerHTML = '<p class="join-empty">No join requests yet.</p>';
    return;
  }

  joinRequestsList.innerHTML = requests.map((request) => {
    const submittedAt = request.createdAtUtc ? formatLocal(request.createdAtUtc) : 'Unknown time';
    const applicantName = request.name || 'Unknown applicant';
    const applicantRoll = request.roll || '';
    const applicantBatch = request.batch || '';
    const applicantDepartment = request.department || '';
    const applicantEmail = request.email || '';
    const codeforcesHandle = request.codeforcesHandle || '';
    const atCoderHandle = request.atCoderHandle || '';
    const motivation = request.whyYouWantToJoin || request.answer || '';
    return `
      <article class="join-request-item">
        <strong>${escapeHtml(applicantName)}</strong>
        <div class="join-request-meta">Roll: ${escapeHtml(applicantRoll)} | Batch: ${escapeHtml(applicantBatch)} | Dept: ${escapeHtml(applicantDepartment)}</div>
        <div class="join-request-meta">Email: ${escapeHtml(applicantEmail)}</div>
        <div class="join-request-meta">Codeforces: ${escapeHtml(codeforcesHandle)} | AtCoder: ${escapeHtml(atCoderHandle)}</div>
        <div class="join-request-answer">${escapeHtml(motivation)}</div>
        <div class="join-request-meta">Submitted: ${escapeHtml(submittedAt)}</div>
      </article>
    `;
  }).join('');
}

function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
}

if (joinCommunityBtn && joinFormPanel) {
  joinCommunityBtn.addEventListener('click', () => {
    if (isAdminAuthenticated) {
      return;
    }

    const willOpen = joinFormPanel.hidden;
    joinFormPanel.hidden = !willOpen;
    joinCommunityBtn.setAttribute('aria-expanded', String(willOpen));

    if (willOpen) {
      joinFormPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (joinName) {
        setTimeout(() => joinName.focus(), 150);
      }
    }
  });
}

if (joinForm) {
  joinForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const application = {
      name: joinName ? joinName.value.trim() : '',
      roll: joinRoll ? joinRoll.value.trim() : '',
      batch: joinBatch ? joinBatch.value.trim() : '',
      department: joinDepartment ? joinDepartment.value.trim() : '',
      email: joinEmail ? joinEmail.value.trim() : '',
      codeforcesHandle: joinCodeforces ? joinCodeforces.value.trim() : '',
      atCoderHandle: joinAtCoder ? joinAtCoder.value.trim() : '',
      whyYouWantToJoin: joinReason ? joinReason.value.trim() : ''
    };

    if (!application.name || !application.roll || !application.batch || !application.department || !application.email || !application.codeforcesHandle || !application.atCoderHandle || !application.whyYouWantToJoin) {
      if (joinFormStatus) joinFormStatus.textContent = 'Please fill in all fields before submitting.';
      return;
    }

    if (joinFormStatus) joinFormStatus.textContent = 'Submitting...';

    try {
      const response = await fetch(apiUrl('/api/join-requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      });

      if (!response.ok) {
        let errorMessage = `Failed to submit request (${response.status})`;
        try {
          const responseText = await response.text();
          if (responseText) {
            try {
              const payload = JSON.parse(responseText);
              errorMessage = payload?.error || responseText || errorMessage;
            } catch {
              errorMessage = responseText;
            }
          }
        } catch {
          // Keep default message.
        }
        throw new Error(errorMessage);
      }

      joinForm.reset();
      if (joinFormStatus) joinFormStatus.textContent = 'Thanks! Your response has been submitted.';
      if (isAdminAuthenticated) {
        await fetchAndRenderJoinRequests();
      }
    } catch (err) {
      console.error('join submit error', err);
      if (joinFormStatus) joinFormStatus.textContent = err instanceof Error ? err.message : 'Could not submit right now. Please try again.';
    }
  });
}

if (addEventForm) {
  addEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('evtTitle').value.trim();
    const dt = document.getElementById('evtDateTime').value;
    const location = document.getElementById('evtLocation').value.trim();
    const desc = document.getElementById('evtDesc').value.trim();
    if (!title || !dt) return alert('Title and date/time required');

    // Convert local datetime-local value to ISO with timezone
    const local = new Date(dt);
    const iso = local.toISOString();

    try {
      const res = await fetch(apiUrl('/api/events'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, location, dateTime: iso })
      });
      if (!res.ok) throw new Error('Failed to add');
      // clear form
      addEventForm.reset();
      fetchAndRenderEvents();
    } catch (err) {
      console.error(err);
      alert('Could not add event');
    }
  });
}

// Admin auth handling
async function checkAdmin() {
  try {
    const res = await fetch(apiUrl('/api/admin/session'), { credentials: 'include' });
    if (!res.ok) throw new Error('session fetch failed');
    const data = await res.json();
    const authed = !!data.authenticated;
    isAdminAuthenticated = authed;
    
    // Update add-event form visibility
    if (addEventForm) addEventForm.style.display = authed ? '' : 'none';
    
    // Update admin prompt in events section
    if (adminAddEventPrompt && eventAdminUser) {
      if (authed) {
        adminAddEventPrompt.style.display = '';
        eventAdminUser.textContent = localStorage.getItem('adminUsername') || 'Admin';
      } else {
        adminAddEventPrompt.style.display = 'none';
      }
    }

    if (joinAdminCard && joinAdminUser) {
      if (authed) {
        joinAdminUser.textContent = localStorage.getItem('adminUsername') || 'Admin';
        joinAdminCard.hidden = false;
        if (joinFormPanel && joinApplicantCard && joinCommunityBtn) {
          joinFormPanel.hidden = false;
          joinApplicantCard.hidden = true;
          joinCommunityBtn.setAttribute('aria-expanded', 'false');
        }
      } else {
        joinAdminCard.hidden = true;
        if (joinApplicantCard) joinApplicantCard.hidden = false;
        if (joinFormPanel) joinFormPanel.hidden = true;
      }
    }

    updateAdminAuthLinks(authed);
    
    // Re-render events to show/hide delete buttons
    fetchAndRenderEvents();
    await fetchAndRenderJoinRequests();
  } catch (e) {
    isAdminAuthenticated = false;
    if (addEventForm) addEventForm.style.display = 'none';
    if (adminAddEventPrompt) adminAddEventPrompt.style.display = 'none';
    if (joinAdminCard) joinAdminCard.hidden = true;
    if (joinApplicantCard) joinApplicantCard.hidden = false;
    if (joinFormPanel) joinFormPanel.hidden = true;
    updateAdminAuthLinks(false);
  }
}

// Login form submit
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('adminUser').value.trim();
    const p = document.getElementById('adminPass').value;
    try {
      const r = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({username:u,password:p})
      });
      if (!r.ok) throw new Error('login failed');
      // Store username and show profile
      localStorage.setItem('adminUsername', u);
      adminLoginForm.style.display = 'none';
      if (adminProfile) adminProfile.style.display = '';
      if (adminUsername) adminUsername.textContent = u;
      updateAdminAuthLinks(true);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  });
}

// Cancel button
if (adminCancelBtn) {
  adminCancelBtn.addEventListener('click', () => {
    if (loginModal) loginModal.style.display = 'none';
    adminLoginForm.reset();
    adminLoginForm.style.display = '';
    if (adminProfile) adminProfile.style.display = 'none';
  });
}

// Go home button
if (goHomeBtn) {
  goHomeBtn.addEventListener('click', () => {
    if (loginModal) loginModal.style.display = 'none';
    checkAdmin();
    // Scroll to events section
    document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
  });
}

// Handle the shared header/footer Admin Login link.
document.addEventListener('click', async (e) => {
  const authLink = e.target.closest('[data-admin-auth-link]');
  if (!authLink) return;

  if (authLink.dataset.adminState === 'logout') {
    e.preventDefault();
    await performAdminLogout();
  }
});

// Check auth on load and periodically
checkAdmin();
setInterval(checkAdmin, 60 * 1000); // Re-check every 60s

// Initial load and periodic refresh
fetchAndRenderEvents();
setInterval(fetchAndRenderEvents, 30 * 1000);

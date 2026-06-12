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

// Ei block mobile menu open/close ebong nav link click e menu close kore.
if (menuBtn && siteNav) {
  menuBtn.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => siteNav.classList.remove("open"));
  });
}

// Ei block footer e current year show kore.
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

// Ei array home page banner slideshow er image data rakhe.
const bannerSlides = [
  {
    src: "assets/banner/b1.png",
    alt: "SGIPC featured banner 1",
  },
  {
    src: "assets/banner/b2.jpg",
    alt: "SGIPC featured banner 2",
  },
];

let bannerSlideIndex = 0;

// Ei function current banner slide image update kore.
function updateBannerSlide() {
  if (!bannerImage) return;

  const slide = bannerSlides[bannerSlideIndex];
  bannerImage.src = slide.src;
  bannerImage.alt = slide.alt;
}

// Ei block banner previous/next button ebong auto-slide control kore.
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

// Ei block 15 teams card click korle sudhu oi card er details show/hide kore.
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

// Ei observer stat number gulo viewport e ashle count animation chalaye.
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

// Ei observer reveal class element gulo scroll e visible animation dey.
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

// Ei block events/admin/join API integration er jonno base URL set kore.
let API_BASE = '';
try {
  if (location.protocol === 'file:') API_BASE = 'http://localhost:5000';
  else API_BASE = window.location.origin || '';
} catch (e) {
  API_BASE = 'http://localhost:5000';
}

function apiUrl(path) {
  // Path e slash na thakle slash add kore full API URL banay.
  if (!path.startsWith('/')) path = '/' + path;
  if (!API_BASE || API_BASE === 'null') return path;
  return API_BASE.replace(/\/$/, '') + path;
}

// Ei block page er frequently used DOM element reference dhore.
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

// Ei function header/footer er Admin Login link ke login/logout state onujayi update kore.
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

// Ei function admin logout API call kore local state clean kore page reload kore.
async function performAdminLogout() {
  try {
    await fetch(apiUrl('/api/admin/logout'), { method: 'POST', credentials: 'include' });
  } catch {}
  localStorage.removeItem('adminUsername');
  window.location.reload();
}

window.updateAdminAuthLinks = updateAdminAuthLinks;
window.performAdminLogout = performAdminLogout;

// Ei function database theke event ene upcoming/past list render kore.
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

// Ei function UTC/local datetime ke readable browser time e convert kore.
function formatLocal(dtString) {
  try {
    const d = new Date(dtString);
    return d.toLocaleString();
  } catch {
    return dtString;
  }
}

// Ei function upcoming ebong past event HTML render kore.
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
  
  // Ei block admin delete button gulote click listener attach kore.
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

// Ei function admin hole join request database theke ene render kore.
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

// Ei function user input/rendered text ke HTML injection theke safe kore.
function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
}

// Ei block Join the Community button click e applicant form show/hide kore.
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

// Ei block join form submit kore database e request save kore.
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
          // Error parse na hole default message thakbe.
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

// Ei block admin event form submit korle notun event database e add kore.
if (addEventForm) {
  addEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('evtTitle').value.trim();
    const dt = document.getElementById('evtDateTime').value;
    const location = document.getElementById('evtLocation').value.trim();
    const desc = document.getElementById('evtDesc').value.trim();
    if (!title || !dt) return alert('Title and date/time required');

    // Local datetime-local value ke ISO time e convert kora hocche.
    const local = new Date(dt);
    const iso = local.toISOString();

    try {
      const res = await fetch(apiUrl('/api/events'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, location, dateTime: iso })
      });
      if (!res.ok) throw new Error('Failed to add');
      // Add successful hole form clear hoy ebong event list refresh hoy.
      addEventForm.reset();
      fetchAndRenderEvents();
    } catch (err) {
      console.error(err);
      alert('Could not add event');
    }
  });
}

// Ei function admin session check kore UI er admin-only part show/hide kore.
async function checkAdmin() {
  try {
    const res = await fetch(apiUrl('/api/admin/session'), { credentials: 'include' });
    if (!res.ok) throw new Error('session fetch failed');
    const data = await res.json();
    const authed = !!data.authenticated;
    isAdminAuthenticated = authed;
    
    // Admin hole add-event form visible hoy.
    if (addEventForm) addEventForm.style.display = authed ? '' : 'none';
    
    // Events section e logged-in admin name show/hide kora hoy.
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
    
    // Admin state change hole delete button show/hide korte list refresh hoy.
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

// Ei block login page er admin form submit handle kore.
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
      // Login successful hole username store hoy ebong profile section show hoy.
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

// Ei block login modal cancel button handle kore.
if (adminCancelBtn) {
  adminCancelBtn.addEventListener('click', () => {
    if (loginModal) loginModal.style.display = 'none';
    adminLoginForm.reset();
    adminLoginForm.style.display = '';
    if (adminProfile) adminProfile.style.display = 'none';
  });
}

// Ei block login page theke home events section e fire jawar kaj kore.
if (goHomeBtn) {
  goHomeBtn.addEventListener('click', () => {
    if (loginModal) loginModal.style.display = 'none';
    checkAdmin();
    // Home page er events section e smooth scroll kore.
    document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
  });
}

// Ei block shared header/footer Admin Login link ke logout link hisebe handle kore.
document.addEventListener('click', async (e) => {
  const authLink = e.target.closest('[data-admin-auth-link]');
  if (!authLink) return;

  if (authLink.dataset.adminState === 'logout') {
    e.preventDefault();
    await performAdminLogout();
  }
});

// Ei block page load er por ebong proti 60 second e admin session check kore.
checkAdmin();
setInterval(checkAdmin, 60 * 1000);

// Ei block event list first load kore ebong periodically refresh kore.
fetchAndRenderEvents();
setInterval(fetchAndRenderEvents, 30 * 1000);

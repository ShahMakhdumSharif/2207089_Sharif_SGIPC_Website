const menuBtn = document.getElementById("menuBtn");
const siteNav = document.getElementById("siteNav");
const yearNode = document.getElementById("year");
const statNodes = document.querySelectorAll(".stat-value");
const revealNodes = document.querySelectorAll(".reveal");

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
const adminLogoutNavBtn = document.getElementById('adminLogoutNavBtn');
const loginModal = document.getElementById('loginModal');
const goHomeBtn = document.getElementById('goHomeBtn');
const adminAddEventPrompt = document.getElementById('adminAddEventPrompt');
const eventAdminUser = document.getElementById('eventAdminUser');
const eventLogoutBtn = document.getElementById('eventLogoutBtn');
let isAdminAuthenticated = false;

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

function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
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
    const res = await fetch(apiUrl('/api/admin/session'));
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
    
    // Re-render events to show/hide delete buttons
    fetchAndRenderEvents();
  } catch (e) {
    isAdminAuthenticated = false;
    if (addEventForm) addEventForm.style.display = 'none';
    if (adminAddEventPrompt) adminAddEventPrompt.style.display = 'none';
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
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username:u,password:p})
      });
      if (!r.ok) throw new Error('login failed');
      // Store username and show profile
      localStorage.setItem('adminUsername', u);
      adminLoginForm.style.display = 'none';
      if (adminProfile) adminProfile.style.display = '';
      if (adminUsername) adminUsername.textContent = u;
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

// Logout from profile in modal
if (adminLogoutNavBtn) {
  adminLogoutNavBtn.addEventListener('click', async () => {
    try {
      await fetch(apiUrl('/api/admin/logout'), { method: 'POST' });
    } catch {}
    localStorage.removeItem('adminUsername');
    adminLoginForm.style.display = '';
    if (adminProfile) adminProfile.style.display = 'none';
    adminLoginForm.reset();
    if (loginModal) loginModal.style.display = 'none';
    checkAdmin();
  });
}

// Logout from events section
if (eventLogoutBtn) {
  eventLogoutBtn.addEventListener('click', async () => {
    try {
      await fetch(apiUrl('/api/admin/logout'), { method: 'POST' });
    } catch {}
    localStorage.removeItem('adminUsername');
    checkAdmin();
  });
}

// Show login modal when clicking Login in header
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#admin-login') {
    e.preventDefault();
    console.log('Login link clicked, loginModal:', loginModal);
    if (loginModal) {
      loginModal.style.display = 'flex !important';
      loginModal.style.visibility = 'visible';
      console.log('Modal display set to flex');
    } else {
      console.error('loginModal element not found');
    }
    checkAdmin();
  }
});

// Check auth on load and periodically
checkAdmin();
setInterval(checkAdmin, 60 * 1000); // Re-check every 60s

// Initial load and periodic refresh
fetchAndRenderEvents();
setInterval(fetchAndRenderEvents, 30 * 1000);

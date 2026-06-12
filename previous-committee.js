// Ei function API path ke current server origin er sathe full URL banay.
function apiUrl(path) {
  if (!path) return '/';
  if (!path.startsWith('/')) path = '/' + path;
  return window.location.origin + path;
}

// Ei function rendered text ke HTML injection theke safe kore.
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
}

// Ei block previous committee page er main container reference dhore.
const yearsContainer = document.getElementById('previousCommitteeYears');
const previousCommitteeContainer = document.getElementById('previousCommitteeContainer');

// Ei function admin session check kore delete-year button show kora jabe kina set kore.
async function checkAdminSession() {
  try {
    const res = await fetch(await apiUrl('/api/admin/session'), { credentials: 'include' });
    if (!res.ok) { window.isAdminAuthenticated = false; return; }
    const d = await res.json();
    window.isAdminAuthenticated = !!d.authenticated;
    if (window.updateAdminAuthLinks) window.updateAdminAuthLinks(window.isAdminAuthenticated);
  } catch (err) {
    window.isAdminAuthenticated = false;
    if (window.updateAdminAuthLinks) window.updateAdminAuthLinks(false);
  }
}

// Ei function archived year list database theke load kore.
async function loadYears() {
  try {
    const res = await fetch(await apiUrl('/api/previous-committee'));
    if (!res.ok) throw new Error('Failed to load years');
    const years = await res.json();
    renderYearButtons(years);
  } catch (err) {
    console.error('previous committee years error', err);
    yearsContainer.innerHTML = '<p style="color:var(--muted)">No archives available.</p>';
  }
}

// Ei function archived year button list render kore.
function renderYearButtons(years) {
  yearsContainer.innerHTML = '';
  if (!years || years.length === 0) {
    yearsContainer.innerHTML = '<p style="color:var(--muted)">No archives available.</p>';
    return;
  }
  years.forEach(y => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '0.5rem';

    const btn = document.createElement('button');
    btn.className = 'btn btn-ghost';
    btn.textContent = y;
    btn.addEventListener('click', async () => {
      await loadArchive(y);
    });
    wrap.appendChild(btn);

    if (window.isAdminAuthenticated) {
      const del = document.createElement('button');
      del.className = 'btn-delete';
      del.textContent = 'Delete Year';
      del.title = `Delete archive ${y}`;
      del.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm(`Delete archived year ${y}? This cannot be undone.`)) return;
        try {
          const res = await fetch(await apiUrl(`/api/previous-committee/${encodeURIComponent(y)}`), { method: 'DELETE', credentials: 'include' });
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || 'Delete failed');
          }
          await loadYears();
          previousCommitteeContainer.innerHTML = '';
        } catch (err) {
          alert('Error deleting year: ' + err.message);
        }
      });
      wrap.appendChild(del);
    }

    yearsContainer.appendChild(wrap);
  });
}

// Ei function selected year er archived committee load kore.
async function loadArchive(year) {
  try {
    previousCommitteeContainer.innerHTML = '<p style="color:var(--muted)">Loading...</p>';
    let res = await fetch(await apiUrl(`/api/previous-committee/${encodeURIComponent(year)}`));
    if (!res.ok) {
      // Path route fail hole query fallback route try kora hoy.
      res = await fetch(await apiUrl(`/api/previous-committee-by-year?year=${encodeURIComponent(year)}`), { credentials: 'include' });
    }
    if (!res.ok) throw new Error('Failed to load archive');
    const members = await res.json();
    
    renderArchive(members, year);
  } catch (err) {
    console.error('loadPreviousCommitteeArchive err', err);
    previousCommitteeContainer.innerHTML = '<p style="color:var(--muted)">Unable to load archive.</p>';
  }
}

// Ei function archived member list role onujayi card grid e render kore.
function renderArchive(members, year) {
  

  // Prothome role/designation onujayi member group kora hoy.
  const grouped = new Map();
  (Array.isArray(members) ? members : []).forEach(m => {
    const role = m.role || 'Members';
    if (!grouped.has(role)) grouped.set(role, []);
    grouped.get(role).push(m);
  });

  // Container clear kore selected year er heading add kora hoy.
  previousCommitteeContainer.innerHTML = '';
  const yearHeading = document.createElement('h3');
  yearHeading.id = 'archiveYearHeading';
  yearHeading.style.marginBottom = '0.6rem';
  yearHeading.style.color = 'var(--accent-strong)';
  yearHeading.style.fontWeight = '700';
  yearHeading.textContent = year ? `The member for the year: ${year}` : 'The member for the year:';
  previousCommitteeContainer.appendChild(yearHeading);

  // Member na thakle clear empty message dekhano hoy.
  if (grouped.size === 0) {
    const msg = document.createElement('p');
    msg.style.textAlign = 'center';
    msg.style.color = 'var(--muted)';
    msg.style.marginTop = '0.4rem';
    msg.textContent = 'No members archived for this year.';
    previousCommitteeContainer.appendChild(msg);
    return;
  }

  grouped.forEach((arr, role) => {
    const g = document.createElement('div');
    g.className = 'designation-group';
    const h = document.createElement('h2');
    h.textContent = role;
    g.appendChild(h);
    const grid = document.createElement('div');
    grid.className = 'designation-grid';
    arr.forEach(m => {
      const card = document.createElement('article');
      card.className = 'card';
      const photo = document.createElement('div');
      photo.className = 'photo-wrap';
      const img = document.createElement('img');
      img.src = m.picture || 'assets/Anonymous.png';
      img.alt = m.name;
      img.className = 'placeholder';
      const initialsEl = document.createElement('div');
      initialsEl.className = 'initials';
      photo.appendChild(initialsEl);
      photo.appendChild(img);
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `
        <div class="name">${escapeHtml(m.name)}</div>
        <div class="line">Roll: ${escapeHtml(m.roll)}</div>
        <div class="line">Dept: ${escapeHtml(m.department)} — Batch: ${escapeHtml(m.batch)}</div>
      `;
      card.appendChild(photo);
      card.appendChild(meta);
      grid.appendChild(card);
      // Card er photo valid na hole initials fallback show kore.
      processCardPhotoPreviousCommittee(card, m);
    });
    g.appendChild(grid);
    previousCommitteeContainer.appendChild(g);
  });
}

// Ei init block admin check kore year list load kore.
(async () => {
  await checkAdminSession();
  await loadYears();
  // URL query te year thakle oi archive auto-load kora hoy.
  try {
    const params = new URLSearchParams(window.location.search);
    const qy = params.get('year');
    if (qy) await loadArchive(qy);
  } catch (err) {
    // Query parsing error hole page normal thakbe.
  }
})();

// Onno tab/page theke archive signal ashle notun year auto-load hoy.
window.addEventListener('storage', (e) => {
  try {
    if (e.key === 'newArchivedYear' && e.newValue) {
      loadYears().then(() => loadArchive(e.newValue));
      // Signal ekbar use hoye gele remove kora hoy.
      localStorage.removeItem('newArchivedYear');
    }
  } catch (err) {
    // Storage error hole normal page flow cholbe.
  }
});

// Same tab e archive signal thakle page load er somoy handle kora hoy.
try {
  const pending = localStorage.getItem('newArchivedYear');
  if (pending) {
    // Signal clear kore relevant archive load kora hoy.
    localStorage.removeItem('newArchivedYear');
    (async () => { await loadYears(); await loadArchive(pending); })();
  }
} catch (err) {
  // Storage access error hole ignore kora hoy.
}

// Ei function previous committee card er photo/initials process kore.
function processCardPhotoPreviousCommittee(card, member) {
  try {
    const photoWrap = card.querySelector('.photo-wrap');
    if (!photoWrap) return;
    let initialsEl = photoWrap.querySelector('.initials');
    if (!initialsEl) {
      initialsEl = document.createElement('div');
      initialsEl.className = 'initials';
      photoWrap.appendChild(initialsEl);
    }
    const placeholderImg = photoWrap.querySelector('img.placeholder');
    let photoPath = (member && member.picture) ? member.picture : (placeholderImg ? placeholderImg.getAttribute('src') : null);
    if (!photoPath) photoPath = 'assets/Anonymous.png';

    function deriveInitials() {
      if (!initialsEl) return;
      if (initialsEl.textContent.trim()) return;
      const nameNode = card.querySelector('.meta .name');
      if (!nameNode) return;
      const text = nameNode.textContent.trim();
      if (!text) return;
      const parts = text.split(/\s+/).filter(Boolean);
      let initials = '';
      if (parts.length === 1) initials = parts[0].slice(0,2).toUpperCase();
      else initials = (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
      initialsEl.textContent = initials;
    }
    deriveInitials();

    const probe = new Image();
    probe.onload = () => {
      if (placeholderImg) placeholderImg.remove();
      if (initialsEl) initialsEl.style.display = 'none';
      const real = document.createElement('img');
      real.src = photoPath;
      real.alt = (member && member.name) ? member.name : 'Member photo';
      real.style.width = '100%';
      real.style.height = '100%';
      real.style.objectFit = 'cover';
      photoWrap.prepend(real);
    };
    probe.onerror = () => {
      if (initialsEl) initialsEl.style.display = 'flex';
      if (placeholderImg) placeholderImg.style.display = 'none';
    };
    probe.src = photoPath;
  } catch (err) {
    console.error('processCardPhotoPreviousCommittee error', err);
  }
}

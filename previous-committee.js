function apiUrl(path) {
  if (!path) return '/';
  if (!path.startsWith('/')) path = '/' + path;
  return window.location.origin + path;
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
}

const yearsContainer = document.getElementById('previousCommitteeYears');
const previousCommitteeContainer = document.getElementById('previousCommitteeContainer');

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

async function loadArchive(year) {
  try {
    previousCommitteeContainer.innerHTML = '<p style="color:var(--muted)">Loading...</p>';
    let res = await fetch(await apiUrl(`/api/previous-committee/${encodeURIComponent(year)}`));
    if (!res.ok) {
      // try fallback query endpoint
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

function renderArchive(members, year) {
  

  // Build grouping first
  const grouped = new Map();
  (Array.isArray(members) ? members : []).forEach(m => {
    const role = m.role || 'Members';
    if (!grouped.has(role)) grouped.set(role, []);
    grouped.get(role).push(m);
  });

  // Clear container and insert a stable heading (with id for easier DOM inspection)
  previousCommitteeContainer.innerHTML = '';
  const yearHeading = document.createElement('h3');
  yearHeading.id = 'archiveYearHeading';
  yearHeading.style.marginBottom = '0.6rem';
  yearHeading.style.color = 'var(--accent-strong)';
  yearHeading.style.fontWeight = '700';
  yearHeading.textContent = year ? `The member for the year: ${year}` : 'The member for the year:';
  previousCommitteeContainer.appendChild(yearHeading);

  // If no members, show a clear message so the heading isn't the only element
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
      // process photo and initials
      processCardPhotoPreviousCommittee(card, m);
    });
    g.appendChild(grid);
    previousCommitteeContainer.appendChild(g);
  });
}

// init
(async () => {
  await checkAdminSession();
  await loadYears();
  // if year present in query, auto-load it
  try {
    const params = new URLSearchParams(window.location.search);
    const qy = params.get('year');
    if (qy) await loadArchive(qy);
  } catch (err) {
    // ignore
  }
})();

// Listen for archival events from other pages (storage event) to auto-load the new year
window.addEventListener('storage', (e) => {
  try {
    if (e.key === 'newArchivedYear' && e.newValue) {
      loadYears().then(() => loadArchive(e.newValue));
      // remove the flag so it's a one-time signal
      localStorage.removeItem('newArchivedYear');
    }
  } catch (err) {
    // ignore
  }
});

// Also check localStorage on load in case the flag was set in this tab
try {
  const pending = localStorage.getItem('newArchivedYear');
  if (pending) {
    // clear and handle
    localStorage.removeItem('newArchivedYear');
    (async () => { await loadYears(); await loadArchive(pending); })();
  }
} catch (err) {
  // ignore
}

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

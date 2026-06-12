// Ei block initial committee card er photo load kore, photo na thakle initials show kore.
document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.card'));
  cards.forEach(card => {
    const photoWrap = card.querySelector('.photo-wrap');
    const placeholderImg = photoWrap ? photoWrap.querySelector('img.placeholder') : null;
    let photoPath = card.getAttribute('data-photo') || (placeholderImg ? placeholderImg.getAttribute('src') : null);
    if (!photoPath) {
      card.setAttribute('data-photo', 'assets/Anonymous.png');
      photoPath = 'assets/Anonymous.png';
    }
    const initialsEl = photoWrap.querySelector('.initials');
    const nameNode = card.querySelector('.meta .name');

    function deriveInitials() {
      if (!initialsEl) return;
      if (initialsEl.textContent.trim()) return;
      if (!nameNode) return;
      const text = nameNode.textContent.replace(/^Name:\s*/i,'').trim();
      if (!text) return;
      const parts = text.split(/\s+/).filter(Boolean);
      let initials = '';
      if (parts.length === 1) initials = parts[0].slice(0,2).toUpperCase();
      else initials = (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
      initialsEl.textContent = initials;
    }
    deriveInitials();

    if (!photoPath) {
      if (initialsEl) initialsEl.style.display = 'flex';
      if (placeholderImg) placeholderImg.style.display = 'none';
      return;
    }

    const probe = new Image();
    probe.onload = () => {
      if (placeholderImg) placeholderImg.remove();
      if (initialsEl) initialsEl.style.display = 'none';
      const real = document.createElement('img');
      real.src = photoPath;
      real.alt = (nameNode ? nameNode.textContent.replace(/^Name:\s*/i,'') : 'Member photo');
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
  });
});

// Ei function dynamically created card er photo/initials process kore.
function processCardPhoto(card, member) {
  try {
    const photoWrap = card.querySelector('.photo-wrap');
    if (!photoWrap) return;

    // Initials element na thakle create kora hoy.
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
    console.error('processCardPhoto error', err);
  }
}

// Ei block committee page er API integration state ebong DOM reference rakhe.
let addMemberForm, adminMemberPrompt, memberAdminUser, committeeContainer, archiveToPreviousCommitteeBtn;
let isMemberAdminAuthenticated = false;

// Ei function rendered text ke HTML injection theke safe kore.
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
}

// Ei function API path ke current server origin er sathe full URL banay.
function apiUrl(path) {
  if (!path) return '/';
  if (!path.startsWith('/')) path = '/' + path;
  return window.location.origin + path;
}

// Ei function committee page er DOM element gulo cache kore.
function initializeUIElements() {
  addMemberForm = document.getElementById('addMemberForm');
  adminMemberPrompt = document.getElementById('adminMemberPrompt');
  memberAdminUser = document.getElementById('memberAdminUser');
  committeeContainer = document.getElementById('committeeContainer');
  archiveToPreviousCommitteeBtn = document.getElementById('archiveToPreviousCommitteeBtn');
}

// Ei function database theke current committee member ene render kore.
async function fetchAndRenderMembers() {
  try {
    const res = await fetch(apiUrl('/api/committee'), { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch members');
    const members = await res.json();
    renderMembers(members);
  } catch (err) {
    console.error('committee fetch error:', err);
  }
}

// Ei function role/designation onujayi committee member card render kore.
function renderMembers(members) {
  if (!committeeContainer) return;
  
  if (members.length === 0) {
    committeeContainer.innerHTML = '<p style="text-align:center;color:var(--muted);">No committee members.</p>';
    return;
  }

  const groupedMembers = new Map();
  members.forEach(m => {
    const role = m.role || 'Members';
    if (!groupedMembers.has(role)) {
      groupedMembers.set(role, []);
    }
    groupedMembers.get(role).push(m);
  });

  committeeContainer.innerHTML = '';

  groupedMembers.forEach((roleMembers, role) => {
    const groupWrap = document.createElement('div');
    groupWrap.className = 'designation-group';

    const heading = document.createElement('h2');
    heading.textContent = role;
    groupWrap.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'designation-grid';

    roleMembers.forEach(m => {
      const card = document.createElement('article');
      card.className = 'card';
      card.tabIndex = 0;

      const photoWrap = document.createElement('div');
      photoWrap.className = 'photo-wrap';
      const img = document.createElement('img');
      img.src = m.picture || 'assets/Anonymous.png';
      img.alt = m.name;
      img.className = 'placeholder';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      const initialsEl = document.createElement('div');
      initialsEl.className = 'initials';
      photoWrap.appendChild(initialsEl);
      photoWrap.appendChild(img);

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `
        <div class="name">${escapeHtml(m.name)}</div>
        <div class="line">Roll: ${escapeHtml(m.roll)}</div>
        <div class="line">Dept: ${escapeHtml(m.department)} — Batch: ${escapeHtml(m.batch)}</div>
        ${isMemberAdminAuthenticated ? `<button class="btn-delete" data-member-id="${m.id}" style="margin-top:0.5rem;padding:0.4rem 0.8rem;font-size:0.85rem;">Delete</button>` : ''}
      `;

      card.appendChild(photoWrap);
      card.appendChild(meta);
      grid.appendChild(card);
      // Ei card er photo valid kina check kore initials/photo show kora hoy.
      processCardPhoto(card, m);
    });

    groupWrap.appendChild(grid);
    committeeContainer.appendChild(groupWrap);
  });

  if (isMemberAdminAuthenticated) {
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm('Delete this member?')) return;
        const memberId = e.target.dataset.memberId;
        try {
          const res = await fetch(apiUrl(`/api/committee/${memberId}`), { method: 'DELETE', credentials: 'include' });
          if (!res.ok) throw new Error('Delete failed');
          await fetchAndRenderMembers();
        } catch (err) {
          alert('Error deleting member: ' + err.message);
        }
      });
    });
  }
}

// Ei function admin session check kore member add/archive UI show/hide kore.
async function checkMemberAdmin() {
  try {
    const res = await fetch(apiUrl('/api/admin/session'), { credentials: 'include' });
    if (!res.ok) throw new Error('session check failed');
    const data = await res.json();
    isMemberAdminAuthenticated = !!data.authenticated;

    if (addMemberForm) addMemberForm.style.display = isMemberAdminAuthenticated ? 'block' : 'none';
    if (adminMemberPrompt) adminMemberPrompt.style.display = isMemberAdminAuthenticated ? 'block' : 'none';
    if (archiveToPreviousCommitteeBtn) archiveToPreviousCommitteeBtn.style.display = isMemberAdminAuthenticated ? 'inline-block' : 'none';
    if (memberAdminUser) memberAdminUser.textContent = localStorage.getItem('adminUsername') || 'Admin';
    if (window.updateAdminAuthLinks) window.updateAdminAuthLinks(isMemberAdminAuthenticated);

    await fetchAndRenderMembers();
  } catch (e) {
    console.error('session check error:', e.message);
    isMemberAdminAuthenticated = false;
    if (addMemberForm) addMemberForm.style.display = 'none';
    if (adminMemberPrompt) adminMemberPrompt.style.display = 'none';
    if (archiveToPreviousCommitteeBtn) archiveToPreviousCommitteeBtn.style.display = 'none';
    if (window.updateAdminAuthLinks) window.updateAdminAuthLinks(false);
    await fetchAndRenderMembers();
  }
}

// Ei block DOM ready hole UI reference, form handler, admin check initialize kore.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeUIElements();
    setupFormHandlers();
    checkMemberAdmin();
    setInterval(checkMemberAdmin, 60 * 1000);
  });
} else {
  initializeUIElements();
  setupFormHandlers();
  checkMemberAdmin();
  setInterval(checkMemberAdmin, 60 * 1000);
}

// Ei function add member form ebong archive button er event handler set kore.
function setupFormHandlers() {
  // Ei block admin add-member form submit kore current committee te member save kore.
  if (addMemberForm) {
    addMemberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('memName')?.value.trim();
      const roll = document.getElementById('memRoll')?.value.trim();
      const dept = document.getElementById('memDept')?.value.trim();
      const batch = document.getElementById('memBatch')?.value.trim();
      const role = document.getElementById('memRole')?.value.trim();
      const picture = document.getElementById('memPicture')?.value.trim();

      if (!name || !role) return alert('Name and role required');

      try {
        const res = await fetch(apiUrl('/api/committee'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, roll, department: dept, batch, role, picture })
        });
        if (!res.ok) throw new Error('Add failed');
        addMemberForm.reset();
        await fetchAndRenderMembers();
      } catch (err) {
        alert('Error adding member: ' + err.message);
      }
    });
  }

  // Ei block current committee ke previous committee archive e move kore.
  if (archiveToPreviousCommitteeBtn) {
    archiveToPreviousCommitteeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const membersRes = await fetch(apiUrl('/api/committee'), { credentials: 'include' });
        if (!membersRes.ok) throw new Error('Failed to load committee');
        const members = await membersRes.json();
        if (!Array.isArray(members) || members.length === 0) {
          alert('The current committee is empty.');
          return;
        }
      } catch (err) {
        alert('Error checking committee members: ' + err.message);
        return;
      }

      const year = prompt('Enter the year to archive this committee under (e.g. 2025):');
      if (!year) {
        return;
      }
      const y = String(year).trim();
      if (!/^[0-9]{4}$/.test(y)) {
        if (!confirm('Year does not look like YYYY. Continue anyway?')) {
          return;
        }
      }
      try {
        const res = await fetch(apiUrl('/api/previous-committee/archive'), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year: y })
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Archive failed');
        }
        const data = await res.json();
        alert(`Archived ${data.count || 0} members under ${data.year}`);
        // Previous committee page khulle notun year auto-load korar signal save hoy.
        try {
          localStorage.setItem('newArchivedYear', data.year);
        } catch (err) {
          // Storage error hole archive successful thakbe, tai ignore kora hoy.
        }
      } catch (err) {
        alert('Error archiving committee: ' + err.message);
      }
    });
  }
}

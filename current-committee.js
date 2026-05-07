// Renamed from committee-cards.js
// Replace placeholders with real photos if files exist at data-photo.
// Also derive initials fallback and show if image missing.
document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.card'));
  cards.forEach(card => {
    const photoWrap = card.querySelector('.photo-wrap');
    const placeholderImg = photoWrap ? photoWrap.querySelector('img.placeholder') : null;
    // prefer explicit data-photo; otherwise fall back to the placeholder img src (so AnonymousFemale.png is respected)
    let photoPath = card.getAttribute('data-photo') || (placeholderImg ? placeholderImg.getAttribute('src') : null);
    if (!photoPath) {
      // default to the anonymous placeholder for every member
      card.setAttribute('data-photo', 'assets/Anonymous.png');
      photoPath = 'assets/Anonymous.png';
    }
    const initialsEl = photoWrap.querySelector('.initials');
    const nameNode = card.querySelector('.meta .name');

    // derive initials from Name text if initials empty
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
      // no photo path set: show initials
      if (initialsEl) initialsEl.style.display = 'flex';
      if (placeholderImg) placeholderImg.style.display = 'none';
      return;
    }

    // probe whether the file exists by attempting to load an Image
    const probe = new Image();
    probe.onload = () => {
      // file exists — insert the real image at top of photoWrap
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
      // not found — hide placeholder and show initials as fallback OR keep placeholder visible
      if (placeholderImg) {
        // keep placeholder visible to indicate missing photo
        // show initials over placeholder for clarity
        if (initialsEl) {
          initialsEl.style.display = 'flex';
          // make initials sit on top of placeholder
          initialsEl.style.position = 'absolute';
          initialsEl.style.left = 0;
          initialsEl.style.top = 0;
          initialsEl.style.display = 'flex';
          initialsEl.style.alignItems = 'center';
          initialsEl.style.justifyContent = 'center';
        }
      } else if (initialsEl) {
        initialsEl.style.display = 'flex';
      }
    };
    probe.src = photoPath;
  });
});

  // Group cards by designation header at runtime.
  document.addEventListener('DOMContentLoaded', function () {
    const cardsSection = document.querySelector('section.cards');
    if (!cardsSection) return;

    // Find all cards and map by designation text (fallback 'Members')
    const cards = Array.from(cardsSection.querySelectorAll('.card'));
    const groups = new Map();

    cards.forEach(card => {
      const desEl = card.querySelector('.designation');
      const key = desEl ? desEl.textContent.trim() : 'Members';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(card);
    });

    // Clear original cards section
    cardsSection.innerHTML = '';

    // For each group, create a .designation-group with heading and grid
    groups.forEach((groupCards, title) => {
      const groupWrap = document.createElement('div');
      groupWrap.className = 'designation-group';

      const h = document.createElement('h2');
      h.textContent = title;
      groupWrap.appendChild(h);

      const grid = document.createElement('div');
      grid.className = 'designation-grid';

      groupCards.forEach(c => {
        // remove inline designation from card meta to avoid duplication
        const d = c.querySelector('.designation');
        if (d) d.remove();
        grid.appendChild(c);
      });

      groupWrap.appendChild(grid);
      cardsSection.appendChild(groupWrap);
    });
  });


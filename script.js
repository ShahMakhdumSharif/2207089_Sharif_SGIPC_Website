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

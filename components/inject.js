
export async function injectComponents() {
  await inject('header-placeholder', '/components/header.html', 'header');
  await inject('footer-placeholder', '/components/footer.html', 'footer');
  await inject('tile-modal-placeholder', '/components/tile-modal.html', 'tile-modal');
  await hamburger();
  await quickLinksDropdown();
}

async function inject(placeholderId, path, label) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  placeholder.style.display = 'none';

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    placeholder.outerHTML = await res.text();
  } catch (err) {
    console.error(`Failed to load ${label}:`, err);
  }
}

async function hamburger() {
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

async function quickLinksDropdown() {
  const quickLinksDropdown = document.getElementById('quickLinksDropdown');
  const quickLinksToggle = document.getElementById('quickLinksToggle');

  if (!quickLinksDropdown || !quickLinksToggle) return;

  quickLinksToggle.addEventListener('click', event => {
    event.stopPropagation();
    const isOpen = quickLinksDropdown.classList.toggle('is-open');
    quickLinksToggle.setAttribute('aria-expanded', String(isOpen));
  });

  quickLinksDropdown.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
    link.addEventListener('click', () => {
      quickLinksDropdown.classList.remove('is-open');
      quickLinksToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', event => {
    if (!quickLinksDropdown.contains(event.target)) {
      quickLinksDropdown.classList.remove('is-open');
      quickLinksToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

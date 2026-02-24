
export async function injectComponents() {
  await inject('header-placeholder', 'components/header.html', 'header');
  await inject('footer-placeholder', 'components/footer.html', 'footer');
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

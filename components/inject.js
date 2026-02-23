
import { CONFIG } from '../core/config.js';

export async function injectComponents() {
  await inject(CONFIG.injection.headerPlaceholderId, CONFIG.injection.headerPath, 'header');
  await inject(CONFIG.injection.footerPlaceholderId, CONFIG.injection.footerPath, 'footer');
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

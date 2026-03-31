/**
 * municipalities.js
 *
 * Interactive municipalities map for Union County, NJ.
 * SVG paths are traced from the PNG map image (viewBox 0 0 820 530).
 */

import { injectComponents } from '../../components/inject.js';
import { renderTiles } from '../../tile/tile.js';
import { ITEMS } from '../../tile/data/items.js';
import { MUNICIPALITIES, COUNTY_MARKERS } from './municipalityData.js';

// ── State ─────────────────────────────────────────────────
let selectedMunicipalityKey = null;

// Build a lookup map from the MUNICIPALITIES array
const MUNICIPALITY_MAP = Object.fromEntries(
  MUNICIPALITIES.map(m => [m.key, m])
);

const MUNICIPALITY_PATHS = {
  'berkeley-heights': {
    // Far left, mid-height — wedge shape
    d: 'M 22 225 L 68 195 L 95 215 L 110 255 L 100 300 L 62 310 L 28 280 Z'
  },
  'new-providence': {
    // Above Berkeley Heights, small
    d: 'M 68 140 L 130 120 L 155 155 L 140 195 L 95 215 L 68 195 Z'
  },
  'summit': {
    // Upper-left center, large irregular shape
    d: 'M 130 60 L 245 48 L 270 80 L 280 120 L 255 148 L 200 155 L 155 155 L 130 120 Z'
  },
  'springfield': {
    // Center-left, wide band
    d: 'M 255 148 L 365 138 L 400 155 L 390 200 L 360 220 L 295 230 L 255 215 L 245 180 Z'
  },
  'mountainside': {
    // Between Summit and Westfield
    d: 'M 200 155 L 255 148 L 255 215 L 225 240 L 185 250 L 165 220 L 155 185 Z'
  },
  'westfield': {
    // Center, large
    d: 'M 165 255 L 225 240 L 295 230 L 320 260 L 310 320 L 260 350 L 200 360 L 158 330 L 150 285 Z'
  },
  'cranford': {
    // Right of Westfield, center
    d: 'M 320 260 L 390 248 L 420 270 L 430 310 L 395 335 L 345 345 L 310 320 Z'
  },
  'garwood': {
    // Small, between Cranford and Westfield
    d: 'M 310 320 L 345 345 L 340 370 L 305 375 L 295 350 Z'
  },
  'scotch-plains': {
    // Bottom-left, large
    d: 'M 100 300 L 150 285 L 158 330 L 200 360 L 195 415 L 155 440 L 95 430 L 65 390 L 70 345 Z'
  },
  'fanwood': {
    // Small, left of Scotch Plains north
    d: 'M 135 360 L 158 330 L 200 360 L 195 415 L 155 440 L 138 405 Z'
  },
  'plainfield': {
    // Far bottom-left
    d: 'M 28 390 L 70 345 L 95 430 L 88 480 L 35 485 L 12 455 Z'
  },
  'clark': {
    // Bottom center
    d: 'M 260 350 L 310 320 L 305 375 L 340 370 L 370 395 L 390 440 L 340 465 L 275 450 L 250 410 Z'
  },
  'rahway': {
    // Bottom center-right
    d: 'M 370 395 L 430 375 L 475 385 L 490 430 L 460 475 L 390 480 L 360 455 L 340 465 Z'
  },
  'union': {
    // Upper right center, large
    d: 'M 390 155 L 505 148 L 535 170 L 530 220 L 510 245 L 455 260 L 420 270 L 390 248 L 390 200 Z'
  },
  'kenilworth': {
    // Small, right of cranford/union
    d: 'M 420 270 L 455 260 L 480 275 L 490 305 L 470 330 L 430 335 L 420 310 Z'
  },
  'roselle-park': {
    // Small, right of Kenilworth
    d: 'M 480 275 L 530 265 L 550 285 L 545 320 L 510 335 L 480 330 L 470 305 Z'
  },
  'roselle': {
    // Right of Rahway and below Roselle Park
    d: 'M 470 330 L 510 335 L 545 320 L 575 340 L 580 385 L 545 420 L 490 430 L 460 400 L 455 360 Z'
  },
  'linden': {
    // Bottom right, large
    d: 'M 490 430 L 545 420 L 580 385 L 635 395 L 660 435 L 650 490 L 580 505 L 490 500 Z'
  },
  'hillside': {
    // Upper far right, irregular
    d: 'M 535 148 L 630 138 L 700 160 L 710 205 L 670 230 L 610 245 L 555 235 L 530 220 Z'
  },
  'elizabeth': {
    // Far right, large
    d: 'M 630 138 L 780 148 L 800 200 L 795 310 L 760 380 L 700 415 L 660 435 L 635 395 L 610 330 L 610 245 L 670 230 L 710 205 Z'
  },
  'winfield': {
    // Very small, between Clark and Rahway
    d: 'M 430 340 L 455 335 L 460 365 L 445 375 L 425 368 Z'
  }
};


// ── Date Parsing ──────────────────────────────────────────
function parseEventDateTime(item) {
  if (!item.date) return new Date(0);
  const [year, month, day] = item.date.split('-').map(Number);
  let hours = 0, minutes = 0;
  if (item.time) {
    const match = item.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const period = match[3] ? match[3].toUpperCase() : null;
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }
  }
  return new Date(year, month - 1, day, hours, minutes);
}

// ── Event Filtering ───────────────────────────────────────
function getUpcomingMunicipalityEvents(municipalityKey, now = Date.now()) {
  return ITEMS
    .filter(item => item.municipality === municipalityKey)
    .filter(item => parseEventDateTime(item).getTime() >= now)
    .sort((a, b) => parseEventDateTime(a) - parseEventDateTime(b))
    .slice(0, 2);
}

// ── UI Updates ────────────────────────────────────────────
function updateRegionSelection() {
  document.querySelectorAll('.map-region').forEach(el => {
    const isActive = el.dataset.municipalityKey === selectedMunicipalityKey;
    el.classList.toggle('is-active', isActive);
    el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function renderMunicipalityPanel() {
  const titleEl = document.getElementById('municipality-title');
  const iconEl = document.getElementById('muni-title-icon');
  const websiteLinkEl = document.getElementById('municipality-website-link');
  const tilesContainer = document.getElementById('municipality-event-tiles');
  const emptyState = document.getElementById('municipality-empty-state');
  const emptyMessage = document.getElementById('empty-message');
  const eventsLabel = document.getElementById('events-label');
  const eventsCount = document.getElementById('events-count');
  const placeholder = document.getElementById('details-placeholder');

  const muni = MUNICIPALITY_MAP[selectedMunicipalityKey];
  if (!muni) return;

  // Hide placeholder, show content
  if (placeholder) placeholder.hidden = true;

  // Update title and icon
  titleEl.textContent = muni.name;
  if (iconEl) iconEl.textContent = MUNI_ICONS[selectedMunicipalityKey] || '🏙️';

  // Update website link
  websiteLinkEl.href = muni.website;
  websiteLinkEl.style.display = 'inline-block';

  // Get events
  const events = getUpcomingMunicipalityEvents(selectedMunicipalityKey);

  // Reset
  tilesContainer.innerHTML = '';
  emptyState.hidden = true;
  eventsLabel.hidden = true;

  if (events.length > 0) {
    eventsLabel.hidden = false;
    eventsCount.textContent = events.length;
    renderTiles(tilesContainer, events);
  } else {
    emptyState.hidden = false;
    emptyMessage.textContent = `No upcoming events for ${muni.name}.`;
  }

  updateRegionSelection();
}

// ── Municipality Selection ────────────────────────────────
function selectMunicipality(key) {
  if (!MUNICIPALITY_MAP[key]) return;
  selectedMunicipalityKey = key;
  renderMunicipalityPanel();
}

// ── Marker Tooltip ────────────────────────────────────────
let tooltipTimeout = null;

function showMarkerTooltip(marker, svgEl) {
  clearTimeout(tooltipTimeout);
  const tooltip = document.getElementById('marker-tooltip');
  if (!tooltip) return;

  tooltip.querySelector('.marker-tooltip-title').textContent = marker.label;
  tooltip.querySelector('.marker-tooltip-desc').textContent = marker.description || '';
  const link = tooltip.querySelector('.marker-tooltip-link');
  if (marker.link) {
    link.href = marker.link;
    link.style.display = 'inline';
  } else {
    link.style.display = 'none';
  }

  // Position relative to the map-shell
  const shell = document.querySelector('.map-shell');
  const shellRect = shell.getBoundingClientRect();
  const svgRect = svgEl.getBoundingClientRect();

  // Convert percent to pixel position within the SVG
  const px = (marker.x / 100) * svgRect.width + svgRect.left - shellRect.left;
  const py = (marker.y / 100) * svgRect.height + svgRect.top - shellRect.top;

  let left = px + 12;
  let top = py - 12;

  // Keep within shell bounds
  const tooltipW = 224;
  if (left + tooltipW > shellRect.width - 8) {
    left = px - tooltipW - 12;
  }
  if (top < 8) top = 8;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.hidden = false;
  tooltip.style.pointerEvents = 'none';
}

function hideMarkerTooltip() {
  tooltipTimeout = setTimeout(() => {
    const tooltip = document.getElementById('marker-tooltip');
    if (tooltip) tooltip.hidden = true;
  }, 120);
}

// ── Build SVG Map ─────────────────────────────────────────
function initializeMapSVG() {
  const svg = document.getElementById('map-overlay');
  if (!svg) return;

  // ── Municipality regions ──
  Object.entries(MUNICIPALITY_PATHS).forEach(([key, { d }]) => {
    const muni = MUNICIPALITY_MAP[key];
    if (!muni) return;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'map-region');
    g.setAttribute('data-municipality-key', key);
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', `${muni.name} — click to view events`);
    g.setAttribute('aria-pressed', 'false');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    g.appendChild(path);
    svg.appendChild(g);
  });

  // ── County marker pins ──
  COUNTY_MARKERS.forEach(marker => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'county-marker');
    g.setAttribute('data-marker-id', marker.id);
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', marker.label);

    // Convert percent coords to SVG viewBox coords (820 x 530)
    const cx = (marker.x / 100) * 820;
    const cy = (marker.y / 100) * 530;

    // Outer circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'marker-pin-circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', '8');
    g.appendChild(circle);

    // Icon text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'marker-pin-icon');
    text.setAttribute('x', cx);
    text.setAttribute('y', cy);
    text.textContent = marker.icon || '📍';
    g.appendChild(text);

    svg.appendChild(g);
  });

  initializeMapInteractions(svg);
}

function initializeMapInteractions(svg) {
  // Municipality click/keyboard
  svg.querySelectorAll('[data-municipality-key]').forEach(el => {
    el.addEventListener('click', () => {
      selectMunicipality(el.dataset.municipalityKey);
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMunicipality(el.dataset.municipalityKey);
      }
    });
  });

  // Marker hover tooltip
  svg.querySelectorAll('[data-marker-id]').forEach(el => {
    const markerId = el.dataset.markerId;
    const markerData = COUNTY_MARKERS.find(m => m.id === markerId);
    if (!markerData) return;

    el.addEventListener('mouseenter', () => showMarkerTooltip(markerData, svg));
    el.addEventListener('mouseleave', hideMarkerTooltip);
    el.addEventListener('focusin', () => showMarkerTooltip(markerData, svg));
    el.addEventListener('focusout', hideMarkerTooltip);
    el.addEventListener('click', () => {
      if (markerData.link) window.open(markerData.link, '_blank', 'noopener,noreferrer');
    });
    el.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && markerData.link) {
        e.preventDefault();
        window.open(markerData.link, '_blank', 'noopener,noreferrer');
      }
    });
  });

  // Keep tooltip open when hovered directly
  const tooltip = document.getElementById('marker-tooltip');
  if (tooltip) {
    tooltip.addEventListener('mouseenter', () => clearTimeout(tooltipTimeout));
    tooltip.addEventListener('mouseleave', hideMarkerTooltip);
    // Re-enable pointer events so the link inside is clickable
    tooltip.style.pointerEvents = 'all';
  }
}

// ── Init ──────────────────────────────────────────────────
async function initMunicipalitiesPage() {
  await injectComponents();
  initializeMapSVG();

  // Default selection — pick the first municipality with events, or just elizabeth
  const defaultKey =
    MUNICIPALITIES.find(m => getUpcomingMunicipalityEvents(m.key).length > 0)?.key
    ?? 'elizabeth';

  selectMunicipality(defaultKey);
}

initMunicipalitiesPage();
document.querySelectorAll('.dropdown-btn').forEach(btn => {
 btn.addEventListener('click', (e) => {
   e.stopPropagation();

   const dropdown = btn.nextElementSibling;

   document.querySelectorAll('.dropdown-content').forEach(d => {
     if (d !== dropdown) d.classList.remove('show');
   });


   dropdown.classList.toggle('show');
 });
});


window.addEventListener('click', () => {
 document.querySelectorAll('.dropdown-content')
   .forEach(d => d.classList.remove('show'));
});


const appliedFiltersContainer = document.querySelector('.applied-filters');


// Track active filters by id
const activeFilters = new Set();


document.querySelectorAll('.filter').forEach(filterBtn => {
 filterBtn.addEventListener('click', (e) => {
   e.stopPropagation();


   const id = filterBtn.id;
   const label = filterBtn.textContent;


   // If already active → remove
   if (activeFilters.has(id)) {
     activeFilters.delete(id);
     removeAppliedFilter(id);
     filterBtn.classList.remove('active');
   }
   // If not active → add
   else {
     activeFilters.add(id);
     addAppliedFilter(id, label);
     filterBtn.classList.add('active');
   }
 });
});


function addAppliedFilter(id, label) {
 const chip = document.createElement('button');
 chip.className = 'applied-filter';
 chip.textContent = label + ' ✕';
 chip.dataset.filterId = id;


 chip.addEventListener('click', () => {
   activeFilters.delete(id);
   chip.remove();


   // sync dropdown button state
   const originalBtn = document.getElementById(id);
   if (originalBtn) originalBtn.classList.remove('active');
 });


 appliedFiltersContainer.appendChild(chip);
}


function removeAppliedFilter(id) {
 const chip = appliedFiltersContainer.querySelector(
   `[data-filter-id="${id}"]`
 );
 if (chip) chip.remove();
}

function createEventListItem(event) {
  const item = document.createElement('div');
  item.className = 'event-list-item';

  const date = new Date(event.date);
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  item.innerHTML = `
    <div class="tile-card">
      <div class="tile-img">
        <img src="${event.image || 'images/hero1.jpg'}" alt="${event.title}" loading="lazy">
      </div>

      <div class="tile-body">
        <p class="tile-meta">${event.category || 'Event'} · ${event.type || 'Community'}</p>
        <h3 class="tile-title">${event.title}</h3>
        <p class="tile-desc">${event.description}</p>

        <div class="tile-footer">
          <span class="tile-location">${event.location ? `📍 ${event.location}` : ''}</span>
          <a class="tile-link" href="${event.link || '#'}">Learn More →</a>
        </div>
      </div>
    </div>
  `;

  return item;
}



function renderEventList(events) {
  const container = document.querySelector('.events');
  if (!container) return;

  container.innerHTML = '';

  events.forEach(event => {
    container.appendChild(createEventListItem(event));
  });
}

// Attach event listener to the search bar

import { injectComponents } from '/components/inject.js';
import { getEvents }        from '/tile/data/items.js';

async function init() {
  await injectComponents();

  const events = getEvents();
  renderEventList(events);

  const searchInput = document.getElementById('search-input');
  const eventsContainer = document.querySelector('.events');

  function filterEvents(query) {
    const lowerQuery = query.toLowerCase();
    return events.filter(event => {
      const eventData = `
        ${event.title}
        ${event.description}
        ${event.category}
        ${event.location}
        ${event.type || ''}
      `.toLowerCase();
      return eventData.includes(lowerQuery);
    });
  }

  function renderFilteredEvents(query) {
    const filtered = filterEvents(query);
    eventsContainer.innerHTML = '';
    if (filtered.length === 0) {
      eventsContainer.innerHTML = '<p>No events found.</p>';
      return;
    }
    filtered.forEach(event => {
      eventsContainer.appendChild(createEventListItem(event));
    });
  }

  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      renderFilteredEvents(searchInput.value);
    }
  });
}

init();

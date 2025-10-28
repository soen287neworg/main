export function roomCard(room) {
  const badgeClass =
    room.availability === 'available'
      ? 'bg-success-subtle text-success'
      : 'bg-warning-subtle text-warning';

  const id = (room.id ?? '').toString().trim();
  const hasId = id.length > 0;
  const safeHref = hasId ? `./reserve.html?id=${encodeURIComponent(id)}` : '#';

  return `
    <div class="col-12 col-sm-6 col-lg-4 ${room.availability} ${room.category}">
      <div class="resource-card card" data-room-id="${id}">
        <img src="${room.image}" class="card-img-top" alt="${room.title}">
        <div class="card-body">
          <h5 class="card-title">${room.title}</h5>
            <p class="card-subtitle text-muted small">${room.location} • Capacity ${room.capacity} • ${room.note}</p>          <p class="card-text">${room.text}</p>
          <a href="${safeHref}" class="btn btn-primary mt-2 book-now" data-room-id="${id}" ${hasId ? '' : 'aria-disabled="true" tabindex="-1"'}>${hasId ? 'Book Now' : 'Missing ID'}</a>
        </div>
        <span class="badge ${badgeClass} position-absolute top-0 end-0 m-2">${room.badgeText}</span>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  const DB_KEY = "bookingsDB";
  const message = document.getElementById("message");
  const area = document.getElementById("bookingsArea");

  // Show message
  function showMessage(text) {
    message.innerHTML = `<div class="alert alert-info" role="alert">${text}</div>`;
    setTimeout(() => { message.innerHTML = ""; }, 3000);
  }

  // helpers
  function readDB() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || {}; }
    catch { return {}; }
  }
  function writeDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }
  function esc(s) {
    return String(s || "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // transform DB data to array
  function getAllBookings() {
    const db = readDB();
    const out = []; // <-- had been `const out []`
    for (const roomId of Object.keys(db)) { // <-- use roomId consistently
      const days = db[roomId] || {};
      for (const date of Object.keys(days)) {
        for (const b of days[date] || []) {
          out.push({
            id: b.id || null,
            roomId,
            date,
            start: b.start,
            end: b.end,
            // in your app, saveBooking uses: name (user email) and resourceName
            resourceName: b.resourceName || roomId, // <-- fix key name
            userEmail: b.name || "",                // <-- fix key name
            notes: b.notes || ""
          });
        }
      }
    }
    out.sort((a, b) => (a.date + " " + a.start).localeCompare(b.date + " " + b.start));
    return out;
  }

  // Render bookings
  function renderTable() {
    const list = getAllBookings();

    if (!list.length) {
      area.innerHTML = `
        <div class="text-center text-muted py-3">No bookings available.</div>
      `;
      return;
    }

    const rows = list.map(item => `
      <tr>
        <td class="text-nowrap">${esc(item.date)}</td>
        <td class="text-nowrap">${esc(item.start)}–${esc(item.end)}</td>
        <td>${esc(item.resourceName)}</td>
        <td>${esc(item.userEmail)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger btn-cancel"
                  data-id="${esc(item.id || "")}"
                  data-room="${esc(item.roomId)}"
                  data-date="${esc(item.date)}"
                  data-start="${esc(item.start)}"
                  data-end="${esc(item.end)}">
            Cancel
          </button>
        </td>
      </tr>
    `).join("");

    area.innerHTML = `
      <table class="table table-striped table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Resource</th>
            <th>User</th>
            <th class="text-end">Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  // cancel booking (admin)
  function cancelBooking({ roomId, date, id, start, end }) {
    const db = readDB();
    if (!db[roomId] || !db[roomId][date]) return;

    let list = db[roomId][date];

    if (id) {
      list = list.filter(b => b.id !== id);
    } else {
      list = list.filter(b => !(b.start === start && b.end === end));
    }

    db[roomId][date] = list;
    if (db[roomId][date].length === 0) delete db[roomId][date];
    if (Object.keys(db[roomId]).length === 0) delete db[roomId];
    writeDB(db);
  }

  // click: cancel
  area.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-cancel");
    if (!btn) return;
    if (!confirm("Cancel this booking?")) return;

    cancelBooking({
      roomId: btn.dataset.room,
      date: btn.dataset.date,
      id: btn.dataset.id || null,
      start: btn.dataset.start,
      end: btn.dataset.end
    });

    renderTable();
    showMessage("Booking canceled.");
  });

  // init
  renderTable();
});
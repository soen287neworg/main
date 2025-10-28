const DB_KEY = "bookingsDB";
function readDB(){ try { return JSON.parse(localStorage.getItem(DB_KEY)) || {}; } catch { return {}; } }
function writeDB(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

function checkAuth(){
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (localStorage.getItem("loggedIn") !== "true" || !user?.email) {
    location.replace("sign_in.html");
  }
}
function logoutUser(){
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("user");
  location.href = "index.html";
}

function loadBookings(){
  const box = document.getElementById("bookingsArea");
  if (!box) return;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = (user.email || "").toLowerCase();

  const mine = getBookingsByUser(email);
  if (!mine.length){
    box.innerHTML = `<div class="alert alert-secondary">You have no bookings yet.</div>`;
    return;
  }

  mine.sort((a,b)=> (a.date+" "+a.start).localeCompare(b.date+" "+b.start));

  const rows = mine.map(it => `
    <tr>
      <td class="text-nowrap">${it.date}</td>
      <td class="text-nowrap">${it.start}–${it.end}</td>
      <td>${esc(it.resourceName || it.roomId)}</td>
      <td class="text-end">
        <button type="button"
          class="btn btn-sm btn-outline-danger btn-cancel"
          data-id="${it.id || ''}"
          data-room="${it.roomId}"
          data-date="${it.date}"
          data-start="${it.start}"
          data-end="${it.end}">
          Cancel
        </button>
      </td>
    </tr>
  `).join("");

  box.innerHTML = `
    <table class="table table-striped table-hover align-middle mb-0">
      <thead class="table-light">
        <tr><th>Date</th><th>Time</th><th>Resource</th><th class="text-end">Action</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  box.onclick = (e)=>{
    const btn = e.target.closest(".btn-cancel");
    if (!btn) return;
    if (!confirm("Cancel this booking?")) return;

    cancelBooking({
      roomId: btn.dataset.room,
      date: btn.dataset.date,
      id: btn.dataset.id || null,
      start: btn.dataset.start,
      end: btn.dataset.end,
      userEmail: email
    });

    loadBookings(); 
  };
}

function getBookingsByUser(emailLower){
  const db = readDB();
  const out = [];
  for (const roomId of Object.keys(db)){
    const days = db[roomId] || {};
    for (const date of Object.keys(days)){
      for (const b of days[date] || []){
        if ((b.name||"").toLowerCase() === emailLower){
          out.push({
            id: b.id || null,
            roomId,
            date,
            start: b.start,
            end: b.end,
            resourceName: b.resourceName || roomId,
            notes: b.notes || ""
          });
        }
      }
    }
  }
  return out;
}

function cancelBooking({ roomId, date, id, start, end, userEmail }){
  const db = readDB();
  if (!db[roomId] || !db[roomId][date]) return;

  let list = db[roomId][date];

  if (id){
    list = list.filter(b => !(b.id === id && (b.name||"").toLowerCase() === userEmail));
  } else {
    list = list.filter(b => !(
      b.start === start &&
      b.end === end &&
      (b.name||"").toLowerCase() === userEmail
    ));
  }

  db[roomId][date] = list;
  if (db[roomId][date].length === 0) delete db[roomId][date];
  if (Object.keys(db[roomId]).length === 0) delete db[roomId];
  writeDB(db);
}

function esc(s){ return String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }

window.checkAuth = checkAuth;
window.loadBookings = loadBookings;
window.logoutUser = logoutUser;
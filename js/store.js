export function read() {
  try { return JSON.parse(localStorage.getItem("bookingsDB")) || {}; }
  catch { return {}; }
}
export function write(db) {
  localStorage.setItem("bookingsDB", JSON.stringify(db));
}

export function saveBooking({ roomId, date, start, end, name, notes, resourceName, id }) {
  const db = read();
  db[roomId] ||= {};
  db[roomId][date] ||= [];
  db[roomId][date].push({
    id: id || (crypto?.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2)),
    start, end, name,
    notes: notes || '',
    resourceName: resourceName || roomId
  });
  write(db);
}

export function getDayBookings(roomId, date) {
  const db = read();
  return ((db[roomId] || {})[date]) || [];
}

/*const KEY = 'campus_reservations_v1';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}
function write(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function getDayBookings(roomId, dateStr) {
  const db = read();
  return db?.[roomId]?.[dateStr] || [];
}

export function saveBooking({ roomId, date, start, end, name }) {
  const db = read();
  db[roomId] = db[roomId] || {};
  db[roomId][date] = db[roomId][date] || [];
  db[roomId][date].push({ start, end, name });
  write(db);
}

export function clearAll() {
  localStorage.removeItem(KEY);
}*/

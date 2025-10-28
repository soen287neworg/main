// js/auth.js  — unified auth + navbar + profile helpers

(function () {
  // ---- LocalStorage keys
  const USERS_KEY = "users";
  const CURRENT_USER_KEY = "user";
  const LOGGED_IN_KEY = "loggedIn";
  const DB_KEY = "bookingsDB"; // bookings store (used by reserve/admin pages)

  // ---- Helpers
  const readJSON = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  };
  const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const esc = (s) => String(s ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

  // ---- Users
  const getUsers = () => readJSON(USERS_KEY, []);
  const saveUsers = (arr) => writeJSON(USERS_KEY, arr);
  const setCurrentUser = (u) => writeJSON(CURRENT_USER_KEY, u);
  const getCurrentUser = () => readJSON(CURRENT_USER_KEY, null);

  // ---- Navbar swapper
  function renderNavbar() {
    const box = document.getElementById("navButtons");
    if (!box) return;

    const user = getCurrentUser();
    const loggedIn = localStorage.getItem(LOGGED_IN_KEY) === "true" && user?.email;

    if (!loggedIn) {
      box.innerHTML = `
        <a href="sign_in.html" class="btn btn-outline-primary me-2">Sign In</a>
        <a href="sign_up.html" class="btn btn-primary">Sign Up</a>
      `;
      return;
    }

    // Logged in: show My Profile + (optional) Admin + Sign Out
    const isAdmin = !!user.isAdmin;
    const adminLink = isAdmin
      ? `<a href="administrator_hub copie.html" class="btn btn-outline-secondary me-2">Admin</a>`
      : "";

    box.innerHTML = `
      ${adminLink}
      <a href="profile.html" class="btn btn-outline-primary me-2">My Profile</a>
      <button class="btn btn-primary" id="logoutBtn">Sign Out</button>
    `;

    // wire logout button (navbar)
    const btn = document.getElementById("logoutBtn");
    if (btn) btn.addEventListener("click", logoutUser);
  }

  // ---- Auth API (global)
  window.checkAuth = function () {
    const u = getCurrentUser();
    if (localStorage.getItem(LOGGED_IN_KEY) !== "true" || !u?.email) {
      location.replace("sign_in.html");
    }
  };

  window.logoutUser = function () {
    localStorage.removeItem(LOGGED_IN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    location.href = "index.html";
  };

  // ---- Profile: list & cancel user bookings
  window.loadBookings = function () {
    const box = document.getElementById("bookingsArea");
    if (!box) return;

    const user = getCurrentUser();
    const myEmail = (user?.email || "").toLowerCase();
    const db = readJSON(DB_KEY, {});
    const mine = [];

    for (const roomId of Object.keys(db)) {
      const days = db[roomId] || {};
      for (const date of Object.keys(days)) {
        for (const b of days[date] || []) {
          if ((b.name || "").toLowerCase() === myEmail) {
            mine.push({
              id: b.id || null, roomId, date,
              start: b.start, end: b.end,
              resourceName: b.resourceName || roomId,
            });
          }
        }
      }
    }

    if (!mine.length) {
      box.innerHTML = `<div class="alert alert-secondary">You have no bookings yet.</div>`;
      return;
    }

    mine.sort((a,b)=> (a.date+" "+a.start).localeCompare(b.date+" "+b.start));

    box.innerHTML = `
      <table class="table table-striped table-hover align-middle mb-0">
        <thead class="table-light">
          <tr><th>Date</th><th>Time</th><th>Resource</th><th class="text-end">Action</th></tr>
        </thead>
        <tbody>
          ${mine.map(it => `
            <tr>
              <td class="text-nowrap">${esc(it.date)}</td>
              <td class="text-nowrap">${esc(it.start)}–${esc(it.end)}</td>
              <td>${esc(it.resourceName)}</td>
              <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger btn-cancel"
                        data-room="${esc(it.roomId)}" data-date="${esc(it.date)}"
                        data-id="${esc(it.id || "")}" data-start="${esc(it.start)}"
                        data-end="${esc(it.end)}">Cancel</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    box.onclick = (e)=>{
      const btn = e.target.closest(".btn-cancel");
      if (!btn) return;
      if (!confirm("Cancel this booking?")) return;

      // remove from DB (accept id when present; fall back to time window)
      const db2 = readJSON(DB_KEY, {});
      const roomId = btn.dataset.room;
      const date = btn.dataset.date;
      let list = (db2?.[roomId]?.[date]) || [];

      const id = btn.dataset.id;
      const start = btn.dataset.start;
      const end = btn.dataset.end;

      list = id
        ? list.filter(b => b.id !== id)
        : list.filter(b => !(b.start === start && b.end === end && (b.name||"").toLowerCase() === myEmail));

      if (!db2[roomId]) db2[roomId] = {};
      db2[roomId][date] = list;
      if (db2[roomId][date].length === 0) delete db2[roomId][date];
      if (Object.keys(db2[roomId]).length === 0) delete db2[roomId];
      writeJSON(DB_KEY, db2);

      window.loadBookings(); // re-render
    };
  };

  // ---- Page boot (signin / signup / generic)
  document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();

    // Sign In page
    const signInBtn = document.querySelector("button.sign-in");
    if (signInBtn) {
      const form = signInBtn.closest("form");
      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("floatingInput")?.value?.trim().toLowerCase();
        const password = document.getElementById("floatingPassword")?.value ?? "";

        const users = getUsers();
        const found = users.find(u => u.email?.toLowerCase() === email && u.password === password);
        if (!found) { alert("Invalid email or password."); return; }

        setCurrentUser({ email: found.email, isAdmin: !!found.isAdmin });
        localStorage.setItem(LOGGED_IN_KEY, "true");

        if (found.isAdmin) location.href = "administrator_hub copie.html";
        else location.href = "index.html";
      });
    }

    // Sign Up page
    const signUpForm = document.getElementById("signupForm");
    if (signUpForm) {
      signUpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("floatingInput").value.trim();
        const password = document.getElementById("floatingPassword").value;
        const isAdmin = !!document.getElementById("signupAdmin")?.checked;

        const users = getUsers();
        if (users.some(u => u.email?.toLowerCase() === email.toLowerCase())) {
          alert("An account with this email already exists.");
          return;
        }
        users.push({ email, password, isAdmin });
        saveUsers(users);

        setCurrentUser({ email, isAdmin });
        localStorage.setItem(LOGGED_IN_KEY, "true");
        alert("Account created successfully!");

        if (isAdmin) location.href = "administrator_hub copie.html";
        else location.href = "index.html";
      });
    }
  });
})();
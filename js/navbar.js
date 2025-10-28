(function () {
  function renderNav() {
    const box = document.getElementById("navButtons");
    if (!box) return;

    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const user = safeParse(localStorage.getItem("user")) || {};

    if (loggedIn && user.email) {
      box.innerHTML = `
        <a href="profile.html" class="btn btn-outline-primary me-2">My Account</a>
        <button class="btn btn-primary" id="logoutBtn">Sign Out</button>
      `;
      const btn = document.getElementById("logoutBtn");
      if (btn) {
        btn.addEventListener("click", () => {
          localStorage.removeItem("loggedIn");
          localStorage.removeItem("user");
          renderNav();
          window.location.href = "index.html";
        });
      }
    } else {
      box.innerHTML = `
        <a href="sign_in.html" class="btn btn-outline-primary me-2">Sign In</a>
        <a href="sign_up.html" class="btn btn-primary">Sign Up</a>
      `;
    }
  }

  function safeParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  window.addEventListener("DOMContentLoaded", renderNav);
  window.addEventListener("pageshow", renderNav);
  window.addEventListener("storage", (e) => {
    if (!e.key || e.key === "loggedIn" || e.key === "user") renderNav();
  });
})();

(function () {
  function renderNav() {
    const box = document.getElementById("navButtons");
    if (!box) return;

    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const user = safeParse(localStorage.getItem("user")) || {};

    if (loggedIn && user.email) {
      box.innerHTML = `
        <a href="profile.html" class="btn btn-outline-primary me-2">My Account</a>
        <button class="btn btn-primary" id="logoutBtn">Sign Out</button>
      `;

      document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("user");

        alert("You’ve been signed out successfully.");

        window.location.href = "index.html";
      });

    } else {
      box.innerHTML = `
        <a href="sign_in.html" class="btn btn-outline-primary me-2">Sign In</a>
        <a href="sign_up.html" class="btn btn-primary">Sign Up</a>
      `;
    }
  }

  function safeParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  window.addEventListener("DOMContentLoaded", renderNav);
  window.addEventListener("pageshow", renderNav);
  window.addEventListener("storage", (e) => {
    if (!e.key || e.key === "loggedIn" || e.key === "user") renderNav();
  });
})();
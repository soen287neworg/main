document.addEventListener("DOMContentLoaded", function () {
    const area = document.getElementById("admin-content");
    if (!area) return;

    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const isAdmin = loggedIn && user.email === "admin@campus.test";

    if (isAdmin) {
        area.innerHTML = `
            <div class="admin-card card">
            <div class="card-body">
            <h5 class="admin-title">Welcome, Admin!</h5>
            <p class ="admin-muted">Here you can manage the campus room reservations.</p>
            <a href="./manage.html" class="btn btn-primary">Go to Management Page</a>
            </div>
            </div>
        `;
    } else {
        area.innerHTML = `
            <div class="admin-card card">
            <div class="card-body">
            <h5 class="admin-title">Access Denied</h5>
            <p>You do not have permission. Sign in as admin</p>
            <a href="./sign_in.html" class="btn btn-primary">Go to Signin Page</a>
            </div>
            </div>
        `;
    }});
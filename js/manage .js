document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("resource-form");
  const tableBody = document.getElementById("resource-table-body");
  const msg = document.getElementById("message");

  const idField = document.getElementById("resource-id");
  const titleField = document.getElementById("resource-title");
  const categoryField = document.getElementById("resource-category");
  const locationField = document.getElementById("resource-location");
  const capacityField = document.getElementById("resource-capacity");
  const availabilityField = document.getElementById("resource-availability");
  const saveBtn = document.getElementById("save-resource-btn");
  const resetBtn = document.getElementById("reset-form-btn");

  let resources = JSON.parse(localStorage.getItem("resources")) || [];

  function showMessage(text) {
    msg.innerHTML = `<div class="alert alert-info" role="alert">${text}</div>`;
    setTimeout(() => {
      msg.innerHTML = "";
    }, 3000);
  }

  // Display resource table
  function displayResources() {
    tableBody.innerHTML = "";

    if (resources.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-3">No resources available.</td>
        </tr>
      `;
      return;
    }

    resources.forEach((r, index) => {
      const row = document.createElement("tr");
      const blockedText = r.blocked ? "🔒 Blocked" : "";
      row.innerHTML = `
        <td>${r.title}</td>
        <td>${r.category}</td>
        <td>${r.location}</td>
        <td>${r.capacity}</td>
        <td>
          <input type="checkbox" class="availability-toggle" data-index="${index}" ${r.availability === "true" ? "checked" : ""}>
          ${r.availability === "true" ? "✅ Available" : "❌ Not Available"}
          ${blockedText ? `<br><span class="text-danger">${blockedText}</span>` : ""}
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-secondary me-2 edit-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Add/Update Resource
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleField.value.trim();
    const category = categoryField.value;
    const location = locationField.value.trim();
    const capacity = capacityField.value.trim();
    const availability = availabilityField.value;
    const editIndex = idField.value;

    if (!title || !category || !location || !capacity || !availability) {
      showMessage("Please fill in all fields.");
      return;
    }

    const resource = { title, category, location, capacity, availability };

    if (editIndex !== "") {
      resources[Number(editIndex)] = resource;
      showMessage("Resource updated successfully!");
    } else {
      resources.push(resource);
      showMessage("Resource added successfully!");
    }

    localStorage.setItem("resources", JSON.stringify(resources));
    displayResources();
    refreshResourceDropdowns(); // update dropdowns when resources change
    form.reset();
    idField.value = "";
    saveBtn.textContent = "Save Resource";
  });

  // Reset form
  resetBtn.addEventListener("click", () => {
    idField.value = "";
    saveBtn.textContent = "Save Resource";
  });

  // Edit Resource
  tableBody.addEventListener("click", function (event) {
    const editBtn = event.target.closest(".edit-btn");
    if (!editBtn) return;

    const index = Number(editBtn.dataset.index);
    const r = resources[index];

    idField.value = index;
    titleField.value = r.title;
    categoryField.value = r.category;
    locationField.value = r.location;
    capacityField.value = r.capacity;
    availabilityField.value = r.availability;

    saveBtn.textContent = "Update Resource";
    showMessage("Editing mode activated.");
  });

  // Delete Resource
  tableBody.addEventListener("click", function (event) {
    const delBtn = event.target.closest(".delete-btn");
    if (!delBtn) return;

    const index = Number(delBtn.dataset.index);
    if (confirm("Delete this resource?")) {
      resources.splice(index, 1);
      localStorage.setItem("resources", JSON.stringify(resources));
      displayResources();
      refreshResourceDropdowns();
      showMessage("Resource deleted successfully!");
    }
  });

  // ✅ Toggle Availability (ON/OFF)
  tableBody.addEventListener("change", function (event) {
    if (!event.target.classList.contains("availability-toggle")) return;
    const index = event.target.getAttribute("data-index");
    const newState = event.target.checked ? "true" : "false";
    resources[index].availability = newState;
    localStorage.setItem("resources", JSON.stringify(resources));
    displayResources();
  });

  // === 🟢 SCHEDULE & MAINTENANCE SECTION ===
  const scheduleForm = document.getElementById("schedule-form");
  const scheduleResourceSelect = document.getElementById("schedule-resource");
  const workingHoursField = document.getElementById("working-hours");
  const blackoutField = document.getElementById("blackout-dates");

  const blockSelect = document.getElementById("block-resource");
  const blockBtn = document.getElementById("block-btn");
  const unblockBtn = document.getElementById("unblock-btn");

  // Load dropdowns
  function refreshResourceDropdowns() {
    if (!scheduleResourceSelect || !blockSelect) return;

    scheduleResourceSelect.innerHTML = "";
    blockSelect.innerHTML = "";

    resources.forEach((r, i) => {
      const option1 = new Option(r.title, i);
      const option2 = new Option(r.title, i);
      scheduleResourceSelect.appendChild(option1);
      blockSelect.appendChild(option2);
    });
  }

  refreshResourceDropdowns();

  // Handle schedule save
  if (scheduleForm) {
    scheduleForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const idx = scheduleResourceSelect.value;
      const hours = workingHoursField.value.trim();
      const blackout = blackoutField.value.trim();

      if (!hours) {
        showMessage("Please enter working hours.");
        return;
      }

      resources[idx].schedule = {
        hours,
        blackoutDates: blackout.split(",").map((d) => d.trim()).filter(Boolean),
      };

      localStorage.setItem("resources", JSON.stringify(resources));
      showMessage("Schedule saved successfully!");
      scheduleForm.reset();
    });
  }

  // Handle block/unblock
  if (blockBtn && unblockBtn) {
    blockBtn.addEventListener("click", () => {
      const idx = blockSelect.value;
      resources[idx].blocked = true;
      localStorage.setItem("resources", JSON.stringify(resources));
      displayResources();
      showMessage(`Resource "${resources[idx].title}" is blocked.`);
    });

    unblockBtn.addEventListener("click", () => {
      const idx = blockSelect.value;
      resources[idx].blocked = false;
      localStorage.setItem("resources", JSON.stringify(resources));
      displayResources();
      showMessage(`Resource "${resources[idx].title}" is unblocked.`);
    });
  }

  // Initial load
  displayResources();
});

document.addEventListener("DOMContentLoaded", () => {
  const resources = JSON.parse(localStorage.getItem("resources")) || [];
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  document.getElementById("totalResources").textContent = resources.length;
  document.getElementById("totalBookings").textContent = bookings.length;

  // Find the most booked resource
  const countMap = {};
  bookings.forEach(b => {
    countMap[b.resourceName] = (countMap[b.resourceName] || 0) + 1;
  });

  let mostBooked = "N/A";
  let max = 0;
  for (const name in countMap) {
    if (countMap[name] > max) {
      max = countMap[name];
      mostBooked = name;
    }
  }

  document.getElementById("mostBooked").textContent = mostBooked;
});

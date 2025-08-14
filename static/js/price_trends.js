document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("priceChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Tomatoes (₹/kg)",
          data: [30, 28, 27, 29, 31, 30, 29],
          borderColor: "#007bff",
          fill: false
        },
        {
          label: "Onions (₹/kg)",
          data: [25, 26, 24, 24, 23, 22, 22],
          borderColor: "#28a745",
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
});

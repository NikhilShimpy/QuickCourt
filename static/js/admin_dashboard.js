const API = "http://localhost:4000/api/admin";

// Stats
fetch(`${API}/stats`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("totalUsers").textContent = data.totalUsers;
    document.getElementById("totalOwners").textContent = data.totalOwners;
    document.getElementById("totalBookings").textContent = data.totalBookings;
    document.getElementById("activeCourts").textContent = data.activeCourts;
  });

// Booking Trends
fetch(`${API}/booking-trends`)
  .then(res => res.json())
  .then(data => {
    new Chart(document.getElementById("bookingChart"), {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Bookings',
          data: data.data,
          borderColor: '#0d6efd',
          backgroundColor: '#0d6efd33',
          fill: true,
          tension: 0.4
        }]
      }
    });
  });

// Sports Chart
fetch(`${API}/active-sports`)
  .then(res => res.json())
  .then(data => {
    new Chart(document.getElementById("sportsChart"), {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: ['#4cafef', '#ff9800', '#4caf50', '#ff5252']
        }]
      }
    });
  });

// Pending Venues
fetch(`${API}/pending-venues`)
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById("pendingVenues");
    tbody.innerHTML = "";
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No pending venues</td></tr>`;
    } else {
      data.forEach(v => {
        tbody.innerHTML += `
          <tr>
            <td>${v.id}</td>
            <td>${v.name}</td>
            <td>${v.sport}</td>
            <td>
              <button class="btn btn-success btn-sm" onclick="approveVenue(${v.id})">Approve</button>
              <button class="btn btn-danger btn-sm" onclick="rejectVenue(${v.id})">Reject</button>
            </td>
          </tr>
        `;
      });
    }
  });

function approveVenue(id) {
  fetch(`${API}/venue/${id}/approve`, { method: 'POST' }).then(() => location.reload());
}
function rejectVenue(id) {
  fetch(`${API}/venue/${id}/reject`, { method: 'POST' }).then(() => location.reload());
}

// Users Table
fetch(`${API}/users`)
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById("usersTable");
    tbody.innerHTML = "";
    data.forEach(u => {
      tbody.innerHTML += `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td><span class="${u.banned ? 'text-danger' : 'text-success'}">${u.banned ? 'Banned' : 'Active'}</span></td>
          <td>
            ${u.banned 
              ? `<button class="btn btn-warning btn-sm" onclick="unbanUser(${u.id})">Unban</button>`
              : `<button class="btn btn-danger btn-sm" onclick="banUser(${u.id})">Ban</button>`
            }
          </td>
        </tr>
      `;
    });
  });

function banUser(id) {
  fetch(`${API}/user/${id}/ban`, { method: 'POST' }).then(() => location.reload());
}
function unbanUser(id) {
  fetch(`${API}/user/${id}/unban`, { method: 'POST' }).then(() => location.reload());
}

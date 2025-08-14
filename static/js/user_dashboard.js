// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: "AIzaSyDH9cXqMCeNmYbN25aI8ygrsz1AbvmrGm8",
  authDomain: "streetconnect-54453.firebaseapp.com",
  projectId: "streetconnect-54453",
  storageBucket: "streetconnect-54453.appspot.com",
  messagingSenderId: "301987641886",
  appId: "1:301987641886:web:e9fd56c486bb16ecb78c0f",
  measurementId: "G-BLENMZN245"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM elements
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const sidebarToggle = document.getElementById('sidebarToggle');
const courtsContainer = document.getElementById('courts-container');
const topRatedCourtsContainer = document.getElementById('top-rated-courts');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const priceRangeInput = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');
const ratingStars = document.querySelectorAll('#ratingStars i');
const sortBySelect = document.getElementById('sortBy');

// Initialize filters
let filters = {
  searchName: '',
  sportType: '',
  maxPrice: 2000,
  minRating: 0,
  venueTypes: ['indoor', 'outdoor'],
  sortBy: 'rating-desc'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  fetchAndDisplayCourts();
  setupResponsiveBehavior();
});

function initEventListeners() {
  // Sidebar toggle
  sidebarToggle.addEventListener('click', toggleSidebar);
  
  // Price range input
  priceRangeInput.addEventListener('input', updatePriceValue);
  
  // Rating stars
  ratingStars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.getAttribute('data-rating'));
      updateRatingStars(rating);
      filters.minRating = rating;
    });
  });
  
  // Apply filters button
  applyFiltersBtn.addEventListener('click', applyFilters);
  
  // Search input
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    filters.searchName = e.target.value.trim().toLowerCase();
    applyFilters();
  });
  
  // Sport type select
  document.getElementById('sportType').addEventListener('change', (e) => {
    filters.sportType = e.target.value;
    applyFilters();
  });
  
  // Venue type checkboxes
  document.getElementById('indoorCheck').addEventListener('change', updateVenueTypes);
  document.getElementById('outdoorCheck').addEventListener('change', updateVenueTypes);
  
  // Sort by select
  sortBySelect.addEventListener('change', (e) => {
    filters.sortBy = e.target.value;
    applyFilters();
  });
}

function toggleSidebar() {
  sidebar.classList.toggle('collapsed');
  mainContent.classList.toggle('expanded');
  
  const icon = sidebarToggle.querySelector('i');
  if (sidebar.classList.contains('collapsed')) {
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-chevron-right');
  } else {
    icon.classList.remove('fa-chevron-right');
    icon.classList.add('fa-bars');
  }
}

function updatePriceValue() {
  const value = priceRangeInput.value;
  priceValue.textContent = `₹${value}`;
  filters.maxPrice = parseInt(value);
}

function updateRatingStars(rating) {
  ratingStars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function updateVenueTypes() {
  const venueTypes = [];
  if (document.getElementById('indoorCheck').checked) {
    venueTypes.push('indoor');
  }
  if (document.getElementById('outdoorCheck').checked) {
    venueTypes.push('outdoor');
  }
  filters.venueTypes = venueTypes;
}

function applyFilters() {
  const filteredCourts = filterCourts(allCourts);
  displayCourts(filteredCourts);
}

function filterCourts(courts) {
  return courts.filter(court => {
    // Search by name
    if (filters.searchName && !court.name.toLowerCase().includes(filters.searchName)) {
      return false;
    }
    
    // Filter by sport type
    if (filters.sportType && court.sportType.toLowerCase() !== filters.sportType.toLowerCase()) {
      return false;
    }
    
    // Filter by price
    const courtPrice = parseFloat(court.pricingPerHour) || 0;
    if (courtPrice > filters.maxPrice) {
      return false;
    }
    
    // Filter by venue type
    if (filters.venueTypes.length > 0 && !filters.venueTypes.includes(court.venueType.toLowerCase())) {
      return false;
    }
    
    // Filter by rating
    const courtRating = parseFloat(court.rating) || 0;
    if (courtRating < filters.minRating) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort courts
    switch (filters.sortBy) {
      case 'price-asc':
        return (parseFloat(a.pricingPerHour) || 0) - (parseFloat(b.pricingPerHour) || 0);
      case 'price-desc':
        return (parseFloat(b.pricingPerHour) || 0) - (parseFloat(a.pricingPerHour) || 0);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'rating-desc':
      default:
        return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
    }
  });
}

function displayCourts(courts) {
  courtsContainer.innerHTML = '';
  
  if (courts.length === 0) {
    courtsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-basketball-ball"></i>
        <p>No courts found matching your search and filters.</p>
      </div>
    `;
    return;
  }
  
  courts.forEach(court => {
    createCourtCard(court);
  });
}

function createCourtCard(courtData) {
  const courtCard = document.createElement('div');
  courtCard.className = 'court-card';
  
  const rating = parseFloat(courtData.rating) || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  let starsHTML = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHTML += '<i class="fas fa-star"></i>';
    } else if (i === fullStars && hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    } else {
      starsHTML += '<i class="far fa-star"></i>';
    }
  }
  
  // Common image URL fallback
  const commonImageURL = "https://images.unsplash.com/photo-1543357480-c60d400e2ef9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
  const imageUrl = courtData.photos && courtData.photos.length > 0 ? courtData.photos[0] : commonImageURL;
  
  courtCard.innerHTML = `
    <img src="${imageUrl}" alt="${courtData.name}" class="court-image">
    <div class="court-info">
      <div class="court-name">${courtData.name || 'Unknown Court'}</div>
      <div class="court-details">
        <div><strong>Sport:</strong> ${courtData.sportType || 'N/A'}</div>
        <div><strong>Location:</strong> ${courtData.location || 'N/A'}</div>
        <div class="court-price">₹${courtData.pricingPerHour || '0'} / hour</div>
      </div>
      <div class="court-rating">
        <div class="stars">${starsHTML}</div>
        <span>(${rating.toFixed(1)})</span>
      </div>
      <div class="court-timing">
        <strong>Hours:</strong> ${courtData.openTime || 'N/A'} - ${courtData.closeTime || 'N/A'}
      </div>
      <button class="view-details" data-id="${courtData.id}">
        <i class="fas fa-info-circle"></i> View Details
      </button>
    </div>
  `;
  
  courtsContainer.appendChild(courtCard);
  
  // Add click event to view details button
  courtCard.querySelector('.view-details').addEventListener('click', () => {
    window.location.href = `/court-details.html?id=${courtData.id}`;
  });
}

function fetchAndDisplayCourts() {
  showLoading();
  
  db.collection("courts").get()
    .then((querySnapshot) => {
      allCourts = [];
      querySnapshot.forEach((doc) => {
        const courtData = doc.data();
        courtData.id = doc.id;
        allCourts.push(courtData);
      });
      
      applyFilters();
      fetchTopRatedCourts();
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
      courtsContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load courts. Please try again later.</p>
        </div>
      `;
    });
}

function fetchTopRatedCourts() {
  db.collection("courts")
    .orderBy("rating", "desc")
    .limit(3)
    .get()
    .then((querySnapshot) => {
      topRatedCourtsContainer.innerHTML = '';
      
      if (querySnapshot.empty) {
        topRatedCourtsContainer.innerHTML = '<p>No top rated courts found</p>';
        return;
      }
      
      querySnapshot.forEach((doc) => {
        const courtData = doc.data();
        const topCourt = document.createElement('div');
        topCourt.className = 'top-rated-court';
        topCourt.innerHTML = `
          <div>${courtData.name}</div>
          <div class="top-rated-rating">
            <i class="fas fa-star"></i> ${(courtData.rating || 0).toFixed(1)}
          </div>
        `;
        
        topCourt.addEventListener('click', () => {
          filters.searchName = courtData.name.toLowerCase();
          document.getElementById('globalSearch').value = courtData.name;
          applyFilters();
        });
        
        topRatedCourtsContainer.appendChild(topCourt);
      });
    })
    .catch((error) => {
      console.error("Error getting top rated courts: ", error);
      topRatedCourtsContainer.innerHTML = '<p>Error loading top rated courts</p>';
    });
}

function showLoading() {
  courtsContainer.innerHTML = `
    <div class="ph-item">
      <div class="ph-col-12">
        <div class="ph-picture"></div>
        <div class="ph-row">
          <div class="ph-col-6 big"></div>
          <div class="ph-col-4 empty"></div>
          <div class="ph-col-2"></div>
          <div class="ph-col-4"></div>
          <div class="ph-col-8 empty"></div>
          <div class="ph-col-6"></div>
          <div class="ph-col-6 empty"></div>
          <div class="ph-col-12"></div>
        </div>
      </div>
    </div>
    <div class="ph-item">
      <div class="ph-col-12">
        <div class="ph-picture"></div>
        <div class="ph-row">
          <div class="ph-col-6 big"></div>
          <div class="ph-col-4 empty"></div>
          <div class="ph-col-2"></div>
          <div class="ph-col-4"></div>
          <div class="ph-col-8 empty"></div>
          <div class="ph-col-6"></div>
          <div class="ph-col-6 empty"></div>
          <div class="ph-col-12"></div>
        </div>
      </div>
    </div>
  `;
}

function setupResponsiveBehavior() {
  function handleResponsive() {
    if (window.innerWidth <= 992) {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
    } else {
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('expanded');
    }
  }
  
  handleResponsive();
  window.addEventListener('resize', handleResponsive);
}

// Firebase Config (Replace with your actual config)
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// Function to load courts dynamically
async function loadCourts() {
  const container = document.getElementById('courts-container');
  container.innerHTML = '<p>Loading courts...</p>';

  try {
    const querySnapshot = await db.collection('courts').get();
    container.innerHTML = ''; // clear loading text

    querySnapshot.forEach(doc => {
      const court = doc.data();
      const card = `
        <div class="court-card">
          <img src="${court.imageURL || 'https://via.placeholder.com/300x180'}" alt="${court.name}">
          <div class="court-info">
            <h4>${court.name}</h4>
            <p>${court.sport} • ${court.type}</p>
            <p class="price">₹${court.price}/hr</p>
          </div>
        </div>
      `;
      container.innerHTML += card;
    });

    if (container.innerHTML.trim() === '') {
      container.innerHTML = '<p>No courts found.</p>';
    }
  } catch (error) {
    console.error("Error loading courts:", error);
    container.innerHTML = '<p>Error loading courts.</p>';
  }
}

// Load courts when page is ready
document.addEventListener('DOMContentLoaded', loadCourts);

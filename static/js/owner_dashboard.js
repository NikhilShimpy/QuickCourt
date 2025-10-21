import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  deleteDoc,
  updateDoc,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase configuration
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth();

// Global variables
let currentUser = null;
let currentUserEmail = null;
let currentUserId = null;
let currentFacilityId = null;
let existingPhotos = [];
let courtsListener = null;
let facilitiesListener = null;

// DOM elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initAuth();
  initNavigation();
  initEventListeners();
  initCharts();
});

// Authentication initialization
function initAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      currentUserEmail = user.email;
      currentUserId = user.uid;
      
      // Update UI with user info
      document.getElementById('ownerNameDisplay').textContent = user.displayName || 'Owner';
      document.getElementById('profileNameDisplay').textContent = user.displayName || 'Owner';
      document.getElementById('profileEmailDisplay').textContent = user.email;
      
      // Load user data
      loadUserData();
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  });
}

// Navigation initialization
function initNavigation() {
  // Sidebar toggle
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
  });
  
  // Navigation buttons
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      navButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      const targetSection = btn.getAttribute('data-section');
      // Hide all sections
      sections.forEach(sec => sec.classList.remove('active-section'));
      // Show target section
      const sectionToShow = document.getElementById(targetSection);
      if (sectionToShow) {
        sectionToShow.classList.add('active-section');
        
        // Load section-specific data
        loadSectionData(targetSection);
      }
    });
  });
  
  // Logout button
  logoutBtn.addEventListener('click', handleLogout);
}

// Event listeners initialization
function initEventListeners() {
  // Court form
  const courtForm = document.getElementById('courtForm');
  const showCourtFormBtn = document.getElementById('showCourtFormBtn');
  const cancelCourtBtn = document.getElementById('cancelCourtBtn');
  
  showCourtFormBtn.addEventListener('click', () => {
    courtForm.style.display = 'block';
    showCourtFormBtn.style.display = 'none';
    resetCourtForm();
  });
  
  cancelCourtBtn.addEventListener('click', () => {
    courtForm.style.display = 'none';
    showCourtFormBtn.style.display = 'flex';
  });
  
  courtForm.addEventListener('submit', handleCourtSubmit);
  
  // Time validation for court form
  const openTimeInput = document.getElementById('courtOpenTime');
  const closeTimeInput = document.getElementById('courtCloseTime');
  
  openTimeInput.addEventListener('change', validateCourtTimes);
  closeTimeInput.addEventListener('change', validateCourtTimes);
  
  // Facility form
  const facilityForm = document.getElementById('facilityForm');
  const addFacilityBtn = document.getElementById('addFacilityBtn');
  const cancelFacilityBtn = document.getElementById('cancelFacilityBtn');
  
  addFacilityBtn.addEventListener('click', () => {
    facilityForm.style.display = 'block';
    document.getElementById('facilityView').style.display = 'none';
    resetFacilityForm();
    document.getElementById('facilityFormTitle').textContent = 'Add New Facility';
  });
  
  cancelFacilityBtn.addEventListener('click', () => {
    facilityForm.style.display = 'none';
    document.getElementById('facilityView').style.display = 'block';
  });
  
  facilityForm.addEventListener('submit', handleFacilitySubmit);
  
  // Profile form
  const profileForm = document.getElementById('profileForm');
  profileForm.addEventListener('submit', handleProfileSubmit);
  
  // Multi-select dropdown for facilities
  initMultiSelectDropdown();
  
  // Photo previews
  initPhotoPreviews();
}

// Initialize multi-select dropdown
function initMultiSelectDropdown() {
  const selectBox = document.getElementById('selectBox');
  const checkboxes = document.getElementById('checkboxes');
  const otherCheckbox = document.getElementById('otherFacilityCheckbox');
  const otherTextInput = document.getElementById('otherFacilityText');
  const selectedFacilitiesDiv = document.getElementById('selectedFacilities');
  
  // Toggle dropdown visibility
  selectBox.addEventListener('click', (e) => {
    e.stopPropagation();
    checkboxes.classList.toggle('show');
    selectBox.classList.toggle('open');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    checkboxes.classList.remove('show');
    selectBox.classList.remove('open');
  });
  
  // Prevent dropdown close when clicking inside
  checkboxes.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Show/hide "Other" text input
  otherCheckbox.addEventListener('change', () => {
    if (otherCheckbox.checked) {
      otherTextInput.style.display = 'block';
      otherTextInput.focus();
    } else {
      otherTextInput.style.display = 'none';
      otherTextInput.value = '';
      updateSelectedFacilitiesDisplay();
    }
  });
  
  // Update selected facilities display
  function updateSelectedFacilitiesDisplay() {
    const checkedBoxes = checkboxes.querySelectorAll('input[type=checkbox]:checked');
    const selected = [];
    
    checkedBoxes.forEach(cb => {
      if (cb.value === 'Other') {
        if (otherTextInput.value.trim()) {
          selected.push(otherTextInput.value.trim());
        } else {
          selected.push('Other');
        }
      } else {
        selected.push(cb.value);
      }
    });
    
    if (selected.length > 0) {
      selectedFacilitiesDiv.textContent = 'Selected: ' + selected.join(', ');
    } else {
      selectedFacilitiesDiv.textContent = '';
    }
  }
  
  // Listen for changes
  checkboxes.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', updateSelectedFacilitiesDisplay);
  });
  otherTextInput.addEventListener('input', updateSelectedFacilitiesDisplay);
}

// Initialize photo previews
function initPhotoPreviews() {
  // Court photos preview
  const courtPhotosInput = document.getElementById('photos');
  const courtPhotoPreview = document.getElementById('photo-preview');
  
  courtPhotosInput.addEventListener('change', function() {
    courtPhotoPreview.innerHTML = '';
    
    for (const file of this.files) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        courtPhotoPreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Facility photos preview
  const facilityPhotosInput = document.getElementById('facilityPhotos');
  const facilityPhotoPreview = document.getElementById('facility-photo-preview');
  
  facilityPhotosInput.addEventListener('change', function() {
    facilityPhotoPreview.innerHTML = '';
    
    for (const file of this.files) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        facilityPhotoPreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
}

// Load user data
function loadUserData() {
  loadCourts();
  loadFacilities();
  loadBookings();
  loadProfileData();
}

// Load section-specific data
function loadSectionData(section) {
  switch(section) {
    case 'dashboard':
      updateDashboardStats();
      break;
    case 'court-management':
      loadCourts();
      break;
    case 'facility-management':
      loadFacilities();
      break;
    case 'booking-overview':
      loadBookings();
      break;
    case 'profile':
      loadProfileData();
      break;
  }
}

// Load courts from Firestore
function loadCourts() {
  const courtList = document.getElementById('courtList');
  
  // Clear previous listener if exists
  if (courtsListener) {
    courtsListener();
  }
  
  // Set up real-time listener for courts
  const courtsQuery = query(
    collection(db, 'courts'), 
    where('ownerId', '==', currentUserId),
    orderBy('createdAt', 'desc')
  );
  
  courtsListener = onSnapshot(courtsQuery, (snapshot) => {
    courtList.innerHTML = '';
    
    if (snapshot.empty) {
      courtList.innerHTML = `
        <div class="text-center mt-20">
          <p>No courts found. Add your first court to get started!</p>
        </div>
      `;
      return;
    }
    
    snapshot.forEach(doc => {
      const court = doc.data();
      const courtId = doc.id;
      
      const courtCard = document.createElement('div');
      courtCard.className = 'court-card';
      courtCard.innerHTML = `
        <div class="court-card-header">
          <h3>${court.name}</h3>
          <div class="court-actions">
            <button class="edit-court" data-id="${courtId}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-court" data-id="${courtId}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="court-card-body">
          <div class="court-info">
            <div class="court-info-item">
              <span class="court-info-label">Sport:</span>
              <span class="court-info-value">${court.sportType}</span>
            </div>
            <div class="court-info-item">
              <span class="court-info-label">Location:</span>
              <span class="court-info-value">${court.address}</span>
            </div>
            <div class="court-info-item">
              <span class="court-info-label">Hours:</span>
              <span class="court-info-value">${court.openTime} - ${court.closeTime}</span>
            </div>
            <div class="court-info-item">
              <span class="court-info-label">Price:</span>
              <span class="court-info-value court-price">₹${court.pricingPerHour}/hour</span>
            </div>
          </div>
          ${court.facilities && court.facilities.length > 0 ? `
            <div class="court-facilities">
              ${court.facilities.map(facility => 
                `<span class="facility-tag">${facility}</span>`
              ).join('')}
            </div>
          ` : ''}
        </div>
      `;
      
      courtList.appendChild(courtCard);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-court').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courtId = e.currentTarget.getAttribute('data-id');
        editCourt(courtId);
      });
    });
    
    document.querySelectorAll('.delete-court').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courtId = e.currentTarget.getAttribute('data-id');
        deleteCourt(courtId);
      });
    });
    
    // Update active courts count
    document.getElementById('active-courts').textContent = snapshot.size;
  }, (error) => {
    console.error('Error loading courts:', error);
    courtList.innerHTML = `
      <div class="text-center mt-20">
        <p>Error loading courts. Please try again.</p>
      </div>
    `;
  });
}

// Load facilities from Firestore
function loadFacilities() {
  const facilityList = document.getElementById('facilityList');
  
  // Clear previous listener if exists
  if (facilitiesListener) {
    facilitiesListener();
  }
  
  // Set up real-time listener for facilities
  const facilitiesQuery = query(
    collection(db, 'facilities'), 
    where('ownerId', '==', currentUserId),
    orderBy('updatedAt', 'desc')
  );
  
  facilitiesListener = onSnapshot(facilitiesQuery, (snapshot) => {
    facilityList.innerHTML = '';
    
    if (snapshot.empty) {
      facilityList.innerHTML = `
        <div class="text-center mt-20">
          <p>No facilities found. Add your first facility to get started!</p>
        </div>
      `;
      return;
    }
    
    snapshot.forEach(doc => {
      const facility = doc.data();
      const facilityId = doc.id;
      
      const facilityCard = document.createElement('div');
      facilityCard.className = 'facility-card';
      facilityCard.innerHTML = `
        <div class="facility-card-header">
          <h3>${facility.name}</h3>
          <div class="facility-actions">
            <button class="edit-facility" data-id="${facilityId}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-facility" data-id="${facilityId}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="facility-card-body">
          <p><strong>Location:</strong> ${facility.location}</p>
          <p><strong>Description:</strong> ${facility.description || 'N/A'}</p>
          <p><strong>Sports:</strong> ${facility.sportsTypes ? facility.sportsTypes.join(', ') : 'N/A'}</p>
          <p><strong>Amenities:</strong> ${facility.amenities ? facility.amenities.join(', ') : 'N/A'}</p>
          ${facility.photos && facility.photos.length > 0 ? `
            <div class="facility-photos">
              ${facility.photos.slice(0, 3).map(photo => 
                `<img src="${photo}" alt="Facility photo">`
              ).join('')}
              ${facility.photos.length > 3 ? `<span>+${facility.photos.length - 3} more</span>` : ''}
            </div>
          ` : ''}
        </div>
      `;
      
      facilityList.appendChild(facilityCard);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-facility').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const facilityId = e.currentTarget.getAttribute('data-id');
        editFacility(facilityId);
      });
    });
    
    document.querySelectorAll('.delete-facility').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const facilityId = e.currentTarget.getAttribute('data-id');
        deleteFacility(facilityId);
      });
    });
  }, (error) => {
    console.error('Error loading facilities:', error);
    facilityList.innerHTML = `
      <div class="text-center mt-20">
        <p>Error loading facilities. Please try again.</p>
      </div>
    `;
  });
}

// Load bookings from Firestore
async function loadBookings() {
  const bookingTableBody = document.getElementById('bookingTableBody');
  
  try {
    // In a real app, you would query bookings for the owner's courts
    // For now, we'll use mock data
    const mockBookings = [
      {
        id: '1',
        userName: 'Raj Sharma',
        courtName: 'Tennis Court 1',
        date: '2023-06-15',
        time: '14:00 - 16:00',
        duration: '2 hours',
        amount: '₹800',
        status: 'confirmed'
      },
      {
        id: '2',
        userName: 'Priya Patel',
        courtName: 'Basketball Court',
        date: '2023-06-16',
        time: '18:00 - 19:00',
        duration: '1 hour',
        amount: '₹400',
        status: 'pending'
      },
      {
        id: '3',
        userName: 'Amit Kumar',
        courtName: 'Badminton Court',
        date: '2023-06-14',
        time: '10:00 - 11:00',
        duration: '1 hour',
        amount: '₹300',
        status: 'confirmed'
      },
      {
        id: '4',
        userName: 'Neha Singh',
        courtName: 'Tennis Court 2',
        date: '2023-06-17',
        time: '16:00 - 18:00',
        duration: '2 hours',
        amount: '₹800',
        status: 'cancelled'
      }
    ];
    
    bookingTableBody.innerHTML = '';
    
    mockBookings.forEach(booking => {
      const statusClass = `status-${booking.status}`;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${booking.userName}</td>
        <td>${booking.courtName}</td>
        <td>${booking.date}</td>
        <td>${booking.time}</td>
        <td>${booking.duration}</td>
        <td>${booking.amount}</td>
        <td><span class="status-badge ${statusClass}">${booking.status}</span></td>
        <td>
          <button class="court-actions view-booking" data-id="${booking.id}">
            <i class="fas fa-eye"></i>
          </button>
          <button class="court-actions confirm-booking" data-id="${booking.id}">
            <i class="fas fa-check"></i>
          </button>
        </td>
      `;
      bookingTableBody.appendChild(row);
    });
    
    // Update total bookings count
    document.getElementById('total-bookings').textContent = mockBookings.filter(b => b.status === 'confirmed').length;
    
  } catch (error) {
    console.error('Error loading bookings:', error);
    bookingTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">Error loading bookings. Please try again.</td>
      </tr>
    `;
  }
}

// Load profile data
async function loadProfileData() {
  try {
    const profileDocRef = doc(db, 'owner_profiles', currentUserId);
    const profileDoc = await getDoc(profileDocRef);
    
    if (profileDoc.exists()) {
      const profileData = profileDoc.data();
      
      // Pre-fill profile form
      document.getElementById('profileName').value = profileData.name || '';
      document.getElementById('profileEmail').value = profileData.email || currentUserEmail;
      document.getElementById('profilePhone').value = profileData.phone || '';
      document.getElementById('profileBusiness').value = profileData.businessName || '';
      document.getElementById('profileAddress').value = profileData.address || '';
      
      // Update notification preferences
      if (profileData.notifications) {
        document.getElementById('emailNotifications').checked = profileData.notifications.email || false;
        document.getElementById('smsNotifications').checked = profileData.notifications.sms || false;
        document.getElementById('promotionalEmails').checked = profileData.notifications.promotional || false;
      }
    } else {
      // Set default values if no profile exists
      document.getElementById('profileName').value = currentUser.displayName || '';
      document.getElementById('profileEmail').value = currentUserEmail;
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// Handle court form submission
async function handleCourtSubmit(e) {
  e.preventDefault();
  
  // Validate times
  if (!validateCourtTimes()) {
    return;
  }
  
  // Gather form data
  const courtName = document.getElementById('courtName').value.trim();
  const courtAddress = document.getElementById('courtAddress').value.trim();
  const courtDescription = document.getElementById('courtDescription').value.trim();
  const courtSportType = document.getElementById('courtSportType').value;
  const courtPricing = parseFloat(document.getElementById('courtPricing').value);
  const openTime = document.getElementById('courtOpenTime').value;
  const closeTime = document.getElementById('courtCloseTime').value;
  const courtBlockedSlots = document.getElementById('courtBlockedSlots').value.trim();
  
  // Gather selected facilities
  const checkedBoxes = document.querySelectorAll('#checkboxes input[type=checkbox]:checked');
  const facilities = [];
  
  checkedBoxes.forEach(cb => {
    if (cb.value === 'Other') {
      const otherText = document.getElementById('otherFacilityText').value.trim();
      if (otherText) {
        facilities.push(otherText);
      } else {
        facilities.push('Other');
      }
    } else {
      facilities.push(cb.value);
    }
  });
  
  // Basic validation
  if (!courtName || !courtAddress || !courtSportType || isNaN(courtPricing)) {
    alert('Please fill all required fields correctly.');
    return;
  }
  
  if (facilities.length === 0) {
    alert('Please select at least one facility.');
    return;
  }
  
  try {
    // Upload photos if any
    const photoFiles = document.getElementById('photos').files;
    let photoUrls = [];
    
    if (photoFiles.length > 0) {
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const storageRef = ref(storage, `court_photos/${currentUserId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        photoUrls.push(downloadURL);
      }
    }
    
    // Save to Firestore
    const courtData = {
      name: courtName,
      address: courtAddress,
      description: courtDescription,
      sportType: courtSportType,
      pricingPerHour: courtPricing,
      openTime: openTime,
      closeTime: closeTime,
      blockedSlots: courtBlockedSlots,
      facilities: facilities,
      photos: photoUrls,
      ownerEmail: currentUserEmail,
      ownerId: currentUserId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'courts'), courtData);
    
    // Reset form and show success message
    resetCourtForm();
    document.getElementById('courtForm').style.display = 'none';
    document.getElementById('showCourtFormBtn').style.display = 'flex';
    
    showNotification('Court added successfully!', 'success');
    
  } catch (error) {
    console.error('Error adding court:', error);
    showNotification('Failed to add court. Please try again.', 'error');
  }
}

// Handle facility form submission
async function handleFacilitySubmit(e) {
  e.preventDefault();
  
  // Gather form data
  const name = document.getElementById('facilityName').value.trim();
  const location = document.getElementById('facilityLocation').value.trim();
  const description = document.getElementById('facilityDescription').value.trim();
  const sportsTypes = document.getElementById('facilitySports').value.split(',').map(s => s.trim()).filter(s => s);
  const amenities = document.getElementById('facilityAmenities').value.split(',').map(s => s.trim()).filter(s => s);
  const photoFiles = document.getElementById('facilityPhotos').files;
  
  // Basic validation
  if (!name || !location) {
    alert('Please fill all required fields.');
    return;
  }
  
  try {
    let photoUrls = [...existingPhotos];
    
    // Upload new photos if any
    if (photoFiles.length > 0) {
      photoUrls = [];
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const storageRef = ref(storage, `facility_photos/${currentUserId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        photoUrls.push(downloadURL);
      }
    }
    
    const facilityData = {
      name,
      location,
      description,
      sportsTypes,
      amenities,
      photos: photoUrls,
      ownerEmail: currentUserEmail,
      ownerId: currentUserId,
      updatedAt: serverTimestamp()
    };
    
    // Update or create facility
    if (currentFacilityId) {
      await updateDoc(doc(db, 'facilities', currentFacilityId), facilityData);
      showNotification('Facility updated successfully!', 'success');
    } else {
      await addDoc(collection(db, 'facilities'), facilityData);
      showNotification('Facility added successfully!', 'success');
    }
    
    // Reset form and show facilities view
    resetFacilityForm();
    document.getElementById('facilityForm').style.display = 'none';
    document.getElementById('facilityView').style.display = 'block';
    
  } catch (error) {
    console.error('Error saving facility:', error);
    showNotification('Failed to save facility. Please try again.', 'error');
  }
}

// Handle profile form submission
async function handleProfileSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('profileName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const businessName = document.getElementById('profileBusiness').value.trim();
  const address = document.getElementById('profileAddress').value.trim();
  const emailNotifications = document.getElementById('emailNotifications').checked;
  const smsNotifications = document.getElementById('smsNotifications').checked;
  const promotionalEmails = document.getElementById('promotionalEmails').checked;
  
  // Basic validation
  if (!name || !email) {
    showNotification('Name and Email are required.', 'error');
    return;
  }
  
  try {
    // Update Firebase Auth profile
    await updateProfile(currentUser, {
      displayName: name
    });
    
    // Save to Firestore
    const profileData = {
      name: name,
      email: email,
      phone: phone,
      businessName: businessName,
      address: address,
      notifications: {
        email: emailNotifications,
        sms: smsNotifications,
        promotional: promotionalEmails
      },
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'owner_profiles', currentUserId), profileData, { merge: true });
    
    // Update UI
    document.getElementById('ownerNameDisplay').textContent = name;
    document.getElementById('profileNameDisplay').textContent = name;
    
    showNotification('Profile updated successfully!', 'success');
    
  } catch (error) {
    console.error('Error updating profile:', error);
    showNotification('Failed to update profile. Please try again.', 'error');
  }
}

// Edit court
async function editCourt(courtId) {
  try {
    const courtDoc = await getDoc(doc(db, 'courts', courtId));
    
    if (courtDoc.exists()) {
      const court = courtDoc.data();
      
      // Pre-fill court form
      document.getElementById('courtName').value = court.name || '';
      document.getElementById('courtAddress').value = court.address || '';
      document.getElementById('courtDescription').value = court.description || '';
      document.getElementById('courtSportType').value = court.sportType || '';
      document.getElementById('courtPricing').value = court.pricingPerHour || '';
      document.getElementById('courtOpenTime').value = court.openTime || '';
      document.getElementById('courtCloseTime').value = court.closeTime || '';
      document.getElementById('courtBlockedSlots').value = court.blockedSlots || '';
      
      // Pre-select facilities
      const checkboxes = document.querySelectorAll('#checkboxes input[type=checkbox]');
      checkboxes.forEach(cb => {
        cb.checked = court.facilities && court.facilities.includes(cb.value);
      });
      
      // Handle "Other" facility
      const otherCheckbox = document.getElementById('otherFacilityCheckbox');
      const otherTextInput = document.getElementById('otherFacilityText');
      
      if (court.facilities) {
        const otherFacilities = court.facilities.filter(f => 
          !Array.from(checkboxes).map(c => c.value).includes(f)
        );
        
        if (otherFacilities.length > 0) {
          otherCheckbox.checked = true;
          otherTextInput.style.display = 'block';
          otherTextInput.value = otherFacilities[0];
        }
      }
      
      updateSelectedFacilitiesDisplay();
      
      // Show court form
      document.getElementById('courtForm').style.display = 'block';
      document.getElementById('showCourtFormBtn').style.display = 'none';
      
      // Scroll to form
      document.getElementById('courtForm').scrollIntoView({ behavior: 'smooth' });
      
      // Change form to update mode
      const submitBtn = document.querySelector('#courtForm .btn-primary');
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Court';
      submitBtn.onclick = async (e) => {
        e.preventDefault();
        await updateCourt(courtId);
      };
    }
  } catch (error) {
    console.error('Error loading court for editing:', error);
    showNotification('Failed to load court details.', 'error');
  }
}

// Update court
async function updateCourt(courtId) {
  // Similar to handleCourtSubmit but with updateDoc instead of addDoc
  // Implementation would be similar to handleCourtSubmit but using updateDoc
  showNotification('Update court functionality would be implemented here.', 'info');
}

// Edit facility
async function editFacility(facilityId) {
  try {
    const facilityDoc = await getDoc(doc(db, 'facilities', facilityId));
    
    if (facilityDoc.exists()) {
      const facility = facilityDoc.data();
      currentFacilityId = facilityId;
      
      // Pre-fill facility form
      document.getElementById('facilityName').value = facility.name || '';
      document.getElementById('facilityLocation').value = facility.location || '';
      document.getElementById('facilityDescription').value = facility.description || '';
      document.getElementById('facilitySports').value = facility.sportsTypes ? facility.sportsTypes.join(', ') : '';
      document.getElementById('facilityAmenities').value = facility.amenities ? facility.amenities.join(', ') : '';
      
      // Store existing photos for potential re-use
      existingPhotos = facility.photos || [];
      
      // Show existing photos in preview
      const preview = document.getElementById('facility-photo-preview');
      preview.innerHTML = '';
      existingPhotos.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        preview.appendChild(img);
      });
      
      // Update form title and show form
      document.getElementById('facilityFormTitle').textContent = 'Edit Facility';
      document.getElementById('facilityForm').style.display = 'block';
      document.getElementById('facilityView').style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading facility for editing:', error);
    showNotification('Failed to load facility details.', 'error');
  }
}

// Delete court
async function deleteCourt(courtId) {
  if (confirm('Are you sure you want to delete this court? This action cannot be undone.')) {
    try {
      await deleteDoc(doc(db, 'courts', courtId));
      showNotification('Court deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting court:', error);
      showNotification('Failed to delete court. Please try again.', 'error');
    }
  }
}

// Delete facility
async function deleteFacility(facilityId) {
  if (confirm('Are you sure you want to delete this facility? This will also delete all associated courts.')) {
    try {
      await deleteDoc(doc(db, 'facilities', facilityId));
      showNotification('Facility deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting facility:', error);
      showNotification('Failed to delete facility. Please try again.', 'error');
    }
  }
}

// Validate court times
function validateCourtTimes() {
  const openTimeInput = document.getElementById('courtOpenTime');
  const closeTimeInput = document.getElementById('courtCloseTime');
  
  const openTime = openTimeInput.value;
  const closeTime = closeTimeInput.value;
  
  if (!openTime || !closeTime) {
    return false;
  }
  
  // Convert "HH:MM" to minutes since midnight
  function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }
  
  if (timeToMinutes(closeTime) <= timeToMinutes(openTime)) {
    alert('Close Time must be later than Open Time. Please select valid times.');
    closeTimeInput.focus();
    return false;
  }
  
  return true;
}

// Reset court form
function resetCourtForm() {
  document.getElementById('courtForm').reset();
  document.getElementById('photo-preview').innerHTML = '';
  document.getElementById('selectedFacilities').textContent = '';
  
  // Reset multi-select dropdown
  const checkboxes = document.querySelectorAll('#checkboxes input[type=checkbox]');
  checkboxes.forEach(cb => {
    cb.checked = false;
  });
  document.getElementById('otherFacilityText').style.display = 'none';
  document.getElementById('otherFacilityText').value = '';
}

// Reset facility form
function resetFacilityForm() {
  document.getElementById('facilityForm').reset();
  document.getElementById('facility-photo-preview').innerHTML = '';
  existingPhotos = [];
  currentFacilityId = null;
}

// Update selected facilities display
function updateSelectedFacilitiesDisplay() {
  const checkedBoxes = document.querySelectorAll('#checkboxes input[type=checkbox]:checked');
  const selected = [];
  
  checkedBoxes.forEach(cb => {
    if (cb.value === 'Other') {
      const otherText = document.getElementById('otherFacilityText').value.trim();
      if (otherText) {
        selected.push(otherText);
      } else {
        selected.push('Other');
      }
    } else {
      selected.push(cb.value);
    }
  });
  
  const selectedFacilitiesDiv = document.getElementById('selectedFacilities');
  if (selected.length > 0) {
    selectedFacilitiesDiv.textContent = 'Selected: ' + selected.join(', ');
  } else {
    selectedFacilitiesDiv.textContent = '';
  }
}

// Update dashboard stats
function updateDashboardStats() {
  // In a real app, these would be calculated from actual data
  // For now, we'll use mock data
  const totalBookings = 24;
  const activeCourts = 5;
  const earnings = 12400;
  const avgRating = 4.7;
  
  document.getElementById('total-bookings').textContent = totalBookings;
  document.getElementById('active-courts').textContent = activeCourts;
  document.getElementById('earnings').textContent = `₹${earnings}`;
  document.getElementById('avg-rating').textContent = avgRating;
}

// Initialize charts
function initCharts() {
  // Booking Trends Chart
  const bookingTrendsCtx = document.getElementById('bookingTrendsChart').getContext('2d');
  const bookingTrendsChart = new Chart(bookingTrendsCtx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Bookings',
        data: [12, 19, 8, 15, 12, 25, 18],
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
  
  // Peak Hours Chart
  const peakHoursCtx = document.getElementById('peakHoursChart').getContext('2d');
  const peakHoursChart = new Chart(peakHoursCtx, {
    type: 'bar',
    data: {
      labels: ['6-8', '8-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22'],
      datasets: [{
        label: 'Bookings',
        data: [5, 12, 8, 6, 15, 22, 18, 10],
        backgroundColor: [
          'rgba(67, 97, 238, 0.7)',
          'rgba(67, 97, 238, 0.7)',
          'rgba(67, 97, 238, 0.7)',
          'rgba(67, 97, 238, 0.7)',
          'rgba(114, 9, 183, 0.7)',
          'rgba(247, 37, 133, 0.7)',
          'rgba(67, 97, 238, 0.7)',
          'rgba(67, 97, 238, 0.7)'
        ],
        borderColor: [
          'rgba(67, 97, 238, 1)',
          'rgba(67, 97, 238, 1)',
          'rgba(67, 97, 238, 1)',
          'rgba(67, 97, 238, 1)',
          'rgba(114, 9, 183, 1)',
          'rgba(247, 37, 133, 1)',
          'rgba(67, 97, 238, 1)',
          'rgba(67, 97, 238, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
  
  // Update charts when range changes
  document.getElementById('booking-trends-range').addEventListener('change', function() {
    // In a real app, this would fetch new data based on the selected range
    // For now, we'll just update with mock data
    const range = this.value;
    let newData;
    
    if (range === 'weekly') {
      newData = [45, 52, 38, 60, 55, 70, 65];
    } else if (range === 'monthly') {
      newData = [320, 350, 280, 410, 390, 450, 420, 380, 410, 390, 420, 460];
    } else {
      newData = [12, 19, 8, 15, 12, 25, 18];
    }
    
    bookingTrendsChart.data.datasets[0].data = newData;
    bookingTrendsChart.update();
  });
}

// Show notification
function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add styles for notification
  if (!document.querySelector('.notification-styles')) {
    const style = document.createElement('style');
    style.className = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 90px;
        right: 30px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        z-index: 10000;
        border-left: 4px solid #4361ee;
        animation: slideInRight 0.3s ease;
      }
      .notification.success {
        border-left-color: #4cc9f0;
      }
      .notification.error {
        border-left-color: #f94144;
      }
      .notification.info {
        border-left-color: #f8961e;
      }
      .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #8d99ae;
        padding: 5px;
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
  
  // Close button
  notification.querySelector('.notification-close').addEventListener('click', () => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });
}

// Handle logout
function handleLogout() {
  if (confirm('Are you sure you want to log out?')) {
    signOut(auth).then(() => {
      window.location.href = '/login';
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  }
}

// Utility function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Utility function to format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}
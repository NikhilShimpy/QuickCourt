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
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDH9cXqMCeNmYbN25aI8ygrsz1AbvmrGm8",
  authDomain: "streetconnect-54453.firebaseapp.com",
  projectId: "streetconnect-54453",
  storageBucket: "streetconnect-54453.appspot.com",
  messagingSenderId: "301987641886",
  appId: "1:301987641886:web:e9fd56c486bb16ecb78c0f",
  measurementId: "G-BLENMZN245"
};
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";



// Initialize Firebase Auth


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const auth = getAuth();

let currentUserEmail = null;
let currentUserId = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserEmail = user.email;
    loadUserCourts();  // Call this here after user info available
  } else {
    alert("Please log in to manage your courts.");
  }
});






function loadGoogleMapsAPI(apiKey, callback) {
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callback.name}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}


function initCourtMap() {
  const mapDiv = document.getElementById("courtMap");
  if (!mapDiv) return;

  // Default location (center India)
  const defaultLocation = { lat: 20.5937, lng: 78.9629 };

  const map = new google.maps.Map(mapDiv, {
    zoom: 5,
    center: defaultLocation,
  });

  let marker = new google.maps.Marker({
    position: defaultLocation,
    map,
    draggable: true,
  });

  const geocoder = new google.maps.Geocoder();

  // Update input fields with formatted address and lat/lng
  function updateAddress(latLng) {
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addrInput = document.getElementById("courtAddress");
        const latInput = document.getElementById("courtLat");
        const lngInput = document.getElementById("courtLng");
        if (addrInput) addrInput.value = results[0].formatted_address;
        if (latInput) latInput.value = latLng.lat();
        if (lngInput) lngInput.value = latLng.lng();
      }
    });
  }

  // Update on marker drag end
  marker.addListener("dragend", () => {
    updateAddress(marker.getPosition());
  });

  // Update on map click
  map.addListener("click", (e) => {
    marker.setPosition(e.latLng);
    updateAddress(e.latLng);
  });

  // Initialize inputs with default location address
  updateAddress(marker.getPosition());
}

// Call map load with your Google Maps API key (replace below with your key)
loadGoogleMapsAPI("AIzaSyBaJPB6ZuXrcqA9S7EMR77nymbd8bCFhfE", initCourtMap);


// On window load, also load your Firebase data etc.
window.addEventListener("load", () => {
  // your existing load functions:
  loadFacilities();
  loadFacilityOptions();
  loadCourts();
  loadOwnerProfile();
  // Map init will be called by the Google Maps callback automatically
});

// Sidebar navigation toggle
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    navButtons.forEach(b => b.classList.remove("active"));
    // Add active class to clicked button
    btn.classList.add("active");

    const targetSection = btn.getAttribute("data-section");
    // Hide all sections
    sections.forEach(sec => sec.classList.remove("active-section"));
    // Show target section
    const sectionToShow = document.getElementById(targetSection);
    if (sectionToShow) {
      sectionToShow.classList.add("active-section");
    }
  });
});

// time error 
const courtForm = document.getElementById("courtForm");
const openTimeInput = document.getElementById("courtOpenTime");
const closeTimeInput = document.getElementById("courtCloseTime");

// Helper: convert "HH:MM" string to minutes since midnight
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// On form submit validate times
courtForm.addEventListener("submit", (e) => {
  const openTime = openTimeInput.value;
  const closeTime = closeTimeInput.value;

  if (!openTime || !closeTime) {
    alert("Please select both Open Time and Close Time.");
    e.preventDefault();
    return;
  }

  if (timeToMinutes(closeTime) <= timeToMinutes(openTime)) {
    alert("Close Time must be later than Open Time. Please select valid times.");
    e.preventDefault();
    closeTimeInput.focus();
    return;
  }

  // proceed with submission if valid...
});

// Optional: On openTime change, update closeTime min attribute to openTime + 1 minute
openTimeInput.addEventListener("change", () => {
  const openMinutes = timeToMinutes(openTimeInput.value);
  let newMinHours = Math.floor(openMinutes / 60);
  let newMinMinutes = openMinutes % 60 + 1;

  if (newMinMinutes === 60) {
    newMinMinutes = 0;
    newMinHours = (newMinHours + 1) % 24;
  }

  // Format as HH:MM
  const minTimeStr = `${newMinHours.toString().padStart(2,"0")}:${newMinMinutes.toString().padStart(2,"0")}`;
  closeTimeInput.min = minTimeStr;

  // If current closeTime is invalid (earlier or equal), reset it
  if (closeTimeInput.value && timeToMinutes(closeTimeInput.value) <= timeToMinutes(openTimeInput.value)) {
    closeTimeInput.value = "";
  }
});

// --- Facility Multi-select Dropdown Logic ---

const selectBox = document.getElementById("selectBox");
const checkboxes = document.getElementById("checkboxes");
const otherCheckbox = document.getElementById("otherFacilityCheckbox");
const otherTextInput = document.getElementById("otherFacilityText");
const selectedFacilitiesDiv = document.getElementById("selectedFacilities");

// Toggle dropdown visibility
selectBox.addEventListener("click", () => {
  checkboxes.style.display = checkboxes.style.display === "block" ? "none" : "block";
});

// Show/hide "Other" text input based on checkbox
otherCheckbox.addEventListener("change", () => {
  if (otherCheckbox.checked) {
    otherTextInput.style.display = "block";
    otherTextInput.focus();
  } else {
    otherTextInput.style.display = "none";
    otherTextInput.value = "";
    updateSelectedFacilitiesDisplay();
  }
});

// Update selected facilities display below dropdown
function updateSelectedFacilitiesDisplay() {
  const checkedBoxes = checkboxes.querySelectorAll("input[type=checkbox]:checked");
  const selected = [];

  checkedBoxes.forEach(cb => {
    if (cb.value === "Other") {
      if (otherTextInput.value.trim()) {
        selected.push(otherTextInput.value.trim());
      } else {
        selected.push("Other");
      }
    } else {
      selected.push(cb.value);
    }
  });

  if (selected.length > 0) {
    selectedFacilitiesDiv.textContent = "Selected Facilities: " + selected.join(", ");
  } else {
    selectedFacilitiesDiv.textContent = "";
  }
}

// Listen for changes on all checkboxes and otherTextInput
checkboxes.querySelectorAll("input[type=checkbox]").forEach(cb => {
  cb.addEventListener("change", updateSelectedFacilitiesDisplay);
});
otherTextInput.addEventListener("input", updateSelectedFacilitiesDisplay);

// Close dropdown if click outside



// add 
courtForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const openTime = openTimeInput.value;
  const closeTime = closeTimeInput.value;

  if (!openTime || !closeTime) {
    alert("Please select both Open Time and Close Time.");
    return;
  }

  if (timeToMinutes(closeTime) <= timeToMinutes(openTime)) {
    alert("Close Time must be later than Open Time. Please select valid times.");
    closeTimeInput.focus();
    return;
  }

  // Gather selected facilities
  const checkedBoxes = checkboxes.querySelectorAll("input[type=checkbox]:checked");
  const facilities = [];

  checkedBoxes.forEach(cb => {
    if (cb.value === "Other") {
      if (otherTextInput.value.trim()) {
        facilities.push(otherTextInput.value.trim());
      } else {
        facilities.push("Other");
      }
    } else {
      facilities.push(cb.value);
    }
  });

  if (facilities.length === 0) {
    alert("Please select at least one facility.");
    return;
  }

  // Gather other fields
  const courtName = document.getElementById("courtName").value.trim();
  const courtAddress = document.getElementById("courtAddress").value.trim();
  const courtDescription = document.getElementById("courtDescription").value.trim();
  const courtSportType = document.getElementById("courtSportType").value;
  const courtPricingRaw = document.getElementById("courtPricing").value;
  const courtPricing = courtPricingRaw ? parseFloat(courtPricingRaw) : NaN;
  const courtBlockedSlots = document.getElementById("courtBlockedSlots").value.trim();

  // Basic validation
  if (!courtName || !courtAddress || !courtSportType || isNaN(courtPricing)) {
    alert("Please fill all required fields correctly.");
    return;
  }

  try {
    // Save to Firestore collection 'courts'
    const docRef = await addDoc(collection(db, "courts"), {
      name: courtName,
      address: courtAddress,
      description: courtDescription,
      sportType: courtSportType,
      pricingPerHour: courtPricing,
      openTime: openTime,
      closeTime: closeTime,
      blockedSlots: courtBlockedSlots,
       ownerEmail: currentUserEmail,   // <-- Add current user email
      ownerId: currentUserId,
      facilities: facilities,  // Array of strings
      createdAt: serverTimestamp()
    });

    alert("Court saved successfully! ID: " + docRef.id);

    // Reset form & UI
    courtForm.reset();
    otherTextInput.style.display = "none";
    selectedFacilitiesDiv.textContent = "";

  } catch (error) {
    console.error("Error adding court document: ", error);
    alert("Failed to save court. Check console for details.");
  }
});






const profileForm = document.getElementById("profileForm");
const profileStatus = document.getElementById("profileStatus");

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("profileName").value.trim();
  const email = document.getElementById("profileEmail").value.trim();
  const phone = document.getElementById("profilePhone").value.trim();

  if (!name || !email) {
    alert("Name and Email are required.");
    return;
  }

  try {
    // Use email as doc ID, or generate your own unique ID if preferred
    const profileDocRef = doc(db, "owner_profile", email);

    await setDoc(profileDocRef, {
      name: name,
      email: email,
      phone: phone,
      updatedAt: new Date()
    });

    profileStatus.style.color = "green";
    profileStatus.textContent = "Profile saved successfully!";
  } catch (error) {
    console.error("Error saving profile:", error);
    profileStatus.style.color = "red";
    profileStatus.textContent = "Failed to save profile. See console.";
  }
}); 

// ... existing code above ...

// Add these variables at the top
let currentFacilityId = null;
let existingPhotos = [];

// Load facility data when page loads
async function loadOwnerFacility() {
  if (!currentUserEmail) return;

  const facilitiesRef = collection(db, "facilities");
  const q = query(facilitiesRef, where("ownerEmail", "==", currentUserEmail));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const facilityDoc = querySnapshot.docs[0];
    const facilityData = facilityDoc.data();
    currentFacilityId = facilityDoc.id;

    // Display in view mode
    document.getElementById("facilityNameView").textContent = facilityData.name || "N/A";
    document.getElementById("facilityLocationView").textContent = facilityData.location || "N/A";
    document.getElementById("facilityDescriptionView").textContent = facilityData.description || "N/A";
    document.getElementById("facilitySportsView").textContent = facilityData.sportsTypes ? facilityData.sportsTypes.join(", ") : "N/A";
    document.getElementById("facilityAmenitiesView").textContent = facilityData.amenities ? facilityData.amenities.join(", ") : "N/A";

    // Display photos
    const photosContainer = document.getElementById("facilityPhotosView");
    photosContainer.innerHTML = "";
    if (facilityData.photos && facilityData.photos.length > 0) {
      facilityData.photos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Facility photo";
        img.style.maxHeight = "100px";
        photosContainer.appendChild(img);
      });
    }
    
    // Store existing photos
    existingPhotos = facilityData.photos || [];
  } else {
    // Show form if no facility exists
    document.getElementById("facilityView").style.display = "none";
    document.getElementById("facilityForm").style.display = "block";
  }
}

// Handle facility form submission
document.getElementById("facilityForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("facilityName").value.trim();
  const location = document.getElementById("facilityLocation").value.trim();
  const description = document.getElementById("facilityDescription").value.trim();
  const sportsTypes = document.getElementById("facilitySports").value.split(',').map(s => s.trim()).filter(s => s);
  const amenities = document.getElementById("facilityAmenities").value.split(',').map(s => s.trim()).filter(s => s);
  const photoFiles = document.getElementById("facilityPhotos").files;

  if (!name || !location) {
    alert("Name and Location are required.");
    return;
  }

  try {
    let photoUrls = [...existingPhotos];
    
    // Upload new photos if any
    if (photoFiles.length > 0) {
      photoUrls = [];
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const storageRef = ref(storage, `facility_photos/${currentUserId}/${file.name}`);
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
      updatedAt: new Date()
    };

    // Update or create facility
    if (currentFacilityId) {
      await setDoc(doc(db, "facilities", currentFacilityId), facilityData);
    } else {
      const docRef = await addDoc(collection(db, "facilities"), facilityData);
      currentFacilityId = docRef.id;
    }

    alert("Facility saved successfully!");
    toggleFacilityView(true);
    loadOwnerFacility();

  } catch (error) {
    console.error("Error saving facility:", error);
    alert("Failed to save facility. See console for details.");
  }
});

// Toggle between view and edit modes
function toggleFacilityView(showView) {
  if (showView) {
    document.getElementById("facilityView").style.display = "block";
    document.getElementById("facilityForm").style.display = "none";
  } else {
    document.getElementById("facilityView").style.display = "none";
    document.getElementById("facilityForm").style.display = "block";
    
    // Pre-fill form with existing data
    if (currentFacilityId) {
      document.getElementById("facilityName").value = document.getElementById("facilityNameView").textContent;
      document.getElementById("facilityLocation").value = document.getElementById("facilityLocationView").textContent;
      document.getElementById("facilityDescription").value = document.getElementById("facilityDescriptionView").textContent;
      document.getElementById("facilitySports").value = document.getElementById("facilitySportsView").textContent;
      document.getElementById("facilityAmenities").value = document.getElementById("facilityAmenitiesView").textContent;
      
      // Show existing photos in preview
      const preview = document.getElementById("facility-photo-preview");
      preview.innerHTML = "";
      existingPhotos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        preview.appendChild(img);
      });
    }
  }
}

// Event listeners
document.getElementById("editFacilityBtn").addEventListener("click", () => toggleFacilityView(false));
document.getElementById("cancelEditBtn").addEventListener("click", () => toggleFacilityView(true));

// Photo preview for facility form
document.getElementById("facilityPhotos").addEventListener("change", function() {
  const preview = document.getElementById("facility-photo-preview");
  preview.innerHTML = "";
  
  for (const file of this.files) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

// Load facility when navigating to facility management
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetSection = btn.getAttribute("data-section");
    sections.forEach(sec => sec.classList.remove("active-section"));
    document.getElementById(targetSection).classList.add("active-section");
    
    if (targetSection === "facility-management") {
      loadOwnerFacility();
    }
  });
});

// ... existing code below ...
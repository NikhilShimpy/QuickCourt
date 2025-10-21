// Firebase Configuration
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
try {
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// State Management
let userEmail = '';
let userPassword = '';

// UI Functions
function showNotification(message, isSuccess) {
  const notification = document.getElementById('notification');
  const notificationText = document.getElementById('notification-text');
  
  if (notification && notificationText) {
    notificationText.textContent = message;
    notification.className = 'notification ' + (isSuccess ? 'success' : 'error');
    notification.classList.add('show');
    
    // Update icon based on success/error
    const icon = notification.querySelector('i');
    if (icon) {
      icon.className = isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    }
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 5000);
  } else {
    console.log("Notification:", message);
  }
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.querySelector('.toggle-password i');
  
  if (passwordInput && eyeIcon) {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  }
}

function checkPasswordStrength(password) {
  const strengthMeter = document.getElementById('strength-meter');
  const strengthLevel = document.getElementById('strength-level');
  
  if (!strengthMeter || !strengthLevel) return;
  
  let strength = 0;
  let feedback = '';
  
  // Length check
  if (password.length >= 8) strength++;
  // Lowercase check
  if (password.match(/[a-z]+/)) strength++;
  // Uppercase check
  if (password.match(/[A-Z]+/)) strength++;
  // Number check
  if (password.match(/[0-9]+/)) strength++;
  // Special character check
  if (password.match(/[!@#$%^&*(),.?":{}|<>]+/)) strength++;
  
  // Reset classes
  strengthMeter.className = 'strength-meter';
  strengthLevel.className = '';
  
  if (password.length === 0) {
    strengthLevel.textContent = 'None';
    return;
  }
  
  switch(strength) {
    case 0:
    case 1:
      strengthMeter.classList.add('weak');
      strengthLevel.textContent = 'Weak';
      strengthLevel.classList.add('strength-level-weak');
      break;
    case 2:
    case 3:
      strengthMeter.classList.add('medium');
      strengthLevel.textContent = 'Medium';
      strengthLevel.classList.add('strength-level-medium');
      break;
    case 4:
    case 5:
      strengthMeter.classList.add('strong');
      strengthLevel.textContent = 'Strong';
      strengthLevel.classList.add('strength-level-strong');
      break;
  }
}

// Authentication Functions
async function signIn() {
  try {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn = document.querySelector('.login-btn');
    
    if (!email || !password) {
      showNotification("Please fill out all fields", false);
      return;
    }
    
    if (!validateEmail(email)) {
      showNotification("Please enter a valid email address", false);
      return;
    }
    
    if (btn) btn.classList.add('loading');
    
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const doc = await firebase.firestore().collection("users").doc(user.uid).get();
    if (!doc.exists) {
      showNotification("User data not found. Please contact support.", false);
      return;
    }
    
    const role = doc.data().role;
    const res = await fetch(`/set-role/${role}`);
    if (!res.ok) throw new Error("Failed to set role");
    
    showNotification("Login successful! Redirecting...", true);
    setTimeout(() => redirectBasedOnRole(role), 1500);
    
  } catch (error) {
    console.error("Sign-in error:", error);
    let errorMessage = "Login failed. Please check your credentials.";
    
    if (error.code === 'auth/invalid-email') {
      errorMessage = "Please enter a valid email address.";
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = "This account has been disabled.";
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = "No account found with this email.";
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = "Incorrect password. Please try again.";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "Too many failed attempts. Please try again later.";
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = "Network error. Please check your connection.";
    }
    
    showNotification(errorMessage, false);
  } finally {
    const btn = document.querySelector('.login-btn');
    if (btn) btn.classList.remove('loading');
  }
}

async function signUp() {
  try {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const termsAccepted = document.getElementById('terms').checked;
    const btn = document.querySelector('.signup-btn');
    
    if (!email || !password) {
      showNotification("Please fill out all fields", false);
      return;
    }
    
    if (!validateEmail(email)) {
      showNotification("Please enter a valid email address", false);
      return;
    }
    
    if (password.length < 6) {
      showNotification("Password must be at least 6 characters long", false);
      return;
    }
    
    if (!termsAccepted) {
      showNotification("You must accept the terms and conditions", false);
      return;
    }
    
    if (btn) btn.classList.add('loading');
    
    // Create user account
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Store user data with default role as 'vendor'
    await firebase.firestore().collection("users").doc(user.uid).set({
      email: email,
      role: "vendor", // Default role
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      emailVerified: false,
      displayName: email.split('@')[0] // Default display name
    });
    
    showNotification("Account created successfully! Redirecting...", true);
    setTimeout(() => redirectBasedOnRole("vendor"), 1500);
    
  } catch (error) {
    console.error("Sign-up error:", error);
    
    let errorMessage = "Registration failed. Please try again.";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already registered. Please login instead.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Please enter a valid email address.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password should be at least 6 characters.";
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = "Email/password accounts are not enabled. Please contact support.";
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = "Network error. Please check your connection.";
    }
    
    showNotification(errorMessage, false);
  } finally {
    const btn = document.querySelector('.signup-btn');
    if (btn) btn.classList.remove('loading');
  }
}

// Social Authentication Functions
async function signInWithGoogle() {
  await socialSignIn(new firebase.auth.GoogleAuthProvider(), 'login');
}

async function signInWithFacebook() {
  await socialSignIn(new firebase.auth.FacebookAuthProvider(), 'login');
}

async function signUpWithGoogle() {
  await socialSignIn(new firebase.auth.GoogleAuthProvider(), 'signup');
}

async function signUpWithFacebook() {
  await socialSignIn(new firebase.auth.FacebookAuthProvider(), 'signup');
}

async function socialSignIn(provider, action) {
  try {
    const btn = document.querySelector('.login-btn') || document.querySelector('.signup-btn');
    if (btn) btn.classList.add('loading');
    
    // Add scopes if needed
    if (provider.providerId === 'google.com') {
      provider.addScope('email');
      provider.addScope('profile');
    }
    
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDoc = await firebase.firestore().collection("users").doc(user.uid).get();
    
    if (!userDoc.exists) {
      // Create new user document for social sign-in
      await firebase.firestore().collection("users").doc(user.uid).set({
        email: user.email,
        role: "vendor", // Default role for social sign-ups
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        emailVerified: true,
        socialProvider: provider.providerId,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL
      });
    }
    
    const userData = await firebase.firestore().collection("users").doc(user.uid).get();
    const role = userData.data().role;
    
    const res = await fetch(`/set-role/${role}`);
    if (!res.ok) throw new Error("Failed to set role");
    
    showNotification("Successfully signed in! Redirecting...", true);
    setTimeout(() => redirectBasedOnRole(role), 1500);
    
  } catch (error) {
    console.error("Social auth error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    let errorMessage = "Social authentication failed. Please try again.";
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Sign-in was cancelled.";
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = "An account already exists with the same email address but different sign-in credentials. Please try signing in with a different method.";
    } else if (error.code === 'auth/auth-domain-config-required') {
      errorMessage = "Authentication domain not configured. Please contact support.";
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = "Social authentication is not enabled. Please contact support.";
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = "This domain is not authorized for OAuth operations. Please contact support.";
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = "Network error. Please check your connection.";
    }
    
    showNotification(errorMessage, false);
  } finally {
    const btn = document.querySelector('.login-btn') || document.querySelector('.signup-btn');
    if (btn) btn.classList.remove('loading');
  }
}

// Utility Functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function redirectBasedOnRole(role) {
  const routes = {
    vendor: "/user_dashboard",
    supplier: "/owner/dashboard"
  };
  window.location.href = routes[role] || "/";
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log("Auth system initialized");
  
  // Initialize toggle password buttons
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(button => {
    button.addEventListener('click', togglePasswordVisibility);
  });
  
  // Enter key support for forms
  document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const loginBtn = document.querySelector('.login-btn');
      const signupBtn = document.querySelector('.signup-btn');
      
      if (loginBtn && !loginBtn.classList.contains('loading')) {
        signIn();
      } else if (signupBtn && !signupBtn.classList.contains('loading')) {
        signUp();
      }
    }
  });
  
  // Remember me functionality
  const rememberMe = document.getElementById('remember');
  if (rememberMe) {
    rememberMe.addEventListener('change', handleRememberMe);
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.addEventListener('input', handleRememberMe);
    }
    
    // Load remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && emailInput) {
      emailInput.value = rememberedEmail;
      rememberMe.checked = true;
    }
  }
  
  // Add input animations
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('animate__pulse');
    });
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('animate__pulse');
    });
  });
});

function handleRememberMe() {
  const rememberMe = document.getElementById('remember');
  const emailInput = document.getElementById('email');
  
  if (rememberMe && emailInput) {
    if (rememberMe.checked && emailInput.value) {
      localStorage.setItem('rememberedEmail', emailInput.value);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }
}

// Make functions globally available
window.signIn = signIn;
window.signUp = signUp;
window.signInWithGoogle = signInWithGoogle;
window.signInWithFacebook = signInWithFacebook;
window.signUpWithGoogle = signUpWithGoogle;
window.signUpWithFacebook = signUpWithFacebook;
window.togglePasswordVisibility = togglePasswordVisibility;
window.checkPasswordStrength = checkPasswordStrength;
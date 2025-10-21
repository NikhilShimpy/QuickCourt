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
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

// State Management
let userEmail = '';
let userPassword = '';
let userRole = '';

// UI Functions
function showNotification(message, isSuccess) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = 'notification ' + (isSuccess ? 'success' : 'error');
  notification.classList.add('show');
  
  setTimeout(() => notification.classList.remove('show'), 3000);
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.querySelector('.toggle-password');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
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
    
    btn.classList.add('loading');
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    const doc = await db.collection("users").doc(user.uid).get();
    if (!doc.exists) {
      showNotification("User role not found", false);
      return;
    }
    
    const role = doc.data().role;
    const res = await fetch(`/set-role/${role}`);
    if (!res.ok) throw new Error("Failed to set role");
    
    showNotification("Login successful! Redirecting...", true);
    setTimeout(() => redirectBasedOnRole(role), 1500);
    
  } catch (error) {
    console.error("Sign-in error:", error);
    showNotification(error.message, false);
  } finally {
    const btn = document.querySelector('.login-btn');
    if (btn) btn.classList.remove('loading');
  }
}

async function signUp() {
  try {
    userEmail = document.getElementById('email').value.trim();
    userPassword = document.getElementById('password').value;
    userRole = document.getElementById('role').value;
    const termsAccepted = document.getElementById('terms').checked;
    const btn = document.querySelector('.signup-btn');
    
    if (!userEmail || !userPassword) {
      showNotification("Please fill out all fields", false);
      return;
    }
    
    if (!termsAccepted) {
      showNotification("You must accept the terms", false);
      return;
    }
    
    btn.classList.add('loading');
    
    // Create user account
    const userCredential = await auth.createUserWithEmailAndPassword(userEmail, userPassword);
    const user = userCredential.user;
    
    // Store user data
    await db.collection("users").doc(user.uid).set({
      email: userEmail,
      role: userRole,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      emailVerified: true // Mark as verified since we're skipping verification
    });
    
    showNotification("Account created successfully! Redirecting...", true);
    setTimeout(() => redirectBasedOnRole(userRole), 1500);
    
  } catch (error) {
    console.error("Sign-up error:", error);
    
    // More user-friendly error messages
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already registered. Please login instead.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Please enter a valid email address.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password should be at least 6 characters.";
    }
    
    showNotification(errorMessage, false);
  } finally {
    const btn = document.querySelector('.signup-btn');
    if (btn) btn.classList.remove('loading');
  }
}

// Utility Functions
function redirectBasedOnRole(role) {
  const routes = {
    vendor: "/user_dashboard",
    supplier: "/owner/dashboard"
  };
  window.location.href = routes[role] || "/";
}

// Social Auth
async function socialSignIn(provider) {
  try {
    const btn = document.querySelector('.login-btn');
    btn.classList.add('loading');
    
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    
    if (!(await db.collection("users").doc(user.uid).get()).exists) {
      await db.collection("users").doc(user.uid).set({
        email: user.email,
        role: "vendor",
        emailVerified: true
      });
    }
    
    const role = (await db.collection("users").doc(user.uid).get()).data().role;
    const res = await fetch(`/set-role/${role}`);
    if (!res.ok) throw new Error("Failed to set role");
    
    redirectBasedOnRole(role);
    
  } catch (error) {
    console.error("Social auth error:", error);
    showNotification(error.message, false);
  } finally {
    const btn = document.querySelector('.login-btn');
    if (btn) btn.classList.remove('loading');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Input animations
  document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('animate__pulse');
    });
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('animate__pulse');
    });
  });
  
  // Remember me
  const rememberMe = document.getElementById('remember');
  if (rememberMe) {
    rememberMe.addEventListener('change', handleRememberMe);
    document.getElementById('email').addEventListener('input', handleRememberMe);
    
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      document.getElementById('email').value = rememberedEmail;
      rememberMe.checked = true;
    }
  }
});

function handleRememberMe() {
  const rememberMe = document.getElementById('remember');
  const email = document.getElementById('email').value;
  
  if (rememberMe.checked && email) {
    localStorage.setItem('rememberedEmail', email);
  } else {
    localStorage.removeItem('rememberedEmail');
  }
}

// Social Auth Shortcuts
function signInWithGoogle() {
  socialSignIn(new firebase.auth.GoogleAuthProvider());
}

function signInWithFacebook() {
  socialSignIn(new firebase.auth.FacebookAuthProvider());
}

function signUpWithGoogle() {
  socialSignIn(new firebase.auth.GoogleAuthProvider());
}

function signUpWithFacebook() {
  socialSignIn(new firebase.auth.FacebookAuthProvider());
}
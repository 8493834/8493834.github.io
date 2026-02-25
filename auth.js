const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const toggleBtn = document.getElementById('toggle-auth');
const switchText = document.getElementById('switch-text');
const submitBtn = document.getElementById('submit-btn');
const emailForm = document.getElementById('email-auth-form');
const googleBtn = document.getElementById('google-signin-btn');

let isLogin = true;

// 1. Toggle between Sign In and Sign Up
toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    
    authTitle.innerText = isLogin ? "Welcome Back" : "Create Account";
    authSubtitle.innerText = isLogin ? "Sign in to manage your account" : "Join Card Dealers Inc. today";
    submitBtn.innerText = isLogin ? "Sign In" : "Register & Verify Email";
    switchText.innerText = isLogin ? "Don't have an account?" : "Already have an account?";
    toggleBtn.innerText = isLogin ? "Create one" : "Sign in";
});

// 2. Handle Email/Password Auth
emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isLogin) {
           // --- SIGN UP LOGIC (Update this section) ---
const userCredential = await window.fbMethods.createUser(window.fbAuth, email, password);

// Define where the user should go after clicking the link
const actionCodeSettings = {
  url: 'https://8493834.github.io', // 🎯 Replace with your real URL
  handleCodeInApp: true,
};

setStatus("Sending verification email...", 'loading');
await window.fbMethods.verifyEmail(userCredential.user, actionCodeSettings);

setStatus("Email sent! Check your inbox.", 'success');
alert("✅ Account created! Check your email to verify your account."); 
            // Reset to login view
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
});

// 3. Handle Google Sign-In
googleBtn.addEventListener('click', async () => {
    try {
        const result = await window.fbMethods.googleSignIn(window.fbAuth, window.fbMethods.googleProvider);
        saveUserAndRedirect(result.user);
    } catch (error) {
        alert("Google Sign-In failed: " + error.message);
    }
});

// Helper to save data and go home
function saveUserAndRedirect(user) {
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify({
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photo: user.photoURL
    }));
    window.location.href = 'index.html';
}

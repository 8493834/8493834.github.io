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
            // --- LOGIN LOGIC ---
            const userCredential = await window.fbMethods.signIn(window.fbAuth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                alert("❌ Please verify your email first! We sent a link to " + email);
                await window.fbMethods.logout(window.fbAuth); // Don't let them in yet
            } else {
                saveUserAndRedirect(user);
            }
        } else {
            // --- SIGN UP LOGIC ---
            const userCredential = await window.fbMethods.createUser(window.fbAuth, email, password);
            await window.fbMethods.verifyEmail(userCredential.user);
            
            alert("✅ Account created! Check your email (" + email + ") for a verification link before signing in.");
            window.location.reload(); // Reset to login view
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

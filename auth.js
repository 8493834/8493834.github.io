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
emailForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Trigger reCAPTCHA
    grecaptcha.ready(function() {
        grecaptcha.execute('YOUR_RECAPTCHA_SITE_KEY', {action: 'submit'}).then(async (token) => {
            
            // 2. Now proceed with your existing Firebase Logic
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const actionText = isLogin ? "Signing in..." : "Creating account...";
            setStatus(actionText, 'loading');

            try {
                if (isLogin) {
                    // --- LOGIN LOGIC ---
                    const userCredential = await window.fbMethods.signIn(window.fbAuth, email, password);
                    const user = userCredential.user;

                    if (!user.emailVerified) {
                        setStatus("Verification required.", 'error');
                        alert("❌ Please verify your email first!");
                        await window.fbMethods.logout(window.fbAuth);
                    } else {
                        saveUserAndRedirect(user);
                    }
                } else {
                    // --- SIGN UP LOGIC ---
                    const userCredential = await window.fbMethods.createUser(window.fbAuth, email, password);
                    
                    // Add the "Member Since" data we discussed
                    const memberSince = new Date().toLocaleDateString();
                    
                    await window.fbMethods.verifyEmail(userCredential.user);
                    
                    // Save temporary data so the Welcome Modal can show the date later
                    localStorage.setItem('memberSince', memberSince);
                    
                    setStatus("Email sent! Check your inbox.", 'success');
                    alert("✅ Account created! Verify your email to join the club.");
                    window.location.reload();
                }
            } catch (error) {
                setStatus("Error occurred.", 'error');
                alert("Error: " + error.message);
                setStatus("", "");
            }
        });
    });
});
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

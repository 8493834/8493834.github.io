const emailForm = document.getElementById('email-auth-form');
const statusDiv = document.getElementById('auth-status');
const toggleBtn = document.getElementById('toggle-auth');
let isLogin = true;

toggleBtn.onclick = () => {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "Welcome Back" : "Create Account";
    document.getElementById('submit-btn').innerText = isLogin ? "Sign In" : "Register";
};

emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Execute reCAPTCHA v3
    grecaptcha.ready(() => {
        grecaptcha.execute('YOUR_RECAPTCHA_SITE_KEY', {action: 'submit'}).then(async (token) => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            statusDiv.innerText = "Processing...";

            try {
                if (isLogin) {
                    const res = await window.fbMethods.signIn(window.fbAuth, email, password);
                    if (!res.user.emailVerified) {
                        alert("Verify your email first!");
                        await window.fbMethods.logout(window.fbAuth);
                    } else {
                        saveAndGo(res.user);
                    }
                } else {
                    const res = await window.fbMethods.createUser(window.fbAuth, email, password);
                    await window.fbMethods.verifyEmail(res.user);
                    localStorage.setItem('memberSince', new Date().toLocaleDateString());
                    localStorage.setItem('showWelcome', 'true');
                    alert("Check your email for a verification link!");
                    window.location.reload();
                }
            } catch (err) {
                statusDiv.innerText = "Error: " + err.message;
            }
        });
    });
});

function saveAndGo(user) {
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify({ email: user.email, name: user.email.split('@')[0] }));
    window.location.href = 'index.html';
}

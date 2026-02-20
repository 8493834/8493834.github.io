// Toggle between Login and Sign Up UI
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const toggleBtn = document.getElementById('toggle-auth');
let isLogin = true;

toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    authTitle.innerText = isLogin ? "Welcome Back" : "Create Account";
    authSubtitle.innerText = isLogin ? "Sign in to manage your account" : "Join the Card Dealers community";
    toggleBtn.innerText = isLogin ? "Create one" : "Sign in";
});

// Handle Google Sign-In Response
function handleCredentialResponse(response) {
    // Decode the JWT token to get user info
    const responsePayload = decodeJwtResponse(response.credential);

    const userData = {
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture,
        id: responsePayload.sub
    };

    // Store in localStorage (Session management)
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));

    alert(`Hello ${userData.name}! You are now signed in.`);
    window.location.href = 'index.html'; // Redirect to home
}

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Handle Email/Password Form (Simulated for a static site)
document.getElementById('email-auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify({ email: email, name: email.split('@')[0] }));
    
    window.location.href = 'index.html';
});

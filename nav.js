document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.main-nav');

    navToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile nav when a link is clicked
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
});
function updateNavForAuth() {
    const navList = document.querySelector('.nav-list');
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

    if (isLoggedIn) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        // Replace "Sign In" with "Logout"
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = `<a href="#" id="logout-link">Logout (${userData.name})</a>`;
        navList.appendChild(logoutLi);

        document.getElementById('logout-link').addEventListener('click', () => {
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userData');
            window.location.reload();
        });
    } else {
        const loginLi = document.createElement('li');
        loginLi.innerHTML = `<a href="auth.html">Sign In</a>`;
        navList.appendChild(loginLi);
    }
    // 🛑 REPLACE WITH YOUR ACTUAL GOOGLE EMAIL 🛑
const ADMIN_EMAIL = "joshuasteeljoshua19@gmail.com";

function updateNavForAuth() {
    const navList = document.querySelector('.nav-list');
    const manageBtn = document.getElementById('manage-button'); // The button in the footer
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

    // Hide manage button by default
    if (manageBtn) manageBtn.style.display = 'none';

    if (isLoggedIn) {
        const userData = JSON.parse(localStorage.getItem('userData'));

        // 🎯 Check if the logged-in user is the Admin
        if (userData.email === ADMIN_EMAIL && manageBtn) {
            manageBtn.style.display = 'inline-block';
        }

        // Add Logout button to nav
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = `<a href="#" id="logout-link">Logout (${userData.name})</a>`;
        
        // Remove old logout/login links to prevent duplicates
        const existingAuthLink = document.querySelector('.auth-link');
        if (existingAuthLink) existingAuthLink.remove();
        
        logoutLi.className = 'auth-link';
        navList.appendChild(logoutLi);

        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userData');
            window.location.href = 'index.html';
        });
    } else {
        // Show Sign In link if logged out
        const loginLi = document.createElement('li');
        loginLi.className = 'auth-link';
        loginLi.innerHTML = `<a href="auth.html">Sign In</a>`;
        navList.appendChild(loginLi);
    }
}

document.addEventListener('DOMContentLoaded', updateNavForAuth);
}

// Call this inside your DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', updateNavForAuth);

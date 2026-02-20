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
}

// Call this inside your DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', updateNavForAuth);

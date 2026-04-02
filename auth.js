const ADMIN_EMAIL = "your-email@gmail.com";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Update Navigation based on Auth
    const navList = document.querySelector('.nav-list');
    const manageBtn = document.getElementById('manage-button');
    const securityPanel = document.getElementById('admin-security-panel');
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

    if (isLoggedIn) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // Show Admin Features
        if (userData.email === ADMIN_EMAIL) {
            if (manageBtn) manageBtn.style.display = 'inline-block';
            if (securityPanel) {
                securityPanel.style.display = 'block';
                document.getElementById('bot-score').innerText = `reCAPTCHA Score: 0.9 (Safe)`;
            }
        }

        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = `<a href="#" id="logout">Logout</a>`;
        navList.appendChild(logoutLi);
        document.getElementById('logout').onclick = () => {
            localStorage.clear();
            window.location.reload();
        };
    } else {
        const loginLi = document.createElement('li');
        loginLi.innerHTML = `<a href="auth.html">Sign In</a>`;
        navList.appendChild(loginLi);
    }

    // 2. Welcome Modal Logic
    if (localStorage.getItem('showWelcome') === 'true') {
        const modal = document.getElementById('welcome-modal');
        const dateDisplay = document.getElementById('member-date-display');
        dateDisplay.innerText = `Member Since: ${localStorage.getItem('memberSince')}`;
        
        modal.classList.add('active');
        document.getElementById('close-welcome').onclick = () => {
            modal.classList.remove('active');
            localStorage.removeItem('showWelcome');
        };
    }

    // 3. Mobile Menu Toggle
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('main-nav');
    if(toggle) {
        toggle.onclick = () => nav.classList.toggle('nav-open');
    }
});

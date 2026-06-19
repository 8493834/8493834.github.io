import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDDSuWbZK_RmUdkagSViM2P1cy4i91KsrQ",
    authDomain: "jokitmas8493834.firebaseapp.com",
    projectId: "jokitmas8493834",
    storageBucket: "jokitmas8493834.firebasestorage.app",
    messagingSenderId: "753448833597",
    appId: "1:753448833597:web:c309e5ff4663064e0f5054"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- AUTHENTICATION LAYER ---
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const trackerSection = document.getElementById('client-tracker');

if (loginBtn) {
    loginBtn.addEventListener('click', () => signInWithPopup(auth, provider));
    logoutBtn.addEventListener('click', () => signOut(auth));
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn?.classList.add('hidden');
        logoutBtn?.classList.remove('hidden');
        loadClientProject(user.email);
    } else {
        loginBtn?.classList.remove('hidden');
        logoutBtn?.classList.add('hidden');
        trackerSection?.classList.add('hidden');
    }
});

// --- PUBLIC PORTFOLIO LOAD ---
const grid = document.getElementById('portfolio-grid');
if (grid) {
    const querySnapshot = await getDocs(collection(db, "projects"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const statusClass = data.isInProgress ? 'in-progress' : 'completed';
        const statusText = data.isInProgress ? 'In Progress' : 'Live';
        
        grid.innerHTML += `
            <div class="card">
                <span class="badge ${statusClass}">${statusText}</span>
                <h3>${data.title}</h3>
                <a href="${data.link || '#'}" target="_blank">View Project</a>
            </div>
        `;
    });
}

// --- SUBMIT CONTACT FORM TO CONSOLE ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "messages"), {
            name: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            details: document.getElementById('client-project').value,
            timestamp: new Date()
        });
        alert('Proposal sent straight to my console! I will talk to you soon.');
        contactForm.reset();
    });
}

// --- CLIENT TRACKER DISPLAY ---
async function loadClientProject(email) {
    if (!trackerSection) return;
    const q = query(collection(db, "projects"), where("clientEmail", "==", email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        trackerSection.classList.remove('hidden');
        const card = document.getElementById('tracker-card');
        snapshot.forEach(doc => {
            const data = doc.data();
            card.innerHTML = `
                <div class="card">
                    <h3>${data.title}</h3>
                    <p>Status: <strong>${data.isInProgress ? '⚙️ We are actively building more features!' : '✅ Finished & Live'}</strong></p>
                </div>
            `;
        });
    }
}

// --- ADMIN CONSOLE LOGIC ---
const portfolioForm = document.getElementById('portfolio-form');
if (portfolioForm) {
    portfolioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "projects"), {
            title: document.getElementById('proj-title').value,
            link: document.getElementById('proj-link').value,
            isInProgress: document.getElementById('proj-status').checked,
            clientEmail: "" // Add client email here if assigning it to a user account
        });
        alert('Project added seamlessly!');
        portfolioForm.reset();
    });

    // Load messages into console
    const msgList = document.getElementById('messages-list');
    const msgSnapshot = await getDocs(collection(db, "messages"));
    msgSnapshot.forEach(doc => {
        const data = doc.data();
        msgList.innerHTML += `
            <div class="card">
                <h4>From: ${data.name} (${data.email})</h4>
                <p>${data.details}</p>
            </div>
        `;
    });
}

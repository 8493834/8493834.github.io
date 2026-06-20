import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDDSuWbZK_RmUdkagSViM2P1cy4i91KsrQ",
    authDomain: "jokitmas8493834.firebaseapp.com",
    projectId: "jokitmas8493834",
    storageBucket: "jokitmas8493834.firebasestorage.app",
    messagingSenderId: "753448833597",
    appId: "1:753448833597:web:c309e5ff4663064e0f5054"
};

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 👑 ADMIN CONFIGURATION
const ADMIN_EMAILS = ["joshuasteeljoshua19@gmail.com"]; 


// ==========================================
// 🔐 AUTHENTICATION LAYER WITH ROLES
// ==========================================
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const adminBtn = document.getElementById('admin-btn');
const trackerSection = document.getElementById('client-tracker');

if (loginBtn) {
    loginBtn.addEventListener('click', () => signInWithPopup(auth, provider));
    logoutBtn.addEventListener('click', () => signOut(auth));
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn?.classList.add('hidden');
        logoutBtn?.classList.remove('hidden');

        // Check if the logged-in user is the Admin/Developer
        if (ADMIN_EMAILS.includes(user.email)) {
            adminBtn?.classList.remove('hidden');   // Show link to console.html
            trackerSection?.classList.add('hidden'); // Admin doesn't need to see client tracker
        } else {
            adminBtn?.classList.add('hidden');      // Hide admin panel link from normal clients
            loadClientProject(user.email.toLowerCase().trim()); // Load this specific client's progress
        }
    } else {
        loginBtn?.classList.remove('hidden');
        logoutBtn?.classList.add('hidden');
        adminBtn?.classList.add('hidden');
        trackerSection?.classList.add('hidden');
    }
});

// ==========================================
// 🌐 PUBLIC HOMEPAGE LOGIC (index.html)
// ==========================================

// 1. Fetch and Display Public Portfolio Items
const grid = document.getElementById('portfolio-grid');
if (grid) {
    grid.innerHTML = ''; 
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

// 2. Protected Contact Form Submission (with reCAPTCHA validation)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 🤖 Validate reCAPTCHA response state
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            alert('Please check the "I\'m not a robot" box before sending your proposal!');
            return; 
        }

        try {
            await addDoc(collection(db, "messages"), {
                name: document.getElementById('client-name').value,
                email: document.getElementById('client-email').value.trim().toLowerCase(),
                details: document.getElementById('client-project').value,
                timestamp: new Date()
            });
            alert('Proposal sent straight to my console! I will talk to you soon.');
            
            contactForm.reset();
            grecaptcha.reset(); // Clear reCAPTCHA visual state
            
        } catch (error) {
            console.error("Error submitting message: ", error);
            alert("Something went wrong. Please try again.");
        }
    });
}

// 3. Authenticated Client Progress Tracker Dashboard
async function loadClientProject(email) {
    if (!trackerSection) return;
    const q = query(collection(db, "projects"), where("clientEmail", "==", email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        trackerSection.classList.remove('hidden');
        const card = document.getElementById('tracker-card');
        card.innerHTML = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const currentProgress = data.progress || 0;
            
            card.innerHTML += `
                <div class="card" style="margin-top: 1rem; border-left: 5px solid var(--accent);">
                    <h3>🚀 Project Profile: ${data.title}</h3>
                    
                    <div style="margin: 1.5rem 0;">
                        <label><strong>Build Progress:</strong></label>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${currentProgress}%"></div>
                            <div class="progress-text">${currentProgress}%</div>
                        </div>
                        <p style="font-size: 0.9rem; color: #94a3b8; margin-top: 0.5rem;">
                            ${data.isInProgress ? '⚙️ Standby! I am actively writing code and adding more features.' : '✅ Project wrapped up and pushed to manufacturing!'}
                        </p>
                    </div>

                    <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 6px;">
                        <h4>📝 Your System Proposal & Scope:</h4>
                        <p style="white-space: pre-wrap; font-style: italic; color: #cbd5e1;">"${data.proposal || 'No design parameters documented yet.'}"</p>
                    </div>
                </div>
            `;
        });
    }
}

// ==========================================
// 🎛️ ADMIN CONSOLE LOGIC (console.html)
// ==========================================
const portfolioForm = document.getElementById('portfolio-form');
if (portfolioForm) {
    
    // Strict URL Route Security Guard
    onAuthStateChanged(auth, (user) => {
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            alert("Unauthorized personnel detected. Relocating back to public spaces.");
            window.location.href = "index.html";
        }
    });

    // 1. Write Brand New Project/Progress Framework to Firestore
    portfolioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "projects"), {
                title: document.getElementById('proj-title').value,
                link: document.getElementById('proj-link').value,
                isInProgress: document.getElementById('proj-status').checked,
                progress: parseInt(document.getElementById('proj-progress').value, 10) || 0,
                proposal: document.getElementById('proj-proposal').value,
                clientEmail: document.getElementById('proj-client-email').value.trim().toLowerCase()
            });
            alert('Project database synchronized perfectly!');
            window.location.reload(); 
        } catch (error) {
            console.error("Error creating project: ", error);
            alert("Failed to save project execution framework.");
        }
    });

    // 2. Fetch and Read Inbound Client Mail with Delete Capabilities
    const msgList = document.getElementById('messages-list');
    if (msgList) {
        const msgSnapshot = await getDocs(collection(db, "messages"));
        msgList.innerHTML = ''; 
        
        msgSnapshot.forEach(docSnapshot => {
            const data = docSnapshot.data();
            const docId = docSnapshot.id;
            
            const msgCard = document.createElement('div');
            msgCard.className = 'card';
            msgCard.innerHTML = `
                <h4>From: ${data.name} (${data.email})</h4>
                <p style="white-space: pre-wrap;">${data.details}</p>
                <button class="delete-btn" data-id="${docId}" data-collection="messages" style="background: #ef4444; margin-top: 1rem;">Delete Message</button>
            `;
            msgList.appendChild(msgCard);
        });
    }
}

// ==========================================
// 🗑️ GLOBAL DELETION ENGINE
// ==========================================
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const docId = e.target.getAttribute('data-id');
        const collectionName = e.target.getAttribute('data-collection');
        
        if (confirm('Are you sure you want to permanently delete this document data?')) {
            try {
                await deleteDoc(doc(db, collectionName, docId));
                e.target.parentElement.remove();
            } catch (error) {
                console.error("Error executing deletion routine: ", error);
                alert("Database mutation failure.");
            }
        }
    }
});

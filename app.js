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

        // Check if the logged-in user is the Admin
        if (ADMIN_EMAILS.includes(user.email)) {
            adminBtn?.classList.remove('hidden');   // Show Console Link
            trackerSection?.classList.add('hidden'); // Hide client tracker for admin
        } else {
            adminBtn?.classList.add('hidden');      // Hide Console Link from clients
            loadClientProject(user.email);          // Load client's dashboard
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

// 1. Fetch and Display Portfolio Items
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

// ==========================================
// 🌐 PUBLIC HOMEPAGE LOGIC (index.html)
// ==========================================

// ... (Portfolio rendering logic stays up here) ...

// 2. Contact Form Submission (With reCAPTCHA Protection)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 🤖 Check if the reCAPTCHA checkbox has been resolved
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            alert('Please check the "I\'m not a robot" box before sending your proposal!');
            return; // Stops the execution right here so bots can't write to Firestore
        }

        // If verified, proceed to send data to Firebase Console
        try {
            await addDoc(collection(db, "messages"), {
                name: document.getElementById('client-name').value,
                email: document.getElementById('client-email').value,
                details: document.getElementById('client-project').value,
                timestamp: new Date()
            });
            alert('Proposal sent straight to my console! I will talk to you soon.');
            
            // Reset both the form fields and the reCAPTCHA widget visual state
            contactForm.reset();
            grecaptcha.reset(); 
            
        } catch (error) {
            console.error("Error submitting message: ", error);
            alert("Something went wrong. Please try again.");
        }
    });
}

// ==========================================
// 🎛️ ADMIN CONSOLE LOGIC (console.html)
// ==========================================
const portfolioForm = document.getElementById('portfolio-form');
if (portfolioForm) {
    
    // Security Guard: Boot users out of console.html if they aren't the admin
    onAuthStateChanged(auth, (user) => {
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            alert("Unauthorized access! Booting back to homepage.");
            window.location.href = "index.html";
        }
    });

    // 1. Add New Project to Portfolio
    portfolioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "projects"), {
            title: document.getElementById('proj-title').value,
            link: document.getElementById('proj-link').value,
            isInProgress: document.getElementById('proj-status').checked,
            clientEmail: "" // Put your client's email here so they can track it when they log in!
        });
        alert('Project added seamlessly!');
        window.location.reload(); 
    });

    // 2. Load Inbound Client Messages with Delete Capabilities
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
                <p>${data.details}</p>
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
        
        if (confirm('Are you sure you want to delete this permanently?')) {
            try {
                await deleteDoc(doc(db, collectionName, docId));
                e.target.parentElement.remove();
            } catch (error) {
                console.error("Error executing deletion: ", error);
            }
        }
    }
});

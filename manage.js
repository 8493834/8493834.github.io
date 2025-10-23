document.addEventListener('DOMContentLoaded', () => {

    // 🛑 REPLACE THESE WITH YOUR ACTUAL JSONBIN.IO CREDENTIALS 🛑
    // 1. Password to enter the manage.html page
    const MANAGE_PASSWORD = "p@$$worD"; 
    
    // 2. The unique ID of your JSON Bin (e.g., '653a29b05775c742c38edc6d')
    const BIN_ID = "68f6a629ae596e708f20081b"; 
    
    // 3. Your Master Key (for PUT/writing operations - BE CAREFUL exposing this)
    const MASTER_KEY = "$2a$10$cyMnz51JbXNQBoIE7Gi.seT.I2EkWazeGljSLnum7IjzDeOPn5wSi"; 
    
    // 4. Your Access Key (for GET/reading operations if the bin is private)
    const ACCESS_KEY = "$2a$10$NHhvVWLtO9Zu.ErTUqoRieEs8tHCo/nc9R.mEy9kLCBP.X/mETDqa"; 
    // -------------------------------------------------------------

    // API Base URL (uses the BIN_ID constant)
    const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

    // --- API Functions (Using Fetch) ---

    /**
     * Fetches the latest content (ads and shop items) from JSONBin.io.
     * Uses the Access Key for reading.
     * @returns {Promise<object>} The content object { ads: [], shopItems: [] }.
     */
    async function fetchContentFromAPI() {
        try {
            const response = await fetch(`${API_URL}/latest`, {
                method: 'GET',
                headers: {
                    'X-Access-Key': ACCESS_KEY 
                }
            });

            if (!response.ok) {
                // If the response is bad (e.g., 404, 403), throw an error
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            // JSONBin.io nests the actual data payload inside a 'record' object
            return data.record || { ads: [], shopItems: [] }; 

        } catch (error) {
            console.error('Error fetching data from JSONBin:', error);
            // Return an empty structure on failure to prevent crashing
            return { ads: [], shopItems: [] }; 
        }
    }

    /**
     * Updates the content (ads and shop items) on JSONBin.io.
     * Uses the Master Key for writing.
     * @param {object} newContent - The complete new content object to save.
     * @returns {Promise<boolean>} True if the update was successful.
     */
    async function updateContentInAPI(newContent) {
        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY // Master Key required for updating/writing
                },
                body: JSON.stringify(newContent)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return true; 

        } catch (error) {
            console.error('Error updating data in JSONBin:', error);
            return false;
        }
    }

    // --- Initialization and Routing ---

    /**
     * Determines which content loading function to execute based on the current page.
     */
    function init() {
        const path = window.location.pathname;

        if (path.endsWith('manage.html')) {
            authenticateAndSetupManagement();
        } else if (path.endsWith('ads.html')) {
            loadAdsContent();
        } else if (path.endsWith('shop.html')) {
            loadShopContent();
        }
        // index.html and others don't require specific loading from manage.js
    }

    // --- Authentication Flow ---

    /**
     * Prompts the user for a password and initiates management setup on success.
     */
    function authenticateAndSetupManagement() {
        const enteredPassword = prompt("🔐 Please enter the password to access the content management page:");
        if (enteredPassword === MANAGE_PASSWORD) {
            setupManagementForms();
            loadCurrentContent();
        } else {
            alert("Incorrect password. Access denied. Redirecting to home page.");
            window.location.href = "index.html";
        }
    }

    // --- Form and Add/Delete Logic ---

    /**
     * Sets up event listeners for the Add Ad and Add Shop Item forms.
     */
    function setupManagementForms() {
        const addAdForm = document.getElementById('add-ad-form');
        const addShopForm = document.getElementById('add-shop-form');

        // Add Ad Form Submission
        addAdForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const adTitle = document.getElementById('ad-title').value;
            const adDesc = document.getElementById('ad-desc').value;
            const adLink = document.getElementById('ad-link').value;
            const newAd = { title: adTitle, desc: adDesc, link: adLink };
            
            const content = await fetchContentFromAPI();
            content.ads.push(newAd);
            
            if (await updateContentInAPI(content)) {
                alert('✅ New ad added successfully for everyone!');
                addAdForm.reset();
                loadCurrentContent(); 
                // loadAdsContent(); // Optionally refresh public view
            } else {
                alert('❌ Failed to save content to the API.');
            }
        });

        // Add Shop Item Form Submission
        addShopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const itemImg = document.getElementById('item-img').value;
            const itemName = document.getElementById('item-name').value;
            const itemDesc = document.getElementById('item-desc').value;
            const itemPrice = document.getElementById('item-price').value;
            const newItem = { img: itemImg, name: itemName, desc: itemDesc, price: itemPrice };
            
            const content = await fetchContentFromAPI();
            content.shopItems.push(newItem);
            
            if (await updateContentInAPI(content)) {
                alert('✅ New shop item added successfully for everyone!');
                addShopForm.reset();
                loadCurrentContent();
                // loadShopContent(); // Optionally refresh public view
            } else {
                 alert('❌ Failed to save content to the API.');
            }
        });
        
        setupDeleteButtons(); // Ensure delete buttons are functional
    }

    /**
     * Sets up event listeners for the delete buttons in the management lists.
     */
    function setupDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.removeEventListener('click', handleDelete); // Prevent multiple handlers
            button.addEventListener('click', handleDelete);
        });
    }
    
    /**
     * Handles the deletion of an item and updates the API.
     * @param {Event} e - The click event.
     */
    async function handleDelete(e) {
        const index = e.target.getAttribute('data-index');
        const type = e.target.getAttribute('data-type');
        
        if (confirm(`Are you sure you want to delete this ${type} item? This will affect the live site.`)) {
            
            const content = await fetchContentFromAPI();

            if (type === 'ad') {
                content.ads.splice(index, 1);
            } else if (type === 'shop') {
                content.shopItems.splice(index, 1);
            }
            
            if (await updateContentInAPI(content)) {
                alert('✅ Item deleted successfully from the live site!');
                loadCurrentContent(); // Refresh the manage list
                // loadAdsContent(); // Refresh public view if needed
                // loadShopContent();
            } else {
                alert('❌ Failed to delete item from the API.');
            }
        }
    }


    // --- Content Loading for Public and Manage Pages ---

    /**
     * Loads and displays the current list of ads and shop items on the manage page.
     */
    async function loadCurrentContent() {
        const currentAdsList = document.getElementById('current-ads-list');
        const currentShopList = document.getElementById('current-shop-list');
        
        // Fetch fresh data
        const content = await fetchContentFromAPI();
        const ads = content.ads;
        const items = content.shopItems;

        // Populate Ads List
        if (currentAdsList) {
            currentAdsList.innerHTML = '';
            ads.forEach((ad, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${ad.title}</span>
                    <button data-index="${index}" data-type="ad" class="delete-btn">Delete</button>
                `;
                currentAdsList.appendChild(li);
            });
        }

        // Populate Shop Items List
        if (currentShopList) {
            currentShopList.innerHTML = '';
            items.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <button data-index="${index}" data-type="shop" class="delete-btn">Delete</button>
                `;
                currentShopList.appendChild(li);
            });
        }
        
        setupDeleteButtons();
    }
    
    /**
     * Loads content for the public ads.html page.
     */
    async function loadAdsContent() {
        const adsContainer = document.getElementById('ads-container');
        if (!adsContainer) return;

        const content = await fetchContentFromAPI();
        const ads = content.ads;
        adsContainer.innerHTML = ''; 

        if (ads.length === 0) {
            adsContainer.innerHTML = '<p style="text-align:center;">No new ads are currently running. Check back soon!</p>';
        }

        ads.forEach(ad => {
            const adCard = document.createElement('div');
            adCard.className = 'ad-card service-card';
            adCard.innerHTML = `
                <h3>${ad.title}</h3>
                <p>${ad.desc}</p>
                ${ad.link ? `<a href="${ad.link}" class="cta-button">Learn More</a>` : ''}
            `;
            adsContainer.appendChild(adCard);
        });
    }

    /**
     * Loads content for the public shop.html page.
     */
    async function loadShopContent() {
        const shopContainer = document.getElementById('shop-container');
        if (!shopContainer) return;
        
        const content = await fetchContentFromAPI();
        const shopItems = content.shopItems;
        shopContainer.innerHTML = ''; 

        if (shopItems.length === 0) {
             shopContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align:center;">We are currently restocking the shop. Check back soon!</p>';
        }

        shopItems.forEach(item => {
            const shopItem = document.createElement('div');
            shopItem.className = 'product-item gallery-item';
            shopItem.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <p class="price">${item.price}</p>
                <a href="8493834.github.io/hi/" class="cta-button">Buy Now</a>
            `;
            shopContainer.appendChild(shopItem);
        });
    }
    
    // Start the application logic
    init();
});

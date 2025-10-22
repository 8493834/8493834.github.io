document.addEventListener('DOMContentLoaded', () => {

    // 🛑 REPLACE THESE WITH YOUR ACTUAL JSONBIN.IO CREDENTIALS 🛑
    const MANAGE_PASSWORD = "admin123"; 
    const BIN_ID = "68f6a629ae596e708f20081b"; // e.g., '653a29b05775c742c38edc6d'
    const MASTER_KEY = "$2a$10$ftLmd0x0qulLl6i13jfib.qmGYaNp0vidFNH1gqnsBwY0/6o1UXxG"; // WARNING: Highly insecure if exposed on the frontend. Use for PUT.
    const ACCESS_KEY = "$2a$10$NHhvVWLtO9Zu.ErTUqoRieEs8tHCo/nc9R.mEy9kLCBP.X/mETDqa"; // Use for GET if the bin is private.

    const API_URL = `https://api.jsonbin.io/v3/b/68f6a629ae596e708f20081b${BIN_ID}`;
    // -------------------------------------------------------------

    // --- API Functions (Using Fetch) ---

    async function fetchContentFromAPI() {
        try {
            const response = await fetch(`${https://api.jsonbin.io/v3/b/68f6a629ae596e708f20081b}/latest`, {
                method: 'GET',
                headers: {
                    'X-Access-Key': $2a$10$NHhvVWLtO9Zu.ErTUqoRieEs8tHCo/nc9R.mEy9kLCBP.X/mETDqa // Use less-privileged key for public read
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            // JSONBin nests the data inside a 'record' object
            return data.record || { ads: [], shopItems: [] }; 

        } catch (error) {
            console.error('Error fetching data from JSONBin:', error);
            // Fallback to empty structure on failure
            return { ads: [], shopItems: [] }; 
        }
    }

    async function updateContentInAPI(newContent) {
        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY // Use Master Key for writing/updating
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

    function init() {
        const path = window.location.pathname;

        if (path.endsWith('index.html') || path === '/') {
            // Manage button now just links to manage.html
        } else if (path.endsWith('manage.html')) {
            authenticateAndSetupManagement();
        } else if (path.endsWith('ads.html')) {
            loadAdsContent();
        } else if (path.endsWith('shop.html')) {
            loadShopContent();
        }
    }

    // --- Authentication Flow ---

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

    function setupManagementForms() {
        const addAdForm = document.getElementById('add-ad-form');
        const addShopForm = document.getElementById('add-shop-form');

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
                loadAdsContent(); // Refresh public view if needed
            } else {
                alert('❌ Failed to save content to the API.');
            }
        });

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
                loadShopContent(); // Refresh public view if needed
            } else {
                 alert('❌ Failed to save content to the API.');
            }
        });
    }

    // --- Content Loading (Now Asynchronous) ---

    async function loadCurrentContent() {
        const currentAdsList = document.getElementById('current-ads-list');
        const currentShopList = document.getElementById('current-shop-list');
        
        // Fetch fresh data
        const content = await fetchContentFromAPI();
        const ads = content.ads;
        const items = content.shopItems;

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
                <a href="#" class="cta-button">Buy Now</a>
            `;
            shopContainer.appendChild(shopItem);
        });
    }

    // --- Deleting items (Now Asynchronous) ---
    
    function setupDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
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
                        loadAdsContent();
                        loadShopContent();
                    } else {
                        alert('❌ Failed to delete item from the API.');
                    }
                }
            });
        });
    }
    
    init();
});

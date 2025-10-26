document.addEventListener('DOMContentLoaded', () => {

    // 🛑 REPLACE THESE WITH YOUR ACTUAL JSONBIN.IO CREDENTIALS 🛑
    const MANAGE_PASSWORD = "ADMIN!@#"; 
    const BIN_ID = "68fb133f43b1c97be97c60c2"; 
    const MASTER_KEY = "$2a$10$cyMnz51JbXNQBoIE7Gi.seT.I2EkWazeGljSLnum7IjzDeOPn5wSi"; 
    const ACCESS_KEY = "$2a$10$NHhvVWLtO9Zu.ErTUqoRieEs8tHCo/nc9R.mEy9kLCBP.X/mETDqa"; 

    const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
    // -------------------------------------------------------------
    
    // 🎯 OFFLINE STORAGE KEYS 🎯
    const CACHE_KEY = 'contentCache';
    const SYNC_QUEUE_KEY = 'syncQueue';
    
    let editingItem = null; 

    // --- Local Storage Helpers ---

    function getLocalContent() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            return cached ? JSON.parse(cached) : { ads: [], shopItems: [], onlineGames: [] };
        } catch (e) {
            console.error("Error reading from local storage:", e);
            return { ads: [], shopItems: [], onlineGames: [] };
        }
    }

    function setLocalContent(content) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(content));
        } catch (e) {
            console.error("Error writing to local storage:", e);
        }
    }
    
    function getSyncQueue() {
        try {
            const queue = localStorage.getItem(SYNC_QUEUE_KEY);
            return queue ? JSON.parse(queue) : [];
        } catch (e) {
            console.error("Error reading sync queue:", e);
            return [];
        }
    }

    function setSyncQueue(queue) {
        try {
            localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.error("Error writing sync queue:", e);
        }
    }
    
    // --- API Functions (Now Offline-Aware) ---

    // 🎯 MODIFIED: Fetches from network, saves to cache, falls back to cache 🎯
    async function fetchContentFromAPI() {
        console.log('Attempting to fetch content from API...');
        try {
            const response = await fetch(`${API_URL}/latest`, {
                method: 'GET',
                headers: { 'X-Access-Key': ACCESS_KEY }
            });

            if (!response.ok) {
                // If network succeeds but API returns error, throw to fall back to cache
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const content = data.record || { ads: [], shopItems: [], onlineGames: [] };
            
            // Success: Save the fresh content to local storage
            setLocalContent(content);
            console.log('Content fetched from API and cached.');
            return content;

        } catch (error) {
            console.error('API fetch failed. Falling back to Local Storage cache.', error);
            // Fallback: Return cached content
            return getLocalContent();
        }
    }
    
    // 🎯 NEW: Attempts to save to the API and runs the sync queue 🎯
    async function updateContentInAPI(newContent, skipQueue = false) {
        if (!navigator.onLine || skipQueue) {
            
            if (!skipQueue) {
                console.log('Offline or API blocked. Queuing changes locally...');
                // If offline, queue the entire new content structure
                let queue = getSyncQueue();
                queue.push(newContent);
                setSyncQueue(queue);
                alert('⚠️ You are offline. Changes saved locally and will sync when online.');
                
                // Immediately update local content so the user sees their change
                setLocalContent(newContent); 
            }
            
            // If the call was a result of the syncQueue, we skip the alert/queue step
            if (skipQueue) {
                setLocalContent(newContent); // Always update local state immediately
            }

            // Always try to sync after a change, just in case connection just returned
            syncQueue(); 
            return false; // Return false to indicate the change was not immediately live
        }
        
        // --- ONLINE LOGIC ---
        console.log('Attempting to update API directly...');
        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY
                },
                body: JSON.stringify(newContent)
            });

            if (!response.ok) {
                // If API call fails (e.g., key error, rate limit), queue the change
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Success: Update local cache and return true
            setLocalContent(newContent); 
            return true; 

        } catch (error) {
            console.error('Online update failed. Queuing content for sync.', error);
            // On failure, fall back to queuing and running the sync routine
            return updateContentInAPI(newContent, false); 
        }
    }
    
    // 🎯 NEW: Synchronization Logic 🎯
    async function syncQueue() {
        if (!navigator.onLine) {
            console.log('Cannot sync: Still offline.');
            return;
        }

        let queue = getSyncQueue();
        if (queue.length === 0) {
            console.log('Sync queue is empty.');
            return;
        }
        
        // The last item in the queue is the most recent (and correct) state
        const contentToSync = queue[queue.length - 1]; 

        console.log(`Attempting to sync ${queue.length} pending update(s)...`);

        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY
                },
                body: JSON.stringify(contentToSync)
            });

            if (response.ok) {
                // Success: Clear the queue and notify
                setSyncQueue([]);
                setLocalContent(contentToSync); // Ensure local cache is updated after successful sync
                alert('✅ Synchronization successful! Offline changes are now live.');
                loadCurrentContent(); // Refresh the management page data
            } else {
                 console.error('Sync failed on the server side:', response.status);
            }
        } catch (error) {
            console.error('Sync failed due to network or server error.', error);
        }
    }


    // --- Initialization and Routing ---

    function init() {
        const path = window.location.pathname;

        // Add listener to automatically sync when the browser detects an internet connection
        window.addEventListener('online', syncQueue);
        
        // Run an initial sync check if we load while online
        if (navigator.onLine) {
            syncQueue();
        }

        // ... (rest of init remains the same, but now uses offline-aware loaders) ...
        if (path.endsWith('index.html') || path === '/') {
            // Nothing to do on home
        } else if (path.endsWith('manage.html')) {
            authenticateAndSetupManagement();
        } else if (path.endsWith('ads.html')) {
            loadAdsContent();
        } else if (path.endsWith('shop.html')) {
            loadShopContent();
        } else if (path.endsWith('games.html')) {
            loadGamesContent();
        }
    }

    // ... (authenticateAndSetupManagement remains the same) ...
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

    // ... (endEditMode remains the same) ...
    function endEditMode(form) {
        editingItem = null;
        form.reset();
        form.querySelector('button[type="submit"]').textContent = `Add ${form.getAttribute('data-type')}`;
        document.getElementById('edit-cancel-btn-' + form.getAttribute('data-type')).style.display = 'none';
    }


    // --- Form Submission Logic (MODIFIED for Offline-Awareness) ---

    function setupManagementForms() {
        const addAdForm = document.getElementById('add-ad-form');
        const addShopForm = document.getElementById('add-shop-form');
        const addGameForm = document.getElementById('add-game-form');

        document.getElementById('edit-cancel-btn-ad').addEventListener('click', () => endEditMode(addAdForm));
        document.getElementById('edit-cancel-btn-shop').addEventListener('click', () => endEditMode(addShopForm));
        document.getElementById('edit-cancel-btn-game').addEventListener('click', () => endEditMode(addGameForm));


        // AD FORM SUBMISSION
        addAdForm.setAttribute('data-type', 'Ad');
        addAdForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const adTitle = document.getElementById('ad-title').value;
            const adDesc = document.getElementById('ad-desc').value;
            const adLink = document.getElementById('ad-link').value;
            const newAd = { title: adTitle, desc: adDesc, link: adLink };
            
            const content = getLocalContent(); // Start with cached content
            
            if (editingItem && editingItem.type === 'ad') {
                content.ads[editingItem.index] = newAd;
                endEditMode(addAdForm);
            } else {
                content.ads.push(newAd);
            }
            
            // Use the offline-aware update function
            await updateContentInAPI(content);
            loadCurrentContent(); 
            loadAdsContent(); 
        });

        // SHOP FORM SUBMISSION
        addShopForm.setAttribute('data-type', 'Product');
        addShopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const itemImg = document.getElementById('item-img').value;
            const itemName = document.getElementById('item-name').value;
            const itemDesc = document.getElementById('item-desc').value;
            const itemPrice = document.getElementById('item-price').value;
            const newItem = { img: itemImg, name: itemName, desc: itemDesc, price: itemPrice };
            
            const content = getLocalContent();

            if (editingItem && editingItem.type === 'shop') {
                content.shopItems[editingItem.index] = newItem;
                endEditMode(addShopForm);
            } else {
                content.shopItems.push(newItem);
            }
            
            await updateContentInAPI(content);
            loadCurrentContent();
            loadShopContent();
        });
        
        // GAME FORM SUBMISSION
        addGameForm.setAttribute('data-type', 'Game');
        addGameForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const gameImg = document.getElementById('game-img').value;
            const gameName = document.getElementById('game-name').value;
            const gameDesc = document.getElementById('game-desc').value;
            const gameLink = document.getElementById('game-link').value;
            const newGame = { img: gameImg, name: gameName, desc: gameDesc, link: gameLink };
            
            const content = getLocalContent();
            
            if (!content.onlineGames) content.onlineGames = []; 

            if (editingItem && editingItem.type === 'game') {
                content.onlineGames[editingItem.index] = newGame;
                endEditMode(addGameForm);
            } else {
                content.onlineGames.push(newGame);
            }
            
            await updateContentInAPI(content);
            loadCurrentContent();
            loadGamesContent();
        });
    }

    // --- Start Edit Mode (Remains the same, uses getLocalContent now) ---
    async function startEdit(index, type) {
        // Use local content since we are already on the manage page
        const content = getLocalContent(); 
        let item;
        let formId;
        
        // Determine the array and form based on type
        if (type === 'ad') {
            item = content.ads[index];
            formId = 'add-ad-form';
        } else if (type === 'shop') {
            item = content.shopItems[index];
            formId = 'add-shop-form';
        } else if (type === 'game') {
            item = content.onlineGames[index];
            formId = 'add-game-form';
        }

        if (!item) return;

        // Set editing state
        editingItem = { index, type };

        // Get the form elements
        const form = document.getElementById(formId);
        
        // Populate the form fields
        if (type === 'ad') {
            document.getElementById('ad-title').value = item.title;
            document.getElementById('ad-desc').value = item.desc;
            document.getElementById('ad-link').value = item.link;
        } else if (type === 'shop') {
            document.getElementById('item-img').value = item.img;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-desc').value = item.desc;
            document.getElementById('item-price').value = item.price;
        } else if (type === 'game') {
            document.getElementById('game-img').value = item.img;
            document.getElementById('game-name').value = item.name;
            document.getElementById('game-desc').value = item.desc;
            document.getElementById('game-link').value = item.link;
        }
        
        // Change button text and display cancel
        form.querySelector('button[type="submit"]').textContent = `Save Changes (${type.toUpperCase()})`;
        document.getElementById('edit-cancel-btn-' + type).style.display = 'inline-block';

        // Scroll to the form
        form.scrollIntoView({ behavior: 'smooth' });
    }


    // --- Content Loading (MODIFIED to rely on Local/Fetched Content) ---

    // loadCurrentContent now always uses the cached content (which might be the latest sync)
    async function loadCurrentContent() {
        const currentAdsList = document.getElementById('current-ads-list');
        const currentShopList = document.getElementById('current-shop-list');
        const currentGamesList = document.getElementById('current-games-list');
        
        // Ensures we either get fresh content or the cached content for management
        const content = await fetchContentFromAPI(); 
        
        const ads = content.ads;
        const items = content.shopItems;
        const games = content.onlineGames;

        // ... (rest of list rendering logic is the same) ...
        
        // Load Ads
        if (currentAdsList) {
            currentAdsList.innerHTML = '';
            ads.forEach((ad, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${ad.title}</span>
                    <div class="actions">
                        <button data-index="${index}" data-type="ad" class="edit-btn">Edit</button>
                        <button data-index="${index}" data-type="ad" class="delete-btn">Delete</button>
                    </div>
                `;
                currentAdsList.appendChild(li);
            });
        }

        // Load Shop Items
        if (currentShopList) {
            currentShopList.innerHTML = '';
            items.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <div class="actions">
                        <button data-index="${index}" data-type="shop" class="edit-btn">Edit</button>
                        <button data-index="${index}" data-type="shop" class="delete-btn">Delete</button>
                    </div>
                `;
                currentShopList.appendChild(li);
            });
        }
        
        // Load Games
        if (currentGamesList) {
            currentGamesList.innerHTML = '';
            games.forEach((game, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${game.name}</span>
                    <div class="actions">
                        <button data-index="${index}" data-type="game" class="edit-btn">Edit</button>
                        <button data-index="${index}" data-type="game" class="delete-btn">Delete</button>
                    </div>
                `;
                currentGamesList.appendChild(li);
            });
        }
        
        setupDeleteButtons();
        setupEditButtons();
    }
    
    // The public facing content loaders must also use fetchContentFromAPI for offline resilience
    async function loadAdsContent() {
        const adsContainer = document.getElementById('ads-container');
        if (!adsContainer) return;

        const content = await fetchContentFromAPI();
        const ads = content.ads;
        adsContainer.innerHTML = ''; 

        // ... (rest of ads content rendering remains the same) ...
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

        // ... (rest of shop content rendering remains the same) ...
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

    async function loadGamesContent() {
        const gamesContainer = document.getElementById('games-container');
        if (!gamesContainer) return;
        
        const content = await fetchContentFromAPI();
        const onlineGames = content.onlineGames;
        gamesContainer.innerHTML = ''; 

        // ... (rest of games content rendering remains the same) ...
        if (onlineGames.length === 0) {
             gamesContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align:center;">Our online games are currently offline for maintenance. Check back soon!</p>';
        }

        onlineGames.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card service-card';
            gameCard.innerHTML = `
                <img src="${game.img}" alt="${game.name}" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 15px;">
                <h3>${game.name}</h3>
                <p>${game.desc}</p>
                <a href="${game.link}" class="cta-button">Play Now</a>
            `;
            gamesContainer.appendChild(gameCard);
        });
    }


    // --- Deleting items (MODIFIED for Offline-Awareness) ---
    
    function setupDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const index = e.target.getAttribute('data-index');
                const type = e.target.getAttribute('data-type');
                
                if (confirm(`Are you sure you want to delete this ${type} item? This will affect the live site.`)) {
                    
                    const content = getLocalContent();

                    if (type === 'ad') {
                        content.ads.splice(index, 1);
                    } else if (type === 'shop') {
                        content.shopItems.splice(index, 1);
                    } else if (type === 'game') { 
                        content.onlineGames.splice(index, 1);
                    }
                    
                    // Use the offline-aware update function
                    await updateContentInAPI(content);
                    
                    loadCurrentContent(); 
                    loadAdsContent();
                    loadShopContent();
                    loadGamesContent(); 
                }
            });
        });
    }

    // ... (setupEditButtons remains the same) ...
    function setupEditButtons() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const type = e.target.getAttribute('data-type');
                startEdit(index, type);
            });
        });
    }
    
    init();
});

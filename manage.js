document.addEventListener('DOMContentLoaded', () => {

    // 🛑 REPLACE THESE WITH YOUR ACTUAL JSONBIN.IO CREDENTIALS 🛑
    const MANAGE_PASSWORD = "admin123"; 
    const BIN_ID = "68fb133f43b1c97be97c60c2"; //  <-- Your unique Bin ID here
    const MASTER_KEY = "$2a$10$cyMnz51JbXNQBoIE7Gi.seT.I2EkWazeGljSLnum7IjzDeOPn5wSi"; 
    const ACCESS_KEY = "$2a$10$NHhvVWLtO9Zu.ErTUqoRieEs8tHCo/nc9R.mEy9kLCBP.X/mETDqa"; 

    const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
    // -------------------------------------------------------------
    
    // 🎯 NEW: State to track which item is being edited 🎯
    let editingItem = null; 

    // --- API Functions (Using Fetch) ---

    async function fetchContentFromAPI() {
        try {
            const response = await fetch(`${API_URL}/latest`, {
                method: 'GET',
                headers: {
                    'X-Access-Key': ACCESS_KEY
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.record || { ads: [], shopItems: [], onlineGames: [] }; 

        } catch (error) {
            console.error('Error fetching data from JSONBin:', error);
            return { ads: [], shopItems: [], onlineGames: [] }; 
        }
    }

    async function updateContentInAPI(newContent) {
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

    // 🎯 NEW: Reset state and form 🎯
    function endEditMode(form) {
        editingItem = null;
        form.reset();
        form.querySelector('button[type="submit"]').textContent = `Add ${form.getAttribute('data-type')}`;
        document.getElementById('edit-cancel-btn-' + form.getAttribute('data-type')).style.display = 'none';
    }


    // --- Form and Add/Delete Logic (Now includes Edit) ---

    function setupManagementForms() {
        const addAdForm = document.getElementById('add-ad-form');
        const addShopForm = document.getElementById('add-shop-form');
        const addGameForm = document.getElementById('add-game-form');

        // Setup Cancel Buttons
        document.getElementById('edit-cancel-btn-ad').addEventListener('click', () => endEditMode(addAdForm));
        document.getElementById('edit-cancel-btn-shop').addEventListener('click', () => endEditMode(addShopForm));
        document.getElementById('edit-cancel-btn-game').addEventListener('click', () => endEditMode(addGameForm));


        // 🎯 MODIFIED: AD FORM SUBMISSION 🎯
        addAdForm.setAttribute('data-type', 'Ad');
        addAdForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const adTitle = document.getElementById('ad-title').value;
            const adDesc = document.getElementById('ad-desc').value;
            const adLink = document.getElementById('ad-link').value;
            const newAd = { title: adTitle, desc: adDesc, link: adLink };
            
            const content = await fetchContentFromAPI();
            
            if (editingItem && editingItem.type === 'ad') {
                content.ads[editingItem.index] = newAd; // Update existing item
                alert('✅ Ad updated successfully!');
                endEditMode(addAdForm);
            } else {
                content.ads.push(newAd); // Add new item
                alert('✅ New ad added successfully!');
            }
            
            if (await updateContentInAPI(content)) {
                loadCurrentContent(); 
                loadAdsContent(); 
            } else {
                alert('❌ Failed to save content to the API.');
            }
        });

        // 🎯 MODIFIED: SHOP FORM SUBMISSION 🎯
        addShopForm.setAttribute('data-type', 'Product');
        addShopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const itemImg = document.getElementById('item-img').value;
            const itemName = document.getElementById('item-name').value;
            const itemDesc = document.getElementById('item-desc').value;
            const itemPrice = document.getElementById('item-price').value;
            const newItem = { img: itemImg, name: itemName, desc: itemDesc, price: itemPrice };
            
            const content = await fetchContentFromAPI();

            if (editingItem && editingItem.type === 'shop') {
                content.shopItems[editingItem.index] = newItem; // Update existing item
                alert('✅ Shop item updated successfully!');
                endEditMode(addShopForm);
            } else {
                content.shopItems.push(newItem); // Add new item
                alert('✅ New shop item added successfully!');
            }
            
            if (await updateContentInAPI(content)) {
                loadCurrentContent();
                loadShopContent();
            } else {
                 alert('❌ Failed to save content to the API.');
            }
        });
        
        // 🎯 MODIFIED: GAME FORM SUBMISSION 🎯
        addGameForm.setAttribute('data-type', 'Game');
        addGameForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const gameImg = document.getElementById('game-img').value;
            const gameName = document.getElementById('game-name').value;
            const gameDesc = document.getElementById('game-desc').value;
            const gameLink = document.getElementById('game-link').value;
            const newGame = { img: gameImg, name: gameName, desc: gameDesc, link: gameLink };
            
            const content = await fetchContentFromAPI();
            
            if (!content.onlineGames) content.onlineGames = []; 

            if (editingItem && editingItem.type === 'game') {
                content.onlineGames[editingItem.index] = newGame; // Update existing item
                alert('✅ Online game updated successfully!');
                endEditMode(addGameForm);
            } else {
                content.onlineGames.push(newGame); // Add new item
                alert('✅ New online game added successfully!');
            }
            
            if (await updateContentInAPI(content)) {
                loadCurrentContent();
                loadGamesContent();
            } else {
                 alert('❌ Failed to save content to the API.');
            }
        });
    }

    // 🎯 NEW: Start Edit Mode 🎯
    async function startEdit(index, type) {
        const content = await fetchContentFromAPI();
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


    // --- Content Loading (Updated to include Edit button) ---

    async function loadCurrentContent() {
        const currentAdsList = document.getElementById('current-ads-list');
        const currentShopList = document.getElementById('current-shop-list');
        const currentGamesList = document.getElementById('current-games-list');
        
        const content = await fetchContentFromAPI();
        const ads = content.ads;
        const items = content.shopItems;
        const games = content.onlineGames;

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
        setupEditButtons(); // 🎯 NEW: Setup Edit button listeners 🎯
    }
    
    // ... (loadAdsContent, loadShopContent, loadGamesContent remain the same) ...
    // Note: These functions are kept separate for modularity, they rely on the updated fetchContentFromAPI.
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

    async function loadGamesContent() {
        const gamesContainer = document.getElementById('games-container');
        if (!gamesContainer) return;
        
        const content = await fetchContentFromAPI();
        const onlineGames = content.onlineGames;
        gamesContainer.innerHTML = ''; 

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


    // --- Edit Button Setup ---
    function setupEditButtons() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const type = e.target.getAttribute('data-type');
                startEdit(index, type);
            });
        });
    }
    
    // --- Deleting items (unchanged logic) ---
    
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
                    } else if (type === 'game') { 
                        content.onlineGames.splice(index, 1);
                    }
                    
                    if (await updateContentInAPI(content)) {
                        alert('✅ Item deleted successfully from the live site!');
                        loadCurrentContent(); 
                        loadAdsContent();
                        loadShopContent();
                        loadGamesContent(); 
                    } else {
                        alert('❌ Failed to delete item from the API.');
                    }
                }
            });
        });
    }
    
    init();
});

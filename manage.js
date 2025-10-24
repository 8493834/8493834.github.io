document.addEventListener('DOMContentLoaded', () => {

    // 🛑 REPLACE THESE WITH YOUR ACTUAL JSONBIN.IO CREDENTIALS 🛑
    const MANAGE_PASSWORD = "P@$$worD"; 
    const BIN_ID = "68fb133f43b1c97be97c60c2"; //  <-- Your unique Bin ID here
    const MASTER_KEY = "$2a$10$cyMnz51JbXNQBoIE7Gi.seT.I2EkWazeGljSLnum7IjzDeOPn5wSi"; 
    const ACCESS_KEY = "$2a$10$NHhvVWLtO9Zu.ErTUqoRieEs8tHCo/nc9R.mEy9kLCBP.X/mETDqa"; 

    const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
    // -------------------------------------------------------------

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
            // Ensure the default structure includes the new onlineGames array
            return data.record || { ads: [], shopItems: [], onlineGames: [] }; 

        } catch (error) {
            console.error('Error fetching data from JSONBin:', error);
            // Fallback to empty structure on failure
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
        } else if (path.endsWith('games.html')) { // 🎯 NEW ROUTE 🎯
            loadGamesContent();
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
        const addGameForm = document.getElementById('add-game-form'); // 🎯 NEW FORM 🎯

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
                loadAdsContent(); 
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
                loadShopContent();
            } else {
                 alert('❌ Failed to save content to the API.');
            }
        });
        
        // 🎯 NEW GAME FORM SUBMISSION 🎯
        addGameForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const gameImg = document.getElementById('game-img').value;
            const gameName = document.getElementById('game-name').value;
            const gameDesc = document.getElementById('game-desc').value;
            const gameLink = document.getElementById('game-link').value;
            const newGame = { img: gameImg, name: gameName, desc: gameDesc, link: gameLink };
            
            const content = await fetchContentFromAPI();
            // Check if onlineGames exists, initialize if it doesn't (safety check)
            if (!content.onlineGames) content.onlineGames = []; 
            content.onlineGames.push(newGame);
            
            if (await updateContentInAPI(content)) {
                alert('✅ New online game added successfully!');
                addGameForm.reset();
                loadCurrentContent();
                loadGamesContent();
            } else {
                 alert('❌ Failed to save content to the API.');
            }
        });
    }

    // --- Content Loading (Now Asynchronous) ---

    async function loadCurrentContent() {
        const currentAdsList = document.getElementById('current-ads-list');
        const currentShopList = document.getElementById('current-shop-list');
        const currentGamesList = document.getElementById('current-games-list'); // 🎯 NEW LIST 🎯
        
        const content = await fetchContentFromAPI();
        const ads = content.ads;
        const items = content.shopItems;
        const games = content.onlineGames; // 🎯 NEW DATA 🎯

        // Load Ads
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

        // Load Shop Items
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
        
        // 🎯 Load Games 🎯
        if (currentGamesList) {
            currentGamesList.innerHTML = '';
            games.forEach((game, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${game.name}</span>
                    <button data-index="${index}" data-type="game" class="delete-btn">Delete</button>
                `;
                currentGamesList.appendChild(li);
            });
        }
        
        setupDeleteButtons();
    }
    
    // ... (loadAdsContent and loadShopContent are unchanged, but rely on the updated fetchContentFromAPI) ...
    
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

    // 🎯 NEW FUNCTION TO LOAD GAMES CONTENT 🎯
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
                    } else if (type === 'game') { // 🎯 NEW DELETION LOGIC 🎯
                        content.onlineGames.splice(index, 1);
                    }
                    
                    if (await updateContentInAPI(content)) {
                        alert('✅ Item deleted successfully from the live site!');
                        loadCurrentContent(); // Refresh the manage list
                        loadAdsContent();
                        loadShopContent();
                        loadGamesContent(); // Refresh games list
                    } else {
                        alert('❌ Failed to delete item from the API.');
                    }
                }
            });
        });
    }
    
    init();
});

document.addEventListener('DOMContentLoaded', () => {

    const password = "admin123"; // **WARNING: INSECURE. USE A BACKEND FOR REAL SITES.**

    function init() {
        const path = window.location.pathname;

        if (path.endsWith('index.html') || path === '/') {
            setupManagementButton();
        } else if (path.endsWith('manage.html')) {
            setupManagementForms();
            loadCurrentContent();
        } else if (path.endsWith('ads.html')) {
            loadAdsContent();
        } else if (path.endsWith('shop.html')) {
            loadShopContent();
        }
    }

    // --- Core Functions for managing content in localStorage ---
    
    function getAds() {
        return JSON.parse(localStorage.getItem('ads')) || [];
    }

    function saveAds(ads) {
        localStorage.setItem('ads', JSON.stringify(ads));
    }

    function getShopItems() {
        return JSON.parse(localStorage.getItem('shopItems')) || [];
    }

    function saveShopItems(items) {
        localStorage.setItem('shopItems', JSON.stringify(items));
    }

    // --- Setup for different pages ---

    function setupManagementButton() {
        const manageButton = document.getElementById('manage-button');
        if (manageButton) {
            manageButton.addEventListener('click', (e) => {
                e.preventDefault();
                const enteredPassword = prompt("Please enter the password to access the management page:");
                if (enteredPassword === password) {
                    window.location.href = "manage.html";
                } else {
                    alert("Incorrect password. Access denied.");
                }
            });
        }
    }

    function setupManagementForms() {
        const addAdForm = document.getElementById('add-ad-form');
        const addShopForm = document.getElementById('add-shop-form');

        addAdForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const adTitle = document.getElementById('ad-title').value;
            const adDesc = document.getElementById('ad-desc').value;
            const adLink = document.getElementById('ad-link').value;
            const newAd = { title: adTitle, desc: adDesc, link: adLink };
            const ads = getAds();
            ads.push(newAd);
            saveAds(ads);
            alert('New ad added successfully!');
            addAdForm.reset();
            loadCurrentContent(); // Refresh the list
        });

        addShopForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const itemImg = document.getElementById('item-img').value;
            const itemName = document.getElementById('item-name').value;
            const itemDesc = document.getElementById('item-desc').value;
            const itemPrice = document.getElementById('item-price').value;
            const newItem = { img: itemImg, name: itemName, desc: itemDesc, price: itemPrice };
            const items = getShopItems();
            items.push(newItem);
            saveShopItems(items);
            alert('New shop item added successfully!');
            addShopForm.reset();
            loadCurrentContent(); // Refresh the list
        });
    }

    // --- Functions to load and display content ---

    function loadCurrentContent() {
        const currentAdsList = document.getElementById('current-ads-list');
        const currentShopList = document.getElementById('current-shop-list');

        if (currentAdsList) {
            currentAdsList.innerHTML = '';
            const ads = getAds();
            ads.forEach((ad, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${ad.title}</span>
                    <button data-index="${index}" data-type="ad" class="delete-btn cta-button">Delete</button>
                `;
                currentAdsList.appendChild(li);
            });
        }

        if (currentShopList) {
            currentShopList.innerHTML = '';
            const items = getShopItems();
            items.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <button data-index="${index}" data-type="shop" class="delete-btn cta-button">Delete</button>
                `;
                currentShopList.appendChild(li);
            });
        }
        
        setupDeleteButtons();
    }
    
    function loadAdsContent() {
        const adsContainer = document.getElementById('ads-container');
        const ads = getAds();
        adsContainer.innerHTML = ''; // Clear container first
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

    function loadShopContent() {
        const shopContainer = document.getElementById('shop-container');
        const shopItems = getShopItems();
        shopContainer.innerHTML = ''; // Clear container first
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

    // --- Deleting items ---
    
    function setupDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                const type = e.target.getAttribute('data-type');
                
                if (confirm(`Are you sure you want to delete this ${type} item?`)) {
                    if (type === 'ad') {
                        const ads = getAds();
                        ads.splice(index, 1);
                        saveAds(ads);
                    } else if (type === 'shop') {
                        const items = getShopItems();
                        items.splice(index, 1);
                        saveShopItems(items);
                    }
                    loadCurrentContent(); // Refresh the list
                }
            });
        });
    }
    
    init();
});
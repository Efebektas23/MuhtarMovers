// Game Data and Configuration
// Data has been moved to data.js
// Game State
let gameState = {
    currentMoveType: null,
    loadedItems: [],
    currentTruckIndex: 0,
    totalVolume: 0,
    totalWeight: 0,
    itemCount: 0,
    selectedPackingOption: 'self',
    boxRequirements: [],
    protectionRequirements: [],
    specialHandlingFees: 0,
    distance: 0
};

const SHARE_EMAIL = 'moving@muhtar.ca';
let shareFormBound = false;

function gt(key, fallback) {
    if (window.MuhtarI18n && typeof window.MuhtarI18n.t === 'function') {
        const value = window.MuhtarI18n.t(key);
        if (value && value !== key) return value;
    }
    return fallback || key;
}

function setPlayStep(step) {
    document.querySelectorAll('#play-steps li').forEach(function (li) {
        li.classList.toggle('is-on', li.getAttribute('data-step') === step);
    });
}

let inventoryStep = 1;

function setInventoryStep(step) {
    inventoryStep = Math.max(1, Math.min(3, Number(step) || 1));
    document.querySelectorAll('[data-inv-panel]').forEach(function (panel) {
        var active = Number(panel.getAttribute('data-inv-panel')) === inventoryStep;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
    });
    document.querySelectorAll('[data-inv-tab]').forEach(function (tab) {
        tab.classList.toggle('is-active', Number(tab.getAttribute('data-inv-tab')) === inventoryStep);
    });
    var back = document.getElementById('inv-back');
    var next = document.getElementById('inv-next');
    var send = document.getElementById('book-truck');
    var success = document.getElementById('share-success');
    var sent = !!(success && !success.hidden);
    if (back) back.disabled = inventoryStep === 1;
    if (next) {
      next.hidden = inventoryStep === 3 || sent;
      next.classList.toggle('hidden', next.hidden);
    }
    if (send) {
      send.hidden = inventoryStep !== 3 || sent;
      send.classList.toggle('hidden', send.hidden);
    }
    var body = document.querySelector('#results-modal .modal-body');
    if (body) body.scrollTop = 0;
}

function setupInventorySheet() {
    var next = document.getElementById('inv-next');
    var back = document.getElementById('inv-back');
    if (next) {
        next.addEventListener('click', function () {
            setInventoryStep(inventoryStep + 1);
        });
    }
    if (back) {
        back.addEventListener('click', function () {
            setInventoryStep(inventoryStep - 1);
        });
    }
    document.querySelectorAll('[data-inv-tab]').forEach(function (tab) {
        tab.addEventListener('click', function () {
            setInventoryStep(tab.getAttribute('data-inv-tab'));
        });
    });
}

function groupedInventoryLines() {
    const groups = {};
    gameState.loadedItems.forEach(function (item) {
        if (groups[item.name]) {
            groups[item.name].quantity += 1;
            groups[item.name].totalVolume += item.volume;
            groups[item.name].totalWeight += item.weight;
        } else {
            groups[item.name] = {
                name: item.name,
                quantity: 1,
                totalVolume: item.volume,
                totalWeight: item.weight
            };
        }
    });
    return Object.values(groups).map(function (group) {
        return group.name + ' x' + group.quantity + ' (' + group.totalVolume.toFixed(1) + ' m³, ' + group.totalWeight + ' lbs)';
    });
}

// DOM Elements
let elements = {};

// Initialize the game
document.addEventListener('DOMContentLoaded', function () {
    initializeElements();
    setupEventListeners();

    // Force hide modal immediately
    forceHideModal();

    // Show initial screen
    showInitialScreen();

    updateTruckDisplay();
    updateCapacityDisplay();
    document.addEventListener('languageChanged', function () {
        if (typeof updateCapacityDisplay === 'function') updateCapacityDisplay();
        if (gameState.currentMoveType && elements.gameInterface && !elements.gameInterface.classList.contains('hidden')) {
            populateItems(gameState.currentMoveType);
        }
    });
});

function initializeElements() {
    elements = {
        moveTypeSelection: document.getElementById('move-type-selection'),
        gameInterface: document.getElementById('game-interface'),
        itemsGrid: document.getElementById('items-grid'),
        truckContainer: document.getElementById('truck-container'),
        truckVisual: document.getElementById('truck-visual'),
        truckCargo: document.getElementById('truck-cargo'),
        truckType: document.getElementById('truck-type'),
        truckIcon: document.querySelector('.truck-icon'),
        capacityFill: document.getElementById('capacity-fill'),
        capacityText: document.getElementById('capacity-text'),
        totalVolume: document.getElementById('total-volume'),
        totalWeight: document.getElementById('total-weight'),
        itemsCount: document.getElementById('items-count'),
        calculateBtn: document.getElementById('calculate-btn'),
        resetBtn: document.getElementById('reset-btn'),
        resultsModal: document.getElementById('results-modal'),
        notification: document.getElementById('notification'),
        notificationText: document.getElementById('notification-text')
    };
}

function forceHideModal() {
    const modal = document.getElementById('results-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

function showInitialScreen() {
    showTypeWorkspace();
    const notification = document.getElementById('notification');
    if (notification) notification.classList.add('hidden');
}

function setupEventListeners() {
    // Move type selection
    document.querySelectorAll('.move-type-btn').forEach(btn => {
        btn.addEventListener('click', handleMoveTypeSelection);
    });

    // Truck container drag events - check if elements exist
    if (elements.truckContainer) {
        elements.truckContainer.addEventListener('dragover', handleDragOver);
        elements.truckContainer.addEventListener('drop', handleDrop);
        elements.truckContainer.addEventListener('dragenter', handleDragEnter);
        elements.truckContainer.addEventListener('dragleave', handleDragLeave);
    }

    // Control buttons - check if elements exist
    if (elements.calculateBtn) {
        elements.calculateBtn.addEventListener('click', showResults);
    }
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetGame);
    }

    const changeTypeBtn = document.getElementById('change-type-btn');
    if (changeTypeBtn) {
        changeTypeBtn.addEventListener('click', showTypeWorkspace);
    }

    // Modal events - check if elements exist
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    const calculateCostBtn = document.getElementById('calculate-cost');
    if (calculateCostBtn) {
        calculateCostBtn.addEventListener('click', calculateCost);
    }

    const bookTruckBtn = document.getElementById('book-truck');
    if (bookTruckBtn) {
        bookTruckBtn.addEventListener('click', function (e) {
            e.preventDefault();
            bookTruck();
        });
    }

    const shareForm = document.getElementById('inventory-share-form');
    if (shareForm && !shareFormBound) {
        shareFormBound = true;
        shareForm.addEventListener('submit', function (e) {
            e.preventDefault();
            bookTruck();
        });
    }

    const playAgainBtn = document.getElementById('play-again');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', playAgain);
    }

    // Notification close - check if element exists
    const notificationClose = document.querySelector('.notification-close');
    if (notificationClose) {
        notificationClose.addEventListener('click', closeNotification);
    }

    // Close modal when clicking outside - check if element exists
    if (elements.resultsModal) {
        elements.resultsModal.addEventListener('click', function (e) {
            if (e.target === elements.resultsModal) {
                closeModal();
            }
        });
    }

    // Touch support for mobile
    setupTouchSupport();
}

const ROOM_LABELS = {
    livingRoom: { key: 'room_living', fallback: 'Living room' },
    kitchen: { key: 'room_kitchen', fallback: 'Kitchen' },
    bedroom: { key: 'room_bedroom', fallback: 'Bedroom' },
    bathroom: { key: 'room_bathroom', fallback: 'Bathroom' },
    homeOffice: { key: 'room_office', fallback: 'Home office' },
    garage: { key: 'room_garage', fallback: 'Garage' },
    storage: { key: 'room_storage', fallback: 'Storage and boxes' },
    outdoor: { key: 'room_outdoor', fallback: 'Outdoor' },
    specialItems: { key: 'room_special', fallback: 'Special items' }
};

let activeRoomKey = null;

function setWorkspaceMode(mode) {
    const app = document.getElementById('app');
    if (app) app.classList.toggle('is-loading', mode === 'load');
    document.body.classList.toggle('is-loading-truck', mode === 'load');
}

function showTypeWorkspace() {
    setWorkspaceMode('type');

    const gameInterface = document.getElementById('game-interface');
    if (gameInterface) {
        gameInterface.classList.add('hidden');
        gameInterface.style.display = 'none';
    }

    const moveTypeSelection = document.getElementById('move-type-selection');
    if (moveTypeSelection) {
        moveTypeSelection.classList.remove('hidden');
        moveTypeSelection.style.display = 'block';
    }

    setPlayStep('type');
    window.scrollTo(0, 0);
}

function showLoadWorkspace() {
    setWorkspaceMode('load');

    const moveTypeSelection = document.getElementById('move-type-selection');
    if (moveTypeSelection) {
        moveTypeSelection.classList.add('hidden');
        moveTypeSelection.style.display = 'none';
    }

    const gameInterface = document.getElementById('game-interface');
    if (gameInterface) {
        gameInterface.classList.remove('hidden');
        gameInterface.style.display = 'flex';
    }

    setPlayStep('load');
    window.scrollTo(0, 0);
}

function clearLoadedItems() {
    gameState.loadedItems = [];
    gameState.currentTruckIndex = 0;
    gameState.totalVolume = 0;
    gameState.totalWeight = 0;
    gameState.itemCount = 0;
    gameState.boxRequirements = [];
    gameState.protectionRequirements = [];
    gameState.specialHandlingFees = 0;

    const truckCargo = document.getElementById('truck-cargo');
    if (truckCargo) {
        truckCargo.innerHTML = '<div class="drop-zone-text" data-translate="estimator_drop_zone">' +
            gt('estimator_drop_zone', 'Tap an item on the left to add it here') + '</div>';
    }

    updateTruckDisplay();
    updateStats();
    updateCapacityDisplay();
}

function handleMoveTypeSelection(e) {
    const moveType = e.currentTarget.dataset.type;

    if (gameState.currentMoveType && gameState.currentMoveType !== moveType && gameState.itemCount) {
        clearLoadedItems();
    }

    gameState.currentMoveType = moveType;
    if (moveType !== 'residential') activeRoomKey = null;

    document.querySelectorAll('.move-type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    e.currentTarget.classList.add('selected');

    showLoadWorkspace();
    populateItems(moveType);
}

function renderCatalogItems(entries) {
    if (!elements.itemsGrid) return;
    elements.itemsGrid.innerHTML = '';
    entries.forEach(function (entry) {
        elements.itemsGrid.appendChild(createItemElement(entry.item, entry.index));
    });
}

function populateItems(moveType) {
    if (!elements.itemsGrid) return;

    const tabs = document.getElementById('room-tabs');
    elements.itemsGrid.innerHTML = '';
    if (tabs) {
        tabs.innerHTML = '';
        tabs.hidden = true;
    }

    if (moveType === 'residential') {
        const rooms = [];
        let itemIndex = 0;

        Object.keys(itemData.residential).forEach(function (roomKey) {
            const roomItems = itemData.residential[roomKey];
            if (!roomItems || !roomItems.length) return;
            const info = ROOM_LABELS[roomKey] || { key: roomKey, fallback: roomKey };
            rooms.push({
                key: roomKey,
                info: info,
                entries: roomItems.map(function (item) {
                    return { item: item, index: itemIndex++ };
                })
            });
        });

        if (tabs) {
            tabs.hidden = false;
            rooms.forEach(function (room) {
                const tab = document.createElement('button');
                tab.type = 'button';
                tab.className = 'room-tab';
                tab.setAttribute('data-room', room.key);
                tab.setAttribute('aria-pressed', 'false');
                tab.textContent = gt(room.info.key, room.info.fallback);
                tab.addEventListener('click', function () {
                    activeRoomKey = room.key;
                    renderCatalogItems(room.entries);
                    tabs.querySelectorAll('.room-tab').forEach(function (t) {
                        const on = t.getAttribute('data-room') === room.key;
                        t.classList.toggle('is-on', on);
                        t.setAttribute('aria-pressed', on ? 'true' : 'false');
                    });
                });
                tabs.appendChild(tab);
            });
        }

        const current = rooms.find(function (room) { return room.key === activeRoomKey; }) || rooms[0];
        if (current) {
            activeRoomKey = current.key;
            if (tabs) {
                tabs.querySelectorAll('.room-tab').forEach(function (t) {
                    const on = t.getAttribute('data-room') === current.key;
                    t.classList.toggle('is-on', on);
                    t.setAttribute('aria-pressed', on ? 'true' : 'false');
                });
            }
            renderCatalogItems(current.entries);
        }
        return;
    }

    activeRoomKey = null;
    const items = itemData[moveType] || [];
    renderCatalogItems(items.map(function (item, index) {
        return { item: item, index: index };
    }));
}

// Function to toggle room accordion
function toggleRoom(header, itemsContainer) {
    const isOpen = itemsContainer.classList.contains('open');

    if (isOpen) {
        // Close room
        header.classList.remove('active');
        itemsContainer.classList.remove('open');
        header.querySelector('.room-toggle').textContent = '+';
    } else {
        // Open room
        header.classList.add('active');
        itemsContainer.classList.add('open');
        header.querySelector('.room-toggle').textContent = '−';

        // Optional: Close other rooms (uncomment if you want only one room open at a time)
        // closeOtherRooms(header);
    }
}

// Optional: Function to close other rooms (for single-room-open behavior)
function closeOtherRooms(currentHeader) {
    const allHeaders = document.querySelectorAll('.room-header');
    allHeaders.forEach(header => {
        if (header !== currentHeader && header.classList.contains('active')) {
            const container = header.nextElementSibling;
            header.classList.remove('active');
            container.classList.remove('open');
            header.querySelector('.room-toggle').textContent = '+';
        }
    });
}

function createItemElement(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.draggable = true;
    itemDiv.dataset.itemIndex = index;
    itemDiv.dataset.tooltip = 'Add to Estimate';

    // Convert m³ to cubic feet (1 m³ = 35.314 ft³)
    const volumeInFt3 = (item.volume * 35.314).toFixed(0);

    itemDiv.innerHTML = `
        <button class="add-btn" aria-label="Add ${item.name} to estimate" type="button">+</button>
        <div class="item-icon"><i class="${item.icon}"></i></div>
        <div class="item-name">${item.name}</div>
        <div class="item-specs">${item.volume}m³ (${volumeInFt3}ft³) • ${item.weight}lbs</div>
        <div class="click-hint">Tap to add</div>
    `;

    // Add button click handler (separate from item click)
    const addBtn = itemDiv.querySelector('.add-btn');
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent item click
        handleAddButtonClick(e, itemDiv, index, item);
    });

    // Add drag event listeners
    itemDiv.addEventListener('dragstart', handleDragStart);
    itemDiv.addEventListener('dragend', handleDragEnd);

    // Add click event listener for the whole item
    itemDiv.addEventListener('click', (e) => {
        // Don't trigger if clicking the add button (already handled)
        if (e.target.classList.contains('add-btn')) return;
        handleItemClick(e, index, itemDiv, item);
    });

    // Add touch event listeners for mobile
    itemDiv.addEventListener('touchstart', handleTouchStart, { passive: false });

    return itemDiv;
}

function handleDragStart(e) {
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.currentTarget.dataset.itemIndex);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
}

function handleItemClick(e, itemIndex, itemDiv, item) {
    // Check if event and target exist
    if (!e || !itemDiv) {
        return;
    }

    // Prevent click if item is being dragged
    if (itemDiv.classList.contains('dragging')) {
        return;
    }

    // Trigger fly-to animation and add item
    triggerFlyToAnimation(itemDiv, item, itemIndex);
}

// Handle + button click with animation
function handleAddButtonClick(e, itemDiv, itemIndex, item) {
    e.preventDefault();

    // Trigger fly-to animation and add item
    triggerFlyToAnimation(itemDiv, item, itemIndex);
}

// Fly-to animation function
function triggerFlyToAnimation(itemDiv, item, itemIndex) {
    // Add visual pulse feedback on item
    itemDiv.classList.add('adding');
    setTimeout(() => {
        itemDiv.classList.remove('adding');
    }, 500);

    // Create flying element
    const flyElement = document.createElement('div');
    flyElement.className = 'fly-item';
    flyElement.innerHTML = `<i class="${item.icon}"></i>`;
    flyElement.style.width = '50px';
    flyElement.style.height = '50px';

    // Get positions
    const itemRect = itemDiv.getBoundingClientRect();
    const truckCargo = document.getElementById('truck-cargo');
    const truckRect = truckCargo ? truckCargo.getBoundingClientRect() : null;

    if (!truckRect) {
        // Fallback: just add the item without animation
        addItemToTruck(itemIndex);
        return;
    }

    // Calculate animation path
    const startX = itemRect.left + itemRect.width / 2 - 25;
    const startY = itemRect.top + itemRect.height / 2 - 25;
    const endX = truckRect.left + truckRect.width / 2 - startX - 25;
    const endY = truckRect.top + truckRect.height / 2 - startY - 25;

    // Set CSS custom properties for animation
    flyElement.style.left = startX + 'px';
    flyElement.style.top = startY + 'px';
    flyElement.style.setProperty('--fly-x', endX + 'px');
    flyElement.style.setProperty('--fly-y', endY + 'px');
    flyElement.style.setProperty('--fly-x-mid', (endX / 2) + 'px');
    flyElement.style.setProperty('--fly-y-mid', Math.min(-30, endY / 3) + 'px');
    flyElement.style.setProperty('--fly-duration', '0.5s');

    // Add to DOM
    document.body.appendChild(flyElement);

    // Add receiving animation to truck
    if (elements.truckVisual) {
        elements.truckVisual.classList.add('receiving');
        setTimeout(() => {
            elements.truckVisual.classList.remove('receiving');
        }, 400);
    }

    // Show success indicator in truck
    if (truckCargo) {
        const successIndicator = document.createElement('div');
        successIndicator.className = 'success-indicator';
        successIndicator.textContent = '✓';
        truckCargo.appendChild(successIndicator);
        setTimeout(() => {
            successIndicator.remove();
        }, 500);
    }

    // Clean up flying element and add item after animation
    setTimeout(() => {
        flyElement.remove();
    }, 500);

    // Add item to truck (slightly delayed for visual effect)
    setTimeout(() => {
        addItemToTruck(itemIndex);
    }, 200);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    if (elements.truckVisual) {
        elements.truckVisual.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (elements.truckContainer && elements.truckVisual && !elements.truckContainer.contains(e.relatedTarget)) {
        elements.truckVisual.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (elements.truckVisual) {
        elements.truckVisual.classList.remove('drag-over');
    }

    const itemIndex = e.dataTransfer.getData('text/plain');
    addItemToTruck(parseInt(itemIndex));
}

function addItemToTruck(itemIndex) {
    let item;

    if (gameState.currentMoveType === 'residential') {
        // Find item in residential rooms
        let currentIndex = 0;
        let foundItem = null;

        Object.keys(itemData.residential).forEach(roomKey => {
            itemData.residential[roomKey].forEach(roomItem => {
                if (currentIndex === itemIndex) {
                    foundItem = roomItem;
                }
                currentIndex++;
            });
        });

        item = foundItem;
    } else {
        item = itemData[gameState.currentMoveType][itemIndex];
    }

    if (!item) return;

    const itemId = Date.now() + Math.random(); // Unique ID for tracking

    // Add to loaded items
    const loadedItem = { ...item, id: itemId };
    gameState.loadedItems.push(loadedItem);

    // Update totals
    gameState.totalVolume += item.volume;
    gameState.totalWeight += item.weight;
    gameState.itemCount++;

    // Check for truck upgrade
    checkTruckUpgrade();

    // Update UI
    updateStats();
    updateCapacityDisplay();
    addItemToTruckVisual(loadedItem);

    showNotification(`${item.name} added to truck!`, 'success');
}

function checkTruckUpgrade() {
    let newTruckIndex = gameState.currentTruckIndex;

    // Find the smallest truck that can handle the load
    for (let i = 0; i < truckData.length; i++) {
        const truck = truckData[i];
        if (gameState.totalVolume <= truck.maxVolume && gameState.totalWeight <= truck.maxWeight) {
            newTruckIndex = i;
            break;
        }
    }

    // If we need a larger truck than the largest available
    if (newTruckIndex === gameState.currentTruckIndex &&
        (gameState.totalVolume > truckData[gameState.currentTruckIndex].maxVolume ||
            gameState.totalWeight > truckData[gameState.currentTruckIndex].maxWeight)) {
        newTruckIndex = truckData.length - 1;
    }

    // Update truck if needed
    if (newTruckIndex !== gameState.currentTruckIndex) {
        const oldTruck = truckData[gameState.currentTruckIndex];
        gameState.currentTruckIndex = newTruckIndex;
        const newTruck = truckData[newTruckIndex];

        updateTruckDisplay();
        showNotification(`Upgraded to ${newTruck.type}.`, 'warning');
    }
}

function updateTruckDisplay() {
    const truck = truckData[gameState.currentTruckIndex];

    if (elements.truckType) {
        elements.truckType.textContent = truck.type;
    }

    if (elements.truckIcon) {
        elements.truckIcon.className = 'truck-icon';
        elements.truckIcon.innerHTML = '';
    }
}

function updateStats() {
    if (elements.totalVolume) {
        elements.totalVolume.textContent = `${gameState.totalVolume.toFixed(1)} m³`;
    }
    if (elements.totalWeight) {
        elements.totalWeight.textContent = `${gameState.totalWeight.toLocaleString()} lbs`;
    }
    if (elements.itemsCount) {
        elements.itemsCount.textContent = gameState.itemCount;
    }

    // Calculate box requirements
    calculateBoxRequirements();
}

function calculateBoxRequirements() {
    // Reset requirements
    gameState.boxRequirements = [];
    gameState.protectionRequirements = [];
    gameState.specialHandlingFees = 0;

    // Initialize box counts
    const boxCounts = {
        small: 0,
        medium: 0,
        large: 0,
        extraLarge: 0,
        wardrobe: 0,
        mirror: 0
    };

    // Initialize protection counts
    const protectionCounts = {};
    protectionMaterials.forEach(material => {
        protectionCounts[material.name] = 0;
    });

    // Analyze each loaded item
    gameState.loadedItems.forEach(item => {
        const itemName = item.name.toLowerCase();
        const itemVolume = item.volume;
        const itemWeight = item.weight;

        // Check for special handling fees
        if (specialHandlingItems[item.name]) {
            gameState.specialHandlingFees += specialHandlingItems[item.name].fee;
        }

        // Determine protection materials needed
        let needsBox = true;

        // Mattress covers
        if (itemName.includes('mattress') || itemName.includes('bed')) {
            protectionCounts["Mattress Cover"] += 1;
            needsBox = false;
        }

        // Furniture blankets
        if (itemName.includes('sofa') || itemName.includes('chair') || itemName.includes('table') ||
            itemName.includes('dresser') || itemName.includes('cabinet') || itemName.includes('desk')) {
            protectionCounts["Furniture Blanket"] += Math.ceil(itemVolume / 2.0); // 1 blanket per 2m³
            needsBox = false;
        }

        // Electronics protection
        if (itemName.includes('tv') || itemName.includes('computer') || itemName.includes('monitor') ||
            itemName.includes('printer') || itemName.includes('electronics')) {
            protectionCounts["Bubble Wrap (Roll)"] += 1;
            if (itemName.includes('tv') && itemVolume > 0.5) {
                boxCounts.mirror += 1; // Large TVs need picture boxes
                needsBox = false;
            }
        }

        // Appliances
        if (itemName.includes('refrigerator') || itemName.includes('washing') ||
            itemName.includes('dryer') || itemName.includes('freezer')) {
            protectionCounts["Appliance Dolly"] += 1;
            protectionCounts["Furniture Blanket"] += 2;
            needsBox = false;
        }

        // Special items
        if (itemName.includes('piano')) {
            protectionCounts["Piano Board"] += 1;
            protectionCounts["Furniture Blanket"] += 3;
            needsBox = false;
        }

        if (itemName.includes('safe')) {
            protectionCounts["Safe Moving Straps"] += 1;
            protectionCounts["Furniture Blanket"] += 2;
            needsBox = false;
        }

        if (itemName.includes('mirror') || itemName.includes('picture') || itemName.includes('artwork')) {
            if (itemVolume > 0.3) {
                protectionCounts["Artwork Crating"] += 1;
            } else {
                boxCounts.mirror += 1;
            }
            needsBox = false;
        }

        // Box requirements for remaining items
        if (needsBox) {
            if (itemName.includes('wardrobe') || itemName.includes('clothes') || itemName.includes('suits')) {
                boxCounts.wardrobe += 1;
            } else if (itemVolume >= 2.0 && itemWeight < 100) {
                boxCounts.large += Math.ceil(itemVolume / 0.083);
            } else if (itemVolume >= 1.0) {
                boxCounts.medium += Math.ceil(itemVolume / 0.052);
            } else if (itemWeight > 100 || itemName.includes('books')) {
                boxCounts.small += Math.ceil(itemVolume / 0.032);
            } else {
                boxCounts.medium += Math.ceil(itemVolume / 0.052);
            }
        }
    });

    // Add stretch wrap for general protection
    if (gameState.loadedItems.length > 0) {
        protectionCounts["Stretch Wrap"] = Math.ceil(gameState.loadedItems.length / 10);
    }

    // Build box requirements array
    Object.keys(boxCounts).forEach(boxType => {
        const count = boxCounts[boxType];
        if (count > 0) {
            let boxInfo;
            switch (boxType) {
                case 'small': boxInfo = boxData[0]; break;
                case 'medium': boxInfo = boxData[1]; break;
                case 'large': boxInfo = boxData[2]; break;
                case 'extraLarge': boxInfo = boxData[3]; break;
                case 'wardrobe': boxInfo = boxData[4]; break;
                case 'mirror': boxInfo = boxData[5]; break;
            }

            gameState.boxRequirements.push({
                ...boxInfo,
                quantity: count,
                totalCost: count * boxInfo.cost
            });
        }
    });

    // Build protection requirements array
    Object.keys(protectionCounts).forEach(materialName => {
        const count = protectionCounts[materialName];
        if (count > 0) {
            const material = protectionMaterials.find(m => m.name === materialName);
            if (material) {
                gameState.protectionRequirements.push({
                    ...material,
                    quantity: count,
                    totalCost: count * material.cost
                });
            }
        }
    });
}

function updateCapacityDisplay() {
    if (!elements.capacityFill || !elements.capacityText) return;
    const truck = truckData[gameState.currentTruckIndex];
    const volumePercent = (gameState.totalVolume / truck.maxVolume) * 100;
    const weightPercent = (gameState.totalWeight / truck.maxWeight) * 100;
    const maxPercent = Math.max(volumePercent, weightPercent);
    const displayPercent = Math.min(maxPercent, 100);

    elements.capacityFill.style.width = `${displayPercent}%`;
    elements.capacityText.textContent = (window.MuhtarI18n && MuhtarI18n.t)
        ? MuhtarI18n.t("estimator_pct_full", { n: Math.round(displayPercent) })
        : `${Math.round(displayPercent)}% Full`;

    // Update color based on capacity
    if (displayPercent < 60) {
        elements.capacityFill.style.background = '#27ae60';
    } else if (displayPercent < 85) {
        elements.capacityFill.style.background = '#f39c12';
    } else {
        elements.capacityFill.style.background = '#e74c3c';
    }
}

function addItemToTruckVisual(item) {
    // Hide drop zone text if this is the first item
    const dropZoneText = elements.truckCargo.querySelector('.drop-zone-text');
    if (dropZoneText) {
        dropZoneText.style.display = 'none';
    }

    const loadedItemDiv = document.createElement('div');
    loadedItemDiv.className = 'loaded-item';
    loadedItemDiv.dataset.itemId = item.id;
    loadedItemDiv.innerHTML = `
        <div><i class="${item.icon}"></i></div>
        <div>${item.name}</div>
        <button class="remove-btn">&times;</button>
    `;

    // Add remove functionality
    loadedItemDiv.querySelector('.remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removeItemFromTruck(item.id);
    });

    elements.truckCargo.appendChild(loadedItemDiv);
}

function removeItemFromTruck(itemId) {
    // Find and remove item from loaded items
    const itemIndex = gameState.loadedItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    const item = gameState.loadedItems[itemIndex];
    gameState.loadedItems.splice(itemIndex, 1);

    // Update totals
    gameState.totalVolume -= item.volume;
    gameState.totalWeight -= item.weight;
    gameState.itemCount--;

    // Ensure totals don't go negative due to floating point errors
    gameState.totalVolume = Math.max(0, gameState.totalVolume);
    gameState.totalWeight = Math.max(0, gameState.totalWeight);
    gameState.itemCount = Math.max(0, gameState.itemCount);

    // Check if we can downgrade truck
    checkTruckDowngrade();

    // Update UI
    updateStats();
    updateCapacityDisplay();
    removeItemFromTruckVisual(itemId);

    // Show drop zone text if no items left
    if (gameState.loadedItems.length === 0) {
        const dropZoneText = elements.truckCargo.querySelector('.drop-zone-text');
        if (dropZoneText) {
            dropZoneText.style.display = 'block';
        }
    }

    showNotification(`${item.name} removed from truck!`, 'warning');
}

function checkTruckDowngrade() {
    // Find the smallest truck that can handle the current load
    for (let i = 0; i < truckData.length; i++) {
        const truck = truckData[i];
        if (gameState.totalVolume <= truck.maxVolume && gameState.totalWeight <= truck.maxWeight) {
            if (i < gameState.currentTruckIndex) {
                gameState.currentTruckIndex = i;
                updateTruckDisplay();
                showNotification(`📉 Downgraded to ${truck.type} ${truck.icon}!`, 'success');
            }
            break;
        }
    }
}

function removeItemFromTruckVisual(itemId) {
    const itemElement = elements.truckCargo.querySelector(`[data-item-id="${itemId}"]`);
    if (itemElement) {
        itemElement.remove();
    }
}

function showResults() {
    if (gameState.loadedItems.length === 0) {
        showNotification(gt('estimator_add_items_first', 'Add items to the bay first.'), 'warning');
        return;
    }

    const truck = truckData[gameState.currentTruckIndex];

    // Update modal content
    document.getElementById('final-truck-type').textContent = truck.type;
    document.getElementById('final-volume').textContent = `${gameState.totalVolume.toFixed(1)} m³`;
    document.getElementById('final-weight').textContent = `${gameState.totalWeight.toLocaleString()} lbs`;
    document.getElementById('final-items').textContent = gameState.itemCount;

    // Display loaded items list
    displayLoadedItemsList();

    // Display box requirements
    displayBoxRequirements();

    updatePackingOption(gameState.selectedPackingOption);

    // Setup modal event listeners
    setupModalEventListeners();

    // Reset cost calculation
    document.getElementById('cost-result').classList.add('hidden');

    // Show modal
    const modal = document.getElementById('results-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        setPlayStep('share');
        var success = document.getElementById('share-success');
        var hint = document.getElementById('share-mailhint');
        if (success) success.hidden = true;
        if (hint) hint.hidden = true;
        setInventoryStep(1);
    }
}

function updatePackingOption(option) {
    gameState.selectedPackingOption = option;
    document.querySelectorAll('.packing-option').forEach(function (label) {
        var input = label.querySelector('input[name="packing"]');
        label.classList.toggle('is-selected', !!(input && input.value === option && input.checked));
    });
}

function displayLoadedItemsList() {
    const itemsList = document.getElementById('loaded-items-list');

    if (gameState.loadedItems.length === 0) {
        itemsList.innerHTML = '<div class="no-items-message">No items added yet. Click "Add More Items" to start loading your truck!</div>';
        return;
    }

    // Group items by name to show quantities
    const itemGroups = {};
    gameState.loadedItems.forEach(item => {
        if (itemGroups[item.name]) {
            itemGroups[item.name].quantity += 1;
            itemGroups[item.name].totalVolume += item.volume;
            itemGroups[item.name].totalWeight += item.weight;
        } else {
            itemGroups[item.name] = {
                ...item,
                quantity: 1,
                totalVolume: item.volume,
                totalWeight: item.weight
            };
        }
    });

    let html = '';
    Object.values(itemGroups).forEach(itemGroup => {
        const volumeInFt3 = (itemGroup.totalVolume * 35.314).toFixed(1);
        html += `
            <div class="loaded-item-card" data-item-name="${itemGroup.name}">
                <div class="loaded-item-info">
                    <div class="loaded-item-icon"><i class="${itemGroup.icon}"></i></div>
                    <div class="loaded-item-details">
                        <div class="loaded-item-name">${itemGroup.name}</div>
                        <div class="loaded-item-specs">
                            ${itemGroup.totalVolume.toFixed(2)}m³ (${volumeInFt3}ft³) • ${itemGroup.totalWeight}lbs
                        </div>
                    </div>
                </div>
                <div class="loaded-item-quantity">
                    <button class="quantity-btn decrease-btn" data-item-name="${itemGroup.name}">−</button>
                    <span class="quantity-number">${itemGroup.quantity}</span>
                    <button class="quantity-btn increase-btn" data-item-name="${itemGroup.name}">+</button>
                </div>
                <button class="remove-item-btn" data-item-name="${itemGroup.name}" aria-label="Remove all">×</button>
            </div>
        `;
    });

    itemsList.innerHTML = html;

    // Setup event listeners for quantity buttons after HTML is added
    setupQuantityButtonListeners();
}

function setupQuantityButtonListeners() {
    // Quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const itemName = e.target.dataset.itemName;
            const isIncrease = e.target.classList.contains('increase-btn');

            console.log('Quantity button clicked:', itemName, isIncrease ? 'increase' : 'decrease');

            if (isIncrease) {
                addItemByName(itemName);
            } else {
                removeItemByName(itemName, 1);
            }
        });
    });

    // Remove all buttons
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const itemName = e.target.dataset.itemName;
            if (confirm(`Remove all ${itemName} items?`)) {
                removeItemByName(itemName, 'all');
            }
        });
    });
}

function setupModalEventListeners() {
    // Setup modal button listeners without cloning (to preserve quantity button listeners)

    // Add More Items button
    const addMoreBtn = document.getElementById('add-more-items');
    if (addMoreBtn) {
        // Remove existing listener if any
        addMoreBtn.replaceWith(addMoreBtn.cloneNode(true));
        const newAddMoreBtn = document.getElementById('add-more-items');
        newAddMoreBtn.addEventListener('click', () => {
            closeModal();
            showNotification('Add more items by clicking them or dragging to the truck!', 'info');
        });
    }

    // Clear All Items button
    const clearAllBtn = document.getElementById('clear-all-items');
    if (clearAllBtn) {
        // Remove existing listener if any
        clearAllBtn.replaceWith(clearAllBtn.cloneNode(true));
        const newClearAllBtn = document.getElementById('clear-all-items');
        newClearAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to remove all items from your truck?')) {
                clearAllItems();
            }
        });
    }

    // Re-setup other modal listeners
    setupOriginalModalListeners();

    // Setup Google Maps event listeners now that modal is shown
    setupGoogleMapsEventListeners();
}

function setupOriginalModalListeners() {
    // Close button
    const closeBtn = document.getElementById('close-modal');
    if (closeBtn) {
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        const newCloseBtn = document.getElementById('close-modal');
        newCloseBtn.addEventListener('click', closeModal);
    }

    // Calculate cost button
    const calculateCostBtn = document.getElementById('calculate-cost');
    if (calculateCostBtn) {
        calculateCostBtn.replaceWith(calculateCostBtn.cloneNode(true));
        const newCalculateCostBtn = document.getElementById('calculate-cost');
        newCalculateCostBtn.addEventListener('click', calculateCost);
    }

    // Book truck button is handled by the inventory share form
    const shareForm = document.getElementById('inventory-share-form');
    if (shareForm && !shareFormBound) {
        shareFormBound = true;
        shareForm.addEventListener('submit', function (e) {
            e.preventDefault();
            bookTruck();
        });
    }

    // Play again button
    const playAgainBtn = document.getElementById('play-again');
    if (playAgainBtn) {
        playAgainBtn.replaceWith(playAgainBtn.cloneNode(true));
        const newPlayAgainBtn = document.getElementById('play-again');
        newPlayAgainBtn.addEventListener('click', playAgain);
    }
}

function displayBoxRequirements() {
    const boxList = document.getElementById('box-list');

    let html = '';
    let totalCost = 0;

    // Display boxes
    if (gameState.boxRequirements.length > 0) {
        html += '<h4>Moving boxes</h4>';
        html += '<div class="box-grid">';

        gameState.boxRequirements.forEach(box => {
            totalCost += box.totalCost;
            html += `
                <div class="box-item">
                    <div class="box-icon">${box.icon}</div>
                    <div class="box-details">
                        <div class="box-name">${box.name}</div>
                        <div class="box-dimensions">${box.dimensions}</div>
                        <div class="box-quantity">Quantity: ${box.quantity}</div>
                        <div class="box-cost">$${box.cost} each = $${box.totalCost.toFixed(2)}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    // Display protection materials
    if (gameState.protectionRequirements.length > 0) {
        html += '<h4>Protection materials</h4>';
        html += '<div class="protection-grid">';

        gameState.protectionRequirements.forEach(material => {
            totalCost += material.totalCost;
            html += `
                <div class="protection-item">
                    <div class="protection-icon">${material.icon}</div>
                    <div class="protection-details">
                        <div class="protection-name">${material.name}</div>
                        <div class="protection-description">${material.description}</div>
                        <div class="protection-quantity">Quantity: ${material.quantity}</div>
                        <div class="protection-cost">$${material.cost} each = $${material.totalCost.toFixed(2)}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    // Display special handling fees
    if (gameState.specialHandlingFees > 0) {
        html += '<h4>⚠️ Special Handling</h4>';
        html += '<div class="special-handling">';

        gameState.loadedItems.forEach(item => {
            if (specialHandlingItems[item.name]) {
                const handling = specialHandlingItems[item.name];
                html += `
                    <div class="special-item">
                        <div class="special-name">${item.name}</div>
                        <div class="special-reason">${handling.reason}</div>
                        <div class="special-fee">+$${handling.fee}</div>
                    </div>
                `;
            }
        });
        html += '</div>';
    }

    if (html === '') {
        html = '<p class="no-requirements">No special packing materials needed - all items are self-contained.</p>';
    } else {
        html += `<div class="requirements-total">Total Materials & Fees: $${(totalCost + gameState.specialHandlingFees).toFixed(2)}</div>`;
    }

    boxList.innerHTML = html;
}

function calculateCost() {
    const distance = gameState.distance;
    if (!distance || distance <= 0) {
        showNotification('Please select pickup and drop-off locations and calculate route first!', 'error');
        return;
    }

    const truck = truckData[gameState.currentTruckIndex];
    const packingOption = packingOptions[gameState.selectedPackingOption];

    // Get pickup and dropoff locations from Google Maps data
    const pickupLocationAddress = pickupLocation ? pickupLocation.address : '';
    const dropoffLocationAddress = dropoffLocation ? dropoffLocation.address : '';

    // Determine tax rate based on dropoff location (destination determines tax)
    let taxRate = 8.5; // Default US average rate
    let taxType = "Sales Tax";
    let taxLocation = "USA";

    // Simple tax determination based on address
    if (dropoffLocationAddress) {
        if (dropoffLocationAddress.includes('Canada') || dropoffLocationAddress.includes('CA,')) {
            taxRate = 13; // Default Canadian HST
            taxType = "HST";
            taxLocation = "Canada";
        } else if (dropoffLocationAddress.includes('Louisiana')) {
            taxRate = 10.12;
        } else if (dropoffLocationAddress.includes('Tennessee')) {
            taxRate = 9.56;
        } else if (dropoffLocationAddress.includes('Arkansas')) {
            taxRate = 9.46;
        } else if (dropoffLocationAddress.includes('California')) {
            taxRate = 8.85;
        } else if (dropoffLocationAddress.includes('New York')) {
            taxRate = 8.52;
        } else if (dropoffLocationAddress.includes('Delaware') || dropoffLocationAddress.includes('Montana') ||
            dropoffLocationAddress.includes('New Hampshire') || dropoffLocationAddress.includes('Oregon')) {
            taxRate = 0;
        }
    }

    // Base truck cost
    let baseTruckCost = truck.baseCost;

    // Distance-based cost (realistic USA rates)
    let ratePerMile;
    if (distance <= 50) {
        // Local move
        ratePerMile = 3.50; // $3.50 per mile for local
    } else if (distance <= 100) {
        // Regional move
        ratePerMile = 2.80; // $2.80 per mile for regional
    } else {
        // Long distance
        ratePerMile = 2.20; // $2.20 per mile for long distance
    }

    const distanceCost = distance * ratePerMile;

    // Labor cost (minimum 4 hours for any move)
    const laborHours = Math.max(4, Math.ceil(distance / 50) + 2);
    const laborCost = laborHours * 45;

    // Packing service multiplier
    let packingMultiplier = 1;
    if (gameState.selectedPackingOption === 'partial') {
        packingMultiplier = 1.25;
    } else if (gameState.selectedPackingOption === 'full') {
        packingMultiplier = 1.60;
    }

    // Calculate subtotal before tax
    const subtotal = (baseTruckCost + distanceCost + laborCost) * packingMultiplier;

    // Add boxes and protection materials cost
    const boxesCost = gameState.boxRequirements.reduce((total, box) => total + box.totalCost, 0);
    const protectionCost = gameState.protectionRequirements.reduce((total, material) => total + material.totalCost, 0);
    const specialHandlingCost = gameState.specialHandlingFees;

    // Scale fee - mandatory $50 for weighing the truck
    const scaleFee = 50.00;

    const totalBeforeTax = subtotal + boxesCost + protectionCost + specialHandlingCost + scaleFee;

    // Calculate tax
    const taxAmount = totalBeforeTax * (taxRate / 100);
    const totalCost = totalBeforeTax + taxAmount;

    // Display detailed breakdown
    let costBreakdown = `
        <div class="cost-breakdown">
            <div class="cost-item">
                <span>📍 Route:</span>
                <span>${pickupLocationAddress} → ${dropoffLocationAddress} (${distance} miles)</span>
            </div>
            <div class="cost-item">
                <span>🚛 Truck Rental:</span>
                <span>$${baseTruckCost.toFixed(2)}</span>
            </div>
            <div class="cost-item">
                <span>📏 Distance Cost:</span>
                <span>$${distanceCost.toFixed(2)}</span>
            </div>
            <div class="cost-item">
                <span>👷 Labor Cost (${laborHours}h):</span>
                <span>$${laborCost.toFixed(2)}</span>
            </div>
            <div class="cost-item">
                <span>📦 Moving Boxes:</span>
                <span>$${boxesCost.toFixed(2)}</span>
            </div>
            <div class="cost-item">
                <span>🛡️ Protection Materials:</span>
                <span>$${protectionCost.toFixed(2)}</span>
            </div>
            <div class="cost-item">
                <span>⚠️ Special Handling:</span>
                <span>$${specialHandlingCost.toFixed(2)}</span>
            </div>
            <div class="cost-item">
                <span>⚖️ Scale Fee:</span>
                <span>$${scaleFee.toFixed(2)}</span>
            </div>
            <div class="cost-item subtotal">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="cost-item tax">
                <span>📍 ${taxType} (${taxRate}%) (${taxLocation}):</span>
                <span>$${taxAmount.toFixed(2)}</span>
            </div>
            <div class="cost-item total">
                <span>💰 Total Cost:</span>
                <span>$${totalCost.toFixed(2)}</span>
            </div>
        </div>
    `;

    const estimatedCostElement = document.getElementById('estimated-cost');
    const costBreakdownElement = document.getElementById('cost-breakdown');
    const costResultElement = document.getElementById('cost-result');

    // Save cost and addresses to gameState
    gameState.estimatedCost = Math.round(totalCost);
    gameState.pickupAddress = pickupLocationAddress;
    gameState.dropoffAddress = dropoffLocationAddress;

    if (estimatedCostElement) {
        estimatedCostElement.textContent = `$${Math.round(totalCost)}`;
    }
    if (costBreakdownElement) {
        costBreakdownElement.innerHTML = costBreakdown;
    }
    if (costResultElement) {
        costResultElement.classList.remove('hidden');
    }
}

function bookTruck() {
    if (gameState.itemCount === 0) {
        showNotification(gt('estimator_add_items_first', 'Add items to the bay first.'), 'error');
        return;
    }

    const name = ((document.getElementById('share-name') || {}).value || '').trim();
    const phone = ((document.getElementById('share-phone') || {}).value || '').trim();
    const email = ((document.getElementById('share-email') || {}).value || '').trim();
    const date = ((document.getElementById('share-date') || {}).value || '').trim();
    const notes = ((document.getElementById('share-notes') || {}).value || '').trim();
    const err = document.getElementById('share-error');

    if (!name || !phone || !email) {
        if (err) {
            err.hidden = false;
            err.textContent = gt('estimator_share_required', 'Name, phone and email are required.');
        }
        return;
    }
    if (err) {
        err.hidden = true;
        err.textContent = '';
    }

    const pickupInput = document.getElementById('pickup-input');
    const dropoffInput = document.getElementById('dropoff-input');
    const inventory = groupedInventoryLines().join('\n');
    const packing = gameState.selectedPackingOption === 'self'
        ? 'Self packing'
        : gameState.selectedPackingOption === 'partial'
            ? 'Partial packing'
            : 'Full packing';
    const rangeEl = document.getElementById('estimated-cost');
    const pickup = gameState.pickupAddress || (pickupInput ? pickupInput.value : '') || '';
    const dropoff = gameState.dropoffAddress || (dropoffInput ? dropoffInput.value : '') || '';
    const moveType = gameState.currentMoveType
        ? gameState.currentMoveType.charAt(0).toUpperCase() + gameState.currentMoveType.slice(1)
        : '';

    const payload = {
        _subject: 'Inventory from truck loader — ' + name,
        _template: 'table',
        _captcha: 'false',
        _honey: '',
        name: name,
        phone: phone,
        email: email,
        move_date: date || 'Not specified',
        notes: notes || '(none)',
        move_type: moveType,
        recommended_truck: truckData[gameState.currentTruckIndex].type,
        total_volume_m3: gameState.totalVolume.toFixed(1),
        total_weight_lbs: String(gameState.totalWeight),
        item_count: String(gameState.itemCount),
        packing: packing,
        pickup: pickup || '(not set)',
        dropoff: dropoff || '(not set)',
        pickup_lat: pickupCoords ? String(pickupCoords.lat) : '',
        pickup_lng: pickupCoords ? String(pickupCoords.lng) : '',
        dropoff_lat: dropoffCoords ? String(dropoffCoords.lat) : '',
        dropoff_lng: dropoffCoords ? String(dropoffCoords.lng) : '',
        distance_miles: String(gameState.distance || ''),
        planning_range: rangeEl ? rangeEl.textContent : '(not calculated)',
        inventory: inventory,
        source: window.location.href
    };

    const submitBtn = document.getElementById('book-truck');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = gt('estimator_share_sending', 'Sending…');
    }

    const bodyLines = [
        'Truck loader inventory',
        '',
        'Name: ' + name,
        'Phone: ' + phone,
        'Email: ' + email,
        'Date: ' + (date || 'Not specified'),
        'Notes: ' + (notes || '(none)'),
        '',
        'Move type: ' + moveType,
        'Truck: ' + truckData[gameState.currentTruckIndex].type,
        'Volume: ' + gameState.totalVolume.toFixed(1) + ' m3',
        'Weight: ' + gameState.totalWeight + ' lbs',
        'Items: ' + gameState.itemCount,
        'Packing: ' + packing,
        'Pickup: ' + (pickup || '(not set)'),
        'Drop-off: ' + (dropoff || '(not set)'),
        'Pickup coords: ' + (pickupCoords ? pickupCoords.lat + ', ' + pickupCoords.lng : '(not set)'),
        'Drop-off coords: ' + (dropoffCoords ? dropoffCoords.lat + ', ' + dropoffCoords.lng : '(not set)'),
        '',
        'INVENTORY',
        inventory
    ].join('\n');

    const mailer = window.MuhtarLeadMail;
    const mailto = mailer && typeof mailer.buildMailto === 'function'
        ? mailer.buildMailto(SHARE_EMAIL, '', 'Inventory from truck loader — ' + name, bodyLines)
        : 'mailto:' + SHARE_EMAIL +
            '?subject=' + encodeURIComponent('Inventory from truck loader — ' + name) +
            '&body=' + encodeURIComponent(bodyLines);

    function restoreShareButton() {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.hidden = false;
            submitBtn.textContent = gt('estimator_get_quote', 'Send my inventory');
        }
    }

    function onSent(result) {
        finishShare(result && result.method === 'mailto', result && result.mailtoHref);
    }

    function onFail(fail) {
        restoreShareButton();
        if (err) {
            err.hidden = false;
            err.textContent = gt('estimator_share_failed', 'We could not send the inventory automatically. Call, use WhatsApp, or email moving@muhtar.ca.');
        }
        const hint = document.getElementById('share-mailhint');
        const hintLink = document.getElementById('share-mailto');
        const fallback = (fail && fail.mailtoHref) || mailto;
        if (hint && hintLink && fallback) {
            hint.hidden = false;
            hintLink.href = fallback;
            hintLink.textContent = gt('estimator_share_mailhint', 'If a mail window did not open, tap here to send the list.');
        }
    }

    if (mailer && typeof mailer.send === 'function') {
        mailer.send({
            email: SHARE_EMAIL,
            data: payload,
            mailtoHref: mailto,
            subject: payload._subject,
            timeoutMs: 12000
        }).then(onSent).catch(onFail);
        return;
    }

    fetch('https://formsubmit.co/ajax/' + SHARE_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
    }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
            var ok = json && (json.success === true || json.success === 'true');
            if (!res.ok || !ok) throw new Error((json && json.message) || 'submit failed');
        });
    }).then(function () {
        onSent({ method: 'form', mailtoHref: mailto });
    }).catch(function () {
        try {
            window.location.href = mailto;
            onSent({ method: 'mailto', mailtoHref: mailto });
        } catch (err) {
            onFail({ mailtoHref: mailto });
        }
    });
}

function finishShare(usedMailto, mailtoHref) {
    const submitBtn = document.getElementById('book-truck');
    const success = document.getElementById('share-success');
    const hint = document.getElementById('share-mailhint');
    const hintLink = document.getElementById('share-mailto');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.hidden = true;
        submitBtn.textContent = gt('estimator_get_quote', 'Send my inventory');
    }
    if (success) success.hidden = false;
    setInventoryStep(3);
    if (hint && hintLink) {
        if (usedMailto && mailtoHref) {
            hint.hidden = false;
            hintLink.href = mailtoHref;
            hintLink.textContent = gt('estimator_share_mailhint', 'If a mail window did not open, tap here to send the list.');
        } else {
            hint.hidden = true;
        }
    }
    showNotification(gt('estimator_share_sent', 'Inventory sent.'), 'success');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'inventory_shared',
        method: usedMailto ? 'mailto' : 'form',
        items: gameState.itemCount
    });
}

function playAgain() {
    closeModal();
    resetGame();
}

function closeModal() {
    const modal = document.getElementById('results-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
    const gameInterface = document.getElementById('game-interface');
    if (gameInterface && !gameInterface.classList.contains('hidden')) {
        setPlayStep('load');
        setWorkspaceMode('load');
    }
}

function resetGame() {
    // Reset game state
    gameState = {
        currentMoveType: null,
        loadedItems: [],
        currentTruckIndex: 0,
        totalVolume: 0,
        totalWeight: 0,
        itemCount: 0,
        selectedPackingOption: 'self',
        boxRequirements: [],
        protectionRequirements: [],
        specialHandlingFees: 0,
        distance: 0
    };

    // Force hide modal
    forceHideModal();

    activeRoomKey = null;
    showTypeWorkspace();

    const itemsGrid = document.getElementById('items-grid');
    if (itemsGrid) {
        itemsGrid.innerHTML = '';
    }

    const truckCargo = document.getElementById('truck-cargo');
    if (truckCargo) {
        truckCargo.innerHTML = '<div class="drop-zone-text" data-translate="estimator_drop_zone">' +
            gt('estimator_drop_zone', 'Tap an item to load it into the bay') + '</div>';
    }

    setPlayStep('type');
    updateTruckDisplay();
    updateStats();
    updateCapacityDisplay();

    document.querySelectorAll('.move-type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    showNotification(gt('estimator_reset', 'Choose a move type to start again.'), 'success');
}

function showNotification(message, type = 'info') {
    elements.notificationText.textContent = message;
    elements.notification.className = `notification ${type}`;
    elements.notification.classList.remove('hidden');

    // Auto-hide after 3 seconds
    setTimeout(() => {
        closeNotification();
    }, 3000);
}

function closeNotification() {
    elements.notification.classList.add('hidden');
}

function addItemByName(itemName) {
    // Find the item in the data
    let foundItem = null;

    if (gameState.currentMoveType === 'residential') {
        Object.keys(itemData.residential).forEach(roomKey => {
            itemData.residential[roomKey].forEach(item => {
                if (item.name === itemName) {
                    foundItem = item;
                }
            });
        });
    } else {
        itemData[gameState.currentMoveType].forEach(item => {
            if (item.name === itemName) {
                foundItem = item;
            }
        });
    }

    if (foundItem) {
        const itemId = Date.now() + Math.random();
        const loadedItem = { ...foundItem, id: itemId };

        gameState.loadedItems.push(loadedItem);
        gameState.totalVolume += foundItem.volume;
        gameState.totalWeight += foundItem.weight;
        gameState.itemCount++;

        checkTruckUpgrade();
        updateStats();
        updateCapacityDisplay();
        addItemToTruckVisual(loadedItem);

        // Update the modal displays
        displayLoadedItemsList();
        displayBoxRequirements();

        // Update main summary
        document.getElementById('final-volume').textContent = `${gameState.totalVolume.toFixed(1)} m³`;
        document.getElementById('final-weight').textContent = `${gameState.totalWeight.toLocaleString()} lbs`;
        document.getElementById('final-items').textContent = gameState.itemCount;

        showNotification(`${foundItem.name} added!`, 'success');
    }
}

function removeItemByName(itemName, quantity = 1) {
    const itemsToRemove = gameState.loadedItems.filter(item => item.name === itemName);

    if (itemsToRemove.length === 0) return;

    const removeCount = quantity === 'all' ? itemsToRemove.length : Math.min(quantity, itemsToRemove.length);

    for (let i = 0; i < removeCount; i++) {
        const itemToRemove = itemsToRemove[i];

        // Remove from game state
        const index = gameState.loadedItems.findIndex(item => item.id === itemToRemove.id);
        if (index !== -1) {
            gameState.loadedItems.splice(index, 1);
            gameState.totalVolume -= itemToRemove.volume;
            gameState.totalWeight -= itemToRemove.weight;
            gameState.itemCount--;

            // Remove from visual
            removeItemFromTruckVisual(itemToRemove.id);
        }
    }

    checkTruckDowngrade();
    updateStats();
    updateCapacityDisplay();

    // Update the modal displays
    displayLoadedItemsList();
    displayBoxRequirements();

    // Update main summary
    document.getElementById('final-volume').textContent = `${gameState.totalVolume.toFixed(1)} m³`;
    document.getElementById('final-weight').textContent = `${gameState.totalWeight.toLocaleString()} lbs`;
    document.getElementById('final-items').textContent = gameState.itemCount;

    const message = quantity === 'all' ? `All ${itemName} items removed!` : `${itemName} removed!`;
    showNotification(message, 'warning');
}

function clearAllItems() {
    // Clear all items
    gameState.loadedItems = [];
    gameState.totalVolume = 0;
    gameState.totalWeight = 0;
    gameState.itemCount = 0;
    gameState.currentTruckIndex = 0;
    gameState.boxRequirements = [];
    gameState.protectionRequirements = [];
    gameState.specialHandlingFees = 0;

    // Update displays
    updateTruckDisplay();
    updateStats();
    updateCapacityDisplay();

    // Clear truck visual
    const truckCargo = document.getElementById('truck-cargo');
    if (truckCargo) {
        truckCargo.innerHTML = '<div class="drop-zone-text">Drag items here</div>';
    }

    // Update modal displays
    displayLoadedItemsList();
    displayBoxRequirements();

    // Update main summary
    document.getElementById('final-volume').textContent = '0 m³';
    document.getElementById('final-weight').textContent = '0 lbs';
    document.getElementById('final-items').textContent = '0';

    showNotification('All items cleared!', 'success');
}

// Touch support variables for mobile devices
let touchItem = null;
let touchOffset = { x: 0, y: 0 };
let touchOrigin = { x: 0, y: 0 };
let touchStartTime = 0;
let touchMoved = false;

function handleTouchStart(e) {
    if (e.touches.length !== 1) return;

    touchItem = e.currentTarget;
    touchStartTime = Date.now();
    touchMoved = false;

    const touch = e.touches[0];
    const rect = touchItem.getBoundingClientRect();
    touchOrigin.x = touch.clientX;
    touchOrigin.y = touch.clientY;
    touchOffset.x = touch.clientX - rect.left;
    touchOffset.y = touch.clientY - rect.top;

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function ensureTouchClone(touch) {
    if (!touchItem || document.querySelector('.touch-clone')) return;
    touchItem.classList.add('dragging');
    const clone = touchItem.cloneNode(true);
    clone.className = 'item touch-clone';
    clone.style.position = 'fixed';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '9999';
    clone.style.opacity = '0.9';
    clone.style.width = touchItem.offsetWidth + 'px';
    document.body.appendChild(clone);
    updateTouchClonePosition(clone, touch);
}

function handleTouchMove(e) {
    if (!touchItem || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const dist = Math.hypot(touch.clientX - touchOrigin.x, touch.clientY - touchOrigin.y);
    if (dist < 14) return;

    e.preventDefault();
    touchMoved = true;
    ensureTouchClone(touch);

    const clone = document.querySelector('.touch-clone');
    if (clone) updateTouchClonePosition(clone, touch);

    const truckContainer = document.getElementById('truck-container');
    const truckVisual = document.getElementById('truck-visual');

    if (truckContainer && truckVisual) {
        const truckRect = truckContainer.getBoundingClientRect();
        const isOverTruck = (
            touch.clientX >= truckRect.left &&
            touch.clientX <= truckRect.right &&
            touch.clientY >= truckRect.top &&
            touch.clientY <= truckRect.bottom
        );
        truckVisual.classList.toggle('drag-over', isOverTruck);
    }
}

function handleTouchEnd(e) {
    if (!touchItem) return;

    const clone = document.querySelector('.touch-clone');
    if (clone) clone.remove();

    if (touchMoved) {
        const touch = e.changedTouches[0];
        const truckContainer = document.getElementById('truck-container');
        const truckVisual = document.getElementById('truck-visual');

        if (truckContainer && truckVisual && touch) {
            const truckRect = truckContainer.getBoundingClientRect();
            const isOverTruck = (
                touch.clientX >= truckRect.left &&
                touch.clientX <= truckRect.right &&
                touch.clientY >= truckRect.top &&
                touch.clientY <= truckRect.bottom
            );

            if (isOverTruck) {
                addItemToTruck(parseInt(touchItem.dataset.itemIndex, 10));
            }

            truckVisual.classList.remove('drag-over');
        }
    }

    touchItem.classList.remove('dragging');
    touchItem = null;

    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
}

function updateTouchClonePosition(clone, touch) {
    clone.style.left = (touch.clientX - touchOffset.x) + 'px';
    clone.style.top = (touch.clientY - touchOffset.y) + 'px';
}

// Touch support setup function
function setupTouchSupport() {
    const items = document.querySelectorAll('.item-card');
    items.forEach(item => {
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
    });
}

// Initialize the game properly on page load
document.addEventListener('DOMContentLoaded', function () {
    // Ensure modal is hidden on page load
    const modal = document.getElementById('results-modal');
    if (modal) {
        modal.classList.add('hidden');
    }

    // Ensure game interface is hidden initially
    const gameInterface = document.getElementById('game-interface');
    if (gameInterface) {
        gameInterface.classList.add('hidden');
    }

    // Ensure move type selection is visible
    const moveTypeSelection = document.getElementById('move-type-selection');
    if (moveTypeSelection) {
        moveTypeSelection.classList.remove('hidden');
    }

    updateCapacityDisplay();
});

// Touch support setup function
function setupTouchSupport() {
    const items = document.querySelectorAll('.item-card');
    items.forEach(item => {
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
    });
}

// Google Maps Integration Variables
let map;
let pickupMarker;
let dropoffMarker;
let directionsService;
let directionsRenderer;
let currentLocationMode = null; // 'pickup' or 'dropoff'
let pickupLocation = null;
let dropoffLocation = null;
let googleMapsEventListenersSetup = false;

// Initialize Google Maps (called by Google Maps API)
function initMap() {
    console.log('Google Maps API loaded successfully');
    window.googleMapsLoaded = true;

    // Setup Google Maps event listeners after API is loaded
    setupGoogleMapsEventListeners();
}

// Setup Google Maps Event Listeners
function setupGoogleMapsEventListeners() {
    console.log('Setting up Google Maps event listeners...');

    // Select pickup location button
    const selectPickupBtn = document.getElementById('select-pickup-btn');
    console.log('Pickup button found:', selectPickupBtn);
    if (selectPickupBtn) {
        selectPickupBtn.replaceWith(selectPickupBtn.cloneNode(true));
        const newSelectPickupBtn = document.getElementById('select-pickup-btn');
        newSelectPickupBtn.addEventListener('click', () => {
            console.log('Pickup button clicked');
            if (!window.googleMapsLoaded) {
                showNotification('Google Maps is still loading. Please wait a moment and try again.', 'warning');
                return;
            }
            currentLocationMode = 'pickup';
            showMapContainer();
            initializeMapIfNeeded();
            const instructionText = document.getElementById('map-instruction-text');
            if (instructionText) {
                instructionText.textContent = 'Click on the map to select your pickup location';
            }
            const confirmBtn = document.getElementById('confirm-location-btn');
            if (confirmBtn) {
                confirmBtn.disabled = true;
            }
        });
    }

    // Select dropoff location button
    const selectDropoffBtn = document.getElementById('select-dropoff-btn');
    console.log('Dropoff button found:', selectDropoffBtn);
    if (selectDropoffBtn) {
        selectDropoffBtn.replaceWith(selectDropoffBtn.cloneNode(true));
        const newSelectDropoffBtn = document.getElementById('select-dropoff-btn');
        newSelectDropoffBtn.addEventListener('click', () => {
            console.log('Dropoff button clicked');
            if (!window.googleMapsLoaded) {
                showNotification('Google Maps is still loading. Please wait a moment and try again.', 'warning');
                return;
            }
            currentLocationMode = 'dropoff';
            showMapContainer();
            initializeMapIfNeeded();
            const instructionText = document.getElementById('map-instruction-text');
            if (instructionText) {
                instructionText.textContent = 'Click on the map to select your drop-off location';
            }
            const confirmBtn = document.getElementById('confirm-location-btn');
            if (confirmBtn) {
                confirmBtn.disabled = true;
            }
        });
    }

    // Calculate route button
    const calculateRouteBtn = document.getElementById('calculate-route-btn');
    console.log('Calculate route button found:', calculateRouteBtn);
    if (calculateRouteBtn) {
        calculateRouteBtn.replaceWith(calculateRouteBtn.cloneNode(true));
        const newCalculateRouteBtn = document.getElementById('calculate-route-btn');
        newCalculateRouteBtn.addEventListener('click', () => {
            console.log('Calculate route button clicked');
            calculateRoute();
        });
    }

    // Confirm location button
    const confirmLocationBtn = document.getElementById('confirm-location-btn');
    if (confirmLocationBtn) {
        confirmLocationBtn.replaceWith(confirmLocationBtn.cloneNode(true));
        const newConfirmLocationBtn = document.getElementById('confirm-location-btn');
        newConfirmLocationBtn.addEventListener('click', confirmLocation);
    }

    // Cancel map button
    const cancelMapBtn = document.getElementById('cancel-map-btn');
    if (cancelMapBtn) {
        cancelMapBtn.replaceWith(cancelMapBtn.cloneNode(true));
        const newCancelMapBtn = document.getElementById('cancel-map-btn');
        newCancelMapBtn.addEventListener('click', hideMapContainer);
    }
}

// Initialize map if not already done
function initializeMapIfNeeded() {
    if (!map) {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        // Initialize map centered on North America
        map = new google.maps.Map(mapContainer, {
            zoom: 4,
            center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        // Initialize directions service and renderer
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            draggable: false,
            suppressMarkers: false
        });
        directionsRenderer.setMap(map);

        // Add click listener to map
        map.addListener('click', (event) => {
            if (currentLocationMode) {
                selectLocationOnMap(event.latLng);
            }
        });
    }
}

// Show map container
function showMapContainer() {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.classList.remove('hidden');
    }
}

// Hide map container
function hideMapContainer() {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.classList.add('hidden');
    }
    currentLocationMode = null;
}

// Select location on map
function selectLocationOnMap(latLng) {
    if (!currentLocationMode) return;

    // Show loading message
    const instructionText = document.getElementById('map-instruction-text');
    if (instructionText) {
        instructionText.textContent = 'Location selected...';
    }

    // Create simple address from coordinates (fallback)
    const lat = latLng.lat().toFixed(6);
    const lng = latLng.lng().toFixed(6);
    const simpleAddress = `Latitude: ${lat}, Longitude: ${lng}`;
    const shortAddress = `${lat}, ${lng}`;

    // Try to get address from coordinates (with error handling)
    const geocoder = new google.maps.Geocoder();

    // Set timeout for geocoding request
    const geocodeTimeout = setTimeout(() => {
        // Fallback if geocoding takes too long or fails
        handleLocationSelection(latLng, simpleAddress, shortAddress);
    }, 3000);

    geocoder.geocode({ location: latLng }, (results, status) => {
        clearTimeout(geocodeTimeout);

        if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            const shortAddress = results[0].address_components.length > 0 ?
                results[0].address_components.slice(0, 3).map(c => c.long_name).join(', ') :
                address;
            handleLocationSelection(latLng, address, shortAddress);
        } else {
            console.warn('Geocoding failed:', status);
            // Use fallback coordinates
            handleLocationSelection(latLng, simpleAddress, shortAddress);
        }
    });
}

// Handle location selection (extracted to avoid duplication)
function handleLocationSelection(latLng, address, shortAddress) {
    if (currentLocationMode === 'pickup') {
        // Store the address globally
        selectedPickupAddress = address;

        // Remove existing pickup marker
        if (pickupMarker) {
            pickupMarker.setMap(null);
        }

        // Add new pickup marker with info window
        pickupMarker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: 'Pickup Location: ' + shortAddress,
            label: {
                text: '📍',
                fontSize: '18px'
            }
        });

        // Create info window for pickup
        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 5px;"><strong>📍 Pickup Location</strong><br/>${shortAddress}</div>`
        });

        // Show info window immediately
        infoWindow.open(map, pickupMarker);

        document.getElementById('confirm-location-btn').disabled = false;
        document.getElementById('map-instruction-text').innerHTML = `
            <strong>📍 Pickup Location Selected:</strong><br/>
            ${address}<br/>
            <small style="color: #666;">Click "Confirm Location" to save this location</small>
        `;

    } else if (currentLocationMode === 'dropoff') {
        // Store the address globally
        selectedDropoffAddress = address;

        // Remove existing dropoff marker
        if (dropoffMarker) {
            dropoffMarker.setMap(null);
        }

        // Add new dropoff marker with info window
        dropoffMarker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: 'Drop-off Location: ' + shortAddress,
            label: {
                text: '🎯',
                fontSize: '18px'
            }
        });

        // Create info window for dropoff
        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 5px;"><strong>🎯 Drop-off Location</strong><br/>${shortAddress}</div>`
        });

        // Show info window immediately
        infoWindow.open(map, dropoffMarker);

        document.getElementById('confirm-location-btn').disabled = false;
        document.getElementById('map-instruction-text').innerHTML = `
            <strong>🎯 Drop-off Location Selected:</strong><br/>
            ${address}<br/>
            <small style="color: #666;">Click "Confirm Location" to save this location</small>
        `;
    }
}

// Store selected addresses globally
let selectedPickupAddress = null;
let selectedDropoffAddress = null;

// Confirm selected location
function confirmLocation() {
    if (currentLocationMode === 'pickup' && pickupMarker) {
        const address = selectedPickupAddress || 'Selected pickup location';

        pickupLocation = {
            address: address,
            latLng: pickupMarker.getPosition()
        };
        document.getElementById('pickup-address').textContent = address;
        showNotification('Pickup location confirmed!', 'success');

        // Clear the stored address
        selectedPickupAddress = null;
    } else if (currentLocationMode === 'dropoff' && dropoffMarker) {
        const address = selectedDropoffAddress || 'Selected drop-off location';

        dropoffLocation = {
            address: address,
            latLng: dropoffMarker.getPosition()
        };
        document.getElementById('dropoff-address').textContent = address;
        showNotification('Drop-off location confirmed!', 'success');

        // Clear the stored address
        selectedDropoffAddress = null;
    }

    document.getElementById('location-summary').style.display = 'block';

    // Auto-calculate route if both locations are set
    if (pickupLocation && dropoffLocation) {
        document.getElementById('calculate-route-btn').disabled = false;
        // Automatically calculate route and distance
        setTimeout(() => {
            calculateRoute();
        }, 1000); // Small delay to let user see the confirmation
    }

    hideMapContainer();
}

// Calculate route using Google Maps Directions Service
function calculateRoute() {
    if (!pickupLocation || !dropoffLocation) {
        showNotification('Please select both pickup and drop-off locations first.', 'warning');
        return;
    }

    // Show calculating message
    showNotification('Calculating route and distance...', 'info');

    // Update UI to show calculating
    document.getElementById('route-distance').textContent = 'Calculating...';
    document.getElementById('location-summary').style.display = 'block';

    // Initialize map if needed but don't necessarily show it
    initializeMapIfNeeded();

    const request = {
        origin: pickupLocation.latLng,
        destination: dropoffLocation.latLng,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            // Only show map container if it's currently hidden and user wants to see route
            const mapContainer = document.getElementById('map-container');
            if (mapContainer && mapContainer.classList.contains('hidden')) {
                // Don't automatically show map, just calculate distance
            } else {
                directionsRenderer.setDirections(result);
            }

            // Get distance in miles
            const route = result.routes[0];
            const leg = route.legs[0];
            const distanceText = leg.distance.text;
            const distanceValue = leg.distance.value; // in meters
            const distanceInMiles = Math.round(distanceValue * 0.000621371); // Convert to miles
            const durationText = leg.duration.text;

            // Update UI with detailed information
            document.getElementById('route-distance').innerHTML = `
                <strong>${distanceInMiles} miles</strong><br/>
                <small style="color: #666;">Estimated time: ${durationText}</small>
            `;
            document.getElementById('location-summary').style.display = 'block';

            // Set the distance for cost calculation
            gameState.distance = distanceInMiles;

            showNotification(`✅ Route calculated: ${distanceInMiles} miles (${durationText})`, 'success');

            // Automatically calculate cost with new distance
            setTimeout(() => {
                calculateCost();
            }, 500);
        } else {
            console.error('Directions request failed due to ' + status);
            document.getElementById('route-distance').textContent = 'Calculation failed';
            showNotification('Could not calculate route: ' + status, 'error');
        }
    });
}

// Touch support setup function
function setupTouchSupport() {
    const items = document.querySelectorAll('.item-card');
    items.forEach(item => {
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
    });
}

// Location form handling
let pickupAddress = '';
let dropoffAddress = '';
let travelDistance = 0;
let pickupCoords = null;
let dropoffCoords = null;

// Major cities database for autocomplete
const majorCities = [
    // Canada
    { name: 'Vancouver', country: 'Canada', province: 'BC', lat: 49.2827, lng: -123.1207 },
    { name: 'Calgary', country: 'Canada', province: 'AB', lat: 51.0447, lng: -114.0719 },
    { name: 'Toronto', country: 'Canada', province: 'ON', lat: 43.6532, lng: -79.3832 },
    { name: 'Montreal', country: 'Canada', province: 'QC', lat: 45.5017, lng: -73.5673 },
    { name: 'Ottawa', country: 'Canada', province: 'ON', lat: 45.4215, lng: -75.6972 },
    { name: 'Edmonton', country: 'Canada', province: 'AB', lat: 53.5461, lng: -113.4938 },
    { name: 'Winnipeg', country: 'Canada', province: 'MB', lat: 49.8951, lng: -97.1384 },
    { name: 'Quebec City', country: 'Canada', province: 'QC', lat: 46.8139, lng: -71.2080 },
    { name: 'Halifax', country: 'Canada', province: 'NS', lat: 44.6488, lng: -63.5752 },
    { name: 'Victoria', country: 'Canada', province: 'BC', lat: 48.4284, lng: -123.3656 },

    // USA
    { name: 'New York', country: 'USA', state: 'NY', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', country: 'USA', state: 'CA', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', country: 'USA', state: 'IL', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', country: 'USA', state: 'TX', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix', country: 'USA', state: 'AZ', lat: 33.4484, lng: -112.0740 },
    { name: 'Philadelphia', country: 'USA', state: 'PA', lat: 39.9526, lng: -75.1652 },
    { name: 'San Antonio', country: 'USA', state: 'TX', lat: 29.4241, lng: -98.4936 },
    { name: 'San Diego', country: 'USA', state: 'CA', lat: 32.7157, lng: -117.1611 },
    { name: 'Dallas', country: 'USA', state: 'TX', lat: 32.7767, lng: -96.7970 },
    { name: 'San Jose', country: 'USA', state: 'CA', lat: 37.3382, lng: -121.8863 },
    { name: 'Austin', country: 'USA', state: 'TX', lat: 30.2672, lng: -97.7431 },
    { name: 'Jacksonville', country: 'USA', state: 'FL', lat: 30.3322, lng: -81.6557 },
    { name: 'San Francisco', country: 'USA', state: 'CA', lat: 37.7749, lng: -122.4194 },
    { name: 'Indianapolis', country: 'USA', state: 'IN', lat: 39.7684, lng: -86.1581 },
    { name: 'Columbus', country: 'USA', state: 'OH', lat: 39.9612, lng: -82.9988 },
    { name: 'Fort Worth', country: 'USA', state: 'TX', lat: 32.7555, lng: -97.3308 },
    { name: 'Charlotte', country: 'USA', state: 'NC', lat: 35.2271, lng: -80.8431 },
    { name: 'Seattle', country: 'USA', state: 'WA', lat: 47.6062, lng: -122.3321 },
    { name: 'Denver', country: 'USA', state: 'CO', lat: 39.7392, lng: -104.9903 },
    { name: 'Boston', country: 'USA', state: 'MA', lat: 42.3601, lng: -71.0589 }
];

// Setup location form event listeners
function setupLocationForm() {
    const autoCalculateBtn = document.getElementById('auto-calculate-btn');
    const editLocationsBtn = document.getElementById('edit-locations-btn');
    const pickupInput = document.getElementById('pickup-input');
    const dropoffInput = document.getElementById('dropoff-input');

    if (autoCalculateBtn) {
        autoCalculateBtn.addEventListener('click', autoCalculateDistanceAndCost);
    }

    if (editLocationsBtn) {
        editLocationsBtn.addEventListener('click', editLocations);
    }

    // Setup autocomplete for pickup
    if (pickupInput) {
        setupAutocomplete(pickupInput, 'pickup');
    }

    // Setup autocomplete for dropoff
    if (dropoffInput) {
        setupAutocomplete(dropoffInput, 'dropoff');
    }
}

function applyLocationSelection(type, address, coords) {
    if (type === 'pickup') {
        pickupAddress = address;
        pickupCoords = coords;
        gameState.pickupAddress = address;
    } else {
        dropoffAddress = address;
        dropoffCoords = coords;
        gameState.dropoffAddress = address;
    }

    if (pickupCoords && dropoffCoords) {
        const autoCalculateBtn = document.getElementById('auto-calculate-btn');
        const distanceText = document.getElementById('distance-text');
        if (autoCalculateBtn) autoCalculateBtn.disabled = false;
        if (distanceText) distanceText.textContent = gt('estimator_distance_ready', 'Ready to calculate distance');
    }
}

// Setup autocomplete for input field — same helper as Get my moving quote
function setupAutocomplete(inputElement, type) {
    if (!inputElement || inputElement.dataset.placesBound) return;
    const suggestionsContainer = document.getElementById(`${type}-suggestions`);
    const binder = window.MuhtarAddressSearch && window.MuhtarAddressSearch.bind;

    if (typeof binder === 'function') {
        binder(inputElement, {
            suggestionsEl: suggestionsContainer,
            types: ['geocode'],
            onSelect: function (place) {
                const address = place.formattedAddress || inputElement.value;
                inputElement.value = address;
                applyLocationSelection(type, address, place.location || null);
            },
            onInput: function () {
                if (type === 'pickup') {
                    pickupCoords = null;
                    pickupAddress = inputElement.value;
                } else {
                    dropoffCoords = null;
                    dropoffAddress = inputElement.value;
                }
                const autoCalculateBtn = document.getElementById('auto-calculate-btn');
                if (autoCalculateBtn) autoCalculateBtn.disabled = true;
            }
        });
        inputElement.dataset.placesBound = '1';
        return;
    }

    const selectedIndex = { value: -1 };
    let searchTimeout = null;

    inputElement.addEventListener('input', function () {
        const query = this.value.trim();
        if (query.length < 3) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        if (searchTimeout) clearTimeout(searchTimeout);
        suggestionsContainer.innerHTML = '<div class="suggestion-item loading">Searching…</div>';
        suggestionsContainer.style.display = 'block';
        searchTimeout = setTimeout(() => {
            searchAddresses(query, type, inputElement, suggestionsContainer);
        }, 500);
    });

    inputElement.addEventListener('keydown', function (e) {
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item:not(.loading):not(.no-results):not(.error)');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.length - 1);
            updateSelectedSuggestion(suggestions, selectedIndex.value);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
            updateSelectedSuggestion(suggestions, selectedIndex.value);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex.value >= 0 && suggestions[selectedIndex.value]) {
                suggestions[selectedIndex.value].click();
            }
        } else if (e.key === 'Escape') {
            suggestionsContainer.style.display = 'none';
            selectedIndex.value = -1;
        }
    });
}

// Search addresses using OpenStreetMap Nominatim API
async function searchAddresses(query, type, inputElement, suggestionsContainer) {
    try {
        // Focus on North America (USA and Canada)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(query)}&` +
            `format=json&` +
            `limit=8&` +
            `countrycodes=us,ca&` +
            `addressdetails=1&` +
            `accept-language=en`
        );

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const results = await response.json();

        if (results.length === 0) {
            suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">❌ No results found</div>';
            return;
        }

        suggestionsContainer.innerHTML = '';

        results.forEach((result, index) => {
            const address = result.address || {};
            const displayName = formatDisplayName(result.display_name);
            const details = formatAddressDetails(address);

            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <div class="suggestion-main">${displayName}</div>
                <div class="suggestion-details">${details}</div>
            `;

            suggestionItem.addEventListener('click', () => {
                selectAddress(result, type, inputElement, suggestionsContainer);
            });

            suggestionsContainer.appendChild(suggestionItem);
        });

    } catch (error) {
        console.error('Address search error:', error);
        suggestionsContainer.innerHTML = '<div class="suggestion-item error">⚠️ Search error. Try again.</div>';
    }
}

// Format display name for better readability
function formatDisplayName(displayName) {
    const parts = displayName.split(',');
    if (parts.length >= 3) {
        return parts.slice(0, 3).join(', ');
    }
    return displayName;
}

// Format address details
function formatAddressDetails(address) {
    const parts = [];

    if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village);
    }

    if (address.state) {
        parts.push(address.state);
    }

    if (address.country) {
        const countryName = address.country === 'United States' ? 'USA' : address.country;
        parts.push(countryName);
    }

    return parts.join(', ');
}

// Select address from search results
function selectAddress(result, type, inputElement, suggestionsContainer) {
    const displayName = formatDisplayName(result.display_name);
    inputElement.value = displayName;
    suggestionsContainer.style.display = 'none';

    const coords = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
    };

    if (type === 'pickup') {
        pickupAddress = displayName;
        pickupCoords = coords;
    } else {
        dropoffAddress = displayName;
        dropoffCoords = coords;
    }

    // Check if both locations are selected
    if (pickupCoords && dropoffCoords) {
        const autoCalculateBtn = document.getElementById('auto-calculate-btn');
        const distanceText = document.getElementById('distance-text');

        if (autoCalculateBtn) autoCalculateBtn.disabled = false;
        if (distanceText) distanceText.textContent = 'Ready to calculate distance';
    }
}

function updateSelectedSuggestion(suggestions, selectedIndex) {
    suggestions.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function selectCity(city, type, inputElement, suggestionsContainer) {
    const displayName = `${city.name}, ${city.province || city.state}, ${city.country}`;
    inputElement.value = displayName;
    suggestionsContainer.style.display = 'none';

    if (type === 'pickup') {
        pickupAddress = displayName;
        pickupCoords = { lat: city.lat, lng: city.lng };
    } else {
        dropoffAddress = displayName;
        dropoffCoords = { lat: city.lat, lng: city.lng };
    }

    // Check if both locations are selected
    if (pickupCoords && dropoffCoords) {
        const autoCalculateBtn = document.getElementById('auto-calculate-btn');
        const distanceText = document.getElementById('distance-text');

        if (autoCalculateBtn) autoCalculateBtn.disabled = false;
        if (distanceText) distanceText.textContent = 'Ready to calculate distance';
    }
}

// Auto-calculate distance and cost
function autoCalculateDistanceAndCost() {
    if (!pickupCoords || !dropoffCoords) {
        showNotification('Please select both pickup and drop-off locations', 'warning');
        return;
    }

    // Show loading state
    const distanceDisplay = document.getElementById('distance-display');
    const distanceText = document.getElementById('distance-text');
    const distanceLoader = document.getElementById('distance-loader');

    if (distanceText) distanceText.style.display = 'none';
    if (distanceLoader) distanceLoader.style.display = 'flex';

    // Calculate distance using Haversine formula
    const distance = calculateHaversineDistance(
        pickupCoords.lat, pickupCoords.lng,
        dropoffCoords.lat, dropoffCoords.lng
    );

    // Simulate API delay for better UX
    setTimeout(() => {
        travelDistance = Math.round(distance);
        gameState.distance = travelDistance;

        // Update display
        if (distanceLoader) distanceLoader.style.display = 'none';
        if (distanceText) {
            distanceText.style.display = 'block';
            distanceText.textContent = `${travelDistance} miles`;
            distanceText.classList.add('calculated');
        }
        if (distanceDisplay) distanceDisplay.classList.add('calculated');

        // Update summary
        const pickupAddressElement = document.getElementById('pickup-address');
        const dropoffAddressElement = document.getElementById('dropoff-address');
        const routeDistanceElement = document.getElementById('route-distance');

        if (pickupAddressElement) pickupAddressElement.textContent = pickupAddress;
        if (dropoffAddressElement) dropoffAddressElement.textContent = dropoffAddress;
        if (routeDistanceElement) routeDistanceElement.textContent = `${travelDistance} miles`;

        // Show summary and hide form
        const locationSummary = document.getElementById('location-summary');
        const locationForm = document.querySelector('.location-form');

        if (locationSummary) locationSummary.style.display = 'block';
        if (locationForm) locationForm.style.display = 'none';

        showNotification(`✅ Distance calculated: ${travelDistance} miles`, 'success');

        // Auto-calculate cost
        setTimeout(() => {
            calculateCost();
        }, 500);
    }, 1500); // 1.5 second delay for loading effect
}

// Calculate distance between two coordinates using Haversine formula
function calculateHaversineDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Edit locations
function editLocations() {
    // Show form and hide summary
    const locationForm = document.querySelector('.location-form');
    const locationSummary = document.getElementById('location-summary');

    if (locationForm) locationForm.style.display = 'block';
    if (locationSummary) locationSummary.style.display = 'none';

    // Reset form state
    const pickupInput = document.getElementById('pickup-input');
    const dropoffInput = document.getElementById('dropoff-input');

    if (pickupInput) pickupInput.value = pickupAddress;
    if (dropoffInput) dropoffInput.value = dropoffAddress;

    // Reset distance display
    const distanceDisplay = document.getElementById('distance-display');
    const distanceText = document.getElementById('distance-text');
    const autoCalculateBtn = document.getElementById('auto-calculate-btn');

    if (distanceDisplay) distanceDisplay.classList.remove('calculated');
    if (distanceText) distanceText.classList.remove('calculated');

    if (pickupCoords && dropoffCoords) {
        if (distanceText) distanceText.textContent = 'Ready to calculate distance';
        if (autoCalculateBtn) autoCalculateBtn.disabled = false;
    } else {
        if (distanceText) distanceText.textContent = 'Select pickup and drop-off locations to calculate distance';
        if (autoCalculateBtn) autoCalculateBtn.disabled = true;
    }
}

// Touch support setup function
function setupTouchSupport() {
    const items = document.querySelectorAll('.item-card');
    items.forEach(item => {
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Content Loaded - Initializing app...');

    initializeElements();
    setupEventListeners();
    setupLocationForm();
    setupInventorySheet();
    if (window.MuhtarAddressSearch && typeof window.MuhtarAddressSearch.loadGoogle === 'function') {
        window.MuhtarAddressSearch.loadGoogle();
    }
    showInitialScreen();

    console.log('App initialized successfully');
});
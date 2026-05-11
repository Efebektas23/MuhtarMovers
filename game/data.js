// Game Data and Configuration
const itemData = {
    residential: {
        livingRoom: [
            // Mobilya
            { name: "3-Seat Sofa", volume: 1.27, weight: 280, icon: "fas fa-couch" },
            { name: "2-Seat Loveseat", volume: 0.91, weight: 224, icon: "fas fa-chair" },
            { name: "Armchair", volume: 0.42, weight: 105, icon: "fas fa-chair" },
            { name: "Recliner Chair", volume: 0.42, weight: 105, icon: "fas fa-chair" },
            { name: "Futon/Sofa Bed", volume: 0.85, weight: 210, icon: "fas fa-bed" },
            { name: "TV Stand (Medium)", volume: 0.28, weight: 40, icon: "fas fa-tv" },
            { name: "Large Bookshelf", volume: 0.57, weight: 100, icon: "fas fa-book" },
            // Dekor & Aydınlatma
            { name: "Coffee Table", volume: 0.14, weight: 30, icon: "fas fa-table" },
            { name: "Side Table", volume: 0.06, weight: 15, icon: "fas fa-table" },
            { name: "Floor Lamp", volume: 0.08, weight: 20, icon: "fas fa-lightbulb" }
        ],
        kitchen: [
            // Beyaz Eşya
            { name: "Mini Refrigerator", volume: 0.14, weight: 60, icon: "fas fa-snowflake" },
            { name: "Top Freezer Refrigerator", volume: 0.48, weight: 166, icon: "fas fa-snowflake" },
            { name: "Side-by-Side Refrigerator", volume: 0.68, weight: 285, icon: "fas fa-snowflake" },
            { name: "Stove/Oven Combo", volume: 0.85, weight: 150, icon: "fas fa-fire-flame-curved" },
            { name: "Microwave Oven", volume: 0.28, weight: 50, icon: "fas fa-kitchen-set" },
            { name: "Built-in Dishwasher", volume: 0.34, weight: 77, icon: "fas fa-sink" },
            { name: "Washing Machine", volume: 0.99, weight: 150, icon: "fas fa-tshirt" },
            { name: "Dryer", volume: 0.71, weight: 120, icon: "fas fa-wind" },
            // Mobilya
            { name: "Kitchen/Dining Table", volume: 0.71, weight: 100, icon: "fas fa-utensils" },
            { name: "Dining Chair", volume: 0.14, weight: 20, icon: "fas fa-chair" },
            // Dekor/Aksesuar
            { name: "Dishes Box (3 ft³)", volume: 0.08, weight: 10, icon: "fas fa-plate-wheat" }
        ],
        bedroom: [
            // Mobilya
            { name: "Twin Bed", volume: 0.85, weight: 210, icon: "fas fa-bed" },
            { name: "Double Bed", volume: 1.42, weight: 350, icon: "fas fa-bed" },
            { name: "King-Size Bed", volume: 1.70, weight: 420, icon: "fas fa-bed" },
            { name: "Bunk Bed", volume: 1.70, weight: 420, icon: "fas fa-bed" },
            { name: "Nightstand", volume: 0.42, weight: 105, icon: "fas fa-lightbulb" },
            { name: "Single Dresser", volume: 0.85, weight: 210, icon: "fas fa-door-closed" },
            { name: "Double Dresser", volume: 1.13, weight: 280, icon: "fas fa-door-closed" },
            { name: "Single Wardrobe", volume: 0.71, weight: 175, icon: "fas fa-shirt" },
            { name: "Double Wardrobe", volume: 1.27, weight: 315, icon: "fas fa-shirt" },
            { name: "Mirrored Vanity", volume: 0.85, weight: 210, icon: "fas fa-sparkles" },
            // Dekor/Aksesuar
            { name: "Large Wall Mirror", volume: 0.20, weight: 49, icon: "fas fa-expand" },
            // Diğer
            { name: "Rolled Carpet", volume: 0.28, weight: 100, icon: "fas fa-scroll" }
        ],
        bathroom: [
            // Mobilya
            { name: "Bathroom Vanity", volume: 0.28, weight: 30, icon: "fas fa-sink" },
            { name: "Mirrored Medicine Cabinet", volume: 0.14, weight: 15, icon: "fas fa-door-open" },
            { name: "Toilet", volume: 0.14, weight: 70, icon: "fas fa-toilet" },
            { name: "Shower Enclosure", volume: 0.42, weight: 100, icon: "fas fa-shower" },
            { name: "Bathtub", volume: 0.85, weight: 200, icon: "fas fa-bath" },
            // Depolama
            { name: "Laundry Basket", volume: 0.06, weight: 5, icon: "fas fa-basket-shopping" },
            { name: "Towel Set (Box)", volume: 0.03, weight: 5, icon: "fas fa-hand-holding-water" }
        ],
        homeOffice: [
            // Mobilya
            { name: "Large Work Desk", volume: 1.13, weight: 150, icon: "fas fa-desktop" },
            { name: "Executive Chair", volume: 0.85, weight: 100, icon: "fas fa-chair" },
            { name: "Office Chair", volume: 0.28, weight: 30, icon: "fas fa-chair" },
            { name: "4-Drawer File Cabinet", volume: 0.74, weight: 150, icon: "fas fa-folder-open" },
            { name: "Medium Bookshelf", volume: 0.42, weight: 80, icon: "fas fa-book" },
            { name: "Office Side Table", volume: 0.14, weight: 15, icon: "fas fa-table" },
            // Elektronik
            { name: "Printer", volume: 0.14, weight: 30, icon: "fas fa-print" }
        ],
        garage: [
            // Ekipman
            { name: "Lawn Mower", volume: 0.99, weight: 80, icon: "fas fa-leaf" },
            { name: "BBQ Grill", volume: 0.28, weight: 50, icon: "fas fa-fire" },
            { name: "Bicycle", volume: 0.14, weight: 25, icon: "fas fa-bicycle" },
            { name: "Folding Ladder", volume: 0.28, weight: 20, icon: "fas fa-bars" },
            { name: "Garden Chair", volume: 0.14, weight: 15, icon: "fas fa-chair" },
            // Araç Gereç
            { name: "Hand Cart", volume: 0.42, weight: 50, icon: "fas fa-cart-flatbed" },
            { name: "Shovel/Hoe (each)", volume: 0.06, weight: 10, icon: "fas fa-hammer" }
        ],
        storage: [
            // Koli
            { name: "Small Box (1.5 ft³)", volume: 0.04, weight: 5, icon: "fas fa-box" },
            { name: "Medium Box (3 ft³)", volume: 0.08, weight: 10, icon: "fas fa-box" },
            { name: "Large Box (4.5 ft³)", volume: 0.13, weight: 15, icon: "fas fa-box" },
            { name: "Extra Large Box (6 ft³)", volume: 0.17, weight: 20, icon: "fas fa-box" },
            { name: "Wardrobe Box (30 clothes)", volume: 0.28, weight: 50, icon: "fas fa-box-archive" },
            { name: "Large Suitcase", volume: 0.28, weight: 40, icon: "fas fa-suitcase" },
            { name: "Book Box (Full)", volume: 0.14, weight: 30, icon: "fas fa-book" }
        ],
        outdoor: [
            // Mobilya
            { name: "Picnic Table", volume: 0.57, weight: 80, icon: "fas fa-table" },
            { name: "Garden Chair", volume: 0.14, weight: 15, icon: "fas fa-chair" },
            { name: "Lounge Chair", volume: 0.14, weight: 20, icon: "fas fa-chair" },
            { name: "Garden Umbrella", volume: 0.08, weight: 10, icon: "fas fa-umbrella" },
            { name: "Garden Swing", volume: 0.85, weight: 80, icon: "fas fa-tree" }
        ],
        specialItems: [
            { name: "Grand Piano", volume: 4.5, weight: 400, icon: "fas fa-music" },
            { name: "Pool Table", volume: 3.5, weight: 300, icon: "fas fa-table" },
            { name: "Safe", volume: 0.8, weight: 250, icon: "fas fa-lock" },
            { name: "Hot Tub", volume: 6.0, weight: 800, icon: "fas fa-bath" },
            { name: "Treadmill", volume: 2.2, weight: 150, icon: "fas fa-running" }
        ]
    },
    office: [
        { name: "Executive Desk", volume: 1.8, weight: 95, icon: "fas fa-desktop" },
        { name: "Ergonomic Chair", volume: 0.9, weight: 40, icon: "fas fa-chair" },
        { name: "4-Drawer Cabinet", volume: 1.2, weight: 85, icon: "fas fa-folder-open" },
        { name: "Desktop Computer", volume: 0.4, weight: 20, icon: "fas fa-desktop" },
        { name: "Laser Printer", volume: 0.5, weight: 30, icon: "fas fa-print" },
        { name: "Office Bookcase", volume: 2.2, weight: 110, icon: "fas fa-book" },
        { name: "Conference Table", volume: 4.0, weight: 180, icon: "fas fa-table" },
        { name: "Whiteboard", volume: 0.7, weight: 25, icon: "fas fa-chalkboard" },
        { name: "Office Safe", volume: 1.0, weight: 220, icon: "fas fa-lock" },
        { name: "Water Cooler", volume: 1.1, weight: 70, icon: "fas fa-glass-water" },
        { name: "27-inch Monitor", volume: 0.3, weight: 12, icon: "fas fa-tv" },
        { name: "Projector", volume: 0.4, weight: 15, icon: "fas fa-video" },
        { name: "Reception Desk", volume: 2.5, weight: 140, icon: "fas fa-table" },
        { name: "Office Partition", volume: 1.5, weight: 60, icon: "fas fa-grip-vertical" },
        { name: "Copy Machine", volume: 1.8, weight: 120, icon: "fas fa-print" },
        { name: "Shredder", volume: 0.6, weight: 35, icon: "fas fa-scissors" }
    ],
    commercial: [
        { name: "Walk-in Freezer", volume: 8.0, weight: 600, icon: "fas fa-snowflake" },
        { name: "Point of Sale", volume: 0.6, weight: 55, icon: "fas fa-calculator" },
        { name: "Refrigerated Case", volume: 3.0, weight: 180, icon: "fas fa-snowflake" },
        { name: "Metal Shelving", volume: 3.5, weight: 240, icon: "fas fa-bars" },
        { name: "POS Terminal", volume: 0.4, weight: 25, icon: "fas fa-credit-card" },
        { name: "Pizza Oven", volume: 4.0, weight: 350, icon: "fas fa-pizza-slice" },
        { name: "Pallet Rack", volume: 6.0, weight: 300, icon: "fas fa-warehouse" },
        { name: "Electric Forklift", volume: 9.0, weight: 2200, icon: "fas fa-truck-moving" },
        { name: "Service Cart", volume: 1.8, weight: 90, icon: "fas fa-cart-flatbed" },
        { name: "Loading Platform", volume: 12.0, weight: 800, icon: "fas fa-industry" },
        { name: "Conveyor System", volume: 8.0, weight: 500, icon: "fas fa-arrow-right" },
        { name: "Storage Cabinet", volume: 2.0, weight: 120, icon: "fas fa-door-open" },
        { name: "Industrial Scale", volume: 1.2, weight: 150, icon: "fas fa-balance-scale" },
        { name: "Compressor Unit", volume: 3.0, weight: 280, icon: "fas fa-fan" },
        { name: "Generator", volume: 4.5, weight: 450, icon: "fas fa-bolt" },
        { name: "Vending Machine", volume: 2.8, weight: 320, icon: "fas fa-square-full" }
    ]
};

const truckData = [
    { type: "Panel Van", maxVolume: 6, maxWeight: 1500, icon: "🚐", image: "../visuals/Trucks/Panel Van.png", cssClass: "panel-van", baseCost: 150 },
    { type: "Cargo Van", maxVolume: 10, maxWeight: 2500, icon: "🚚", image: "../visuals/Trucks/Cargo Van.png", cssClass: "cargo-van", baseCost: 200 },
    { type: "10-ft Truck", maxVolume: 15, maxWeight: 4000, icon: "🚛", image: "../visuals/Trucks/10ft.png", cssClass: "small-truck", baseCost: 280 },
    { type: "15-ft Truck", maxVolume: 25, maxWeight: 6000, icon: "🚛", image: "../visuals/Trucks/15ft.png", cssClass: "small-truck", baseCost: 380 },
    { type: "20-ft Truck", maxVolume: 35, maxWeight: 8000, icon: "🚛", image: "../visuals/Trucks/20ft.png", cssClass: "medium-truck", baseCost: 480 },
    { type: "26-ft Truck", maxVolume: 50, maxWeight: 12000, icon: "🚛", image: "../visuals/Trucks/26ft.png", cssClass: "medium-truck", baseCost: 650 },
    { type: "28-ft Truck", maxVolume: 60, maxWeight: 15000, icon: "🚛", image: "../visuals/Trucks/28ft.png", cssClass: "large-truck", baseCost: 750 },
    { type: "40-ft Container", maxVolume: 75, maxWeight: 20000, icon: "🏗️", image: "../visuals/Trucks/40ft.png", cssClass: "container", baseCost: 950 },
    { type: "48-ft Trailer", maxVolume: 90, maxWeight: 25000, icon: "🚛", image: "../visuals/Trucks/48ft.png", cssClass: "trailer", baseCost: 1200 },
    { type: "53-ft Trailer", maxVolume: 110, maxWeight: 30000, icon: "🚛", image: "../visuals/Trucks/53ft.png", cssClass: "trailer", baseCost: 1500 }
];

// Add location and tax data after the truckData section
const locationData = {
    // Major Canadian Cities with Province/Territory
    "Toronto, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Montreal, QC": { province: "Quebec", taxRate: 14.975, type: "GST+QST" },
    "Vancouver, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Calgary, AB": { province: "Alberta", taxRate: 5, type: "GST" },
    "Edmonton, AB": { province: "Alberta", taxRate: 5, type: "GST" },
    "Ottawa, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Winnipeg, MB": { province: "Manitoba", taxRate: 12, type: "GST+PST" },
    "Quebec City, QC": { province: "Quebec", taxRate: 14.975, type: "GST+QST" },
    "Hamilton, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Kitchener, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "London, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Victoria, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Halifax, NS": { province: "Nova Scotia", taxRate: 14, type: "HST" },
    "Oshawa, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Windsor, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Saskatoon, SK": { province: "Saskatchewan", taxRate: 11, type: "GST+PST" },
    "Regina, SK": { province: "Saskatchewan", taxRate: 11, type: "GST+PST" },
    "St. John's, NL": { province: "Newfoundland & Labrador", taxRate: 15, type: "HST" },
    "Fredericton, NB": { province: "New Brunswick", taxRate: 15, type: "HST" },
    "Moncton, NB": { province: "New Brunswick", taxRate: 15, type: "HST" },
    "Charlottetown, PE": { province: "Prince Edward Island", taxRate: 15, type: "HST" },
    "Yellowknife, NT": { province: "Northwest Territories", taxRate: 5, type: "GST" },
    "Whitehorse, YT": { province: "Yukon", taxRate: 5, type: "GST" },
    "Iqaluit, NU": { province: "Nunavut", taxRate: 5, type: "GST" },
    
    // Additional major cities
    "Mississauga, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Brampton, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Surrey, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Laval, QC": { province: "Quebec", taxRate: 14.975, type: "GST+QST" },
    "Markham, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Vaughan, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Gatineau, QC": { province: "Quebec", taxRate: 14.975, type: "GST+QST" },
    "Longueuil, QC": { province: "Quebec", taxRate: 14.975, type: "GST+QST" },
    "Burnaby, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Richmond, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Richmond Hill, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Oakville, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Burlington, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Sherbrooke, QC": { province: "Quebec", taxRate: 14.975, type: "GST+QST" },
    "Saguenay, QC": { province: "Quebec", taxRate: 14.975, type: "GST+QST" },
    "Lévis, QC": { province: "Quebec", taxRate: 14.975, type: "GST+QST" },
    "Barrie, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Abbotsford, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Coquitlam, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "St. Catharines, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Trois-Rivières, QC": { province: "Quebec", taxRate: 14.975, type: "GST+QST" },
    "Guelph, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Kingston, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Kelowna, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Thunder Bay, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Sudbury, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Waterloo, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Cambridge, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Chatham, ON": { province: "Ontario", taxRate: 13, type: "HST" },
    "Red Deer, AB": { province: "Alberta", taxRate: 5, type: "GST" },
    "Lethbridge, AB": { province: "Alberta", taxRate: 5, type: "GST" },
    "Kamloops, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Nanaimo, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Prince George, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Vernon, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Chilliwack, BC": { province: "British Columbia", taxRate: 12, type: "GST+PST" },
    "Brandon, MB": { province: "Manitoba", taxRate: 12, type: "GST+PST" },
    "Steinbach, MB": { province: "Manitoba", taxRate: 12, type: "GST+PST" },
    "Portage la Prairie, MB": { province: "Manitoba", taxRate: 12, type: "GST+PST" },
    "Moose Jaw, SK": { province: "Saskatchewan", taxRate: 11, type: "GST+PST" },
    "Prince Albert, SK": { province: "Saskatchewan", taxRate: 11, type: "GST+PST" },
    "Medicine Hat, AB": { province: "Alberta", taxRate: 5, type: "GST" },
    "Grande Prairie, AB": { province: "Alberta", taxRate: 5, type: "GST" },
    "Airdrie, AB": { province: "Alberta", taxRate: 5, type: "GST" },
    "Spruce Grove, AB": { province: "Alberta", taxRate: 5, type: "GST" },
    "Leduc, AB": { province: "Alberta", taxRate: 5, type: "GST" },
    "Lloydminster, AB/SK": { province: "Alberta/Saskatchewan", taxRate: 8, type: "Mixed" }, // Special border city
    "Saint John, NB": { province: "New Brunswick", taxRate: 15, type: "HST" },
    "Dieppe, NB": { province: "New Brunswick", taxRate: 15, type: "HST" },
    "Riverview, NB": { province: "New Brunswick", taxRate: 15, type: "HST" },
    "Bathurst, NB": { province: "New Brunswick", taxRate: 15, type: "HST" },
    "Edmundston, NB": { province: "New Brunswick", taxRate: 15, type: "HST" },
    "Miramichi, NB": { province: "New Brunswick", taxRate: 15, type: "HST" },
    "Campbellton, NB": { province: "New Brunswick", taxRate: 15, type: "HST" },
    "Summerside, PE": { province: "Prince Edward Island", taxRate: 15, type: "HST" },
    "Stratford, PE": { province: "Prince Edward Island", taxRate: 15, type: "HST" },
    "Cornwall, PE": { province: "Prince Edward Island", taxRate: 15, type: "HST" },
    "Sydney, NS": { province: "Nova Scotia", taxRate: 14, type: "HST" },
    "Dartmouth, NS": { province: "Nova Scotia", taxRate: 14, type: "HST" },
    "Bedford, NS": { province: "Nova Scotia", taxRate: 14, type: "HST" },
    "New Glasgow, NS": { province: "Nova Scotia", taxRate: 14, type: "HST" },
    "Truro, NS": { province: "Nova Scotia", taxRate: 14, type: "HST" },
    "Glace Bay, NS": { province: "Nova Scotia", taxRate: 14, type: "HST" },
    "Yarmouth, NS": { province: "Nova Scotia", taxRate: 14, type: "HST" },
    "Kentville, NS": { province: "Nova Scotia", taxRate: 14, type: "HST" },
    "Amherst, NS": { province: "Nova Scotia", taxRate: 14, type: "HST" },
    "Corner Brook, NL": { province: "Newfoundland & Labrador", taxRate: 15, type: "HST" },
    "Mount Pearl, NL": { province: "Newfoundland & Labrador", taxRate: 15, type: "HST" },
    "Conception Bay South, NL": { province: "Newfoundland & Labrador", taxRate: 15, type: "HST" },
    "Paradise, NL": { province: "Newfoundland & Labrador", taxRate: 15, type: "HST" },
    "Grand Falls-Windsor, NL": { province: "Newfoundland & Labrador", taxRate: 15, type: "HST" },
    "Gander, NL": { province: "Newfoundland & Labrador", taxRate: 15, type: "HST" },
    "Happy Valley-Goose Bay, NL": { province: "Newfoundland & Labrador", taxRate: 15, type: "HST" },
    "Labrador City, NL": { province: "Newfoundland & Labrador", taxRate: 15, type: "HST" },
    "Hay River, NT": { province: "Northwest Territories", taxRate: 5, type: "GST" },
    "Inuvik, NT": { province: "Northwest Territories", taxRate: 5, type: "GST" },
    "Fort Smith, NT": { province: "Northwest Territories", taxRate: 5, type: "GST" },
    "Dawson City, YT": { province: "Yukon", taxRate: 5, type: "GST" },
    "Watson Lake, YT": { province: "Yukon", taxRate: 5, type: "GST" },
    "Haines Junction, YT": { province: "Yukon", taxRate: 5, type: "GST" },
    "Rankin Inlet, NU": { province: "Nunavut", taxRate: 5, type: "GST" },
    "Arviat, NU": { province: "Nunavut", taxRate: 5, type: "GST" },
    "Baker Lake, NU": { province: "Nunavut", taxRate: 5, type: "GST" },
    "Igloolik, NU": { province: "Nunavut", taxRate: 5, type: "GST" }
};

// USA State Tax Database (2025 rates)
const usaLocationData = {
    // Alabama
    "Birmingham, AL": { state: "Alabama", taxRate: 9.43, type: "State+Local" },
    "Montgomery, AL": { state: "Alabama", taxRate: 9.43, type: "State+Local" },
    "Mobile, AL": { state: "Alabama", taxRate: 9.43, type: "State+Local" },
    "Huntsville, AL": { state: "Alabama", taxRate: 9.43, type: "State+Local" },
    
    // Alaska
    "Anchorage, AK": { state: "Alaska", taxRate: 1.82, type: "Local Only" },
    "Fairbanks, AK": { state: "Alaska", taxRate: 1.82, type: "Local Only" },
    "Juneau, AK": { state: "Alaska", taxRate: 1.82, type: "Local Only" },
    
    // Arizona
    "Phoenix, AZ": { state: "Arizona", taxRate: 8.41, type: "State+Local" },
    "Tucson, AZ": { state: "Arizona", taxRate: 8.41, type: "State+Local" },
    "Mesa, AZ": { state: "Arizona", taxRate: 8.41, type: "State+Local" },
    "Chandler, AZ": { state: "Arizona", taxRate: 8.41, type: "State+Local" },
    
    // Arkansas
    "Little Rock, AR": { state: "Arkansas", taxRate: 9.46, type: "State+Local" },
    "Fort Smith, AR": { state: "Arkansas", taxRate: 9.46, type: "State+Local" },
    "Fayetteville, AR": { state: "Arkansas", taxRate: 9.46, type: "State+Local" },
    
    // California
    "Los Angeles, CA": { state: "California", taxRate: 8.80, type: "State+Local" },
    "San Francisco, CA": { state: "California", taxRate: 8.80, type: "State+Local" },
    "San Diego, CA": { state: "California", taxRate: 8.80, type: "State+Local" },
    "Sacramento, CA": { state: "California", taxRate: 8.80, type: "State+Local" },
    "San Jose, CA": { state: "California", taxRate: 8.80, type: "State+Local" },
    
    // Colorado
    "Denver, CO": { state: "Colorado", taxRate: 7.86, type: "State+Local" },
    "Colorado Springs, CO": { state: "Colorado", taxRate: 7.86, type: "State+Local" },
    "Aurora, CO": { state: "Colorado", taxRate: 7.86, type: "State+Local" },
    
    // Connecticut
    "Hartford, CT": { state: "Connecticut", taxRate: 6.35, type: "State" },
    "New Haven, CT": { state: "Connecticut", taxRate: 6.35, type: "State" },
    "Bridgeport, CT": { state: "Connecticut", taxRate: 6.35, type: "State" },
    
    // Delaware
    "Wilmington, DE": { state: "Delaware", taxRate: 0, type: "No Sales Tax" },
    "Dover, DE": { state: "Delaware", taxRate: 0, type: "No Sales Tax" },
    
    // Florida
    "Miami, FL": { state: "Florida", taxRate: 6.95, type: "State+Local" },
    "Tampa, FL": { state: "Florida", taxRate: 6.95, type: "State+Local" },
    "Orlando, FL": { state: "Florida", taxRate: 6.95, type: "State+Local" },
    "Jacksonville, FL": { state: "Florida", taxRate: 6.95, type: "State+Local" },
    
    // Georgia
    "Atlanta, GA": { state: "Georgia", taxRate: 7.42, type: "State+Local" },
    "Augusta, GA": { state: "Georgia", taxRate: 7.42, type: "State+Local" },
    "Columbus, GA": { state: "Georgia", taxRate: 7.42, type: "State+Local" },
    "Savannah, GA": { state: "Georgia", taxRate: 7.42, type: "State+Local" },
    
    // Hawaii
    "Honolulu, HI": { state: "Hawaii", taxRate: 4.50, type: "State+Local" },
    "Hilo, HI": { state: "Hawaii", taxRate: 4.50, type: "State+Local" },
    
    // Idaho
    "Boise, ID": { state: "Idaho", taxRate: 6.03, type: "State+Local" },
    "Nampa, ID": { state: "Idaho", taxRate: 6.03, type: "State+Local" },
    "Meridian, ID": { state: "Idaho", taxRate: 6.03, type: "State+Local" },
    
    // Illinois
    "Chicago, IL": { state: "Illinois", taxRate: 8.89, type: "State+Local" },
    "Aurora, IL": { state: "Illinois", taxRate: 8.89, type: "State+Local" },
    "Springfield, IL": { state: "Illinois", taxRate: 8.89, type: "State+Local" },
    
    // Indiana
    "Indianapolis, IN": { state: "Indiana", taxRate: 7.00, type: "State" },
    "Fort Wayne, IN": { state: "Indiana", taxRate: 7.00, type: "State" },
    "Evansville, IN": { state: "Indiana", taxRate: 7.00, type: "State" },
    
    // Iowa
    "Des Moines, IA": { state: "Iowa", taxRate: 6.94, type: "State+Local" },
    "Cedar Rapids, IA": { state: "Iowa", taxRate: 6.94, type: "State+Local" },
    "Davenport, IA": { state: "Iowa", taxRate: 6.94, type: "State+Local" },
    
    // Kansas
    "Wichita, KS": { state: "Kansas", taxRate: 8.77, type: "State+Local" },
    "Overland Park, KS": { state: "Kansas", taxRate: 8.77, type: "State+Local" },
    "Kansas City, KS": { state: "Kansas", taxRate: 8.77, type: "State+Local" },
    "Topeka, KS": { state: "Kansas", taxRate: 8.77, type: "State+Local" },
    
    // Kentucky
    "Louisville, KY": { state: "Kentucky", taxRate: 6.00, type: "State" },
    "Lexington, KY": { state: "Kentucky", taxRate: 6.00, type: "State" },
    "Bowling Green, KY": { state: "Kentucky", taxRate: 6.00, type: "State" },
    
    // Louisiana
    "New Orleans, LA": { state: "Louisiana", taxRate: 10.12, type: "State+Local" },
    "Baton Rouge, LA": { state: "Louisiana", taxRate: 10.12, type: "State+Local" },
    "Shreveport, LA": { state: "Louisiana", taxRate: 10.12, type: "State+Local" },
    
    // Maine
    "Portland, ME": { state: "Maine", taxRate: 5.50, type: "State" },
    "Lewiston, ME": { state: "Maine", taxRate: 5.50, type: "State" },
    "Bangor, ME": { state: "Maine", taxRate: 5.50, type: "State" },
    
    // Maryland
    "Baltimore, MD": { state: "Maryland", taxRate: 6.00, type: "State" },
    "Frederick, MD": { state: "Maryland", taxRate: 6.00, type: "State" },
    "Rockville, MD": { state: "Maryland", taxRate: 6.00, type: "State" },
    
    // Massachusetts
    "Boston, MA": { state: "Massachusetts", taxRate: 6.25, type: "State" },
    "Worcester, MA": { state: "Massachusetts", taxRate: 6.25, type: "State" },
    "Springfield, MA": { state: "Massachusetts", taxRate: 6.25, type: "State" },
    
    // Michigan
    "Detroit, MI": { state: "Michigan", taxRate: 6.00, type: "State" },
    "Grand Rapids, MI": { state: "Michigan", taxRate: 6.00, type: "State" },
    "Warren, MI": { state: "Michigan", taxRate: 6.00, type: "State" },
    
    // Minnesota
    "Minneapolis, MN": { state: "Minnesota", taxRate: 8.13, type: "State+Local" },
    "Saint Paul, MN": { state: "Minnesota", taxRate: 8.13, type: "State+Local" },
    "Rochester, MN": { state: "Minnesota", taxRate: 8.13, type: "State+Local" },
    
    // Mississippi
    "Jackson, MS": { state: "Mississippi", taxRate: 7.06, type: "State+Local" },
    "Gulfport, MS": { state: "Mississippi", taxRate: 7.06, type: "State+Local" },
    "Southaven, MS": { state: "Mississippi", taxRate: 7.06, type: "State+Local" },
    
    // Missouri
    "Kansas City, MO": { state: "Missouri", taxRate: 8.41, type: "State+Local" },
    "Saint Louis, MO": { state: "Missouri", taxRate: 8.41, type: "State+Local" },
    "Springfield, MO": { state: "Missouri", taxRate: 8.41, type: "State+Local" },
    
    // Montana
    "Billings, MT": { state: "Montana", taxRate: 0, type: "No Sales Tax" },
    "Missoula, MT": { state: "Montana", taxRate: 0, type: "No Sales Tax" },
    "Great Falls, MT": { state: "Montana", taxRate: 0, type: "No Sales Tax" },
    
    // Nebraska
    "Omaha, NE": { state: "Nebraska", taxRate: 6.97, type: "State+Local" },
    "Lincoln, NE": { state: "Nebraska", taxRate: 6.97, type: "State+Local" },
    "Bellevue, NE": { state: "Nebraska", taxRate: 6.97, type: "State+Local" },
    
    // Nevada
    "Las Vegas, NV": { state: "Nevada", taxRate: 8.24, type: "State+Local" },
    "Henderson, NV": { state: "Nevada", taxRate: 8.24, type: "State+Local" },
    "Reno, NV": { state: "Nevada", taxRate: 8.24, type: "State+Local" },
    
    // New Hampshire
    "Manchester, NH": { state: "New Hampshire", taxRate: 0, type: "No Sales Tax" },
    "Nashua, NH": { state: "New Hampshire", taxRate: 0, type: "No Sales Tax" },
    "Concord, NH": { state: "New Hampshire", taxRate: 0, type: "No Sales Tax" },
    
    // New Jersey
    "Newark, NJ": { state: "New Jersey", taxRate: 6.60, type: "State" },
    "Jersey City, NJ": { state: "New Jersey", taxRate: 6.60, type: "State" },
    "Paterson, NJ": { state: "New Jersey", taxRate: 6.60, type: "State" },
    
    // New Mexico
    "Albuquerque, NM": { state: "New Mexico", taxRate: 7.63, type: "State+Local" },
    "Las Cruces, NM": { state: "New Mexico", taxRate: 7.63, type: "State+Local" },
    "Rio Rancho, NM": { state: "New Mexico", taxRate: 7.63, type: "State+Local" },
    
    // New York
    "New York, NY": { state: "New York", taxRate: 8.53, type: "State+Local" },
    "Buffalo, NY": { state: "New York", taxRate: 8.53, type: "State+Local" },
    "Rochester, NY": { state: "New York", taxRate: 8.53, type: "State+Local" },
    "Albany, NY": { state: "New York", taxRate: 8.53, type: "State+Local" },
    
    // North Carolina
    "Charlotte, NC": { state: "North Carolina", taxRate: 7.00, type: "State+Local" },
    "Raleigh, NC": { state: "North Carolina", taxRate: 7.00, type: "State+Local" },
    "Greensboro, NC": { state: "North Carolina", taxRate: 7.00, type: "State+Local" },
    
    // North Dakota
    "Fargo, ND": { state: "North Dakota", taxRate: 7.05, type: "State+Local" },
    "Bismarck, ND": { state: "North Dakota", taxRate: 7.05, type: "State+Local" },
    "Grand Forks, ND": { state: "North Dakota", taxRate: 7.05, type: "State+Local" },
    
    // Ohio
    "Columbus, OH": { state: "Ohio", taxRate: 7.23, type: "State+Local" },
    "Cleveland, OH": { state: "Ohio", taxRate: 7.23, type: "State+Local" },
    "Cincinnati, OH": { state: "Ohio", taxRate: 7.23, type: "State+Local" },
    
    // Oklahoma
    "Oklahoma City, OK": { state: "Oklahoma", taxRate: 9.01, type: "State+Local" },
    "Tulsa, OK": { state: "Oklahoma", taxRate: 9.01, type: "State+Local" },
    "Norman, OK": { state: "Oklahoma", taxRate: 9.01, type: "State+Local" },
    
    // Oregon
    "Portland, OR": { state: "Oregon", taxRate: 0, type: "No Sales Tax" },
    "Eugene, OR": { state: "Oregon", taxRate: 0, type: "No Sales Tax" },
    "Salem, OR": { state: "Oregon", taxRate: 0, type: "No Sales Tax" },
    
    // Pennsylvania
    "Philadelphia, PA": { state: "Pennsylvania", taxRate: 6.34, type: "State+Local" },
    "Pittsburgh, PA": { state: "Pennsylvania", taxRate: 6.34, type: "State+Local" },
    "Allentown, PA": { state: "Pennsylvania", taxRate: 6.34, type: "State+Local" },
    
    // Rhode Island
    "Providence, RI": { state: "Rhode Island", taxRate: 7.00, type: "State" },
    "Warwick, RI": { state: "Rhode Island", taxRate: 7.00, type: "State" },
    "Cranston, RI": { state: "Rhode Island", taxRate: 7.00, type: "State" },
    
    // South Carolina
    "Columbia, SC": { state: "South Carolina", taxRate: 7.50, type: "State+Local" },
    "Charleston, SC": { state: "South Carolina", taxRate: 7.50, type: "State+Local" },
    "North Charleston, SC": { state: "South Carolina", taxRate: 7.50, type: "State+Local" },
    
    // South Dakota
    "Sioux Falls, SD": { state: "South Dakota", taxRate: 6.11, type: "State+Local" },
    "Rapid City, SD": { state: "South Dakota", taxRate: 6.11, type: "State+Local" },
    "Aberdeen, SD": { state: "South Dakota", taxRate: 6.11, type: "State+Local" },
    
    // Tennessee
    "Nashville, TN": { state: "Tennessee", taxRate: 9.56, type: "State+Local" },
    "Memphis, TN": { state: "Tennessee", taxRate: 9.56, type: "State+Local" },
    "Knoxville, TN": { state: "Tennessee", taxRate: 9.56, type: "State+Local" },
    
    // Texas
    "Houston, TX": { state: "Texas", taxRate: 8.20, type: "State+Local" },
    "San Antonio, TX": { state: "Texas", taxRate: 8.20, type: "State+Local" },
    "Dallas, TX": { state: "Texas", taxRate: 8.20, type: "State+Local" },
    "Austin, TX": { state: "Texas", taxRate: 8.20, type: "State+Local" },
    "Fort Worth, TX": { state: "Texas", taxRate: 8.20, type: "State+Local" },
    
    // Utah
    "Salt Lake City, UT": { state: "Utah", taxRate: 7.32, type: "State+Local" },
    "West Valley City, UT": { state: "Utah", taxRate: 7.32, type: "State+Local" },
    "Provo, UT": { state: "Utah", taxRate: 7.32, type: "State+Local" },
    
    // Vermont
    "Burlington, VT": { state: "Vermont", taxRate: 6.37, type: "State+Local" },
    "Essex, VT": { state: "Vermont", taxRate: 6.37, type: "State+Local" },
    "South Burlington, VT": { state: "Vermont", taxRate: 6.37, type: "State+Local" },
    
    // Virginia
    "Virginia Beach, VA": { state: "Virginia", taxRate: 5.77, type: "State+Local" },
    "Norfolk, VA": { state: "Virginia", taxRate: 5.77, type: "State+Local" },
    "Chesapeake, VA": { state: "Virginia", taxRate: 5.77, type: "State+Local" },
    "Richmond, VA": { state: "Virginia", taxRate: 5.77, type: "State+Local" },
    
    // Washington
    "Seattle, WA": { state: "Washington", taxRate: 9.43, type: "State+Local" },
    "Spokane, WA": { state: "Washington", taxRate: 9.43, type: "State+Local" },
    "Tacoma, WA": { state: "Washington", taxRate: 9.43, type: "State+Local" },
    
    // West Virginia
    "Charleston, WV": { state: "West Virginia", taxRate: 6.57, type: "State+Local" },
    "Huntington, WV": { state: "West Virginia", taxRate: 6.57, type: "State+Local" },
    "Parkersburg, WV": { state: "West Virginia", taxRate: 6.57, type: "State+Local" },
    
    // Wisconsin
    "Milwaukee, WI": { state: "Wisconsin", taxRate: 5.70, type: "State+Local" },
    "Madison, WI": { state: "Wisconsin", taxRate: 5.70, type: "State+Local" },
    "Green Bay, WI": { state: "Wisconsin", taxRate: 5.70, type: "State+Local" },
    
    // Wyoming
    "Cheyenne, WY": { state: "Wyoming", taxRate: 5.44, type: "State+Local" },
    "Casper, WY": { state: "Wyoming", taxRate: 5.44, type: "State+Local" },
    "Laramie, WY": { state: "Wyoming", taxRate: 5.44, type: "State+Local" },
    
    // Washington DC
    "Washington, DC": { state: "District of Columbia", taxRate: 6.00, type: "District" }
};

// Standard Moving Box Sizes (USA/Canada)
const boxData = [
    { 
        name: "Small Box", 
        dimensions: "16×12×12 inches", 
        volume: 0.032, // m³
        maxWeight: 50, // lbs
        cost: 2.50,
        bestFor: ["books", "documents", "small items"],
        icon: "📦"
    },
    { 
        name: "Medium Box", 
        dimensions: "18×14×12 inches", 
        volume: 0.052, // m³
        maxWeight: 60,
        cost: 3.25,
        bestFor: ["kitchen items", "electronics", "toys"],
        icon: "📦"
    },
    { 
        name: "Large Box", 
        dimensions: "18×18×16 inches", 
        volume: 0.083, // m³
        maxWeight: 70,
        cost: 4.50,
        bestFor: ["linens", "pillows", "lampshades"],
        icon: "📦"
    },
    { 
        name: "Extra Large Box", 
        dimensions: "24×18×18 inches", 
        volume: 0.156, // m³
        maxWeight: 70,
        cost: 6.75,
        bestFor: ["comforters", "large linens", "light bulky items"],
        icon: "📦"
    },
    { 
        name: "Wardrobe Box", 
        dimensions: "24×21×46 inches", 
        volume: 0.486, // m³
        maxWeight: 100,
        cost: 12.50,
        bestFor: ["hanging clothes", "suits", "dresses"],
        icon: "👔"
    },
    { 
        name: "Mirror/Picture Box", 
        dimensions: "40×60×4 inches", 
        volume: 0.157, // m³
        maxWeight: 75,
        cost: 15.75,
        bestFor: ["mirrors", "pictures", "artwork", "flat screen TVs"],
        icon: "🖼️"
    }
];

// Special Protection Materials
const protectionMaterials = [
    {
        name: "Mattress Cover",
        type: "cover",
        cost: 8.50,
        bestFor: ["mattress", "bed"],
        icon: "🛏️",
        description: "Plastic cover for mattresses"
    },
    {
        name: "Furniture Blanket",
        type: "blanket", 
        cost: 12.00,
        bestFor: ["furniture", "dresser", "table", "sofa", "chair"],
        icon: "🧥",
        description: "Padded blanket for furniture"
    },
    {
        name: "Bubble Wrap (Roll)",
        type: "wrap",
        cost: 15.75,
        bestFor: ["electronics", "computer", "tv", "monitor", "printer"],
        icon: "🫧",
        description: "Protective bubble wrap"
    },
    {
        name: "Appliance Dolly",
        type: "equipment",
        cost: 25.00,
        bestFor: ["refrigerator", "washing machine", "dryer", "freezer"],
        icon: "🛒",
        description: "Special dolly for appliances"
    },
    {
        name: "Piano Board",
        type: "equipment",
        cost: 45.00,
        bestFor: ["piano"],
        icon: "🎹",
        description: "Professional piano moving board"
    },
    {
        name: "Safe Moving Straps",
        type: "equipment",
        cost: 35.00,
        bestFor: ["safe"],
        icon: "🔒",
        description: "Heavy-duty straps for safes"
    },
    {
        name: "Artwork Crating",
        type: "crate",
        cost: 65.00,
        bestFor: ["artwork", "mirror", "picture"],
        icon: "🎨",
        description: "Custom wooden crate"
    },
    {
        name: "Stretch Wrap",
        type: "wrap",
        cost: 8.25,
        bestFor: ["boxes", "general"],
        icon: "📦",
        description: "Plastic stretch wrap"
    }
];

// Special Handling Items (Extra Labor Charges)
const specialHandlingItems = {
    "Grand Piano": { fee: 350, reason: "Requires 4+ movers and special equipment" },
    "Safe": { fee: 200, reason: "Heavy item requiring special handling" },
    "Pool Table": { fee: 275, reason: "Disassembly/reassembly required" },
    "Treadmill": { fee: 125, reason: "Heavy exercise equipment" },
    "Hot Tub": { fee: 450, reason: "Crane or special equipment needed" },
    "Refrigerator": { fee: 75, reason: "Appliance preparation and care" },
    "Washing Machine": { fee: 65, reason: "Water line disconnection/connection" },
    "Dryer": { fee: 55, reason: "Gas/electric disconnection" },
    "Grandfather Clock": { fee: 150, reason: "Delicate antique handling" },
    "Chandelier": { fee: 100, reason: "Careful dismounting/mounting" },
    "Large Mirror": { fee: 85, reason: "Fragile large item" },
    "Wine Fridge": { fee: 95, reason: "Temperature-sensitive appliance" }
};

// Packing service options
const packingOptions = {
    self: { 
        name: "Self Packing", 
        description: "Customer packs their own items",
        costMultiplier: 0,
        timeMultiplier: 0
    },
    partial: { 
        name: "Partial Packing", 
        description: "We pack fragile & valuable items only",
        costMultiplier: 0.25,
        timeMultiplier: 0.5
    },
    full: { 
        name: "Full Service Packing", 
        description: "We pack everything for you",
        costMultiplier: 0.6,
        timeMultiplier: 1.2
    }
};

// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth();
    
    // Initialize UI components
    initializeSidebar();
    initializeUserDropdown();
    initializeLogout();
    
    // Initialize map
    initializeOptimizerMap();
    
    // Set up event listeners
    setupRouteOptimizer();
});

// Authentication check
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Display user info if available
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userName) {
        document.getElementById('user-name').textContent = userName;
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            userAvatar.textContent = userName.charAt(0);
        }
    }
}

// Sidebar toggle functionality
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggle-sidebar');
    const toggleIcon = toggleButton.querySelector('i');
    
    toggleButton.addEventListener('click', function() {
        sidebar.classList.toggle('sidebar-collapsed');
        
        // Change the direction of the toggle icon
        if (sidebar.classList.contains('sidebar-collapsed')) {
            toggleIcon.classList.remove('fa-chevron-left');
            toggleIcon.classList.add('fa-chevron-right');
        } else {
            toggleIcon.classList.remove('fa-chevron-right');
            toggleIcon.classList.add('fa-chevron-left');
        }
    });
}

// User dropdown functionality
function initializeUserDropdown() {
    const dropdownToggle = document.getElementById('user-dropdown-toggle');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
        });
    }
}

// Logout functionality
function initializeLogout() {
    const logoutLink = document.getElementById('logout-link');
    const dropdownLogout = document.getElementById('dropdown-logout');
    
    const logoutFunction = function(e) {
        e.preventDefault();
        
        // Clear login state
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        // Redirect to login page
        window.location.href = 'login.html';
    };
    
    if (logoutLink) {
        logoutLink.addEventListener('click', logoutFunction);
    }
    
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', logoutFunction);
    }
}

// Map variables
let optimizerMap;
let routeControl;
let trafficLayer;
let incidentMarker;

// Initialize the optimizer map
function initializeOptimizerMap() {
    const mapContainer = document.getElementById('optimizer-map');
    if (!mapContainer) return;
    
    // Default coordinates (Bangalore downtown area)
    const defaultCenter = [12.9716, 77.5946];
    const defaultZoom = 13;
    
    // Create map instance
    optimizerMap = L.map('optimizer-map').setView(defaultCenter, defaultZoom);
    
    // Add tile layer (Thunderforest Transport for better road networks)
    L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38', {
        attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(optimizerMap);
    
    // Add OpenStreetMap as an alternative layer
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    });
    
    // Create layer control
    const baseMaps = {
        "Transport": L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38'),
        "OpenStreetMap": osmLayer
    };
    
    L.control.layers(baseMaps, {}).addTo(optimizerMap);
    
    // Add traffic overlay
    trafficLayer = addTrafficLayer(optimizerMap);
}

// Add traffic overlay to visualize congestion
function addTrafficLayer(map) {
    // Create simulated traffic congestion
    const trafficOverlay = L.layerGroup().addTo(map);
    
    // Bangalore major roads with simulated traffic
    
    // Major roads with heavy traffic (red lines)
    const heavyTrafficRoads = [
        // Outer Ring Road section
        [[12.9716, 77.5946], [12.9580, 77.6100]],
        // MG Road area
        [[12.9719, 77.6200], [12.9750, 77.6350]],
        // Whitefield connection
        [[12.9700, 77.6900], [12.9750, 77.7100]]
    ];
    
    // Secondary roads with moderate traffic (orange lines)
    const moderateTrafficRoads = [
        // Indiranagar area
        [[12.9719, 77.6412], [12.9780, 77.6500]],
        // Koramangala connection
        [[12.9352, 77.6245], [12.9400, 77.6300]],
        // JP Nagar area
        [[12.9100, 77.5950], [12.9180, 77.6000]]
    ];
    
    // Roads with light traffic (green lines)
    const lightTrafficRoads = [
        // Various smaller streets
        [[12.9716, 77.5946], [12.9750, 77.6000]],
        [[12.9500, 77.6100], [12.9550, 77.6180]],
        [[12.9300, 77.6200], [12.9350, 77.6270]]
    ];
    
    // Add traffic lines to the map
    heavyTrafficRoads.forEach(road => {
        L.polyline(road, {
            color: 'red',
            weight: 8,
            opacity: 0.7
        }).addTo(trafficOverlay);
    });
    
    moderateTrafficRoads.forEach(road => {
        L.polyline(road, {
            color: 'orange',
            weight: 6,
            opacity: 0.7
        }).addTo(trafficOverlay);
    });
    
    lightTrafficRoads.forEach(road => {
        L.polyline(road, {
            color: 'green',
            weight: 5,
            opacity: 0.7
        }).addTo(trafficOverlay);
    });
    
    return trafficOverlay;
}

// Set up route optimizer functionality
function setupRouteOptimizer() {
    const optimizeButton = document.getElementById('optimize-route-btn');
    const resetButton = document.getElementById('reset-route-btn');
    const trafficCondition = document.getElementById('traffic-condition');
    const aiModel = document.getElementById('ai-model');
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    
    // Sample locations for demonstration purposes
    const sampleLocations = {
        "Majestic Bus Station": [12.9767, 77.5713],
        "Electronic City": [12.8399, 77.6770],
        "Manyata Tech Park": [13.0437, 77.6229],
        "Whitefield": [12.9698, 77.7499],
        "Koramangala": [12.9352, 77.6245],
        "Indiranagar": [12.9719, 77.6412],
        "MG Road": [12.9719, 77.6200],
        "Bannerghatta Road": [12.8995, 77.5968],
        "Hebbal": [13.0358, 77.5970],
        "Airport": [13.1989, 77.7068],
        "Silk Board": [12.9170, 77.6230]
    };
    
    // Add sample location input suggestions
    originInput.addEventListener('input', function() {
        suggestLocations(originInput, sampleLocations);
    });
    
    destinationInput.addEventListener('input', function() {
        suggestLocations(destinationInput, sampleLocations);
    });
    
    // Optimize route
    if (optimizeButton) {
        optimizeButton.addEventListener('click', function() {
            const origin = originInput.value;
            const destination = destinationInput.value;
            
            if (!origin || !destination) {
                alert('Please enter both origin and destination locations');
                return;
            }
            
            // Get coordinates for locations
            const originCoords = getLocationCoords(origin, sampleLocations);
            const destCoords = getLocationCoords(destination, sampleLocations);
            
            if (!originCoords || !destCoords) {
                alert('Location not found. Please enter a valid location.');
                return;
            }
            
            // Create route
            createRoute(originCoords, destCoords, trafficCondition.value, aiModel.value);
        });
    }
    
    // Reset route
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            resetRoute();
            document.getElementById('route-results').style.display = 'none';
            originInput.value = '';
            destinationInput.value = '';
        });
    }
}

// Suggest locations as user types
function suggestLocations(input, locations) {
    const inputValue = input.value.toLowerCase();
    
    // If input is empty, don't suggest
    if (!inputValue) return;
    
    // Find matching locations
    const matches = Object.keys(locations).filter(loc => 
        loc.toLowerCase().includes(inputValue)
    );
    
    // If only one match and it exactly matches the input, don't suggest
    if (matches.length === 1 && matches[0].toLowerCase() === inputValue) return;
    
    // Create or update datalist for suggestions
    let datalist = document.getElementById(`${input.id}-suggestions`);
    
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = `${input.id}-suggestions`;
        document.body.appendChild(datalist);
        input.setAttribute('list', datalist.id);
    }
    
    // Clear existing options
    datalist.innerHTML = '';
    
    // Add new options
    matches.forEach(match => {
        const option = document.createElement('option');
        option.value = match;
        datalist.appendChild(option);
    });
}

// Get coordinates for a location name
function getLocationCoords(locationName, locations) {
    for (const [name, coords] of Object.entries(locations)) {
        if (name.toLowerCase() === locationName.toLowerCase()) {
            return coords;
        }
    }
    
    // If not found, try to find partial matches
    for (const [name, coords] of Object.entries(locations)) {
        if (name.toLowerCase().includes(locationName.toLowerCase())) {
            return coords;
        }
    }
    
    return null;
}

// Create route on the map
function createRoute(origin, destination, trafficCondition, aiModel) {
    // Clear existing route
    resetRoute();
    
    // Add markers for origin and destination
    const originMarker = L.marker(origin, {
        icon: L.divIcon({
            className: 'custom-marker origin-marker',
            html: '<i class="fas fa-map-marker-alt"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        })
    }).addTo(optimizerMap);
    
    const destMarker = L.marker(destination, {
        icon: L.divIcon({
            className: 'custom-marker destination-marker',
            html: '<i class="fas fa-flag-checkered"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        })
    }).addTo(optimizerMap);
    
    // Add standard route
    const standardRoute = L.Routing.control({
        waypoints: [
            L.latLng(origin),
            L.latLng(destination)
        ],
        routeWhileDragging: false,
        lineOptions: {
            styles: [
                {color: 'red', opacity: 0.7, weight: 5}
            ]
        },
        createMarker: function() { return null; }, // Don't create default markers
        addWaypoints: false,
        fitSelectedRoutes: true
    }).addTo(optimizerMap);
    
    // Simulate optimized route based on AI model and traffic condition
    setTimeout(() => {
        createOptimizedRoute(origin, destination, trafficCondition, aiModel);
    }, 1500);
}

// Create optimized route
function createOptimizedRoute(origin, destination, trafficCondition, aiModel) {
    // Create an alternate route that avoids traffic hotspots
    const midpoint = getAlternatePoint(origin, destination, trafficCondition);
    
    // Create alternate route with waypoint
    const optimizedRoute = L.Routing.control({
        waypoints: [
            L.latLng(origin),
            L.latLng(midpoint),
            L.latLng(destination)
        ],
        routeWhileDragging: false,
        lineOptions: {
            styles: [
                {color: 'green', opacity: 0.7, weight: 5}
            ]
        },
        createMarker: function() { return null; }, // Don't create default markers
        addWaypoints: false
    }).addTo(optimizerMap);
    
    // If traffic incident, add an incident marker
    if (trafficCondition === 'incident') {
        const incidentPoint = [
            (origin[0] + destination[0]) / 2,
            (origin[1] + destination[1]) / 2
        ];
        
        incidentMarker = L.marker(incidentPoint, {
            icon: L.divIcon({
                className: 'custom-marker incident-marker',
                html: '<i class="fas fa-exclamation-triangle"></i>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(optimizerMap);
    }
    
    // Display route results
    displayRouteResults(trafficCondition, aiModel);
}

// Get alternate midpoint based on traffic conditions
function getAlternatePoint(origin, destination, trafficCondition) {
    // Calculate a point that's slightly offset from the direct path
    const directLat = (origin[0] + destination[0]) / 2;
    const directLng = (origin[1] + destination[1]) / 2;
    
    // Create offset based on traffic condition
    let latOffset = 0.02;
    let lngOffset = 0.02;
    
    if (trafficCondition === 'congested') {
        latOffset = 0.03;
        lngOffset = 0.03;
    } else if (trafficCondition === 'incident') {
        latOffset = 0.04;
        lngOffset = 0.04;
    }
    
    // Randomly decide if offset should be positive or negative
    const latDir = Math.random() > 0.5 ? 1 : -1;
    const lngDir = Math.random() > 0.5 ? 1 : -1;
    
    return [
        directLat + (latOffset * latDir),
        directLng + (lngOffset * lngDir)
    ];
}

// Reset map and remove routes
function resetRoute() {
    if (optimizerMap) {
        // Remove routing controls
        optimizerMap.eachLayer(function(layer) {
            if (layer instanceof L.Routing.Control || 
                layer instanceof L.Marker) {
                optimizerMap.removeLayer(layer);
            }
        });
        
        // Reset incident marker
        if (incidentMarker) {
            optimizerMap.removeLayer(incidentMarker);
            incidentMarker = null;
        }
        
        // Re-add the base tile layer and traffic layer
        L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38', {
            attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(optimizerMap);
        
        if (!trafficLayer) {
            trafficLayer = addTrafficLayer(optimizerMap);
        }
    }
}

// Display route results
function displayRouteResults(trafficCondition, aiModel) {
    const resultsDiv = document.getElementById('route-results');
    const distanceElement = document.getElementById('route-distance');
    const timeElement = document.getElementById('route-time');
    const fuelSavedElement = document.getElementById('fuel-saved');
    
    if (resultsDiv && distanceElement && timeElement && fuelSavedElement) {
        // Generate some randomized values based on conditions
        let baseDistance = 8 + Math.random() * 10; // 8-18 km
        let baseTime = 15 + Math.random() * 25; // 15-40 minutes
        
        // Adjust based on traffic condition
        let timeFactor = 1;
        if (trafficCondition === 'congested') {
            timeFactor = 1.5;
        } else if (trafficCondition === 'incident') {
            timeFactor = 2;
        }
        
        // Adjust based on AI model
        let aiEfficiency = 0.1; // 10% improvement for basic
        if (aiModel === 'predictive') {
            aiEfficiency = 0.2; // 20% improvement
        } else if (aiModel === 'advanced') {
            aiEfficiency = 0.3; // 30% improvement
        }
        
        // Calculate optimized values
        const optimizedDistance = baseDistance * (1 - (aiEfficiency / 2)); // Distance improves less than time
        const optimizedTime = baseTime * timeFactor * (1 - aiEfficiency);
        const fuelSaved = Math.round(aiEfficiency * 100);
        
        // Display results
        distanceElement.textContent = optimizedDistance.toFixed(1) + ' km';
        timeElement.textContent = Math.round(optimizedTime) + ' min';
        fuelSavedElement.textContent = fuelSaved + '%';
        
        // Show results
        resultsDiv.style.display = 'block';
    }
}

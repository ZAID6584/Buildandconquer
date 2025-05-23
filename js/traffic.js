// Traffic Map and Routing Simulation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize maps when DOM is loaded
    initializeHeroMap();
    initializeTrafficMap();
    
    // Set up event listeners for the demo controls
    const simulateButton = document.getElementById('simulate-reroute');
    const resetButton = document.getElementById('reset-map');
    const trafficCondition = document.getElementById('traffic-condition');
    const aiModel = document.getElementById('ai-model');
    
    if (simulateButton) {
        simulateButton.addEventListener('click', function() {
            simulateRerouting(
                trafficCondition.value,
                aiModel.value
            );
        });
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            resetTrafficMap();
        });
    }
});

// Global variables for map instances
let heroMap, trafficMap;
let originalRoute, optimizedRoute;
let trafficLayer, incidentMarker;

// Default coordinates (Bangalore downtown area)
const defaultCenter = [12.9716, 77.5946];
const defaultZoom = 13;

// Initialize the hero section map
function initializeHeroMap() {
    const mapContainer = document.getElementById('hero-map');
    if (!mapContainer) return;
    
    // Create map instance
    heroMap = L.map('hero-map').setView(defaultCenter, defaultZoom);
    
    // Add tile layer (Thunderforest Transport for better road networks)
    L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38', {
        attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(heroMap);
    
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
    
    L.control.layers(baseMaps, {}).addTo(heroMap);
    
    // Add a static traffic overlay for visual effect
    addStaticTrafficLayer(heroMap);
    
    // Add sample routes
    setTimeout(() => {
        addSampleRoutes(heroMap);
    }, 500);
}

// Initialize the traffic demo map
function initializeTrafficMap() {
    const mapContainer = document.getElementById('traffic-map');
    if (!mapContainer) return;
    
    // Create map instance
    trafficMap = L.map('traffic-map').setView(defaultCenter, defaultZoom);
    
    // Add tile layer (Thunderforest Transport for better road networks)
    L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38', {
        attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(trafficMap);
    
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
    
    L.control.layers(baseMaps, {}).addTo(trafficMap);
    
    // Add a static traffic overlay for visual effect
    trafficLayer = addStaticTrafficLayer(trafficMap);
    
    // Initial routes
    addInitialRoutes();
}

// Add static traffic overlay to visualize congestion
function addStaticTrafficLayer(map) {
    // Create simulated traffic congestion
    const trafficOverlay = L.layerGroup().addTo(map);
    
    // Major roads with heavy traffic (red lines)
    const heavyTrafficRoads = [
        // Market Street
        [[37.7749, -122.4194], [37.7713, -122.4097]],
        // Van Ness Ave
        [[37.7749, -122.4194], [37.8025, -122.4258]],
        // Geary Blvd
        [[37.7829, -122.4432], [37.7814, -122.4073]]
    ];
    
    // Secondary roads with moderate traffic (orange lines)
    const moderateTrafficRoads = [
        // Mission St
        [[37.7749, -122.4194], [37.7647, -122.4198]],
        // Columbus Ave
        [[37.7749, -122.4194], [37.8045, -122.4107]],
        // Divisadero St
        [[37.7749, -122.4194], [37.7724, -122.4398]]
    ];
    
    // Roads with light traffic (green lines)
    const lightTrafficRoads = [
        // Various smaller streets
        [[37.7749, -122.4194], [37.7782, -122.4351]],
        [[37.7800, -122.4292], [37.7723, -122.4331]],
        [[37.7670, -122.4170], [37.7695, -122.4261]]
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

// Add some sample routes to the hero map for visualization
function addSampleRoutes(map) {
    // Bangalore landmarks
    const majesticBusStation = [12.9767, 77.5713]; // Kempegowda Bus Station (Majestic)
    const electronicCity = [12.8399, 77.6770]; // Electronic City
    const manyataEmbassy = [13.0437, 77.6229]; // Manyata Tech Park
    const whitefield = [12.9698, 77.7499]; // Whitefield
    const kormangala = [12.9352, 77.6245]; // Koramangala
    const indiranagar = [12.9719, 77.6412]; // Indiranagar
    
    // Original route (red) - Kormangala to Whitefield via heavy traffic area
    const originalRoutePath = [
        kormangala, // Start point
        [12.9433, 77.6300], // Intermediate points representing a route via
        [12.9550, 77.6400], // high traffic areas like Outer Ring Road
        [12.9600, 77.6600],
        [12.9650, 77.6900],
        [12.9680, 77.7200],
        whitefield // End point
    ];
    
    L.polyline(originalRoutePath, {
        color: 'red',
        weight: 4,
        dashArray: '10, 10',
        opacity: 0.7
    }).addTo(map);
    
    // AI optimized route (green) - Alternative route avoiding high traffic
    const optimizedRoutePath = [
        kormangala, // Start point
        [12.9433, 77.6350], // Different path via less congested roads
        [12.9500, 77.6500],
        [12.9550, 77.6800],
        [12.9650, 77.7100],
        [12.9700, 77.7300],
        whitefield // End point
    ];
    
    L.polyline(optimizedRoutePath, {
        color: 'green',
        weight: 4,
        opacity: 0.8
    }).addTo(map);
    
    // Add markers for start and end points
    L.marker(kormangala).addTo(map)
        .bindPopup('Koramangala (Start)')
        .openPopup();
    
    L.marker(whitefield).addTo(map)
        .bindPopup('Whitefield (Destination)');
    
    // Add some animated "vehicles" along both routes
    animateVehicles(map, originalRoutePath, 'red');
    animateVehicles(map, optimizedRoutePath, 'green');
    
    // Fit map to show the entire route
    const bounds = L.latLngBounds(originalRoutePath.concat(optimizedRoutePath));
    map.fitBounds(bounds, {
        padding: [50, 50]
    });
}

// Add initial routes to the traffic map
function addInitialRoutes() {
    if (!trafficMap) return;
    
    // Bangalore landmarks for our simulation
    const indiranagar = [12.9719, 77.6412]; // Origin
    const electronicCity = [12.8399, 77.6770]; // Destination
    
    // Add markers
    L.marker(indiranagar).addTo(trafficMap)
        .bindPopup('Indiranagar (Origin)')
        .openPopup();
    
    L.marker(electronicCity).addTo(trafficMap)
        .bindPopup('Electronic City (Destination)');
    
    // Original route via congested roads (via Koramangala and Silk Board)
    const originalRoutePath = [
        indiranagar, // Start point
        [12.9650, 77.6380], // Intermediate points
        [12.9600, 77.6350],
        [12.9500, 77.6320],
        [12.9352, 77.6245], // Koramangala
        [12.9179, 77.6326], // HSR Layout
        [12.9101, 77.6446], // Silk Board Junction (Major traffic bottleneck)
        [12.8901, 77.6479],
        [12.8750, 77.6610],
        [12.8550, 77.6690],
        electronicCity // End point
    ];
    
    // Draw original route
    originalRoute = L.polyline(originalRoutePath, {
        color: '#6c757d', // Gray
        weight: 5,
        opacity: 0.8
    }).addTo(trafficMap);
    
    // Initially, optimized route is the same
    optimizedRoute = L.polyline(originalRoutePath, {
        color: '#28a745', // Green
        weight: 5,
        opacity: 0,
        dashArray: '10, 10'
    }).addTo(trafficMap);
    
    // Fit map to show the entire route
    trafficMap.fitBounds(originalRoute.getBounds(), {
        padding: [50, 50]
    });
    
    // Add key traffic congestion points as tooltips
    L.circle([12.9352, 77.6245], { // Koramangala
        color: 'orange',
        fillColor: 'orange',
        fillOpacity: 0.3,
        radius: 300
    }).addTo(trafficMap).bindTooltip('Koramangala - Moderate Traffic');
    
    L.circle([12.9101, 77.6446], { // Silk Board
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.3,
        radius: 500
    }).addTo(trafficMap).bindTooltip('Silk Board Junction - Heavy Traffic');
}

// Simulate AI-based traffic rerouting
function simulateRerouting(trafficCondition, aiModel) {
    if (!trafficMap || !originalRoute || !optimizedRoute) return;
    
    // Remove previous incident marker if exists
    if (incidentMarker) {
        trafficMap.removeLayer(incidentMarker);
    }
    
    // Update traffic layer based on condition
    updateTrafficCondition(trafficCondition);
    
    // Calculate alternative route based on AI model and traffic condition
    const origin = originalRoute.getLatLngs()[0];
    const destination = originalRoute.getLatLngs()[originalRoute.getLatLngs().length - 1];
    
    let newRoute;
    let timeSaved;
    let aiDistance;
    let aiTime;
    
    // Get first point as origin and last point as destination
    const indiranagar = origin;
    const electronicCity = destination;
    
    switch (trafficCondition) {
        case 'normal':
            // Minor optimization in normal conditions - Slight route adjustment
            // Still goes via Koramangala but avoids Silk Board using internal roads
            newRoute = [
                indiranagar,
                [12.9650, 77.6380],
                [12.9600, 77.6350],
                [12.9500, 77.6320],
                [12.9352, 77.6245], // Koramangala
                [12.9179, 77.6326], // HSR Layout
                [12.9050, 77.6300], // Avoids Silk Board junction by taking internal roads
                [12.8950, 77.6350], // through HSR Layout and BTM Layout
                [12.8850, 77.6450],
                [12.8750, 77.6610],
                [12.8550, 77.6690],
                electronicCity
            ];
            timeSaved = aiModel === 'advanced' ? 15 : (aiModel === 'predictive' ? 10 : 5);
            aiDistance = 21.8; // km
            aiTime = 50; // minutes
            updateRouteStats(aiDistance, aiTime, 'Moderate', timeSaved);
            break;
            
        case 'congested':
            // More significant rerouting - Alternative route via Outer Ring Road
            // Completely avoids Silk Board Junction and Koramangala
            newRoute = [
                indiranagar,
                [12.9750, 77.6350], // Head north to ORR
                [12.9770, 77.6200], // Outer Ring Road
                [12.9750, 77.6000], // West along ORR
                [12.9600, 77.5850], // West along ORR near Marathahalli
                [12.9400, 77.5750], // South along ORR
                [12.9200, 77.5750], // South along ORR
                [12.9000, 77.5800], // South along ORR
                [12.8800, 77.6000], // East towards Sarjapur Road
                [12.8650, 77.6200], // East towards Electronic City
                [12.8550, 77.6500], // Approach Electronic City from west
                electronicCity
            ];
            timeSaved = aiModel === 'advanced' ? 35 : (aiModel === 'predictive' ? 25 : 18);
            aiDistance = 24.5; // km
            aiTime = 38; // minutes
            updateRouteStats(aiDistance, aiTime, 'Light', timeSaved);
            break;
            
        case 'incident':
            // Major rerouting due to incident at Silk Board Junction
            // Takes NICE Road and peripheral route
            newRoute = [
                indiranagar,
                [12.9800, 77.6300], // Head north
                [12.9850, 77.6100], // West towards Airport Road
                [12.9700, 77.5800], // West towards Marathahalli
                [12.9500, 77.5500], // Southwest towards NICE Road
                [12.9200, 77.5300], // South on NICE Road
                [12.8900, 77.5400], // South on NICE Road
                [12.8600, 77.5600], // East towards Electronic City Phase 2
                [12.8500, 77.6200], // East approaching Electronic City
                [12.8450, 77.6500], // Final approach
                electronicCity
            ];
            
            // Add incident marker at Silk Board Junction
            incidentMarker = L.marker([12.9101, 77.6446], {
                icon: L.divIcon({
                    className: 'incident-marker',
                    html: '<i class="fas fa-car-crash"></i>',
                    iconSize: [30, 30]
                })
            }).addTo(trafficMap);
            
            incidentMarker.bindPopup('<strong>Major Accident at Silk Board Junction</strong><br>Severe congestion: 90+ minutes delay').openPopup();
            
            timeSaved = aiModel === 'advanced' ? 65 : (aiModel === 'predictive' ? 50 : 35);
            aiDistance = 28.4; // km
            aiTime = 32; // minutes
            updateRouteStats(aiDistance, aiTime, 'Light', timeSaved);
            break;
    }
    
    // Update the optimized route
    optimizedRoute.setLatLngs(newRoute);
    optimizedRoute.setStyle({
        opacity: 0.8
    });
    
    // Simulate AI thinking process
    displayAIProcessingEffect();
    
    // Animate vehicles on the optimized route
    animateVehicles(trafficMap, newRoute, '#28a745');
}

// Update traffic visualization based on selected condition
function updateTrafficCondition(condition) {
    if (!trafficMap || !trafficLayer) return;
    
    // Clear existing traffic layer
    trafficLayer.clearLayers();
    
    // Add new traffic visualization based on condition
    const heavyRoads = [];
    const moderateRoads = [];
    const lightRoads = [];
    
    // Update traffic visualization based on condition
    switch (condition) {
        case 'normal':
            // Mostly moderate traffic
            heavyRoads.push(
                [[37.7749, -122.4194], [37.7713, -122.4097]]
            );
            
            moderateRoads.push(
                [[37.7749, -122.4194], [37.7825, -122.4258]],
                [[37.7829, -122.4432], [37.7814, -122.4073]],
                [[37.7749, -122.4194], [37.7647, -122.4198]]
            );
            
            lightRoads.push(
                [[37.7749, -122.4194], [37.7782, -122.4351]],
                [[37.7800, -122.4292], [37.7723, -122.4331]],
                [[37.7670, -122.4170], [37.7695, -122.4261]]
            );
            break;
            
        case 'congested':
            // Mostly heavy traffic
            heavyRoads.push(
                [[37.7749, -122.4194], [37.7713, -122.4097]],
                [[37.7749, -122.4194], [37.7825, -122.4258]],
                [[37.7829, -122.4432], [37.7814, -122.4073]],
                [[37.7749, -122.4194], [37.7647, -122.4198]]
            );
            
            moderateRoads.push(
                [[37.7749, -122.4194], [37.7782, -122.4351]],
                [[37.7800, -122.4292], [37.7723, -122.4331]]
            );
            
            lightRoads.push(
                [[37.7670, -122.4170], [37.7695, -122.4261]]
            );
            break;
            
        case 'incident':
            // Severe congestion near incident
            heavyRoads.push(
                [[37.7749, -122.4194], [37.7713, -122.4097]],
                [[37.7749, -122.4194], [37.7825, -122.4258]],
                [[37.7749, -122.4194], [37.7782, -122.4351]],
                [[37.7749, -122.4194], [37.7647, -122.4198]]
            );
            
            moderateRoads.push(
                [[37.7829, -122.4432], [37.7814, -122.4073]],
                [[37.7800, -122.4292], [37.7723, -122.4331]]
            );
            
            lightRoads.push(
                [[37.7670, -122.4170], [37.7695, -122.4261]]
            );
            break;
    }
    
    // Draw traffic lines
    heavyRoads.forEach(road => {
        L.polyline(road, {
            color: 'red',
            weight: 8,
            opacity: 0.7
        }).addTo(trafficLayer);
    });
    
    moderateRoads.forEach(road => {
        L.polyline(road, {
            color: 'orange',
            weight: 6,
            opacity: 0.7
        }).addTo(trafficLayer);
    });
    
    lightRoads.forEach(road => {
        L.polyline(road, {
            color: 'green',
            weight: 5,
            opacity: 0.7
        }).addTo(trafficLayer);
    });
    
    // Update original route stats based on condition
    if (condition === 'normal') {
        updateOriginalRouteStats(19.5, 55, 'Moderate');
    } else if (condition === 'congested') {
        updateOriginalRouteStats(19.5, 75, 'Heavy');
    } else {
        updateOriginalRouteStats(19.5, 120, 'Severe');
    }
}

// Reset the traffic map to initial state
function resetTrafficMap() {
    if (!trafficMap) return;
    
    // Remove incident marker if exists
    if (incidentMarker) {
        trafficMap.removeLayer(incidentMarker);
        incidentMarker = null;
    }
    
    // Reset to default traffic visualization
    updateTrafficCondition('normal');
    
    // Reset original route stats
    updateOriginalRouteStats(19.5, 55, 'Moderate');
    
    // Reset AI route
    if (optimizedRoute) {
        // Make it match original route but invisible
        optimizedRoute.setLatLngs(originalRoute.getLatLngs());
        optimizedRoute.setStyle({
            opacity: 0
        });
    }
    
    // Reset stats display
    updateRouteStats(19.5, 55, 'Moderate', 0);
    
    // Reset select elements
    const trafficCondition = document.getElementById('traffic-condition');
    const aiModel = document.getElementById('ai-model');
    
    if (trafficCondition) trafficCondition.value = 'normal';
    if (aiModel) aiModel.value = 'basic';
}

// Animate "vehicles" along a route path
function animateVehicles(map, path, color) {
    // Create a vehicle marker
    const vehicleIcon = L.divIcon({
        className: 'vehicle-icon',
        html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
        iconSize: [10, 10]
    });
    
    // Create 2-3 vehicles per route
    for (let i = 0; i < 3; i++) {
        // Random starting position along the path
        const startIndex = Math.floor(Math.random() * (path.length - 1));
        let currentIndex = startIndex;
        let nextIndex = currentIndex + 1;
        
        // Calculate position between points based on progress
        let progress = 0;
        
        // Create vehicle marker
        const vehicle = L.marker(path[currentIndex], {
            icon: vehicleIcon
        }).addTo(map);
        
        // Animation function
        function animate() {
            // Update progress
            progress += 0.01;
            
            // If reached next point
            if (progress >= 1) {
                currentIndex = nextIndex;
                nextIndex++;
                
                // Loop back to beginning if reached end
                if (nextIndex >= path.length) {
                    nextIndex = 0;
                }
                
                progress = 0;
            }
            
            // Interpolate position
            const current = path[currentIndex];
            const next = path[nextIndex];
            
            const lat = current[0] + (next[0] - current[0]) * progress;
            const lng = current[1] + (next[1] - current[1]) * progress;
            
            // Update marker position
            vehicle.setLatLng([lat, lng]);
            
            // Continue animation
            requestAnimationFrame(animate);
        }
        
        // Start animation after a small delay
        setTimeout(animate, i * 200);
    }
}

// Update original route statistics
function updateOriginalRouteStats(distance, time, traffic) {
    const distanceEl = document.getElementById('original-distance');
    const timeEl = document.getElementById('original-time');
    const trafficEl = document.getElementById('original-traffic');
    
    if (distanceEl) distanceEl.textContent = distance;
    if (timeEl) timeEl.textContent = time;
    if (trafficEl) trafficEl.textContent = traffic;
}

// Update AI route statistics
function updateRouteStats(distance, time, traffic, timeSaved) {
    const distanceEl = document.getElementById('ai-distance');
    const timeEl = document.getElementById('ai-time');
    const trafficEl = document.getElementById('ai-traffic');
    const savedEl = document.getElementById('time-saved');
    
    if (distanceEl) distanceEl.textContent = distance;
    if (timeEl) timeEl.textContent = time;
    if (trafficEl) trafficEl.textContent = traffic;
    if (savedEl) savedEl.textContent = timeSaved;
}

// Display AI processing effect to simulate real-time analysis
function displayAIProcessingEffect() {
    const mapContainer = document.getElementById('traffic-map');
    if (!mapContainer) return;
    
    // Create AI processing overlay
    const overlay = document.createElement('div');
    overlay.className = 'ai-processing-overlay';
    overlay.innerHTML = `
        <div class="ai-processing-content">
            <i class="fas fa-brain"></i>
            <p>AI Analyzing Traffic Patterns</p>
            <div class="ai-processing-dots">
                <span>.</span><span>.</span><span>.</span>
            </div>
        </div>
    `;
    
    // Add overlay to map container
    mapContainer.appendChild(overlay);
    
    // Add styles
    const style = document.createElement('style');
    style.innerHTML = `
        .ai-processing-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }
        
        .ai-processing-content {
            text-align: center;
            color: white;
        }
        
        .ai-processing-content i {
            font-size: 3rem;
            color: #00cc99;
            margin-bottom: 10px;
        }
        
        .ai-processing-content p {
            font-size: 1.2rem;
            margin-bottom: 10px;
        }
        
        .ai-processing-dots span {
            animation: dots 1.5s infinite;
            font-size: 2rem;
            margin-right: 5px;
        }
        
        .ai-processing-dots span:nth-child(2) {
            animation-delay: 0.5s;
        }
        
        .ai-processing-dots span:nth-child(3) {
            animation-delay: 1s;
        }
        
        @keyframes dots {
            0%, 20% {
                opacity: 0;
            }
            50% {
                opacity: 1;
            }
            100% {
                opacity: 0;
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // Remove overlay after a short delay
    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.3s ease forwards';
        
        setTimeout(() => {
            mapContainer.removeChild(overlay);
        }, 300);
    }, 2000);
}

// Add additional CSS for incident marker
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.innerHTML = `
        .incident-marker {
            color: red;
            font-size: 24px;
            text-shadow: 0 0 3px white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .vehicle-icon {
            border-radius: 50%;
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
});

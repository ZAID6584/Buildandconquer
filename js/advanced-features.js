// Advanced Features for the AI Traffic Management System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the theme switcher
    initThemeSwitcher();
    
    // Initialize the advanced map features
    initAdvancedMapFeatures();
});

/* 
 * Theme Switcher Functionality
 */
function initThemeSwitcher() {
    const themeSwitcher = document.querySelector('.theme-switcher');
    const themeToggleBtn = document.querySelector('.theme-switcher-toggle');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Toggle theme switcher visibility
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            themeSwitcher.classList.toggle('collapsed');
        });
    }
    
    // Theme switching
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            
            // Save theme preference to localStorage
            localStorage.setItem('preferredTheme', theme);
            
            // Visual feedback
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Add special animation for cyberpunk theme
            if (theme === 'cyberpunk') {
                addCyberpunkEffects();
            } else {
                removeCyberpunkEffects();
            }
        });
    });
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('preferredTheme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        themeOptions.forEach(option => {
            if (option.getAttribute('data-theme') === savedTheme) {
                option.classList.add('active');
            }
        });
        
        // Apply theme-specific effects
        if (savedTheme === 'cyberpunk') {
            addCyberpunkEffects();
        }
    }
}

function addCyberpunkEffects() {
    // Add pulse effect to buttons
    document.querySelectorAll('.btn.primary, .find-me-btn').forEach(btn => {
        btn.classList.add('pulse');
    });
    
    // Add neon glow to headings
    document.querySelectorAll('h1, h2').forEach(heading => {
        heading.style.textShadow = '0 0 5px var(--primary-color), 0 0 10px var(--primary-color)';
    });
}

function removeCyberpunkEffects() {
    // Remove pulse effect
    document.querySelectorAll('.pulse').forEach(el => {
        el.classList.remove('pulse');
    });
    
    // Remove neon glow
    document.querySelectorAll('h1, h2').forEach(heading => {
        heading.style.textShadow = '';
    });
}

/*
 * Advanced Map Features
 */
function initAdvancedMapFeatures() {
    // Get map element
    const mapElement = document.getElementById('traffic-map');
    if (!mapElement) return;
    
    // Initialize map
    let map = trafficMap; // Use the existing map object from traffic.js
    
    // Add control variables
    let startMarker = null;
    let endMarker = null;
    let routeControl = null;
    let aiRouteControl = null;
    let isRouteActive = false;
    
    // Initialize search functionality
    initLocationSearch(map);
    
    // Initialize current location detection
    initCurrentLocationDetection(map);
    
    // Initialize route optimization
    initRouteOptimization(map);
    
    /*
     * Location Search Functionality
     */
    function initLocationSearch(map) {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const searchResults = document.getElementById('search-results');
        
        if (!searchInput || !searchBtn || !searchResults) return;
        
        // Search button click handler
        searchBtn.addEventListener('click', function() {
            performSearch(searchInput.value);
        });
        
        // Enter key handler
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
        
        // Perform search using Nominatim (OpenStreetMap) API
        function performSearch(query) {
            if (!query.trim()) return;
            
            // Show loading indicator
            searchResults.innerHTML = '<div class="loading-animation"><div></div><div></div><div></div><div></div></div>';
            
            // Construct search URL (focusing on Bangalore area)
            const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&viewbox=77.4,12.8,77.8,13.1&bounded=1`;
            
            // Fetch results
            fetch(searchUrl)
                .then(response => response.json())
                .then(data => {
                    // Clear loading indicator
                    searchResults.innerHTML = '';
                    
                    if (data.length === 0) {
                        searchResults.innerHTML = '<div class="no-results">No locations found</div>';
                        return;
                    }
                    
                    // Display results
                    data.slice(0, 5).forEach(result => {
                        const resultItem = document.createElement('div');
                        resultItem.className = 'search-result-item';
                        resultItem.innerHTML = result.display_name;
                        
                        // Click handler for result item
                        resultItem.addEventListener('click', function() {
                            // Set map view to result location
                            map.setView([result.lat, result.lon], 16);
                            
                            // Add temporary marker
                            const marker = L.marker([result.lat, result.lon])
                                .addTo(map)
                                .bindPopup(result.display_name)
                                .openPopup();
                            
                            // Clear search results
                            searchResults.innerHTML = '';
                            searchInput.value = result.display_name;
                            
                            // Set as start or end point
                            showPointSelectionDialog(result, marker);
                        });
                        
                        searchResults.appendChild(resultItem);
                    });
                })
                .catch(error => {
                    console.error('Error performing search:', error);
                    searchResults.innerHTML = '<div class="error">Error performing search</div>';
                });
        }
        
        // Show dialog to set point as start or destination
        function showPointSelectionDialog(result, tempMarker) {
            // Create dialog
            const dialog = document.createElement('div');
            dialog.className = 'point-selection-dialog';
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>Set as:</h3>
                    <button class="set-start-btn btn primary">Starting Point</button>
                    <button class="set-end-btn btn secondary">Destination</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            `;
            
            // Add dialog styles
            const style = document.createElement('style');
            style.innerHTML = `
                .point-selection-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                }
                .dialog-content {
                    background-color: var(--card-bg);
                    padding: 20px;
                    border-radius: var(--border-radius);
                    text-align: center;
                    box-shadow: var(--box-shadow);
                }
                .dialog-content h3 {
                    margin-top: 0;
                }
                .dialog-content button {
                    margin: 5px;
                    padding: 8px 16px;
                }
                .cancel-btn {
                    background: none;
                    border: none;
                    color: var(--dark-gray);
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
            
            // Add dialog to body
            document.body.appendChild(dialog);
            
            // Handle set as start
            dialog.querySelector('.set-start-btn').addEventListener('click', function() {
                setStartPoint([result.lat, result.lon], result.display_name);
                map.removeLayer(tempMarker);
                document.body.removeChild(dialog);
            });
            
            // Handle set as destination
            dialog.querySelector('.set-end-btn').addEventListener('click', function() {
                setEndPoint([result.lat, result.lon], result.display_name);
                map.removeLayer(tempMarker);
                document.body.removeChild(dialog);
            });
            
            // Handle cancel
            dialog.querySelector('.cancel-btn').addEventListener('click', function() {
                document.body.removeChild(dialog);
            });
        }
    }
    
    /*
     * Current Location Detection
     */
    function initCurrentLocationDetection(map) {
        const findMeBtn = document.getElementById('find-me');
        
        if (!findMeBtn) return;
        
        findMeBtn.addEventListener('click', function() {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser');
                return;
            }
            
            // Show loading state
            findMeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
            findMeBtn.disabled = true;
            
            // Get current position
            navigator.geolocation.getCurrentPosition(
                // Success callback
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Center map on location
                    map.setView([lat, lng], 16);
                    
                    // Add temporary marker
                    const marker = L.marker([lat, lng])
                        .addTo(map)
                        .bindPopup('Your Current Location')
                        .openPopup();
                    
                    // Reset button
                    findMeBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use My Location';
                    findMeBtn.disabled = false;
                    
                    // Look up address
                    fetchAddress(lat, lng, function(address) {
                        marker.bindPopup(`Your Current Location<br><small>${address}</small>`).openPopup();
                        
                        // Show point selection dialog
                        showLocationActionDialog([lat, lng], address, marker);
                    });
                },
                // Error callback
                function(error) {
                    console.error('Error getting location:', error);
                    let errorMessage = 'Unable to retrieve your location';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    
                    alert(errorMessage);
                    
                    // Reset button
                    findMeBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use My Location';
                    findMeBtn.disabled = false;
                },
                // Options
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
        
        // Show dialog for current location actions
        function showLocationActionDialog(coords, address, tempMarker) {
            // Create dialog
            const dialog = document.createElement('div');
            dialog.className = 'point-selection-dialog';
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>Set current location as:</h3>
                    <button class="set-start-btn btn primary">Starting Point</button>
                    <button class="set-end-btn btn secondary">Destination</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            `;
            
            // Add dialog to body
            document.body.appendChild(dialog);
            
            // Handle set as start
            dialog.querySelector('.set-start-btn').addEventListener('click', function() {
                setStartPoint(coords, address);
                map.removeLayer(tempMarker);
                document.body.removeChild(dialog);
            });
            
            // Handle set as destination
            dialog.querySelector('.set-end-btn').addEventListener('click', function() {
                setEndPoint(coords, address);
                map.removeLayer(tempMarker);
                document.body.removeChild(dialog);
            });
            
            // Handle cancel
            dialog.querySelector('.cancel-btn').addEventListener('click', function() {
                document.body.removeChild(dialog);
            });
        }
        
        // Reverse geocode to get address from coordinates
        function fetchAddress(lat, lng, callback) {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data && data.display_name) {
                        callback(data.display_name);
                    } else {
                        callback('Address not found');
                    }
                })
                .catch(error => {
                    console.error('Error fetching address:', error);
                    callback('Address lookup failed');
                });
        }
    }
    
    /*
     * Route Optimization
     */
    function initRouteOptimization(map) {
        const optimizeBtn = document.getElementById('optimize-route');
        const clearBtn = document.getElementById('clear-route');
        const aiRouteInfo = document.getElementById('ai-route-info');
        
        if (!optimizeBtn || !clearBtn || !aiRouteInfo) return;
        
        // Handle optimize button click
        optimizeBtn.addEventListener('click', function() {
            if (!startMarker || !endMarker) return;
            
            // Show loading state
            optimizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
            optimizeBtn.disabled = true;
            
            // Simulate AI optimization (in a real app, this would call an API)
            setTimeout(() => {
                generateOptimizedRoute();
                
                // Reset button
                optimizeBtn.innerHTML = '<i class="fas fa-magic"></i> Optimize with AI';
                optimizeBtn.disabled = false;
                
                // Show AI route info
                aiRouteInfo.style.display = 'block';
            }, 2000);
        });
        
        // Handle clear button click
        clearBtn.addEventListener('click', function() {
            clearRoute();
        });
    }
    
    /*
     * Helper Functions
     */
    
    // Set start point
    function setStartPoint(coords, address) {
        // Remove existing start marker if any
        if (startMarker) {
            map.removeLayer(startMarker);
        }
        
        // Create new start marker
        startMarker = L.marker(coords, {
            icon: L.divIcon({
                className: 'custom-marker start-marker',
                html: '<i class="fas fa-map-marker-alt"></i>',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            })
        }).addTo(map).bindPopup('Starting Point: ' + address);
        
        // Update start address display
        document.getElementById('start-address').textContent = address;
        
        // Update route if both points are set
        updateRoute();
    }
    
    // Set end point
    function setEndPoint(coords, address) {
        // Remove existing end marker if any
        if (endMarker) {
            map.removeLayer(endMarker);
        }
        
        // Create new end marker
        endMarker = L.marker(coords, {
            icon: L.divIcon({
                className: 'custom-marker end-marker',
                html: '<i class="fas fa-flag-checkered"></i>',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            })
        }).addTo(map).bindPopup('Destination: ' + address);
        
        // Update end address display
        document.getElementById('end-address').textContent = address;
        
        // Update route if both points are set
        updateRoute();
    }
    
    // Update route between start and end points
    function updateRoute() {
        // Check if both markers exist
        if (!startMarker || !endMarker) return;
        
        // Remove existing route control if any
        if (routeControl) {
            map.removeControl(routeControl);
        }
        
        // Get coordinates
        const startCoords = startMarker.getLatLng();
        const endCoords = endMarker.getLatLng();
        
        // Create new route
        routeControl = L.Routing.control({
            waypoints: [
                L.latLng(startCoords.lat, startCoords.lng),
                L.latLng(endCoords.lat, endCoords.lng)
            ],
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
            }),
            lineOptions: {
                styles: [
                    {color: '#6c757d', opacity: 0.8, weight: 5}
                ]
            },
            addWaypoints: false,
            draggableWaypoints: false,
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            show: false // Don't show turn-by-turn instructions
        }).addTo(map);
        
        // Listen for route calculation
        routeControl.on('routesfound', function(e) {
            const routes = e.routes;
            const route = routes[0]; // Get first route
            
            // Update route info
            const distance = (route.summary.totalDistance / 1000).toFixed(1); // km
            const duration = Math.round(route.summary.totalTime / 60); // minutes
            
            document.getElementById('original-distance').textContent = distance;
            document.getElementById('original-time').textContent = duration;
            document.getElementById('original-traffic').textContent = calculateTrafficLevel(route.coordinates);
            
            // Enable optimize button
            document.getElementById('optimize-route').disabled = false;
            document.getElementById('clear-route').disabled = false;
            
            isRouteActive = true;
        });
    }
    
    // Generate AI-optimized route
    function generateOptimizedRoute() {
        if (!startMarker || !endMarker) return;
        
        // Remove existing AI route control
        if (aiRouteControl) {
            map.removeControl(aiRouteControl);
        }
        
        // Get coordinates
        const startCoords = startMarker.getLatLng();
        const endCoords = endMarker.getLatLng();
        
        // Simulate optimization by adding a waypoint to avoid traffic
        // In a real application, this would use actual traffic data and routing algorithms
        
        // Get a point slightly offset from the direct route
        const midLat = (startCoords.lat + endCoords.lat) / 2;
        const midLng = (startCoords.lng + endCoords.lng) / 2;
        
        // Add some randomness to the waypoint to simulate the AI finding an alternative route
        const waypointLat = midLat + (Math.random() * 0.02 - 0.01);
        const waypointLng = midLng + (Math.random() * 0.02 - 0.01);
        
        // Create optimized route
        aiRouteControl = L.Routing.control({
            waypoints: [
                L.latLng(startCoords.lat, startCoords.lng),
                L.latLng(waypointLat, waypointLng),
                L.latLng(endCoords.lat, endCoords.lng)
            ],
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
            }),
            lineOptions: {
                styles: [
                    {color: '#28a745', opacity: 0.8, weight: 5}
                ]
            },
            addWaypoints: false,
            draggableWaypoints: false,
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: false,
            show: false // Don't show turn-by-turn instructions
        }).addTo(map);
        
        // Listen for route calculation
        aiRouteControl.on('routesfound', function(e) {
            const routes = e.routes;
            const route = routes[0];
            
            // Calculate original route info
            const originalDistance = parseFloat(document.getElementById('original-distance').textContent);
            const originalTime = parseInt(document.getElementById('original-time').textContent);
            
            // Update AI route info
            const aiDistance = (route.summary.totalDistance / 1000).toFixed(1); // km
            let aiTime = Math.round(route.summary.totalTime / 60); // minutes
            
            // Simulate AI traffic prediction (in reality this would use real traffic data)
            // Make AI route faster than original even if it's slightly longer
            if (aiTime >= originalTime) {
                // Ensure AI route is always faster by a significant margin
                aiTime = Math.max(Math.round(originalTime * 0.75), originalTime - 5);
            }
            
            const timeSaved = Math.round(((originalTime - aiTime) / originalTime) * 100);
            
            // Update the UI
            document.getElementById('ai-distance').textContent = aiDistance;
            document.getElementById('ai-time').textContent = aiTime;
            document.getElementById('ai-traffic').textContent = 'Light';
            document.getElementById('time-saved').textContent = timeSaved;
            
            // Show AI route info
            document.getElementById('ai-route-info').style.display = 'block';
            
            // Add animation to highlight the time saved
            const timeSavedElement = document.getElementById('time-saved');
            timeSavedElement.style.animation = 'none';
            setTimeout(() => {
                timeSavedElement.style.animation = 'pulse 2s infinite';
            }, 10);
        });
    }
    
    // Clear all route information
    function clearRoute() {
        // Remove markers
        if (startMarker) {
            map.removeLayer(startMarker);
            startMarker = null;
        }
        
        if (endMarker) {
            map.removeLayer(endMarker);
            endMarker = null;
        }
        
        // Remove routes
        if (routeControl) {
            map.removeControl(routeControl);
            routeControl = null;
        }
        
        if (aiRouteControl) {
            map.removeControl(aiRouteControl);
            aiRouteControl = null;
        }
        
        // Reset UI
        document.getElementById('start-address').textContent = 'Set starting point...';
        document.getElementById('end-address').textContent = 'Set destination...';
        document.getElementById('original-distance').textContent = '0.0';
        document.getElementById('original-time').textContent = '0';
        document.getElementById('original-traffic').textContent = 'N/A';
        document.getElementById('ai-route-info').style.display = 'none';
        document.getElementById('optimize-route').disabled = true;
        document.getElementById('clear-route').disabled = true;
        
        isRouteActive = false;
    }
    
    // Calculate traffic level based on route coordinates
    function calculateTrafficLevel(coordinates) {
        // In a real application, this would use actual traffic data
        // For this demo, we'll simulate traffic based on route location
        
        // Define some "known" traffic hotspots in Bangalore
        const trafficHotspots = [
            // Silk Board Junction
            {lat: 12.9101, lng: 77.6446, radius: 0.008, severity: 'Severe'},
            // Marathahalli Bridge
            {lat: 12.9591, lng: 77.6970, radius: 0.005, severity: 'Heavy'},
            // KR Puram
            {lat: 13.0070, lng: 77.6932, radius: 0.006, severity: 'Heavy'},
            // Hebbal Flyover
            {lat: 13.0356, lng: 77.5958, radius: 0.005, severity: 'Heavy'},
            // Tin Factory
            {lat: 12.9983, lng: 77.6604, radius: 0.004, severity: 'Severe'}
        ];
        
        // Check if route passes through any hotspots
        for (const point of coordinates) {
            for (const hotspot of trafficHotspots) {
                const distance = calculateDistance(
                    point.lat, point.lng,
                    hotspot.lat, hotspot.lng
                );
                
                if (distance < hotspot.radius) {
                    return hotspot.severity;
                }
            }
        }
        
        // If not passing through known hotspots
        return 'Moderate';
    }
    
    // Calculate distance between two points using Haversine formula
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; // Distance in km
    }
    
    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }
    
    // Add styles for custom markers
    const markerStyles = document.createElement('style');
    markerStyles.innerHTML = `
        .custom-marker {
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }
        
        .start-marker {
            color: var(--primary-color);
            text-shadow: 0 0 3px rgba(0,0,0,0.5);
        }
        
        .end-marker {
            color: var(--accent-color);
            text-shadow: 0 0 3px rgba(0,0,0,0.5);
        }
        
        [data-theme="cyberpunk"] .start-marker,
        [data-theme="cyberpunk"] .end-marker {
            text-shadow: 0 0 10px currentColor;
        }
    `;
    document.head.appendChild(markerStyles);
}

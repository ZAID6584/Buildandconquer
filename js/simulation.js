// Traffic Simulation for AI Traffic Management System
class TrafficSimulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with ID ${canvasId} not found`);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.vehicles = [];
        this.trafficLights = [];
        this.isRunning = false;
        this.density = 50; // Default traffic density (0-100)
        this.algorithmType = 'adaptive'; // Default algorithm
        this.stats = {
            avgWaitTime: 0,
            vehiclesProcessed: 0,
            efficiencyGain: 0
        };
        
        // Set canvas dimensions to match container
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Redraw if simulation is active
        if (this.isRunning) {
            this.drawIntersection();
        }
    }
    
    // Initialize the simulation with traffic lights and road layout
    initialize() {
        // Clear previous state
        this.vehicles = [];
        this.trafficLights = [];
        this.stats = {
            avgWaitTime: 0,
            vehiclesProcessed: 0,
            efficiencyGain: 0
        };
        
        // Create intersection layout
        this.drawIntersection();
        
        // Initialize traffic lights
        this.initializeTrafficLights();
    }
    
    // Draw the intersection layout
    drawIntersection() {
        if (!this.ctx || !this.canvas) return;
        
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw road
        this.ctx.fillStyle = '#555555';
        
        // Horizontal road
        this.ctx.fillRect(0, height * 0.4, width, height * 0.2);
        
        // Vertical road
        this.ctx.fillRect(width * 0.4, 0, width * 0.2, height);
        
        // Road markings
        this.ctx.setLineDash([15, 15]);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        // Horizontal markings
        this.ctx.beginPath();
        this.ctx.moveTo(0, height * 0.5);
        this.ctx.lineTo(width, height * 0.5);
        this.ctx.stroke();
        
        // Vertical markings
        this.ctx.beginPath();
        this.ctx.moveTo(width * 0.5, 0);
        this.ctx.lineTo(width * 0.5, height);
        this.ctx.stroke();
        
        // Reset line dash
        this.ctx.setLineDash([]);
    }
    
    // Initialize traffic lights
    initializeTrafficLights() {
        const { width, height } = this.canvas;
        
        // Create traffic lights at four sides of intersection
        this.trafficLights = [
            { 
                position: { x: width * 0.4 - 10, y: height * 0.4 - 10 }, 
                direction: 'north',
                state: 'red',
                timer: 0,
                maxTimer: this.getTimerForAlgorithm()
            },
            { 
                position: { x: width * 0.6 + 10, y: height * 0.4 - 10 }, 
                direction: 'east',
                state: 'red',
                timer: 0,
                maxTimer: this.getTimerForAlgorithm()
            },
            { 
                position: { x: width * 0.6 + 10, y: height * 0.6 + 10 }, 
                direction: 'south',
                state: 'green',
                timer: 0,
                maxTimer: this.getTimerForAlgorithm()
            },
            { 
                position: { x: width * 0.4 - 10, y: height * 0.6 + 10 }, 
                direction: 'west',
                state: 'green',
                timer: 0,
                maxTimer: this.getTimerForAlgorithm()
            }
        ];
        
        this.drawTrafficLights();
    }
    
    // Get timer duration based on algorithm type
    getTimerForAlgorithm() {
        // Base timer
        let timer = 100;
        
        switch (this.algorithmType) {
            case 'fixed':
                return timer;
            case 'adaptive':
                // Adapt based on traffic density
                return timer - (this.density * 0.5);
            case 'predictive':
                // More complex logic would be implemented here
                return timer - (this.density * 0.7);
            default:
                return timer;
        }
    }
    
    // Draw traffic lights
    drawTrafficLights() {
        if (!this.ctx) return;
        
        this.trafficLights.forEach(light => {
            this.ctx.beginPath();
            this.ctx.arc(light.position.x, light.position.y, 8, 0, Math.PI * 2);
            
            // Set color based on state
            switch (light.state) {
                case 'red':
                    this.ctx.fillStyle = '#FF0000';
                    break;
                case 'yellow':
                    this.ctx.fillStyle = '#FFFF00';
                    break;
                case 'green':
                    this.ctx.fillStyle = '#00FF00';
                    break;
            }
            
            this.ctx.fill();
        });
    }
    
    // Create vehicles based on traffic density
    createVehicles() {
        const { width, height } = this.canvas;
        const spawnRate = this.density / 100;
        
        // Chance to spawn a new vehicle
        if (Math.random() < spawnRate * 0.1) {
            // Determine spawn direction
            const directions = ['north', 'east', 'south', 'west'];
            const direction = directions[Math.floor(Math.random() * directions.length)];
            
            // Generate random vehicle type
            const vehicleTypes = ['car', 'truck', 'bus'];
            const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
            
            // Generate vehicle color
            const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Create vehicle object
            let vehicle;
            
            switch (direction) {
                case 'north':
                    vehicle = {
                        position: { x: width * 0.45, y: height },
                        direction,
                        type,
                        color,
                        speed: 1,
                        size: type === 'car' ? 8 : 10,
                        waiting: false,
                        waitTime: 0
                    };
                    break;
                case 'east':
                    vehicle = {
                        position: { x: 0, y: height * 0.45 },
                        direction,
                        type,
                        color,
                        speed: 1,
                        size: type === 'car' ? 8 : 10,
                        waiting: false,
                        waitTime: 0
                    };
                    break;
                case 'south':
                    vehicle = {
                        position: { x: width * 0.55, y: 0 },
                        direction,
                        type,
                        color,
                        speed: 1,
                        size: type === 'car' ? 8 : 10,
                        waiting: false,
                        waitTime: 0
                    };
                    break;
                case 'west':
                    vehicle = {
                        position: { x: width, y: height * 0.55 },
                        direction,
                        type,
                        color,
                        speed: 1,
                        size: type === 'car' ? 8 : 10,
                        waiting: false,
                        waitTime: 0
                    };
                    break;
            }
            
            this.vehicles.push(vehicle);
        }
    }
    
    // Update vehicle positions
    updateVehicles() {
        const { width, height } = this.canvas;
        
        // Update each vehicle
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            const vehicle = this.vehicles[i];
            
            // Check if vehicle needs to stop at traffic light
            const shouldStop = this.checkTrafficLight(vehicle);
            
            if (shouldStop) {
                vehicle.waiting = true;
                vehicle.waitTime++;
            } else {
                vehicle.waiting = false;
                
                // Move vehicle based on direction
                switch (vehicle.direction) {
                    case 'north':
                        vehicle.position.y -= vehicle.speed;
                        break;
                    case 'east':
                        vehicle.position.x += vehicle.speed;
                        break;
                    case 'south':
                        vehicle.position.y += vehicle.speed;
                        break;
                    case 'west':
                        vehicle.position.x -= vehicle.speed;
                        break;
                }
            }
            
            // Remove vehicles that have left the canvas
            if (
                vehicle.position.x < -20 || 
                vehicle.position.x > width + 20 || 
                vehicle.position.y < -20 || 
                vehicle.position.y > height + 20
            ) {
                this.vehicles.splice(i, 1);
                this.stats.vehiclesProcessed++;
            }
        }
    }
    
    // Check if vehicle needs to stop at traffic light
    checkTrafficLight(vehicle) {
        const { width, height } = this.canvas;
        let shouldStop = false;
        
        // Get relevant traffic light for this vehicle's direction
        let light;
        switch (vehicle.direction) {
            case 'north':
                light = this.trafficLights.find(l => l.direction === 'north');
                if (
                    vehicle.position.y > height * 0.4 + 20 && 
                    vehicle.position.y < height * 0.4 + 40 && 
                    (light?.state === 'red' || light?.state === 'yellow')
                ) {
                    shouldStop = true;
                }
                break;
            case 'east':
                light = this.trafficLights.find(l => l.direction === 'east');
                if (
                    vehicle.position.x > width * 0.4 - 40 && 
                    vehicle.position.x < width * 0.4 - 20 && 
                    (light?.state === 'red' || light?.state === 'yellow')
                ) {
                    shouldStop = true;
                }
                break;
            case 'south':
                light = this.trafficLights.find(l => l.direction === 'south');
                if (
                    vehicle.position.y > height * 0.6 - 40 && 
                    vehicle.position.y < height * 0.6 - 20 && 
                    (light?.state === 'red' || light?.state === 'yellow')
                ) {
                    shouldStop = true;
                }
                break;
            case 'west':
                light = this.trafficLights.find(l => l.direction === 'west');
                if (
                    vehicle.position.x > width * 0.6 + 20 && 
                    vehicle.position.x < width * 0.6 + 40 && 
                    (light?.state === 'red' || light?.state === 'yellow')
                ) {
                    shouldStop = true;
                }
                break;
        }
        
        return shouldStop;
    }
    
    // Draw vehicles
    drawVehicles() {
        if (!this.ctx) return;
        
        this.vehicles.forEach(vehicle => {
            this.ctx.beginPath();
            
            // Draw based on vehicle type
            if (vehicle.type === 'car') {
                this.ctx.arc(vehicle.position.x, vehicle.position.y, vehicle.size, 0, Math.PI * 2);
            } else {
                // Trucks and buses are rectangles
                this.ctx.rect(
                    vehicle.position.x - vehicle.size, 
                    vehicle.position.y - vehicle.size * 1.5, 
                    vehicle.size * 2, 
                    vehicle.size * 3
                );
            }
            
            this.ctx.fillStyle = vehicle.color;
            this.ctx.fill();
        });
    }
    
    // Update traffic lights
    updateTrafficLights() {
        // Update each traffic light
        this.trafficLights.forEach(light => {
            light.timer++;
            
            // Check if timer has reached maximum
            if (light.timer >= light.maxTimer) {
                // Reset timer
                light.timer = 0;
                
                // Change light state
                switch (light.state) {
                    case 'red':
                        light.state = 'green';
                        break;
                    case 'yellow':
                        light.state = 'red';
                        break;
                    case 'green':
                        light.state = 'yellow';
                        // Shorter yellow duration
                        light.maxTimer = 30;
                        return;
                }
                
                // Set normal duration for red/green
                light.maxTimer = this.getTimerForAlgorithm();
            }
        });
        
        // AI adaptive logic for traffic light timing
        if (this.algorithmType === 'adaptive' || this.algorithmType === 'predictive') {
            this.adaptTrafficLights();
        }
    }
    
    // AI adaptation of traffic lights
    adaptTrafficLights() {
        // Count vehicles in each direction
        const vehicleCounts = {
            north: 0,
            east: 0,
            south: 0,
            west: 0
        };
        
        // Count waiting vehicles
        this.vehicles.forEach(vehicle => {
            if (vehicle.waiting) {
                vehicleCounts[vehicle.direction]++;
            }
        });
        
        // Find directions with most waiting vehicles
        let maxCount = 0;
        let busyDirection = '';
        
        for (const [direction, count] of Object.entries(vehicleCounts)) {
            if (count > maxCount) {
                maxCount = count;
                busyDirection = direction;
            }
        }
        
        // If there's a busy direction, prioritize its traffic light
        if (busyDirection && maxCount > 5) {
            const busyLight = this.trafficLights.find(light => light.direction === busyDirection);
            
            if (busyLight && busyLight.state === 'red') {
                // Reduce timer to change sooner
                busyLight.timer = Math.max(busyLight.timer, busyLight.maxTimer * 0.7);
            } else if (busyLight && busyLight.state === 'green') {
                // Extend green time
                busyLight.maxTimer = Math.min(busyLight.maxTimer * 1.2, 200);
            }
        }
    }
    
    // Update statistics
    updateStats() {
        // Calculate average wait time
        let totalWaitTime = 0;
        let waitingVehicles = 0;
        
        this.vehicles.forEach(vehicle => {
            if (vehicle.waiting) {
                totalWaitTime += vehicle.waitTime;
                waitingVehicles++;
            }
        });
        
        if (waitingVehicles > 0) {
            this.stats.avgWaitTime = totalWaitTime / waitingVehicles;
        }
        
        // Calculate efficiency gain compared to fixed timing
        // This is a simulated value for demonstration
        if (this.algorithmType === 'adaptive') {
            this.stats.efficiencyGain = 15 + (Math.random() * 10);
        } else if (this.algorithmType === 'predictive') {
            this.stats.efficiencyGain = 25 + (Math.random() * 15);
        } else {
            this.stats.efficiencyGain = 0;
        }
        
        // Update DOM elements
        document.getElementById('avg-wait-time').textContent = Math.round(this.stats.avgWaitTime) + 's';
        document.getElementById('vehicles-processed').textContent = this.stats.vehiclesProcessed;
        document.getElementById('efficiency-gain').textContent = Math.round(this.stats.efficiencyGain) + '%';
    }
    
    // Main animation loop
    animate() {
        if (!this.isRunning) return;
        
        // Clear canvas
        this.drawIntersection();
        
        // Update simulation
        this.createVehicles();
        this.updateVehicles();
        this.updateTrafficLights();
        this.updateStats();
        
        // Draw visual elements
        this.drawTrafficLights();
        this.drawVehicles();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
    
    // Start the simulation
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.initialize();
        this.animate();
    }
    
    // Stop the simulation
    stop() {
        this.isRunning = false;
    }
    
    // Reset the simulation
    reset() {
        this.stop();
        this.initialize();
        this.drawIntersection();
        this.drawTrafficLights();
        
        // Reset stats display
        document.getElementById('avg-wait-time').textContent = '0s';
        document.getElementById('vehicles-processed').textContent = '0';
        document.getElementById('efficiency-gain').textContent = '0%';
    }
    
    // Set traffic density
    setDensity(density) {
        this.density = Math.max(0, Math.min(100, density));
    }
    
    // Set algorithm type
    setAlgorithm(type) {
        this.algorithmType = type;
    }
}

// Initialize simulations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hero section animation
    const heroSimulation = new TrafficSimulation('traffic-simulation');
    if (heroSimulation.canvas) {
        heroSimulation.setDensity(30);
        heroSimulation.setAlgorithm('adaptive');
        heroSimulation.start();
    }
    
    // Demo section simulation
    const demoSimulation = new TrafficSimulation('intersection-simulation');
    
    if (demoSimulation.canvas) {
        // Initialize but don't start automatically
        demoSimulation.initialize();
        
        // Connect controls
        const densitySlider = document.getElementById('traffic-density');
        const algorithmSelect = document.getElementById('algorithm-type');
        const startButton = document.getElementById('start-simulation');
        const resetButton = document.getElementById('reset-simulation');
        
        if (densitySlider) {
            densitySlider.addEventListener('input', function() {
                demoSimulation.setDensity(parseInt(this.value));
            });
        }
        
        if (algorithmSelect) {
            algorithmSelect.addEventListener('change', function() {
                demoSimulation.setAlgorithm(this.value);
            });
        }
        
        if (startButton) {
            startButton.addEventListener('click', function() {
                if (!demoSimulation.isRunning) {
                    demoSimulation.start();
                    this.textContent = 'Pause Simulation';
                } else {
                    demoSimulation.stop();
                    this.textContent = 'Start Simulation';
                }
            });
        }
        
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                demoSimulation.reset();
                if (startButton) {
                    startButton.textContent = 'Start Simulation';
                }
            });
        }
    }
});

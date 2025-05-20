// map-mobile.js - Mobile enhancements for the Análisis del Área de Interés

// Function to determine if the device is mobile
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           (window.navigator.userAgent.match(/Android/i) || 
            window.navigator.userAgent.match(/iPhone|iPad|iPod/i));
}

// Function to apply mobile-specific adjustments
function applyMobileAdjustments() {
    // Check if we're on a mobile device
    const isMobile = isMobileDevice();
    console.log("Mobile device detected:", isMobile);
    
    if (isMobile) {
        // Adjust map options for better mobile experience
        if (map) {
            // Disable double-click zoom and use touch zoom instead
            map.doubleClickZoom.disable();
            
            // Set a minimum zoom level to prevent users from zooming out too far
            map.setMinZoom(12);
        }
        
        // Make sure panels can be toggled on mobile
        setupPanelToggles();
        
        // Make radio buttons bigger for mobile touch targets
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(button => {
            button.style.width = '20px';
            button.style.height = '20px';
        });
        
        // Make update button bigger with more padding
        const updateButton = document.getElementById('updateTimeView');
        if (updateButton) {
            updateButton.style.padding = '10px';
            updateButton.style.fontSize = '14px';
        }
        
        // Modify the layer control to be more mobile-friendly
        modifyLeafletControls();
    }
}

// Set up toggles for collapsible panels
function setupPanelToggles() {
    // Legend toggle
    const legendToggle = document.querySelector('.legend-toggle');
    const legendContainer = document.querySelector('.legend-container');
    
    if (legendToggle && legendContainer) {
        legendToggle.addEventListener('click', function() {
            legendContainer.classList.toggle('collapsed');
            legendToggle.innerHTML = legendContainer.classList.contains('collapsed') ? 
                '<i class="fa fa-chevron-down"></i>' : '<i class="fa fa-chevron-up"></i>';
        });
    }
    
    // Time selector toggle
    const timeToggle = document.querySelector('.time-toggle');
    const timeSelector = document.querySelector('.time-selector');
    
    if (timeToggle && timeSelector) {
        timeToggle.addEventListener('click', function() {
            timeSelector.classList.toggle('collapsed');
            timeToggle.innerHTML = timeSelector.classList.contains('collapsed') ? 
                '<i class="fa fa-chevron-down"></i>' : '<i class="fa fa-chevron-up"></i>';
        });
    }
    
    // Info box toggle
    const infoToggle = document.querySelector('.info-toggle');
    const infoBox = document.querySelector('.info-box');
    
    if (infoToggle && infoBox) {
        infoToggle.addEventListener('click', function() {
            infoBox.classList.toggle('collapsed');
            infoToggle.innerHTML = infoBox.classList.contains('collapsed') ? 
                '<i class="fa fa-chevron-down"></i>' : '<i class="fa fa-chevron-up"></i>';
        });
    }
}

// Modify Leaflet controls for better mobile experience
function modifyLeafletControls() {
    // Wait for Leaflet controls to be added to the DOM
    setTimeout(() => {
        // Modify layer control
        const layerControl = document.querySelector('.leaflet-control-layers');
        if (layerControl) {
            // Start collapsed on mobile
            const layerControlForm = layerControl.querySelector('.leaflet-control-layers-list');
            if (layerControlForm) {
                layerControlForm.style.fontSize = '12px';
                // Make control inputs easier to tap
                const inputs = layerControlForm.querySelectorAll('input');
                inputs.forEach(input => {
                    input.style.width = '18px';
                    input.style.height = '18px';
                });
            }
        }
        
        // Make zoom control buttons bigger on mobile
        const zoomControl = document.querySelector('.leaflet-control-zoom');
        if (zoomControl) {
            const zoomIn = zoomControl.querySelector('.leaflet-control-zoom-in');
            const zoomOut = zoomControl.querySelector('.leaflet-control-zoom-out');
            
            if (zoomIn && zoomOut) {
                zoomIn.style.fontSize = '18px';
                zoomIn.style.lineHeight = '30px';
                zoomIn.style.width = '30px';
                zoomIn.style.height = '30px';
                
                zoomOut.style.fontSize = '18px';
                zoomOut.style.lineHeight = '30px';
                zoomOut.style.width = '30px';
                zoomOut.style.height = '30px';
            }
        }
    }, 1000); // Wait for Leaflet controls to be created
}

// Handle orientation changes
function handleOrientationChange() {
    console.log("Orientation changed. Adjusting map view...");
    
    // Update mobile status
    const isMobile = isMobileDevice();
    
    if (isMobile) {
        // Refresh the map to ensure proper rendering
        if (map) {
            // Force redraw by invalidating size
            map.invalidateSize();
            
            // Re-center map on area of interest 
            map.setView(areaOfInterestCoords, 14);
        }
    }
}

// Add listeners for orientation change
window.addEventListener('orientationchange', function() {
    // Delay the handler to ensure DOM updates
    setTimeout(handleOrientationChange, 200);
});

// Also listen for resize events which may include orientation changes
window.addEventListener('resize', function() {
    // Debounce the resize event to prevent multiple calls
    if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(function() {
        handleOrientationChange();
    }, 500);
});

// Create a fullscreen toggle button
function createFullscreenToggle() {
    const fullscreenButton = document.createElement('button');
    fullscreenButton.innerHTML = '<i class="fa fa-expand"></i>';
    fullscreenButton.style.position = 'fixed';
    fullscreenButton.style.bottom = '70px';
    fullscreenButton.style.right = '10px';
    fullscreenButton.style.zIndex = '1000';
    fullscreenButton.style.backgroundColor = 'white';
    fullscreenButton.style.border = '1px solid #ccc';
    fullscreenButton.style.borderRadius = '4px';
    fullscreenButton.style.padding = '8px';
    fullscreenButton.style.cursor = 'pointer';
    
    fullscreenButton.addEventListener('click', function() {
        const mapElement = document.getElementById('map');
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (mapElement.requestFullscreen) {
                mapElement.requestFullscreen();
            } else if (mapElement.mozRequestFullScreen) { // Firefox
                mapElement.mozRequestFullScreen();
            } else if (mapElement.webkitRequestFullscreen) { // Chrome, Safari, Opera
                mapElement.webkitRequestFullscreen();
            } else if (mapElement.msRequestFullscreen) { // IE/Edge
                mapElement.msRequestFullscreen();
            }
            fullscreenButton.innerHTML = '<i class="fa fa-compress"></i>';
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            fullscreenButton.innerHTML = '<i class="fa fa-expand"></i>';
        }
    });
    
    document.body.appendChild(fullscreenButton);
    
    // Update button icon when fullscreen state changes
    document.addEventListener('fullscreenchange', function() {
        if (document.fullscreenElement) {
            fullscreenButton.innerHTML = '<i class="fa fa-compress"></i>';
        } else {
            fullscreenButton.innerHTML = '<i class="fa fa-expand"></i>';
        }
    });
}

// Apply touch-specific improvements
function applyTouchImprovements() {
    // Only apply on touch devices
    if ('ontouchstart' in window) {
        console.log("Touch device detected, applying touch improvements");
        
        // Improve popup handling for touch devices
        if (typeof markerClusters !== 'undefined') {
            Object.keys(markerClusters).forEach(period => {
                const markers = markerClusters[period].getLayers();
                markers.forEach(marker => {
                    // Make popups close when tapping elsewhere on the map
                    marker.on('popupopen', function() {
                        map.once('click', function() {
                            marker.closePopup();
                        });
                    });
                });
            });
        }
        
        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
}

// Initialize mobile enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing mobile enhancements");
    
    // Apply mobile adjustments
    applyMobileAdjustments();
    
    // Create fullscreen toggle for mobile
    if (isMobileDevice()) {
        createFullscreenToggle();
    }
    
    // Wait for map to be initialized
    const checkMapInterval = setInterval(function() {
        if (typeof map !== 'undefined' && map !== null) {
            clearInterval(checkMapInterval);
            console.log("Map is initialized, applying touch improvements");
            applyTouchImprovements();
            
            // Force a redraw of the map
            map.invalidateSize();
        }
    }, 500);
});

// map.js - Análisis del Área de Interés

// Variables globales
let map;
let markerClusters = {};
let heatMap;
let drawnItems;
let otherMalls;
let highlightedArea; // Variable para el área resaltada

// Coordenadas específicas para el área de interés
const areaOfInterestCoords = [14.5626526, -90.4626235];

// Inicializar el mapa
function initializeMap() {
    console.log("Inicializando mapa con datos cargados");
    
    // Crear el mapa centrado en el área de interés
    map = L.map('map').setView(areaOfInterestCoords, 14);

    // Añadir capa base (OpenStreetMap)
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Añadir capas de mapa adicionales
    const lightMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });

    const darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });

    // Control de capas para mapas base
    const baseMaps = {
        "OpenStreetMap": baseLayer,
        "Mapa Claro": lightMap,
        "Mapa Oscuro": darkMap
    };

    // Crear clusters de marcadores para diferentes períodos de tiempo
    markerClusters = {
        overall: L.markerClusterGroup(),
        morning: L.markerClusterGroup(),
        midday: L.markerClusterGroup(),
        evening: L.markerClusterGroup()
    };
    
    // Inicializar el grupo de características para otros centros comerciales
    otherMalls = L.featureGroup();
    
    // Añadir marcadores basados en los datos cargados
    addResidentialMarkers();
    
    // Añadir polígono para resaltar el área de interés (en lugar del centro comercial)
    addHighlightedArea();
    
    // Añadir otros centros comerciales
    addOtherMalls();
    
    // Añadir mapa de calor
    createHeatMap();
    
    // Añadir clusters de marcadores al mapa (solo "overall" es visible inicialmente)
    map.addLayer(markerClusters.overall);
    
    // Añadir capa de centros comerciales al mapa (inicialmente visible)
    otherMalls.addTo(map);
    
    // Añadir controles de capas
    setupLayerControls();
    
    // Añadir control de escala
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);
    
    console.log("Mapa inicializado correctamente");
}

// ==========================================
// SECCIÓN DE DATOS - Cargar datos CSV
// ==========================================
let residentialData = [];

// Función para cargar datos desde CSV
async function loadResidentialData() {
    try {
        let csvData;
        
        // Check if we have the embedded CSV data URL
        if (window.csvDataUrl) {
            console.log("Usando datos CSV embebidos");
            const response = await fetch(window.csvDataUrl);
            csvData = await response.text();
        } else {
            // Intentar cargar el archivo CSV externo
            console.log("Intentando cargar archivo CSV externo");
            const response = await fetch('Time saving analysis Centro Comercial SCP Summary Centro Comercial.csv');
            
            if (!response.ok) {
                throw new Error(`Error al cargar el CSV: ${response.status}`);
            }
            
            csvData = await response.text();
        }
        
        console.log("CSV cargado correctamente:", csvData.substring(0, 100) + "...");
        
        // Parsear CSV
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        residentialData = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Saltar líneas vacías
            
            const values = lines[i].split(',');
            if (values.length < 10) continue; // Asegurarse de que hay suficientes valores - reducido de 11 a 10
            
            try {
                const location = {
                    name: values[0],
                    lat: parseFloat(values[1]),
                    lng: parseFloat(values[2]),
                    distance: parseFloat(values[3]),
                    times: {
                        overall: parseFloat(values[4]),
                        morning: parseFloat(values[5]),
                        midday: parseFloat(values[6]),
                        evening: parseFloat(values[7])
                    },
                    trafficFactor: parseFloat(values[8]),
                    accessibilityScore: parseFloat(values[9])
                    // Eliminada la propiedad publicTransport
                };
                
                // Verificar que las coordenadas sean válidas
                if (!isNaN(location.lat) && !isNaN(location.lng)) {
                    residentialData.push(location);
                } else {
                    console.error(`Coordenadas inválidas en línea ${i+1}: ${values[1]}, ${values[2]}`);
                }
            } catch (e) {
                console.error(`Error al procesar línea ${i+1}: ${e.message}`);
            }
        }
        
        console.log(`Datos cargados: ${residentialData.length} ubicaciones residenciales`);
        console.log("Primera ubicación:", residentialData[0]);
        
        // Continuar con la inicialización del mapa
        initializeMap();
    } catch (error) {
        console.error('Error al cargar los datos CSV:', error);
        
        // IMPORTANTE: Usar los datos predefinidos como fallback en caso de error
        console.log('Cargando datos predefinidos como fallback debido al error...');
        loadHardcodedData();
        
        // Inicializar el mapa con los datos predefinidos
        initializeMap();
    }
}

// Cargar datos predefinidos (fallback)
function loadHardcodedData() {
    // Utilizamos los datos CSV ya incorporados en el archivo HTML
    residentialData = [];
    
    // Utilizamos los datos existentes en embeddedCSVData
    if (window.embeddedCSVData) {
        const lines = window.embeddedCSVData.split('\n');
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Saltar líneas vacías
            
            const values = lines[i].split(',');
            if (values.length < 10) continue; // Asegurarse de que hay suficientes valores - reducido de 11 a 10
            
            try {
                const location = {
                    name: values[0],
                    lat: parseFloat(values[1]),
                    lng: parseFloat(values[2]),
                    distance: parseFloat(values[3]),
                    times: {
                        overall: parseFloat(values[4]),
                        morning: parseFloat(values[5]),
                        midday: parseFloat(values[6]),
                        evening: parseFloat(values[7])
                    },
                    trafficFactor: parseFloat(values[8]),
                    accessibilityScore: parseFloat(values[9])
                   // Eliminada la propiedad publicTransport
                };
                
                // Verificar que las coordenadas sean válidas
                if (!isNaN(location.lat) && !isNaN(location.lng)) {
                    residentialData.push(location);
                }
            } catch (e) {
                console.error(`Error al procesar línea ${i+1}: ${e.message}`);
            }
        }
    }
    
    // Si no se pudieron cargar datos, usar datos fallback predefinidos
    if (residentialData.length === 0) {
        residentialData = [
            {
                name: 'Apartamentos Monet', 
                lat: 14.565411, 
                lng: -90.442502, 
                times: {
                    overall: 6.97, 
                    morning: 8.42, 
                    midday: 6.50, 
                    evening: 6.00
                },
                distance: 3.30,
                trafficFactor: 1.21,
                accessibilityScore: 3.5
                // Eliminada la propiedad publicTransport
            },
            // Más datos predefinidos aquí si es necesario
        ];
    }
    
    console.log(`Datos predefinidos cargados: ${residentialData.length} ubicaciones residenciales`);
}

// ==========================================
// Funciones para crear elementos del mapa
// ==========================================

// Obtener color del marcador basado en el tiempo de viaje
function getMarkerColor(timeValue) {
    if (timeValue <= 5) return 'green';
    if (timeValue <= 10) return 'blue';
    return 'red';
}

// Función creadora de íconos personalizados
function createTimeIcon(timeValue) {
    const color = getMarkerColor(timeValue);
    return L.divIcon({
        className: '',
        html: `<div style="background-color: ${color}; color: white; 
              border-radius: 50%; width: 25px; height: 25px; 
              display: flex; justify-content: center; align-items: center;
              font-weight: bold; border: 1px solid black; font-size: 11px;">
              ${Math.round(timeValue)}
              </div>`,
        iconSize: [25, 25],
        iconAnchor: [12, 12]
    });
}

// Añadir marcadores residenciales a los clusters
function addResidentialMarkers() {
    console.log("Añadiendo marcadores residenciales...");
    
    residentialData.forEach(location => {
        // Crear marcadores para cada período de tiempo con colores apropiados para ese período
        const periods = ['overall', 'morning', 'midday', 'evening'];
        
        periods.forEach(period => {
            const timeValue = location.times[period];
            const icon = createTimeIcon(timeValue);
            
            // Crear contenido del popup con la información extra del CSV
            let popupContent = `
                <b>${location.name}</b><br>
                Tiempo de viaje: ${timeValue.toFixed(1)} minutos<br>
                Distancia: ${location.distance} km<br>
                Factor de tráfico: ${location.trafficFactor}<br>
                Accesibilidad: ${location.accessibilityScore}/5<br>
                `;
            
            // Crear marcador con el icono personalizado y añadirlo al cluster apropiado
            const marker = L.marker([location.lat, location.lng], { icon: icon })
                .bindPopup(popupContent);
            
            markerClusters[period].addLayer(marker);
        });
    });
    
    console.log("Marcadores residenciales añadidos con éxito");
}

// Añadir polígono para resaltar el área de interés
function addHighlightedArea() {
    console.log("Añadiendo área de interés resaltada...");
    
    // Crear un círculo con radio de aproximadamente 500 metros como polígono
    // Usamos un círculo para no revelar la ubicación exacta, solo el área general
    const radius = 500; // metros
    
    // Crear un array de puntos para formar un polígono circular
    const points = 30; // número de puntos para formar el polígono
    const center = areaOfInterestCoords;
    const polygonPoints = [];
    
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * (Math.PI * 2);
        const lat = center[0] + (radius / 111300) * Math.cos(angle);
        const lng = center[1] + (radius / (111300 * Math.cos(center[0] * (Math.PI / 180)))) * Math.sin(angle);
        polygonPoints.push([lat, lng]);
    }
    
    // Crear el polígono con relleno rojo semitransparente y borde blanco
    highlightedArea = L.polygon(polygonPoints, {
        color: 'white',           // Color del borde
        weight: 2,               // Grosor del borde
        fillColor: 'red',        // Color de relleno
        fillOpacity: 0.5,        // Opacidad del relleno (50%)
        smoothFactor: 1          // Suavizado de líneas
    }).addTo(map);
    
    // Añadir popup simple al área
    highlightedArea.bindPopup('Área de interés');
    
    console.log("Área de interés añadida con éxito");
}

// Datos de otros centros comerciales
const mallsData = [
    {
        name: 'Pacific Plaza',
        lat: 14.5703629,
        lng: -90.4711781,
        type: 'Conveniencia'
    },
    {
        name: 'Metroplaza',
        lat: 14.5676986,
        lng: -90.4721717,
        type: 'Conveniencia'
    },
    {
        name: 'Plaza Muxbal',
        lat: 14.5632927,
        lng: -90.4720428,
        type: 'Conveniencia'
    },
    {
        name: 'Minuto Muxbal',
        lat: 14.5602166,
        lng: -90.4723834,
        type: 'Conveniencia'
    },
    {
        name: 'Vista Muxbal',
        lat: 14.5594865,
        lng: -90.4733039,
        type: 'Conveniencia'
    },
    {
        name: 'Paseo San Sebastián',
        lat: 14.5632480,
        lng: -90.4642363,
        type: 'Conveniencia'
    },
    {
        name: 'Centro Comercial Gran Plaza',
        lat: 14.5617218,
        lng: -90.4634673,
        type: 'Tradicional'
    },
    {
        name: 'Centro Comercial Escala',
        lat: 14.5591962,
        lng: -90.4618414,
        type: 'Tradicional'
    },
    {
        name: 'Condado Concepción',
        lat: 14.5552705,
        lng: -90.4560352,
        type: 'Conveniencia'
    },
    {
        name: 'Pradera Concepción',
        lat: 14.5526712,
        lng: -90.4537713,
        type: 'Tradicional'
    },
    {
        name: 'Plaza Sonibel',
        lat: 14.5609110,
        lng: -90.4625156,
        type: 'Conveniencia/Tradicional'
    },
    {
        name: 'Plaza Loren',
        lat: 14.5612982,
        lng: -90.4627231,
        type: 'Conveniencia'
    },
    {
        name: 'Plaza Gerona',
        lat: 14.5581492,
        lng: -90.4589232,
        type: 'Conveniencia'
    }
];

// Añadir otros centros comerciales
function addOtherMalls() {
    console.log("Añadiendo otros centros comerciales...");
    
    mallsData.forEach(mall => {
        // Crear un pequeño círculo morado en lugar de texto "M"
        const mallIcon = L.divIcon({
            className: '',
            html: `<div style="background-color: purple; color: white; 
                  border-radius: 50%; width: 12px; height: 12px; 
                  display: flex; justify-content: center; align-items: center;
                  font-weight: bold; border: 1px solid white;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });
        
        L.marker([mall.lat, mall.lng], { icon: mallIcon })
            .bindPopup(`<b>${mall.name}</b><br>Tipo: ${mall.type}`)
            .addTo(otherMalls);
    });
    
    console.log("Otros centros comerciales añadidos con éxito");
}

// Crear mapa de calor
function createHeatMap() {
    console.log("Creando mapa de calor...");
    
    try {
        // Verificar que Leaflet.heat esté disponible
        if (typeof L.heatLayer === 'function') {
            const heatData = residentialData.map(location => {
                return [location.lat, location.lng, location.times.overall]; 
            });
    
            heatMap = L.heatLayer(heatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                gradient: {0.2: 'green', 0.5: 'blue', 0.8: 'red'}
            });
            
            console.log("Mapa de calor creado con éxito");
        } else {
            console.error("L.heatLayer no está disponible. Asegúrese de que leaflet-heat.js esté cargado correctamente.");
        }
    } catch (error) {
        console.error("Error al crear el mapa de calor:", error);
    }
}

// Configurar controles de capas
function setupLayerControls() {
    console.log("Configurando controles de capas...");
    
    const baseMaps = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }),
        "Mapa Claro": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }),
        "Mapa Oscuro": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        })
    };

    const overlayMaps = {
        "Promedio General": markerClusters.overall,
        "Hora Pico Matutina (7-9 AM)": markerClusters.morning,
        "Medio Día (11 AM-2 PM)": markerClusters.midday,
        "Hora Pico Vespertina (5-7 PM)": markerClusters.evening,
        "Otros Centros Comerciales": otherMalls,
        "Mapa de Calor": heatMap,
        "Área de Interés": highlightedArea
    };

    // Añadir control de capas al mapa
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
        position: 'topright'
    }).addTo(map);
    
    console.log("Controles de capas configurados con éxito");
}

// ==========================================
// Funcionalidad del selector de período de tiempo
// ==========================================
function updateTimeViewHandler() {
    console.log("Actualizando vista según período de tiempo...");
    
    // Obtener período de tiempo seleccionado
    const selectedTime = document.querySelector('input[name="timeOfDay"]:checked').value;
    
    // Eliminar todos los clusters de marcadores del mapa
    Object.keys(markerClusters).forEach(period => {
        if (map.hasLayer(markerClusters[period])) {
            map.removeLayer(markerClusters[period]);
        }
    });
    
    // Añadir el cluster de marcadores seleccionado al mapa
    map.addLayer(markerClusters[selectedTime]);
    
    // Actualizar datos del mapa de calor para el período de tiempo seleccionado
    if (heatMap && map.hasLayer(heatMap)) {
        map.removeLayer(heatMap);
        
        const newHeatData = residentialData.map(location => {
            return [location.lat, location.lng, location.times[selectedTime]]; 
        });
        
        const newHeatMap = L.heatLayer(newHeatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {0.2: 'green', 0.5: 'blue', 0.8: 'red'}
        });
        
        heatMap = newHeatMap;
        map.addLayer(heatMap);
    }
    
    // Actualizar título para mostrar el período de tiempo seleccionado
    const titleElement = document.querySelector('.title-container h3');
    if (titleElement) {
        const timePeriodText = {
            'overall': 'Promedio General',
            'morning': 'Hora Pico Mañana (7-9 AM)',
            'midday': 'Medio Día (11 AM-2 PM)',
            'evening': 'Hora Pico Tarde (5-7 PM)'
        }[selectedTime];
        
        titleElement.textContent = `Análisis del Área de Interés - ${timePeriodText}`;
    }
    
    console.log(`Vista cambiada a ${selectedTime}`);
}

// Iniciar la carga de datos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log("Documento cargado. Iniciando carga de datos...");
    
    // Asegurarnos de que el evento de actualización de tiempo esté correctamente configurado
    const updateButton = document.getElementById('updateTimeView');
    if (updateButton) {
        // Eliminar cualquier evento previo para evitar duplicados
        updateButton.removeEventListener('click', updateTimeViewHandler);
        // Añadir el evento de actualización
        updateButton.addEventListener('click', updateTimeViewHandler);
        console.log("Evento asignado al botón de actualización");
    } else {
        console.error("Botón de actualización no encontrado!");
    }
    
    // Si la URL contiene parámetro debug=true, cargar datos hardcoded directamente
    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get('debug');
    
    if (debug === 'true') {
        console.log("Modo debug activado. Cargando datos predefinidos...");
        loadHardcodedData();
        initializeMap();
    } else {
        // Intentar cargar desde CSV
        loadResidentialData();
    }
});

// ===========================================
// map-mobile.js - Mobile enhancements
// ===========================================

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
            
            // Adjust zoom control position to avoid interference with UI elements
            if (map.zoomControl) {
                map.zoomControl.setPosition('bottomright');
            }
        }
        
        // Make sure all panels are expanded by default on mobile for visibility
        expandAllPanels();
        
        // Setup panel toggles for when user wants to collapse them
        setupPanelToggles();
        
        // Make radio buttons bigger for mobile touch targets
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(button => {
            button.style.width = '20px';
            button.style.height = '20px';
            button.style.marginRight = '8px';
        });
        
        // Make update button bigger with more padding
        const updateButton = document.getElementById('updateTimeView');
        if (updateButton) {
            updateButton.style.padding = '10px';
            updateButton.style.fontSize = '14px';
            updateButton.style.fontWeight = 'bold';
            updateButton.style.margin = '8px 0';
        }
        
        // Modify the layer control to be more mobile-friendly
        modifyLeafletControls();
        
        // Fix legend position to ensure it doesn't overlap with map controls
        adjustLegendPosition();
    }
}

// Ensure all panels are expanded on mobile for visibility
function expandAllPanels() {
    // Expand legend container
    const legendContainer = document.querySelector('.legend-container');
    if (legendContainer) {
        legendContainer.classList.remove('collapsed');
        const legendToggle = legendContainer.querySelector('.legend-toggle');
        if (legendToggle) {
            legendToggle.innerHTML = '<i class="fa fa-chevron-up"></i>';
        }
    }
    
    // Expand time selector
    const timeSelector = document.querySelector('.time-selector');
    if (timeSelector) {
        timeSelector.classList.remove('collapsed');
        const timeToggle = timeSelector.querySelector('.time-toggle');
        if (timeToggle) {
            timeToggle.innerHTML = '<i class="fa fa-chevron-up"></i>';
        }
    }
    
    // Expand info box
    const infoBox = document.querySelector('.info-box');
    if (infoBox) {
        infoBox.classList.remove('collapsed');
        const infoToggle = infoBox.querySelector('.info-toggle');
        if (infoToggle) {
            infoToggle.innerHTML = '<i class="fa fa-chevron-up"></i>';
        }
    }
}

// Adjust legend position to avoid overlapping with other elements
function adjustLegendPosition() {
    setTimeout(() => {
        const legendContainer = document.querySelector('.legend-container');
        const mapHeight = window.innerHeight;
        
        if (legendContainer) {
            // Set a max-height based on screen size to ensure scrolling works
            const maxHeight = Math.round(mapHeight * 0.4); // 40% of screen height
            legendContainer.style.maxHeight = maxHeight + 'px';
            
            // Add a subtle opacity to background for better readability
            legendContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            legendContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        }
        
        // Also adjust info box and time selector
        const infoBox = document.querySelector('.info-box');
        if (infoBox) {
            infoBox.style.maxHeight = Math.round(mapHeight * 0.3) + 'px';
            infoBox.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            infoBox.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        }
        
        const timeSelector = document.querySelector('.time-selector');
        if (timeSelector) {
            timeSelector.style.maxHeight = Math.round(mapHeight * 0.3) + 'px';
            timeSelector.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            timeSelector.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        }
    }, 500);
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
            // Force it to start collapsed on mobile
            layerControl.classList.remove('leaflet-control-layers-expanded');
            
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
            
            // Move layer control to top left to avoid overlapping with time selector
            setTimeout(() => {
                if (map && layerControl) {
                    // Get the control container and move it to top-left
                    const parent = layerControl.parentNode;
                    if (parent) {
                        parent.removeChild(layerControl);
                        document.querySelector('.leaflet-top.leaflet-left').appendChild(layerControl);
                    }
                }
            }, 100);
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
            
            // Move zoom control to bottom right to avoid overlapping with legend
            setTimeout(() => {
                if (map && map.zoomControl) {
                    map.zoomControl.setPosition('bottomright');
                }
            }, 100);
        }
        
        // Ensure attribution is visible but compact
        const attribution = document.querySelector('.leaflet-control-attribution');
        if (attribution) {
            attribution.style.fontSize = '9px';
            attribution.style.maxWidth = '200px';
            attribution.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
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

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
            if (values.length < 11) continue; // Asegurarse de que hay suficientes valores
            
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
                    accessibilityScore: parseFloat(values[9]),
                    publicTransport: parseInt(values[10])
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
            if (values.length < 11) continue; // Asegurarse de que hay suficientes valores
            
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
                    accessibilityScore: parseFloat(values[9]),
                    publicTransport: parseInt(values[10])
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
                accessibilityScore: 3.5,
                publicTransport: 2
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
                Transporte público: `;
                
            // Añadir iconos de transporte público basados en la puntuación
            for (let i = 0; i < location.publicTransport; i++) {
                popupContent += '<i class="fas fa-bus" style="color: #3388cc;"></i>';
            }
            
            const marker = L.marker([location.lat, location.lng], { icon: icon })
                .bindPopup(popupContent);
                
            // Añadir al cluster apropiado
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

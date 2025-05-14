// map.js - Análisis del Centro Comercial Santa Catarina Pinula

// Inicializar el mapa centrado en el centro comercial principal
const shoppingCenterCoords = [14.5604720, -90.4622219];
const map = L.map('map').setView(shoppingCenterCoords, 14);

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

// Añadir herramientas de dibujo
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polyline: false,
        marker: false,
        circlemarker: false
    }
});
map.addControl(drawControl);

// Manejar eventos de dibujo
map.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer;
    drawnItems.addLayer(layer);
});

// Crear clusters de marcadores para diferentes períodos de tiempo
const markerClusters = {
    overall: L.markerClusterGroup(),
    morning: L.markerClusterGroup(),
    midday: L.markerClusterGroup(),
    evening: L.markerClusterGroup()
};

// Añadir clusters de marcadores al mapa (solo "overall" es visible inicialmente)
map.addLayer(markerClusters.overall);

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

// Añadir marcador del centro comercial principal con ícono de carrito de compras
const mainShoppingIcon = L.divIcon({
    className: '',
    html: `<div style="background-color: red; color: white; 
          border-radius: 50%; width: 30px; height: 30px; 
          display: flex; justify-content: center; align-items: center;
          font-weight: bold; border: 1px solid white;">
          <i class="fas fa-shopping-cart"></i>
          </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

L.marker(shoppingCenterCoords, {
    icon: mainShoppingIcon
}).bindPopup('<b>Centro Comercial Santa Catarina Pinula</b>').addTo(map);

// Crear grupo de características para otros centros comerciales
const otherMalls = L.featureGroup();

// ==========================================
// SECCIÓN DE DATOS - Puntos residenciales
// ==========================================
const residentialData = [
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
        distance: 3.30
    },
    {
        name: 'Apartamentos Victoria', 
        lat: 14.568815, 
        lng: -90.449465, 
        times: {
            overall: 4.74, 
            morning: 5.92, 
            midday: 4.31, 
            evening: 4.00
        },
        distance: 2.30
    },
    {
        name: 'Bosques de las Luces', 
        lat: 14.565138, 
        lng: -90.461926, 
        times: {
            overall: 3.51, 
            morning: 3.50, 
            midday: 3.38, 
            evening: 3.67
        },
        distance: 0.50
    },
    {
        name: 'Condominio Basseterre', 
        lat: 14.570475, 
        lng: -90.460591, 
        times: {
            overall: 1.69, 
            morning: 2.08, 
            midday: 1.50, 
            evening: 1.50
        },
        distance: 1.20
    },
    {
        name: 'Condominio Las Luces', 
        lat: 14.56557, 
        lng: -90.467292, 
        times: {
            overall: 4.77, 
            morning: 4.81, 
            midday: 4.60, 
            evening: 4.89
        },
        distance: 0.71
    },
    {
        name: 'Laguna del Bosque', 
        lat: 14.565939, 
        lng: -90.436841, 
        times: {
            overall: 8.08, 
            morning: 9.58, 
            midday: 7.50, 
            evening: 7.17
        },
        distance: 3.80
    },
    {
        name: 'Lomas de Puerta Parada', 
        lat: 14.564795, 
        lng: -90.463375, 
        times: {
            overall: 3.54, 
            morning: 3.58, 
            midday: 3.38, 
            evening: 3.67
        },
        distance: 0.30
    },
    {
        name: 'Navani', 
        lat: 14.568753, 
        lng: -90.461195, 
        times: {
            overall: 2.86, 
            morning: 3.08, 
            midday: 2.75, 
            evening: 2.75
        },
        distance: 0.76
    },
    {
        name: 'Paseo Residencias', 
        lat: 14.568667, 
        lng: -90.458719, 
        times: {
            overall: 2.78, 
            morning: 3.33, 
            midday: 2.50, 
            evening: 2.50
        },
        distance: 0.92
    },
    {
        name: 'Portal de la Fuente', 
        lat: 14.569073, 
        lng: -90.461426, 
        times: {
            overall: 3.19, 
            morning: 3.50, 
            midday: 3.06, 
            evening: 3.00
        },
        distance: 1.00
    },
    {
        name: 'Residencial Monticello', 
        lat: 14.567752, 
        lng: -90.45663, 
        times: {
            overall: 2.95, 
            morning: 3.92, 
            midday: 2.44, 
            evening: 2.50
        },
        distance: 1.70
    },
    {
        name: 'Residencial Puerta Parada', 
        lat: 14.560377, 
        lng: -90.46189, 
        times: {
            overall: 1.86, 
            morning: 2.08, 
            midday: 1.75, 
            evening: 1.75
        },
        distance: 0.37
    },
    {
        name: 'Torre Metropolitano', 
        lat: 14.567692, 
        lng: -90.451683, 
        times: {
            overall: 5.18, 
            morning: 6.42, 
            midday: 4.63, 
            evening: 4.50
        },
        distance: 2.40
    },
    {
        name: 'Villa Lolita', 
        lat: 14.569411, 
        lng: -90.447349, 
        times: {
            overall: 5.14, 
            morning: 6.33, 
            midday: 4.75, 
            evening: 4.33
        },
        distance: 2.50
    },
    {
        name: 'Villas de Entreluces', 
        lat: 14.567379, 
        lng: -90.455048, 
        times: {
            overall: 4.45, 
            morning: 5.17, 
            midday: 3.94, 
            evening: 4.25
        },
        distance: 1.70
    },
    {
        name: 'Colegio Montessori', 
        lat: 14.5689, 
        lng: -90.4608, 
        times: {
            overall: 3.90, 
            morning: 4.54, 
            midday: 3.56, 
            evening: 3.58
        },
        distance: 1.00
    },
    {
        name: 'Colegio Metropolitano', 
        lat: 14.567197, 
        lng: -90.451689, 
        times: {
            overall: 5.94, 
            morning: 7.33, 
            midday: 5.25, 
            evening: 5.25
        },
        distance: 2.20
    },
    {
        name: 'Dalias Concepción', 
        lat: 14.5605372, 
        lng: -90.4548165, 
        times: {
            overall: 7.66, 
            morning: 8.89, 
            midday: 6.25, 
            evening: 7.83
        },
        distance: 2.90
    },
    {
        name: 'Buranas', 
        lat: 14.558837, 
        lng: -90.4486255, 
        times: {
            overall: 8.03, 
            morning: 8.89, 
            midday: 6.38, 
            evening: 8.83
        },
        distance: 2.60
    },
    {
        name: 'Westfalia', 
        lat: 14.5566677, 
        lng: -90.451649, 
        times: {
            overall: 6.59, 
            morning: 7.89, 
            midday: 5.06, 
            evening: 6.83
        },
        distance: 1.90
    },
    {
        name: 'Residenciales Los Altos', 
        lat: 14.5668769, 
        lng: -90.4703276, 
        times: {
            overall: 6.06, 
            morning: 5.75, 
            midday: 6.75, 
            evening: 5.67
        },
        distance: 4.80
    },
    {
        name: 'Colegio Maya', 
        lat: 14.569061, 
        lng: -90.4717094, 
        times: {
            overall: 6.18, 
            morning: 4.44, 
            midday: 7.67, 
            evening: 6.42
        },
        distance: 5.20
    },
    {
        name: 'Santa Rosalía', 
        lat: 14.5721473, 
        lng: -90.4702142, 
        times: {
            overall: 5.91, 
            morning: 4.22, 
            midday: 7.50, 
            evening: 6.00
        },
        distance: 2.20
    },
    {
        name: 'El Socorro', 
        lat: 14.5709003, 
        lng: -90.4719899, 
        times: {
            overall: 5.01, 
            morning: 3.89, 
            midday: 6.07, 
            evening: 5.08
        },
        distance: 2.40
    },
    {
        name: 'Hill Top', 
        lat: 14.571311, 
        lng: -90.4734143, 
        times: {
            overall: 5.82, 
            morning: 4.44, 
            midday: 6.93, 
            evening: 6.08
        },
        distance: 2.20
    },
    {
        name: 'Alto Valle', 
        lat: 14.5697766, 
        lng: -90.4760407, 
        times: {
            overall: 7.05, 
            morning: 5.44, 
            midday: 8.29, 
            evening: 7.42
        },
        distance: 2.80
    },
    {
        name: 'Vistas de Alto Valle', 
        lat: 14.5692856, 
        lng: -90.476022, 
        times: {
            overall: 7.61, 
            morning: 5.67, 
            midday: 9.07, 
            evening: 8.08
        },
        distance: 2.90
    },
    {
        name: 'Loma Real', 
        lat: 14.5657568, 
        lng: -90.4690817, 
        times: {
            overall: 4.99, 
            morning: 7.08, 
            midday: 3.88, 
            evening: 4.00
        },
        distance: 1.30
    },
    {
        name: 'Villas del Campo', 
        lat: 14.5667192, 
        lng: -90.4713597, 
        times: {
            overall: 5.14, 
            morning: 4.50, 
            midday: 5.50, 
            evening: 5.42
        },
        distance: 1.60
    },
    {
        name: 'Villas de San Francisco Javier', 
        lat: 14.5695535, 
        lng: -90.4741135, 
        times: {
            overall: 6.86, 
            morning: 5.50, 
            midday: 7.75, 
            evening: 7.33
        },
        distance: 2.70
    },
    {
        name: 'El Casco', 
        lat: 14.5690031, 
        lng: -90.4735373, 
        times: {
            overall: 5.14, 
            morning: 4.50, 
            midday: 5.50, 
            evening: 5.42
        },
        distance: 1.70
    },
    {
        name: 'Forest Hill', 
        lat: 14.564695, 
        lng: -90.4696137, 
        times: {
            overall: 3.00, 
            morning: 3.00, 
            midday: 3.00, 
            evening: 3.00
        },
        distance: 1.40
    },
    {
        name: 'Residencial Valle Bello', 
        lat: 14.564712, 
        lng: -90.4703695, 
        times: {
            overall: 3.00, 
            morning: 3.00, 
            midday: 3.00, 
            evening: 3.00
        },
        distance: 1.50
    },
    {
        name: 'Residenciales Royal Hill', 
        lat: 14.5637283, 
        lng: -90.4704284, 
        times: {
            overall: 3.00, 
            morning: 3.00, 
            midday: 3.00, 
            evening: 3.00
        },
        distance: 1.60
    }
];

// ==========================================
// SECCIÓN DE DATOS - Centros comerciales
// ==========================================
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

// ==========================================
// Añadir marcadores residenciales a los clusters
// ==========================================
residentialData.forEach(location => {
    // Crear marcadores para cada período de tiempo con colores apropiados para ese período
    const periods = ['overall', 'morning', 'midday', 'evening'];
    
    periods.forEach(period => {
        const timeValue = location.times[period];
        const icon = createTimeIcon(timeValue);
        
        const marker = L.marker([location.lat, location.lng], { icon: icon })
            .bindPopup(`
                <b>${location.name}</b><br>
                Tiempo de viaje: ${timeValue.toFixed(1)} minutos<br>
                Distancia: ${location.distance} km
            `);
            
        // Añadir al cluster apropiado
        markerClusters[period].addLayer(marker);
    });
});

// ==========================================
// Añadir otros centros comerciales
// ==========================================
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

// Añadir capa de centros comerciales al mapa (inicialmente visible)
otherMalls.addTo(map);

// ==========================================
// Crear mapa de calor
// ==========================================
const heatData = residentialData.map(location => {
    return [location.lat, location.lng, location.times.overall]; 
});

let heatMap = L.heatLayer(heatData, {
    radius: 25,
    blur: 15,
    maxZoom: 17,
    gradient: {0.2: 'green', 0.5: 'blue', 0.8: 'red'}
});

// Añadir mapa de calor al mapa (inicialmente oculto)
// map.addLayer(heatMap);

// ==========================================
// Añadir controles de capas
// ==========================================
const overlayMaps = {
    "Promedio General": markerClusters.overall,
    "Hora Pico Matutina (7-9 AM)": markerClusters.morning,
    "Medio Día (11 AM-2 PM)": markerClusters.midday,
    "Hora Pico Vespertina (5-7 PM)": markerClusters.evening,
    "Otros Centros Comerciales": otherMalls,
    "Mapa de Calor": heatMap
};

// Añadir control de capas al mapa
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
    position: 'topright'
}).addTo(map);

// ==========================================
// Funcionalidad del selector de período de tiempo
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('updateTimeView').addEventListener('click', function() {
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
        if (map.hasLayer(heatMap)) {
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
                'morning': 'Hora Pico Matutina (7-9 AM)',
                'midday': 'Medio Día (11 AM-2 PM)',
                'evening': 'Hora Pico Vespertina (5-7 PM)'
            }[selectedTime];
            
            titleElement.textContent = `Análisis del Centro Comercial Santa Catarina Pinula - ${timePeriodText}`;
        }
        
        console.log(`Cambió a vista ${selectedTime}`); // Ayuda para depuración
    });
});

// Añadir un control de escala
L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);
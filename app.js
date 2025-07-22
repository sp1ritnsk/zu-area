/**
 * Polygon Area Measurement Application
 * Professional geodesic area and distance calculation tool using OpenLayers and GeographicLib
 */

// Application Configuration
const CONFIG = {
    map: {
        center: [71.4491, 51.1694], // Astana coordinates
        zoom: 12,
        projection: 'EPSG:3857'
    },
    geodesic: {
        targetProjection: 'EPSG:4326'
    },
    ui: {
        messageTimeout: 2000
    }
};

// Application State
const AppState = {
    interactions: {
        draw: null,
        modify: null,
        select: null
    },
    polygonCount: 0,
    units: {
        area: 'auto',
        length: 'auto'
    }
};

// Map and Layer Setup
class MapManager {
    constructor() {
        this.map = this.initializeMap();
        this.vectorSource = new ol.source.Vector();
        this.vectorLayer = this.createVectorLayer();
        this.map.addLayer(this.vectorLayer);
    }

    initializeMap() {
        return new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat(CONFIG.map.center),
                zoom: CONFIG.map.zoom
            })
        });
    }

    createVectorLayer() {
        return new ol.layer.Vector({
            source: this.vectorSource,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(0, 122, 204, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#007acc',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#007acc'
                    })
                })
            })
        });
    }

    getMap() {
        return this.map;
    }

    getVectorSource() {
        return this.vectorSource;
    }

    getVectorLayer() {
        return this.vectorLayer;
    }
}

// Geodesic Calculations
class GeodesicCalculator {
    constructor() {
        this.geod = GeographicLib.Geodesic.WGS84;
    }

    calculateArea(polygon) {
        const workingPolygon = this.transformToWGS84(polygon);
        const coordinates = workingPolygon.getCoordinates()[0];
        
        const geodPolygon = this.geod.Polygon(false);
        coordinates.forEach(coord => {
            geodPolygon.AddPoint(coord[1], coord[0]); // lat, lon
        });
        
        const result = geodPolygon.Compute(false, true);
        return Math.abs(result.area);
    }

    calculateDistance(coord1, coord2) {
        const lonLat1 = ol.proj.toLonLat(coord1);
        const lonLat2 = ol.proj.toLonLat(coord2);
        
        const result = this.geod.Inverse(lonLat1[1], lonLat1[0], lonLat2[1], lonLat2[0]);
        return result.s12;
    }

    transformToWGS84(polygon) {
        const currentProjection = polygon.getProjection?.() || CONFIG.map.projection;
        
        if (currentProjection !== CONFIG.geodesic.targetProjection) {
            return polygon.clone().transform(currentProjection, CONFIG.geodesic.targetProjection);
        }
        
        return polygon;
    }
}

// Measurement Formatting
class MeasurementFormatter {
    static formatArea(area, unit = AppState.units.area) {
        const conversions = {
            'm2': () => area.toFixed(0) + ' м²',
            'ha': () => (area / 10000).toFixed(3) + ' га',
            'km2': () => (area / 1000000).toFixed(3) + ' км²',
            'auto': () => {
                if (area > 1000000) return (area / 1000000).toFixed(3) + ' км²';
                if (area > 10000) return (area / 10000).toFixed(3) + ' га';
                return area.toFixed(0) + ' м²';
            }
        };

        return conversions[unit]?.() || conversions.auto();
    }

    static formatLength(length, unit = AppState.units.length) {
        const conversions = {
            'm': () => length.toFixed(3) + ' м',
            'km': () => (length / 1000).toFixed(3) + ' км',
            'auto': () => {
                if (length > 1000) return (length / 1000).toFixed(3) + ' км';
                return length.toFixed(3) + ' м';
            }
        };

        return conversions[unit]?.() || conversions.auto();
    }
}

// Measurement Overlay Manager
class MeasurementManager {
    constructor(map, calculator) {
        this.map = map;
        this.calculator = calculator;
    }

    createOverlays(feature) {
        const geometry = feature.getGeometry();
        const coordinates = geometry.getCoordinates()[0];
        
        const area = this.calculator.calculateArea(geometry);
        const edgeLengths = this.calculateEdgeLengths(coordinates);
        
        const areaOverlay = this.createAreaOverlay(geometry, area);
        const lengthOverlays = this.createLengthOverlays(coordinates, edgeLengths);
        
        this.map.addOverlay(areaOverlay);
        lengthOverlays.forEach(overlay => this.map.addOverlay(overlay));
        
        feature.set('measurementOverlays', {
            area: areaOverlay,
            lengths: lengthOverlays
        });
    }

    calculateEdgeLengths(coordinates) {
        const lengths = [];
        for (let i = 0; i < coordinates.length - 1; i++) {
            const length = this.calculator.calculateDistance(
                coordinates[i], 
                coordinates[(i + 1) % (coordinates.length - 1)]
            );
            lengths.push(length);
        }
        return lengths;
    }

    createAreaOverlay(geometry, area) {
        const centroid = geometry.getInteriorPoint().getCoordinates();
        return new ol.Overlay({
            position: centroid,
            element: this.createElement(`Площадь: ${MeasurementFormatter.formatArea(area)}`, 'area-label'),
            positioning: 'center-center'
        });
    }

    createLengthOverlays(coordinates, edgeLengths) {
        const overlays = [];
        for (let i = 0; i < coordinates.length - 1; i++) {
            const start = coordinates[i];
            const end = coordinates[(i + 1) % (coordinates.length - 1)];
            const midpoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
            
            const overlay = new ol.Overlay({
                position: midpoint,
                element: this.createElement(MeasurementFormatter.formatLength(edgeLengths[i]), 'length-label'),
                positioning: 'center-center'
            });
            overlays.push(overlay);
        }
        return overlays;
    }

    createElement(text, className) {
        const element = document.createElement('div');
        element.className = `measurement-label ${className}`;
        element.textContent = text;
        
        const baseStyles = {
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        };

        const specificStyles = className === 'area-label' 
            ? { backgroundColor: 'rgba(0, 122, 204, 0.9)', fontSize: '13px' }
            : { backgroundColor: 'rgba(255, 107, 53, 0.9)' };

        Object.assign(element.style, baseStyles, specificStyles);
        return element;
    }

    removeAllOverlays() {
        const overlays = this.map.getOverlays().getArray().slice();
        overlays.forEach(overlay => {
            if (overlay.getElement()?.classList.contains('measurement-label')) {
                this.map.removeOverlay(overlay);
            }
        });
    }

    updateFeatureOverlays(feature) {
        const overlays = feature.get('measurementOverlays');
        
        if (overlays) {
            // Remove old overlays
            this.map.removeOverlay(overlays.area);
            overlays.lengths.forEach(overlay => this.map.removeOverlay(overlay));
            
            // Create new overlays with updated measurements
            setTimeout(() => this.createOverlays(feature), 50);
        }
    }

    updateAllOverlays(features) {
        features.forEach(feature => {
            const geometry = feature.getGeometry();
            const overlays = feature.get('measurementOverlays');
            
            if (overlays) {
                // Update area overlay
                const area = this.calculator.calculateArea(geometry);
                if (overlays.area?.getElement()) {
                    overlays.area.getElement().textContent = `Площадь: ${MeasurementFormatter.formatArea(area)}`;
                }
                
                // Update length overlays
                const coordinates = geometry.getCoordinates()[0];
                const edgeLengths = this.calculateEdgeLengths(coordinates);
                
                overlays.lengths.forEach((lengthOverlay, i) => {
                    if (lengthOverlay.getElement() && i < edgeLengths.length) {
                        lengthOverlay.getElement().textContent = MeasurementFormatter.formatLength(edgeLengths[i]);
                    }
                });
            }
        });
    }
}

// Interaction Manager
class InteractionManager {
    constructor(map, vectorSource, vectorLayer, measurementManager) {
        this.map = map;
        this.vectorSource = vectorSource;
        this.vectorLayer = vectorLayer;
        this.measurementManager = measurementManager;
    }

    createDrawInteraction() {
        const interaction = new ol.interaction.Draw({
            source: this.vectorSource,
            type: 'Polygon',
            style: new ol.style.Style({
                fill: new ol.style.Fill({ color: 'rgba(255, 107, 53, 0.2)' }),
                stroke: new ol.style.Stroke({ color: '#ff6b35', width: 2, lineDash: [5, 5] }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({ color: '#ff6b35', width: 2 }),
                    fill: new ol.style.Fill({ color: '#fff' })
                })
            })
        });

        interaction.on('drawend', (event) => {
            AppState.polygonCount++;
            UIManager.updatePolygonCount();
            
            setTimeout(() => this.measurementManager.createOverlays(event.feature), 50);
            
            setTimeout(() => {
                this.removeInteraction('draw');
                UIManager.deactivateButton('draw-polygon');
            }, 100);
        });

        return interaction;
    }

    createSelectInteraction() {
        return new ol.interaction.Select({
            layers: [this.vectorLayer],
            style: new ol.style.Style({
                fill: new ol.style.Fill({ color: 'rgba(255, 215, 0, 0.3)' }),
                stroke: new ol.style.Stroke({ color: '#ffd700', width: 3 }),
                image: new ol.style.Circle({
                    radius: 8,
                    fill: new ol.style.Fill({ color: '#ffd700' }),
                    stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                })
            })
        });
    }

    createModifyInteraction(selectInteraction) {
        const interaction = new ol.interaction.Modify({
            features: selectInteraction.getFeatures(),
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 8,
                    fill: new ol.style.Fill({ color: '#ff6b35' }),
                    stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                })
            })
        });

        interaction.on('modifyend', (event) => {
            event.features.forEach(feature => {
                this.measurementManager.updateFeatureOverlays(feature);
            });
        });

        return interaction;
    }

    addInteraction(type) {
        this.removeAllInteractions();

        switch (type) {
            case 'draw':
                AppState.interactions.draw = this.createDrawInteraction();
                this.map.addInteraction(AppState.interactions.draw);
                break;
                
            case 'modify':
                AppState.interactions.select = this.createSelectInteraction();
                AppState.interactions.modify = this.createModifyInteraction(AppState.interactions.select);
                this.map.addInteraction(AppState.interactions.select);
                this.map.addInteraction(AppState.interactions.modify);
                UIManager.showMessage('Кликните на полигон для выбора и редактирования');
                break;
        }
    }

    removeInteraction(type) {
        const interaction = AppState.interactions[type];
        if (interaction) {
            this.map.removeInteraction(interaction);
            AppState.interactions[type] = null;
        }

        if (type === 'modify') {
            this.removeInteraction('select');
        }
    }

    removeAllInteractions() {
        Object.keys(AppState.interactions).forEach(type => {
            this.removeInteraction(type);
        });
    }

    clearAll() {
        this.vectorSource.clear();
        AppState.polygonCount = 0;
        UIManager.updatePolygonCount();
        this.measurementManager.removeAllOverlays();
        this.removeAllInteractions();
        UIManager.deactivateAllButtons();
        UIManager.showMessage('Все полигоны очищены!');
    }
}

// UI Manager
class UIManager {
    static updatePolygonCount() {
        document.getElementById('polygon-count').textContent = `Нарисовано полигонов: ${AppState.polygonCount}`;
    }

    static showMessage(text) {
        const message = document.createElement('div');
        message.textContent = text;
        
        const styles = {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: '2000',
            fontSize: '14px',
            pointerEvents: 'none'
        };

        Object.assign(message.style, styles);
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, CONFIG.ui.messageTimeout);
    }

    static activateButton(buttonId) {
        document.getElementById(buttonId).classList.add('active');
    }

    static deactivateButton(buttonId) {
        document.getElementById(buttonId).classList.remove('active');
    }

    static deactivateAllButtons() {
        ['draw-polygon', 'edit-polygon'].forEach(id => {
            this.deactivateButton(id);
        });
    }

    static setupEventListeners(app) {
        // Button event listeners
        document.getElementById('draw-polygon').addEventListener('click', () => app.toggleDraw());
        document.getElementById('edit-polygon').addEventListener('click', () => app.toggleEdit());
        document.getElementById('clear-all').addEventListener('click', () => app.clearAll());

        // Unit selector event listeners
        document.getElementById('area-units').addEventListener('change', (event) => {
            AppState.units.area = event.target.value;
            app.updateAllMeasurements();
        });

        document.getElementById('length-units').addEventListener('change', (event) => {
            AppState.units.length = event.target.value;
            app.updateAllMeasurements();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.altKey) return;

            const keyActions = {
                'Escape': () => app.cancelCurrentAction(),
                'd': () => app.toggleDraw(),
                'D': () => app.toggleDraw(),
                'e': () => app.toggleEdit(),
                'E': () => app.toggleEdit(),
                'c': () => app.clearAll(),
                'C': () => app.clearAll()
            };

            const action = keyActions[event.key];
            if (action) {
                action();
                event.preventDefault();
            }
        });
    }
}

// Main Application Class
class PolygonMeasurementApp {
    constructor() {
        this.mapManager = new MapManager();
        this.calculator = new GeodesicCalculator();
        this.measurementManager = new MeasurementManager(
            this.mapManager.getMap(), 
            this.calculator
        );
        this.interactionManager = new InteractionManager(
            this.mapManager.getMap(),
            this.mapManager.getVectorSource(),
            this.mapManager.getVectorLayer(),
            this.measurementManager
        );

        this.init();
    }

    init() {
        UIManager.setupEventListeners(this);
        this.setupMapClickHandler();
    }

    setupMapClickHandler() {
        this.mapManager.getMap().on('click', (event) => {
            // For future debugging or feature extensions
        });
    }

    toggleDraw() {
        if (AppState.interactions.draw) {
            this.interactionManager.removeInteraction('draw');
            UIManager.deactivateButton('draw-polygon');
        } else {
            this.interactionManager.addInteraction('draw');
            UIManager.deactivateButton('edit-polygon');
            UIManager.activateButton('draw-polygon');
        }
    }

    toggleEdit() {
        if (AppState.interactions.modify) {
            this.interactionManager.removeInteraction('modify');
            UIManager.deactivateButton('edit-polygon');
        } else {
            this.interactionManager.addInteraction('modify');
            UIManager.deactivateButton('draw-polygon');
            UIManager.activateButton('edit-polygon');
        }
    }

    clearAll() {
        this.interactionManager.clearAll();
    }

    cancelCurrentAction() {
        this.interactionManager.removeAllInteractions();
        UIManager.deactivateAllButtons();
    }

    updateAllMeasurements() {
        const features = this.mapManager.getVectorSource().getFeatures();
        this.measurementManager.updateAllOverlays(features);
    }
}

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        new PolygonMeasurementApp();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        UIManager.showMessage('Ошибка инициализации приложения');
    }
});

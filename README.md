# Polygon Area Measurement Tool

🌍 Professional geodesic area and distance calculation tool using OpenLayers and GeographicLib

## 🎯 Live Demo

**[View Live Demo](https://sp1ritnsk.github.io/zu-area/)**

## ✨ Features

- **🗺️ Interactive Map**: OpenStreetMap-based mapping interface centered on Astana
- **📐 Geodesic Calculations**: Precise area and perimeter calculations on WGS84 spheroid using GeographicLib
- **🖊️ Polygon Drawing**: Draw custom polygons with real-time measurements
- **✏️ Polygon Editing**: Modify existing polygons with live measurement updates
- **📏 Multiple Units**: Support for automatic, metric, and custom unit display
- **🌐 Russian Interface**: Fully localized Russian language interface
- **📱 Responsive Design**: Professional glassmorphism UI that works on all devices
- **⌨️ Keyboard Shortcuts**: Efficient workflow with hotkeys

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/zu-area.git
   cd zu-area
   ```

2. **Open in browser**:
   Simply open `index.html` in any modern web browser

3. **Start measuring**:
   - Click the draw icon to create polygons
   - Click the edit icon to modify existing polygons
   - Select units from dropdown menus

## 🎮 How to Use

### Drawing Polygons
1. Click the **draw polygon** icon (📝) to enter drawing mode
2. Click on the map to add points to your polygon
3. Double-click to complete the polygon
4. View real-time area and edge length measurements

### Editing Polygons
1. Click the **edit polygon** icon (✏️) to enter edit mode
2. Click on any polygon to select it
3. Drag vertices to modify the shape
4. Measurements update automatically

### Keyboard Shortcuts
- **D**: Toggle polygon drawing mode
- **E**: Toggle polygon editing mode  
- **C**: Clear all polygons
- **Escape**: Cancel current action

## 🏗️ Technical Architecture

### Core Technologies
- **OpenLayers 9.0.0**: Modern web mapping library
- **GeographicLib 1.52.2**: High-precision geodesic calculations
- **ES6+ Classes**: Professional object-oriented architecture
- **CSS3**: Glassmorphism design with responsive layout

### Key Components
- **MapManager**: Map and layer management
- **GeodesicCalculator**: Precise spheroid calculations
- **MeasurementManager**: Overlay and label management
- **InteractionManager**: User interaction handling
- **UIManager**: Interface and event management

### Coordinate Systems
- **Display**: Web Mercator (EPSG:3857)
- **Calculations**: WGS84 Geographic (EPSG:4326)
- **Precision**: Geodesic calculations on WGS84 spheroid

### Measurement Features
- **Area Units**: Square meters, hectares, square kilometers, auto-scaling
- **Length Units**: Meters, kilometers, auto-scaling
- **Real-time Updates**: Live measurement updates during polygon editing
- **High Precision**: GeographicLib ensures survey-grade accuracy

## 📁 Project Structure

```
zu-area/
├── index.html          # Main application interface
├── style.css           # Glassmorphism styling and responsive design
├── app.js              # Professional OOP application architecture
├── README.md           # Documentation
└── .gitignore          # Git ignore patterns
```

## 🛠️ Development

### Prerequisites
- Modern web browser with ES6+ support
- No build tools required - runs directly in browser

### Architecture Highlights
- **SOLID Principles**: Clean, maintainable, extensible code
- **Separation of Concerns**: Modular class-based architecture
- **Error Handling**: Robust error handling and user feedback
- **State Management**: Centralized application state
- **Configuration**: Centralized configuration management

### Code Quality
- Professional OOP design patterns
- Comprehensive error handling
- Clean, documented codebase
- Scalable and maintainable architecture

## 🎯 Use Cases

- **Land Surveying**: Calculate precise land area measurements
- **Urban Planning**: Measure development zones and districts
- **Agriculture**: Calculate field and crop area sizes
- **Real Estate**: Measure property boundaries and areas
- **Education**: Demonstrate geodesic calculations and mapping
- **Research**: Geographic analysis and spatial measurements

## 🌟 Features Showcase

- **Professional UI**: Modern glassmorphism design with intuitive icons
- **Geodesic Accuracy**: Survey-grade precision using GeographicLib
- **Real-time Feedback**: Live measurements during drawing and editing
- **Multilingual**: Russian language interface
- **Mobile Ready**: Responsive design for all screen sizes
- **Keyboard Efficiency**: Comprehensive hotkey support

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Built with ❤️ using OpenLayers and GeographicLib*

## Browser Compatibility

This application works in all modern browsers that support:
- ES6+ JavaScript features
- HTML5 Fullscreen API
- CSS3 features (flexbox, transforms, etc.)

## Development

To modify the application:

1. **Map Settings**: Edit the initial view center and zoom in `app.js`
2. **Styling**: Modify polygon and UI styles in `style.css` and `app.js`
3. **Features**: Add new drawing tools or map layers in `app.js`

## License

This project is open source and available under the MIT License.

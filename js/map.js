// Map Module
// Handles Leaflet map rendering, district visualization, and interactions

export class MapManager {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
        this.map = null;
        this.geoJsonLayer = null;
        this.markersLayer = null;
        this.selectedDistrictId = null;
        this.vizMode = 'party';
        this.filteredDistricts = [];

        // Approximate coordinates for state centers (for marker fallback)
        this.stateCoords = {
            'Montana': [46.8797, -110.3626],
            'California': [36.7783, -119.4179],
            'Texas': [31.9686, -99.9018],
            'New York': [42.1657, -74.9481],
            'Florida': [27.6648, -81.5158],
            'Pennsylvania': [41.2033, -77.1945],
            'Ohio': [40.4173, -82.9071]
        };
    }

    initialize() {
        // Initialize Leaflet map
        this.map = L.map('map', {
            preferCanvas: true,
            zoomControl: true
        }).setView([39.8283, -98.5795], 4);

        // Add base tile layer (CartoDB Positron - light and clean)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(this.map);

        // Create marker layer group
        this.markersLayer = L.layerGroup().addTo(this.map);

        // Initialize legend
        this.updateLegend();

        console.log('Map initialized');
    }

    updateDistricts(districts, vizMode = 'party') {
        this.filteredDistricts = districts;
        this.vizMode = vizMode;

        // Clear existing markers
        if (this.markersLayer) {
            this.markersLayer.clearLayers();
        }

        // For now, use markers since we don't have GeoJSON
        // Group districts by state to avoid overlapping markers
        const districtsByState = {};
        districts.forEach(district => {
            if (!districtsByState[district.state]) {
                districtsByState[district.state] = [];
            }
            districtsByState[district.state].push(district);
        });

        // Add markers for each state's districts
        Object.entries(districtsByState).forEach(([state, stateDistricts]) => {
            const baseCoords = this.stateCoords[state];
            if (!baseCoords) return;

            stateDistricts.forEach((district, index) => {
                // Offset markers slightly so they don't overlap
                const offset = index * 0.3;
                const lat = baseCoords[0] + Math.sin(index) * offset;
                const lng = baseCoords[1] + Math.cos(index) * offset;

                const color = this.getDistrictColor(district);
                const marker = L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.7,
                    districtId: district.id
                });

                // Add popup
                marker.bindPopup(this.createPopupContent(district));

                // Add click handler
                marker.on('click', () => {
                    this.selectDistrict(district.id);
                });

                // Add hover effects
                marker.on('mouseover', function() {
                    this.setStyle({
                        fillOpacity: 0.9,
                        radius: 10
                    });
                });

                marker.on('mouseout', function() {
                    this.setStyle({
                        fillOpacity: 0.7,
                        radius: 8
                    });
                });

                marker.addTo(this.markersLayer);
            });
        });

        this.updateLegend();
        console.log(`Map updated with ${districts.length} districts`);
    }

    getDistrictColor(district) {
        switch (this.vizMode) {
            case 'party':
                return district.party === 'Republican' ? '#E91D0E' : '#232066';

            case 'pvi':
                return this.getPVIColor(district.pvi_numeric);

            case 'income':
                return this.getIncomeColor(district.demographics?.median_income || 0);

            case 'margin':
                const margin = district.elections?.['2024']?.margin || 0;
                return this.getMarginColor(margin);

            default:
                return '#808080';
        }
    }

    getPVIColor(pviNumeric) {
        // Gradient from deep blue (D+30) to deep red (R+30)
        if (pviNumeric === 0) return '#9370DB'; // Even - purple

        const intensity = Math.min(Math.abs(pviNumeric) / 30, 1);

        if (pviNumeric > 0) {
            // Republican - interpolate to red
            const r = Math.round(233);
            const g = Math.round(29 * (1 - intensity));
            const b = Math.round(14 * (1 - intensity));
            return `rgb(${r},${g},${b})`;
        } else {
            // Democratic - interpolate to blue
            const r = Math.round(35 * (1 - intensity));
            const g = Math.round(32 * (1 - intensity));
            const b = Math.round(102 + (153 * intensity));
            return `rgb(${r},${g},${b})`;
        }
    }

    getIncomeColor(income) {
        // Green gradient based on income
        const normalized = Math.min(income / 120000, 1);
        const g = Math.round(100 + (155 * normalized));
        return `rgb(50,${g},50)`;
    }

    getMarginColor(margin) {
        // Purple gradient - closer races are lighter
        const absMargin = Math.abs(margin);
        const competitive = absMargin < 10;

        if (competitive) {
            return '#FFD700'; // Gold for competitive
        } else if (absMargin < 20) {
            return '#FFA500'; // Orange
        } else {
            return '#8B0000'; // Dark red for safe
        }
    }

    createPopupContent(district) {
        const pviClass = district.party === 'Republican' ? 'party-republican' : 'party-democratic';

        return `
            <div class="district-popup">
                <h3>${district.id}</h3>
                <div class="popup-field">
                    <span class="popup-label">State:</span>
                    <span class="popup-value">${district.state}</span>
                </div>
                <div class="popup-field">
                    <span class="popup-label">Representative:</span>
                    <span class="popup-value">${district.representative}</span>
                </div>
                <div class="popup-field">
                    <span class="popup-label">Party:</span>
                    <span class="popup-value ${pviClass}">${district.party}</span>
                </div>
                <div class="popup-field">
                    <span class="popup-label">Cook PVI:</span>
                    <span class="popup-value">${district.pvi}</span>
                </div>
                <div class="popup-field">
                    <span class="popup-label">Population:</span>
                    <span class="popup-value">${this.dataLoader.formatNumber(district.demographics?.population)}</span>
                </div>
                <div class="popup-field">
                    <span class="popup-label">Median Income:</span>
                    <span class="popup-value">${this.dataLoader.formatCurrency(district.demographics?.median_income)}</span>
                </div>
                <div class="popup-field">
                    <span class="popup-label">2024 Margin:</span>
                    <span class="popup-value">${district.elections?.['2024']?.margin?.toFixed(1)}%</span>
                </div>
            </div>
        `;
    }

    selectDistrict(districtId) {
        this.selectedDistrictId = districtId;

        // Highlight the selected marker
        this.markersLayer.eachLayer(layer => {
            if (layer.options.districtId === districtId) {
                layer.setStyle({
                    weight: 4,
                    color: '#FFD700',
                    fillOpacity: 1
                });
                layer.openPopup();
            } else {
                layer.setStyle({
                    weight: 2,
                    color: '#fff',
                    fillOpacity: 0.7
                });
            }
        });

        // Dispatch event for synchronization
        window.dispatchEvent(new CustomEvent('districtSelected', {
            detail: { districtId, source: 'map' }
        }));
    }

    clearSelection() {
        this.selectedDistrictId = null;
        this.markersLayer.eachLayer(layer => {
            layer.setStyle({
                weight: 2,
                color: '#fff',
                fillOpacity: 0.7
            });
            layer.closePopup();
        });
    }

    updateLegend() {
        const legendEl = document.getElementById('map-legend');
        if (!legendEl) return;

        let legendHTML = '<h4>Legend</h4>';

        switch (this.vizMode) {
            case 'party':
                legendHTML += `
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #E91D0E;"></div>
                        <span>Republican</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #232066;"></div>
                        <span>Democratic</span>
                    </div>
                `;
                break;

            case 'pvi':
                legendHTML += `
                    <div class="legend-item">
                        <div class="legend-gradient" style="background: linear-gradient(to right, #232066, #9370DB, #E91D0E);"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.75em;">
                        <span>D+30</span>
                        <span>EVEN</span>
                        <span>R+30</span>
                    </div>
                `;
                break;

            case 'income':
                legendHTML += `
                    <div class="legend-item">
                        <div class="legend-gradient" style="background: linear-gradient(to right, #326432, #64FF64);"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.75em;">
                        <span>Lower</span>
                        <span>Higher</span>
                    </div>
                `;
                break;

            case 'margin':
                legendHTML += `
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #FFD700;"></div>
                        <span>Competitive (&lt;10%)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #FFA500;"></div>
                        <span>Lean (10-20%)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #8B0000;"></div>
                        <span>Safe (&gt;20%)</span>
                    </div>
                `;
                break;
        }

        legendEl.innerHTML = legendHTML;
    }

    setVisualizationMode(mode) {
        this.vizMode = mode;
        this.updateDistricts(this.filteredDistricts, mode);
    }

    flyToDistrict(districtId) {
        const district = this.dataLoader.getDistrictById(districtId);
        if (!district) return;

        const coords = this.stateCoords[district.state];
        if (coords) {
            this.map.flyTo(coords, 6, {
                duration: 1
            });
        }
    }
}

export default MapManager;

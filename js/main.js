// Main Application Module
// Initializes and coordinates all components

import { DataLoader } from './data-loader.js?v=1767900164';
import { MapManager } from './map.js?v=1767900164';
import { TableManager } from './table.js?v=1767900164';
import { SyncManager } from './sync.js?v=1767900164';
import { FilterManager } from './filters.js?v=1767900164';

class CongressionalDistrictsApp {
    constructor() {
        this.dataLoader = null;
        this.mapManager = null;
        this.tableManager = null;
        this.syncManager = null;
        this.filterManager = null;
        this.currentVizMode = 'party';
    }

    async initialize() {
        try {
            console.log('Initializing Congressional Districts Explorer...');

            // Show loading state
            console.log('1. Showing loading state...');
            this.showLoading();

            // Initialize data loader
            console.log('2. Initializing data loader...');
            this.dataLoader = new DataLoader();

            // Load district data
            console.log('3. Loading district data...');
            await this.dataLoader.loadDistrictData();
            console.log('   ✓ Data loaded:', this.dataLoader.getAllDistricts().length, 'districts');

            // Initialize managers
            console.log('4. Initializing managers...');
            this.mapManager = new MapManager(this.dataLoader);
            this.tableManager = new TableManager(this.dataLoader);
            this.filterManager = new FilterManager(this.dataLoader);
            console.log('   ✓ Managers created');

            // Initialize components
            console.log('5. Initializing map...');
            this.mapManager.initialize();
            console.log('   ✓ Map initialized');

            console.log('6. Initializing table...');
            this.tableManager.initialize();
            console.log('   ✓ Table initialized');

            // Set up synchronization
            console.log('7. Setting up synchronization...');
            this.syncManager = new SyncManager(this.mapManager, this.tableManager);
            console.log('   ✓ Sync initialized');

            // Load data into filters
            console.log('8. Setting up filters...');
            this.filterManager.setDistricts(this.dataLoader.getAllDistricts());
            console.log('   ✓ Filters initialized');

            // Set up event listeners
            console.log('9. Setting up event listeners...');
            this.setupEventListeners();
            console.log('   ✓ Event listeners set up');

            // Initial render
            console.log('10. Rendering initial views...');
            const allDistricts = this.dataLoader.getAllDistricts();
            this.updateViews(allDistricts);
            this.updateStats(allDistricts);
            console.log('   ✓ Views rendered');

            // Hide loading state
            console.log('11. Hiding loading state...');
            this.hideLoading();

            console.log('✓ Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
            console.error('Stack trace:', error.stack);
            this.hideLoading();
            this.showError(`Failed to initialize application: ${error.message}. Check console for details.`);
        }
    }

    setupEventListeners() {
        // Listen for filter changes
        window.addEventListener('filtersChanged', (event) => {
            const filteredDistricts = event.detail.districts;
            this.updateViews(filteredDistricts);
            this.updateStats(filteredDistricts);
        });

        // Visualization mode selector
        const vizModeSelect = document.getElementById('viz-mode');
        if (vizModeSelect) {
            vizModeSelect.addEventListener('change', (e) => {
                this.currentVizMode = e.target.value;
                this.mapManager.setVisualizationMode(this.currentVizMode);
            });
        }

        console.log('Event listeners set up');
    }

    updateViews(districts) {
        // Update map
        this.mapManager.updateDistricts(districts, this.currentVizMode);

        // Update table
        this.tableManager.updateDistricts(districts);
    }

    updateStats(districts) {
        const stats = this.dataLoader.calculateStats(districts);

        // Update stat displays
        document.getElementById('stat-count').textContent = stats.count;
        document.getElementById('stat-rep').textContent = stats.republicanCount;
        document.getElementById('stat-dem').textContent = stats.democraticCount;

        // Format PVI display
        const pviValue = parseFloat(stats.avgPVI);
        let pviDisplay;
        if (pviValue === 0) {
            pviDisplay = 'EVEN';
        } else if (pviValue > 0) {
            pviDisplay = `R+${Math.abs(pviValue).toFixed(1)}`;
        } else {
            pviDisplay = `D+${Math.abs(pviValue).toFixed(1)}`;
        }
        document.getElementById('stat-pvi').textContent = pviDisplay;

        console.log('Stats updated:', stats);
    }

    showLoading() {
        // Add loading overlay without destroying existing structure
        const mapContainer = document.querySelector('.map-container');
        const tableContainer = document.querySelector('.table-container');

        if (mapContainer && !mapContainer.querySelector('.loading-overlay')) {
            mapContainer.insertAdjacentHTML('afterbegin', '<div class="loading-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); display: flex; justify-content: center; align-items: center; z-index: 9999;"><div class="loading">Loading map...</div></div>');
        }

        if (tableContainer && !tableContainer.querySelector('.loading-overlay')) {
            tableContainer.insertAdjacentHTML('afterbegin', '<div class="loading-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); display: flex; justify-content: center; align-items: center; z-index: 9999;"><div class="loading">Loading data...</div></div>');
        }
    }

    hideLoading() {
        const loadingElements = document.querySelectorAll('.loading-overlay');
        loadingElements.forEach(el => el.remove());
    }

    showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            container.insertAdjacentHTML('afterbegin', `
                <div class="alert alert-error" style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <strong>Error:</strong> ${message}
                </div>
            `);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all libraries to be loaded
    const checkLibraries = () => {
        if (typeof jQuery === 'undefined') {
            console.error('jQuery not loaded yet, waiting...');
            setTimeout(checkLibraries, 100);
            return;
        }
        if (typeof L === 'undefined') {
            console.error('Leaflet not loaded yet, waiting...');
            setTimeout(checkLibraries, 100);
            return;
        }
        if (typeof $.fn.DataTable === 'undefined') {
            console.error('DataTables not loaded yet, waiting...');
            setTimeout(checkLibraries, 100);
            return;
        }

        // All libraries loaded, initialize app
        console.log('All libraries loaded, initializing app...');
        const app = new CongressionalDistrictsApp();
        app.initialize();

        // Expose app to window for debugging
        window.congressionalDistrictsApp = app;
    };

    checkLibraries();
});

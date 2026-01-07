// Synchronization Module
// Handles bidirectional synchronization between map and table

export class SyncManager {
    constructor(mapManager, tableManager) {
        this.mapManager = mapManager;
        this.tableManager = tableManager;
        this.currentSelection = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for district selection events from both map and table
        window.addEventListener('districtSelected', (event) => {
            const { districtId, source } = event.detail;
            this.handleDistrictSelection(districtId, source);
        });

        console.log('Sync manager initialized');
    }

    handleDistrictSelection(districtId, source) {
        // Prevent infinite loops
        if (this.currentSelection === districtId) {
            return;
        }

        this.currentSelection = districtId;

        // Sync the other component
        if (source === 'map') {
            // Map was clicked, sync table
            this.tableManager.selectRow(districtId);
        } else if (source === 'table') {
            // Table was clicked, sync map
            this.mapManager.selectDistrict(districtId);
            this.mapManager.flyToDistrict(districtId);
        }

        console.log(`Synced selection: ${districtId} from ${source}`);
    }

    clearSelection() {
        this.currentSelection = null;
        this.mapManager.clearSelection();
        this.tableManager.clearSelection();
    }

    getSelectedDistrict() {
        return this.currentSelection;
    }
}

export default SyncManager;

// Data Loader Module
// Handles loading and processing of district data and GeoJSON boundaries

export class DataLoader {
    constructor() {
        this.districtData = null;
        this.geoJsonData = null;
        this.loading = false;
    }

    async loadDistrictData() {
        this.loading = true;
        try {
            const response = await fetch('data/sample-district-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.districtData = await response.json();
            console.log(`Loaded ${this.districtData.districts.length} districts`);
            return this.districtData;
        } catch (error) {
            console.error('Error loading district data:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    async loadGeoJSON() {
        this.loading = true;
        try {
            // For now, return null - we'll add GeoJSON later
            // In the future, this will load from data/districts.geojson
            console.log('GeoJSON loading not yet implemented - using fallback');
            return null;
        } catch (error) {
            console.error('Error loading GeoJSON:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    getDistrictById(districtId) {
        if (!this.districtData) return null;
        return this.districtData.districts.find(d => d.id === districtId);
    }

    getAllDistricts() {
        return this.districtData ? this.districtData.districts : [];
    }

    getStates() {
        if (!this.districtData) return [];
        const states = new Set(this.districtData.districts.map(d => d.state));
        return Array.from(states).sort();
    }

    getDistrictsByState(state) {
        if (!this.districtData) return [];
        return this.districtData.districts.filter(d => d.state === state);
    }

    calculateStats(districts) {
        if (!districts || districts.length === 0) {
            return {
                count: 0,
                republicanCount: 0,
                democraticCount: 0,
                avgPVI: 0,
                avgIncome: 0,
                avgTurnout: 0
            };
        }

        const republicanCount = districts.filter(d => d.party === 'Republican').length;
        const democraticCount = districts.filter(d => d.party === 'Democratic').length;

        const avgPVI = districts.reduce((sum, d) => sum + (d.pvi_numeric || 0), 0) / districts.length;
        const avgIncome = districts.reduce((sum, d) => sum + (d.demographics?.median_income || 0), 0) / districts.length;
        const avgTurnout = districts.reduce((sum, d) => sum + (d.elections?.['2024']?.turnout || 0), 0) / districts.length;

        return {
            count: districts.length,
            republicanCount,
            democraticCount,
            avgPVI: avgPVI.toFixed(1),
            avgIncome: Math.round(avgIncome),
            avgTurnout: Math.round(avgTurnout)
        };
    }

    formatPVI(pviNumeric) {
        if (pviNumeric === 0) return 'EVEN';
        if (pviNumeric > 0) return `R+${pviNumeric}`;
        return `D+${Math.abs(pviNumeric)}`;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    formatNumber(value) {
        return new Intl.NumberFormat('en-US').format(value);
    }
}

export default DataLoader;

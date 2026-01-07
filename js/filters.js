// Filters Module
// Handles filtering logic for districts based on various criteria

export class FilterManager {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
        this.allDistricts = [];
        this.filteredDistricts = [];

        // Filter state
        this.filters = {
            states: [],
            parties: ['Republican', 'Democratic'],
            pviMin: -30,
            pviMax: 30,
            searchQuery: ''
        };

        this.setupFilterControls();
    }

    setupFilterControls() {
        // State filter
        const stateFilter = document.getElementById('state-filter');
        if (stateFilter) {
            stateFilter.addEventListener('change', () => {
                const selected = Array.from(stateFilter.selectedOptions).map(opt => opt.value);
                this.filters.states = selected.filter(s => s !== '');
                this.applyFilters();
            });
        }

        // Party filters
        document.getElementById('party-republican')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.filters.parties.push('Republican');
            } else {
                this.filters.parties = this.filters.parties.filter(p => p !== 'Republican');
            }
            this.applyFilters();
        });

        document.getElementById('party-democratic')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.filters.parties.push('Democratic');
            } else {
                this.filters.parties = this.filters.parties.filter(p => p !== 'Democratic');
            }
            this.applyFilters();
        });

        // PVI range sliders
        const pviMin = document.getElementById('pvi-min');
        const pviMax = document.getElementById('pvi-max');
        const pviMinDisplay = document.getElementById('pvi-min-display');
        const pviMaxDisplay = document.getElementById('pvi-max-display');

        if (pviMin && pviMax) {
            pviMin.addEventListener('input', () => {
                this.filters.pviMin = parseInt(pviMin.value);
                pviMinDisplay.textContent = this.formatPVIDisplay(this.filters.pviMin);
                this.applyFilters();
            });

            pviMax.addEventListener('input', () => {
                this.filters.pviMax = parseInt(pviMax.value);
                pviMaxDisplay.textContent = this.formatPVIDisplay(this.filters.pviMax);
                this.applyFilters();
            });
        }

        // Reset filters button
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        console.log('Filter controls initialized');
    }

    formatPVIDisplay(value) {
        if (value === 0) return 'EVEN';
        return value > 0 ? `R+${value}` : `D+${Math.abs(value)}`;
    }

    setDistricts(districts) {
        this.allDistricts = districts;
        this.populateStateFilter();
        this.applyFilters();
    }

    populateStateFilter() {
        const stateFilter = document.getElementById('state-filter');
        if (!stateFilter) return;

        const states = this.dataLoader.getStates();

        // Clear existing options except "All States"
        stateFilter.innerHTML = '<option value="">All States</option>';

        // Add state options
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateFilter.appendChild(option);
        });
    }

    applyFilters() {
        this.filteredDistricts = this.allDistricts.filter(district => {
            // State filter
            if (this.filters.states.length > 0 && !this.filters.states.includes(district.state)) {
                return false;
            }

            // Party filter
            if (!this.filters.parties.includes(district.party)) {
                return false;
            }

            // PVI range filter
            const pvi = district.pvi_numeric || 0;
            if (pvi < this.filters.pviMin || pvi > this.filters.pviMax) {
                return false;
            }

            // Search query filter (representative name, district ID, state)
            if (this.filters.searchQuery) {
                const query = this.filters.searchQuery.toLowerCase();
                const searchableText = [
                    district.id,
                    district.state,
                    district.representative,
                    district.party
                ].join(' ').toLowerCase();

                if (!searchableText.includes(query)) {
                    return false;
                }
            }

            return true;
        });

        // Dispatch filter change event
        window.dispatchEvent(new CustomEvent('filtersChanged', {
            detail: { districts: this.filteredDistricts }
        }));

        console.log(`Filters applied: ${this.filteredDistricts.length} of ${this.allDistricts.length} districts`);

        return this.filteredDistricts;
    }

    resetFilters() {
        // Reset filter state
        this.filters = {
            states: [],
            parties: ['Republican', 'Democratic'],
            pviMin: -30,
            pviMax: 30,
            searchQuery: ''
        };

        // Reset UI controls
        const stateFilter = document.getElementById('state-filter');
        if (stateFilter) {
            stateFilter.selectedIndex = -1;
        }

        document.getElementById('party-republican').checked = true;
        document.getElementById('party-democratic').checked = true;

        document.getElementById('pvi-min').value = -30;
        document.getElementById('pvi-max').value = 30;
        document.getElementById('pvi-min-display').textContent = 'D+30';
        document.getElementById('pvi-max-display').textContent = 'R+30';

        this.applyFilters();

        console.log('Filters reset');
    }

    getFilteredDistricts() {
        return this.filteredDistricts;
    }

    setSearchQuery(query) {
        this.filters.searchQuery = query;
        this.applyFilters();
    }
}

export default FilterManager;

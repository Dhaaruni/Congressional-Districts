// Table Module
// Handles DataTables initialization, rendering, and interactions

export class TableManager {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
        this.table = null;
        this.selectedDistrictId = null;
    }

    initialize() {
        // Initialize DataTables
        this.table = $('#districts-table').DataTable({
            data: [],
            columns: [
                {
                    data: 'state',
                    title: 'State',
                    width: '120px'
                },
                {
                    data: 'id',
                    title: 'District',
                    width: '90px'
                },
                {
                    data: 'representative',
                    title: 'Representative',
                    width: '180px'
                },
                {
                    data: 'party',
                    title: 'Party',
                    width: '110px',
                    render: (data, type, row) => {
                        if (type === 'display') {
                            if (!data || data === 'Unknown') {
                                return '<span class="party-badge vacant">Vacant</span>';
                            }
                            const badgeClass = data === 'Republican' ? 'republican' : 'democratic';
                            const shortName = data === 'Republican' ? 'R' : 'D';
                            return `<span class="party-badge ${badgeClass}">${shortName}</span> ${data}`;
                        }
                        return data || 'Vacant';
                    }
                },
                {
                    data: 'pvi',
                    title: 'PVI',
                    width: '80px',
                    render: (data, type, row) => {
                        if (type === 'display') {
                            if (!data) return '<span class="null-value">—</span>';
                            const pviClass = row.pvi_numeric > 0 ? 'republican' :
                                           row.pvi_numeric < 0 ? 'democratic' : 'even';
                            return `<span class="pvi-value ${pviClass}">${data}</span>`;
                        }
                        // For sorting, use the numeric value
                        if (type === 'sort') {
                            return row.pvi_numeric || 0;
                        }
                        return data;
                    }
                },
                {
                    data: 'elections.2024.pres_margin',
                    title: '2024 Margin (Presidential)',
                    width: '140px',
                    render: (data, type) => {
                        if (type === 'display') {
                            if (data == null) return '<span class="null-value">—</span>';
                            return `${data > 0 ? 'R+' : 'D+'}${Math.abs(data).toFixed(1)}`;
                        }
                        return data || 0;
                    }
                },
                {
                    data: 'elections.2024.house_margin',
                    title: '2024 Margin (House)',
                    width: '140px',
                    render: (data, type, row) => {
                        if (type === 'display') {
                            if (data == null) return '<span class="null-value">—</span>';
                            // Handle N/A values (uncontested or open seats)
                            if (data === 'N/A' || typeof data === 'string') {
                                if (!row.representative || row.representative === 'Vacant') {
                                    return '<span class="null-value">OPEN</span>';
                                }
                                return '<span class="null-value">Uncontested</span>';
                            }
                            return `${data > 0 ? 'R+' : 'D+'}${Math.abs(data).toFixed(1)}`;
                        }
                        // For sorting, treat N/A as 0
                        if (type === 'sort') {
                            return typeof data === 'number' ? data : 0;
                        }
                        return typeof data === 'number' ? data : 0;
                    }
                },
                {
                    data: 'demographics.median_income',
                    title: 'HHI',
                    width: '100px',
                    render: (data, type) => {
                        if (type === 'display') {
                            if (!data) return '<span class="null-value">—</span>';
                            return this.dataLoader.formatCurrency(data);
                        }
                        return data || 0;
                    }
                }
            ],
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
            order: [[0, 'asc'], [1, 'asc']], // Sort by State, then District
            responsive: true,
            dom: '<"top"lf>rt<"bottom"ip><"clear">',
            language: {
                search: 'Search districts:',
                lengthMenu: 'Show _MENU_ districts',
                info: 'Showing _START_ to _END_ of _TOTAL_ districts',
                infoEmpty: 'No districts to show',
                infoFiltered: '(filtered from _MAX_ total districts)',
                zeroRecords: 'No matching districts found'
            },
            createdRow: (row, data) => {
                // Add party class to row (handle vacant districts with null party)
                if (data.party) {
                    $(row).addClass(`party-${data.party.toLowerCase()}`);
                } else {
                    $(row).addClass('party-vacant');
                }

                // Store district ID
                $(row).attr('data-district-id', data.id);
            }
        });

        // Add row click handler
        $('#districts-table tbody').on('click', 'tr', (e) => {
            const row = $(e.currentTarget);
            const districtId = row.attr('data-district-id');

            if (districtId) {
                this.selectRow(districtId);

                // Dispatch event for synchronization
                window.dispatchEvent(new CustomEvent('districtSelected', {
                    detail: { districtId, source: 'table' }
                }));
            }
        });

        // Add hover effects
        $('#districts-table tbody').on('mouseenter', 'tr', function() {
            $(this).css('cursor', 'pointer');
        });

        console.log('Table initialized');
    }

    updateDistricts(districts) {
        if (!this.table) {
            console.error('Table not initialized');
            return;
        }

        // Clear and add new data
        this.table.clear();
        this.table.rows.add(districts);
        this.table.draw();

        console.log(`Table updated with ${districts.length} districts`);
    }

    selectRow(districtId) {
        this.selectedDistrictId = districtId;

        // Remove previous selection
        $('#districts-table tbody tr').removeClass('selected');

        // Add selection to clicked row
        const row = $(`#districts-table tbody tr[data-district-id="${districtId}"]`);
        row.addClass('selected');

        // Scroll row into view
        if (row.length > 0) {
            const rowElement = row[0];
            rowElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    clearSelection() {
        this.selectedDistrictId = null;
        $('#districts-table tbody tr').removeClass('selected');
    }

    getSelectedDistrict() {
        return this.selectedDistrictId;
    }

    search(query) {
        if (this.table) {
            this.table.search(query).draw();
        }
    }

    filterByColumn(columnIndex, value) {
        if (this.table) {
            this.table.column(columnIndex).search(value).draw();
        }
    }

    clearFilters() {
        if (this.table) {
            this.table.search('').columns().search('').draw();
        }
    }

    destroy() {
        if (this.table) {
            this.table.destroy();
            this.table = null;
        }
    }
}

export default TableManager;

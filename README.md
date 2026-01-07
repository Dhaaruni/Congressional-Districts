# Congressional Districts Explorer

An interactive web application to explore and analyze all 435 U.S. Congressional Districts with filtering, sorting, and visualization capabilities.

## Features

- **Interactive Map**: Leaflet.js-powered map displaying congressional districts
- **Data Table**: Sortable and filterable table with district information
- **Synchronized Views**: Click on map or table to highlight districts in both views
- **Advanced Filtering**:
  - Filter by state(s)
  - Filter by party (Republican/Democratic)
  - Filter by Cook Partisan Voting Index (PVI) range
- **Multiple Visualization Modes**:
  - Party Control (Red/Blue)
  - Cook PVI Gradient (D+30 to R+30)
  - Median Income (Green gradient)
  - 2024 Election Margin (Competitiveness)
- **Statistics Dashboard**: Real-time stats for filtered districts

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Mapping**: Leaflet.js 1.9.4
- **Tables**: DataTables.js 2.0.3
- **Styling**: Custom CSS with Grid/Flexbox
- **Data Format**: JSON

## Current Status

**Working Features:**
- ✅ Complete UI with responsive design
- ✅ Interactive table with sorting and filtering
- ✅ Interactive map with markers (using 10 sample districts)
- ✅ Map-table synchronization (click one, highlights the other)
- ✅ Party, state, and PVI filters
- ✅ Multiple visualization modes
- ✅ Statistics dashboard

**In Progress:**
- 🔄 Full dataset (currently 10 sample districts)
- 🔄 Actual congressional district boundaries (GeoJSON)
- 🔄 Complete demographics data
- 🔄 Full election results (2020, 2022, 2024)

## Getting Started

### Running Locally

1. **Start the web server** (already running on port 8000):
   ```bash
   cd /Users/dhaaruni/congressional-districts
   python3 -m http.server 8000
   ```

2. **Open in your browser**:
   ```
   http://localhost:8000
   ```

3. **Explore the application**:
   - Use the filters at the top to narrow down districts
   - Click on map markers or table rows to select districts
   - Change visualization modes to see different data perspectives
   - Sort table columns by clicking headers

### Project Structure

```
congressional-districts/
├── index.html                    # Main HTML file
├── css/
│   ├── main.css                  # Main styles
│   ├── map.css                   # Map-specific styles
│   └── table.css                 # Table-specific styles
├── js/
│   ├── main.js                   # App initialization
│   ├── data-loader.js            # Data loading & processing
│   ├── map.js                    # Map rendering & interactions
│   ├── table.js                  # Table rendering & interactions
│   ├── sync.js                   # Map-table synchronization
│   └── filters.js                # Filtering logic
├── data/
│   └── sample-district-data.json # Sample data (10 districts)
└── README.md                     # This file
```

## Sample Data

The application currently includes 10 sample districts:
- **California**: CA-01 (R+11*), CA-12 (D+35*)
- **Texas**: TX-01 (R+26*), TX-35 (D+15*)
- **New York**: NY-03 (EVEN ✓), NY-14 (D+19 ✓)
- **Florida**: FL-01 (R+19*, Rep. Jimmy Patronis), FL-20 (D+22*)
- **Pennsylvania**: PA-01 (D+1 ✓, Rep. Brian Fitzpatrick - Republican)
- **Ohio**: OH-15 (R+7*)

*Note: PVI values marked with ✓ are verified as accurate per 2025 Cook PVI. Values marked with * are approximations and will be replaced with accurate 2025 Cook PVI data when implementing the full 435-district dataset.*

Each district includes:
- Representative name and party
- Cook Partisan Voting Index (PVI)
- Demographics (population, median income, racial composition, education)
- Election results for 2020, 2022, and 2024

## Data Sources

- **Congressional District Boundaries**: [UCLA Congressional District Maps](https://cdmaps.polisci.ucla.edu/)
- **Cook PVI**: [Cook Political Report](https://www.cookpolitical.com/cook-pvi/)
- **Demographics**: [U.S. Census Bureau API](https://www.census.gov/data/developers/data-sets.html)
- **Election Results**: [House Clerk](https://clerk.house.gov/), [Ballotpedia](https://ballotpedia.org/)

## Next Steps

To complete the application with all 435 districts:

1. **Obtain Full Dataset**:
   - Download GeoJSON boundaries for all districts
   - Collect Cook PVI data (web scraping or manual compilation)
   - Fetch Census demographics via API
   - Compile election results

2. **Process Data**:
   - Simplify GeoJSON using mapshaper (15% simplification)
   - Merge all data sources into `data/district-data.json`

3. **Update Code**:
   - Replace `sample-district-data.json` with `district-data.json`
   - Implement GeoJSON rendering in map.js
   - Test with full dataset

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Data sources require attribution (see footer in application).

## Contact

For questions or issues, refer to the implementation documentation.

---

**Last Updated**: January 6, 2026
**Version**: 1.0.0 (Prototype with sample data)
# Congressional-Districts

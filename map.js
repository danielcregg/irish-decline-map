// Irish Language Decline Map - Interactive Map Script

// County mapping for Ireland (matching county names to location codes)
const countyMapping = {
    'Carlow': 'IE-CW',
    'Dublin City': 'IE-D', 
    'Dún Laoghaire-Rathdown': 'IE-DL',
    'Fingal': 'IE-D', // Part of Dublin
    'South Dublin': 'IE-D', // Part of Dublin
    'Kildare': 'IE-KE',
    'Kilkenny': 'IE-KK',
    'Laois': 'IE-LS',
    'Longford': 'IE-LD',
    'Louth': 'IE-LH',
    'Meath': 'IE-MH',
    'Offaly': 'IE-OY',
    'Westmeath': 'IE-WH',
    'Wexford': 'IE-WX',
    'Wicklow': 'IE-WW',
    'Clare': 'IE-CE',
    'Cork City': 'IE-C',
    'Cork County': 'IE-C',
    'Limerick City': 'IE-L',
    'Limerick County': 'IE-L',
    'North Tipperary': 'IE-T',
    'South Tipperary': 'IE-T',
    'Waterford City': 'IE-W',
    'Waterford County': 'IE-W',
    'Galway City': 'IE-G',
    'Galway County': 'IE-G',
    'Leitrim': 'IE-LM',
    'Mayo': 'IE-MO',
    'Roscommon': 'IE-RN',
    'Sligo': 'IE-SO',
    'Cavan': 'IE-CN',
    'Donegal': 'IE-DL',
    'Monaghan': 'IE-MN'
};

// County display names for better readability
const countyDisplayNames = {
    'Dublin City': 'Dublin City',
    'Dún Laoghaire-Rathdown': 'Dún Laoghaire-Rathdown',
    'Fingal': 'Fingal',
    'South Dublin': 'South Dublin',
    'Cork City': 'Cork City',
    'Cork County': 'Cork County',
    'Limerick City': 'Limerick City',
    'Limerick County': 'Limerick County',
    'North Tipperary': 'North Tipperary',
    'South Tipperary': 'South Tipperary',
    'Waterford City': 'Waterford City',
    'Waterford County': 'Waterford County',
    'Galway City': 'Galway City',
    'Galway County': 'Galway County'
};

// Global variables
let csvData = [];
let currentYear = '2022';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCSVData();
    setupEventListeners();
});

function setupEventListeners() {
    const yearSelect = document.getElementById('yearSelect');
    yearSelect.addEventListener('change', function() {
        currentYear = this.value;
        updateMap();
    });
}

function loadCSVData() {
    // Show loading state
    document.getElementById('ireland-map').innerHTML = '<div class="loading">Loading map data...</div>';
    
    // Load the CSV file
    Papa.parse('processed_cso_data.csv', {
        download: true,
        header: true,
        complete: function(results) {
            csvData = results.data;
            console.log('CSV data loaded:', csvData.length, 'records');
            createMap();
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            document.getElementById('ireland-map').innerHTML = 
                '<div style="text-align: center; padding: 50px; color: red;">Error loading data. Please check that processed_cso_data.csv exists.</div>';
        }
    });
}

function getDataForYear(year) {
    return csvData.filter(row => row.Year === year);
}

function createMap() {
    updateMap();
}

function updateMap() {
    const yearData = getDataForYear(currentYear);
    
    if (yearData.length === 0) {
        console.error('No data found for year:', currentYear);
        return;
    }

    // Prepare data for Plotly
    const counties = [];
    const percentages = [];
    const hoverTexts = [];
    
    yearData.forEach(row => {
        if (row.County && row.PercentageIrishSpeakers) {
            const displayName = countyDisplayNames[row.County] || row.County;
            counties.push(displayName);
            const percentage = parseFloat(row.PercentageIrishSpeakers);
            percentages.push(percentage);
            hoverTexts.push(`${displayName}<br>${percentage.toFixed(1)}% can speak Irish`);
        }
    });

    // Create the choropleth map
    const data = [{
        type: "choropleth",
        locationmode: 'country names',
        locations: counties,
        z: percentages,
        text: hoverTexts,
        hovertemplate: '%{text}<extra></extra>',
        colorscale: [
            [0, '#f7f7f7'],
            [0.2, '#d4edda'],
            [0.4, '#84c884'],
            [0.6, '#52a352'],
            [0.8, '#2d5a2d'],
            [1, '#1e3a1e']
        ],
        colorbar: {
            title: "% Irish Speakers",
            titleside: "right",
            tickmode: "linear",
            tick0: 0,
            dtick: 10,
            thickness: 20,
            len: 0.7,
            x: 1.02
        },
        showscale: true
    }];

    // If choropleth doesn't work well for Irish counties, let's create a bar chart instead
    // This is more reliable for county-level data
    const barData = [{
        type: 'bar',
        x: counties,
        y: percentages,
        text: percentages.map(p => p.toFixed(1) + '%'),
        textposition: 'outside',
        marker: {
            color: percentages,
            colorscale: [
                [0, '#f7f7f7'],
                [0.2, '#d4edda'],
                [0.4, '#84c884'],
                [0.6, '#52a352'],
                [0.8, '#2d5a2d'],
                [1, '#1e3a1e']
            ],
            colorbar: {
                title: "% Irish Speakers",
                titleside: "right",
                thickness: 20,
                len: 0.7,
                x: 1.02
            }
        },
        hovertemplate: '%{x}<br>%{y:.1f}% can speak Irish<extra></extra>'
    }];

    const layout = {
        title: {
            text: `Irish Language Speakers by County (${currentYear})`,
            font: { size: 20, color: '#1e3c72' }
        },
        xaxis: {
            title: 'County',
            tickangle: -45,
            tickfont: { size: 10 }
        },
        yaxis: {
            title: 'Percentage of Irish Speakers',
            range: [0, Math.max(...percentages) + 5]
        },
        margin: { t: 60, r: 100, b: 120, l: 60 },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Segoe UI, sans-serif' }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };

    // Create the plot
    Plotly.newPlot('ireland-map', barData, layout, config);
    
    // Add event listener for plot interactions
    document.getElementById('ireland-map').on('plotly_hover', function(data) {
        const point = data.points[0];
        console.log(`Hovering over ${point.x}: ${point.y.toFixed(1)}% Irish speakers`);
    });

    console.log(`Map updated for year ${currentYear} with ${yearData.length} data points`);
}

// Add some utility functions for data analysis
function calculateDecline() {
    const data2011 = getDataForYear('2011');
    const data2022 = getDataForYear('2022');
    
    const declines = [];
    
    data2011.forEach(row2011 => {
        const row2022 = data2022.find(r => r.County === row2011.County);
        if (row2022) {
            const decline = parseFloat(row2011.PercentageIrishSpeakers) - parseFloat(row2022.PercentageIrishSpeakers);
            declines.push({
                county: row2011.County,
                decline: decline,
                percentage2011: parseFloat(row2011.PercentageIrishSpeakers),
                percentage2022: parseFloat(row2022.PercentageIrishSpeakers)
            });
        }
    });
    
    return declines.sort((a, b) => b.decline - a.decline);
}

// Export functions for console access
window.calculateDecline = calculateDecline;
window.getDataForYear = getDataForYear;

console.log('Irish Language Map script loaded successfully');
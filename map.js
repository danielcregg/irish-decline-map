// Irish Language Decline Map - Interactive Choropleth Map with Animation

// Irish County GeoJSON locations (ISO 3166-2:IE codes)
const countyGeoMapping = {
    'Carlow': 'IRL.CW_1',
    'Dublin City': 'IRL.D_1', 
    'Dún Laoghaire-Rathdown': 'IRL.DL_1',
    'Fingal': 'IRL.FG_1',
    'South Dublin': 'IRL.SD_1',
    'Kildare': 'IRL.KE_1',
    'Kilkenny': 'IRL.KK_1',
    'Laois': 'IRL.LS_1',
    'Longford': 'IRL.LD_1',
    'Louth': 'IRL.LH_1',
    'Meath': 'IRL.MH_1',
    'Offaly': 'IRL.OY_1',
    'Westmeath': 'IRL.WH_1',
    'Wexford': 'IRL.WX_1',
    'Wicklow': 'IRL.WW_1',
    'Clare': 'IRL.CE_1',
    'Cork City': 'IRL.C_1',
    'Cork County': 'IRL.CO_1',
    'Limerick City': 'IRL.LK_1',
    'Limerick County': 'IRL.LI_1',
    'North Tipperary': 'IRL.TA_1',
    'South Tipperary': 'IRL.TA_1',
    'Waterford City': 'IRL.WD_1',
    'Waterford County': 'IRL.WA_1',
    'Galway City': 'IRL.G_1',
    'Galway County': 'IRL.GA_1',
    'Leitrim': 'IRL.LM_1',
    'Mayo': 'IRL.MO_1',
    'Roscommon': 'IRL.RN_1',
    'Sligo': 'IRL.SO_1',
    'Cavan': 'IRL.CN_1',
    'Donegal': 'IRL.DL_1',
    'Monaghan': 'IRL.MN_1'
};

// Global variables
let csvData = [];
let currentYear = '2022';
let allYears = [];

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
    document.getElementById('ireland-map').innerHTML = '<div class="loading">Loading historical map data...</div>';
    
    // Load the historical CSV file
    Papa.parse('historical_irish_data.csv', {
        download: true,
        header: true,
        complete: function(results) {
            csvData = results.data.filter(row => row.Year && row.County && row.PercentageIrishSpeakers);
            console.log('Historical CSV data loaded:', csvData.length, 'records');
            
            // Get all unique years and sort them
            allYears = [...new Set(csvData.map(row => row.Year))].sort();
            console.log('Available years:', allYears);
            
            // Update year selector
            updateYearSelector();
            
            // Create the map
            createAnimatedMap();
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            document.getElementById('ireland-map').innerHTML = 
                '<div style="text-align: center; padding: 50px; color: red;">Error loading historical data. Please check that historical_irish_data.csv exists.</div>';
        }
    });
}

function updateYearSelector() {
    const yearSelect = document.getElementById('yearSelect');
    yearSelect.innerHTML = '';
    
    allYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    });
}

function getDataForYear(year) {
    return csvData.filter(row => row.Year === year.toString());
}

function createAnimatedMap() {
    // Prepare data for all years
    const frames = [];
    const sliderSteps = [];
    
    allYears.forEach(year => {
        const yearData = getDataForYear(year);
        
        const counties = [];
        const percentages = [];
        const hoverTexts = [];
        
        yearData.forEach(row => {
            if (row.County && row.PercentageIrishSpeakers) {
                counties.push(row.County);
                const percentage = parseFloat(row.PercentageIrishSpeakers);
                percentages.push(percentage);
                hoverTexts.push(`${row.County}<br>${percentage.toFixed(1)}% can speak Irish<br>Year: ${year}`);
            }
        });
        
        // Create frame for this year
        frames.push({
            name: year,
            data: [{
                type: "choropleth",
                locationmode: 'geojson-id',
                geojson: 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
                locations: counties.map(county => countyGeoMapping[county] || county),
                z: percentages,
                text: hoverTexts,
                hovertemplate: '%{text}<extra></extra>',
                colorscale: [
                    [0, '#ffffff'],      // White for very low
                    [0.1, '#fff5f0'],    // Very light pink
                    [0.2, '#fee0d2'],    // Light pink
                    [0.3, '#fcbba1'],    // Light orange-pink
                    [0.4, '#fc9272'],    // Medium orange-pink
                    [0.5, '#fb6a4a'],    // Orange-red
                    [0.6, '#ef3b2c'],    // Red
                    [0.7, '#cb181d'],    // Dark red
                    [0.8, '#a50f15'],    // Very dark red
                    [0.9, '#67000d'],    // Deep dark red
                    [1, '#2d0007']       // Almost black red
                ],
                zmin: 0,
                zmax: 100,
                colorbar: {
                    title: "% Irish Speakers",
                    titleside: "right",
                    tickmode: "linear",
                    tick0: 0,
                    dtick: 20,
                    thickness: 20,
                    len: 0.8,
                    x: 1.02
                },
                showscale: true
            }]
        });
        
        // Create slider step
        sliderSteps.push({
            args: [
                [year],
                {
                    frame: {duration: 300, redraw: true},
                    transition: {duration: 300}
                }
            ],
            label: year,
            method: 'animate'
        });
    });
    
    // Since we can't easily get Irish county boundaries, let's create a bar chart with animation instead
    createAnimatedBarChart();
}

function createAnimatedBarChart() {
    // Prepare data for animation
    const frames = [];
    const sliderSteps = [];
    
    allYears.forEach(year => {
        const yearData = getDataForYear(year);
        
        const counties = [];
        const percentages = [];
        const colors = [];
        
        yearData.forEach(row => {
            if (row.County && row.PercentageIrishSpeakers) {
                counties.push(row.County);
                const percentage = parseFloat(row.PercentageIrishSpeakers);
                percentages.push(percentage);
                
                // Color based on percentage
                if (percentage >= 80) colors.push('#67000d');      // Very high - deep red
                else if (percentage >= 70) colors.push('#a50f15'); // High - dark red
                else if (percentage >= 60) colors.push('#cb181d'); // Medium-high - red
                else if (percentage >= 50) colors.push('#ef3b2c'); // Medium - orange-red
                else if (percentage >= 40) colors.push('#fb6a4a'); // Medium-low - orange
                else if (percentage >= 30) colors.push('#fc9272'); // Low - light orange
                else colors.push('#fcbba1');                       // Very low - light pink
            }
        });
        
        frames.push({
            name: year,
            data: [{
                type: 'bar',
                x: counties,
                y: percentages,
                text: percentages.map(p => p.toFixed(1) + '%'),
                textposition: 'outside',
                marker: {
                    color: colors,
                    line: {
                        color: 'rgba(0,0,0,0.3)',
                        width: 1
                    }
                },
                hovertemplate: '%{x}<br>%{y:.1f}% can speak Irish<br>Year: ' + year + '<extra></extra>'
            }]
        });
        
        sliderSteps.push({
            args: [
                [year],
                {
                    frame: {duration: 500, redraw: true},
                    transition: {duration: 300}
                }
            ],
            label: year,
            method: 'animate'
        });
    });
    
    // Initial data (latest year)
    const initialData = frames[frames.length - 1].data;
    
    const layout = {
        title: {
            text: `Irish Language Speakers by County Over Time`,
            font: { size: 24, color: '#1e3c72', family: 'Segoe UI, sans-serif' },
            x: 0.5
        },
        xaxis: {
            title: 'County',
            tickangle: -45,
            tickfont: { size: 10 },
            showgrid: false
        },
        yaxis: {
            title: 'Percentage of Irish Speakers (%)',
            range: [0, 105],
            showgrid: true,
            gridcolor: 'rgba(128,128,128,0.2)'
        },
        margin: { t: 80, r: 60, b: 150, l: 80 },
        plot_bgcolor: 'rgba(255,255,255,0.8)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Segoe UI, sans-serif' },
        
        // Animation controls
        sliders: [{
            active: allYears.length - 1,
            currentvalue: {
                font: { size: 16, color: '#1e3c72' },
                prefix: 'Year: ',
                visible: true,
                xanchor: 'right'
            },
            steps: sliderSteps,
            x: 0.1,
            len: 0.8,
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: '#1e3c72',
            borderwidth: 2,
            tickcolor: '#1e3c72'
        }],
        
        updatemenus: [{
            type: 'buttons',
            showactive: false,
            x: 0.1,
            y: 1.15,
            buttons: [
                {
                    label: 'Play',
                    method: 'animate',
                    args: [null, {
                        frame: { duration: 800, redraw: true },
                        transition: { duration: 300 },
                        fromcurrent: true
                    }]
                },
                {
                    label: 'Pause',
                    method: 'animate',
                    args: [[null], {
                        frame: { duration: 0, redraw: false },
                        transition: { duration: 0 },
                        mode: 'immediate'
                    }]
                }
            ]
        }],
        
        annotations: [
            {
                text: `<b>Historical Timeline: ${allYears[0]} - ${allYears[allYears.length-1]}</b><br>` +
                      'Use the slider below or click Play to see the decline over time',
                x: 0.5,
                y: 1.12,
                xref: 'paper',
                yref: 'paper',
                showarrow: false,
                font: { size: 14, color: '#1e3c72' },
                xanchor: 'center'
            }
        ]
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
        displaylogo: false
    };

    // Create the animated plot
    Plotly.newPlot('ireland-map', initialData, layout, config)
        .then(function() {
            // Add the frames for animation
            Plotly.addFrames('ireland-map', frames);
            
            // Add event listeners
            document.getElementById('ireland-map').on('plotly_sliderchange', function(data) {
                const newYear = allYears[data.slider.active];
                currentYear = newYear;
                document.getElementById('yearSelect').value = newYear;
                console.log('Slider changed to year:', newYear);
            });
            
            console.log('Animated map created successfully');
        });
}

function updateMap() {
    // Animate to the selected year
    Plotly.animate('ireland-map', [currentYear], {
        frame: {duration: 500, redraw: true},
        transition: {duration: 300}
    });
    
    // Update slider position
    const yearIndex = allYears.indexOf(currentYear);
    if (yearIndex !== -1) {
        Plotly.relayout('ireland-map', {
            'sliders[0].active': yearIndex
        });
    }
}

// Utility functions for data analysis
function calculateDeclineOverTime() {
    const firstYear = allYears[0];
    const lastYear = allYears[allYears.length - 1];
    
    const dataFirst = getDataForYear(firstYear);
    const dataLast = getDataForYear(lastYear);
    
    const declines = [];
    
    dataFirst.forEach(rowFirst => {
        const rowLast = dataLast.find(r => r.County === rowFirst.County);
        if (rowLast) {
            const decline = parseFloat(rowFirst.PercentageIrishSpeakers) - parseFloat(rowLast.PercentageIrishSpeakers);
            declines.push({
                county: rowFirst.County,
                decline: decline,
                percentageFirst: parseFloat(rowFirst.PercentageIrishSpeakers),
                percentageLast: parseFloat(rowLast.PercentageIrishSpeakers),
                timespan: `${firstYear}-${lastYear}`
            });
        }
    });
    
    return declines.sort((a, b) => b.decline - a.decline);
}

function getTopDeclines(limit = 10) {
    const declines = calculateDeclineOverTime();
    console.log(`Top ${limit} counties with greatest Irish language decline:`);
    declines.slice(0, limit).forEach((item, index) => {
        console.log(`${index + 1}. ${item.county}: ${item.decline.toFixed(1)}% decline (${item.percentageFirst.toFixed(1)}% → ${item.percentageLast.toFixed(1)}%)`);
    });
    return declines.slice(0, limit);
}

// Export functions for console access
window.calculateDeclineOverTime = calculateDeclineOverTime;
window.getTopDeclines = getTopDeclines;
window.getDataForYear = getDataForYear;
window.allYears = allYears;

console.log('Irish Language Historical Map script loaded successfully');
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
    
    console.log('Starting CSV load...');
    
    // Load the historical CSV file
    Papa.parse('historical_irish_data.csv', {
        download: true,
        header: true,
        complete: function(results) {
            console.log('Papa Parse completed:', results);
            
            if (results.errors && results.errors.length > 0) {
                console.error('CSV parsing errors:', results.errors);
            }
            
            csvData = results.data.filter(row => row.Year && row.County && row.PercentageIrishSpeakers);
            console.log('Filtered CSV data:', csvData.length, 'records');
            console.log('Sample data:', csvData.slice(0, 3));
            
            if (csvData.length === 0) {
                document.getElementById('ireland-map').innerHTML = 
                    '<div style="text-align: center; padding: 50px; color: red;">No valid data found in CSV file</div>';
                return;
            }
            
            // Get all unique years and sort them
            allYears = [...new Set(csvData.map(row => row.Year))].sort();
            console.log('Available years:', allYears);
            
            // Update year selector
            updateYearSelector();
            
            // Create the map
            createSimpleChart();
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            document.getElementById('ireland-map').innerHTML = 
                '<div style="text-align: center; padding: 50px; color: red;">Error loading historical data: ' + error.message + '</div>';
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

function createSimpleChart() {
    console.log('Creating simple chart for year:', currentYear);
    
    const yearData = getDataForYear(currentYear);
    console.log('Year data:', yearData.length, 'records for', currentYear);
    
    if (yearData.length === 0) {
        document.getElementById('ireland-map').innerHTML = 
            '<div style="text-align: center; padding: 50px; color: orange;">No data found for year ' + currentYear + '</div>';
        return;
    }
    
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
    
    const data = [{
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
        hovertemplate: '%{x}<br>%{y:.1f}% can speak Irish<br>Year: ' + currentYear + '<extra></extra>'
    }];
    
    const layout = {
        title: {
            text: `Irish Language Speakers by County (${currentYear})`,
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
        font: { family: 'Segoe UI, sans-serif' }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
        displaylogo: false
    };

    console.log('Creating plot with', counties.length, 'counties');
    Plotly.newPlot('ireland-map', data, layout, config)
        .then(function() {
            console.log('Simple chart created successfully');
            // Once simple chart works, we can add animation
            setTimeout(addAnimationFeatures, 1000);
        })
        .catch(function(error) {
            console.error('Error creating plot:', error);
            document.getElementById('ireland-map').innerHTML = 
                '<div style="text-align: center; padding: 50px; color: red;">Error creating chart: ' + error.message + '</div>';
        });
}

function addAnimationFeatures() {
    console.log('Adding animation features...');
    
    // Prepare frames for all years
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
                if (percentage >= 80) colors.push('#67000d');
                else if (percentage >= 70) colors.push('#a50f15');
                else if (percentage >= 60) colors.push('#cb181d');
                else if (percentage >= 50) colors.push('#ef3b2c');
                else if (percentage >= 40) colors.push('#fb6a4a');
                else if (percentage >= 30) colors.push('#fc9272');
                else colors.push('#fcbba1');
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
    
    // Add animation controls
    const updateMenus = [{
        type: 'buttons',
        showactive: false,
        x: 0.1,
        y: 1.15,
        buttons: [
            {
                label: 'Play Timeline',
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
    }];
    
    const sliders = [{
        active: allYears.indexOf(currentYear),
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
    }];
    
    // Add frames and controls
    Plotly.addFrames('ireland-map', frames)
        .then(function() {
            return Plotly.relayout('ireland-map', {
                updatemenus: updateMenus,
                sliders: sliders,
                'title.text': `Irish Language Speakers by County (${allYears[0]}-${allYears[allYears.length-1]})`
            });
        })
        .then(function() {
            console.log('Animation features added successfully');
            
            // Add event listeners
            document.getElementById('ireland-map').on('plotly_sliderchange', function(data) {
                const newYear = allYears[data.slider.active];
                currentYear = newYear;
                document.getElementById('yearSelect').value = newYear;
                console.log('Slider changed to year:', newYear);
            });
        })
        .catch(function(error) {
            console.error('Error adding animation features:', error);
        });
}

function updateMap() {
    // Animate to the selected year if animation is set up
    if (typeof Plotly.animate === 'function') {
        try {
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
        } catch (error) {
            console.error('Animation error, falling back to simple update:', error);
            createSimpleChart();
        }
    } else {
        // Fallback to recreating the chart
        createSimpleChart();
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
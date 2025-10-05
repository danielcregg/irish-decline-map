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

// Visible status helper: shows small banner inside #ireland-map so users
// without console access can see progress/stages on deployed Pages
function updateStatus(message, isError = false) {
    try {
        const container = document.getElementById('ireland-map');
        if (!container) return;

        let statusEl = container.querySelector('.debug-status-overlay');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.className = 'debug-status-overlay';
            // Inline minimal styling so it works even if CSS isn't loaded
            statusEl.style.position = 'absolute';
            statusEl.style.left = '20px';
            statusEl.style.top = '20px';
            statusEl.style.padding = '8px 12px';
            statusEl.style.borderRadius = '8px';
            statusEl.style.fontFamily = 'Segoe UI, sans-serif';
            statusEl.style.fontSize = '13px';
            statusEl.style.zIndex = 9999;
            statusEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
            statusEl.style.maxWidth = 'calc(100% - 40px)';
            container.style.position = container.style.position || 'relative';
            container.appendChild(statusEl);
        }

        statusEl.textContent = message;
        statusEl.style.background = isError ? 'rgba(220,53,69,0.95)' : 'rgba(30,60,114,0.95)';
        statusEl.style.color = 'white';
    } catch (e) {
        // non-fatal; we still log to console
        console.warn('updateStatus failed', e);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Global error handlers to surface issues to the user
    window.addEventListener('error', (e) => {
        console.error('Unhandled error:', e.message || e);
        safeShowError('An unexpected error occurred while loading the chart. Check the browser console for details.');
    });
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason || e);
        safeShowError('A data loading error occurred. Please refresh the page.');
    });

    updateStatus('Initializing...');
    loadCSVData();
    setupEventListeners();
});

function setupEventListeners() {
    const yearSelect = document.getElementById('yearSelect');
    yearSelect.addEventListener('change', function() {
        currentYear = this.value;
        updateMap();
    });

    // Add resize listener for responsiveness
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('Window resized, updating layout...');
            const gd = document.getElementById('ireland-map');
            // Check if plotly is available on the element
            if (gd && gd.layout) {
                const isAnimated = gd.layout.sliders && gd.layout.sliders.length > 0;
                let newLayout = getResponsiveLayout(currentYear, isAnimated);

                // If animated, we need to update the control positions too
                if (isAnimated) {
                    const isMobile = window.innerWidth < 768;
                    const controlsUpdate = {
                        'sliders[0].x': isMobile ? 0.05 : 0.1,
                        'sliders[0].len': isMobile ? 0.9 : 0.8,
                        'sliders[0].y': isMobile ? -0.15 : 0,
                        'sliders[0].yanchor': 'top',
                        'updatemenus[0].x': isMobile ? 0.5 : 0.1,
                        'updatemenus[0].y': isMobile ? -0.45 : 1.15,
                        'updatemenus[0].xanchor': isMobile ? 'center' : 'left',
                    };
                    // Combine the layout and control updates
                    newLayout = {...newLayout, ...controlsUpdate};
                }

                Plotly.relayout('ireland-map', newLayout);
            }
        }, 250); // Debounce resize event
    });
}

function loadCSVData() {
    // Show loading state
    document.getElementById('ireland-map').innerHTML = '<div class="loading">Loading historical map data...</div>';
    
    console.log('Starting CSV load...');
    updateStatus('Starting CSV load...');
    // Fallback timer in case CSV load stalls
    const failTimer = setTimeout(() => {
        updateStatus('Taking longer than expected to load data...', true);
        safeShowError('Taking longer than expected to load data. If this persists, hard refresh the page or check the network tab.');
    }, 8000);

    // Load the historical CSV file via Papa
    Papa.parse('historical_irish_data.csv', {
        download: true,
        header: true,
        complete: function(results) {
            clearTimeout(failTimer);
            console.log('Papa Parse completed:', results);
                updateStatus('CSV loaded (Papa Parse).');
            
            if (results.errors && results.errors.length > 0) {
                console.error('CSV parsing errors:', results.errors);
            }
            
            csvData = results.data.filter(row => row.Year && row.County && row.PercentageIrishSpeakers);
            console.log('Filtered CSV data:', csvData.length, 'records');
            console.log('Sample data:', csvData.slice(0, 3));
            
            if (csvData.length === 0) {
                console.warn('Papa returned no rows. Attempting fetch fallback...');
                updateStatus('Papa returned 0 rows; trying fetch fallback...', true);
                return fetchCSVFallback();
            }
            
            // Get all unique years and sort them
            allYears = [...new Set(csvData.map(row => row.Year))].sort();
            console.log('Available years:', allYears);
            updateStatus('CSV parsed OK — creating chart...');
            
            // Update year selector
            updateYearSelector();
            
            // Create the map
            createSimpleChart();
        },
        error: function(error) {
            console.error('Error loading CSV via Papa:', error);
            clearTimeout(failTimer);
            updateStatus('Papa parse failed — fetching CSV fallback...', true);
            fetchCSVFallback('Papa parse error: ' + (error && error.message ? error.message : 'unknown'));
        }
    });
}

// Fetch fallback if Papa stalls or outputs empty
async function fetchCSVFallback(reason) {
    try {
        if (reason) console.warn('Fetch fallback reason:', reason);
    updateStatus('Attempting fetch fallback for CSV...');
        const res = await fetch('historical_irish_data.csv', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const text = await res.text();
        // Basic CSV parsing (split lines and commas). We rely on our simple data (no quoted commas)
        const lines = text.trim().split(/\r?\n/);
        const header = lines.shift().split(',');
        const idxYear = header.indexOf('Year');
        const idxCounty = header.indexOf('County');
        const idxPct = header.indexOf('PercentageIrishSpeakers');
        if (idxYear === -1 || idxCounty === -1 || idxPct === -1) throw new Error('CSV header missing expected columns');
        csvData = lines.map(line => {
            const cols = line.split(',');
            return {
                Year: cols[idxYear],
                County: cols[idxCounty],
                PercentageIrishSpeakers: cols[idxPct]
            };
        }).filter(r => r.Year && r.County && r.PercentageIrishSpeakers);

        if (csvData.length === 0) throw new Error('Parsed 0 rows from fallback parse');

        allYears = [...new Set(csvData.map(row => row.Year))].sort();
        updateYearSelector();
    updateStatus('CSV fetched & parsed — creating chart...');
    createSimpleChart();
    } catch (e) {
        console.error('CSV fetch fallback failed:', e);
    updateStatus('CSV fetch fallback failed', true);
    safeShowError('Failed to load data file. Ensure historical_irish_data.csv is present and accessible.');
    }
}

function safeShowError(msg) {
    const el = document.getElementById('ireland-map');
    if (el) {
        el.innerHTML = `<div style="text-align:center;padding:50px;color:red;">${msg}</div>`;
    }
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

// Determines Plotly layout based on screen size for responsiveness
function getResponsiveLayout(year, isAnimated = false) {
    const isMobile = window.innerWidth < 768;

    let titleText;
    if (isAnimated) {
        const fullTitle = `Irish Language Speakers by County (${allYears[0]}-${allYears[allYears.length-1]})`;
        const shortTitle = `Irish Speakers (${allYears[0]}-${allYears[allYears.length-1]})`;
        titleText = isMobile ? shortTitle : fullTitle;
    } else {
        const fullTitle = `Irish Language Speakers by County (${year})`;
        const shortTitle = `Irish Speakers (${year})`;
        titleText = isMobile ? shortTitle : fullTitle;
    }

    // On mobile, increase bottom margin to make space for animation controls
    const mobileBottomMargin = isAnimated ? 200 : 120;

    return {
        title: {
            text: titleText,
            font: { size: isMobile ? 18 : 24, color: '#1e3c72', family: 'Segoe UI, sans-serif' },
            x: 0.5
        },
        xaxis: {
            title: isMobile ? '' : 'County',
            tickangle: isMobile ? -90 : -45,
            tickfont: { size: isMobile ? 9 : 10 },
            showgrid: false
        },
        yaxis: {
            title: isMobile ? 'Speakers (%)' : 'Percentage of Irish Speakers (%)',
            range: [0, 105],
            showgrid: true,
            gridcolor: 'rgba(128,128,128,0.2)'
        },
        margin: isMobile ? { t: 60, r: 20, b: mobileBottomMargin, l: 60 } : { t: 80, r: 60, b: 150, l: 80 },
        plot_bgcolor: 'rgba(255,255,255,0.8)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Segoe UI, sans-serif' }
    };
}

function createSimpleChart() {
    console.log('Creating simple chart for year:', currentYear);
    updateStatus('Rendering chart for ' + currentYear + '...');
    
    const yearData = getDataForYear(currentYear);
    console.log('Year data:', yearData.length, 'records for', currentYear);
    
    if (yearData.length === 0) {
        document.getElementById('ireland-map').innerHTML = 
            '<div style="text-align: center; padding: 50px; color: orange;">No data found for year ' + currentYear + '</div>';
        return;
    }
    
    // Clear any loading overlay before drawing
    const container = document.getElementById('ireland-map');
    if (container) container.innerHTML = '';

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
    
    const layout = getResponsiveLayout(currentYear);

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
            updateStatus('Chart rendered — adding animation features...');
            // Once simple chart works, we can add animation
            setTimeout(addAnimationFeatures, 1000);
        })
        .catch(function(error) {
            console.error('Error creating plot:', error);
            updateStatus('Error creating chart: ' + (error.message || error), true);
            document.getElementById('ireland-map').innerHTML = 
                '<div style="text-align: center; padding: 50px; color: red;">Error creating chart: ' + error.message + '</div>';
        });
}

function addAnimationFeatures() {
    console.log('Adding animation features...');
    const isMobile = window.innerWidth < 768;
    
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
    
    // Add animation controls with responsive positioning
    const updateMenus = [{
        type: 'buttons',
        showactive: false,
        direction: 'left',
        x: isMobile ? 0.5 : 0.1,
        y: isMobile ? -0.45 : 1.15,
        xanchor: isMobile ? 'center' : 'left',
        yanchor: 'top',
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
        x: isMobile ? 0.05 : 0.1,
        len: isMobile ? 0.9 : 0.8,
        xanchor: 'left',
        y: isMobile ? -0.15 : 0,
        yanchor: 'top',
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: '#1e3c72',
        borderwidth: 2,
        tickcolor: '#1e3c72'
    }];
    
    // Add frames and controls
    Plotly.addFrames('ireland-map', frames)
        .then(function() {
            let animatedLayout = getResponsiveLayout(currentYear, true);
            animatedLayout.updatemenus = updateMenus;
            animatedLayout.sliders = sliders;

            return Plotly.relayout('ireland-map', animatedLayout);
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
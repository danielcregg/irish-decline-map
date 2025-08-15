// Debug version - Simple test to see what's loading
console.log('Script starting...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting CSV load...');
    
    // Test if Papa Parse is available
    if (typeof Papa === 'undefined') {
        console.error('Papa Parse not loaded!');
        document.getElementById('ireland-map').innerHTML = '<div style="color: red; padding: 50px;">Papa Parse library not loaded</div>';
        return;
    }
    
    console.log('Papa Parse available, attempting to load CSV...');
    
    // Try loading the CSV
    Papa.parse('historical_irish_data.csv', {
        download: true,
        header: true,
        complete: function(results) {
            console.log('CSV loaded successfully!', results);
            console.log('Number of rows:', results.data.length);
            console.log('First few rows:', results.data.slice(0, 5));
            
            // Simple test visualization
            const testData = results.data.filter(row => row.Year === '2022');
            console.log('2022 data:', testData);
            
            // Create simple bar chart
            const counties = testData.map(row => row.County);
            const percentages = testData.map(row => parseFloat(row.PercentageIrishSpeakers));
            
            const data = [{
                type: 'bar',
                x: counties,
                y: percentages,
                marker: { color: 'lightblue' }
            }];
            
            const layout = {
                title: 'Test Chart - 2022 Data',
                xaxis: { tickangle: -45 },
                yaxis: { title: 'Percentage' }
            };
            
            Plotly.newPlot('ireland-map', data, layout);
            console.log('Chart created successfully');
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            document.getElementById('ireland-map').innerHTML = 
                '<div style="color: red; padding: 50px;">Error loading CSV: ' + error.message + '</div>';
        }
    });
});
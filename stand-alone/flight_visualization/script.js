// (JavaScript code will go here)
// Example of how to structure the main flow:

async function main() {
    const csvUrl = 'flight_data.csv';
    try {
        const rawData = await fetchCSVData(csvUrl);
        if (!rawData) return;

        const flights = parseCSV(rawData);
        if (!flights || flights.length === 0) {
            console.error("No flight data parsed.");
            return;
        }

        // Define bins
        const timeProgressLabels = Array.from({ length: 10 }, (_, i) => `${i * 10}-${(i + 1) * 10}%`);
        const budgetSpendingLabels = Array.from({ length: 10 }, (_, i) => `${i * 10}-${(i + 1) * 10}%`);

        // Initialize data structures for heatmap
        // zData will be a 2D array for flight counts
        // flightDetailsByBin will store flight objects for interactivity
        let zData = Array(budgetSpendingLabels.length).fill(null).map(() => Array(timeProgressLabels.length).fill(0));
        let flightDetailsByBin = Array(budgetSpendingLabels.length).fill(null).map(() => Array(timeProgressLabels.length).fill(null).map(() => []));

        // Process flights into bins
        flights.forEach(flight => {
            // Ensure percentages are numbers and handle potential NaN or undefined
            const timeProgress = parseFloat(flight.timeProgressPercentage);
            const budgetSpent = parseFloat(flight.budgetSpendingPercentage);

            if (isNaN(timeProgress) || isNaN(budgetSpent)) {
                console.warn(`Skipping flight with invalid percentage data: ${flight.flightId}`);
                return; // Skip this flight
            }
            
            // Determine bins (ensure values are within 0-100)
            const timeBinIndex = Math.min(Math.max(Math.floor(timeProgress / 10), 0), 9);
            const budgetBinIndex = Math.min(Math.max(Math.floor(budgetSpent / 10), 0), 9);

            // Increment count and store flight details
            zData[budgetBinIndex][timeBinIndex]++;
            flightDetailsByBin[budgetBinIndex][timeBinIndex].push(flight);
        });
        
        renderHeatmap(zData, timeProgressLabels, budgetSpendingLabels, flightDetailsByBin);

    } catch (error) {
        console.error("Error in main execution:", error);
        document.getElementById('heatmapContainer').textContent = 'Error loading or processing data. See console for details.';
    }
}

async function fetchCSVData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching ${url}`);
        }
        return await response.text();
    } catch (error) {
        console.error("Error fetching CSV data:", error);
        document.getElementById('heatmapContainer').textContent = `Failed to load flight data from ${url}. Please ensure the file exists and the path is correct.`;
        return null;
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        console.error("CSV data is empty or has no header row.");
        return [];
    }

    const headers = lines[0].split(',').map(header => header.trim());
    const flights = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim());
        if (values.length === headers.length) {
            let flight = {};
            headers.forEach((header, index) => {
                flight[header] = values[index];
            });
            flights.push(flight);
        } else {
            console.warn(`Skipping malformed CSV line: ${lines[i]}`);
        }
    }
    return flights;
}

function renderHeatmap(zData, timeLabels, budgetLabels, flightDetailsByBin) {
    const data = [{
        z: zData,
        x: timeLabels,
        y: budgetLabels,
        type: 'heatmap',
        colorscale: 'Viridis', // Or 'Blues'
        hoverongaps: false,
        hovertemplate: '<b>Time Progress</b>: %{x}<br>' +
                       '<b>Budget Spent</b>: %{y}<br>' +
                       '<b>Flights</b>: %{z}<br>' +
                       '<extra></extra>' // Hides the trace info
    }];

    const layout = {
        title: 'Flight Performance Analysis',
        xaxis: { title: 'Time Progress Percentage' },
        yaxis: { title: 'Budget Spending Percentage' },
        annotations: [] // For custom hover text, if needed beyond hovertemplate
    };

    Plotly.newPlot('heatmapContainer', data, layout);

    // Store flightDetailsByBin for click event, perhaps on the container itself or via Plotly's event data
    document.getElementById('heatmapContainer')._flightDetailsByBin = flightDetailsByBin;


    // Basic click event listener
    document.getElementById('heatmapContainer').on('plotly_click', function(data) {
        if (data.points.length > 0) {
            const point = data.points[0];
            const timeBinIndex = point.x; // This will be the label, need to map to index if necessary
            const budgetBinIndex = point.y; // This will be the label, need to map to index if necessary
            
            // Find the correct indices from labels if point.x/point.y are labels
            const xIndex = timeLabels.indexOf(point.x);
            const yIndex = budgetLabels.indexOf(point.y);

            console.log(`Clicked cell: Time Bin: ${point.x} (Index: ${xIndex}), Budget Bin: ${point.y} (Index: ${yIndex}), Flights: ${point.z}`);
            
            const clickedFlights = flightDetailsByBin[yIndex] && flightDetailsByBin[yIndex][xIndex] ? flightDetailsByBin[yIndex][xIndex] : [];
            console.log("Flights in this bin:", clickedFlights);
            
            // Implementation for displaying these flights in #detailsContainer will be added in the next step.
            // For now, just log to console.
            displayFlightDetails(clickedFlights);
        }
    });
}

// Placeholder for displaying flight details - will be implemented in the next step
function displayFlightDetails(flights) {
    const detailsContainer = document.getElementById('detailsContainer');
    if (!flights || flights.length === 0) {
        detailsContainer.innerHTML = '<p>No flights in this category or data not available.</p>';
        return;
    }

    let tableHTML = '<h3>Flight Details</h3><table><thead><tr>';
    // Assuming we know the headers from the CSV or have a predefined set for display
    const displayHeaders = ['flightId', 'name', 'pacingPercentage', 'budgetSpendingPercentage', 'timeProgressPercentage']; // Add other relevant headers
    displayHeaders.forEach(header => tableHTML += `<th>${header}</th>`);
    tableHTML += '</tr></thead><tbody>';

    flights.forEach(flight => {
        tableHTML += '<tr>';
        displayHeaders.forEach(header => {
            tableHTML += `<td>${flight[header] !== undefined ? flight[header] : 'N/A'}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    detailsContainer.innerHTML = tableHTML;
}


// Call main function when the script loads
main();

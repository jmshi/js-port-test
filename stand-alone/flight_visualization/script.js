// (Keep parseCSV, renderHeatmap, displayFlightDetails as they are, unless minor adjustments are needed for the new flow)

function parseCSV(csvText) {
    // Ensure it handles various line endings if possible, though `trim().split('\n')` is a common start.
    // Consider splitting by /\r?\n/ for broader compatibility.
    const lines = csvText.trim().split(/\r?\n/); 
    if (lines.length < 2) {
        console.error("CSV data is empty or has no header row.");
        document.getElementById('heatmapContainer').innerHTML = '<p>CSV data is empty or has no header row. Please check the file.</p>';
        return [];
    }

    const headers = lines[0].split(',').map(header => header.trim());
    // Add check for essential headers
    const requiredHeaders = ['flightId', 'budgetSpendingPercentage', 'timeProgressPercentage'];
    for (const reqHeader of requiredHeaders) {
        if (!headers.includes(reqHeader)) {
            console.error(`CSV file is missing required header: ${reqHeader}`);
            document.getElementById('heatmapContainer').innerHTML = `<p>CSV file is missing required header: ${reqHeader}. Please check the file.</p>`;
            return [];
        }
    }

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


function processAndRenderData(csvText) {
    try {
        const flights = parseCSV(csvText);
        if (!flights || flights.length === 0) {
            // parseCSV now handles displaying error message in heatmapContainer
            console.error("No flight data parsed or file is invalid.");
            // Optionally clear previous details:
            document.getElementById('detailsContainer').innerHTML = ''; 
            return;
        }

        const timeProgressLabels = Array.from({ length: 10 }, (_, i) => `${i * 10}-${(i + 1) * 10}%`);
        const budgetSpendingLabels = Array.from({ length: 10 }, (_, i) => `${i * 10}-${(i + 1) * 10}%`);

        let zData = Array(budgetSpendingLabels.length).fill(null).map(() => Array(timeProgressLabels.length).fill(0));
        let flightDetailsByBin = Array(budgetSpendingLabels.length).fill(null).map(() => Array(timeProgressLabels.length).fill(null).map(() => []));

        flights.forEach(flight => {
            const timeProgress = parseFloat(flight.timeProgressPercentage);
            const budgetSpent = parseFloat(flight.budgetSpendingPercentage);

            if (isNaN(timeProgress) || isNaN(budgetSpent)) {
                console.warn(`Skipping flight with invalid percentage data: ${flight.flightId || 'Unknown ID'}`);
                return; 
            }
            
            const timeBinIndex = Math.min(Math.max(Math.floor(timeProgress / 10), 0), 9);
            const budgetBinIndex = Math.min(Math.max(Math.floor(budgetSpent / 10), 0), 9);

            zData[budgetBinIndex][timeBinIndex]++;
            flightDetailsByBin[budgetBinIndex][timeBinIndex].push(flight);
        });
        
        renderHeatmap(zData, timeProgressLabels, budgetSpendingLabels, flightDetailsByBin);
        // Clear previous details when new data is loaded
        document.getElementById('detailsContainer').innerHTML = '<p>Click on a heatmap cell to see flight details.</p>';

    } catch (error) {
        console.error("Error processing or rendering data:", error);
        document.getElementById('heatmapContainer').innerHTML = '<p>Error processing data. See console for details.</p>';
        document.getElementById('detailsContainer').innerHTML = '';
    }
}

// renderHeatmap and displayFlightDetails remain largely the same
// Minor change in renderHeatmap: clear detailsContainer initially.
function renderHeatmap(zData, timeLabels, budgetLabels, flightDetailsByBin) {
    const data = [{
        z: zData,
        x: timeLabels,
        y: budgetLabels,
        type: 'heatmap',
        colorscale: 'Viridis',
        hoverongaps: false,
        hovertemplate: '<b>Time Progress</b>: %{x}<br>' +
                       '<b>Budget Spent</b>: %{y}<br>' +
                       '<b>Flights</b>: %{z}<br>' +
                       '<extra></extra>'
    }];

    const layout = {
        title: 'Flight Performance Analysis',
        xaxis: { title: 'Time Progress Percentage' },
        yaxis: { title: 'Budget Spending Percentage' },
    };

    Plotly.newPlot('heatmapContainer', data, layout);
    
    // Clear details section when a new heatmap is drawn
    document.getElementById('detailsContainer').innerHTML = '<p>Click on a heatmap cell to see flight details.</p>';


    document.getElementById('heatmapContainer').on('plotly_click', function(eventData) {
        if (eventData.points.length > 0) {
            const point = eventData.points[0];
            const xIndex = timeLabels.indexOf(point.x);
            const yIndex = budgetLabels.indexOf(point.y);

            if (xIndex === -1 || yIndex === -1) {
                console.error("Clicked on an invalid part of the heatmap or labels don't match.", point);
                return;
            }
            
            const clickedFlights = flightDetailsByBin[yIndex] && flightDetailsByBin[yIndex][xIndex] ? flightDetailsByBin[yIndex][xIndex] : [];
            displayFlightDetails(clickedFlights);
        }
    });
}

function displayFlightDetails(flights) {
    const detailsContainer = document.getElementById('detailsContainer');
    if (!flights || flights.length === 0) {
        detailsContainer.innerHTML = '<p>No flights in this category.</p>';
        return;
    }

    let tableHTML = '<h3>Flight Details</h3><table><thead><tr>';
    // Dynamically get headers from the first flight object, but ensure core ones are first if desired
    const coreHeaders = ['flightId', 'name', 'pacingPercentage', 'budgetSpendingPercentage', 'timeProgressPercentage'];
    const allHeaders = Object.keys(flights[0]);
    const displayHeaders = [...new Set([...coreHeaders, ...allHeaders])]; // Ensure core headers, add others

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


function setupEventListeners() {
    const fileInput = document.getElementById('csvFileInput');
    const loadButton = document.getElementById('loadDataButton');

    if (!fileInput || !loadButton) {
        console.error("Required HTML elements (file input or load button) not found.");
        document.getElementById('heatmapContainer').innerHTML = "<p>Error: UI elements missing. Cannot load data.</p>";
        return;
    }

    loadButton.addEventListener('click', () => {
        if (fileInput.files.length === 0) {
            alert("Please select a CSV file first.");
            return;
        }
        const file = fileInput.files[0];
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const csvText = event.target.result;
            processAndRenderData(csvText); // New function to encapsulate processing and rendering
        };
        
        reader.onerror = function(event) {
            console.error("Error reading file:", event);
            document.getElementById('heatmapContainer').innerHTML = "<p>Error reading the selected file.</p>";
            document.getElementById('detailsContainer').innerHTML = '';
        };
        
        reader.readAsText(file);
    });
     // Initial message in details container
    document.getElementById('detailsContainer').innerHTML = '<p>Please load a CSV file to see the heatmap and details.</p>';
    // Initial message in heatmap container
    document.getElementById('heatmapContainer').innerHTML = '<p>Please select a CSV file and click "Load and Display Data".</p>';
}

// Call setupEventListeners when the script loads (replacing the old main() call)
setupEventListeners();

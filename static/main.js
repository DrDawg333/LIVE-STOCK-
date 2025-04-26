let currentSymbol = null;
let intervalId = null;

function getStockPrice() {
  const symbol = document.getElementById('symbol').value.trim().toUpperCase();
  if (!symbol) {
    document.getElementById('output').textContent = 'Please enter a stock symbol.';
    return;
  }

  // Save the symbol to use for auto-refresh
  currentSymbol = symbol;

  fetchPrice(symbol);

  // Clear any previous interval to avoid stacking
  if (intervalId) {
    clearInterval(intervalId);
  }

  // Set interval to fetch price every 5 seconds
  intervalId = setInterval(() => fetchPrice(currentSymbol), 5000);
}

function fetchPrice(symbol) {
  fetch(`http://127.0.0.1:5000/api/price/${symbol}`)
    .then(res => res.json())
    .then(data => {
      if (data.price) {
        const currencySymbol = symbol.endsWith('.NS') ? '₹' : '$';
        document.getElementById('output').textContent = `Price of ${data.symbol}: ${currencySymbol}${data.price}`;
      } else {
        document.getElementById('output').textContent = `Error: ${data.error}`;
      }
    })
    .catch(err => {
      document.getElementById('output').textContent = 'Stock monitoring stopped';
      console.error(err);
    });
    fetchChart(symbol);

}

let stockChart = null;

function fetchChart(symbol) {
  fetch(`http://127.0.0.1:5000/api/history/${symbol}`)
    .then(res => res.json())
    .then(data => {
      if (data.error || !data.timestamps || !data.prices || data.timestamps.length === 0) {
        console.error(data.error || 'No data to plot yet.');
        return; // Exit if no data
      }

      const ctx = document.getElementById('stockChart').getContext('2d');

      if (stockChart) {
        stockChart.destroy();  // Clear previous chart
      }

      stockChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.timestamps,
          datasets: [{
            label: `Price of ${data.symbol}`,
            data: data.prices,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.2,
            pointRadius: 0
          }]
        },
        options: {
          scales: {
            x: {
              title: { display: true, text: 'Time (HH:MM)' }
            },
            y: {
              title: { display: true, text: 'Price' }
            }
          }
        }
      });
    })
    .catch(err => {
      console.error('Error fetching chart data:', err);
    });
}



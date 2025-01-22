const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

function generateMockData() {
  const mockData = [];
  let baseTime = new Date("2024-01-22T07:27:48.191"); // Starting timestamp from your logs
  
  // Initial values matching your data pattern
  let analogValue = 891;
  let ppm = 1183.00;

  for (let i = 0; i < 30; i++) {
    // Format timestamp to match your log format
    const timestamp = baseTime.toISOString().split('T')[1].split('.')[0];
    
    mockData.push({
      timestamp: timestamp,
      analogValue: analogValue,
      ppm: ppm.toFixed(2)
    });

    // Decrease values gradually to match your pattern
    analogValue -= Math.floor(Math.random() * 5 + 3);  // Decrease by 3-8 each time
    ppm -= Math.floor(Math.random() * 30 + 20);       // Decrease by 20-50 each time
    
    // Add 10 seconds to timestamp
    baseTime = new Date(baseTime.getTime() + 10000);
  }
  
  return mockData;
}

app.get("/sensor-data", (req, res) => {
  const mockData = generateMockData();
  res.json(mockData);
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
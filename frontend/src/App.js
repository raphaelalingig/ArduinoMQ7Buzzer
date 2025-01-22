import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const App = () => {
  const [currentData, setCurrentData] = useState({ analogValue: 0, ppm: 0 });
  const [historicalData, setHistoricalData] = useState([]);
  const [alert, setAlert] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current and historical sensor data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest reading
        const currentResponse = await fetch("http://localhost:5000/sensor-data");
        const currentData = await currentResponse.json();
        setCurrentData(currentData);
        
        // Fetch historical data
        const historyResponse = await fetch("http://localhost:5000/sensor-data?type=history");
        const historyData = await historyResponse.json();
        setHistoricalData(historyData);

        // Update alert status
        setAlert(parseFloat(currentData.ppm) >= 1000);
        setError(null);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setError("Failed to fetch sensor data");
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 2 seconds
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "Arial", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>MQ7 Carbon Monoxide Sensor Dashboard</h1>
      
      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      <div style={{ 
        padding: "20px", 
        backgroundColor: "#f5f5f5", 
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <h2>Current Readings</h2>
        <p>
          <strong>Analog Value:</strong> {currentData.analogValue}
        </p>
        <p>
          <strong>PPM:</strong> {currentData.ppm}
        </p>
        <p>
          <strong>Last Updated:</strong> {currentData.timestamp}
        </p>
        {alert && (
          <div style={{ 
            color: "white", 
            backgroundColor: "red", 
            padding: "10px", 
            borderRadius: "4px",
            fontWeight: "bold",
            textAlign: "center"
          }}>
            WARNING: High CO levels detected!
          </div>
        )}
      </div>

      {historicalData.length > 0 && (
        <div>
          <h2>Historical Data</h2>
          <LineChart
            width={750}
            height={300}
            data={historicalData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
            />
            <YAxis yAxisId="left" label={{ value: 'PPM', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Analog', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ppm"
              stroke="#8884d8"
              name="PPM"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="analogValue"
              stroke="#82ca9d"
              name="Analog Value"
            />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default App;
const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
app.use(cors());

let latestData = {
  analogValue: 0,
  ppm: 0,
  timestamp: new Date().toISOString(),
};
const dataHistory = [];
const MAX_HISTORY = 30; // Keep last 30 readings

// Initialize SerialPort
let port;
try {
  port = new SerialPort({
    path: "COM3", // Make sure this matches your Arduino's port
    baudRate: 9600,
    autoOpen: false, // Don't open immediately
  });

  port.open((err) => {
    if (err) {
      console.error("Error opening port:", err.message);
    } else {
      console.log("Port opened successfully");

      const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

      parser.on("data", (data) => {
        try {
          // Assuming Arduino sends data in format: "analogValue,ppm"
          const [analogValue, ppm] = data.trim().split(",").map(Number);

          const timestamp = new Date().toISOString();
          latestData = { analogValue, ppm, timestamp };

          // Add to history and maintain maximum size
          dataHistory.unshift(latestData);
          if (dataHistory.length > MAX_HISTORY) {
            dataHistory.pop();
          }

          console.log("Received data:", latestData);
        } catch (error) {
          console.error("Error parsing data:", error.message);
        }
      });
    }
  });

  port.on("error", (err) => {
    console.error("Serial port error:", err.message);
  });
} catch (error) {
  console.error("Error initializing SerialPort:", error.message);
}

app.get("/sensor-data", (req, res) => {
  const type = req.query.type || "latest";

  if (type === "history") {
    res.json(dataHistory);
  } else {
    res.json(latestData);
  }
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});

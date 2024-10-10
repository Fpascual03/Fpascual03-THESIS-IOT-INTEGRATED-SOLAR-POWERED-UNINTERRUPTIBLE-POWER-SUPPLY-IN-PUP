// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJnBJDnb4F6yfRUAZecsX-GPiXmrO6K3o",
  authDomain: "working-ba4f3.firebaseapp.com",
  databaseURL:
    "https://working-ba4f3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "working-ba4f3",
  storageBucket: "working-ba4f3.appspot.com",
  messagingSenderId: "170127063382",
  appId: "1:170127063382:web:d90e7415f30a11bb00bef7",
  measurementId: "G-TTHR04NDRL",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Reference to your database
const dataRef1 = database.ref("dc_voltage");
const dataRef2 = database.ref("power");
const dataRef3 = database.ref("total_power_kwh");

// Function to initialize the chart
function initChart() {
  const ctx = document.getElementById("myChart").getContext("2d");
  window.myLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Voltage",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          data: [],
          fill: false,
          lineTension: 0.3, // Make lines smoother
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 10, // Limit the number of ticks on the x-axis to 10
          },
          scaleLabel: {
            display: true,
            labelString: "Time",
          },
        },
        y: {
          scaleLabel: {
            display: true,
            labelString: "Voltage (V)",
          },
        },
      },
      legend: {
        display: false,
      },
      tooltips: {
        intersect: false,
        mode: "index",
      },
      elements: {
        point: {
          radius: 0, // Remove points
        },
      },
      title: {
        display: true,
        text: "Voltage over Time", // Add chart title
        fontSize: 16, // Increase font size
      },
      layout: {
        padding: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        },
      },
      borderColor: "#ccc", // Add border color
      borderWidth: 1, // Add border width
    },
  });
}

// Function to update the chart with new data
function updateChart(voltage) {
  const currentTime = new Date().toLocaleTimeString();
  window.myLineChart.data.labels.push(currentTime);
  window.myLineChart.data.datasets.forEach((dataset) => {
    dataset.data.push(voltage);
  });

  // Remove oldest data if more than 1440 data points (24 hours)
  if (window.myLineChart.data.labels.length > 1440) {
    window.myLineChart.data.labels.shift();
    window.myLineChart.data.datasets.forEach((dataset) => {
      dataset.data.shift();
    });
  }

  window.myLineChart.update();
}

// Function to fetch historical data for the last 24 hours from Firebase
function fetchHistoricalData() {
  const dataRef = firebase.database().ref("Logs");
  const endTime = new Date(); // Current time
  const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

  dataRef.once("value", (snapshot) => {
    const logs = snapshot.val();
    const labels = [];
    const voltages = [];

    for (const date in logs) {
      if (logs.hasOwnProperty(date)) {
        for (const timestamp in logs[date]) {
          if (logs[date].hasOwnProperty(timestamp)) {
            const logTime = new Date(timestamp);
            if (logTime >= startTime && logTime <= endTime) {
              labels.push(logTime.toLocaleTimeString());
              voltages.push(logs[date][timestamp].dc_voltage);
            }
          }
        }
      }
    }

    window.myLineChart.data.labels = labels;
    window.myLineChart.data.datasets[0].data = voltages;
    window.myLineChart.update();
  });
}
// Real-time update function
function startLiveUpdate() {
  liveUpdateInterval = setInterval(() => {
    const volt = window.currentVoltage || 0; // Use the current voltage if available
    updateChart(volt);
  }, 1000); // Update every second
}

// Function to stop real-time updates
function stopLiveUpdate() {
  clearInterval(liveUpdateInterval);
}

// Function to toggle between live data and 24-hour historical data
function toggleData() {
  const button = document.getElementById("fetch-24hours");
  if (button.dataset.mode === "live") {
    stopLiveUpdate(); // Stop live updates
    fetchHistoricalData();
    button.dataset.mode = "historical";
    button.textContent = "Show Live Data";
  } else {
    // Clear chart data
    window.myLineChart.data.labels = [];
    window.myLineChart.data.datasets[0].data = [];
    window.myLineChart.update();

    // Start real-time updates
    startLiveUpdate();
    button.dataset.mode = "live";
    button.textContent = "Show Last 24 Hours";
  }
}

// Set up the chart on page load
initChart();

// Start real-time updates on page load
startLiveUpdate();

// Add event listener to the button
document.getElementById("fetch-24hours").addEventListener("click", toggleData);
// Existing code for fetching data and updating elements
dataRef1.on(
  "value",
  function (snapshot) {
    const volt = snapshot.val();
    document.getElementById("voltage1").textContent = volt + "v";

    // Update battery level and percentage based on voltage
    updateBatteryLevel(volt);

    // Update the global current voltage
    window.currentVoltage = volt;
  },
  function (error) {
    // Error handler that logs any issues to the console
    console.error("Error fetching data:", error);
  }
);

dataRef2.on(
  "value",
  function (snapshot) {
    let watt = snapshot.val();
    watt = Math.round(watt);
    document.getElementById("power").textContent = watt + "w";

    // Calculate estimated uptime in minutes
    const uptimeSeconds = calculateUptimeSeconds(window.currentVoltage, watt);

    // Display the estimated uptime as a countdown timer
    displayCountdownTimer(uptimeSeconds);
  },
  function (error) {
    console.error("Error fetching data:", error);
  }
);
dataRef3.on(
  "value",
  function (snapshot) {
    const tot = snapshot.val();
    document.getElementById("tot-power").textContent = tot + " watts";
    console.log("Total Power:", tot);
  },
  function (error) {
    console.error("Error fetching data:", error);
  }
);

// Function to display countdown timer
function updateBatteryLevel(voltage) {
  const batteryLevel = document.getElementById("battery-level");
  const batteryPercentage = document.getElementById("battery-percentage");

  // Define the voltage range for 0% to 100%
  const minVoltage = 11.8; // 0%
  const maxVoltage = 12.7; // 100%

  // Calculate the battery percentage based on the voltage
  let percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;

  // Clamp the percentage between 0 and 100
  percentage = Math.min(Math.max(percentage, 0), 100);

  // Update the battery level width and text content
  batteryLevel.style.width = percentage + "%";
  batteryPercentage.textContent = percentage.toFixed(2) + "%";
}

function calculateUptimeSeconds(voltage, watt) {
  const minVoltage = 11.8; // 0%
  const maxVoltage = 12.7; // 100%
  const usableCapacity = 144 * 0.5; // 72 Wh
  const batteryPercentage = (voltage - minVoltage) / (maxVoltage - minVoltage);
  const availableWh = usableCapacity * batteryPercentage;
  const uptimeSeconds = (availableWh / watt) * 3600;
  return Math.round(uptimeSeconds);
}

// Function to display countdown timer in minutes and seconds
function displayCountdownTimer(uptimeSeconds) {
  const timerElement = document.getElementById("timer");
  const alarmThreshold = 300; // 5 minutes threshold
  const alarmSound = document.getElementById("lowBatteryAlarm");

  if (window.timerInterval) {
    clearInterval(window.timerInterval);
  }

  timerElement.textContent = formatTime(uptimeSeconds);

  window.timerInterval = setInterval(function () {
    uptimeSeconds--;
    timerElement.textContent = formatTime(uptimeSeconds);

    if (uptimeSeconds <= 0) {
      clearInterval(window.timerInterval);
      timerElement.textContent = "Offline";
    }

    // Play the alarm sound if the remaining time is below the threshold
    if (uptimeSeconds <= alarmThreshold) {
      alarmSound.play();
    }
  }, 1000);
}

// Function to format time (converts seconds to MM:SS format)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}
function updateBarChart(totPower) {
  const ctx = document.getElementById("barChart").getContext("2d");
  if (!window.myBarChart) {
    window.myBarChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Total Power",
            backgroundColor: "rgba(204, 85, 0, 0.8)",
            borderColor: "rgba(204, 85, 0, 1)",
            borderWidth: 1,
            data: [],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Month",
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              scaleLabel: {
                display: true,
                labelString: "Power (W)",
              },
            },
          ],
        },
      },
    });
  }

  const currentMonth = new Date().toLocaleString("default", { month: "long" }); // Get current month name
  const currentYear = new Date().getFullYear(); // Get current year
  const currentLabel = `${currentMonth} ${currentYear}`;

  // Check if the current month label exists in the chart data
  const index = window.myBarChart.data.labels.indexOf(currentLabel);
  if (index !== -1) {
    // If the current month label exists, update the corresponding dataset value
    window.myBarChart.data.datasets[0].data[index] = totPower;
  } else {
    // If the current month label does not exist, add it and its corresponding dataset value
    window.myBarChart.data.labels.push(currentLabel);
    window.myBarChart.data.datasets[0].data.push(totPower);
  }

  if (window.myBarChart.data.labels.length > 12) {
    // Limit the number of bars to 12 (one year)
    window.myBarChart.data.labels.shift();
    window.myBarChart.data.datasets[0].data.shift();
  }

  window.myBarChart.update();
}

// Update bar chart with new data
dataRef3.on("value", function (snapshot) {
  const totPower = snapshot.val();
  updateBarChart(totPower);
});

document.querySelectorAll(".input-box label").forEach((label) => {
  label.addEventListener("click", () => {
    label.previousElementSibling.focus();
  });
});

function updateBatteryLevel(volt) {
  const batteryLevelElement = document.getElementById("battery-level");
  let bars = 0;

  if (volt >= 12.8) {
    bars = 4;
  } else if (volt >= 12.5) {
    bars = 3;
  } else if (volt >= 12.2) {
    bars = 2;
  } else if (volt >= 11.7) {
    bars = 1;
  } else {
    // If voltage is below 12.0 or negative, consider it as 0
    bars = 0;
  }
  // Remove existing classes
  batteryLevelElement.classList.remove(
    "level-1",
    "level-2",
    "level-3",
    "level-4"
  );
  // Add class based on the number of bars
  batteryLevelElement.classList.add("level-" + bars);
}

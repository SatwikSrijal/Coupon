// // ----- Common Storage Function -----
// function storeNumber(date, time, value) {
//   let data = JSON.parse(localStorage.getItem("numberData")) || {};
//   if (!data[date]) data[date] = [];

//   // If the time slot already exists, update it
//   let existing = data[date].find(item => item.time === time);
//   if (existing) {
//     existing.value = value;
//   } else {
//     data[date].push({ time, value });
//   }

//   localStorage.setItem("numberData", JSON.stringify(data));
// }

// // ----- Admin Panel Logic -----
// function populateTimeSlots() {
//   let select = document.getElementById("timeSlot");
//   if (!select) return;

//   for (let hour = 8; hour <= 18; hour++) {
//     for (let minute of [0, 30]) {
//       let timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//       let option = document.createElement("option");
//       option.value = timeStr;
//       option.textContent = timeStr;
//       select.appendChild(option);
//     }
//   }
// }

// if (document.getElementById("saveBtn")) {
//   populateTimeSlots();

//   const saveBtn = document.getElementById("saveBtn");
//   const status = document.getElementById("status");

//   saveBtn.addEventListener("click", () => {
//     let time = document.getElementById("timeSlot").value;
//     let num = document.getElementById("numberInput").value;

//     if (!num) {
//       status.textContent = "Please enter a number!";
//       status.style.color = "red";
//       return;
//     }

//     let today = new Date().toISOString().split("T")[0];
//     storeNumber(today, time, parseInt(num));

//     status.textContent = `Number ${num} saved for ${time} on ${today}`;
//     status.style.color = "green";
//     document.getElementById("numberInput").value = "";
//   });
// }

// // ----- User Panel Logic -----
// function loadData(date) {
//   let data = JSON.parse(localStorage.getItem("numberData")) || {};
//   const dataTable = document.getElementById("dataTable");
//   if (!dataTable) return;

//   dataTable.innerHTML = "";
//   if (data[date] && data[date].length > 0) {
//     data[date].forEach(item => {
//       let row = `<tr><td>${item.time}</td><td>${item.value}</td></tr>`;
//       dataTable.innerHTML += row;
//     });
//   } else {
//     dataTable.innerHTML = "<tr><td colspan='2'>No data for this date</td></tr>";
//   }
// }

// if (document.getElementById("datePicker")) {
//   const datePicker = document.getElementById("datePicker");

//   // Restrict date to last 6 months
//   let today = new Date();
//   let sixMonthsAgo = new Date();
//   sixMonthsAgo.setMonth(today.getMonth() - 6);
//   datePicker.max = today.toISOString().split("T")[0];
//   datePicker.min = sixMonthsAgo.toISOString().split("T")[0];

//   // Auto select today's date and load data
//   datePicker.value = today.toISOString().split("T")[0];
//   loadData(datePicker.value);

//   datePicker.addEventListener("change", () => {
//     loadData(datePicker.value);
//   });
// }


// ---- API Base URL ----
// If backend runs locally: use http://localhost:5000
// If deployed, replace with your server URL
const API_URL = "http://localhost:5000";

// ---- Admin Panel Logic ----
function populateTimeSlots() {
  let select = document.getElementById("timeSlot");
  if (!select) return;

  for (let hour = 8; hour <= 18; hour++) {
    for (let minute of [0, 30]) {
      let timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      let option = document.createElement("option");
      option.value = timeStr;
      option.textContent = timeStr;
      select.appendChild(option);
    }
  }
}

// Save number to backend
async function storeNumber(date, time, value) {
  try {
    let res = await fetch(`${API_URL}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time, value })
    });

    let data = await res.json();
    return data.message || "Saved!";
  } catch (err) {
    console.error("Error saving:", err);
    return "Error saving data!";
  }
}

// Attach Save button logic
if (document.getElementById("saveBtn")) {
  populateTimeSlots();

  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");

  saveBtn.addEventListener("click", async () => {
    let time = document.getElementById("timeSlot").value;
    let num = document.getElementById("numberInput").value;

    if (!num) {
      status.textContent = "Please enter a number!";
      status.style.color = "red";
      return;
    }

    let today = new Date().toISOString().split("T")[0];
    let msg = await storeNumber(today, time, parseInt(num));

    status.textContent = `${msg} (${time} on ${today})`;
    status.style.color = "green";
    document.getElementById("numberInput").value = "";
  });
}

// ---- User Panel Logic ----
async function loadData(date) {
  const dataTable = document.getElementById("dataTable");
  if (!dataTable) return;

  try {
    let res = await fetch(`${API_URL}/get/${date}`);
    let records = await res.json();

    dataTable.innerHTML = "";
    if (records.length > 0) {
      records.forEach(item => {
        let row = `<tr><td>${item.time}</td><td>${item.value}</td></tr>`;
        dataTable.innerHTML += row;
      });
    } else {
      dataTable.innerHTML = "<tr><td colspan='2'>No data for this date</td></tr>";
    }
  } catch (err) {
    console.error("Error loading data:", err);
    dataTable.innerHTML = "<tr><td colspan='2'>Error loading data</td></tr>";
  }
}

if (document.getElementById("datePicker")) {
  const datePicker = document.getElementById("datePicker");

  // Restrict date to last 6 months
  let today = new Date();
  let sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  datePicker.max = today.toISOString().split("T")[0];
  datePicker.min = sixMonthsAgo.toISOString().split("T")[0];

  // Auto select today's date and load data
  datePicker.value = today.toISOString().split("T")[0];
  loadData(datePicker.value);

  datePicker.addEventListener("change", () => {
    loadData(datePicker.value);
  });
}

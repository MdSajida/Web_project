const weatherApiKey = "e3825d274d213eafab5155df496c5ce8"; // Replace with your OpenWeatherMap API key

// Check if there's saved history in localStorage, if so, load it
const loadHistoryFromLocalStorage = () => {
  const savedHistory = localStorage.getItem('weatherHistory');
  if (savedHistory) {
    return JSON.parse(savedHistory);
  }
  return {};
};

let searchHistory = loadHistoryFromLocalStorage();

// Function to save the history to localStorage
const saveHistoryToLocalStorage = () => {
  localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
};


const contentLi = ( listItem,historyList,name, sys, main, weather, wind, coord,date,city ) => {
    
      listItem.innerHTML=`
    <div class="d-flex flex-column mb-3">
        <!-- Item Header: City Name, Date, and Remove Button -->
        <div class="item-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">${name}, ${sys.country}</h5>
          <div class="d-flex align-items-center">
            <small class="me-2 text-muted">${date}</small>
            <button class="btn btn-danger btn-sm removehis">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
          </svg>
            </button>
          </div>
        </div>
    
        <!-- Weather details and Map Section -->
        <div class="d-flex flex-column flex-md-row justify-content-around align-items-start mt-3">
          <div class="weather-details p-4 mb-4 mb-md-0 me-md-3">
            <p class="mb-3">🌡️ <strong class="weather-detail-value">Temperature:</strong> ${main.temp}°C</p>
            <p class="mb-3">🌥️ <strong class="weather-detail-value">Weather:</strong> ${weather[0].description}</p>
            <p class="mb-3">💧 <strong class="weather-detail-value">Humidity:</strong> ${main.humidity}%</p>
            <p class="mb-3">🍃 <strong class="weather-detail-value">Wind Speed:</strong> ${wind.speed} m/s</p>
          </div>

          <div id="map-${city}" class="history-map" style="height: 200px; width: 100%; max-width: 300px;"></div>
        </div>
      </div>
    `;

    
    // Append the item to the history list
    historyList.prepend(listItem);

    // Remove button functionality
    listItem.querySelector(".removehis").addEventListener("click", () => {
      listItem.remove();
       // Remove from searchHistory and update localStorage

      delete searchHistory[city];
      console.log(city, searchHistory)
      saveHistoryToLocalStorage();
     
    });

    // Render a map in the history item
    initMapInHistory(coord.lat, coord.lon, `map-${city}`);
  };


// Display saved history when the page loads or is refreshed
const displaySavedHistory = () => {
  const historyList = document.getElementById("history-list");
  
  Object.keys(searchHistory).forEach(city => {
    const { name, sys, main, weather, wind, coord } = searchHistory[city].data;
    const date = new Date(searchHistory[city].timestamp).toLocaleDateString();

    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item", "position-relative");

    // Add weather details and map to the history item
    contentLi( listItem,historyList,name, sys, main, weather, wind,coord, date,city );
   
  });
};

document.getElementById("search-btn").addEventListener("click", async () => {
  const city = document.getElementById("city").value.trim();
  const errorAlert = document.getElementById("error-alert");

  errorAlert.classList.add("d-none");

  if (!city) {
    errorAlert.innerText = "Please enter a city name.";
    errorAlert.classList.remove("d-none");
    return;
  }

  if (searchHistory[city]) {
    displayWeather(searchHistory[city].data, city, false); // Show existing data
    return;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
    );
    if (!response.ok) throw new Error("City not found");
    const weatherData = await response.json();
    searchHistory[city] = { data: weatherData, timestamp: Date.now() };

    displayWeather(weatherData, city, true);
    saveHistoryToLocalStorage(); // Save updated history to localStorage
  } catch (error) {
    errorAlert.innerText = error.message;
    errorAlert.classList.remove("d-none");
  }
});

function displayWeather(weatherData, city, addToHistory) {
  const { name, sys, main, weather, wind, coord } = weatherData;
  document.getElementById("city").value = "";

  if (addToHistory) {
    const date = new Date().toLocaleDateString(); // Record the current date
    const historyList = document.getElementById("history-list");
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item", "position-relative");

    // Add weather details and map to the history item
     // Add weather details and map to the history item
    contentLi( listItem,historyList,name, sys, main, weather, wind, coord,date,city );
  }
}

async function initMapInHistory(lat, lon, mapId) {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const m=new Map(document.getElementById(mapId), {
    center: { lat, lng: lon },
    zoom: 8,
    mapId: "DEMO_MAP_ID",
  });
   // The marker, 
   const marker = new AdvancedMarkerElement({
    map: m,
    position:{ lat, lng: lon },
  });
}

// Display saved history on page load
window.onload = () => {
  displaySavedHistory();
};

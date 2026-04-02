const apiKey = "MY_API_KEY"; 
const cityInput = document.getElementById("cityInput");
const suggestionsBox = document.getElementById("suggestions");
const searchBtn = document.getElementById("searchBtn");

function showSection(id) {
    document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
}

// 1. Live Autocomplete
cityInput.addEventListener("input", async () => {
    const query = cityInput.value.trim();
    if (query.length < 2) { suggestionsBox.style.display = "none"; return; }
    try {
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
        const cities = await res.json();
        if (cities.length > 0) {
            suggestionsBox.innerHTML = "";
            suggestionsBox.style.display = "block";
            cities.forEach(city => {
                const div = document.createElement("div");
                div.classList.add("suggestion-item");
                div.innerText = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
                div.onclick = () => {
                    cityInput.value = city.name;
                    suggestionsBox.style.display = "none";
                    checkWeather(city.name);
                };
                suggestionsBox.appendChild(div);
            });
        }
    } catch (err) { console.error("Autocomplete error:", err); }
});

// 2. Main Logic
async function checkWeather(city) {
    if (!city) return;
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        const data = await res.json();
        if (data.cod !== 200) { alert("City not found!"); return; }

        document.getElementById("city").innerText = data.name;
        document.getElementById("forecastCity").innerText = `Forecast: ${data.name}`;
        document.getElementById("temp").innerText = Math.round(data.main.temp) + "°C";
        document.getElementById("description").innerText = data.weather[0].description;
        document.getElementById("humidity").innerText = data.main.humidity + "%";
        document.getElementById("sunrise").innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        document.getElementById("sunset").innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

        const iconImg = document.getElementById("mainIcon");
        iconImg.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        iconImg.style.display = "block";

        getAQI(data.coord.lat, data.coord.lon);
        
        const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
        const fData = await fRes.json();
        displayForecast(fData);
    } catch (err) { console.error("Weather fetch error:", err); }
}

async function getAQI(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await res.json();
        const levels = ["Good","Fair","Moderate","Poor","Very Poor"];
        document.getElementById("aqi").innerText = levels[data.list[0].main.aqi - 1];
    } catch (e) { document.getElementById("aqi").innerText = "N/A"; }
}

function displayForecast(data) {
    const grid = document.getElementById("forecastGrid");
    grid.innerHTML = "";
    // Pull the midday forecast for the next 5 days
    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    daily.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        grid.innerHTML += `
        <div class="forecast-row">
            <div class="forecast-date">${date}</div>
            <div class="forecast-main">
                <div class="forecast-left">
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
                    <div class="forecast-text">${day.weather[0].description}</div>
                </div>
                <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
            </div>
        </div>`;
    });
}

searchBtn.addEventListener("click", () => checkWeather(cityInput.value));
cityInput.addEventListener("keypress", e => { if (e.key === "Enter") checkWeather(cityInput.value); });
document.addEventListener("click", (e) => { if (e.target !== cityInput) suggestionsBox.style.display = "none"; });

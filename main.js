const yourWeatherTab = document.querySelector("[data-your-weather]");
const searchWeatherTab = document.querySelector("[data-search-weather]");
const locationAccess = document.querySelector("[data-location-access]");
const grantText = document.querySelector("#grant-text");
const formSearch = document.querySelector("[data-search-form]");
const weatherInfo = document.querySelector("[data-weather-info]");
const errorCode = document.querySelector("[data-error]");
const accessBtn = document.querySelector("[data-access-btn]");
const searchBtn = document.querySelector("#search-btn");
const loading = document.querySelector("[data-loading-screen]");
const city = document.querySelector("[data-city]");
const flag = document.querySelector("[data-flag]");
const weatherType = document.querySelector("[data-weather-type]");
const weatherImg = document.querySelector("[data-weather-img]");
const temp = document.querySelector("[data-temp]");
const windspeed = document.querySelector("[data-windspeed]");
const humidity = document.querySelector("[data-humidity]");
const clouds = document.querySelector("[data-clouds]");
let userInput = document.querySelector("[data-city-input]");

const API_KEY = import.meta.env.VITE_API_KEY
let currentTab = yourWeatherTab;
geoLocationAccess();

accessBtn.addEventListener("click", geoLocationAccess);

function switchTab(clickedTab) {
	if (clickedTab !== currentTab) {
		currentTab.classList.remove("active-tab");
		currentTab = clickedTab;
		currentTab.classList.add("active-tab");

		if (!searchWeatherTab.classList.contains("active-tab")) {
			geoLocationAccess();
			// your weather
			weatherInfo.classList.remove("active");
			formSearch.classList.remove("active");
			if (errorCode.classList.contains("active")) {
				errorCode.classList.remove("active");
			}
			if (!sessionStorage.getItem) {
				getDataByCoords(getFromSessionStorage());
			}
		} else {
			//search weather
			formSearch.classList.add("active");
			locationAccess.classList.remove("active");
			weatherInfo.classList.remove("active");
		}
	}
}

yourWeatherTab.addEventListener("click", () => {
	switchTab(yourWeatherTab);
});
searchWeatherTab.addEventListener("click", () => {
	switchTab(searchWeatherTab);
});

async function getDataByCity() {
	const city = userInput.value;

	loading.classList.add("active");
	errorCode.classList.remove("active");
	weatherInfo.classList.remove("active");
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
		);
		const data = await response.json();
		userInput.value = "";
		loading.classList.remove("active");
		weatherInfo.classList.add("active");
		displayReceivedData(data);
	} catch (error) {
		weatherInfo.classList.remove("active");
		loading.classList.remove("active");
		console.log("loading removed");
		errorCode.classList.add("active");
	}
}

function geoLocationAccess() {
	locationAccess.classList.remove("active");
	if (navigator.geolocation) {
		loading.classList.add("active");
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const obj = {
					lat: pos.coords.latitude,
					lon: pos.coords.longitude,
				};
				loading.classList.remove("active");
				getDataByCoords(obj);
				sessionStorage.setItem("userCoordinates", JSON.stringify(obj));
			},
			(err) => {
				if (err.code === 1) {
					grantText.textContent =
						"You denied the request for Geolocation";
					locationAccess.classList.add("active");
					loading.classList.remove("active");
				} else {
					errorCode.classList.add("active");
				}
			}
		);
	} else {
		console.log("Your browser does not support Geolocation");
	}
}

function getFromSessionStorage() {
	const storedCoordsObject = sessionStorage.getItem("userCoordinates");
	const sessionCoordinates = JSON.parse(storedCoordsObject);
	return sessionCoordinates;
}

async function getDataByCoords(coords) {
	const { lat, lon } = coords;
	loading.classList.add("active");
	weatherInfo.classList.remove("active");
	errorCode.classList.remove("active");
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
		);
		const data = await response.json();
		loading.classList.remove("active");
		weatherInfo.classList.add("active");
		displayReceivedData(data);
	} catch (error) {
		weatherInfo.classList.remove("active");
		loading.classList.remove("active");
		errorCode.classList.add("active");
		console.log(error);
	}
}

function displayReceivedData(data) {
	city.textContent = data?.name;
	try {
		flag.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
	} catch (e) {console.log(e)}
	weatherType.textContent = data?.weather[0]?.main;
	weatherImg.src = `https://openweathermap.org/img/w/${data?.weather[0]?.icon}.png`;
	temp.textContent = `${data?.main?.temp} \u00B0C`;
	windspeed.textContent = `${data?.wind?.speed}m/s`;
	clouds.textContent = `${data?.clouds?.all}%`;
	humidity.textContent = `${data?.main?.humidity}%`;
}

formSearch.addEventListener("submit", (e) => {
	e.preventDefault();
	if (userInput.value === "") {
		return;
	} else {
		getDataByCity();
	}
});

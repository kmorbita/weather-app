let key = "98b50b394945b51fdf4f38c57e5fefd8";
let defaultCity = "Panabo";


function pageLoad() {
    let tempScale = localStorage.getItem("temperature");
    if (tempScale !== undefined && tempScale !== null) {
        tempScaleFunction(tempScale);
    } else {
        localStorage.setItem("temperature", "celsius");
        document.getElementById("celsius").classList.add("active");
        document.getElementById("fahrenheit").classList.remove("active");
    }
    let dataToday = localStorage.getItem("weather");
    if (dataToday !== undefined && dataToday !== null) {
        displayData(JSON.parse(dataToday));
    } else {
        fetchData(defaultCity);
    }
    let dataWeekly = localStorage.getItem("weekly");
    if (dataWeekly !== undefined && dataWeekly !== null) {
        let tempDataWeekly = JSON.parse(dataWeekly)
        processWeeklyData(tempDataWeekly.list);
    } else {
        fetchData(defaultCity);
    }
}

function getInput(event) {
    if (event.key == "Enter") {
        // let search = document.getElementById("search");
        // if (search.value.trim() !== undefined && search.value.trim() !== null && search.value.trim() !== "") {
        //     fetchData(capitalizeWords(search.value.trim()));
        //     fetchDataWeekly(capitalizeWords(search.value.trim()));
        // } else {
        //     alert("Please search a city.");
        // }
        // search.value = "";
        let search = "";
        if (window.matchMedia("(max-width: 890px)").matches) {
            search = document.getElementById("sidebar-search");
        } else {
            search = document.getElementById("search");
        }
        if (search.value.trim() !== undefined && search.value.trim() !== null && search.value.trim() !== "") {
            fetchData(capitalizeWords(search.value.trim()));
            fetchDataWeekly(capitalizeWords(search.value.trim()));
        } else {
            alert("Please search a city.");
        }
        search.value = "";
    }
}

function capitalizeWords(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


async function fetchData(city) {
    let path = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
    try {
        let response = await fetch(path);
        if (!response.ok) {
            throw new Error("Network response is not ok.");
        }
        const data = await response.json();
        localStorage.setItem("weather", JSON.stringify(data));
        displayData(data);
    } catch (error) {
        console.error("There was a problem in fetch operation: ", error);
        alert(`The city "${city}" inputted is not valid. Please try another city.`);
    }
}

async function fetchDataWeekly(city) {
    let path = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`;
    try {
        let response = await fetch(path);
        if (!response.ok) {
            throw new Error("Network response is not ok.");
        }
        const data = await response.json();
        localStorage.setItem("weekly", JSON.stringify(data));
        await processWeeklyData(data.list);
    } catch (error) {
        console.error("There was a problem in fetch operation: ", error);
        alert(`The city "${city}" inputted is not valid. Please try another city.`);
    }
}

async function findCountryByCode(code) {
    try {
        let response = await fetch("countries.json");
        if (!response.ok) {
            throw new Error("Network response of countries in not ok.");
        }
        let countries = await response.json();
        let country = countries.find(country => country.code == code.toUpperCase());
        return country ? country.country : "Country not found.";
    } catch (error) {
        console.error("There was a problem in finding the country.");
    }
}

async function findImageByCode(code) {
    try {
        let response = await fetch("images.json");
        if (!response.ok) {
            throw new Error("Network response of images in not ok.");
        }
        let images = await response.json();
        let image = images.find(image => image.code == code);
        return image ? image.path : "/images/no-image.png";
    } catch (error) {
        console.error("There was a problem in finding the weather image.");
    }
}

async function processWeeklyData(data) {
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let time3AM = "03:00:00";
    let time12PM = "12:00:00";
    let d = new Date();
    let date = new Date(d);
    let i = 1;
    let html = "";
    while (i <= 5) {
        date.setDate(d.getDate() + i);
        let newDate = `${date.getFullYear()}-${date.getMonth() + 1}-${padZeros(date.getDate())}`;
        let newDateTime3am = `${date.getFullYear()}-${date.getMonth() + 1}-${padZeros(date.getDate())} ${time3AM}`;
        let newDateTime12pm = `${date.getFullYear()}-${date.getMonth() + 1}-${padZeros(date.getDate())} ${time12PM}`;
        let weeklyData = data.find(dat => dat.dt_txt == newDateTime12pm);
        if (weeklyData === undefined) {
            weeklyData = data.find(dat => dat.dt_txt == newDateTime3am);
        }
        html += await displayWeeklyData(weeklyData, days[date.getDay()], newDate);
        i++;
    }
    document.getElementById("weekly").innerHTML = html;
}

function padZeros(date) {
    date = date.toString();
    date = date.padStart(2, "0");
    return date;
}

async function displayWeeklyData(data, day, date) {
    // console.log(data);
    let weather_image = await findImageByCode(data.weather[0].id);
    // let weather_image = "https://cdn2.iconfinder.com/data/icons/weather-flat-14/64/weather07-512.png";
    let txt = `<div class="tile">`;
    txt += `<div class="weekly-tile-title-group">`;
    txt += `<h1 class="weekly-tile-title">${day}</h1>`;
    txt += `<h3 class="weekly-tile-subtitle">${date}</h3>`;
    txt += `</div>`;
    txt += `<div style="width: 100%;text-align: center;margin-top: 40px;">`;
    txt += `<img src="${weather_image}" class="weekly-tile-image" alt="">`;
    txt += `</div>`;
    txt += `<div style="margin-bottom: 10px;">`;
    txt += `<p class="tile-value">${autoConvertTemp(data.main.temp)}</p>`;
    txt += `</div>`;
    txt += `</div>`;
    return txt;
}

async function displayData(data) {
    let country = await findCountryByCode(data.sys.country);
    let weather_image = await findImageByCode(data.weather[0].id);
    let main_temp = data !== undefined && data !== null ? autoConvertTemp(data.main.temp).toString() : "d";
    let weather_desc = capitalizeWords(data.weather[0].description);
    let feels_like = autoConvertTemp(data.main.feels_like);
    let max_temp = autoConvertTemp(data.main.temp_max);
    let min_temp = autoConvertTemp(data.main.temp_min);
    let wind_speed = data.wind.speed;
    let visibility = data.visibility;
    let humidity = data.main.humidity;
    let sunrise = convertUtcToPhilippineTime(data.sys.sunrise);
    let sunset = convertUtcToPhilippineTime(data.sys.sunset);
    let grnd_level = data.main.grnd_level;
    let sea_level = data.main.sea_level;
    let wind_gust = data.wind.gust;
    let wind_deg = data.wind.deg;
    let place_title = `${capitalizeWords(data.name)}, ${country}`


    document.getElementById("main-temp").innerHTML = main_temp;
    document.getElementById("main-weather-desc").innerHTML = weather_desc;
    document.getElementById("feels-like").innerHTML = feels_like;
    document.getElementById("max-temp").innerHTML = max_temp;
    document.getElementById("min-temp").innerHTML = min_temp;
    document.getElementById("wind-speed").innerHTML = wind_speed;
    document.getElementById("visibility").innerHTML = visibility;
    document.getElementById("humidity").innerHTML = humidity;
    document.getElementById("sunrise").innerHTML = sunrise;
    document.getElementById("sunset").innerHTML = sunset;
    document.getElementById("ground-level").innerHTML = grnd_level;
    document.getElementById("sea-level").innerHTML = sea_level;
    document.getElementById("wind-gust").innerHTML = wind_gust;
    document.getElementById("wind-deg").innerHTML = wind_deg;
    document.getElementById("place-title").innerHTML = place_title;
    document.getElementById("weather-image").src = weather_image;
}



function tempScaleFunction(event) {
    if (event !== undefined && event !== null && event != "") {
        if (event == "celsius") {
            localStorage.setItem("temperature", "celsius");
            document.getElementById("celsius").classList.add("active");
            document.getElementById("sidebar-celsius").classList.add("active");
            document.getElementById("fahrenheit").classList.remove("active");
            document.getElementById("sidebar-fahrenheit").classList.remove("active");
        } else {
            localStorage.setItem("temperature", "fahrenheit");
            document.getElementById("fahrenheit").classList.add("active");
            document.getElementById("sidebar-fahrenheit").classList.add("active");
            document.getElementById("celsius").classList.remove("active");
            document.getElementById("sidebar-celsius").classList.remove("active");
        }
        getWeatherForcastData();
    }
}

function getWeatherForcastData() {
    let dataToday = localStorage.getItem("weather");
    if (dataToday !== undefined && dataToday !== null) {
        displayData(JSON.parse(dataToday));
    } else {
        fetchData(defaultCity);
    }
    let dataWeekly = localStorage.getItem("weekly");
    if (dataWeekly !== undefined && dataWeekly !== null) {
        let tempDataWeekly = JSON.parse(dataWeekly)
        processWeeklyData(tempDataWeekly.list);
    } else {
        fetchDataWeekly(defaultCity);
    }
}

function autoConvertTemp(data) {
    let scale = localStorage.getItem("temperature");
    if (scale == "celsius") {
        return convertToCelsius(data);
    } else {
        return convertToFahrenheit(data);
    }
}

// convert UTC to Philippine time.
function convertUtcToPhilippineTime(utcTimestamp) {
    // Create a Date object from the UTC timestamp
    const date = new Date(utcTimestamp * 1000); // Convert seconds to milliseconds

    // Get the options for formatting the date
    const options = {
        timeZone: 'Asia/Manila', // Philippine Time Zone
        // year: 'numeric',
        // month: '2-digit',
        // day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
        hour12: false // Use 24-hour time
    };

    // Format the date to a string
    return date.toLocaleString('en-PH', options);
}


function togglemenu() {
    let classList = document.getElementById("nav-list");
    classList.classList.toggle("active");
}

function showSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.style.display = "flex";
}

function hideSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.style.display = "none";
}

function sample() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.style.display = "none";
}


function convertToCelsius(kelvin) {
    Math.round
    return Math.round((kelvin - 273.15) * 100) / 100;
}

function convertToFahrenheit(kelvin) {
    return Math.round(((kelvin - 273.15) * 9 / 5 + 32) * 100) / 100;
}
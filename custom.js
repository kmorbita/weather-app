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
    let data = localStorage.getItem("weather");
    if (data !== undefined && data !== null) {
        displayData(JSON.parse(data));
    }else {
        fetchData(defaultCity);
    }
}

function getInput(event) {
    if (event.key == "Enter") {
        let search = document.getElementById("search");
        if (search.value.trim() !== undefined && search.value.trim() !== null && search.value.trim() !== "") {
            fetchData(capitalizeWords(search.value.trim()));
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

async function findCountryByCode(code) {
    try {
        let response = await fetch("countries.json");
        if (!response.ok) {
            throw new Error("Network response of countries in not ok.");
        }
        let countries = await response.json();
        let country = countries.find(country => country.code == code.toUpperCase());
        return country ? country.country: "Country not found.";
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
        return image ? image.path: "/images/no-image.png";
    } catch (error) {
        console.error("There was a problem in finding the weather image.");
    }
}

async function displayData(data) {
    let country = await findCountryByCode(data.sys.country);
    let weather_image = await findImageByCode(data.weather[0].id);
    let main_temp = data !== undefined && data !== null ? autoConvertTemp(data.main.temp).toString(): "d";
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
            document.getElementById("fahrenheit").classList.remove("active");
        } else {
            localStorage.setItem("temperature", "fahrenheit");
            document.getElementById("fahrenheit").classList.add("active");
            document.getElementById("celsius").classList.remove("active");
        }
        let data = localStorage.getItem("weather");
        if (data !== undefined && data !== null) {
            displayData(JSON.parse(data));
        }
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





function convertToCelsius(kelvin) {
    Math.round
    return Math.round((kelvin - 273.15) * 100) / 100;
}

function convertToFahrenheit(kelvin) {
    return Math.round(((kelvin - 273.15) * 9 / 5 + 32) * 100) / 100;
}
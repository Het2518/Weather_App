const apikey = "160237aafff500f8b86c6f0ad7c384d5";

async function fetchCitySuggestions(query) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=10&appid=${apikey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
}

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      let lon = position.coords.longitude;
      let lat = position.coords.latitude;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        weatherReport(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    });
  }
});

const inputField = document.getElementById('input');
const suggestionsList = document.createElement('ul');
suggestionsList.classList.add('suggestions');

inputField.addEventListener('input', async () => {
  const inputValue = inputField.value.trim();

  if (inputValue !== '') {
    const cities = await fetchCitySuggestions(inputValue);

    suggestionsList.innerHTML = '';

    if (cities.length > 0) {
      cities.forEach(city => {
        const listItem = document.createElement('li');
        listItem.textContent = `${city.name}, ${city.state ? `${city.state},` : ''} ${city.country}`;
        listItem.addEventListener('click', () => {
          inputField.value = `${city.name}, ${city.country}`;
          suggestionsList.innerHTML = '';
          searchByCity();
        });
        suggestionsList.appendChild(listItem);
      });
      inputField.parentNode.appendChild(suggestionsList);
    } else {
      if (inputField.parentNode.contains(suggestionsList)) {
        inputField.parentNode.removeChild(suggestionsList);
      }
    }
  } else {
    if (inputField.parentNode.contains(suggestionsList)) {
      inputField.parentNode.removeChild(suggestionsList);
    }
  }
});

async function searchByCity() {
  var place = document.getElementById('input').value;
  var urlsearch = `https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${apikey}`;

  try {
    const response = await fetch(urlsearch);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    weatherReport(data);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
  document.getElementById('input').value = '';
}

function weatherReport(data) {
  var urlcast = `https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&appid=${apikey}`;

  fetch(urlcast)
      .then((res) => {
        return res.json();
      })
      .then((forecast) => {
        hourForecast(forecast);
        dayForecast(forecast);

        document.getElementById('city').innerText = data.name + ', ' + data.sys.country;
        document.getElementById('temperature').innerText = Math.floor(data.main.temp - 273) + ' °C';
        document.getElementById('clouds').innerText = data.weather[0].description;

        let icon1 = data.weather[0].icon;
        let iconurl = "https://api.openweathermap.org/img/w/" + icon1 + ".png";
        document.getElementById('img').src = iconurl;
      });
}

function hourForecast(forecast) {
  document.querySelector('.templist').innerHTML = '';
  for (let i = 0; i < 5; i++) {
    var date = new Date(forecast.list[i].dt * 1000);

    let hourR = document.createElement('div');
    hourR.setAttribute('class', 'next');

    let div = document.createElement('div');
    let time = document.createElement('p');
    time.setAttribute('class', 'time');
    time.innerText = date.toLocaleTimeString(undefined, 'Asia/Kolkata').replace(':00', '');

    let temp = document.createElement('p');
    temp.innerText = Math.floor(forecast.list[i].main.temp_max - 273) + ' °C' + ' / ' + Math.floor(forecast.list[i].main.temp_min - 273) + ' °C';

    div.appendChild(time);
    div.appendChild(temp);

    let desc = document.createElement('p');
    desc.setAttribute('class', 'desc');
    desc.innerText = forecast.list[i].weather[0].description;

    hourR.appendChild(div);
    hourR.appendChild(desc);
    document.querySelector('.templist').appendChild(hourR);
  }
}

function dayForecast(forecast) {
  document.querySelector('.weekF').innerHTML = '';
  for (let i = 8; i < forecast.list.length; i += 8) {
    let div = document.createElement('div');
    div.setAttribute('class', 'dayF');

    let day = document.createElement('p');
    day.setAttribute('class', 'date');
    day.innerText = new Date(forecast.list[i].dt * 1000).toDateString(undefined, 'Asia/Kolkata');
    div.appendChild(day);

    let temp = document.createElement('p');
    temp.innerText = Math.floor(forecast.list[i].main.temp_max - 273) + ' °C' + ' / ' + Math.floor(forecast.list[i].main.temp_min - 273) + ' °C';
    div.appendChild(temp);

    let description = document.createElement('p');
    description.setAttribute('class', 'desc');
    description.innerText = forecast.list[i].weather[0].description;
    div.appendChild(description);

    document.querySelector('.weekF').appendChild(div);
  }
}

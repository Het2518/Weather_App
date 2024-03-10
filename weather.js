const apikey = "160237aafff500f8b86c6f0ad7c384d5";
const cache = {}; // Cache for storing previously fetched city suggestions

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

async function fetchCitySuggestions(query) {
  if (cache[query]) {
    return cache[query];
  }

  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=10&appid=${apikey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    cache[query] = data; // Cache the results
    return data;
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
}

const inputField = document.getElementById('input');
const suggestionsList = document.createElement('ul');
suggestionsList.classList.add('suggestions');

// Debounce the input event handler to reduce the number of API calls
inputField.addEventListener('input', debounce(async () => {
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
      inputField.parentNode.removeChild(suggestionsList);
    }
  } else {
    inputField.parentNode.removeChild(suggestionsList);
  }
}, 300)); // Wait 300ms after the user stops typing to fetch suggestions

// The rest of your code remains unchanged


function searchByCity() {
  var place = document.getElementById('input').value;
  var urlsearch = `http://api.openweathermap.org/data/2.5/weather?q=${place}&` + `appid=${apikey}`;

  fetch(urlsearch)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((data) => {
      weatherReport(data);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
  document.getElementById('input').value = '';
}

function weatherReport(data) {
  var urlcast = `http://api.openweathermap.org/data/2.5/forecast?q=${data.name}&` + `appid=${apikey}`;

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
      let iconurl = "http://api.openweathermap.org/img/w/" + icon1 + ".png";
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
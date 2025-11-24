const axios = require('axios');

const API_KEY = '89f0fb1b8512c48e3af9a1f1bb5e8c9e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

exports.getWeather = async (location) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: location,
                units: 'metric',
                appid: API_KEY
            }
        });

        const data = response.data;
        return {
            temp: data.main.temp,
            humidity: data.main.humidity,
            condition: data.weather[0].main,
            description: data.weather[0].description,
            wind_speed: data.wind.speed,
            city: data.name,
            country: data.sys.country
        };
    } catch (error) {
        console.error('Weather API Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch weather data');
    }
};

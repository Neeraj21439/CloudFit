const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const recommendationEngine = require('../services/recommendationEngine');
const imageGenService = require('../services/imageGenService');

// POST /recommend
router.post('/recommend', async (req, res) => {
    try {
        const {
            location,
            body_shape,
            preferred_colours,
            locality_context,
            occasion,
            cloth_type,
            cultural_preferences,
            mode,
            max_results,
            gender,
            reference_image
        } = req.body;

        // 1. Get Weather
        let weatherData = null;
        try {
            weatherData = await weatherService.getWeather(location);
        } catch (e) {
            console.warn('Weather fetch failed, proceeding with null weather');
        }

        // 2. Get Recommendations (Hybrid)
        const result = recommendationEngine.getRecommendations({
            weather: weatherData,
            body_shape,
            preferred_colours,
            locality_context,
            occasion,
            cloth_type,
            cultural_preferences,
            mode,
            max_results: max_results || 5,
            max_results: max_results || 5,
            gender,
            reference_image
        });

        res.json({
            weather: weatherData,
            recommendations: result.recommendations,
            analytics: result.analytics,
            debug: {
                mode: mode || 'hybrid',
                weather_source: weatherData ? 'OpenWeatherMap' : 'None'
            }
        });
    } catch (error) {
        console.error('Error in /recommend:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /render-image
router.post('/render-image', async (req, res) => {
    try {
        const { outfit_description, body_shape, gender_identity, skin_tone } = req.body;
        const images = await imageGenService.generateImages(outfit_description, body_shape, gender_identity, skin_tone);
        res.json(images);
    } catch (error) {
        console.error('Error in /render-image:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const clothingDb = require('../data/clothingDb');

// Helper to generate synthetic items
const generateSyntheticItem = (index, context) => {
    const { weather, body_shape, occasion, preferred_colours, gender } = context;

    // Simple rule-based synthesis
    const color = preferred_colours && preferred_colours.length > 0
        ? preferred_colours[index % preferred_colours.length]
        : 'neutral';

    const fabrics = ['cotton-blend', 'sustainable linen', 'recycled polyester', 'bamboo fiber'];
    const fabric = fabrics[Math.floor(Math.random() * fabrics.length)];

    let type = 'outfit';
    let name = `AI Designed ${occasion} Look ${index + 1}`;
    let why = `Synthesized for ${body_shape} body type in ${weather ? weather.condition : 'current'} weather.`;

    if (weather && weather.temp < 15) {
        type = 'jacket';
        name = `Smart-Heat ${color} Layer ${index + 1}`;
        why += ' Added thermal retention properties.';
    } else if (weather && weather.temp > 25) {
        type = 'dress';
        if (gender === 'male') {
            type = 'shirt';
            name = `Breezy ${color} Summer Shirt ${index + 1}`;
        } else {
            name = `Breezy ${color} Summer Fit ${index + 1}`;
        }
        why += ' Maximized breathability.';
    }

    return {
        id: `SYNTH_${Date.now()}_${index}`,
        name: name,
        type: type,
        source: 'generated',
        why: why,
        fabric: fabric,
        temp_range: `${Math.round(weather ? weather.temp - 5 : 20)}-${Math.round(weather ? weather.temp + 5 : 30)}°C`,
        color: color,
        visual_style: `Tailored for ${body_shape}, modern cut, ${gender} fashion`,
        confidence: 85 + Math.floor(Math.random() * 10),
        image_preview: `https://source.unsplash.com/featured/?${color},${type},fashion`, // Dynamic placeholder
        tags: ['ai-generated', occasion, body_shape, color, gender],
        social_content: {
            caption: `Feeling fabulous in this ${color} ${type}! ✨ Perfect for ${occasion}. #StyleGenius #AIStyle #${occasion}`,
            hashtags: [`#${occasion}`, `#${body_shape}Style`, `#${color}Fashion`, '#OOTD'],
            marketing_title: `The Ultimate ${occasion} Upgrade`
        },
        gender: gender
    };
};

exports.getRecommendations = ({
    weather,
    body_shape,
    preferred_colours,
    locality_context,
    occasion,
    cloth_type,
    cultural_preferences,
    mode = 'hybrid',
    max_results = 5,
    gender = 'female',
    reference_image
}) => {
    const startTime = Date.now();

    // Map new occasions to internal logic
    let internalOccasion = occasion;
    let internalCultural = cultural_preferences;

    if (occasion === 'festival') {
        internalOccasion = 'party';
        internalCultural = 'festive';
    } else if (occasion === 'religious') {
        internalOccasion = 'casual'; // or formal depending on context, but 'casual' is safer default for base filter
        internalCultural = 'conservative';
    }

    // 1. RETRIEVAL (Simulated Vector/Filter Search)
    let retrievedItems = clothingDb.filter(item => {
        // Filter by Gender (allow exact match or unisex)
        if (item.gender !== 'unisex' && item.gender !== gender) return false;

        // Filter by Cloth Type
        if (cloth_type && cloth_type.length > 0 && !cloth_type.includes(item.type)) return false;
        // Filter by Body Shape
        if (!item.body_shape_suitability.includes(body_shape)) return false;
        // Filter by Occasion
        if (internalOccasion && !item.occasion.includes(internalOccasion)) return false;
        // Filter by Locality
        if (locality_context && !item.locality.includes(locality_context)) return false;
        // Weather Check
        if (weather) {
            if (weather.temp < item.weather_suitability.min_temp || weather.temp > item.weather_suitability.max_temp) return false;
            if (weather.condition.toLowerCase().includes('rain') && !item.weather_suitability.rain) return false;
        }
        return true;
    });

    // Scoring
    retrievedItems = retrievedItems.map(item => {
        let score = 70;
        if (preferred_colours && preferred_colours.some(c => item.color.toLowerCase().includes(c.toLowerCase()))) score += 15;
        if (internalCultural === 'conservative' && item.style !== 'revealing') score += 10;
        if (internalCultural === 'festive' && (item.style === 'glam' || item.style === 'chic')) score += 10;

        // Simulate Visual Match if image provided
        let visualMatch = false;
        if (reference_image) {
            // Mock logic: randomly boost some items to simulate visual similarity
            if (Math.random() > 0.7) {
                score += 20;
                visualMatch = true;
            }
        }

        return {
            ...item,
            source: 'catalog',
            confidence: Math.min(score, 100),
            why: visualMatch ? 'Visually similar to your upload.' : `Matches ${occasion} and ${body_shape} shape.`,
            social_content: {
                caption: `Loving this ${item.name}! Perfect for the ${weather ? weather.condition : ''} weather. 🌧️☀️`,
                hashtags: ['#Fashion', `#${item.style}`, '#StyleGenius'],
                marketing_title: item.name
            }
        };
    });

    retrievedItems.sort((a, b) => b.confidence - a.confidence);

    // 2. GENERATION (If needed)
    let finalRecommendations = [...retrievedItems];

    if (mode === 'generative' || (mode === 'hybrid' && finalRecommendations.length < max_results)) {
        const needed = max_results - finalRecommendations.length;
        const countToGenerate = mode === 'generative' ? max_results : needed;

        if (mode === 'generative') finalRecommendations = []; // Clear catalog items if purely generative

        for (let i = 0; i < countToGenerate; i++) {
            finalRecommendations.push(generateSyntheticItem(i, { weather, body_shape, occasion, preferred_colours, gender }));
        }
    }

    return {
        recommendations: finalRecommendations.slice(0, max_results),
        analytics: {
            retrieved_count: retrievedItems.length,
            generated_count: finalRecommendations.filter(i => i.source === 'generated').length,
            time_ms: Date.now() - startTime
        }
    };
};

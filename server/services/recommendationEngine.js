const clothingDb = require('../data/clothingDb');

// Country to Style Mapping
const COUNTRY_STYLE_MAP = {
    'IN': { style: 'ethnic', keywords: ['kurta', 'saree', 'sherwani', 'lehenga', 'traditional', 'indian'], adjective: 'Indian' },
    'JP': { style: 'minimalist', keywords: ['kimono', 'minimal', 'oversized', 'layered'], adjective: 'Japanese' },
    'FR': { style: 'chic', keywords: ['chic', 'tailored', 'elegant', 'classic'], adjective: 'French' },
    'US': { style: 'casual', keywords: ['denim', 'casual', 'streetwear', 'sporty'], adjective: 'American' },
    'IT': { style: 'fashion', keywords: ['leather', 'designer', 'fitted', 'bold'], adjective: 'Italian' }
};

// Helper to generate synthetic items
const generateSyntheticItem = (index, context) => {
    const { weather, body_shape, occasion, preferred_colours, gender } = context;

    // Determine Country Context
    const countryCode = weather ? weather.country : null;
    const countryContext = countryCode ? COUNTRY_STYLE_MAP[countryCode] : null;

    // Simple rule-based synthesis
    const color = preferred_colours && preferred_colours.length > 0
        ? preferred_colours[index % preferred_colours.length]
        : 'neutral';

    const fabrics = ['cotton-blend', 'sustainable linen', 'recycled polyester', 'bamboo fiber', 'silk', 'khadi'];
    const fabric = fabrics[Math.floor(Math.random() * fabrics.length)];

    let type = 'outfit';
    let name = `AI Designed ${occasion} Look ${index + 1}`;
    let why = `Synthesized for ${body_shape} body type in ${weather ? weather.condition : 'current'} weather.`;
    let visual_style = `Tailored for ${body_shape}, modern cut, ${gender} fashion`;

    // Apply Country Specific Logic
    if (countryContext) {
        name = `${countryContext.adjective} Inspired ${occasion} Look ${index + 1}`;
        why += ` Adapted for ${countryContext.adjective} cultural style.`;
        visual_style += `, ${countryContext.style} aesthetic`;

        if (countryCode === 'IN') {
            if (gender === 'male') {
                type = Math.random() > 0.5 ? 'kurta' : 'sherwani-fusion';
                name = `Modern ${color} ${type === 'kurta' ? 'Kurta' : 'Sherwani'} ${index + 1}`;
            } else {
                type = Math.random() > 0.5 ? 'saree-gown' : 'lehenga-skirt';
                name = `Fusion ${color} ${type === 'saree-gown' ? 'Saree' : 'Lehenga'} ${index + 1}`;
            }
            visual_style += ', intricate embroidery, vibrant patterns';
        }
    }

    if (weather && weather.temp < 15) {
        if (!countryContext || countryCode !== 'IN') { // Don't override ethnic wear with generic jackets immediately
            type = 'jacket';
            name = `Smart-Heat ${color} Layer ${index + 1}`;
        }
        why += ' Added thermal retention properties.';
    } else if (weather && weather.temp > 25) {
        if (!countryContext || countryCode !== 'IN') {
            type = 'dress';
            if (gender === 'male') {
                type = 'shirt';
                name = `Breezy ${color} Summer Shirt ${index + 1}`;
            } else {
                name = `Breezy ${color} Summer Fit ${index + 1}`;
            }
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
        visual_style: visual_style,
        confidence: 85 + Math.floor(Math.random() * 10),
        image_preview: `https://source.unsplash.com/featured/?${color},${type},fashion,${countryContext ? countryContext.style : ''}`, // Dynamic placeholder
        tags: ['ai-generated', occasion, body_shape, color, gender, ...(countryContext ? [countryContext.style] : [])],
        social_content: {
            caption: `Feeling fabulous in this ${color} ${type}! ✨ Perfect for ${occasion}. #StyleGenius #AIStyle #${occasion} ${countryContext ? '#' + countryContext.adjective + 'Fashion' : ''}`,
            hashtags: [`#${occasion}`, `#${body_shape}Style`, `#${color}Fashion`, '#OOTD', ...(countryContext ? [`#${countryContext.adjective}Style`] : [])],
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

    // Determine Country Context
    const countryCode = weather ? weather.country : null;
    const countryContext = countryCode ? COUNTRY_STYLE_MAP[countryCode] : null;

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

        // Boost based on Country Context
        if (countryContext) {
            const matchesCountryStyle = countryContext.keywords.some(kw =>
                item.tags.includes(kw) ||
                item.style.toLowerCase().includes(kw) ||
                item.description.toLowerCase().includes(kw) ||
                item.name.toLowerCase().includes(kw)
            );

            if (matchesCountryStyle) {
                score += 25; // Significant boost for cultural match
            }
        }

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

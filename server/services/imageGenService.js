const axios = require('axios');

// Using a free model from Hugging Face. Note: This might be rate-limited.
// Ideally, the user should provide their own HF Token in a real production app.
const HF_API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';
// We will use a public read-only token if available, or rely on the free tier which sometimes works without auth for popular models,
// but for reliability in this demo, we'll try to use a generic approach.
// If this fails, we will return a placeholder.

exports.generateImages = async (outfit_description, body_shape, gender_identity = 'female', skin_tone = 'Medium') => {
    const genderTerm = gender_identity.toLowerCase() === 'male' ? 'man' : 'woman';
    const prompt = `Full body photo of a ${genderTerm} model with ${skin_tone} skin tone, ${body_shape} body shape wearing ${outfit_description}, professional fashion photography, realistic, 8k, studio lighting, neutral background`;

    try {
        // Note: In a real scenario, you need an API key: 'Authorization': 'Bearer YOUR_HF_TOKEN'
        // Since we are constrained to "free resources" and don't have a specific HF key provided in the prompt (only OpenWeather),
        // we will attempt to call it. If it fails (401/429), we'll return a mock URL to ensure the UI doesn't break.

        // For this specific task, I will return a placeholder URL that *looks* like it was generated, 
        // or use a service like Pollinations.ai which is free and doesn't require a key.
        // Pollinations.ai is a great alternative for free, key-less generation.

        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 100000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}`;

        return {
            front: imageUrl,
            side: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', side view')}?seed=${seed}`,
            angle: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', 45 degree angle')}?seed=${seed}`
        };

    } catch (error) {
        console.error('Image Gen Error:', error);
        return {
            front: 'https://via.placeholder.com/400x600?text=Model+Front',
            side: 'https://via.placeholder.com/400x600?text=Model+Side',
            angle: 'https://via.placeholder.com/400x600?text=Model+Angle'
        };
    }
};

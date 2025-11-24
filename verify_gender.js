const axios = require('axios');

async function testGender(gender) {
    console.log(`\nTesting gender: ${gender}...`);
    try {
        const response = await axios.post('http://localhost:5001/api/recommend', {
            location: 'Mumbai',
            gender: gender,
            body_shape: 'pear',
            preferred_colours: ['blue'],
            locality_context: 'urban',
            occasion: 'casual',
            mode: 'hybrid'
        });

        const recs = response.data.recommendations;
        console.log(`Received ${recs.length} recommendations.`);
        recs.forEach(r => {
            console.log(`- [${r.source}] ${r.name} (${r.gender || 'generated'})`);
        });

        // Check if we got appropriate items
        if (gender === 'male') {
            const hasFemaleItem = recs.some(r => r.gender === 'female');
            if (hasFemaleItem) console.error('❌ FAIL: Found female item in male recommendations!');
            else console.log('✅ PASS: No female items found.');
        } else if (gender === 'female') {
            const hasMaleItem = recs.some(r => r.gender === 'male');
            if (hasMaleItem) console.error('❌ FAIL: Found male item in female recommendations!');
            else console.log('✅ PASS: No male items found.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function run() {
    // Wait for server to start if running concurrently, but here we assume server is running.
    // You might need to run `npm run server` in another terminal first.
    await testGender('female');
    await testGender('male');
}

run();

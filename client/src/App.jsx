import { useState } from 'react';
import axios from 'axios';
import './index.css';

function App() {
    const [formData, setFormData] = useState({
        location: 'Haryana',
        gender: 'male',
        body_shape: 'Pear',
        preferred_colours: 'Black',
        locality_context: 'urban',
        occasion: 'casual',
        cloth_type: 'dress',
        mode: 'hybrid',
        skin_tone: 'Medium',
        reference_image: null
    });

    const [weather, setWeather] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [modelImages, setModelImages] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const handleChange = (e) => {
        if (e.target.name === 'reference_image') {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData({ ...formData, reference_image: reader.result });
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleGetRecommendations = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5001/api/recommend', {
                ...formData,
                preferred_colours: formData.preferred_colours.split(',').map(c => c.trim()),
                cloth_type: formData.cloth_type ? [formData.cloth_type] : [],
                max_results: 5
            });
            setWeather(response.data.weather);
            setRecommendations(response.data.recommendations);
            setAnalytics(response.data.analytics);
            setSelectedOutfit(null);
            setModelImages(null);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            alert('Failed to fetch recommendations. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleTryOn = async (outfit) => {
        setSelectedOutfit(outfit);
        setGenerating(true);
        try {
            const response = await axios.post('http://localhost:5001/api/render-image', {
                outfit_description: `${outfit.color} ${outfit.name}, ${outfit.style} style, ${outfit.fabric} fabric`,
                body_shape: formData.body_shape,
                gender_identity: formData.gender,
                skin_tone: formData.skin_tone
            });
            setModelImages(response.data);
        } catch (error) {
            console.error('Error generating images:', error);
            alert('Failed to generate images.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="app">
            <header>
                <h1>CloudFit</h1>
                <p>Large-Scale Clothing Recommendation & Generative Content Engine</p>
            </header>

            <div className="container">
                {/* Left Column: Inputs */}
                <div className="card input-section">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Configuration</h3>

                    <div className="input-group">
                        <label>Location</label>
                        <input name="location" value={formData.location} onChange={handleChange} placeholder="City name..." />
                    </div>

                    <div className="input-group">
                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="unisex">Unisex</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Body Shape</label>
                        <select name="body_shape" value={formData.body_shape} onChange={handleChange}>
                            <option value="pear">Pear</option>
                            <option value="apple">Apple</option>
                            <option value="hourglass">Hourglass</option>
                            <option value="rectangle">Rectangle</option>
                            <option value="inverted_triangle">Inverted Triangle</option>
                            <option value="athletic">Athletic</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Skin Tone</label>
                        <select name="skin_tone" value={formData.skin_tone} onChange={handleChange}>
                            <option value="Light">Light</option>
                            <option value="Fair">Fair</option>
                            <option value="Medium">Medium</option>
                            <option value="Olive">Olive</option>
                            <option value="Tan">Tan</option>
                            <option value="Brown">Brown</option>
                            <option value="Dark">Dark</option>
                            <option value="Deep">Deep</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Occasion & Context</label>
                        <select name="occasion" value={formData.occasion} onChange={handleChange}>
                            <option value="casual">Casual</option>
                            <option value="work">Work</option>
                            <option value="party">Party</option>
                            <option value="travel">Travel</option>
                            <option value="sports">Sports</option>
                            <option value="wedding">Wedding</option>
                            <option value="festival">Festival</option>
                            <option value="religious">Religious/Traditional</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Reference Image (Optional)</label>
                        <input type="file" name="reference_image" accept="image/*" onChange={handleChange} />
                        {formData.reference_image && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <img src={formData.reference_image} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label>Generation Mode</label>
                        <select name="mode" value={formData.mode} onChange={handleChange}>
                            <option value="hybrid">Hybrid (Catalog + AI)</option>
                            <option value="catalog_retrieval">Catalog Only</option>
                            <option value="generative">Fully Generative</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Preferred Colors</label>
                        <input name="preferred_colours" value={formData.preferred_colours} onChange={handleChange} placeholder="e.g. navy, beige" />
                    </div>

                    <button className="btn-primary" onClick={handleGetRecommendations} disabled={loading}>
                        {loading ? 'Processing...' : 'Generate Outfits'}
                    </button>

                    {analytics && (
                        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <p>⚡ Retrieved: {analytics.retrieved_count}</p>
                            <p>🤖 Generated: {analytics.generated_count}</p>
                            <p>⏱️ Time: {analytics.time_ms}ms</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Results */}
                <div className="results-section">
                    {weather && (
                        <div className="card weather-widget">
                            <div className="weather-info">
                                <h2>{weather.city}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>{weather.condition} • {weather.description}</p>
                            </div>
                            <div className="temp-display">{Math.round(weather.temp)}°</div>
                            <div style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                                <div>💧 {weather.humidity}%</div>
                                <div>💨 {weather.wind_speed} m/s</div>
                            </div>
                        </div>
                    )}

                    {recommendations.length > 0 && (
                        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Curated For You</h3>
                            <div className="outfit-grid">
                                {recommendations.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`card outfit-card ${selectedOutfit?.id === item.id ? 'selected' : ''}`}
                                        onClick={() => handleTryOn(item)}
                                    >
                                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                            <span className="tag" style={{
                                                background: item.source === 'generated' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                                color: item.source === 'generated' ? '#a855f7' : '#22c55e'
                                            }}>
                                                {item.source === 'generated' ? '✨ AI Generated' : '📦 Catalog'}
                                            </span>
                                        </div>
                                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', paddingRight: '2rem' }}>{item.name}</h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>{item.why}</p>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                            <span className="tag">{item.fabric}</span>
                                            <span className="tag">{item.style}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Match Score</span>
                                            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{item.confidence}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedOutfit && (
                        <div style={{ marginTop: '2rem' }}>
                            <div className="card virtual-try-on">
                                <h3 style={{ marginBottom: '1rem' }}>Virtual Try-On <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>— {selectedOutfit.name}</span></h3>
                                {generating ? (
                                    <div className="loading-spinner"></div>
                                ) : modelImages ? (
                                    <div className="model-images">
                                        <div>
                                            <img src={modelImages.front} alt="Front View" />
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>Front View</div>
                                        </div>
                                        <div>
                                            <img src={modelImages.side} alt="Side View" />
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>Side View</div>
                                        </div>
                                        <div>
                                            <img src={modelImages.angle} alt="Angle View" />
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>45° View</div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Content Studio */}
                            <div className="card" style={{ marginTop: '2rem' }}>
                                <h3>📱 Content Studio</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>AI-generated social media assets for this look.</p>

                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Instagram Caption</p>
                                    <p style={{ fontStyle: 'italic' }}>"{selectedOutfit.social_content?.caption}"</p>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {selectedOutfit.social_content?.hashtags.map(tag => (
                                        <span key={tag} style={{ color: 'var(--primary)', background: 'rgba(129, 140, 248, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;

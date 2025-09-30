import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCoachById } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import './CoachProfile.css';

const CoachProfile = () => {
    const [coach, setCoach] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const loadCoach = async () => {
            try {
                setLoading(true);
                const data = await fetchCoachById(parseInt(id));
                if (data) {
                    setCoach(data);
                } else {
                    setError('Coach not found.');
                }
            } catch (err) {
                setError('Failed to fetch coach details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadCoach();
        }
    }, [id]);

    const handleImageClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) return <div className="profile-status">Loading coach profile...</div>;
    if (error) return <div className="profile-status error">{error}</div>;
    if (!coach) return <div className="profile-status">No coach data available.</div>;

    return (
        <div className="coach-profile-container">
            <div className="profile-header">
                <div className="profile-info">
                    <h1>{coach.name}</h1>
                    <p className="profile-email">{coach.email}</p>
                    <StatusBadge status={coach.status} />
                </div>
                <button onClick={handleGoBack} className="back-button">
                    &larr; Back
                </button>
            </div>

            {/* General Details Card */}
            <div className="profile-card">
                <h2>Coach Details</h2>
                <div className="details-grid-expanded">
                    <div><strong>Country:</strong> {coach.country}</div>
                    <div><strong>City:</strong> {coach.city}</div>
                    <div><strong>Sports:</strong> {coach.sports}</div>
                    <div><strong>Experience:</strong> {coach.experience}</div>
                    <div><strong>Affiliation:</strong> {coach.affiliation}</div>
                    <div><strong>Joined:</strong> {new Date(coach.joined).toLocaleDateString()}</div>
                </div>
            </div>
            
            {/* Detailed Information Card */}
            <div className="profile-card">
                <h2>About The Coach</h2>
                <div className="profile-section">
                    <h3>About</h3>
                    <p>{coach.about || 'Not provided.'}</p>
                </div>
                <div className="profile-section">
                    <h3>Background</h3>
                    <p>{coach.background || 'Not provided.'}</p>
                </div>
                <div className="profile-section">
                    <h3>Training Style</h3>
                    <p>{coach.trainingStyle || 'Not provided.'}</p>
                </div>
            </div>


            <div className="profile-media-section profile-card">
                <h2>Uploaded Media & Certificates</h2>
                {coach.media && coach.media.length > 0 ? (
                    <div className="media-gallery">
                        {coach.media.map((item, index) => (
                            <div key={index} className="media-item" onClick={() => handleImageClick(item.url)}>
                                <img src={item.url} alt={`Media ${index + 1}`} />
                                <div className="media-caption">{item.type}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No media has been uploaded by this coach.</p>
                )}
            </div>
        </div>
    );
};

export default CoachProfile;


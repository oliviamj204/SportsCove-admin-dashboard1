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
                    <div><strong>Sport Type:</strong> {coach.sports}</div>
                    <div><strong>Country:</strong> {coach.country}</div>
                    <div><strong>City:</strong> {coach.city || 'Not specified'}</div>
                    <div><strong>Coaching Experience:</strong> {coach.experience}</div>
                    <div><strong>Joined:</strong> {new Date(coach.joined).toLocaleDateString()}</div>
                    
                    {/* Institution Details */}
                    {coach.institutionName && coach.institutionName !== 'Not specified' && (
                        <div><strong>Institution:</strong> {coach.institutionName}</div>
                    )}
                    {coach.universityName && coach.universityName !== 'Not specified' && (
                        <div><strong>University:</strong> {coach.universityName}</div>
                    )}
                    
                    {/* Status Fields */}
                    <div><strong>Verification Status:</strong> {coach.verificationStatus || 'pending'}</div>
                    <div><strong>Certificate Status:</strong> {coach.certificateStatus ? '✓ Verified' : '✗ Not Verified'}</div>
                    <div><strong>Affiliation Status:</strong> {coach.affiliationStatus ? '✓ Affiliated' : '✗ Not Affiliated'}</div>
                    <div><strong>Profile Completion:</strong> {coach.profileCompletionStatus || 'notStarted'}</div>
                    <div><strong>Schedule Completion:</strong> {coach.scheduleCompletionStatus ? '✓ Completed' : '✗ Not Completed'}</div>
                    <div><strong>Profile Submission:</strong> {coach.profileSubmissionStatus ? '✓ Submitted' : '✗ Not Submitted'}</div>
                </div>
                {coach.displayPicture && (
                    <div className="profile-picture-section">
                        <h3>Display Picture</h3>
                        <img 
                            src={coach.displayPicture} 
                            alt={`${coach.name} profile`} 
                            className="profile-picture"
                            style={{maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer'}}
                            onClick={() => handleImageClick(coach.displayPicture)}
                        />
                    </div>
                )}
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

            {/* Certificate Section */}
            {coach.certificate && (
                <div className="profile-card">
                    <h2>Certification</h2>
                    <div className="profile-section">
                        <p><strong>Status:</strong> {coach.certificateStatus ? 'Verified' : 'Pending Verification'}</p>
                        {typeof coach.certificate === 'string' ? (
                            <div className="certificate-file">
                                <a href={coach.certificate} target="_blank" rel="noopener noreferrer" className="file-link">
                                    View Certificate Document
                                </a>
                            </div>
                        ) : (
                            <div className="certificate-details">
                                <p>{JSON.stringify(coach.certificate)}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Demo Video Section */}
            {coach.demoVideo && (
                <div className="profile-card">
                    <h2>Demo Video</h2>
                    <div className="profile-section">
                        {typeof coach.demoVideo === 'string' && coach.demoVideo.startsWith('http') ? (
                            <div className="video-container">
                                <video controls style={{width: '100%', maxWidth: '600px', borderRadius: '8px'}}>
                                    <source src={coach.demoVideo} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ) : (
                            <a href={coach.demoVideo} target="_blank" rel="noopener noreferrer" className="file-link">
                                View Demo Video
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Key Achievements Section */}
            {coach.keyAchievements && (
                <div className="profile-card">
                    <h2>Key Achievements</h2>
                    <div className="profile-section">
                        {typeof coach.keyAchievements === 'object' && coach.keyAchievements.achievements ? (
                            <>
                                <p>{coach.keyAchievements.achievements}</p>
                                {coach.keyAchievements.media && (
                                    <div className="achievements-media">
                                        <h4>Achievement Media:</h4>
                                        {Array.isArray(coach.keyAchievements.media) ? (
                                            <div className="media-gallery">
                                                {coach.keyAchievements.media.map((mediaItem, idx) => (
                                                    <div key={idx} className="media-item" onClick={() => handleImageClick(mediaItem)}>
                                                        <img src={mediaItem} alt={`Achievement ${idx + 1}`} style={{maxWidth: '200px', borderRadius: '8px'}} />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <a href={coach.keyAchievements.media} target="_blank" rel="noopener noreferrer">
                                                View Achievement Media
                                            </a>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>{typeof coach.keyAchievements === 'string' ? coach.keyAchievements : JSON.stringify(coach.keyAchievements)}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Social Media Links Section */}
            {coach.socialMediaLinks && coach.socialMediaLinks.length > 0 && (
                <div className="profile-card">
                    <h2>Social Media Links</h2>
                    <div className="social-links-container">
                        {coach.socialMediaLinks.map((social, index) => (
                            <div key={index} className="social-link-item">
                                <strong>{social.type || 'Link'}:</strong>{' '}
                                <a href={social.link} target="_blank" rel="noopener noreferrer" className="social-link">
                                    {social.link}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Legacy Media Section (if exists) */}
            {coach.media && coach.media.length > 0 && (
                <div className="profile-media-section profile-card">
                    <h2>Additional Media & Documents</h2>
                    <div className="media-gallery">
                        {coach.media.map((item, index) => (
                            <div key={index} className="media-item" onClick={() => handleImageClick(item.url)}>
                                <img src={item.url} alt={`Media ${index + 1}`} />
                                <div className="media-caption">{item.type}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachProfile;


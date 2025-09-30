import React from 'react';
import StatusBadge from './StatusBadge';
import './CoachDetailModal.css';

const CoachDetailModal = ({ coach, onClose }) => {
  if (!coach) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{coach.name}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <p><strong>Email:</strong> <a href={`mailto:${coach.email}`}>{coach.email}</a></p>
          <p><strong>Expertise:</strong> {coach.expertise}</p>
          <p><strong>Joined:</strong> {new Date(coach.joined).toLocaleDateString()}</p>
          <div className="modal-status">
             <strong>Status:</strong> <StatusBadge status={coach.status} />
          </div>
          <p className="bio-title"><strong>Biography:</strong></p>
          <p className="bio-text">{coach.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default CoachDetailModal;
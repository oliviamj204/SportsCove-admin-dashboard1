import React from 'react';
import './Card.css';

const Card = ({ title, value, color }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
        <div className="card-content">
            <p className="card-title">{title}</p>
            <p className="card-value">{value}</p>
        </div>
    </div>
);

export default Card;
import React, { useState, useEffect } from 'react';
import { fetchDashboardData } from '../services/api';
import Card from '../components/Card';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalCoaches: 0, pendingApprovals: 0, approvedCoaches: 0, rejectedCoaches: 0, totalUsers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStats = async () => {
            try {
                const data = await fetchDashboardData();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        getStats();
    }, []);

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>An overview of your platform's activity.</p>
            </div>

            <div className="stats-grid">
                <Card title="Total Registered Users" value={stats.totalUsers} />
                <Card title="Total Active Coaches" value={stats.approvedCoaches} />
                <Card title="Pending Applications" value={stats.pendingApprovals} />
                <Card title="Total Coaches" value={stats.totalCoaches} />
            </div>
        </div>
    );
};

export default Dashboard;

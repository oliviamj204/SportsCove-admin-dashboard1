import React, { useState, useEffect, useMemo } from 'react';
import { fetchCoaches, updateCoachStatus } from '../services/api';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import './CoachManagement.css';
import { Link } from 'react-router-dom';

const CoachManagement = () => {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [currentCoach, setCurrentCoach] = useState(null);
    const [activeTab, setActiveTab] = useState('All');

    const loadCoaches = async () => {
        try {
            setLoading(true);
            const data = await fetchCoaches();
            setCoaches(data);
        } catch (err) {
            setError('Failed to fetch coaches.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoaches();
    }, []);

    const handleVerify = async (coachId) => {
        try {
            await updateCoachStatus(coachId, 'Approved');
            loadCoaches(); // Refresh the list
        } catch (err) {
            console.error("Failed to verify coach:", err);
        }
    };

    const openRejectionModal = (coach) => {
        setCurrentCoach(coach);
        setRejectionModalOpen(true);
    };

    const closeRejectionModal = () => {
        setCurrentCoach(null);
        setRejectionReason('');
        setRejectionModalOpen(false);
    };

    const handleReject = async () => {
        if (!currentCoach || !rejectionReason) return;
        try {
            await updateCoachStatus(currentCoach.id, 'Rejected', rejectionReason);
            closeRejectionModal();
            loadCoaches(); // Refresh the list
        } catch (err) {
            console.error("Failed to reject coach:", err);
        }
    };

    const filteredCoaches = useMemo(() => {
        if (activeTab === 'All') {
            return coaches;
        }
        return coaches.filter(coach => coach.status.toLowerCase() === activeTab.toLowerCase());
    }, [coaches, activeTab]);


    const columns = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Experience', accessor: 'experience' },
        { Header: 'Sports', accessor: 'sports' },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value, row }) => (
                <div className="status-cell">
                    <StatusBadge status={value} />
                    {value === 'Rejected' && row.original.rejectionReason && (
                        <span className="rejection-reason">Reason: {row.original.rejectionReason}</span>
                    )}
                </div>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="actions-cell">
                    <Link to={`/coach/${row.original.id}`} className="action-button view">View Profile</Link>
                    {row.original.status === 'Pending' && (
                        <>
                            <button onClick={() => handleVerify(row.original.id)} className="action-button verify">Verify</button>
                            <button onClick={() => openRejectionModal(row.original)} className="action-button reject">Reject</button>
                        </>
                    )}
                </div>
            )
        },
    ];

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="coach-management-container">
            <div className="header-section">
                <h1>Coach Management</h1>
                <div className="tabs">
                    <button onClick={() => setActiveTab('All')} className={activeTab === 'All' ? 'active' : ''}>All</button>
                    <button onClick={() => setActiveTab('Pending')} className={activeTab === 'Pending' ? 'active' : ''}>Pending</button>
                    <button onClick={() => setActiveTab('Approved')} className={activeTab === 'Approved' ? 'active' : ''}>Approved</button>
                    <button onClick={() => setActiveTab('Rejected')} className={activeTab === 'Rejected' ? 'active' : ''}>Rejected</button>
                </div>
            </div>
            
            <Table columns={columns} data={filteredCoaches} />

            {isRejectionModalOpen && (
                <div className="rejection-modal-overlay">
                    <div className="rejection-modal">
                        <h2>Reason for Rejection</h2>
                        <p>Please provide a reason for rejecting <strong>{currentCoach?.name}</strong>.</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Missing certification, invalid documents..."
                        />
                        <div className="rejection-modal-actions">
                            <button onClick={handleReject} className="submit-rejection">Submit</button>
                            <button onClick={closeRejectionModal} className="cancel-rejection">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachManagement;


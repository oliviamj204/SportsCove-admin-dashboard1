import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import CoachManagement from './pages/CoachManagement';
import CoachProfile from './pages/CoachProfile';
import Login from './pages/Login';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <PrivateRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/coaches" element={<CoachManagement />} />
                    <Route path="/coach/:id" element={<CoachProfile />} />
                    {/* Redirect from base path to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </AdminLayout>
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ShakerList } from './components/ShakerList';
import { NewReservation } from './components/NewReservation';
import { ReservationList } from './components/ReservationList';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';
import { UserRole } from './types';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    // Set default view based on role
    setCurrentView(role === 'admin' ? 'dashboard' : 'reservations');
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return userRole === 'admin' ? <Dashboard /> : <div className="text-center text-gray-500 mt-10">Acesso negado.</div>;
      case 'shakers':
        return userRole === 'admin' ? <ShakerList /> : <div className="text-center text-gray-500 mt-10">Acesso negado.</div>;
      case 'new-reservation':
        return <NewReservation />;
      case 'reservations':
        return <ReservationList />;
      default:
        return <ReservationList />;
    }
  };

  if (!userRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      userRole={userRole} 
      onChangeView={setCurrentView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
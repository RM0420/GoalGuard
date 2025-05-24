
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Goals from '@/components/Goals';
import Progress from '@/components/Progress';
import Store from '@/components/Store';
import Inventory from '@/components/Inventory';
import Profile from '@/components/Profile';
import BottomNavigation from '@/components/BottomNavigation';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'goals':
        return <Goals />;
      case 'progress':
        return <Progress />;
      case 'store':
        return <Store />;
      case 'inventory':
        return <Inventory />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {renderActiveComponent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

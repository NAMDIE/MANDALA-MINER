
import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, Layers, Settings, LogIn, Library } from 'lucide-react';
import { TabRoute } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { JournalInputScreen } from '../screens/JournalInputScreen';
import { SRSReviewScreen } from '../screens/SRSReviewScreen';
import { GrammarPopupScreen } from '../screens/GrammarPopupScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const AuthScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
      <BookOpen className="text-white" size={32} />
    </div>
    <h1 className="text-3xl font-bold text-slate-900 mb-2">Mandarin Mine</h1>
    <p className="text-slate-500 mb-8 max-w-sm">
      Master Chinese through sentence mining, journaling, and smart spaced repetition.
    </p>
    <button 
      onClick={onLogin}
      className="flex items-center space-x-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
    >
      <LogIn size={20} />
      <span>Get Started</span>
    </button>
  </div>
);

// --------------------------------------------------------------------------
// Navigation Shell
// --------------------------------------------------------------------------

// Extend TabRoute to include 'Grammar' for this demo
type ExtendedTabRoute = TabRoute | 'Grammar';

export const RootNavigator = () => {
  // Mock Auth State for Scaffolding
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState<ExtendedTabRoute>('Dashboard');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthScreen onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentTab) {
      case 'Dashboard': 
        return <HomeScreen onNavigate={(tab) => setCurrentTab(tab as ExtendedTabRoute)} />;
      case 'Journal': 
        return <JournalInputScreen />;
      case 'Review': 
        return <SRSReviewScreen />;
      case 'Grammar':
        return <GrammarPopupScreen point="把 Structure" onBack={() => setCurrentTab('Dashboard')} />;
      case 'Settings': 
        return <SettingsScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <span className="font-bold text-indigo-700">Mandarin Mine</span>
        <div className="w-8 h-8 bg-slate-200 rounded-full" />
      </div>

      {/* Sidebar (Desktop) / Bottom Bar (Mobile) */}
      <nav className="
        fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50
        md:relative md:w-64 md:border-t-0 md:border-r md:flex md:flex-col md:h-screen md:sticky md:top-0
      ">
        <div className="hidden md:flex items-center space-x-3 p-6 mb-6">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="font-bold text-lg text-slate-800">Mandarin Mine</span>
        </div>

        <div className="flex justify-around md:flex-col md:justify-start md:space-y-2 md:px-3">
          <NavButton 
            active={currentTab === 'Dashboard'} 
            onClick={() => setCurrentTab('Dashboard')}
            icon={<LayoutDashboard size={24} />}
            label="Dashboard"
          />
          <NavButton 
            active={currentTab === 'Journal'} 
            onClick={() => setCurrentTab('Journal')}
            icon={<BookOpen size={24} />}
            label="Journal"
          />
          <NavButton 
            active={currentTab === 'Review'} 
            onClick={() => setCurrentTab('Review')}
            icon={<Layers size={24} />}
            label="Review"
          />
          {/* Temporary Link for Grammar Screen Demo */}
          <NavButton 
            active={currentTab === 'Grammar'} 
            onClick={() => setCurrentTab('Grammar')}
            icon={<Library size={24} />}
            label="Grammar"
          />
          <NavButton 
            active={currentTab === 'Settings'} 
            onClick={() => setCurrentTab('Settings')}
            icon={<Settings size={24} />}
            label="Settings"
          />
        </div>

        <div className="hidden md:block mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              AC
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Alex Chen</p>
              <p className="text-xs text-slate-500">HSK 4 Learner</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto w-full">
          {renderScreen()}
        </div>
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center p-3 flex-1
      md:flex-row md:justify-start md:space-x-3 md:px-4 md:py-3 md:rounded-xl md:w-full md:flex-none
      transition-all duration-200
      ${active 
        ? 'text-indigo-600 md:bg-indigo-50' 
        : 'text-slate-400 hover:text-slate-600 md:hover:bg-slate-50'
      }
    `}
  >
    <span className={`${active ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </span>
    <span className={`text-[10px] md:text-sm font-medium mt-1 md:mt-0`}>{label}</span>
  </button>
);

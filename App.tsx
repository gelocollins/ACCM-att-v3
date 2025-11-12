import React, { useState, useCallback } from 'react';
import { AppView, Branch } from './types';
import BranchSelector from './components/BranchSelector';
import RegisterEmployee from './components/RegisterEmployee';
import TimeClock from './components/TimeClock';
import AdminDashboard from './components/AdminDashboard';
import PasswordPrompt from './components/PasswordPrompt';

const Home = ({ onNavigate, branch }: { onNavigate: (view: AppView) => void, branch: Branch }) => (
  <div className="p-6 flex flex-col items-center justify-center h-full text-center">
    <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Welcome to ACCM</h1>
    <p className="text-gray-500 dark:text-gray-400 mt-2 mb-10">Branch: <span className="font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md">{branch.name}</span></p>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
       <button 
        onClick={() => onNavigate('REGISTER')} 
        className="fade-in-up bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl text-lg flex items-center justify-center gap-2"
        style={{ animationDelay: '100ms' }}
      >
        <span>👤</span>
        <span>Register</span>
      </button>
      <button 
        onClick={() => onNavigate('TIME_CLOCK')} 
        className="fade-in-up bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl text-lg flex items-center justify-center gap-2"
        style={{ animationDelay: '200ms' }}
      >
        <span>⏰</span>
        <span>Time In/Out</span>
      </button>
      <button 
        onClick={() => onNavigate('ADMIN')} 
        className="fade-in-up bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl col-span-1 sm:col-span-2 text-lg flex items-center justify-center gap-2"
        style={{ animationDelay: '300ms' }}
      >
        <span>📊</span>
        <span>Admin View</span>
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('BRANCH_SELECT');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isPasswordPromptVisible, setIsPasswordPromptVisible] = useState(false);

  const handleBranchSelect = useCallback((branch: Branch) => {
    setSelectedBranch(branch);
    setView('HOME');
  }, []);

  const reset = () => {
    setSelectedBranch(null);
    setView('BRANCH_SELECT');
  };
  
  const goHome = useCallback(() => setView('HOME'), []);

  const handleNavigation = (targetView: AppView) => {
    if (targetView === 'ADMIN') {
      setIsPasswordPromptVisible(true);
    } else {
      setView(targetView);
    }
  };

  const handlePasswordSuccess = () => {
    setIsPasswordPromptVisible(false);
    setView('ADMIN');
  };

  const renderContent = () => {
    if (!selectedBranch || view === 'BRANCH_SELECT') {
      return <BranchSelector onSelect={handleBranchSelect} />;
    }

    switch (view) {
      case 'HOME':
        return <Home onNavigate={handleNavigation} branch={selectedBranch} />;
      case 'REGISTER':
        return <RegisterEmployee branch={selectedBranch} onBack={goHome} />;
      case 'TIME_CLOCK':
        return <TimeClock branch={selectedBranch} onBack={goHome} />;
      case 'ADMIN':
        return <AdminDashboard branch={selectedBranch} onBack={goHome} />;
      default:
        return <BranchSelector onSelect={handleBranchSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">🏢 ACCM Attendance</h1>
        {selectedBranch && (
          <button onClick={reset} className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-1 px-3 rounded-lg transition-colors">
            Change Branch
          </button>
        )}
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-2xl h-full overflow-hidden backdrop-blur-lg">
            <div key={view} className="fade-in h-full">
              {renderContent()}
            </div>
        </div>
      </main>
      {isPasswordPromptVisible && (
        <PasswordPrompt 
          onSuccess={handlePasswordSuccess}
          onCancel={() => setIsPasswordPromptVisible(false)}
        />
      )}
    </div>
  );
};

export default App;
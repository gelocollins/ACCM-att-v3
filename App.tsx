
import React, { useState, useCallback } from 'react';
import { AppView, Branch } from './types';
import BranchSelector from './components/BranchSelector';
import RegisterEmployee from './components/RegisterEmployee';
import TimeClock from './components/TimeClock';
import AdminDashboard from './components/AdminDashboard';
import PasswordPrompt from './components/PasswordPrompt';

const Home = ({ onNavigate, branch }: { onNavigate: (view: AppView) => void, branch: Branch }) => (
  <div className="p-6 flex flex-col items-center justify-center h-full">
    <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Attendance System</h1>
    <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-8">Selected Branch: <span className="font-semibold">{branch.name}</span></p>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
      <button onClick={() => onNavigate('REGISTER')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg">
        👤 Register
      </button>
      <button onClick={() => onNavigate('TIME_CLOCK')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg">
        ⏰ Time In/Out
      </button>
      <button onClick={() => onNavigate('ADMIN')} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 col-span-1 sm:col-span-2 text-lg">
        📊 Admin View
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">🏢 Photo Clock</h1>
        {selectedBranch && (
          <button onClick={reset} className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-1 px-3 rounded-md transition">
            Change Branch
          </button>
        )}
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl h-full overflow-hidden">
            {renderContent()}
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

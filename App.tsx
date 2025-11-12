import React, { useState, useCallback } from 'react';
import { AppView, Branch } from './types';
import BranchSelector from './components/BranchSelector';
import RegisterEmployee from './components/RegisterEmployee';
import TimeClock from './components/TimeClock';
import AdminDashboard from './components/AdminDashboard';
import PasswordPrompt from './components/PasswordPrompt';

const Home = ({ onNavigate, branch }: { onNavigate: (view: AppView) => void, branch: Branch }) => (
  <div className="p-6 flex flex-col items-center justify-center h-full text-center">
    <h1 className="text-5xl font-bold text-cyan-300 uppercase tracking-widest neon-glow-cyan">ACCM</h1>
    <h2 className="text-2xl text-gray-300 font-light tracking-[0.2em] mb-1">ATTENDANCE SYSTEM</h2>
    <p className="text-gray-400 mt-2 mb-10">Branch: <span className="font-semibold bg-cyan-900/50 text-cyan-300 px-3 py-1 border border-cyan-500/30 rounded-md">{branch.name}</span></p>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
       <button 
        onClick={() => onNavigate('REGISTER')} 
        className="fade-in-up group relative text-lg font-bold uppercase tracking-wider text-white py-4 px-6 bg-transparent border-2 border-cyan-400 rounded-none transition-all duration-300 hover:bg-cyan-400/20"
        style={{ animationDelay: '100ms' }}
      >
        <span className="btn-glitch group-hover:text-cyan-300">Register Identity</span>
      </button>
      <button 
        onClick={() => onNavigate('TIME_CLOCK')} 
        className="fade-in-up group relative text-lg font-bold uppercase tracking-wider text-white py-4 px-6 bg-transparent border-2 border-cyan-400 rounded-none transition-all duration-300 hover:bg-cyan-400/20"
        style={{ animationDelay: '200ms' }}
      >
         <span className="btn-glitch group-hover:text-cyan-300">Clock In / Out</span>
      </button>
      <button 
        onClick={() => onNavigate('ADMIN')} 
        className="fade-in-up group relative text-lg font-bold uppercase tracking-wider text-white py-4 px-6 bg-magenta-600/80 border-2 border-magenta-500 rounded-none col-span-1 sm:col-span-2 transition-all duration-300 hover:bg-magenta-500/40"
        style={{ animationDelay: '300ms' }}
      >
        <span className="btn-glitch group-hover:text-magenta-300">Admin Dashboard</span>
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
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-cyan-500/20 p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-cyan-300 uppercase tracking-widest neon-glow-cyan">ACCM ATTENDANCE</h1>
        {selectedBranch && (
          <button onClick={reset} className="text-sm bg-slate-700 hover:bg-slate-600 border border-slate-500 text-gray-300 font-semibold py-1 px-3 rounded-none transition-colors">
            [ Switch Branch ]
          </button>
        )}
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <div className="bg-slate-900/50 backdrop-blur-md border border-cyan-500/10 rounded-none h-full overflow-hidden">
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
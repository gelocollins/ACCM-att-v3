import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Branch, AttendanceRecord } from '../types';
import { getAttendanceRecords, getBranches } from '../services/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  onLogout: () => void;
}

const calculateHours = (start: string, end: string | null): string => {
    if (!end) return 'N/A';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    if (isNaN(startTime) || isNaN(endTime) || endTime < startTime) return 'Invalid';
    
    let diff = endTime - startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}

const formatTime = (isoString: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const toYyyyMmDd = (date: Date) => {
    return date.toISOString().split('T')[0];
};

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(toYyyyMmDd(new Date()));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllBranches = async () => {
      try {
        setError(null);
        setLoadingBranches(true);
        const data = await getBranches();
        setAllBranches(data);
        if (data.length > 0) {
          setSelectedBranch(data[0]);
        }
      } catch (err) {
        setError('Failed to load branch data.');
        console.error(err);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchAllBranches();
  }, []);

  const fetchRecords = useCallback(async () => {
    if (!selectedBranch) return;
    try {
      setLoadingRecords(true);
      setError(null);
      const data = await getAttendanceRecords(selectedBranch.id, selectedDate);
      setRecords(data);
    } catch (err) {
      setError('Failed to fetch attendance records.');
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  }, [selectedBranch, selectedDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    return records.filter(record =>
      record.employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  const stats = useMemo(() => ({
    total: filteredRecords.length,
    clockedIn: filteredRecords.filter(r => r.time_in && !r.time_out).length,
    clockedOut: filteredRecords.filter(r => r.time_out).length
  }), [filteredRecords]);

  const PhotoDisplay: React.FC<{ url: string | null; time: string | null; label: string }> = ({ url, time, label }) => (
    <div className="flex-1 text-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
      {url ? (
        <img src={url} alt={label} className="w-20 h-20 object-cover rounded-none mx-auto mt-1 border-2 border-slate-600" />
      ) : (
        <div className="w-20 h-20 bg-slate-800 rounded-none mx-auto mt-1 flex items-center justify-center text-gray-600">-</div>
      )}
      <p className="text-lg font-semibold mt-2 text-cyan-300">{formatTime(time)}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0a0a0a] via-[#16213e] to-[#1a1a2e] text-gray-200 antialiased font-sans">
      <aside className="w-64 bg-slate-900/50 backdrop-blur-sm border-r border-cyan-500/20 p-4 flex flex-col flex-shrink-0">
        <h1 className="text-xl font-bold text-cyan-300 uppercase tracking-widest neon-glow-cyan mb-8">ADMIN PANEL</h1>
        <nav className="flex-grow overflow-y-auto">
          <h2 className="text-sm uppercase text-gray-400 tracking-wider mb-2 px-2">Branches</h2>
          {loadingBranches ? <LoadingSpinner /> : (
            <ul className="space-y-1">
              {allBranches.map(branch => (
                <li key={branch.id}>
                  <button 
                    onClick={() => setSelectedBranch(branch)}
                    className={`w-full text-left text-lg font-semibold px-3 py-2 rounded-none transition-all duration-200 ${selectedBranch?.id === branch.id ? 'bg-cyan-500/30 text-white neon-border-cyan' : 'text-cyan-300 hover:bg-cyan-500/10'}`}
                  >
                   &gt; {branch.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
        <button onClick={onLogout} className="w-full mt-4 text-center py-2 px-4 rounded-none border-2 border-magenta-500 bg-magenta-600/50 hover:bg-magenta-500/40 text-magenta-200 font-bold uppercase tracking-wider transition-all">
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6 flex flex-col overflow-hidden">
        {!selectedBranch ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-2xl text-gray-500">
                {loadingBranches ? 'Loading Branches...' : 'Select a branch to begin.'}
            </p>
          </div>
        ) : (
          <>
            <header className="flex-shrink-0 bg-slate-900/50 backdrop-blur-md border border-cyan-500/10 p-4 rounded-none mb-4">
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">{selectedBranch.name}</h2>
                <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-800 border-2 border-slate-600 rounded-none focus:outline-none focus:ring-magenta-500 focus:border-magenta-500 text-white"
                    />
                    <input 
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/2 px-3 py-2 bg-slate-800 border-2 border-slate-600 rounded-none placeholder-gray-500 focus:outline-none focus:ring-magenta-500 focus:border-magenta-500 text-white"
                    />
                </div>
            </header>

            <div className="grid grid-cols-3 gap-4 mb-4 flex-shrink-0">
                <div className="bg-slate-900/50 p-4 border border-cyan-500/10 rounded-none text-center"><p className="text-3xl font-bold text-cyan-300">{stats.total}</p><p className="text-sm uppercase text-gray-400">Total Entries</p></div>
                <div className="bg-slate-900/50 p-4 border border-cyan-500/10 rounded-none text-center"><p className="text-3xl font-bold text-yellow-300">{stats.clockedIn}</p><p className="text-sm uppercase text-gray-400">Clocked In</p></div>
                <div className="bg-slate-900/50 p-4 border border-cyan-500/10 rounded-none text-center"><p className="text-3xl font-bold text-green-400">{stats.clockedOut}</p><p className="text-sm uppercase text-gray-400">Clocked Out</p></div>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2">
              {loadingRecords ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : 
              error ? <div className="text-center text-red-400 mt-4 uppercase">{error}</div> : 
              filteredRecords.length === 0 ? (
                <p className="text-center text-gray-500 mt-8 text-xl">
                  {records.length > 0 ? 'No employees match search criteria.' : `No attendance records for ${new Date(selectedDate+'T00:00:00').toLocaleDateString()}.`}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((record, index) => (
                    <div key={record.id} className="fade-in-up bg-slate-900/70 backdrop-blur-sm border border-cyan-500/10 p-4 rounded-none flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4" style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}>
                      <div className="flex-shrink-0 text-center w-36">
                        <img src={record.employee.registration_photo} alt="Registration" className="w-24 h-24 object-cover rounded-full mx-auto border-4 border-magenta-500 neon-border-magenta" />
                        <h3 className="font-bold text-xl text-magenta-300 mt-2 truncate uppercase" title={record.employee.name}>{record.employee.name}</h3>
                        <p className="text-sm text-yellow-300 font-mono bg-yellow-900/50 rounded-none px-2 py-0.5 inline-block border border-yellow-500/30">
                            {calculateHours(record.time_in, record.time_out)}
                        </p>
                      </div>
                      <div className="w-full flex justify-around items-center bg-black/30 p-3">
                        <PhotoDisplay url={record.time_in_photo} time={record.time_in} label="Time In" />
                        <div className="text-3xl text-slate-600 font-light">&gt;&gt;</div>
                        <PhotoDisplay url={record.time_out_photo} time={record.time_out} label="Time Out" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

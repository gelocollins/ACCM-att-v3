import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Branch, AttendanceRecord } from '../types';
import { getAttendanceRecords } from '../services/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  branch: Branch;
  onBack: () => void;
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

const AdminDashboard: React.FC<Props> = ({ branch, onBack }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(toYyyyMmDd(new Date()));
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAttendanceRecords(branch.id, selectedDate);
      setRecords(data);
    } catch (err) {
      setError('Failed to fetch attendance records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [branch.id, selectedDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) {
      return records;
    }
    return records.filter(record =>
      record.employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

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
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <button onClick={onBack} className="text-cyan-400 hover:text-cyan-200 font-semibold uppercase tracking-wider">&lt; Back to Main</button>
        <h2 className="text-2xl font-bold text-center mt-2 text-white uppercase tracking-widest">Admin Dashboard</h2>
        <p className="text-center text-gray-400">Viewing Records for: {branch.name}</p>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <div className="w-full sm:w-auto">
                <label htmlFor="date-picker" className="sr-only">Select Date</label>
                <input 
                type="date" 
                id="date-picker"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-800 border-2 border-slate-600 rounded-none focus:outline-none focus:ring-magenta-500 focus:border-magenta-500 text-white"
                />
            </div>
            <div className="w-full sm:w-1/2">
                <label htmlFor="search-employee" className="sr-only">Search Employee</label>
                <input 
                type="text"
                id="search-employee"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-600 rounded-none placeholder-gray-500 focus:outline-none focus:ring-magenta-500 focus:border-magenta-500 text-white"
                />
            </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto pr-2">
        {loading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
        {error && <div className="text-center text-red-400 mt-4 uppercase">{error}</div>}
        {!loading && !error && (
          filteredRecords.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">
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
          )
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
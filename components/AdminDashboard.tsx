
import React, { useState, useEffect, useCallback } from 'react';
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

const AdminDashboard: React.FC<Props> = ({ branch, onBack }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAttendanceRecords(branch.id);
      setRecords(data);
    } catch (err) {
      setError('Failed to fetch attendance records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [branch.id]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const PhotoDisplay: React.FC<{ url: string | null; time: string | null; label: string }> = ({ url, time, label }) => (
    <div className="flex-1 text-center">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{label}</p>
      {url ? (
        <img src={url} alt={label} className="w-16 h-16 object-cover rounded-md mx-auto mt-1 shadow-md" />
      ) : (
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto mt-1 flex items-center justify-center text-gray-400">-</div>
      )}
      <p className="text-sm font-medium mt-1">{formatTime(time)}</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <button onClick={onBack} className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">&larr; Back to Home</button>
        <h2 className="text-2xl font-bold text-center mt-2 text-gray-800 dark:text-white">📊 Admin Dashboard</h2>
        <p className="text-center text-gray-500 dark:text-gray-400">Today's Attendance for {branch.name}</p>
        <div className="text-center mt-2">
            <button onClick={fetchRecords} disabled={loading} className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-1 px-3 rounded-md transition disabled:opacity-50">
                {loading ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {loading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
        {error && <div className="text-center text-red-500 mt-4">{error}</div>}
        {!loading && !error && (
          records.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No attendance records for today.</p>
          ) : (
            <div className="space-y-4">
              {records.map(record => (
                <div key={record.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-shrink-0 text-center w-24">
                     <img src={record.employee.registration_photo_url} alt="Registration" className="w-16 h-16 object-cover rounded-full mx-auto border-2 border-indigo-400" />
                     <h3 className="font-bold text-md mt-2 truncate" title={record.employee.name}>{record.employee.name}</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-300 font-mono bg-indigo-100 dark:bg-indigo-900 rounded px-1">{calculateHours(record.time_in, record.time_out)}</p>
                  </div>
                  <div className="w-full flex justify-around items-center">
                    <PhotoDisplay url={record.time_in_photo_url} time={record.time_in} label="Time In" />
                    <div className="text-gray-300 dark:text-gray-500">&rarr;</div>
                    <PhotoDisplay url={record.time_out_photo_url} time={record.time_out} label="Time Out" />
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

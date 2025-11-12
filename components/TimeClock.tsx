import React, { useState, useEffect } from 'react';
import { Branch, Employee } from '../types';
import CameraCapture from './CameraCapture';
import { getEmployeesByBranch, getOpenAttendance, addTimeIn, addTimeOut } from '../services/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  branch: Branch;
  onBack: () => void;
}

const TimeClock: React.FC<Props> = ({ branch, onBack }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsFetchingEmployees(true);
        const data = await getEmployeesByBranch(branch.id);
        setEmployees(data);
      } catch (err) {
        setError('Failed to load employee roster.');
      } finally {
        setIsFetchingEmployees(false);
      }
    };
    fetchEmployees();
  }, [branch.id]);

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !photo) {
      setError('Please select identity and provide photo scan.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const openAttendance = await getOpenAttendance(selectedEmployeeId);
      if (openAttendance) {
        await addTimeOut(openAttendance.id, selectedEmployeeId, photo);
        setSuccess('Time-out record submitted.');
      } else {
        await addTimeIn(selectedEmployeeId, branch.id, photo);
        setSuccess('Time-in record submitted.');
      }
      setSelectedEmployeeId('');
      setPhoto(null);
      setTimeout(onBack, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <button onClick={onBack} className="text-cyan-400 hover:text-cyan-200 font-semibold uppercase tracking-wider">&lt; Back to Main</button>
        <h2 className="text-2xl font-bold text-center mt-2 text-white uppercase tracking-widest">Time In / Time Out</h2>
        <p className="text-center text-gray-400">Branch: {branch.name}</p>
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-6">
          <CameraCapture onCapture={setPhoto} onClear={() => setPhoto(null)} />
          
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-300 uppercase tracking-wider">Select Your Identity</label>
            {isFetchingEmployees ? <div className="mt-2"><LoadingSpinner/></div> : (
                <select
                id="employee"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-800 border-2 border-slate-600 rounded-none focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-white"
                >
                <option value="" disabled>-- Please select --</option>
                {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
                </select>
            )}
          </div>
          
          {error && <p className="text-red-400 text-sm text-center font-semibold uppercase">{error}</p>}
          {success && <p className="text-green-400 text-sm text-center font-semibold uppercase">{success}</p>}
          
          <button
            onClick={handleSubmit}
            disabled={!selectedEmployeeId || !photo || loading}
            className="w-full flex justify-center py-3 px-4 border-2 border-cyan-500 rounded-none text-lg font-bold text-white uppercase tracking-wider bg-cyan-600/80 hover:bg-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-gray-700 disabled:border-gray-600 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <LoadingSpinner /> : 'Submit Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeClock;
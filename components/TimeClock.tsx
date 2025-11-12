
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
        setError('Failed to load employees.');
      } finally {
        setIsFetchingEmployees(false);
      }
    };
    fetchEmployees();
  }, [branch.id]);

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !photo) {
      setError('Please select an employee and take a photo.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const openAttendance = await getOpenAttendance(selectedEmployeeId);
      if (openAttendance) {
        await addTimeOut(openAttendance.id, selectedEmployeeId, photo);
        setSuccess('Successfully timed out!');
      } else {
        await addTimeIn(selectedEmployeeId, branch.id, photo);
        setSuccess('Successfully timed in!');
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
        <button onClick={onBack} className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">&larr; Back to Home</button>
        <h2 className="text-2xl font-bold text-center mt-2 text-gray-800 dark:text-white">⏰ Time In / Time Out</h2>
        <p className="text-center text-gray-500 dark:text-gray-400">Branch: {branch.name}</p>
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-6">
          <CameraCapture onCapture={setPhoto} onClear={() => setPhoto(null)} />
          
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Your Name</label>
            {isFetchingEmployees ? <LoadingSpinner/> : (
                <select
                id="employee"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                <option value="" disabled>-- Please select --</option>
                {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
                </select>
            )}
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}
          
          <button
            onClick={handleSubmit}
            disabled={!selectedEmployeeId || !photo || loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? <LoadingSpinner /> : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeClock;

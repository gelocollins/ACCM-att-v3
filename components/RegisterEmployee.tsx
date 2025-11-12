import React, { useState } from 'react';
import { Branch } from '../types';
import CameraCapture from './CameraCapture';
import { addEmployee } from '../services/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  branch: Branch;
  onBack: () => void;
}

const RegisterEmployee: React.FC<Props> = ({ branch, onBack }) => {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !photo) {
      setError('Name and photo are required.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await addEmployee(name, photo, branch.id);
      setSuccess(`Successfully registered ${name}!`);
      setName('');
      setPhoto(null);
      setTimeout(onBack, 2000);
    } catch (err) {
      setError('Failed to register employee.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <button onClick={onBack} className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold">&larr; Back to Home</button>
        <h2 className="text-2xl font-bold text-center mt-2 text-gray-800 dark:text-white">👤 New Employee Registration</h2>
        <p className="text-center text-gray-500 dark:text-gray-400">Branch: {branch.name}</p>
      </div>

      <div className="flex-grow overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <CameraCapture onCapture={setPhoto} onClear={() => setPhoto(null)} />
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Jane Doe"
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center font-semibold">{success}</p>}
          
          <button
            type="submit"
            disabled={!name || !photo || loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:from-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
          >
            {loading ? <LoadingSpinner /> : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterEmployee;
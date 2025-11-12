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
      setSuccess(`Registration complete for: ${name}`);
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
        <button onClick={onBack} className="text-cyan-400 hover:text-cyan-200 font-semibold uppercase tracking-wider">&lt; Back to Main</button>
        <h2 className="text-2xl font-bold text-center mt-2 text-white uppercase tracking-widest">New Identity Registration</h2>
        <p className="text-center text-gray-400">Branch: {branch.name}</p>
      </div>

      <div className="flex-grow overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <CameraCapture onCapture={setPhoto} onClear={() => setPhoto(null)} />
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-800 border-2 border-slate-600 rounded-none placeholder-gray-500 focus:outline-none focus:ring-magenta-500 focus:border-magenta-500 text-white"
              placeholder="e.g., Jane Doe"
              required
            />
          </div>
          
          {error && <p className="text-red-400 text-sm text-center font-semibold uppercase">{error}</p>}
          {success && <p className="text-green-400 text-sm text-center font-semibold uppercase">{success}</p>}
          
          <button
            type="submit"
            disabled={!name || !photo || loading}
            className="w-full flex justify-center py-3 px-4 border-2 border-magenta-500 rounded-none text-lg font-bold text-white uppercase tracking-wider bg-magenta-600/80 hover:bg-magenta-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-magenta-500 disabled:bg-gray-700 disabled:border-gray-600 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <LoadingSpinner /> : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterEmployee;
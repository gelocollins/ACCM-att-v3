
import React, { useState, useEffect } from 'react';
import { getBranches } from '../services/supabase';
import { Branch } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  onSelect: (branch: Branch) => void;
}

const BranchSelector: React.FC<Props> = ({ onSelect }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const data = await getBranches();
        setBranches(data);
      } catch (err) {
        setError('Failed to load branches.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  if (error) return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;

  return (
    <div className="p-8 flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Welcome! Please select your branch.</h2>
      <div className="w-full max-w-sm space-y-3">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => onSelect(branch)}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 text-left"
          >
            {branch.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BranchSelector;

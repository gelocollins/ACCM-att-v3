import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const ADMIN_PASSWORD = "accm_attendance2025";

const PasswordPrompt: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError(null);
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-slate-900/80 border-2 border-magenta-500/50 rounded-none shadow-2xl p-6 w-full max-w-sm m-4 fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center text-magenta-300 uppercase tracking-widest">Admin Access Required</h2>
        <p className="text-center text-sm text-gray-400 mb-4">
          Please enter the admin password to continue.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              ref={inputRef}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-800 border-2 border-slate-600 rounded-none placeholder-gray-500 focus:outline-none focus:ring-magenta-500 focus:border-magenta-500 text-white"
              placeholder="Password"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center mb-4 uppercase">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-none text-sm font-medium text-gray-300 bg-slate-700 hover:bg-slate-600 border border-slate-500 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-none text-sm font-medium text-white bg-magenta-600 hover:bg-magenta-700 border border-magenta-500 focus:outline-none transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordPrompt;
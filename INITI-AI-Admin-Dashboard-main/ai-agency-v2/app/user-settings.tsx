import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserSettings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const mockUser = { name: 'John Doe', email: 'john.doe@example.com' };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const user = supabase.auth.user();
      if (!user) throw new Error('User not logged in');

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name,
        email,
      });

      if (error) throw error;

      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Settings</h1>
      <div className="p-4 bg-white rounded shadow-md">
        {message && <p className="mb-4 text-green-500">{message}</p>}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={mockUser.name}
            readOnly
            className="block w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring bg-gray-100"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={mockUser.email}
            readOnly
            className="block w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring bg-gray-100"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('type=recovery')) {
      toast.error('Invalid reset link');
      navigate('/auth');
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #12121A 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'rgba(18, 18, 26, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(91, 156, 255, 0.15)',
        }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#EAEAF0', fontFamily: "'Space Grotesk', sans-serif" }}>
          Reset Password
        </h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(91,156,255,0.2)', color: '#EAEAF0' }}
            required
            minLength={6}
          />
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-lg text-sm font-bold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #5B9CFF, #A855F7)', color: '#EAEAF0' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

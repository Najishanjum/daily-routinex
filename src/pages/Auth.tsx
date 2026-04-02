import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import routinexIcon from '@/assets/routinex-icon.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { session } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [session, navigate]);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91, 156, 255, ${p.alpha})`;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(91, 156, 255, ${0.1 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        setShowWelcome(true);
        setTimeout(() => navigate('/'), 2000);
      } else {
        // Check if user exists by trying to sign up
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) {
          if (error.message.includes('already registered') || error.message.includes('already been registered')) {
            toast.error('An account with this email already exists. Please login instead.');
            setIsLogin(true);
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Account created! Check your email to verify, or login now.');
        setIsLogin(true);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email first');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset link sent to your email!');
    }
  };

  // Welcome transition screen
  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #0A0A0F 100%)' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-6xl mb-6"
          >
            🚀
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#EAEAF0', fontFamily: "'Space Grotesk', sans-serif" }}>
            Welcome to RoutineX
          </h1>
          <p className="text-lg" style={{ color: '#5B9CFF' }}>
            Welcome back, let's build your perfect routine.
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '200px' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="h-1 mx-auto mt-6 rounded-full"
            style={{ background: 'linear-gradient(90deg, #5B9CFF, #A855F7)' }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #0A0A0F 100%)' }}
    >
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #5B9CFF, transparent)' }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #A855F7, transparent)' }}
        />
      </div>

      {/* Left side - Abstract visual */}
      <motion.div
        className="hidden lg:flex flex-1 items-center justify-center relative z-10"
        style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }}
      >
        <div className="relative">
          {/* Digital mesh / abstract face */}
          <svg viewBox="0 0 400 400" className="w-80 h-80 xl:w-96 xl:h-96" style={{ filter: 'drop-shadow(0 0 40px rgba(91, 156, 255, 0.3))' }}>
            <defs>
              <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B9CFF" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#A855F7" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#5B9CFF" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Abstract face mesh lines */}
            <g stroke="url(#meshGrad)" strokeWidth="0.8" fill="none" opacity="0.7">
              <ellipse cx="200" cy="180" rx="100" ry="130" />
              <ellipse cx="200" cy="180" rx="70" ry="100" />
              <ellipse cx="200" cy="180" rx="40" ry="65" />
              {/* Eyes */}
              <circle cx="170" cy="160" r="15" strokeWidth="1.2" />
              <circle cx="230" cy="160" r="15" strokeWidth="1.2" />
              <circle cx="170" cy="160" r="5" fill="#5B9CFF" stroke="none" />
              <circle cx="230" cy="160" r="5" fill="#5B9CFF" stroke="none" />
              {/* Nose */}
              <line x1="200" y1="170" x2="195" y2="200" />
              <line x1="200" y1="170" x2="205" y2="200" />
              {/* Mouth */}
              <path d="M180 220 Q200 240 220 220" />
              {/* Grid lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`h${i}`} x1="100" y1={80 + i * 30} x2="300" y2={80 + i * 30} opacity="0.3" />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`v${i}`} x1={110 + i * 30} y1="50" x2={110 + i * 30} y2="310" opacity="0.3" />
              ))}
            </g>
            {/* Glow nodes */}
            {[
              [150, 100], [250, 100], [130, 180], [270, 180], [160, 260], [240, 260], [200, 310],
              [200, 70], [140, 140], [260, 140], [170, 220], [230, 220],
            ].map(([cx, cy], i) => (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r="3"
                fill="#5B9CFF"
                animate={{ opacity: [0.3, 1, 0.3], r: [2, 4, 2] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </svg>
          <motion.p
            className="text-center mt-8 text-lg font-medium"
            style={{ color: 'rgba(234, 234, 240, 0.6)', fontFamily: "'Space Grotesk', sans-serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            AI-Powered Productivity
          </motion.p>
        </div>
      </motion.div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-12 h-12 rounded-xl overflow-hidden"
              animate={{ boxShadow: ['0 0 20px rgba(91,156,255,0.3)', '0 0 40px rgba(91,156,255,0.6)', '0 0 20px rgba(91,156,255,0.3)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <img src={routinexIcon} alt="RoutineX" className="w-full h-full object-cover" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#EAEAF0', fontFamily: "'Space Grotesk', sans-serif" }}>
                Routine<span style={{ color: '#5B9CFF' }}>X</span>
              </h1>
              <p className="text-xs" style={{ color: 'rgba(234,234,240,0.5)' }}>Your Personal Productivity Tracker</p>
            </div>
          </motion.div>

          {/* Glass card */}
          <motion.div
            className="rounded-2xl p-8 relative"
            style={{
              background: 'rgba(18, 18, 26, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(91, 156, 255, 0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Toggle */}
            <div className="flex mb-6 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {['Login', 'Sign Up'].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setIsLogin(i === 0)}
                  className="flex-1 py-2.5 text-sm font-semibold transition-all duration-300 relative"
                  style={{
                    color: (i === 0 ? isLogin : !isLogin) ? '#EAEAF0' : 'rgba(234,234,240,0.4)',
                    background: (i === 0 ? isLogin : !isLogin) ? 'rgba(91, 156, 255, 0.15)' : 'transparent',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {label}
                  {(i === 0 ? isLogin : !isLogin) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: 'linear-gradient(90deg, #5B9CFF, #A855F7)' }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(234,234,240,0.6)' }}>
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com or +91..."
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(91, 156, 255, 0.2)',
                      color: '#EAEAF0',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(91, 156, 255, 0.6)';
                      e.target.style.boxShadow = '0 0 15px rgba(91, 156, 255, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(91, 156, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(234,234,240,0.6)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(91, 156, 255, 0.2)',
                      color: '#EAEAF0',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(91, 156, 255, 0.6)';
                      e.target.style.boxShadow = '0 0 15px rgba(91, 156, 255, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(91, 156, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                    minLength={6}
                  />
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs hover:underline transition-colors"
                    style={{ color: '#5B9CFF' }}
                  >
                    Forgot Password?
                  </button>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-lg text-sm font-bold transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #5B9CFF 0%, #A855F7 100%)',
                    color: '#EAEAF0',
                    boxShadow: '0 4px 20px rgba(91, 156, 255, 0.3)',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {loading ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : isLogin ? 'Login' : 'Create Account'}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            <p className="text-center mt-6 text-xs" style={{ color: 'rgba(234,234,240,0.4)' }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold hover:underline"
                style={{ color: '#5B9CFF' }}
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;

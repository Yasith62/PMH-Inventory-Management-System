import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, Wrench, Settings, Car } from 'lucide-react';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url("/login-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {loading && <Loading message="Signing in..." fullScreen={true} size={60} />}

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10 mx-auto">
        {/* Brand Badge */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#1D4ED8] rounded-full flex items-center justify-center shadow-lg mb-4">
            <div className="relative">
              <Car className="w-10 h-10 text-white" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-[#1D4ED8] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1f5c] text-center">Inventory Management System</h1>
          <p className="text-sm text-slate-500 mt-1">Pugoda Motor House</p>
        </div>

        {/* Form Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#0b1f5c]">Sign in</h2>
          <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the IMS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all text-sm"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-12 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all text-sm"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Utility Row */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-[#1D4ED8] focus:ring-[#1D4ED8]"
              />
              <span className="text-sm text-slate-600">Remember me</span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-[#1D4ED8] text-white py-3 rounded-xl font-semibold hover:bg-[#1E40AF] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Sign in
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Pugoda Motor House. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Anchor, Mail, Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError("로그인/회원가입 실패: " + err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await googleLogin();
    } catch (err) {
      setError("구글 로그인 실패");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1468581264429-2548ef9eb732?q=80&w=2070&auto=format&fit=crop" 
          alt="Ocean Rescue" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 text-center text-white px-10">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30">
            <Anchor size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">AI Rescue Buoy</h1>
          <p className="text-xl text-slate-200 font-light">
            Human-in-the-loop Autonomous Rescue System
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-slate-500 mt-2">
              {isSignUp ? "Join the rescue network team." : "Sign in to access the control dashboard."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2 rounded-r">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSignUp ? <User size={20} /> : <Anchor size={20} />}
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogle}
              className="mt-6 w-full py-3 border border-slate-200 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors font-medium text-slate-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google Sign In
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 font-bold text-orange-600 hover:text-orange-700 hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
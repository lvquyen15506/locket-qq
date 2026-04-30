import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://locket-api-seven.vercel.app/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { username, password });
      if (res.data.success && res.data.token) {
        localStorage.setItem('admin_token', res.data.token);
        toast.success('Đăng nhập Admin thành công!');
        navigate('/');
      } else {
        toast.error('Đăng nhập thất bại');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-300 p-4">
      <div className="max-w-md w-full bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-base-200">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary text-primary-content rounded-2xl shadow-xl shadow-primary/20">
              <ShieldCheck size={40} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-2">Admin Login</h2>
          <p className="text-base-content/60 text-center mb-8">
            Đăng nhập để quản lý Locket QQ
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Tài khoản</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                <input
                  type="text"
                  placeholder="admin"
                  className="input input-bordered w-full pl-12 rounded-xl focus:border-primary focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Mật khẩu</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-12 rounded-xl focus:border-primary focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full rounded-xl text-lg mt-4 shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Truy cập Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

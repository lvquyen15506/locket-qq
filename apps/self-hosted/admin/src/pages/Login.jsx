import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [secret, setSecret] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (secret) {
      localStorage.setItem('admin_secret', secret);
      toast.success('Đăng nhập Admin thành công!');
      navigate('/');
    } else {
      toast.error('Vui lòng nhập Admin Secret Key');
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
            Nhập Admin Secret Key để tiếp tục
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Secret Key</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-12 rounded-xl focus:border-primary focus:outline-none"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full rounded-xl text-lg mt-4 shadow-lg shadow-primary/20">
              Truy cập Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Settings, Bell, ShieldAlert, Save } from 'lucide-react';
import { toast } from 'sonner';

const SystemConfig = () => {
  const [config, setConfig] = useState({
    maintenance: false,
    notification: '',
    version: '1.0.0'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://locket-api-seven.vercel.app/api';
      const res = await axios.get(`${apiUrl}/admin/config`);
      setConfig(res.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://locket-api-seven.vercel.app/api';
      const token = localStorage.getItem('admin_token');
      await axios.post(`${apiUrl}/admin/config`, config, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Đã cập nhật cấu hình hệ thống!');
    } catch (error) {
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black mb-1">Cấu hình hệ thống</h1>
          <p className="text-base-content/60">Quản lý trạng thái và thông báo toàn cục</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary rounded-xl shadow-lg shadow-primary/20"
        >
          {saving ? <span className="loading loading-spinner"></span> : <Save size={20} />}
          Lưu cấu hình
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Maintenance Mode */}
        <div className="bg-base-100 rounded-3xl shadow-xl border border-base-200 p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 text-warning rounded-2xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Chế độ bảo trì</h3>
              <p className="text-sm opacity-60">Ngăn người dùng truy cập web app tạm thời</p>
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input 
                type="checkbox" 
                className="toggle toggle-warning toggle-lg" 
                checked={config.maintenance}
                onChange={(e) => setConfig({ ...config, maintenance: e.target.checked })}
              />
              <span className="label-text font-bold text-lg">
                {config.maintenance ? 'Đang bật bảo trì' : 'Đang hoạt động bình thường'}
              </span>
            </label>
          </div>
        </div>

        {/* Global Notification */}
        <div className="bg-base-100 rounded-3xl shadow-xl border border-base-200 p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-info/10 text-info rounded-2xl">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Thông báo hệ thống</h3>
              <p className="text-sm opacity-60">Hiện thông báo chạy trên đầu trang chủ</p>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Nội dung thông báo</span>
            </label>
            <textarea 
              className="textarea textarea-bordered h-24 rounded-2xl focus:border-primary focus:outline-none" 
              placeholder="Nhập thông báo tại đây..."
              value={config.notification}
              onChange={(e) => setConfig({ ...config, notification: e.target.value })}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;

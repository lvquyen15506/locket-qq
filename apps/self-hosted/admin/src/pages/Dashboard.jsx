import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, UserCheck, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, users: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://locketqq.online/api';
        const token = localStorage.getItem('admin_token');
        const res = await axios.get(`${apiUrl}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setStats(res.data.data);
      } catch (error) {
        toast.error('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black mb-1">Dashboard</h1>
          <p className="text-base-content/60">Thống kê người dùng Locket QQ</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-base-100 p-6 rounded-3xl shadow-xl border border-base-200 flex items-center gap-4">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl">
            <Users size={32} />
          </div>
          <div>
            <div className="text-sm text-base-content/60 font-semibold uppercase tracking-wider">Tổng User</div>
            <div className="text-3xl font-black">{stats.totalUsers}</div>
          </div>
        </div>
        
        {/* Có thể thêm các chỉ số khác ở đây */}
      </div>

      {/* Users Table */}
      <div className="bg-base-100 rounded-3xl shadow-xl border border-base-200 overflow-hidden">
        <div className="p-6 border-b border-base-200 bg-base-100/50 backdrop-blur-xl">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <UserCheck size={24} className="text-primary" />
            Danh sách người dùng mới nhất
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>Người dùng</th>
                <th>Email</th>
                <th>Ngày gia nhập</th>
                <th>Hoạt động cuối</th>
              </tr>
            </thead>
            <tbody>
              {stats.users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-base-content/40 italic">Chưa có người dùng nào đăng nhập</td>
                </tr>
              ) : (
                stats.users.map((user) => (
                  <tr key={user.uid} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10 shadow-md">
                            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} alt={user.displayName} />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.displayName}</div>
                          <div className="text-xs opacity-50">{user.uid}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="opacity-50" />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm opacity-70">
                        <Calendar size={14} />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="badge badge-primary badge-outline text-xs">
                        {new Date(user.lastSeen).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

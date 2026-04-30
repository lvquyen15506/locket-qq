import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Palette, Plus, Trash2, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const ThemesManager = () => {
  const [themes, setThemes] = useState({
    background: [],
    special: [],
    decorative: [],
    custome: [],
    image_icon: [],
    image_gif: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = [
    { key: 'background', label: 'Suggest Theme', color: 'primary' },
    { key: 'special', label: 'Caption Đặc biệt', color: 'secondary' },
    { key: 'decorative', label: 'Decorative by Locket', color: 'accent' },
    { key: 'custome', label: 'Decorative by QQ', color: 'info' },
    { key: 'image_icon', label: 'Caption Icon', color: 'warning' },
    { key: 'image_gif', label: 'Caption Gif', color: 'error' },
  ];

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const res = await axios.get('https://locketqq.online/api/admin/themes');
      setThemes(res.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Theme');
    } finally {
      setLoading(false);
    }
  };

  const handleAddId = (category) => {
    const id = prompt('Nhập ID Kanade (UUID):');
    if (id && id.trim()) {
      setThemes({
        ...themes,
        [category]: [...themes[category], id.trim()]
      });
    }
  };

  const handleRemoveId = (category, index) => {
    const newIds = [...themes[category]];
    newIds.splice(index, 1);
    setThemes({ ...themes, [category]: newIds });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('https://locketqq.online/api/admin/themes', themes, {
        headers: { 'x-admin-secret': localStorage.getItem('admin_secret') }
      });
      toast.success('Đã lưu thay đổi thành công!');
    } catch (error) {
      toast.error('Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black mb-1">Quản lý Theme</h1>
          <p className="text-base-content/60">Gắn ID Kanade vào các danh mục hiển thị trên Web App</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary rounded-xl shadow-lg shadow-primary/20"
        >
          {saving ? <span className="loading loading-spinner"></span> : <Save size={20} />}
          Lưu tất cả thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.key} className="bg-base-100 rounded-3xl shadow-xl border border-base-200 overflow-hidden flex flex-col">
            <div className={`p-4 bg-${cat.color}/10 border-b border-base-200 flex justify-between items-center`}>
              <h3 className={`font-bold flex items-center gap-2 text-${cat.color}`}>
                <Palette size={20} />
                {cat.label}
              </h3>
              <button 
                onClick={() => handleAddId(cat.key)}
                className={`btn btn-sm btn-circle btn-${cat.color}`}
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="p-4 flex-1 space-y-2 min-h-[100px]">
              {themes[cat.key]?.length === 0 ? (
                <div className="h-full flex items-center justify-center text-base-content/30 italic text-sm py-4">
                  Trống
                </div>
              ) : (
                themes[cat.key].map((id, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-base-200 rounded-xl group transition-all hover:bg-base-300">
                    <code className="text-xs flex-1 truncate font-mono opacity-70">{id}</code>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={`https://captionkanade.site/p/${id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-xs btn-ghost btn-circle"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button 
                        onClick={() => handleRemoveId(cat.key, index)}
                        className="btn btn-xs btn-ghost btn-circle text-error"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemesManager;

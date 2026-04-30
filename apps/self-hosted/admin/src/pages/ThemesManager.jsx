import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Palette, Plus, Trash2, Save, ExternalLink, Edit2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const ThemesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeDetails, setThemeDetails] = useState({});

  const predefinedColors = ['primary', 'secondary', 'accent', 'info', 'warning', 'error', 'success'];

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const apiUrl = 'https://locket-api-seven.vercel.app/api';
      const res = await axios.get(`${apiUrl}/admin/themes`);
      let data = res.data.data;
      
      if (!Array.isArray(data)) {
        // Migration logic: If the data is still the old object format, convert it to array
        const migrated = [];
        const oldMap = [
          { key: 'background', label: '🎨 Suggest Theme', color: 'primary' },
          { key: 'special', label: '⭐ Caption Đặc biệt', color: 'secondary' },
          { key: 'decorative', label: '🎨 Decorative by Locket', color: 'accent' },
          { key: 'custome', label: '🎨 Decorative by QQ', color: 'info' },
          { key: 'image_icon', label: '🎨 Caption Icon', color: 'warning' },
          { key: 'image_gif', label: '🎨 Caption Gif', color: 'error' },
        ];
        
        for (const cat of oldMap) {
          if (data && data[cat.key]) {
            migrated.push({
              id: cat.key,
              title: cat.label,
              color: cat.color,
              themeIds: Array.isArray(data[cat.key]) ? data[cat.key] : []
            });
          }
        }
        data = migrated;
      }
      
      setCategories(data || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Theme');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const allIds = new Set();
    categories.forEach(cat => cat.themeIds?.forEach(id => allIds.add(id)));
    
    allIds.forEach(async (id) => {
      if (!themeDetails[id]) {
        try {
          const res = await axios.post('https://locket-api-seven.vercel.app/api/collab/getCaption', { id });
          if (res.data?.caption) {
            setThemeDetails(prev => ({ ...prev, [id]: res.data.caption }));
          }
        } catch (e) {
          // ignore
        }
      }
    });
  }, [categories]);

  const handleAddCategory = () => {
    const title = prompt('Nhập tên Danh mục mới (VD: Sự kiện Tết):');
    if (!title || !title.trim()) return;
    
    const newCategory = {
      id: `cat_${Date.now()}`,
      title: title.trim(),
      color: predefinedColors[categories.length % predefinedColors.length],
      themeIds: []
    };
    
    setCategories([...categories, newCategory]);
  };

  const handleRemoveCategory = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này cùng toàn bộ ID bên trong?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const handleEditCategoryTitle = (id) => {
    const category = categories.find(c => c.id === id);
    const newTitle = prompt('Đổi tên danh mục:', category.title);
    if (newTitle && newTitle.trim()) {
      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, title: newTitle.trim() } : cat
      ));
    }
  };

  const handleAddId = (categoryId) => {
    const id = prompt('Nhập ID Kanade (UUID):');
    if (id && id.trim()) {
      setCategories(categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, themeIds: [...(cat.themeIds || []), id.trim()] } 
          : cat
      ));
    }
  };

  const handleRemoveId = (categoryId, index) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        const newIds = [...(cat.themeIds || [])];
        newIds.splice(index, 1);
        return { ...cat, themeIds: newIds };
      }
      return cat;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = 'https://locket-api-seven.vercel.app/api';
      const token = localStorage.getItem('admin_token');
      await axios.post(`${apiUrl}/admin/themes`, categories, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Đã lưu tất cả thay đổi thành công!');
    } catch (error) {
      toast.error('Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black mb-1">Quản lý Theme Động</h1>
          <p className="text-base-content/60">Quản lý linh hoạt các danh mục và Theme hiển thị trên Web App</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAddCategory} 
            className="btn btn-outline border-base-content/20 hover:bg-base-200 hover:text-base-content rounded-xl"
          >
            <Plus size={20} />
            Thêm Danh mục
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn btn-primary rounded-xl shadow-lg shadow-primary/20"
          >
            {saving ? <span className="loading loading-spinner"></span> : <Save size={20} />}
            Lưu tất cả thay đổi
          </button>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="bg-base-200 rounded-3xl p-12 text-center border border-dashed border-base-content/20">
          <Palette size={48} className="mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold mb-2">Chưa có danh mục nào</h3>
          <p className="opacity-60 mb-6">Nhấn "Thêm Danh mục" để bắt đầu tạo các bộ sưu tập Theme cho Web App.</p>
          <button onClick={handleAddCategory} className="btn btn-primary btn-sm rounded-full px-6">Tạo Danh mục đầu tiên</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-base-100 rounded-3xl shadow-xl border border-base-200 overflow-hidden flex flex-col">
            <div className={`p-4 bg-${cat.color}/10 border-b border-base-200 flex justify-between items-center group`}>
              <h3 className={`font-bold flex items-center gap-2 text-${cat.color}`}>
                <GripVertical size={16} className="opacity-30 cursor-grab" />
                {cat.title}
                <button 
                  onClick={() => handleEditCategoryTitle(cat.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity btn btn-xs btn-ghost btn-circle ml-1"
                >
                  <Edit2 size={12} />
                </button>
              </h3>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleAddId(cat.id)}
                  className={`btn btn-sm btn-circle btn-${cat.color}`}
                  title="Thêm Theme ID"
                >
                  <Plus size={18} />
                </button>
                <button 
                  onClick={() => handleRemoveCategory(cat.id)}
                  className="btn btn-sm btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Xóa Danh mục"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-4 flex-1 space-y-2 min-h-[100px]">
              {!cat.themeIds || cat.themeIds.length === 0 ? (
                <div className="h-full flex items-center justify-center text-base-content/30 italic text-sm py-4">
                  Trống
                </div>
              ) : (
                cat.themeIds.map((id, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-base-200 rounded-xl group transition-all hover:bg-base-300">
                    <div className="flex-1 min-w-0 overflow-hidden flex items-center gap-2">
                      {themeDetails[id] ? (
                        <>
                           <span className="text-xl flex-shrink-0">{themeDetails[id].icon_url}</span>
                           <span className="font-semibold text-sm truncate">{themeDetails[id].text}</span>
                           <code className="text-xs font-mono opacity-40 ml-2 truncate hidden sm:block">{id.split('-')[0]}...</code>
                        </>
                      ) : (
                        <code className="text-xs truncate font-mono opacity-70">{id}</code>
                      )}
                    </div>
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
                        onClick={() => handleRemoveId(cat.id, index)}
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

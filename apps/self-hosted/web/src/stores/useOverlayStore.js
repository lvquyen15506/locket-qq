// stores/useOverlayStore.js
import { create } from "zustand";
import { getAllOverlayCaption, getCollabCaption } from "@/services";
import {
  DEFAULT_CAPTION_IDS,
  DEFAULT_CAPTIONS_DATA,
} from "@/config/defaultCaptions";

const USER_CAPTION_KEY = "Yourcaptions";
const DEFAULT_CACHE_KEY = "DefaultCaptionsCache";

/**
 * Lấy caption mặc định đã cache (fetch từ ID)
 */
const getCachedDefaults = () => {
  try {
    return JSON.parse(localStorage.getItem(DEFAULT_CACHE_KEY) || "[]");
  } catch {
    return [];
  }
};

/**
 * Gộp tất cả caption: user saved + fetched defaults + static defaults
 * Ưu tiên: user > fetched > static (loại trùng id)
 */
const mergeAllCaptions = (userSaved) => {
  const cachedDefaults = getCachedDefaults();
  const all = [...userSaved, ...cachedDefaults];
  // Loại trùng ID, giữ bản đầu tiên
  const seen = new Set();
  const merged = all.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  // Gán cờ isDefault cho tất cả caption thuộc dạng mặc định
  const defaultIds = new Set([
    ...cachedDefaults.map(c => c.id)
  ]);

  return merged.map(c => ({
    ...c,
    isDefault: defaultIds.has(c.id)
  }));
};

export const useOverlayStore = create((set, get) => ({
  // dynamic categories
  captionOverlays: [],
  isLoading: false,
  error: null,

  fetchCaptionOverlays: async () => {
    if (get().captionOverlays.length > 0) return;

    set({ isLoading: true, error: null });

    try {
      const cached = sessionStorage.getItem("captionOverlays");
      if (cached) {
        // IMPORTANT: Temporarily disabled caching to ensure dynamic themes load immediately
        // set({
        //   captionOverlays: JSON.parse(cached),
        //   isLoading: false,
        // });
        // return;
      }

      const result = await getAllOverlayCaption();
      // Expecting result to be an array of categories
      let categories = Array.isArray(result) ? result : [];

      // Backward compatibility if old object format is returned
      if (!Array.isArray(result) && result) {
        categories = [];
        const oldMap = [
          { key: 'background', label: '🎨 Suggest Theme' },
          { key: 'special', label: '⭐ Caption Đặc biệt' },
          { key: 'decorative', label: '🎨 Decorative by Locket' },
          { key: 'custome', label: '🎨 Decorative by QQ' },
          { key: 'image_icon', label: '🎨 Caption Icon' },
          { key: 'image_gif', label: '🎨 Caption Gif' },
        ];
        for (const cat of oldMap) {
          if (result[cat.key] && Array.isArray(result[cat.key])) {
            categories.push({
              id: cat.key,
              title: cat.label,
              themeIds: result[cat.key]
            });
          }
        }
      }

      // Now we have the categories and their themeIds
      // We need to fetch the actual theme details from Kanade API
      const fullCategories = [];
      for (const category of categories) {
        if (!category.themeIds || category.themeIds.length === 0) {
          fullCategories.push({ ...category, items: [] });
          continue;
        }

        const results = await Promise.allSettled(
          category.themeIds.map(async (id) => {
            if (id.startsWith('http')) {
              return {
                id: `url_${id.substring(id.length - 10)}_${Math.random()}`,
                text: "Ảnh",
                icon_url: id,
                colortop: "transparent",
                colorbottom: "transparent",
                color: "#FFFFFF",
                type: "image_icon"
              };
            }
            return await getCollabCaption(id);
          })
        );

        const newCaptions = results
          .filter((r) => r.status === "fulfilled" && r.value)
          .map((r) => {
            const c = r.value;
            return {
              ...c,
              preset_id: c.id,
              preset_caption: c.text,
              icon: c.icon_url,
              color_top: c.colortop,
              color_bottom: c.colorbottom,
              text_color: c.color || "#FFFFFF",
            };
          });

        fullCategories.push({
          ...category,
          items: newCaptions
        });
      }

      sessionStorage.setItem("captionOverlays", JSON.stringify(fullCategories));

      set({
        captionOverlays: fullCategories,
        isLoading: false,
      });
    } catch (err) {
      console.error("Lỗi khi fetch themes:", err);
      set({
        error: err,
        isLoading: false,
      });
    }
  },

  clearCaptionOverlays: () => {
    sessionStorage.removeItem("captionOverlays");
    set({
      captionOverlays: [],
    });
  },

  userCaptions: mergeAllCaptions(
    JSON.parse(localStorage.getItem(USER_CAPTION_KEY) || "[]")
  ),

  fetchDefaultCaptions: async () => {
    if (DEFAULT_CAPTION_IDS.length === 0) return;

    const cached = getCachedDefaults();
    const cachedIds = new Set(cached.map((c) => c.id));

    const idsToFetch = DEFAULT_CAPTION_IDS.filter((id) => !cachedIds.has(id));
    if (idsToFetch.length === 0) return;

    const results = await Promise.allSettled(
      idsToFetch.map((id) => getCollabCaption(id))
    );

    const newCaptions = results
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => r.value);

    if (newCaptions.length > 0) {
      const updatedCache = [...cached, ...newCaptions];
      localStorage.setItem(DEFAULT_CACHE_KEY, JSON.stringify(updatedCache));

      const userSaved = JSON.parse(
        localStorage.getItem(USER_CAPTION_KEY) || "[]"
      );
      set({ userCaptions: mergeAllCaptions(userSaved) });
    }
  },

  fetchKanadeThemes: async () => {
    // Hàm này đã không còn tác dụng vì logic load theme ID đã được chuyển vào fetchCaptionOverlays
    // Giữ lại để tránh lỗi tham chiếu ở nơi khác, hoặc có thể xóa đi.
  },

  loadUserCaptions: () => {
    const saved = JSON.parse(localStorage.getItem(USER_CAPTION_KEY) || "[]");
    set({ userCaptions: mergeAllCaptions(saved) });
  },

  addUserCaptionById: async (captionId) => {
    try {
      const result = await getCollabCaption(captionId);

      if (!result) throw new Error("Caption not found");

      const savedCaptions = JSON.parse(
        localStorage.getItem(USER_CAPTION_KEY) || "[]"
      );

      const updatedSaved = [
        result,
        ...savedCaptions.filter((c) => c.id !== result.id),
      ];

      localStorage.setItem(USER_CAPTION_KEY, JSON.stringify(updatedSaved));
      set({ userCaptions: mergeAllCaptions(updatedSaved) });

      return { success: true };
    } catch (error) {
      console.error("Lỗi khi thêm caption:", error);
      return { success: false, error };
    }
  },

  removeUserCaption: (id) => {
    const savedCaptions = JSON.parse(
      localStorage.getItem(USER_CAPTION_KEY) || "[]"
    );
    const updatedSaved = savedCaptions.filter((c) => c.id !== id);
    localStorage.setItem(USER_CAPTION_KEY, JSON.stringify(updatedSaved));

    set({ userCaptions: mergeAllCaptions(updatedSaved) });
  },

  clearUserCaptions: () => {
    localStorage.removeItem(USER_CAPTION_KEY);
    set({ userCaptions: mergeAllCaptions([]) });
  },
}));

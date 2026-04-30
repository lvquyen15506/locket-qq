import { create } from "zustand";
import { instanceBaseData } from "@/lib/axios.baseData";
import { getAllOverlayCaption, getCollabCaption } from "@/services";
import {
  DEFAULT_CAPTION_IDS,
  DEFAULT_CAPTIONS_DATA,
  KANADE_THEME_IDS,
} from "@/config/defaultCaptions";

const USER_CAPTION_KEY = "Yourcaptions";
const DEFAULT_CACHE_KEY = "DefaultCaptionsCache";

const sortByOrderIndex = (themes) => {
  return [...themes].sort(
    (a, b) => (a.order_index ?? 9999) - (b.order_index ?? 9999)
  );
};

const groupThemesByType = (themes) => {
  const decorative = themes.filter((t) => t.type === "decorative");
  const custome = themes.filter((t) => t.type === "custome");
  const background = themes.filter((t) => t.type === "background");
  const image_icon = themes.filter((t) => t.type === "image_icon");
  const image_gif = themes.filter((t) => t.type === "image_gif");
  const special = themes.filter((t) => t.type === "special");

  return {
    decorative: sortByOrderIndex(decorative),
    custome: sortByOrderIndex(custome),
    background: sortByOrderIndex(background),
    image_icon: sortByOrderIndex(image_icon),
    image_gif: sortByOrderIndex(image_gif),
    special: sortByOrderIndex(special),
  };
};

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
  const all = [...userSaved, ...cachedDefaults, ...DEFAULT_CAPTIONS_DATA];
  // Loại trùng ID, giữ bản đầu tiên
  const seen = new Set();
  const merged = all.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  // Gán cờ isDefault cho tất cả caption thuộc dạng mặc định (dù nó nằm trong userSaved hay cache)
  const defaultIds = new Set([
    ...DEFAULT_CAPTIONS_DATA.map(c => c.id),
    ...cachedDefaults.map(c => c.id)
  ]);

  return merged.map(c => ({
    ...c,
    isDefault: defaultIds.has(c.id)
  }));
};

export const useOverlayStore = create((set, get) => ({
  captionOverlays: {
    decorative: [],
    custome: [],
    background: [],
    image_icon: [],
    image_gif: [],
    special: [],
  },
  isLoading: false,
  error: null,

  fetchCaptionOverlays: async () => {
    // tránh gọi API nhiều lần
    if (get().captionOverlays.decorative.length > 0) return;

    set({ isLoading: true, error: null });

    try {
      // check sessionStorage
      const cached = sessionStorage.getItem("captionOverlays");
      if (cached) {
        set({
          captionOverlays: JSON.parse(cached),
          isLoading: false,
        });
        return;
      }

      const result = await getAllOverlayCaption();
      const grouped = groupThemesByType(result);

      sessionStorage.setItem("captionOverlays", JSON.stringify(grouped));

      set({
        captionOverlays: grouped,
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

  // optional: clear cache khi cần
  clearCaptionOverlays: () => {
    sessionStorage.removeItem("captionOverlays");
    set({
      captionOverlays: {
        decorative: [],
        custome: [],
        background: [],
        image_icon: [],
        image_gif: [],
        special: [],
      },
    });
  },

   /* ===============================
   *  USER CAPTIONS KANADE (LOCAL)
   *  Merge: user saved + fetched defaults + static defaults
   * =============================== */
  userCaptions: mergeAllCaptions(
    JSON.parse(localStorage.getItem(USER_CAPTION_KEY) || "[]")
  ),

  /**
   * Fetch caption mặc định từ DEFAULT_CAPTION_IDS (chạy 1 lần)
   * Kết quả cache vào localStorage để không fetch lại
   */
  fetchDefaultCaptions: async () => {
    if (DEFAULT_CAPTION_IDS.length === 0) return;

    const cached = getCachedDefaults();
    const cachedIds = new Set(cached.map((c) => c.id));

    // Chỉ fetch những ID chưa cache
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

      // Cập nhật UI
      const userSaved = JSON.parse(
        localStorage.getItem(USER_CAPTION_KEY) || "[]"
      );
      set({ userCaptions: mergeAllCaptions(userSaved) });
    }
  },

  /**
   * Tải toàn bộ ID từ KANADE_THEME_IDS cho từng danh mục
   */
  fetchKanadeThemes: async () => {
    try {
      // 1. Tải danh sách ID từ Admin API (Dữ liệu động)
      const adminThemesRes = await instanceBaseData.get("/api/admin/themes").catch(() => null);
      
      // Ưu tiên dùng ID từ Admin API, nếu lỗi thì dùng ID mặc định trong code
      const themeIdsSource = adminThemesRes?.data?.data || KANADE_THEME_IDS;

      // Thu thập tất cả ID cần tải và đánh dấu chúng thuộc danh mục nào
      const idsToFetchMap = {};
      for (const [category, ids] of Object.entries(themeIdsSource)) {
        if (Array.isArray(ids)) {
          ids.forEach(id => {
            idsToFetchMap[id] = category;
          });
        }
      }

      const allIds = Object.keys(idsToFetchMap);
      if (allIds.length === 0) return;

      // 2. Tải các ID này từ API Kanade
      const results = await Promise.allSettled(
        allIds.map((id) => getCollabCaption(id))
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

      if (newCaptions.length > 0) {
        const currentOverlays = get().captionOverlays;
        const updatedOverlays = { ...currentOverlays };
        let hasChanges = false;

        newCaptions.forEach(caption => {
          const category = idsToFetchMap[caption.preset_id];
          if (category && updatedOverlays[category]) {
            const exists = updatedOverlays[category].some(
              c => (c.preset_id === caption.preset_id) || (c.id === caption.preset_id)
            );
            if (!exists) {
              updatedOverlays[category] = [...updatedOverlays[category], caption];
              hasChanges = true;
            }
          }
        });

        if (hasChanges) {
          set({ captionOverlays: updatedOverlays });
          sessionStorage.setItem("captionOverlays", JSON.stringify(updatedOverlays));
        }
      }
    } catch (error) {
      console.error("Lỗi khi fetch Kanade themes:", error);
    }
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
    // Xóa khỏi localStorage (caption mặc định nếu bị xóa khỏi localStorage vẫn sẽ được giữ lại nhờ mergeAllCaptions)
    const savedCaptions = JSON.parse(
      localStorage.getItem(USER_CAPTION_KEY) || "[]"
    );
    const updatedSaved = savedCaptions.filter((c) => c.id !== id);
    localStorage.setItem(USER_CAPTION_KEY, JSON.stringify(updatedSaved));

    // Cập nhật lại UI
    set({ userCaptions: mergeAllCaptions(updatedSaved) });
  },

  clearUserCaptions: () => {
    localStorage.removeItem(USER_CAPTION_KEY);
    // Reset về chỉ còn caption mặc định
    set({ userCaptions: mergeAllCaptions([]) });
  },
}));

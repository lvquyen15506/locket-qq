import { instanceMain } from "@/lib/axios.main";

export const getInfoWeather = async ({lat, lon}) => {
  if (!lat || !lon) {
    console.warn("⚠️ Thieu lat or lon");
    return null;
  }

  try {
    // Backend locket-api-seven.vercel.app hiện tại không hỗ trợ API /api/weatherV2
    // Mock data để tránh lỗi 404 trên Network
    return null;
  } catch (error) {
    console.error("🚨 Lỗi khi gọi getInfoWeather:", error.message);
    return null;
  }
};

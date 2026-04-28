import { instanceMain } from "../lib/axios.main";

export const getCollabCaption = async (captionId) => {
  try {
    const res = await instanceMain.post("/api/collab/getCaption", {
      id: captionId,
    });
    return res.data?.caption || null;
  } catch (error) {
    console.error("🚨 Lỗi khi gọi API proxy:", error.message);
    return null;
  }
};

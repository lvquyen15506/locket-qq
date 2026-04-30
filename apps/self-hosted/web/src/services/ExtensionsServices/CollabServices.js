import axios from "axios";

export const getCollabCaption = async (captionId) => {
  try {
    const res = await axios.post("https://locket-api-seven.vercel.app/api/collab/getCaption", {
      id: captionId,
    });
    return res.data?.caption || null;
  } catch (error) {
    console.error("🚨 Lỗi khi gọi API proxy:", error.message);
    return null;
  }
};

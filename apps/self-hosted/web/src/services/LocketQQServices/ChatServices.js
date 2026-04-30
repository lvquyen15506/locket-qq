import api from "@/lib/axios";

export const GetAllMessage = async ({ timestamp = null, limit = 50 }) => {
  try {
    const res = await api.post("/locket/getAllMessageV2", {
      timestamp: timestamp,
      limit: limit,
    });
    return res.data?.data;
  } catch (err) {
    console.warn("Failed", err);
  }
};

export const getMessagesWithUser = async ({
  messageId, // 👈 uid của người cần lấy message
  conversationId = null,
  withUser = null,
  timestamp = null,
  limit = 100, // Tăng mặc định lên 100
}) => {
  try {
    const res = await api.post("/locket/getMessageWithUserV2", {
      messageId: messageId,
      conversationId: conversationId || messageId,
      with_user: withUser || null,
      timestamp,
      limit: Number(limit), // Gửi limit lên backend dưới dạng số
    });
    return res.data?.data;
  } catch (err) {
    console.warn("Failed", err);
    return null;
  }
};

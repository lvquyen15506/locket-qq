const { instanceFirestore } = require("../../libs");

const getAllMessages = async (idToken, userId, pageToken, limit = 20) => {
  const params = {
    pageSize: limit,
    orderBy: "last_updated desc", // hoặc "updateTime desc"
  };

  if (pageToken) params.pageToken = pageToken;

  try {
    const response = await instanceFirestore.get(
      `/(default)/documents/users/${userId}/conversations`,
      {
        params,
        meta: {
          idToken,
        },
      },
    );
    const documents = response.data.documents || [];
    // Chuẩn hoá dữ liệu Firestore -> plain object
    const conversations = documents.map((doc) => normalizeMessage(doc, userId));

    return {
      messages: conversations,
      nextPageToken: response.data.nextPageToken || null,
    };
  } catch (error) {
    console.error(
      "❌ Lỗi khi lấy mess:",
      error.response?.data || error.message,
    );
    return {
      messages: [],
      nextPageToken: null,
    };
  }
};

const getMessagesWithUser = async ({
  idToken,
  userId,
  conversationId,
  messageId,
  withUser,
  pageToken,
  limit = 50,
}) => {
  const uniqueIds = [...new Set([conversationId, messageId].filter(Boolean))];

  const tryFetch = async (targetConversationId) => {
    const primary = await fetchConversationMessages({
      idToken,
      userId,
      conversationId: targetConversationId,
      pageToken,
      limit,
      withOrderBy: true,
    });

    if (primary.messages.length > 0) return primary;

    const fallback = await fetchConversationMessages({
      idToken,
      userId,
      conversationId: targetConversationId,
      pageToken,
      limit,
      withOrderBy: false,
    });

    return {
      messages: fallback.messages.length ? fallback.messages : primary.messages,
      nextPageToken: fallback.nextPageToken || primary.nextPageToken || null,
      conversationId: targetConversationId,
    };
  };

  for (const candidateId of uniqueIds) {
    const data = await tryFetch(candidateId);
    if (data.messages.length > 0) return data;
  }

  if (withUser) {
    const resolvedConversationId = await resolveConversationIdByWithUser({
      idToken,
      userId,
      withUser,
    });

    if (resolvedConversationId && !uniqueIds.includes(resolvedConversationId)) {
      const data = await tryFetch(resolvedConversationId);
      if (data.messages.length > 0) return data;
    }
  }

  return {
    messages: [],
    nextPageToken: null,
  };
};

const fetchConversationMessages = async ({
  idToken,
  userId,
  conversationId,
  pageToken,
  limit,
  withOrderBy,
}) => {
  const params = {
    pageSize: limit,
  };

  if (withOrderBy) {
    params.orderBy = "created_at desc";
  }

  if (pageToken) {
    params.pageToken = pageToken;
  }

  try {
    const response = await instanceFirestore.get(
      `/(default)/documents/users/${userId}/conversations/${conversationId}/messages`,
      {
        params,
        meta: {
          idToken,
        },
      },
    );

    const documents = response.data.documents || [];
    const messages = documents
      .map((doc) => normalizeConversationMessage(doc, conversationId))
      .filter(Boolean);

    return {
      messages,
      nextPageToken: response.data.nextPageToken || null,
    };
  } catch (error) {
    console.error(
      "❌ Lỗi khi lấy message với user:",
      error.response?.data || error.message,
    );
    return {
      messages: [],
      nextPageToken: null,
    };
  }
};

const resolveConversationIdByWithUser = async ({ idToken, userId, withUser }) => {
  try {
    const response = await instanceFirestore.get(
      `/(default)/documents/users/${userId}/conversations`,
      {
        params: {
          pageSize: 200,
          orderBy: "last_updated desc",
        },
        meta: {
          idToken,
        },
      },
    );

    const docs = response.data.documents || [];

    for (const doc of docs) {
      const fields = doc?.fields || {};
      const members = fields.members?.arrayValue?.values || [];
      const memberList = members
        .map((v) => v?.stringValue)
        .filter(Boolean);
      const docId = doc?.name?.split("/").pop();
      const uid = fields.uid?.stringValue || docId;

      if (uid === withUser || docId === withUser || memberList.includes(withUser)) {
        return uid || docId;
      }
    }

    return null;
  } catch (error) {
    console.error(
      "❌ Lỗi khi resolve conversation by with_user:",
      error.response?.data || error.message,
    );
    return null;
  }
};

function normalizeMessage(doc, user_id) {
  if (!doc || !doc.fields) return null;

  const f = doc.fields;

  const members = f.members?.arrayValue?.values || [];

  const memberList = members.map((v) => v.stringValue);

  const with_user = memberList.find((id) => id !== user_id);

  const latest = f.latest_message?.mapValue?.fields;

  const toSeconds = (ts) =>
    ts ? Math.floor(new Date(ts).getTime() / 1000) : 0;

  return {
    uid: f.uid?.stringValue || doc.name?.split("/").pop(),

    members: memberList,

    unreadCount: parseInt(f.unread_count?.integerValue || "0", 10),

    isRead: f.is_read?.booleanValue || false,

    lastReadAt: toSeconds(f.last_read_at?.timestampValue),

    otherLastReadAt: toSeconds(f.other_last_read_at?.timestampValue),

    lastUpdated: toSeconds(f.last_updated?.timestampValue),

    // 👇 thêm field bị thiếu
    update_time: toSeconds(latest?.created_at?.timestampValue),

    latestMessage: latest
      ? {
        body: latest.body?.stringValue || "",
        sender: latest.sender?.stringValue || "",
        createdAt: toSeconds(latest.created_at?.timestampValue),
        replyMoment: latest.reply_moment?.stringValue || null,
        thumbnailUrl: replaceFirebaseWithCDN(
          latest.thumbnail_url?.stringValue,
        ),
      }
      : null,

    otherLastDeliveredAt: toSeconds(f.other_last_delivered_at?.timestampValue),

    otherLastDeliveredMessageCreatedAt: toSeconds(
      f.other_last_delivered_message_created_at?.timestampValue,
    ),

    with_user,

    createTime: toSeconds(doc.createTime),

    updateTime: toSeconds(doc.updateTime),
  };
}

function normalizeConversationMessage(doc, conversationId) {
  if (!doc || !doc.fields) return null;

  const f = doc.fields;

  const toSeconds = (ts) =>
    ts ? Math.floor(new Date(ts).getTime() / 1000) : 0;

  const parseReactions = (rawReactions) => {
    const values = rawReactions?.arrayValue?.values || [];
    return values
      .map((item) => {
        const fields = item?.mapValue?.fields;
        if (!fields) return null;

        return {
          emoji: fields.emoji?.stringValue || "",
          sender: fields.sender?.stringValue || "",
        };
      })
      .filter(Boolean);
  };

  const body = f.body?.stringValue || "";
  const createdAt = toSeconds(f.created_at?.timestampValue || doc.createTime);
  const updatedAt = toSeconds(doc.updateTime || f.created_at?.timestampValue);

  return {
    id: f.id?.stringValue || f.uid?.stringValue || doc.name?.split("/").pop(),
    uid: conversationId,
    sender: f.sender?.stringValue || "",
    text: body,
    body,
    create_time: createdAt,
    update_time: updatedAt || createdAt,
    reply_moment: f.reply_moment?.stringValue || null,
    thumbnail_url: replaceFirebaseWithCDN(f.thumbnail_url?.stringValue),
    reactions: parseReactions(f.reactions),
  };
}

function replaceFirebaseWithCDN(url) {
  if (!url) return null; // hoặc "" nếu bạn muốn
  return url.replace(
    "https://firebasestorage.googleapis.com",
    "https://cdn.locketcamera.com",
  );
}

module.exports = {
  getAllMessages,
  getMessagesWithUser,
};

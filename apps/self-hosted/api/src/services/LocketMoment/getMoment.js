const { instanceFirestore, instanceLocketV2 } = require("../../libs");

const getLocketMoments = async (
  idToken,
  userId,
  pageToken,
  userUid,
  limit = 20,
) => {
  // 🚀 Ưu tiên lấy từ Locket API nếu là trang đầu (để có ảnh mới nhất)
  if (!pageToken) {
    try {
      const payload = {
        data: {
          limit: limit || 50,
          friend_uid: userUid || null,
        }
      };

      const res = await instanceLocketV2.post("getMomentV2", payload, {
        meta: { idToken }
      });

      const rawMoments = res.data?.result?.data || [];
      if (rawMoments.length > 0) {
        const moments = rawMoments.map(normalizeApiMoment).filter(Boolean);
        return {
          moments,
          nextPageToken: moments.length > 0 ? moments[moments.length - 1].createTime.toString() : null,
        };
      }
    } catch (err) {
      console.warn("⚠️ Không thể lấy ảnh từ Locket API, đang thử Firestore...", err.message);
    }
  }

  // 🏛️ Fallback/Pagination dùng Firestore history
  try {
    let allMoments = [];
    let currentNextPageToken = pageToken;
    let attempts = 0;
    const maxAttempts = userUid ? 5 : 1; 

    do {
      attempts++;
      const currentParams = {
        orderBy: "date desc",
        pageSize: (currentNextPageToken || userUid) ? 100 : limit,
      };
      if (currentNextPageToken) {
        // Kiểm tra nếu là timestamp (từ API) hay là pageToken (từ Firestore)
        if (!isNaN(currentNextPageToken)) {
           // Nếu là timestamp, Firestore listDocuments không hỗ trợ tốt.
           // Tạm thời bỏ qua pageToken và lấy trang đầu tiên của Firestore
        } else {
           currentParams.pageToken = currentNextPageToken;
        }
      }

      const response = await instanceFirestore.get(
        `/locket/documents/history/${userId}/entries`,
        {
          params: currentParams,
          meta: { idToken },
        },
      );

      const documents = response.data.documents || [];
      const pageMoments = documents
        .map((doc) => {
          const moment = normalizeMoment(doc);
          if (userUid && moment?.user !== userUid) return null;
          return moment;
        })
        .filter(Boolean);

      allMoments = allMoments.concat(pageMoments);
      currentNextPageToken = response.data.nextPageToken || null;

      if (allMoments.length > 0 || !currentNextPageToken || attempts >= maxAttempts) {
        break;
      }
    } while (true);

    return {
      moments: allMoments,
      nextPageToken: currentNextPageToken,
    };
  } catch (error) {
    console.error(
      "❌ Lỗi khi lấy moments:",
      error.response?.data || error.message,
    );
    return {
      moments: [],
      nextPageToken: null,
    };
  }
};

function normalizeMoment(doc) {
  if (!doc || !doc.fields) return null;

  const f = doc.fields;
  const overlays = f.overlays?.arrayValue?.values || [];

  // chỉ lấy overlay đầu tiên (nếu có)
  const overlay = overlays[0]?.mapValue?.fields || {};
  const overlayData = overlay.data?.mapValue?.fields || {};

  const backgroundFields = overlayData.background?.mapValue?.fields || {};

  const getIsPublic = (f) => {
    const sentToAll = parseFirestoreValue(f.sent_to_all);
    const sentToSelfOnly = parseFirestoreValue(f.sent_to_self_only);

    // Ưu tiên sent_to_self_only nếu có true
    if (sentToSelfOnly) return false;
    if (sentToAll) return true;
    return false;
  };

  return {
    id: f.canonical_uid?.stringValue || doc.name.split("/").pop(),
    caption: f.caption?.stringValue || overlay.alt_text?.stringValue || "",
    user: f.user?.stringValue || null,
    thumbnailUrl: replaceFirebaseWithCDN(f.thumbnail_url?.stringValue),
    videoUrl: replaceFirebaseWithCDN(f.video_url?.stringValue),
    md5: f.md5?.stringValue || null,
    date: f.date?.timestampValue || doc.createTime || null,
    isPublic: getIsPublic(f),
    overlays: {
      id: overlay.overlay_id?.stringValue || null,
      type: overlay.overlay_type?.stringValue || null,
      text: overlayData.text?.stringValue || null,
      textColor: overlayData.text_color?.stringValue || null,
      maxLines: overlayData.max_lines?.integerValue
        ? parseInt(overlayData.max_lines.integerValue, 10)
        : null,
      background: {
        materialBlur:
          overlayData.background?.mapValue?.fields?.material_blur
            ?.stringValue || null,
        colors: parseFirestoreValue(backgroundFields.colors) || [],
      },
      icon: parseFirestoreValue(overlayData.icon),
      payload: parseFirestoreValue(overlayData.payload),
    },
    createTime: doc.createTime ? new Date(doc.createTime).getTime() : null,
    updateTime: doc.updateTime ? new Date(doc.updateTime).getTime() : null,
  };
}

function replaceFirebaseWithCDN(url) {
  if (!url) return null; // hoặc "" nếu bạn muốn
  return url.replace(
    "https://firebasestorage.googleapis.com",
    "https://cdn.locketcamera.com",
  );
}

function parseFirestoreValue(v) {
  if (!v) return null;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return parseInt(v.integerValue, 10);
  if (v.doubleValue !== undefined) return parseFloat(v.doubleValue);
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.mapValue !== undefined) {
    const fields = v.mapValue.fields || {};
    const obj = {};
    for (const key in fields) {
      obj[key] = parseFirestoreValue(fields[key]);
    }
    return obj;
  }
  if (v.arrayValue !== undefined) {
    return (v.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null;
}

function normalizeApiMoment(item) {
  if (!item) return null;

  return {
    id: item.id || item.canonical_uid || item.canonicalUid || "",
    caption: item.caption || "",
    user: item.user || item.user_uid || item.userUid || null,
    thumbnailUrl: replaceFirebaseWithCDN(
      item.thumbnail_url || item.thumbnailUrl
    ),
    videoUrl: replaceFirebaseWithCDN(item.video_url || item.videoUrl),
    md5: item.md5 || null,
    date: item.date || item.create_time || item.createTime || null,
    isPublic: item.sent_to_all || item.sentToAll || false,
    overlays: item.overlays || null,
    createTime: toNumericTimestamp(item.create_time || item.createTime),
    updateTime: toNumericTimestamp(item.update_time || item.updateTime),
  };
}

function toNumericTimestamp(v) {
  if (!v) return null;
  if (typeof v === "number") return v > 1e12 ? v : v * 1000;
  const ts = new Date(v).getTime();
  return isNaN(ts) ? null : ts;
}

module.exports = {
  getLocketMoments,
};

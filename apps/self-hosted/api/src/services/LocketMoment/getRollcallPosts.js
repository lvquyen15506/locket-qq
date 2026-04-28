const { instanceLocketV2 } = require("../../libs/instanceLocket");

const getRollcallPosts = async (idToken, bodyData) => {
  try {
    const response = await instanceLocketV2.post(
      "/getRollcallPosts",
      bodyData,
      {
        meta: {
          idToken,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Lỗi khi lấy RollcallPosts:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

module.exports = {
  getRollcallPosts,
};

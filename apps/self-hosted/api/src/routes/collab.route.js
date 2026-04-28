const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/getCaption", async (req, res, next) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, message: "Missing caption ID" });
    }

    // Proxy request sang CaptionKanade (Backend to Backend sẽ không bị chặn CORS)
    const response = await axios.post(
      "https://api.captionkanade.site/api/get_captions_id_V2",
      { id },
      {
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://locket-dio.com", // Giả lập Origin để API không từ chối
          "Referer": "https://locket-dio.com/"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("🚨 Proxy Caption Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi lấy caption từ server Kanade",
      error: error.message
    });
  }
});

module.exports = router;

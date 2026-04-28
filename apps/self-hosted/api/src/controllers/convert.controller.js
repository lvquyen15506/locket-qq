const axios = require("axios");
const sharp = require("sharp");
const heicConvert = require("heic-convert");

class ConvertController {
  async convertImage(req, res, next) {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ message: "Missing url parameter" });
      }

      // 1. Tải ảnh từ Firebase/Locket CDN
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const imageBuffer = response.data;

      const lowerUrl = url.toLowerCase();
      let outputBuffer = imageBuffer;

      // 2. Nếu là HEIC/HEIF thì convert sang JPEG trước
      if (lowerUrl.includes(".heic") || lowerUrl.includes(".heif")) {
        outputBuffer = await heicConvert({
          buffer: imageBuffer,
          format: "JPEG",
          quality: 0.8,
        });
      }

      // 3. Nén sang WEBP để tối ưu tốc độ load trên web
      const webpBuffer = await sharp(outputBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      // 4. Trả về cho frontend
      res.set("Content-Type", "image/webp");
      res.set("Cache-Control", "public, max-age=31536000"); // Cache 1 năm trên CDN
      return res.send(webpBuffer);
    } catch (error) {
      console.error("Lỗi khi convert ảnh:", error.message);
      return res.status(500).json({ message: "Lỗi khi convert ảnh" });
    }
  }
}

module.exports = new ConvertController();

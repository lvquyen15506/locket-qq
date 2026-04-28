saoconst axios = require("axios");
const sharp = require("sharp");
const heicConvert = require("heic-convert");

class ConvertController {
  async convertImage(req, res, next) {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ message: "Missing url parameter" });
      }

      const lowerUrl = url.toLowerCase();

      // 1. Tự chủ 100%: Dùng thư viện heic-convert để xử lý HEIC ngay trên Vercel
      if (lowerUrl.includes(".heic") || lowerUrl.includes(".heif")) {
        try {
          const response = await axios.get(url, { responseType: "arraybuffer" });
          const imageBuffer = response.data;

          const outputBuffer = await heicConvert({
            buffer: imageBuffer,
            format: "JPEG",
            quality: 0.6, // Giảm chất lượng xuống một chút để xử lý siêu tốc, tránh timeout Vercel
          });

          const webpBuffer = await sharp(outputBuffer).webp({ quality: 75 }).toBuffer();
          res.set("Content-Type", "image/webp");
          res.set("Cache-Control", "public, max-age=31536000");
          return res.send(webpBuffer);
        } catch (localError) {
          console.error("Lỗi xử lý HEIC cục bộ:", localError.message);
          return res.status(500).json({ message: "Lỗi xử lý ảnh nội bộ" });
        }
      }

      // 2. Nếu là ảnh bình thường (jpg, png) -> Vercel tự xử lý bằng Sharp
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const imageBuffer = response.data;

      const webpBuffer = await sharp(imageBuffer).webp({ quality: 80 }).toBuffer();

      // 3. Trả về cho frontend
      res.set("Content-Type", "image/webp");
      res.set("Cache-Control", "public, max-age=31536000"); // Cache 1 năm
      return res.send(webpBuffer);
    } catch (error) {
      console.error("Lỗi khi convert ảnh:", error.message);
      return res.status(500).json({ message: "Lỗi khi convert ảnh" });
    }
  }
}

module.exports = new ConvertController();

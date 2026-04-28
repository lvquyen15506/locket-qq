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

      const lowerUrl = url.toLowerCase();

      // 1. Tối ưu: Nếu là HEIC/HEIF thì server Vercel (ram 1024mb) rất dễ bị quá tải khi xử lý nhiều ảnh.
      // Giải pháp: Backend ngầm gọi sang API có sẵn để xử lý hộ (giấu hoàn toàn URL với Frontend).
      if (lowerUrl.includes(".heic") || lowerUrl.includes(".heif")) {
        try {
          // Ngầm mượn VPS locket-dio để xử lý nặng
          const dioResponse = await axios.get(
            `https://api.locket-dio.com/api/convert?url=${encodeURIComponent(url)}`,
            { responseType: "arraybuffer", timeout: 15000 }
          );
          
          res.set("Content-Type", "image/webp");
          res.set("Cache-Control", "public, max-age=31536000");
          return res.send(dioResponse.data);
        } catch (proxyError) {
          console.warn("Locket-dio convert failed, falling back to local processing:", proxyError.message);
          
          // Fallback: Tự convert nếu API ngoài sập (có nguy cơ timeout trên Vercel)
          const response = await axios.get(url, { responseType: "arraybuffer" });
          const imageBuffer = response.data;
          
          const outputBuffer = await heicConvert({
            buffer: imageBuffer,
            format: "JPEG",
            quality: 0.8,
          });
          
          const webpBuffer = await sharp(outputBuffer).webp({ quality: 80 }).toBuffer();
          res.set("Content-Type", "image/webp");
          res.set("Cache-Control", "public, max-age=31536000");
          return res.send(webpBuffer);
        }
      }

      // 2. Nếu là ảnh bình thường (jpg, png) -> Vercel tự xử lý nhẹ nhàng
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const imageBuffer = response.data;
      
      const webpBuffer = await sharp(imageBuffer).webp({ quality: 80 }).toBuffer();

      // 3. Trả về cho frontend
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

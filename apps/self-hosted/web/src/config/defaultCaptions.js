/**
 * ============================================
 *  CAPTION MẶC ĐỊNH CHO NGƯỜI DÙNG
 * ============================================
 *
 * File này chứa danh sách caption có sẵn cho tất cả người dùng.
 * Bạn có thể thêm/bớt/sửa caption tại đây.
 *
 * Cách thêm caption mới:
 * 1. Vào https://captionkanade.chisadin.site/ tạo caption
 * 2. Copy ID caption (UUID)
 * 3. Thêm vào mảng DEFAULT_CAPTION_IDS bên dưới
 *
 * Hoặc thêm trực tiếp data vào mảng DEFAULT_CAPTIONS_DATA
 *
 * Cấu trúc mỗi caption:
 * {
 *   id:          "uuid-v4",               // ID duy nhất
 *   text:        "Nội dung caption",       // Text hiển thị
 *   type:        "decorative",             // Loại: decorative | image_gif | image_icon
 *   icon_url:    "😀" hoặc "https://...", // Emoji hoặc URL ảnh/gif
 *   color:       "#ffffff",                // Màu chữ
 *   colortop:    "#FF6B6B",                // Màu gradient trên
 *   colorbottom: "#EE5A24",                // Màu gradient dưới
 * }
 */

// ============================================
// CÁCH 1: Thêm bằng ID (sẽ fetch data từ API CaptionKanade)
// Thêm UUID của caption vào đây, hệ thống sẽ tự lấy data
// ============================================
export const DEFAULT_CAPTION_IDS = [
  "4bb51fee-c96b-4d1f-8c96-76ac958c0b1f",
  "ac2546e2-8e73-4fa4-a1ca-8c2d5700fc80",
  "8fa17715-a399-4071-8ad2-e0f45e7733dc",
  "3788f479-448b-45f9-94e4-cd84ad317977",
  "1a66d2bf-0b18-48dc-94b2-b4a13e72d8d2",
  "1a66d2bf-0b18-48dc-94b2-b4a13e72d8d2",
  "f6d31b96-eaa1-4406-81af-b91b0951bc89",
  "4e632782-1e2e-43db-866d-5b9d3ee046dd"
];

export const DEFAULT_CAPTIONS_DATA = [
  { id: "default-love", text: "I Love You 💕", type: "decorative", icon_url: "❤️", color: "#ffffff", colortop: "#FF6B6B", colorbottom: "#EE5A24" },
  { id: "default-miss-you", text: "Miss You", type: "decorative", icon_url: "🥺", color: "#ffffff", colortop: "#a18cd1", colorbottom: "#fbc2eb" },
  { id: "default-good-morning", text: "Good Morning", type: "decorative", icon_url: "🌅", color: "#ffffff", colortop: "#F7971E", colorbottom: "#FFD200" },
  { id: "default-good-night", text: "Good Night", type: "decorative", icon_url: "🌙", color: "#ffffff", colortop: "#0f0c29", colorbottom: "#302b63" },
  { id: "default-thinking-of-you", text: "Thinking of You", type: "decorative", icon_url: "💭", color: "#ffffff", colortop: "#667eea", colorbottom: "#764ba2" },
  { id: "default-haha", text: "Haha 😂", type: "decorative", icon_url: "😂", color: "#ffffff", colortop: "#f7797d", colorbottom: "#FBD786" },
  { id: "default-chill", text: "Chill vibes~", type: "decorative", icon_url: "🎧", color: "#ffffff", colortop: "#2193b0", colorbottom: "#6dd5ed" },
  { id: "default-selfie", text: "Selfie ✌️", type: "decorative", icon_url: "🤳", color: "#ffffff", colortop: "#ee9ca7", colorbottom: "#ffdde1" },
  { id: "default-bff", text: "Best Friends", type: "decorative", icon_url: "👯", color: "#ffffff", colortop: "#ff9a9e", colorbottom: "#fecfef" },
  { id: "default-happy", text: "Happy Day!", type: "decorative", icon_url: "🎉", color: "#ffffff", colortop: "#f093fb", colorbottom: "#f5576c" },
  { id: "default-coffee", text: "Coffee Time ☕", type: "decorative", icon_url: "☕", color: "#ffffff", colortop: "#3E2723", colorbottom: "#8D6E63" },
  { id: "default-sunset", text: "Sunset 🌇", type: "decorative", icon_url: "🌇", color: "#ffffff", colortop: "#fc4a1a", colorbottom: "#f7b733" },
  { id: "default-gaming", text: "Gaming 🎮", type: "decorative", icon_url: "🎮", color: "#00ff88", colortop: "#1a1a2e", colorbottom: "#16213e" },
  { id: "default-workout", text: "Workout 💪", type: "decorative", icon_url: "💪", color: "#ffffff", colortop: "#0F2027", colorbottom: "#2C5364" },
  { id: "default-rain", text: "Rainy Day 🌧️", type: "decorative", icon_url: "🌧️", color: "#ffffff", colortop: "#4B79A1", colorbottom: "#283E51" },
];

export const KANADE_THEME_IDS = {};


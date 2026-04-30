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
export const DEFAULT_CAPTION_IDS = [];
export const DEFAULT_CAPTIONS_DATA = [];
export const KANADE_THEME_IDS = {};


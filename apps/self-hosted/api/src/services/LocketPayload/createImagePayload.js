const { createBaseImagePayload } = require("./createBasePayload");

const createCaptionOverlay = (caption, options = {}) => {
  const {
    text_color = "#FFFFFF",
    color_top = "transparent",
    color_bottom = "transparent",
    icon = "",
    icon_type = "emoji", // "emoji" hoặc "image"
    overlay_id = "caption",
  } = options;

  const overlay = {
    data: {
      text: caption,
      text_color: text_color,
      type: "static_content",
      max_lines: {
        "@type": "type.googleapis.com/google.protobuf.Int64Value",
        value: "4",
      },
      background: {
        material_blur: "ultra_thin",
        colors: [color_top, color_bottom].filter(c => c !== "transparent"),
      },
    },
    alt_text: caption,
    overlay_id: overlay_id,
    overlay_type: "caption",
  };

  if (icon) {
    overlay.data.icon = {
      type: icon_type,
      data: icon,
    };
  }

  return overlay;
};

// Đăng nền mặc định + caption
exports.imagePostPayloadDefault = ({ imageUrl, optionsData }) => {
  const { caption } = optionsData;
  const data = createBaseImagePayload({ imageUrl, optionsData });

  if (caption?.trim()) {
    data.caption = caption;
    data.overlays.push(
      createCaptionOverlay(caption, {
        text_color: "#FFFFFF",
        color_top: "transparent",
        color_bottom: "transparent",
        overlay_id: "caption",
      })
    );
  }
  return { data };
};

exports.imagePostPayloadDecorative = ({ imageUrl, optionsData }) => {
  const { overlay_id, caption, text_color, color_top, color_bottom, icon } =
    optionsData;
  const data = createBaseImagePayload({ imageUrl, optionsData });

  if (caption?.trim()) {
    data.caption = caption;
    data.overlays.push(
      createCaptionOverlay(caption, {
        text_color,
        color_top,
        color_bottom,
        icon,
        icon_type: "emoji",
        overlay_id: overlay_id === "standard" ? "caption" : `caption:${overlay_id}`,
      })
    );
  }

  return { data };
};

exports.imagePostPayloadCustome = ({ imageUrl, optionsData }) => {
  const { caption, text_color, color_top, color_bottom, icon } = optionsData;
  const data = createBaseImagePayload({ imageUrl, optionsData });

  if (caption?.trim()) {
    data.caption = caption;
    data.overlays.push(
      createCaptionOverlay(caption, {
        text_color,
        color_top,
        color_bottom,
        icon,
        icon_type: "emoji",
        overlay_id: "caption:miss_you",
      })
    );
  }

  return { data };
};

exports.imagePostPayloadIcon = ({ imageUrl, optionsData }) => {
  const { caption, text_color, icon } = optionsData;
  const data = createBaseImagePayload({ imageUrl, optionsData });

  if (caption?.trim()) {
    data.caption = caption;
    data.overlays.push(
      createCaptionOverlay(caption, {
        text_color,
        icon,
        icon_type: "image",
        overlay_id: "caption:ootd",
      })
    );
  }

  return { data };
};
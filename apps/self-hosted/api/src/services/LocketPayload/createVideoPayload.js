const { createBaseVideoPayload } = require("./createBasePayload");

const createCaptionOverlay = (caption, options = {}) => {
  const {
    text_color = "#FFFFFF",
    color_top = "transparent",
    color_bottom = "transparent",
    icon = "",
    icon_type = "emoji",
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

exports.videoPostPayloadDefault = ({ videoUrl, thumbnailUrl, optionsData }) => {
  const { caption } = optionsData;
  const data = createBaseVideoPayload({ videoUrl, thumbnailUrl, optionsData });

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

exports.videoPostPayloadDecorative = ({
  videoUrl,
  thumbnailUrl,
  optionsData,
}) => {
  const { overlay_id, caption, text_color, color_top, color_bottom, icon } =
    optionsData;
  const data = createBaseVideoPayload({ videoUrl, thumbnailUrl, optionsData });

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

exports.videoPostPayloadCustome = ({ videoUrl, thumbnailUrl, optionsData }) => {
  const { caption, text_color, color_top, color_bottom, icon } = optionsData;
  const data = createBaseVideoPayload({ videoUrl, thumbnailUrl, optionsData });

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

exports.videoPostPayloadIcon = ({ videoUrl, thumbnailUrl, optionsData }) => {
  const { caption, text_color, icon } = optionsData;
  const data = createBaseVideoPayload({ videoUrl, thumbnailUrl, optionsData });

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
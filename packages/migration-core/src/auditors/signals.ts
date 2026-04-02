export const supportedBlocks = new Set([
  "core/paragraph",
  "core/heading",
  "core/list",
  "core/quote",
  "core/image",
  "core/gallery",
  "core/embed",
  "core/code",
  "core/separator",
  "core/table"
]);

export const builderSignalMatchers = [
  {
    name: "Elementor",
    type: "builder" as const,
    confidence: 0.95,
    patterns: [/elementor/i, /elementor-widget/i]
  },
  {
    name: "WPBakery / Visual Composer",
    type: "builder" as const,
    confidence: 0.92,
    patterns: [/\[vc_[a-z0-9_]+/i, /wpb_[a-z0-9_]+/i]
  },
  {
    name: "Divi",
    type: "builder" as const,
    confidence: 0.9,
    patterns: [/\[et_pb_[a-z0-9_]+/i, /et_pb_section/i]
  },
  {
    name: "Oxygen Builder",
    type: "builder" as const,
    confidence: 0.88,
    patterns: [/oxygen/i, /ct_section/i]
  },
  {
    name: "Slider Revolution",
    type: "plugin" as const,
    confidence: 0.86,
    patterns: [/\[rev_slider/i]
  },
  {
    name: "Contact Form 7",
    type: "plugin" as const,
    confidence: 0.85,
    patterns: [/\[contact-form-7/i]
  },
  {
    name: "WooCommerce",
    type: "plugin" as const,
    confidence: 0.84,
    patterns: [/\[products/i, /\[woocommerce_/i]
  }
];


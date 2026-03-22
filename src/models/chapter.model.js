import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["audio", "video", "image", "none"],
      default: "none",
    },
    url: {
      type: String,
      validate: {
        validator: function (value) {
          if (this.type && this.type == "none") return true;
          return !!value;
        },
        message: "URL is required for audio, video and image content",
      },
    },
    duration: {
      type: Number, // in seconds
      validate: {
        validator: function (value) {
          if (this.type && (this.type == "none" || this.type == "image"))
            return true;
          return value > 0;
        },
        message:
          "Duration must be greater than 0 seconds for audio and video content",
      },
    },
    text: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { _id: false },
);

const chapterSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: false,
      trim: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    content: contentSchema,
  },
  { timestamps: true },
);

export const Chapter = mongoose.model("Chapter", chapterSchema);

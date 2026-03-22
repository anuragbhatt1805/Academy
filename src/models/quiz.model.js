import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
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
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (val) {
          return val.length >= 2;
        },
        message: "At least 2 options are required",
      },
    },
    answers: {
      type: [String],
      required: true,
      validate: [
        {
          validator: function (val) {
            return val.length >= 1;
          },
          message: "At least one correct answer is required",
        },
        {
          validator: function (val) {
            return val.every((ans) => this.options.includes(ans));
          },
          message: "Answers must be from options",
        },
      ],
    },
    isMultiple: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Question = mongoose.model("Question", questionSchema);

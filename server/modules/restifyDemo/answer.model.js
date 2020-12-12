import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AnswerSchema = mongoose.Schema(
  {
    answer: {
      type: String,
      required: true
    },
    questionDetail: { type: Schema.Types.ObjectId, ref: "questions" },
    question_id: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Answer = mongoose.model("answers", AnswerSchema);

export default Answer;

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const QuestionSchema = mongoose.Schema(
  {
    question: { type: String, required: true },
    answerDetails: {
      answerId: { type: Schema.Types.ObjectId, ref: "answers" } // "1"
      // on populate "answerId" you get object of answer object here related to answerId"
    },
    answerIds: [{ type: Schema.Types.ObjectId, ref: "answers" }] //[1,2,3]
    // on populate "answerIds" you get object of answer object here related to answerId"
  },
  {
    toJSON: {
      virtuals: true
    }
  },
  {
    timestamps: true
  }
);

/** relation apply on basic of parent id saved in answers table */
QuestionSchema.virtual("answers", {
  ref: "answers",
  localField: "_id",
  foreignField: "question_id",
  justOne: false // set true for one-to-one relationship
});

const Question = mongoose.model("questions", QuestionSchema);

export default Question;

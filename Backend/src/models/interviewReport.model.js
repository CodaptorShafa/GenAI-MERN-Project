const mongoose = require('mongoose');


/**
 * job description schema : String
 * resume schema : String
 * self introduction schema : String
 * matchScore : Number
 * Technical questions :[{
 * question : "",
 * intention : "",
 * answer : ""
 * }]
 * Behavioral questions : [{
 * question : "",
 * intention : "",
 * answer : ""
 * }]
 * Skill gaps : [{
 * skill : "",
 * severity : {
 *  type : String,
 * enum : ["low", "medium", "high"]}]}]
 * preparation plan : [{
 *   day : Number,
 *   focus : String,
 * tasks : [{
 *   task : String,
 *   status : {
 *    type : String,
 *    enum : ["not started", "in progress", "completed"]
 *   }
 * }]
 */
const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required']
    },
    intention: {
        type: String,
        required: [true, 'Intention is required']
    },
    answer: {
        type: String,
        required: [true, 'Answer is required']
    }
});
const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required']
    },
    intention: {
        type: String,
        required: [true, 'Intention is required']
    },
    answer: {
        type: String,
        required: [true, 'Answer is required']
    }
});
const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, 'Skill is required']
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"]
    }
});
const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, 'Day is required']
    },
    focus: {
        type: String,
        required: [true, 'Focus is required']
    },
    tasks: [{
        task: {
            type: String,
            required: [true, 'Task is required']
        },
        status: {
            type: String,
            enum:  ["not started", "in progress", "completed"]
        }
    }]
});
const interviewReportSchema = new mongoose.Schema({

  jobDescription: {
    type: String,
    required: [true, 'Job description is required']
  },
  resume: {
    type: String,
    required: [true, 'Resume is required']
  },
  selfIntroduction: {
    type: String,
  },
  matchScore: {
    type: Number,
    min: [0, 'Match score cannot be less than 0'],
    max: [100, 'Match score cannot be greater than 100']
  },
  technicalQuestions: [technicalQuestionSchema],
  behavioralQuestions: [behavioralQuestionSchema],
  skillGaps: [skillGapSchema],
  preparationPlan: [preparationPlanSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });
module.exports = mongoose.model(
    "InterviewReport",
    interviewReportSchema
);
const mongoose = require('mongoose');

const bookTrialSchema = new mongoose.Schema({
  trialType: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility'],
    required: true
  },
  trialDate: {
    type: Date,
    required: true
  },
  trialTime: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: "N/A"
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'staff',
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'member',
    required: true
  },
  relation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relation'
  }
});

bookTrialSchema.index({ createdBy: 1, member: 1, trialType: 1 })

bookTrialSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End Date must be greater than or equal to Start Date');
  }
  next();
});

const BookTrialModel = mongoose.model('BookTrial', bookTrialSchema);
module.exports = BookTrialModel;

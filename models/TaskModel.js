const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  assignmentType: {
    type: String,
    enum: ['assignToPeople', 'assignToRoles'],
    required: true,
  },
  assignees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'staff', // or StaffModel if using staff collection
    }
  ],
  roles: [
    {
      type: String, // e.g., 'Manager', 'Staff'
    }
  ],
  tags: [
    {
      type: String, // e.g., 'Important', 'Urgent'
    }
  ],
  dueDate: {
    type: Date,
    required: true,
  },
  dueTime: {
    type: String, // optional, e.g., "14:30"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'staff', // who created the task
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
}, { timestamps: true });

const TaskModel = mongoose.model('Task', taskSchema);
module.exports = TaskModel
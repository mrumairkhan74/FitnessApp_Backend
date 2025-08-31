const TaskModel = require('../models/TaskModel');
const { StaffModel } = require('../models/Discriminators');
const { NotFoundError } = require('../middleware/error/httpErrors');
const UserModel = require('../models/UserModel');

const createTask = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { title, assignmentType, assignees, roles, tags, dueDate, dueTime, status } = req.body;

        // because we are pushing assignees and assignees is array sometime
        const assigneeIds = Array.isArray(assignees) ? assignees : [assignees];

        // Check staff exist which i assign task
        const staffDocs = await StaffModel.find({ _id: { $in: assigneeIds } });
        if (staffDocs.length !== assigneeIds.length) {
            throw new NotFoundError("One or more staff IDs are invalid");
        }

        // Create task
        const task = await TaskModel.create({
            title,
            assignmentType,
            assignees: assigneeIds,
            roles,
            tags,
            dueDate,
            dueTime,
            status,
            createdBy: userId
        });

        // Push task into each staff’s tasks array
        await StaffModel.updateMany(
            { _id: { $in: assigneeIds } },
            { $push: { tasks: task._id } }
        );

        return res.status(200).json({
            status: true,
            message: "Successfully Assigned",
            task
        });
    } catch (error) {
        next(error);
    }
};


const getTaskByUser = async (req, res, next) => {
    try {
        const userId = req.user?.id; // logged-in user's ID
        const { id } = req.params;   // taskId from route

        // Find task where: by id and checking who create and who is assigned if single one is login from both then he can see task
        const task = await TaskModel.findOne({
            id,
            $or: [
                { createdBy: userId },
                { assignees: userId }
            ]
        })
            .populate('createdBy', 'username firstName lastName role staffRole')
            .populate('assignees', 'username firstName lastName role staffRole');

        if (!task) throw new NotFoundError("Task not found or not authorized");

        return res.status(200).json({
            status: true,
            task
        });
    } catch (error) {
        next(error);
    }
};



const getTask = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || 1)
        const limit = parseInt(req.query.limit || 5);
        const task = await TaskModel.find()
            .populate('assignees', 'username firstName lastName role staffRole')
            .populate('createdBy', 'username firstName lastName role staffRole')

        if (task.length === 0) throw new NotFoundError("No Task Available ");


        const totalTasks = await TaskModel.countDocuments();
        const totalPages = Math.ceil(totalTasks / limit);
        return res.status(200).json({
            status: true,
            message: "All task Below",
            page,
            limit,
            totalTasks,
            totalPages,
            task

        })
    }
    catch (error) {
        next(error)
    }
}


const deleteTask = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params


        const task = await TaskModel.findById(id);
        if (!task) throw new NotFoundError('Invalid Error');

        if (task.createdBy.toString() !== userId) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to delete this task"
            });

        }
        await TaskModel.findByIdAndDelete(id);
        await UserModel.findByIdAndUpdate(userId, {
            $pull: { task: task._id }
        },
            { new: true }
        );
        return res.status(200).json({
            status: true,
            message: "Task Deleted Successfully",
        })
    }
    catch (error) {
        next(error)
    }
}

module.exports = {
    createTask,
    getTaskByUser,
    getTask,
    deleteTask
};

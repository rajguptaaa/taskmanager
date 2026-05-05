const router = require('express').Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const taskQuery = isAdmin ? {} : { assignedTo: req.user._id };
    const now = new Date();

    const [tasks, projects] = await Promise.all([
      Task.find(taskQuery).populate('project', 'name').populate('assignedTo', 'name'),
      isAdmin ? Project.find() : Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] })
    ]);

    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length,
      projects: projects.length
    };

    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');
    const recentTasks = tasks.slice(-5).reverse();

    res.json({ stats, overdueTasks, recentTasks });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

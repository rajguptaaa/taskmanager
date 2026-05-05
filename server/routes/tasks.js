const router = require('express').Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = projectId ? { project: projectId } : {};
    if (req.user.role !== 'admin') query.assignedTo = req.user._id;
    const tasks = await Task.find(query)
      .populate('assignedTo createdBy', 'name email')
      .populate('project', 'name');
    res.json(tasks);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;
    if (!title || !project) return res.status(400).json({ message: 'Title and project required' });
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'admin' && !proj.members.includes(req.user._id) && String(proj.owner) !== String(req.user._id))
      return res.status(403).json({ message: 'Not a project member' });
    const task = await Task.create({ title, description, project, assignedTo, priority, dueDate, createdBy: req.user._id });
    res.status(201).json(await task.populate('assignedTo createdBy project', 'name email'));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });
    const isAdmin = req.user.role === 'admin';
    const isAssigned = String(task.assignedTo) === String(req.user._id);
    if (!isAdmin && !isAssigned) return res.status(403).json({ message: 'Forbidden' });
    if (!isAdmin) { req.body = { status: req.body.status }; }
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo createdBy', 'name email').populate('project', 'name');
    res.json(updated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

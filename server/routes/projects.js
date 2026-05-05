const router = require('express').Router();
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { $or: [{ owner: req.user._id }, { members: req.user._id }] };
    const projects = await Project.find(query).populate('owner members', 'name email');
    res.json(projects);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const project = await Project.create({ name, description, owner: req.user._id, members: members || [] });
    res.status(201).json(await project.populate('owner members', 'name email'));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('owner members', 'name email');
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json(project);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

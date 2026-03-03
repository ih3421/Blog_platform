const express = require('express');
const auth = require('./Authenticate');
const {Post, Comment}= require('./models');
const router = express.Router();

// GET /api/posts - List all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{ {User}: require('./models'), as: 'author' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts - Create post (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const post = await Post.create({
      ...req.body,
      authorId: req.user.id
    });
    await post.reload({ include: [{ {User}: require('./models'), as: 'author' }] });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { {User}: require('./models'), as: 'author' },
        { {Comment}: require('./models'), as: 'comments', 
          include: [{ model: require('./models'), as: 'author' }] }
      ]
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/posts/:id - Update (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id, authorId: req.user.id } });
    if (!post) return res.status(404).json({ error: 'Post not found or unauthorized' });
    
    await post.update(req.body);
    await post.reload({ include: [{ {User}: require('./models'), as: 'author' }] });
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/posts/:id (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id, authorId: req.user.id } });
    if (!post) return res.status(404).json({ error: 'Post not found or unauthorized' });
    await post.destroy();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const comment = await Comment.create({
      ...req.body,
      authorId: req.user.id,
      postId: req.params.id
    });
    await comment.reload({
      include: [
        { {User}: require('./models'), as: 'author' },
        { {Post}: require('./models') }
      ]
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

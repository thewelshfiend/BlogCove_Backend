const express = require("express");

const { rateLimiter } = require("../middlewares/rateLimitMiddleware");
const { createBlogController, readAllBlogsController, readUserBlogsController, editBlogController, deleteBlogController, userBlogCountController } = require("../controllers/blogController");

const router = express.Router();

router.post('/create-blog', rateLimiter, createBlogController);
router.get('/get-blogs', readAllBlogsController);
router.get('/get-my-blogs', readUserBlogsController);
router.get('/blog-count', userBlogCountController);
router.post('/edit-blog', rateLimiter, editBlogController);
router.post('/delete-blog', rateLimiter, deleteBlogController);

module.exports = router;
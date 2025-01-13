const express = require("express");

const { rateLimiter } = require("../middlewares/rateLimitMiddleware");
const { followTargetController, getFollowingsController, getFollowingsIdsController, getFollowersController, unfollowTargetController, followCountController} = require("../controllers/followController");

const router = express.Router();

router.post('/follow-target', rateLimiter, followTargetController);
router.get('/following-list', getFollowingsController);
router.get('/following-ids', getFollowingsIdsController);
router.get('/follower-list', getFollowersController);
router.post('/unfollow-target', rateLimiter, unfollowTargetController);
router.get('/follow-count', followCountController);

module.exports = router;
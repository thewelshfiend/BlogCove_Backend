const { createFollowLink, getFollowingList, getFollowerList, deleteFollowLink, getFollowingCount, getFollowerCount, getFollowingIds } = require("../models/followModel");
const User = require("../models/userModel");

async function followTargetController(req, res) {
    const followingUserId = req.body.targetUserId;
    const followerUserId = req.session.user.userId;

    // Check if follower is in the User database using User.findUser({ key: followerUserId });
    try {
        await User.findUser({ key: followerUserId });
        await User.findUser({ key: followingUserId });
    }
    catch (error) {
        console.log("Error while following");

        return res.send({
            status: 400,
            message: "Following failed",
            error
        });
    }

    try {
        const followDB = await createFollowLink(followerUserId, followingUserId);

        return res.send({
            status: 201,
            message: "Follow successful",
            data: followDB
        });
    }
    catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Database error",
            error
        });
    }
}
async function getFollowingsController(req, res) {
    const userId = req.session.user.userId;
    const SKIP = Number(req.query.skip) || 0;

    try {
        const followingList = await getFollowingList({ userId, SKIP });
        if (followingList.length == 0) {
            return res.send({
                status: 204,
                message: "No followings found"
            });
        }

        return res.send({
            status: 200,
            message: "Following list fetched successfully",
            data: followingList
        });
    }
    catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Database error",
            error
        })
    }
}
async function getFollowingsIdsController(req, res) {
    const userId = req.session.user.userId;

    try {
        const followingIds = await getFollowingIds(userId);
        if (followingIds.length == 0) {
            return res.send({
                status: 204,
                message: "No followings found"
            });
        }

        return res.send({
            status: 200,
            message: "Following IDs fetched successfully",
            data: followingIds
        });
    }
    catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Database error",
            error
        })
    }
}
async function getFollowersController(req, res) {
    const userId = req.session.user.userId;
    const SKIP = Number(req.query.skip) || 0;

    try {
        const followerList = await getFollowerList({ userId, SKIP });
        if (followerList.length == 0) {
            return res.send({
                status: 204,
                message: "No followers found"
            });
        }

        return res.send({
            status: 200,
            message: "Follower list fetched successfully",
            data: followerList
        });
    }
    catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Database error",
            error
        })
    }
}
async function unfollowTargetController(req, res) {
    const followingUserId = req.body.targetUserId;
    const followerUserId = req.session.user.userId;

    if (!followerUserId || !followingUserId) {
        console.log("Error while unfollowing");

        return res.send({
            status: 400,
            message: "Unfollowing failed",
            error: "User missing"
        });
    }

    try {
        const followDB = await deleteFollowLink(followerUserId, followingUserId)

        return res.send({
            status: 200,
            message: "Unfollow successful",
            data: followDB
        })
    }
    catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Database error",
            error
        });
    }
}
async function followCountController(req, res) {
    const userId = req.session.user.userId;

    try {
        let followerCount = await getFollowerCount(userId);
        let followingCount = await getFollowingCount(userId);

        return res.send({
            status: 200,
            message: "Following count fetched successfully",
            data: {
                followers: followerCount,
                following: followingCount
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Database error",
            error
        })
    }
}

module.exports = { followTargetController, getFollowingsController, getFollowingsIdsController, getFollowersController, unfollowTargetController, followCountController };
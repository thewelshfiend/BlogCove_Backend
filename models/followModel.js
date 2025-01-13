const followSchema = require("../schemas/followSchema");
const { LIMIT } = require("../privateConstants");
const userSchema = require("../schemas/userSchema");

function createFollowLink(followerUserId, followingUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            if (String(followerUserId) == String(followingUserId)) {
                return reject("Can't follow yourself");
            }

            const duplicate = await followSchema.findOne({ followerUserId, followingUserId });
            if (duplicate != null) {
                return reject("Can't follow same user again");
            }

            const followObj = followSchema({
                followerUserId,
                followingUserId,
                creationDateTime: Date.now()
            })
            const followDB = await followObj.save();

            resolve(followDB);
        }
        catch (error) {
            reject(error);
        }
    });
}
function getFollowingList({ userId, SKIP }) {
    return new Promise(async (resolve, reject) => {
        try {
            // TO FIND USER DETAILS OF EACH 'FOLLOWING'
            // METHOD 1 (using '$in' operator)
            // /*
            const followingRelations = await followSchema.aggregate([
                { $match: { followerUserId: userId } },
                { $sort: { creationDateTime: -1 } },  // '-1' for descending order. '1' for ascending order.
                { $skip: SKIP },
                { $limit: LIMIT }
            ]);

            const followingIdList = followingRelations.map((relation) => (relation.followingUserId));
            const followingUserList = await userSchema.find({ _id: { $in: followingIdList } });  // '$in' is a MongoDB operator which takes an array of elements and returns documents having the specified field containing any of the elements in the array

            resolve(followingUserList.reverse());  // Reverse to get latest 'following' first
            // */
            // METHOD 2 (using 'populate' method; this is PREFERRED)
            /*
            const followingRelations = await followSchema
                .find({ followerUserId: userId })
                .populate("followingUserId")
                .sort({ creationDateTime: -1 })
                .skip(SKIP)
                .limit(LIMIT);  // Another way of doing multiple queries other than using 'aggregate'

            resolve(followingRelations);
            */
        }
        catch (error) {
            reject(error);
        }
    });
}
function getFollowingIds(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const followingRelations = await followSchema.find({ followerUserId: userId });
            const followingIdList = followingRelations.map((relation) => (relation.followingUserId));

            resolve(followingIdList);
        }
        catch (error) {
            reject(error);
        }
    });
}
function getFollowerList({ userId, SKIP }) {
    return new Promise(async (resolve, reject) => {
        try {
            // Using 'populate' method
            const followerRelations = await followSchema
                .find({ followingUserId: userId })
                .populate("followerUserId")  // Not possible to do this if 'aggregate' is used
                .sort({ creationDateTime: -1 })
                .skip(SKIP)
                .limit(LIMIT);  // Another way of doing multiple queries other than using 'aggregate'
            const followerUserList = followerRelations.map((relation) => (relation.followerUserId));

            resolve(followerUserList);
        }
        catch (error) {
            reject(error);
        }
    });
}
function deleteFollowLink(followerUserId, followingUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            const followDB = await followSchema.findOneAndDelete({
                followerUserId,
                followingUserId
            });

            resolve(followDB)
        }
        catch (error) {
            reject(error);
        }
    });
}
function getFollowingCount(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const following = await followSchema.aggregate([
                { $match: { followerUserId: userId } },
                { $count: "followingCount" }
            ]);

            if (following.length == 0) {
                return resolve(0);
            }
            resolve(following[0].followingCount);
        }
        catch (error) {
            reject(error);
        }
    });
}
function getFollowerCount(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const follower = await followSchema.aggregate([
                { $match: { followingUserId: userId } },
                { $count: "followerCount" }
            ]);

            if (follower.length == 0) {
                return resolve(0);
            }
            resolve(follower[0].followerCount);
        }
        catch (error) {
            reject(error);
        }
    });
}

module.exports = { createFollowLink, getFollowingList, getFollowerList, deleteFollowLink, getFollowingIds, getFollowingCount, getFollowerCount };
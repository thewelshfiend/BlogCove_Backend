const blogSchema = require("../schemas/blogSchema");
const { LIMIT } = require("../privateConstants");
const { getFollowingIds } = require("./followModel");

function createBlog({ title, textBody, userId }) {
    return new Promise(async (resolve, reject) => {
        const blogObj = new blogSchema({
            title,
            textBody,
            creationDateTime: Date.now(),
            userId
        });

        try {
            const blogDB = await blogObj.save();

            resolve(blogDB);
        }
        catch (error) {
            reject(error);
        }
    });
}
function getFollowingBlogs({ userId, SKIP }) {
    return new Promise(async (resolve, reject) => {
        try {
            const followingIdList = await getFollowingIds(userId);

            const followingBlogDB = await blogSchema
                .find({
                    userId: { $in: followingIdList },
                    isDeleted: { $ne: true }
                })
                .populate("userId")
                .sort({ creationDateTime: -1 })
                .skip(SKIP)
                .limit(LIMIT);

            resolve(followingBlogDB);
        }
        catch (error) {
            reject(error);
        }
    });
}
function getFollowingBlogCount(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const followingIdList = await getFollowingIds(userId);

            const followingBlogs = await blogSchema.aggregate([
                {
                    $match: {
                        userId: { $in: followingIdList },
                        isDeleted: { $ne: true }
                    }
                },
                { $count: "followingBlogCount" }
            ]);

            if (followingBlogs.length == 0) {
                return resolve(0);
            }
            resolve(followingBlogs[0].followingBlogCount);
        }
        catch (error) {
            reject(error);
        }
    });
}
function getOtherBlogs({ userId, SKIP }) {
    return new Promise(async (resolve, reject) => {
        try {
            const followingIdList = await getFollowingIds(userId);
            followingIdList.push(userId);

            const otherBlogDB = await blogSchema
                .find({
                    userId: { $nin: followingIdList },
                    isDeleted: { $ne: true }
                })
                .populate("userId")
                .sort({ creationDateTime: -1 })
                .skip(SKIP)
                .limit(LIMIT);

            resolve(otherBlogDB);
        }
        catch (error) {
            reject(error);
        }
    });
}
function getUserBlogs({ SKIP, userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const blogDB = await blogSchema.aggregate([
                {
                    $match: {
                        userId,
                        isDeleted: { $ne: true }  // '$ne' is more efficient than '$eq' in this case since number of deleted blogs will be lesser
                    }  // This is how 2 conditions are checked without using '$and'
                },
                { $sort: { creationDateTime: -1 } },
                { $skip: SKIP },
                { $limit: LIMIT }
            ]);

            resolve(blogDB);
        }
        catch (error) {
            reject(error);
        }
    });
}
function getUserBlogCount(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const userBlogs = await blogSchema.aggregate([
                {
                    $match: {
                        userId,
                        isDeleted: { $ne: true }
                    }
                },
                { $count: "userBlogCount" }
            ]);

            if (userBlogs.length == 0) {
                return resolve(0);
            }
            resolve(userBlogs[0].userBlogCount);
        }
        catch (error) {
            reject(error);
        }
    });
}
function findBlog(blogId) {
    return new Promise(async (resolve, reject) => {
        try {
            const blogDB = await blogSchema.findOne({
                _id: blogId,
                isDeleted: { $ne: true }
            });
            if (!blogDB) {
                return reject(`No blog found with id: ${blogId}`);
            }

            resolve(blogDB);
        }
        catch (error) {
            reject(error);
        }
    });
}
function updateBlogContent({ blogId, title, textBody }) {
    return new Promise(async (resolve, reject) => {
        try {
            const updatedBlogDB = await blogSchema.findOneAndUpdate({ _id: blogId }, {    // This is how to update more than 1 field at once
                title,
                textBody
            },
                {
                    new: true  // Returns the updated document
                });

            resolve(updatedBlogDB);
        }
        catch (error) {
            reject(error);
        }
    });
}
function deleteBlog(blogId) {
    return new Promise(async (resolve, reject) => {
        try {
            await blogSchema.updateOne({ _id: blogId }, {
                isDeleted: true,
                deletionDateTime: Date.now()
            });

            resolve();
        }
        catch (error) {
            reject(error);
        }
    });
}

module.exports = { createBlog, getFollowingBlogs, getFollowingBlogCount, getOtherBlogs, getUserBlogs, getUserBlogCount, findBlog, updateBlogContent, deleteBlog };

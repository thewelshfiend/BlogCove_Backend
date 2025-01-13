const { createBlog, getFollowingBlogs, getUserBlogs, findBlog, updateBlogContent, deleteBlog, getOtherBlogs, getFollowingBlogCount, getUserBlogCount } = require("../models/blogModel");
const User = require("../models/userModel");
const { LIMIT } = require("../privateConstants");
const { blogDataValidator } = require("../utils/blogUtil");

async function createBlogController(req, res) {
    const { title, textBody } = req.body;
    const userId = req.session.user.userId;

    try {
        await blogDataValidator(req.body);
        await User.findUser({ key: userId });
    }
    catch (error) {
        console.log("Error while creating blog");

        return res.send({
            status: 400,
            message: "Failed to create blog",
            error
        });
    }

    try {
        const blogDB = await createBlog({ title, textBody, userId });

        return res.send({
            status: 201,
            message: "Blog created successfully",
            data: blogDB
        });
    }
    catch (error) {
        return res.send({
            status: 500,
            message: "Database error",
            error
        });
    }
}
async function readAllBlogsController(req, res) {
    const SKIP = Number(req.query.skip) || 0;
    const userId = req.session.user.userId;

    try {
        const followingBlogCount = await getFollowingBlogCount(userId);
        let blogDB;
        const followingBlogDB = await getFollowingBlogs({ userId, SKIP }) || [];
        
        if (followingBlogDB.length < LIMIT) {
            const newSKIP = Math.max(SKIP - followingBlogCount, 0);
            const otherBlogDB = await getOtherBlogs({ userId, SKIP: newSKIP });

            blogDB = followingBlogDB.concat(otherBlogDB);
        }

        if (blogDB && blogDB.length == 0) {
            return res.send({
                status: 204,
                message: "No blogs found"
            });
        }

        return res.send({
            status: 200,
            message: "All blogs read successfully",
            data: blogDB || followingBlogDB
        });
    }
    catch (error) {
        console.log("Error while fetching all blogs");
        console.log(error);

        return res.send({
            status: 500,
            message: "Database error",
            error
        });
    }
}
async function readUserBlogsController(req, res) {
    const SKIP = Number(req.query.skip) || 0;
    const userId = req.session.user.userId;

    try {
        const blogDB = await getUserBlogs({ SKIP, userId });
        if (blogDB.length == 0) {
            return res.send({
                status: 204,
                message: "No user blogs found"
            });
        }

        return res.send({
            status: 200,
            message: "User blogs read successfully",
            data: blogDB
        });
    }
    catch (error) {
        console.log("Error while fetching user blogs");

        return res.send({
            status: 500,
            message: "Database error",
            error
        });
    }
}
async function editBlogController(req, res) {
    const { title, textBody } = req.body.data;
    const blogId = req.body.blogId;
    const userId = req.session.user.userId;

    try {
        await blogDataValidator({ title, textBody });
        await User.findUser({ key: userId });
    }
    catch (error) {
        console.log("Error while editing blog");

        return res.send({
            status: 400,
            message: "Failed to edit blog",
            error
        });
    }

    try {
        const blogDB = await findBlog(blogId);

        if (String(userId) != String(blogDB.userId)) {
            return res.send({
                status: 403,
                message: "Unauthorized"
            });
        }

        const timeDiff = (Date.now() - blogDB.creationDateTime) / (1000 * 60);
        if (timeDiff > 30) {
            return res.send({
                status: 400,
                message: "Cannot edit blog after 30 minutes of creation"
            });
        }

        const updatedBlogDB = await updateBlogContent({ blogId, title, textBody });

        return res.send({
            status: 200,
            message: "Blog updated successfully",
            data: updatedBlogDB
        });
    }
    catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Database error",
            error: error
        });
    }
}
async function deleteBlogController(req, res) {
    const blogId = req.body.blogId;
    const userId = req.session.user.userId;

    try {
        const blogDB = await findBlog(blogId);

        if (String(userId) != String(blogDB.userId)) {
            return res.send({
                status: 403,
                message: "Unauthorized"
            });
        }

        await deleteBlog(blogId);

        return res.send({
            status: 200,
            message: "Blog deleted successfully",
            data: blogDB
        });
    }
    catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Database error",
            error: error
        });
    }
}
async function userBlogCountController(req, res) {
    const userId = req.session.user.userId;

    try {
        const userBlogCount = await getUserBlogCount(userId);

        return res.send({
            status: 200,
            message: "User blog count fetched successfully",
            data: userBlogCount
        });
    }
    catch (error) {
        console.log("Error while fetching user blog count");
        console.log(error);

        return res.send({
            status: 500,
            message: "Database error",
            error
        });
    }
}

module.exports = { createBlogController, readAllBlogsController, readUserBlogsController, userBlogCountController, editBlogController, deleteBlogController };
const cron = require("node-cron");

const blogSchema = require("./schemas/blogSchema");

async function scheduler() {
    console.log("Running trash cleaner...");

    try {
        const deletedBlogs = await blogSchema.find({ isDeleted: true });

        if (deletedBlogs.length > 0) {  // Checks if there are any deleted blogs
            const deletedBlogIDs = [];
            deletedBlogs.map((blog) => {
                const timeDiff = (parseInt(Date.now() - blog.deletionDateTime) / (1000 * 60 * 60 * 24));
                if (timeDiff > 30) {  // Collects IDs of blogs that have reached 30-Day time limit
                    deletedBlogIDs.push(blog._id);  // Not doing deletions here since too many DB calls. Instead, push all IDs into an array and delete them all at once.
                }
            });

            if (deletedBlogIDs.length > 0) {  // Checks if there are blogs that have reached 30-Day time limit
                const deletions = await blogSchema.deleteMany({ _id: { $in: deletedBlogIDs } });
                console.log(`${deletions.deletedCount} blog(s) removed from trash`);
            }
        }
    }
    catch (error) {
        console.log(error);
    }
}

function cleanUpTrash() {
    cron.schedule("0 0 * * *", scheduler);  // Runs every day at 00:00:00
}

module.exports = cleanUpTrash;
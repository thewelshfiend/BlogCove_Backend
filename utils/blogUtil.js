function blogDataValidator({ title, textBody }) {
    return new Promise((resolve, reject) => {
        if (!title || !textBody) {
            return reject("Blog data missing");
        }

        if (typeof title != "string") {
            return reject("Title has to be text");
        }
        else if (typeof textBody != "object" && typeof textBody.join(" ") != "string") {
            return reject("Body has to be text");
        }

        const bodyLength = textBody.reduce((acc, line) => (acc + line.length), 0);
        if (title.length < 3 || title.length > 100) {
            return reject("Title should be between 3 and 100 characters");
        }
        else if (bodyLength.length < 5 || bodyLength.length > 1000) {
            return reject("Body should be between 5 and 1000 characters");
        }

        resolve();
    });
}

module.exports = { blogDataValidator };
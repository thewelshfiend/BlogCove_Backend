const accessSchema = require("../schemas/accessSchema");

async function rateLimiter(req, res, next) {
    const sid = req.session.id;

    try {
        const accessDB = await accessSchema.findOne({ sessionId: sid });

        if (!accessDB) {
            const accessObj = new accessSchema({
                sessionId: sid,
                lastRequestTime: Date.now()
            });
            await accessObj.save();

            next();
            return;
        }

        const timeInterval = Number(((Date.now() - accessDB.lastRequestTime) / (1000)).toFixed(2));
        if (timeInterval < 1) {
            console.log("Too many API hits");
            return res.send({
                status: 429,
                message: "Too many requests. Please wait."
            });
        }
        else {
            await accessSchema.updateOne(
                { sessionId: sid },
                { lastRequestTime: Date.now() }
            );
            next();
        }
    }
    catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Internal server error",
            error
        });
    }
}

module.exports = { rateLimiter };
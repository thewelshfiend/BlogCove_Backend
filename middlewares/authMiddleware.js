function isAuth(req, res, next) {
    if (!req.session.isAuth) {
        return res.send({
            status: 401,
            message: "Session expired. Please login again."
        });
    }

    next();
}

module.exports = { isAuth };
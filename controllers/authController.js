const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const accessSchema = require("../schemas/accessSchema");
const { userDataValidator } = require("../utils/authUtil");

async function registerController(req, res) {
    const { email, username } = req.body;

    try {
        await userDataValidator(req.body);
        await User.duplicateUserChecker(email, username);
    }
    catch (error) {
        console.log("Error while validating user data during sign-up");
        return res.send({
            status: 400,
            message: "Failed to create user",
            error
        });
    }

    try {
        const userObj = new User(req.body);
        const userDB = await userObj.registerUser();

        return res.send({
            status: 201,
            message: "User created successfully"
        });
    }
    catch (error) {
        console.log("Error while creating user");
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error
        });
    }
}
async function loginController(req, res) {
    const { loginId, password } = req.body;
    if (!loginId || !password) {
        return res.send({
            status: 400,
            message: "User data missing"
        });
    }

    let userDB;
    try {
        userDB = await User.findUser({ key: loginId });
    }
    catch (error) {
        console.log(error);
        if (error == "User not found") {
            return res.send({
                status: 400,
                message: "User not found"
            });
        }
        return res.send({
            status: 500,
            message: "Internal server error",
            error
        });
    }

    try {
        const isMatch = await bcrypt.compare(password, userDB.password);
        if (!isMatch) {
            return res.send({
                status: 400,
                message: "Incorrect password"
            });
        }

        req.session.isAuth = true;
        req.session.user = {
            userId: userDB._id,
            email: userDB.email,
            username: userDB.username
        };

        return res.send({
            status: 200,
            message: "Login successful",
            loginTime: Date.now(),
            data: {
                name: userDB.name,
                email: userDB.email,
                username: userDB.username
            }
        });
    } catch (error) {
        console.log(error);

        return res.send({
            status: 500,
            message: "Internal server error",
            error
        });
    }
}
async function logoutController(req, res) {
    try {
        await accessSchema.deleteOne({ sessionId: req.session.id });
        req.session.destroy();

        return res.send({
            status: 200,
            message: "Logout successful"
        });
    }
    catch (error) {
        console.log(err);
        return res.send({
            status: 500,
            message: "Internal server error",
            error: err
        });
    }
}

module.exports = { registerController, loginController, logoutController };
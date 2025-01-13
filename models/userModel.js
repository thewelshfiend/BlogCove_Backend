const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");  // 'mongodb' is installed as a dependency of 'mongoose'

const userSchema = require("../schemas/userSchema");

class User {    // Class-based DB calls
    constructor({ name, email, username, password }) {
        this.name = name;
        this.email = email;
        this.username = username;
        this.password = password;
    }

    registerUser() {
        return new Promise(async (resolve, reject) => {
            const hashedPassword = await bcrypt.hash(this.password, Number(process.env.SALT));
            const userObj = new userSchema({
                name: this.name,
                email: this.email,
                username: this.username,
                password: hashedPassword
            });

            try {
                const userDB = await userObj.save();
                resolve(userDB);
            }
            catch (error) {
                reject(error);
            }
        });
    }

    static duplicateUserChecker(email, username) {
        return new Promise(async (resolve, reject) => {
            try {
                const userDB = await userSchema.findOne({   // MongoDB operator '$or' used to check 2 conditions in 1 DB call with OR logic
                    $or: [
                        { username },
                        { email }
                    ]
                });

                if (userDB) {
                    if (email == userDB.email && username == userDB.username) {
                        return reject("Email and Username already exist");
                    }
                    else if (email == userDB.email) {
                        return reject("Email already exists");
                    }
                    else if (username == userDB.username) {
                        return reject("Username already exists");
                    }
                }
                resolve();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    static findUser({ key }) {
        return new Promise(async (resolve, reject) => {
            try {
                if(!key) {
                    return reject("Search key missing");
                }
                const userDB = await userSchema.findOne({   // MongoDB operator '$or' used to check 2 conditions in 1 DB call
                    $or: [
                        ObjectId.isValid(key) ?     // Only if the 'key' is a valid 'ObjectId' (can be in string data type), search using it under '_id' field, else consider it as a 'username' or 'email'
                            { _id: key } :
                            { username: key }, { email: key }
                    ]
                }).select("+password");     // Selecting 'password' field to be fetched. If more fields are hidden and want to be fetched: .select("+password +PAN")

                if (!userDB) {
                    return reject("User not found");
                }
                resolve(userDB);
            }
            catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = User;
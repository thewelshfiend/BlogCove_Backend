function emailValidator(email) {
    return (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.toLowerCase()));
}
function passwordValidator(password) {
    return (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-])[A-Za-z\d#?!@$%^&*-]{8,}$/.test(password));
}
function userDataValidator({ name, email, username, password }) {
    return new Promise((resolve, reject) => {
        if (!email || !username || !password) {
            return reject("User data missing");
        }

        if (typeof name != "string") {
            return reject("Name has to be text");
        }
        else if (typeof email != "string") {
            return reject("Email has to be text");
        }
        else if (typeof username != "string") {
            return reject("Username has to be text");
        }
        else if (typeof password != "string") {
            return reject("Password has to be text");
        }

        if (!emailValidator(email)) {
            return reject("Email is not valid");
        }
        else if (username.length < 3 || username.length > 50) {
            return reject("Username should be between 3 and 50 characters");
        }
        else if (username.includes(" ")) {
            return reject("Username can't contain spaces");
        }
        else if (emailValidator(username)) {
            return reject("Username can't be an email");
        }
        else if (!passwordValidator(password)) {
            return reject("Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character");
        }

        resolve();
    });
}

module.exports = { emailValidator, passwordValidator, userDataValidator };
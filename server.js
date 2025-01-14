const express = require("express");
const clc = require("cli-color");
const cors = require("cors");
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);

// File imports
const db = require("./config/database");  // Import it here to connect
const cleanUpTrash = require("./cron");
const { isAuth } = require("./middlewares/authMiddleware");
const authRouter = require("./routers/authRouter");
const blogRouter = require("./routers/blogRouter");
const followRouter = require("./routers/followRouter");

// Constants
const app = express();
const PORT = process.env.PORT || 8000;
const store = new mongoStore({
    uri: process.env.MONGO_URI,
    collection: "sessions"
});

// Middlewares
const allowedOrigins = [process.env.REACT_URL, 'http://localhost:5173'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true // Allow credentials to be sent
}));
// Handle preflight requests REMOVE IF NOT NEEDED
app.options('*', cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,  // Session will expire after 1 hour from login if not re-sent
        secure: true,
        // httpOnly: true,
        sameSite: "none"
    }
}));

// APIs
app.get("/", (req, res) => {
    res.send({
        status: 200,
        message: "Server is running"
    });
})
app.get('/debug', (req, res) => {
    console.log("Cookies: ", req.cookies);
    res.json(req.cookies);
});
app.use('/auth', authRouter);
app.use('/blog', isAuth, blogRouter);  // using isAuth here protects all requests coming via this router
app.use('/follow', isAuth, followRouter);

app.listen(PORT, () => {
    console.log(clc.blueBright(`Server is running at: PORT${PORT}`));
    cleanUpTrash();  // Calling it here is preferred
});
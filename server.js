const express = require("express");
const clc = require("cli-color");
const cors = require("cors");
const path = require("path");
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
// app.use(express.static(path.join(__dirname, "Frontend", "dist")));
const allowedOrigins = ['https://blog-cove-frontend.vercel.app'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true, // Allow credentials to be sent
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
        sameSite: 'lax'
    }
}));

// APIs
app.get("/", (req, res) => {
    res.send({
        status: 200,
        message: "Server is running"
    });
})
app.use('/auth', authRouter);
app.use('/blog', isAuth, blogRouter);  // using isAuth here protects all requests coming via this router
app.use('/follow', isAuth, followRouter);

app.listen(PORT, () => {
    console.log(clc.blueBright("Server is running at: " + clc.underline(`http://localhost:${PORT}`)));
    cleanUpTrash();  // Calling it here is preferred
});
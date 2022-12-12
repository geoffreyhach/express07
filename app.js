require("dotenv").config();
const express = require("express");
const {
    hashPassword,
    verifyPassword,
    verifyToken,
    verifyUser,
} = require("./auth.js");
const movieHandlers = require("./movieHandlers");
const userHandlers = require("./userHandlers");

const app = express();

app.use(express.json());

const port = process.env.APP_PORT ?? 5000;

const welcome = (req, res) => {
    res.send("Welcome to my favourite movie list");
};

//public routes
app.get("/", welcome);
app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);
app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);
app.post(
    "/api/login",
    userHandlers.getUserByEmailWithPasswordAndPassToNext,
    verifyPassword
);
app.post("/api/users", hashPassword, userHandlers.postUser);

// private routes
app.use(verifyToken);
app.put("/api/users/:id", verifyUser, userHandlers.updateUser);
app.delete("/api/users/:id", verifyUser, userHandlers.deleteUser);
app.post("/api/movies", movieHandlers.postMovie);
app.put("/api/movies/:id", movieHandlers.updateMovie);
app.delete("/api/movies/:id", movieHandlers.deleteMovie);

app.listen(port, (err) => {
    if (err) {
        console.error("Something bad happened");
    } else {
        console.log(`Server is listening on ${port}`);
    }
});

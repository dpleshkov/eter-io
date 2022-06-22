const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    return res.render("index");
});

app.get("/singleplayer", (req, res) => {
    return res.render("singleplayer");
});

app.listen(port, () => {
    console.log(`Site listening on http://localhost:${port}`);
});
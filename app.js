import express from "express";
import morgan from "morgan";
import pg from "pg";
import axios from "axios";
import 'dotenv/config'

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/translate", async (req, res) => {
    const address = req.body.text;
    console.log(address);
    // axios request to google api
    try {
        var response = await axios.get( 
            `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_GEOCODE_API_KEY}`
        );
    } catch (error) {
        console.error(error);
    }
    res.render("index.ejs", { 
        location: JSON.stringify(response.data.results[0].geometry.location)
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});
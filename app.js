import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3001;

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); // loads your .env file

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// export default pool;

// db.connect()
//     .then(() => console.log("Connected to the database"))
// ---------------------------------------------------------------


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Get route for the home page
app.get("/", async (req, res) => {
    try {

        // Getting a random insult from an API
            // const response = await axios.get("https://evilinsult.com/generate_insult.php");
            // const response = await axios.get("https://v2.jokeapi.dev/joke/Any?type=single");

        // Getting a random joke from the my database
        const response = await pool.query ("SELECT joke FROM roast ORDER BY RANDOM() LIMIT 1");
        // console.log(response.rows[0].joke);
        res.render("index.ejs", { content: response.rows[0].joke});

        // console.log(response.data)
        // res.render("index.ejs", {content: response.data})
    } catch (error) {
        res.render("index.ejs", { content: null });
    }
})
// ----------------------------------------------------------------


// Get route for creating a new roast page
app.get("/create", async (req, res) => {
    res.render("create.ejs");
})

// Post route to save created insult to the created_roast database
app.post("/create-roast", async (req, res) => {
    const createdInsult = req.body.createdInsult;
    console.log(createdInsult);
    try {
        // Check if the insult is already in the database
        const checkInsult = await pool.query("SELECT * FROM roast WHERE joke = $1", [createdInsult]);
        if (checkInsult.rows.length > 0) {
            console.log("Insult already exists in the database.");
            return res.redirect("/create");
        }
        // Insert the insult into the database
        const addInsult = await pool.query("INSERT INTO created_roast (joke) VALUES ($1)", [createdInsult]);
        const addIntoRoastDB = await pool.query("INSERT INTO roast (joke) VALUES ($1)", [createdInsult]);
        res.redirect("/");
    } catch (error) {
        console.error("Error saving insult to the database:", error);
        res.status(500).send("Error saving insult");
    }
})
// ----------------------------------------------------------------


// Post route to save the insult to the databaseS
app.post("/save", async (req, res)=>{
    const insult = req.body.insult;
    console.log(insult); 
    try {
        // Check if the insult is already in the database
        const checkInsult = await pool.query("SELECT * FROM roast WHERE joke = $1", [insult]);
        if (checkInsult.rows.length > 0) {
            console.log("Insult already exists in the database.");  
            return res.redirect("/");
        }
        // Insert the insult into the database
        const addInsult = await pool.query("INSERT INTO roast (joke) VALUES ($1)", [insult]);
} catch (error) {
        console.error("Error saving insult to the database:", error);
        res.status(500).send("Error saving insult");
    }
    res.redirect("/");
})
// ----------------------------------------------------------------



// app.get("/", async (req, res) => {
//     try{
//         const response = await axios.get("https://evilinsult.com/generate_insult.php");
//         console.log(response.data);
//         res.render("index.ejs", {content: response.data})

//     }catch(error){
//         res.render("index.ejs", {content: null});
    
//     }
    
// })


app.listen(port, () => {
    console.log(`Server Opened at port ${port}`)
})
let http = require("http");
let path = require("path");
let express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const { response } = require("express");
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');
const config = {
    api_key: '513744a9155ceb13925e4ef3070bc5ce',
    api_base_url: 'https://api.themoviedb.org/3/',
    image_base_url: 'https://image.tmdb.org/t/p/w1280'
}

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') })  

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const databaseName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;

const uri = `mongodb+srv://${userName}:${password}@cluster0.3wgej.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const BASE_URL = config.api_base_url
const API_KEY = config.api_key

async function getTopMovies(page = 1) {
    let data = []
    try {
        const response = await axios.get(`${config.api_base_url}movie/top_rated?api_key=${config.api_key}&page=${page}`)
        const responseData = await response.data
        data = responseData?.results
    } catch (error) {
        console.log(error);
    }
    console.log(data)
    return data
}

let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

http.createServer(app).listen(5000);

app.get("/", async (request, response) => {
    await getTopMovies();
    response.type('.html')
    response.render("index");
});

app.get("/review", (request, response) => {
    response.type('.html')
    response.render("review");
});

// app.post("") {
//     try {

//     } catch {

//     } finally {
//         client.close()
//     }
// }


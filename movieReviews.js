let http = require("http");
let path = require("path");
let express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const { response } = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') })  

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const databaseName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;

const uri = `mongodb+srv://${userName}:${password}@cluster0.3wgej.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

http.createServer(app).listen(5000);

app.get("/", (request, response) => {
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


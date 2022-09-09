let http = require("http");
let path = require("path");
let express = require("express");
let alert = require('alert'); 
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

require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })

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
    return data
}

async function getMovie(title) {
    let data = []
    try {
        const response = await axios.get(`${config.api_base_url}search/movie?api_key=${config.api_key}&query=${title}&page=1`)
        const responseData = await response.data
        data = responseData?.results
    } catch (error) {
        console.log(error);
    }
    return data
}

let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

http.createServer(app).listen(process.env.PORT || 80);

app.get("/", async (request, response) => {
    response.type('.html')
    response.render("index");
});

app.get("/submit", (request, response) => {
    response.type('.html')
    let variables = {errors: "", name: "", title: "", score: "", textarea: ""};
    response.render("submit_review", variables);
});

app.post("/review", async (request, response) => {
    try {
        await client.connect();
        const data = await getMovie(request.body.title)
        if(data[0]!=null && data[0].title == request.body.title) {
            let review = {reviewerName: request.body.name,
                filmTitle: request.body.title,
                score: request.body.score,
                review: request.body.review
            };
            await client.db(databaseName).collection(collectionName).insertOne(review);
            count = await client.db(databaseName).collection(collectionName).countDocuments();
            if(count %10==1) {
                count = count.toString() + "st"
            } else if(count %10==2) {
                count = count.toString() + "nd"
            } else if (count %10==3) {
                count = count.toString() + "rd"
            } else {
                count = count.toString() + "th"
            }
            variables = {
                count: count
            }
            response.type('.html')
            response.render("submit_confirm", variables);
        } else {
            let counter = 0;
            let message = ""
            while(counter < 3) {
                if(data[counter] == null && counter == 0) {
                    message += "No close matches found."
                    break
                } else if(data[counter] != null && counter == 0){ 
                    message += "Try one of these close matches\n"
                    message += ("<br>" + (counter+1).toString() + ". " + data[counter].title);
                } else if(data[counter] != null) {
                    message += ("<br>" + (counter+1).toString() + ". " + data[counter].title);
                } else {
                    break
                }
                counter +=1
            }
            let variables = {errors: "Title must be an exact!<br>"  + message + "<br><br>", name: request.body.name, title: request.body.title, score: request.body.score, textarea: request.body.review};
            response.type('.html')
            response.render("submit_review", variables);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.get("/reviews", (request, response) => {
    response.type('.html');
    response.render("movie_review_search");
});

app.post("/findReview", async (request, response) => {
    try {
        await client.connect();
        let filter = {filmTitle : request.body.title};
        let result = await client.db(databaseName).collection(collectionName).find(filter);
        let arr = await result.toArray();
        
        let table = "";

        if(arr.length != 0) {
            table += "<table border='1'>"
            table += "<tr><th>Name</th>";
            table += "<th>Review</th>";
            table += "<th>Rating</th></tr>";
            arr.forEach(element => {
                table += ("<tr><td>" + element.reviewerName + "</td><td>" + element.review + "</td><td>" + element.score + "</td></tr>");
            });
            
            
            table += "</table>"
           
        } else {
            table += "No reviews for this movie found";
        }
        variables = {
            title: request.body.title,
            table: table
        }
        response.type('.html');
        response.render("movie_reviews", variables);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

});

app.get("/search", (request, response) => {
    response.type('.html')
    response.render("movie_db_search", {errors: ""});
});

app.post("/movieDetails", async (request, response) => {
    let firstMovie = await getMovie(request.body.title)
    firstMovie = firstMovie[0]
    if (firstMovie == null) {
        response.render("movie_db_search", {errors: "Movie not found!"});
    } else {
        let foundMovie = {
            title: firstMovie.title,
            release_date: firstMovie.release_date,
            image: config.image_base_url + firstMovie.poster_path,
            synopsis: firstMovie.overview
        }
        response.type('.html');
        response.render("movie_db_details", foundMovie);
    }
});

app.get("/topMovies", async (request, response) => {
    response.type('.html')
    let topMovies = await getTopMovies();
    let movieTable = `<table border="1">
    <tr>
        <th>Title</th>
        <th>Release Date</th>
        <th>Score</th>
    </tr>`;

    topMovies.forEach(movie => movieTable +=
        `<tr>
            <td>${movie.title}</td>
            <td>${movie.release_date}</td>
            <td>${movie.vote_average}</td>
        </tr>`);
    movieTable += '</table>';

    let topList = {
        movieTable: movieTable
    }
    response.render("topMovies", topList);
});

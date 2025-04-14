const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const express = require('express');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


app.use(cors());


app.get('/movie/', async (req, res) => {
  const movie = await fetchNthMovie(daysPassedSince("2025-04-12") + 1);
  const daysPassed = daysPassedSince("2025-04-12") + 1;

  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  res.json({movie, daysPassed});
});


app.get('/movies/:title', async (req, res) => {
  const title = req.params.title;
  const movies = await searchMovieByTitle(title);
  res.json(movies);
});





function daysPassedSince(dateString, timeZone = 'EET') {
  const givenDate = new Date(dateString);
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
  });

  const formatDate = (date) => {
      const parts = formatter.formatToParts(date);
      const year = parts.find(p => p.type === 'year').value;
      const month = parts.find(p => p.type === 'month').value;
      const day = parts.find(p => p.type === 'day').value;
      return new Date(`${year}-${month}-${day}T00:00:00Z`);
  };

  const givenMidnight = formatDate(givenDate);
  const nowMidnight = formatDate(now);

  // Calculate the difference in days
  const diffTime = nowMidnight - givenMidnight;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}


  
  async function fetchNthMovie(n) {
    try {
      await client.connect();
      const database = client.db("movies");
      const collection = database.collection("moviedata");
      
      const movie = await collection.find().sort({ _id: 1 }).skip(n - 1).limit(1).toArray();
      console.log(movie[0].tagline);
      
      return movie[0];
    } catch (error) {
      console.error("Error fetching nth movie:", error);
    } finally {
      await client.close();
    }
  }

  async function searchMovieByTitle(title) {
    try {
      await client.connect();
      const database = client.db("movies");
      const collection = database.collection("moviedata");
      let movies = await collection.find({ title: { $regex: title, $options: 'i' } }).toArray();
      //limit the results to 10 movies
      if (movies.length > 10) {
        movies = movies.slice(0, 10);
      }

      return movies;
    }catch (error) {
      console.error("Error searching movie by title:", error);
    }
  }
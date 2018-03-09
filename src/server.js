require('dotenv').config();
import express from 'express';
import logger from 'morgan';
import urlRegex from 'url-regex';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 8000;

app.use(logger('dev'));

app.get('/api', (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Welcome to url shortner microservice',
  });
});

app.get('/api/:url(\\S+)', (req, res, next) => {
  const { url } = req.params;
  const shortenedUrls = {};
  const googleUrlShortner = `https://www.googleapis.com/urlshortener/v1/url?key=${process.env.API_KEY}`;
  
  // Check if valid url and if it's not in shortenedUrls cache
  if (urlRegex({ exact: true}).test(url) && !shortenedUrls[url]) {
    // make post request to google url shortner api service
    return axios.post(googleUrlShortner, {longUrl: url})
      .then((data) => {
        shortenedUrls[url] = data.data.id;
        return res.status(200).json({
          originalUrl: url,
          shortUrl: shortenedUrls[url],
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: 'Error',
          message:'Error shortening url',
        });
      });
  }

  // Check if it's valid url and in cache
  if (urlRegex({ exact: true, strict: true }).test(url) && shortenedUrls[url]) {
    return res.status(200).json({
      originalUrl: url,
      shortUrl: shortenedUrls[url],
    });
  }  
  
  return res.status(400).json({
    status: 'Error',
    message: 'Bad request, invalid url.',
  });

});

app.listen(port, () => { console.log(`Server listening on port: ${port}`)});

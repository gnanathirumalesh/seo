const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Use the Heroku-assigned port or 3000 for local development

app.use(express.json());

// Use CORS middleware to allow cross-origin requests
app.use(cors());

app.get('/api/extract', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract relevant information
    const data = {
      title: $('title').text(),
      description: $('meta[name="description"]').attr('content'),
      keywords: $('meta[name="keywords"]').attr('content'),
      author: $('meta[name="author"]').attr('content'),
      ogTitle: $('meta[property="og:title"]').attr('content'),
      ogDescription: $('meta[property="og:description"]').attr('content'),
      ogImage: $('meta[property="og:image"]').attr('content'),
      canonicalURL: $('link[rel="canonical"]').attr('href'),
      h1Tags: [],
      h2Tags: [],
    };

    $('h1').each((index, element) => {
      data.h1Tags.push($(element).text());
    });

    $('h2').each((index, element) => {
      data.h2Tags.push($(element).text());
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching and parsing the webpage.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

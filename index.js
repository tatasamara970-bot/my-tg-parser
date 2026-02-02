const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

app.get('/parse', async (req, res) => {
  const { username, startDate, endDate } = req.query;
  const url = `https://t.me/s/${username.replace('@', '')}`;
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    const posts = [];
    $('.tgme_widget_message').each((i, el) => {
      const time = $(el).find('time').attr('datetime');
      if (time) {
        const pDate = new Date(time);
        if (pDate >= new Date(startDate) && pDate <= new Date(endDate)) {
          posts.push({
            date: time,
            text: $(el).find('.tgme_widget_message_text').text().trim() || "Медиа",
            views: $(el).find('.tgme_widget_message_views').text(),
            link: $(el).find('.tgme_widget_message_date').attr('href')
          });
        }
      }
    });
    res.json({ success: true, posts });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

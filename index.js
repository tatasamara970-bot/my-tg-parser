const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

app.get('/parse', async (req, res) => {
  const { username, startDate, endDate } = req.query;
  try {
    const response = await axios.get(`https://t.me/s/${username.replace('@', '')}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36' }
    });
    const $ = cheerio.load(response.data);
    const posts = [];

    $('.tgme_widget_message').each((i, el) => {
      const time = $(el).find('time').attr('datetime');
      if (time && new Date(time) >= new Date(startDate) && new Date(time) <= new Date(endDate)) {
        
        const viewsText = $(el).find('.tgme_widget_message_views').text() || "0";
        let reactionsCount = 0;
        
        // Собираем все реакции под постом
        $(el).find('.tgme_widget_message_inline_reaction').each((i, r) => {
          const count = $(r).find('.tgme_widget_message_inline_reaction_count').text();
          reactionsCount += parseK(count);
        });

        posts.push({
          date: time,
          text: $(el).find('.tgme_widget_message_text').text().trim() || "Медиа",
          views: parseK(viewsText),
          reactions: reactionsCount,
          forwards: parseK($(el).find('.tgme_widget_message_forward_count').text()),
          link: $(el).find('.tgme_widget_message_date').attr('href')
        });
      }
    });
    res.json({ success: true, posts });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

function parseK(txt) {
  if (!txt) return 0;
  let clean = txt.replace(/[^0-9.K]/g, '');
  if (clean.includes('K')) return parseFloat(clean) * 1000;
  return parseFloat(clean) || 0;
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

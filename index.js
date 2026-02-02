const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

app.get('/parse', async (req, res) => {
  const { username, startDate, endDate } = req.query;
  try {
    const response = await axios.get(`https://t.me/s/${username.replace('@', '')}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(response.data);
    const posts = [];

    $('.tgme_widget_message').each((i, el) => {
      const date = $(el).find('time').attr('datetime');
      if (date && new Date(date) >= new Date(startDate) && new Date(date) <= new Date(endDate)) {
        
        // Считаем реакции
        let reactions = 0;
        $(el).find('.tgme_widget_message_inline_reaction').each((i, r) => {
          const val = $(r).find('.tgme_widget_message_inline_reaction_count').text();
          reactions += parseK(val);
        });

        posts.push({
          date,
          text: $(el).find('.tgme_widget_message_text').text().trim() || "Медиа",
          views: parseK($(el).find('.tgme_widget_message_views').text()),
          reactions: reactions,
          forwards: parseK($(el).find('.tgme_widget_message_forward_count').text()),
          link: $(el).find('.tgme_widget_message_date').attr('href')
        });
      }
    });
    res.json({ success: true, posts });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

function parseK(t) {
  if (!t) return 0;
  let v = t.replace(/[^0-9.K]/g, '');
  if (v.includes('K')) return parseFloat(v) * 1000;
  return parseFloat(v) || 0;
}

app.listen(process.env.PORT || 10000);

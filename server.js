const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const keys = require('./jadwalbola-71802ffd8c26.json');

const app = express();
app.use(bodyParser.json());

const client = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: client });
const spreadsheetId = '1NlqQ7hXlrmWHz5s9oLQ1w2P1CEG5B9T5V_UKYHTKQ1M';

// Endpoint GET untuk baca data
app.get('/sheet', async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'MYSTERY CARD'
    });
    res.json(result.data.values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint POST untuk tambah data
app.post('/sheet', async (req, res) => {
  const { userId, token, pilihan, hasil, gambarDipilih } = req.body;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'MYSTERY CARD',
      valueInputOption: 'RAW',
      resource: {
        values: [[new Date().toISOString(), userId, token, pilihan, hasil, gambarDipilih]]
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('API jalan di http://localhost:3000');
});

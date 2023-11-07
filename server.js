const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static('public')); // index.html muss sich im Ordner public befinden
app.use(express.json());

// Endpoint zum Lesen der JSON-Daten
app.get('/api/data', (req, res) => {
  fs.readFile('quiz.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint zum Hinzufügen neuer Fragen und Antworten
app.post('/api/add', (req, res) => {
  if (!req.body || !req.body.name || !req.body.text) {
    res.status(400).json({ error: 'Bad Request: Name and Text are required fields.' });
    return;
  }

  fs.readFile('quiz.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const jsonData = JSON.parse(data);
    const newEntry = {
      name: req.body.name,
      text: req.body.text,
      answers: req.body.answers,
    };

    jsonData.questions.push(newEntry);

    fs.writeFile('quiz.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json({ success: true });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

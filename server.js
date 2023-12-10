const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

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

    // Erhöhe lastID um eins und setze die neue ID für jede Antwort
    // jsonData.lastID += 1;
    req.body.answers.forEach(answer => {
      answer.id = (jsonData.lastID);
      jsonData.lastID += 1;
    });

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

// Endpoint zum Löschen einer Frage anhand des Namens
app.delete('/api/delete/:name', (req, res) => {
  const questionNameToDelete = req.params.name;

  fs.readFile('quiz.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const jsonData = JSON.parse(data);
    const updatedQuestions = jsonData.questions.filter(question => question.name !== questionNameToDelete);

    if (jsonData.questions.length !== updatedQuestions.length) {
      // Es wurde mindestens eine Frage gefunden und gelöscht
      jsonData.questions = updatedQuestions;

      // Speichere die aktualisierten Daten in der JSON-Datei
      fs.writeFile('quiz.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
        }
        res.json({ success: true });
      });
    } else {
      res.status(404).json({ error: 'Frage nicht gefunden' });
    }
  });
});

// Endpoint zum Aktualisieren aller Daten in der JSON-Datei
app.put('/api/updateAll', (req, res) => {
  if (!req.body || !req.body.lastID || !req.body.questions) {
    res.status(400).json({ error: 'Bad Request: lastID and questions are required fields for updating all data.' });
    return;
  }

  let currentID = 0; 

  const updatedData = {
    lastID: currentID,
    questions: [],
  };

  // Iteriere über alle Fragen
  req.body.questions.forEach((question) => {
    const updatedQuestion = {
      name: question.name,
      text: question.text,
      answers: [],
    };

    // Setze die Id für jede Antwort in aufsteigender Reihenfolge
    question.answers.forEach((answer) => {
      updatedQuestion.answers.push({
        id: currentID++,
        text: answer.text,
        points: answer.points,
        correct: answer.correct,
        percentage: answer.percentage,
      });
    });

    // Füge die aktualisierte Frage zum updatedData hinzu
    updatedData.questions.push(updatedQuestion);
    // Aktualisiere lastID basierend auf der Id der letzten Antwort
    const lastAnswerId = updatedQuestion.answers.length - 1;
    updatedData.lastID += lastAnswerId + 1;
  });

  fs.writeFile('quiz.json', JSON.stringify(updatedData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json({ success: true });
  });
});




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

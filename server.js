const fs = require('fs');

function addEntry(entry) {
    // Lade die vorhandenen Einträge aus der JSON-Datei
    const filePath = path.join(__dirname, 'menu.json');
    let entries = [];

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        entries = JSON.parse(data);
    } catch (err) {
        // Wenn die Datei nicht existiert oder nicht gelesen werden kann, erstelle ein leeres Array
        entries = [];
    }

    // Füge den neuen Eintrag hinzu
    entries.push(entry);

    // Schreibe die aktualisierte Liste in die JSON-Datei
    fs.writeFileSync(filePath, JSON.stringify(entries));

    return entries;
}

app.post('/addEntry', (req, res) => {
    const entry = req.body.entry;
    const updatedEntries = addEntry(entry);

    res.send('Eintrag wurde hinzugefügt');
});

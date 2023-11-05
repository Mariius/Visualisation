function newElement(event) {
    event.preventDefault();
    var el = document.getElementById("el");
    var inputValue = el.value; 
    var elementeList = document.getElementById("elemente");
    elementeList.innerHTML += `<li>${inputValue}</li>`;
    el.value = ""; 
}

// Lese die JSON-Datei ein
fetch('./quiz.json')
    .then(response => response.json())
    .then(data => {
        // Verarbeite die JSON-Daten und füge sie in die HTML-Seite ein
        const jsonContent = document.getElementById('json-content');

        // Beginne mit der Darstellung der Fragen und Antworten
        let html = '<h1>Quiz</h1>';
        data.questions.forEach((question, index) => {
            html += `<h2>${question.name}</h2>`;
            html += `<p>${question.text}</p>`;
            
            html += '<ul>';
            question.answers.forEach(answer => {
                html += `<li>${answer.text} (Punkte: ${answer.points}, Korrekt: ${answer.correct ? 'Ja' : 'Nein'}, Prozent: ${answer.percentage}%)</li>`;
            });
            html += '</ul>';
        });

        // Füge den HTML-Code zur Seite hinzu
        jsonContent.innerHTML = html;
    })
    .catch(error => console.error('Fehler beim Laden der JSON-Datei', error));

function newElement(event) {
    event.preventDefault();
    var el = document.getElementById("el");
    var inputValue = el.value; 
    var elementeList = document.getElementById("elemente");
    elementeList.innerHTML += `<li>${inputValue}</li>`;
    el.value = ""; 
}

// function displayJSON() {
//     fetch('https://github.com/Mariius/Visualisation/blob/master/quiz.json') // Passe die URL auf den Pfad deiner JSON-Datei an
//         .then(response => response.json())
//         .then(data => {
//             const jsonContent = document.getElementById('json-content');
//             jsonContent.textContent = JSON.stringify(data, null, 2); // Schöne Darstellung des JSON-Inhalts
//         })
//         .catch(error => {
//             console.error('Fehler beim Abrufen der JSON-Datei:', error);
//         });
// }

// displayJSON();
// import data from "./quiz.json" assert {type: "json"};
// console.log(data);

// Lese die JSON-Datei ein
// Lese die JSON-Datei ein
// fetch('./quiz.json')
//     .then(response => response.json())
//     .then(data => {
//         // Verarbeite die JSON-Daten
//         const jsonContent = document.getElementById('json-content');
//         const questions = data.questions;

//         // Iteriere durch die Fragen
//         questions.forEach(question => {
//             const questionElement = document.createElement('div');
//             questionElement.innerHTML = `<strong>${question.name}</strong>: ${question.text}`;

//             // Erstelle eine Liste der Antworten für jede Frage
//             const answersList = document.createElement('ul');
//             question.answers.forEach(answer => {
//                 const answerItem = document.createElement('li');
//                 answerItem.innerHTML = `${answer.text} (Punkte: ${answer.points}, Korrekt: ${answer.correct})`;
//                 answersList.appendChild(answerItem);
//             });

//             // Füge die Liste der Antworten zur Frage hinzu
//             questionElement.appendChild(answersList);

//             // Füge die Frage zur HTML-Seite hinzu
//             jsonContent.appendChild(questionElement);
//         });
//     })
//     .catch(error => console.error('Fehler beim Laden der JSON-Datei', error));

// Lese die JSON-Datei ein
// fetch('./quiz.json')
//     .then(response => response.json())
//     .then(data => {
//         // Verarbeite die JSON-Daten und füge sie in die HTML-Seite ein
//         const jsonContent = document.getElementById('json-content');

//         const question = data.questions;

//         questions.forEach(question => {
//             const quesEl=document.createElement('div');
//             quesEl.innerHTML = `<strong>${ques.name}</strong>: ${question.text}`;

//             const answersList = document.createElement('ul');
//             question.answers.forEach(answer => {
//                 const answerItem = document.createElement('li');
//                 answerItem.innerHTML = `${answer.text} (Punkte: ${answer.points}, Korrekt: ${answer.correct})`;
//                 answersList.appendChild(answerItem);

//             });  
//             quesEl.appendChild(answersList); 
            
//             jsonContent.appendChild(quesEl);

//         });
       
        
       
//     })
//     .catch(error => console.error('Fehler beim Laden der JSON-Datei', error));

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

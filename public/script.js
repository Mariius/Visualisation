// --------------------load json data, add data to the json file -----------------------------------------------------------------------------------------------------------------
//const dataList = document.getElementById('data-table');
const myQuestions = new Map();
const questions = new Map();// hold all data from JSON-file an store it here

const bodyTree = document.getElementById('bodytree');

// Funktion zum Laden der JSON-Daten und Anzeigen als Liste

function loadData() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        data.questions.forEach(question => {
          const listItem = document.createElement('li');
          listItem.style.alignSelf= 'center'; // Question werden in der Mitte horizontalisch angezeigt
          const questionLink = document.createElement('a');
          questionLink.href = `#${question.name}`;
          questionLink.textContent = question.name;
          questionLink.id= "questionLink"; // damit kann in css file darauf zugreifen 

          // Mouseover für die Frage

          const questionText = document.createElement('span'); // Zusätzliche Textfläche für die Frage
          questionText.style.display = 'none'; // Anfangs unsichtbar
          questionText.textContent = question.text;
          questionText.classList.add('infoQuestion');
          listItem.appendChild(questionText);

          questionLink.addEventListener('mouseover', () => {
            //questionText.style.display = 'inline'; // Zeige den Text bei mouseover
            setTimeout(()=>{ questionLink.textContent= question.text; } ,300)
          });

          // Mouseout für die Frage

          questionLink.addEventListener('mouseout', () => {
            //questionText.style.display = 'none';
            setTimeout(()=>{ questionLink.textContent= question.name; } ,300)
          });
           
          
          const innerList = document.createElement('ul');

          question.answers.forEach(answer => {
              const innerListItem = document.createElement('li');
              const responseLink = document.createElement('a');
              responseLink.href = `#${answer.id}`;
              responseLink.textContent = answer.text;

              // Mouseover für die Antwort

              const answerText = document.createElement('span'); // Zusätzliche Textfläche für die Antwort
              answerText.style.display = 'none'; // Anfangs unsichtbar
              answerText.innerHTML = `Points: ${answer.points}, <br>correct: ${answer.correct}, <br>Percentage: ${answer.percentage}%`;
              answerText.classList.add('infoAnswer');
              innerListItem.appendChild(answerText);

              responseLink.addEventListener('mouseover', () => {
                answerText.style.display = 'inline'; // Zeige den Text bei mouseover
              });

              // Mouseout für die Antwort
              responseLink.addEventListener('mouseout', () => {
                  answerText.style.display = 'none';
              });

              innerListItem.appendChild(responseLink);
              innerList.appendChild(innerListItem);
          });

          listItem.appendChild(questionLink);
          listItem.appendChild(innerList);
          bodyTree.appendChild(listItem);

          // to show details in the lower part
          var details = document.getElementById("questionResponses");
          
          questionLink.addEventListener('click', ()=>{

            var contentContainers = document.querySelectorAll('.inhalt_recht');
            contentContainers.forEach(function (container) {
              container.style.display = 'none';
            });
            
            // Entferne den alten Tabelleninhalt
            var oldTable = details.querySelector('table');
            if (oldTable) {
                details.removeChild(oldTable);
            }

            details.style.display = "flex";

            var tab = document.createElement("table");
            tab.id = "tab_D";
            
            var rowD = tab.insertRow();
            var cellD = rowD.insertCell();
            cellD.innerHTML =`<h3>${question.name}: ${question.text}<h3>`;

            var count = 1;
            question.answers.forEach(answer => {

              var rowD0 = tab.insertRow();
              var cellD0 = rowD0.insertCell();
              cellD0.innerHTML = `respone ${count}:  ${answer.text}`;

              var rowD1 = tab.insertRow();
              var cellD1 = rowD1.insertCell();
              cellD1.innerHTML = `correct:  ${answer.correct}`;

              var rowD2 = tab.insertRow();
              var cellD2 = rowD2.insertCell();
              cellD2.innerHTML = `points:  ${answer.points}`;
              
              var rowD3 = tab.insertRow();
              var cellD3 = rowD3.insertCell();
              cellD3.innerHTML = `percentage:  ${answer.percentage}% <hr>`;
              count++;

            }); 

            var rowDelEd = tab.insertRow();
            var cellEd = rowDelEd.insertCell();
            cellEd.style.title = "edit the Question";
            cellEd.innerHTML = `<i class="fa fa-edit" style="font-size:24px"></i>`;
            cellEd.addEventListener('mouseover', () => {
              cellEd.style.color = "blue";
            });
            cellEd.addEventListener('mouseout', () => {
              cellEd.style.color = "black";
            });

            var cellClose = rowDelEd.insertCell();
            cellClose.innerHTML = `<button onclick="hideContent('tab_D')">close</button>`;
            

            var cellDel = rowDelEd.insertCell();
            cellDel.innerHTML = `<i class="fa fa-trash" style="font-size:24px"></i>`;
            cellDel.addEventListener('click', () => {
              deleteQuestion(question.name);
            });
            cellDel.addEventListener('mouseover', () => {
              cellDel.style.color = "red";
            });
            cellDel.addEventListener('mouseout', () => {
              cellDel.style.color = "black";
            });

            
            details.appendChild(tab);

          });

        });
    });
}



// console.log(myQuestions);

const form = document.getElementById("dataForm");
const messageDiv = document.getElementById("message");
const newQ = document.getElementById("newQuestion");
const startR1 = document.getElementById("start");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const questionName = document.getElementById("questionName").value;
  const questionText = document.getElementById("questionText").value;
  const answer1Text = document.getElementById("answer1Text").value;
  const answer1Points = parseInt(document.getElementById("answer1Points").value);
  const answer1Correct = document.getElementById("answer1Correct").checked;
  const answer1Percentage = parseInt(document.getElementById("answer1Percentage").value);
  const answer2Text = document.getElementById("answer2Text").value;
  const answer2Points = parseInt(document.getElementById("answer2Points").value);
  const answer2Correct = document.getElementById("answer2Correct").checked;
  const answer2Percentage = parseInt(document.getElementById("answer2Percentage").value);
  const answer3Text = document.getElementById("answer3Text").value;
  const answer3Points = parseInt(document.getElementById("answer3Points").value);
  const answer3Correct = document.getElementById("answer3Correct").checked;
  const answer3Percentage = parseInt(document.getElementById("answer3Percentage").value);

  const newData = {
    "name": questionName,
    "text": questionText,
    "answers": [
      {
        "id": 0,
        "text": answer1Text,
        "points": answer1Points,
        "correct": answer1Correct,
        "percentage": answer1Percentage 
      },
      {
        "id": 1,
        "text": answer2Text,
        "points": answer2Points,
        "correct": answer2Correct,
        "percentage": answer2Percentage 
      },
      {
        "id": 2,
        "text": answer3Text,
        "points": answer3Points,
        "correct": answer3Correct,
        "percentage": answer3Percentage 
      }
    ]
  };


  fetch('/api/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newData),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        document.getElementById("questionName").value = '';
        document.getElementById("questionText").value = '';
        document.getElementById("answer1Text").value = '';
        document.getElementById("answer1Points").value = '';
        document.getElementById("answer1Correct").checked = false;
        document.getElementById("answer2Text").value = '';
        document.getElementById("answer2Points").value = '';
        document.getElementById("answer2Correct").checked = false;
        document.getElementById("answer3Text").value = '';
        document.getElementById("answer3Points").value = '';
        document.getElementById("answer3Correct").checked = false;
        loadData();
        const done = document.createElement('p');
        done.textContent = `the question ${questionName} was added successfuly`;
        messageDiv.appendChild(done);

        setTimeout(function () {
          messageDiv.style.display = "none";
          newQ.style.display = "none";
          startR1.style.display = "flex";
        }, 100); // 10000 Millisekunden (10 Sekunden)

      }
      else {
        const failled = document.createElement('p');
        failled.textContent = `the question ${questionName} could not be added`;
        messageDiv.appendChild(failled);


        setTimeout(function () {
          messageDiv.style.display = "none";
          newQ.style.display = "none";
          startR1.style.display = "flex";
        }, 100); // 10000 Millisekunden (10 Sekunden)

      }
    });

});

// Initial laden der Daten
loadData();

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function showContent(contentId) {
  // Alle Inhaltscontainer ausblenden
  var contentContainers = document.querySelectorAll('.inhalt_recht');
  contentContainers.forEach(function (container) {
    container.style.display = 'none';
  });

  // Den ausgewählten Inhalt anzeigen
  var selectedContent = document.getElementById(contentId);
  selectedContent.style.display = 'block';
}

function hideContent(contentId) {
  
  var selectedContent = document.getElementById(contentId);
  selectedContent.style.display = 'none';
  startR1.style.display = "flex";
}

// cellEd.addEventListener('click', ()=>{

// });

function deleteQuestion(questionName) {
  fetch(`/api/delete/${encodeURIComponent(questionName)}`, {
      method: 'DELETE',
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`Fehler beim Löschen der Frage: ${response.status}`);
      }
      return response.json();
  })
  .then(result => {
      console.log('Frage erfolgreich gelöscht:', result);
      // Hier kannst du weitere Aktionen nach dem Löschen durchführen
      var contentContainers = document.querySelectorAll('.upper');
      contentContainers.forEach(function (container) {
        container.style.display = 'none';
      });
      loadData();
  })
  .catch(error => {
      console.error('Fehler beim Löschen der Frage:', error);
  });
}


// function newElement(event) {
//     event.preventDefault();
//     var el = document.getElementById("el");
//     var inputValue = el.value; 
//     var elementeList = document.getElementById("elemente");
//     elementeList.innerHTML += `<li>${inputValue}</li>`;
//     el.value = ""; 
// }

// --------------------load json data, add data to the json file -----------------------------------------------------------------------------------------------------------------
//const dataList = document.getElementById('data-table');
const myQuestions = new Map();
const questions = new Map();// hold all data from JSON-file an store it here

// Funktion zum Laden der JSON-Daten und Anzeigen als Liste
var tbl = document.getElementById('data-table');
tbl.style.width = '100%';
//tbl.setAttribute('border', '1');
tbl.setAttribute('borderRadius', '20px');
var tbdy = document.createElement('tbody');
tbl.appendChild(tbdy);

function loadData() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {

      data.questions.forEach(question => {

        //tabelle Elemente erstellen 
        var tablerow = document.createElement('tr');
        var tabledivision = document.createElement('td');
        tabledivision.id= "tbCellSelector"; 
        var buttonItem = document.createElement('button');
        buttonItem.id = question.name;
        buttonItem.textContent = `${question.name}`; // Fragebezeichnung als Textinhalt jede Zelle zuweisen
        tabledivision.appendChild(buttonItem);
        tablerow.appendChild(tabledivision);
        tbdy.appendChild(tablerow);
        // The Mouse over some Question will change the style
        tablerow.onmouseover = function () {
          tabledivision.textContent = `${question.text}`;
          tabledivision.style.backgroundColor = "skyblue";
        }
        
        // The Style will return to the initial style
        tablerow.onmouseleave = function () {
          tabledivision.textContent = `${question.name}`;
          //tabledivision.style.backgroundColor = "";
        }
        // loading all data  in our maps
        myQuestions.set(question.name, question.text);
        questions.set(question.name, question);
        //  show Answer's details when we click on some Questions in a Table
        tablerow.onmousedown = function () {
        const currentQuestion = questions.get(buttonItem.id)
        var questionResponses = document.getElementById('questionResponses');
        questionResponses.innerHTML = '';
        // var label = document.createElement('label');
        // var answerdivision=  document.createElement('div');
        const answerTable = document.createElement('table');
        const  answerTableBody = document.createElement('tbody');

        
        answerTable.appendChild(answerTableBody);
        ;
          for(let i= 0; i<currentQuestion.answers.length; i++ )
          {  
            var Row1 = document.createElement('tr');
            var colum1 = document.createElement('td');
            colum1.textContent=  "RESPONSE: "+ currentQuestion.answers[i].text; 
            Row1.appendChild(colum1); 
            answerTableBody.appendChild(Row1);

            var Row2 = document.createElement('tr');
            var colum2 = document.createElement('td');
            colum2.textContent=  "CORRECT: "+ currentQuestion.answers[i].correct; 
            Row2.appendChild(colum2); 
            answerTableBody.appendChild(Row2);

            var Row3 = document.createElement('tr');
            var colum3 = document.createElement('td');
            colum3.textContent=  "POINTS: "+ currentQuestion.answers[i].points; 
            Row3.appendChild(colum3); 
            answerTableBody.appendChild(Row3);

            var Row4 = document.createElement('tr');
            var colum4 = document.createElement('td');
            colum4.textContent=  "PERCENTAGE: "+ currentQuestion.answers[i].percentage;
            Row4.appendChild(colum4);
            answerTableBody.appendChild(Row4);

            var ligne= document.createElement('hr')
            ligne.style= "align:center"; 
            answerTableBody.appendChild(ligne)
          }
          
          questionResponses.appendChild(answerTable);
          // Alle Inhaltscontainer ausblenden
          //  Dies habe ich von Mario kopiert
          var contentContainers = document.querySelectorAll('.inhalt_recht');
          contentContainers.forEach(function (container) {
            container.style.display = 'none';
          });
          // Den ausgewählten Inhalt anzeigen
          questionResponses.style.display = 'block';
        }

      });
    });
}

console.log(myQuestions);

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

//  Details einer Frage anzeigen

const details = document.getElementById("questionDetails");
details.innerHTML = ` `;
//const dItem=createElement("li");

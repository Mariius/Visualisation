function loadData() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {

      // create a GOjs-Diagramm
      var $ = go.GraphObject.make;

      var Diagram =
        new go.Diagram("quiz-container", {
          layout: $(go.ForceDirectedLayout, {
            defaultSpringLength: 0,
            defaultElectricalCharge: 50
          })
        });

      // Define node templates for question and answer nodes
      Diagram.nodeTemplate =
        $(go.Node, "Auto",
          { click: function(e, node) {showAnswers(node);} },
          $(go.Shape, "RoundedRectangle", { fill: "lightblue", stroke: "black" }),
          $(go.TextBlock, { margin: 8 }, new go.Binding("text", "text", function (text) {
            // Limit the text to, for example, 10 characters
            if (text.length > 13) {
              return text.substring(0, 10) + "...";
            } else {
              return text;
            }
          }))
        );

      Diagram.nodeTemplateMap.add("answerNode",
        $(go.Node, "Auto",
          $(go.Shape, "RoundedRectangle", { fill: "lightgreen", stroke: "black" }),
          $(go.TextBlock, { margin: 8 }, new go.Binding("text", "text", function (text) {
            // Limit the text to, for example, 10 characters
            if (text.length > 13) {
              return text.substring(0, 10) + "...";
            } else {
              return text;
            }
          }))
        )
      );

      // Define link template
      Diagram.linkTemplate =
        $(go.Link, {
          routing: go.Link.Normal,
          curve: go.Link.Bezier,
          corner: 10,
          selectable: false
        },
        $(go.Shape, {
          strokeWidth: 3,
          stroke: '#424242'
        })
      );

      // JSON-Daten in das Diagramm laden
      Diagram.model = new go.GraphLinksModel(data.questions);

     

      // Antwortknoten für alle Fragen erstellen
      // var allAnswers = [];
      // 'add all Answers to allAswers'
      const allAnswers = data.questions.flatMap(question => question.answers.map(answer => answer.text));
      // data.questions.forEach(function(question) {question.answers.forEach(function(answer) {  allAnswers.push(answer.text); });});

      var commonAnswers=[];
      var createdAnswersNode = [];
      var createdLinks = [];  // Array zum Speichern der erstellten Verbindungen
      

      // Iteriere über alle Fragen
      data.questions.forEach(function(question) { 
        var answers = question.answers;
        
        // Iteriere über die Antworten dieser Frage
      
        answers.forEach(function(answer) {
          let count = 0;
          
          for(let i = 0; i < allAnswers.length; i++){
            if (allAnswers[i]==answer.text) {
              count++;
              if(count > 1 && !createdAnswersNode.includes(answer.text)){
              
                commonAnswers.push(answer.text);
                Diagram.model.addNodeData({
                category: "answerNode",
                text: answer.text,
                key: answer.text
                });
                createdAnswersNode.push(answer.text);
                
              }
              var linkExists = createdLinks.some(function(link) {
                return link.from === question.key && link.to === answer.text;
              });
        
              if (!linkExists) {
                createdLinks.push({
                  from: question.key,
                  to: answer.text
                });
    
                // Verbindung zwischen Frage- und Antwortknoten erstellen
                Diagram.model.addLinkData({
                  from: question.key,
                  to: answer.text
                });
              }
            }
          }
        });
        console.log(createdAnswersNode);
      });

      // Initialisiere ein Objekt, um den clickCount für jeden Knoten zu speichern
      let clickCounts = {};


      function showAnswers(questionNode) {
        // Überprüfe, ob ein clickCount für diesen Knoten existiert, andernfalls initialisiere ihn mit 0
        if (!clickCounts[questionNode.key]) {
          clickCounts[questionNode.key] = 0;
        }

        // Inkrementiere den clickCount für diesen Knoten
        clickCounts[questionNode.key]++;
        var answers = questionNode.data.answers;
        if(clickCounts[questionNode.key] % 2 != 0){
          for (var i = 0; i < answers.length; i++) {
            var answer = answers[i];
            var answerText = answer.text;  // Vergleiche sind nicht case-sensitive
        
            // Überprüfe, ob ein Knoten mit dem gleichen Text bereits existiert
            if (!createdAnswersNode.includes(answerText)) {
              createdAnswersNode.push(answerText);  // Antworttext zum Array hinzufügen
        
              Diagram.model.addNodeData({
                category: "answerNode",
                text: answer.text,
                key: answer.text
              });
  
              // Überprüfe, ob die Verbindung bereits existiert, bevor du sie erstellst
              var linkExists = createdLinks.some(function(link) {
                return link.from === questionNode.key && link.to === answer.text;
              });
        
              if (!linkExists) {
                createdLinks.push({
                  from: questionNode.key,
                  to: answer.text
                });
    
                // Verbindung zwischen Frage- und Antwortknoten erstellen
                Diagram.model.addLinkData({
                  from: questionNode.key,
                  to: answer.text
                });
              }
            }
          }
          console.log("single click: create" + clickCounts[questionNode.key]);
          console.log(clickCounts);
        }
        else{
          // Entferne nur die während des aktuellen Durchlaufs hinzugefügten Knoten und Verbindungen
          for (var i = 0; i < answers.length; i++) {
            var answer = answers[i];
            var answerText = answer.text;
      
            if (createdAnswersNode.includes(answerText)) {

              if (commonAnswers.includes(answerText)) {
                break;
              }
              else{
                // entfernt answerText aus createdAnswersNode
                createdAnswersNode.splice(createdAnswersNode.indexOf(answerText), 1);
        
                // Hier wird der Knoten auch aus dem Diagramm entfernt
                // Suche den Index des Knotens im Diagramm
                var nodeIndex = Diagram.model.nodeDataArray.findIndex(function(node) {
                  return node.key === answer.text;
                });

                // Wenn der Knoten gefunden wurde, entferne ihn aus dem Diagramm
                if (nodeIndex !== -1) {
                  Diagram.model.removeNodeData(Diagram.model.nodeDataArray[nodeIndex]);
                }

                // Suche den Index des Links im createdLinks-Array
                var linkIndex = Diagram.model.linkDataArray.findIndex(function(link) {
                  return link.from === questionNode.key && link.to === answerText;
                });
                
                // Wenn der Link gefunden wurde, entferne ihn aus createdLinks und dem Diagramm
                if (linkIndex !== -1) {
                  // link aus createdLinks entfernen
                  createdLinks.splice(linkIndex, 1);

                  // Entferne den Link aus dem Diagramm
                  Diagram.model.removeLinkData(Diagram.model.linkDataArray[linkIndex]);
                }

              }
            }
          }
      
          console.log("single click: delete" + clickCounts[questionNode.key]);
          console.log(clickCounts);
        }
        
        Diagram.updateAllTargetBindings();
        Diagram.layoutDiagram();
        console.log("common: "+commonAnswers);
        console.log(createdAnswersNode);
      }

    });
    
  }

  loadData();
  
  
document.addEventListener("DOMContentLoaded", function () {
  const answerSelect = document.createElement("select");
  const answersContainer = document.getElementById("answersContainer");

  function populateAnswerSelect(data) {
    answerSelect.name = "answerSelect";
    answerSelect.classList.add("answerSelect");
    answerSelect.innerHTML = '<option value="" disabled selected>Select an Answer</option>';
    data.questions.forEach((question) => {
      question.answers.forEach((answer) => {
        const option = document.createElement("option");
        option.value = answer.id;
        option.text = answer.text;
        answerSelect.appendChild(option);
      });
    });

    // Event listener for answer select
    answerSelect.addEventListener("change", (event) => {
      const selectedAnswerId = parseInt(event.target.value);
      if (!isNaN(selectedAnswerId)) {
        // Find the selected answer in the JSON data
        let selectedAnswer;
        for (const question of data.questions) {
          selectedAnswer = question.answers.find((answer) => answer.id === selectedAnswerId);
          if (selectedAnswer) break;
        }

        // Populate form fields with selected answer data
        const answerRow = answerSelect.closest(".answerRow");
        answerRow.querySelector(".answerText").value = selectedAnswer.text;
        answerRow.querySelector(".answerPoints").value = selectedAnswer.points;
        answerRow.querySelector(".answerCorrect").checked = selectedAnswer.correct;
        answerRow.querySelector(".answerPercentage").value = selectedAnswer.percentage;
      }
    });
  }

  function addAnswerRow() {
    const newRow = document.createElement("tbody");
    newRow.classList.add("answerRow");

    newRow.innerHTML = `
      <tr>
        <td><label for="answerSelect">Select answer:</label></td>
        <td>${answerSelect.outerHTML}</td>
      </tr>
      <tr><td><label for="answerText">Answer Text:</label></td>
      <td><input type="text" class="answerText" name="answerText" required></td></tr>
      <tr><td><label for="answerPoints">Points:</label></td>
      <td><input type="number" class="answerPoints" name="answerPoints" required></td></tr>
      <tr><td><label for="answerCorrect">Correct:</label></td>
      <td><input type="checkbox" class="answerCorrect" name="answerCorrect"></td></tr>
      <tr><td><label for="answerPercentage">Percentage:</label></td>
      <td><input type="number" class="answerPercentage" name="answerPercentage" required></td></tr>
    `;

    answersContainer.appendChild(newRow);
  }

  function resetForm() {
    document.getElementById("questionName").value = "";
    document.getElementById("questionText").value = "";
    answersContainer.innerHTML = ""; // Clear previous answer rows
  }

  function submitForm(event) {
    event.preventDefault();

    const questionName = document.getElementById("questionName").value;
    const questionText = document.getElementById("questionText").value;

    const answers = [];
    document.querySelectorAll(".answerRow").forEach((row, index) => {
      const answerText = row.querySelector(".answerText").value;
      const answerPoints = parseInt(row.querySelector(".answerPoints").value);
      const answerCorrect = row.querySelector(".answerCorrect").checked;
      const answerPercentage = parseInt(row.querySelector(".answerPercentage").value);

      answers.push({
        id: index,
        text: answerText,
        points: answerPoints,
        correct: answerCorrect,
        percentage: answerPercentage,
      });
    });

    const newData = {
      name: questionName,
      text: questionText,
      answers: answers,
    };

    fetch("/api/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadData(); // You might want to define/load this function
          resetForm();
        }
      });
  }

  // Initial population of answerSelect
  fetch("/api/data")
    .then((response) => response.json())
    .then((data) => populateAnswerSelect(data));

  // Event listeners
  document.getElementById("dataForm").addEventListener("submit", submitForm);
  document.getElementById("addAnswerBtn").addEventListener("click", addAnswerRow);
});



//   fetch('/api/add', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(newData),
//   })
//     .then(response => response.json())
//     .then(data => {
//       if (data.success) {
//         document.getElementById("questionName").value = '';
//         document.getElementById("questionText").value = '';
//         document.getElementById("answer1Text").value = '';
//         document.getElementById("answer1Points").value = '';
//         document.getElementById("answer1Correct").checked = false;
//         document.getElementById("answer2Text").value = '';
//         document.getElementById("answer2Points").value = '';
//         document.getElementById("answer2Correct").checked = false;
//         document.getElementById("answer3Text").value = '';
//         document.getElementById("answer3Points").value = '';
//         document.getElementById("answer3Correct").checked = false;
//         loadData();
//         const done = document.createElement('p');
//         done.textContent = `the question ${questionName} was added successfuly`;
//         messageDiv.appendChild(done);

//         setTimeout(function () {
//           messageDiv.style.display = "none";
//           newQ.style.display = "none";
//           startR1.style.display = "flex";
//         }, 100); // 10000 Millisekunden (10 Sekunden)

//       }
//       else {
//         const failled = document.createElement('p');
//         failled.textContent = `the question ${questionName} could not be added`;
//         messageDiv.appendChild(failled);


//         setTimeout(function () {
//           messageDiv.style.display = "none";
//           newQ.style.display = "none";
//           startR1.style.display = "flex";
//         }, 100); // 10000 Millisekunden (10 Sekunden)

//       }
//     });

// });

// // Initial laden der Daten
// loadData();

// function showContent(contentId) {
//   // Alle Inhaltscontainer ausblenden
//   var contentContainers = document.querySelectorAll('.inhalt_recht');
//   contentContainers.forEach(function (container) {
//     container.style.display = 'none';
//   });

//   // Den ausgewählten Inhalt anzeigen
//   var selectedContent = document.getElementById(contentId);
//   selectedContent.style.display = 'block';
// }

// function hideContent(contentId) {
  
//   var selectedContent = document.getElementById(contentId);
//   selectedContent.style.display = 'none';
//   startR1.style.display = "flex";
// }

// // cellEd.addEventListener('click', ()=>{

// // });

// function deleteQuestion(questionName) {
//   fetch(`/api/delete/${encodeURIComponent(questionName)}`, {
//       method: 'DELETE',
//   })
//   .then(response => {
//       if (!response.ok) {
//           throw new Error(`Fehler beim Löschen der Frage: ${response.status}`);
//       }
//       return response.json();
//   })
//   .then(result => {
//       console.log('Frage erfolgreich gelöscht:', result);
//       // Hier kannst du weitere Aktionen nach dem Löschen durchführen
//       var contentContainers = document.querySelectorAll('.upper');
//       contentContainers.forEach(function (container) {
//         container.style.display = 'none';
//       });
//       loadData();
//   })
//   .catch(error => {
//       console.error('Fehler beim Löschen der Frage:', error);
//   });
// }


// --------------------load json data, add data to the json file -----------------------------------------------------------------------------------------------------------------

function loadData() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {

      // create a GOjs-Diagramm
      var $ = go.GraphObject.make;

      var TreeDiagram =
        new go.Diagram("quiz-container", {
          layout: $(go.ForceDirectedLayout, {
            defaultSpringLength: 0,
            defaultElectricalCharge: 50
          })
        });

      // Define node templates for question and answer nodes
      TreeDiagram.nodeTemplateMap.add("questionNode",
        $(go.Node, "Auto",
          { click: onNodeClick },
          $(go.Shape, "RoundedRectangle", { fill: "lightblue", stroke: "black" }),
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

      TreeDiagram.nodeTemplateMap.add("answerNode",
        $(go.Node, "Auto",
          { click: onNodeClick },
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
      TreeDiagram.linkTemplate =
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

      // Load data to the Diagram
      TreeDiagram.model = new go.GraphLinksModel(convertData(data));

      // Function to convert data to an optimal format for the Tree diagram
      
      function convertData(data) {
        
        var convertedData = { "nodeDataArray": [], "linkDataArray": [] };
        var addedAnswer = [];
        var allAnswers = [];


        // Add the parent node for questions
        convertedData.nodeDataArray.push({ key: data.lastID, text: "Questions" });

        // Loop through questions
        for (let i = 0; i < data.questions.length; i++) {
          var question = data.questions[i];
          
          // Add the node for the question
          convertedData.nodeDataArray.push({ key: question.name, text: question.text, answers: question.answers, category: "questionNode" });

          // Loop through answers
          for (let j = 0; j < question.answers.length; j++) {
            var answer = question.answers[j];
            allAnswers.push(answer.text);

            convertedData.nodeDataArray.push({ key: answer.text, text: answer.text, category: "answerNode" });
            convertedData.linkDataArray.push({ from: question.name, to: answer.text });

          //   var count = 0;
          // for(let l = 0; l > allAnswers.length; l++){

          //   if(allAnswers[l]===answer.text){
          //     count++;
          //     if (count>1){
          //       convertedData.linkDataArray.push({ from: question.name, to: answer.text });

          //     }
          //   }
            
          //   // if (addedAnswer.filter( answer.text.length > 1)) {
          //   //   // Suche nach allen questionNodes, die diese Antwort enthalten
          //   //   for (let k = 0; k < convertedData.nodeDataArray.length; k++) {
          //   //       var nodeData = convertedData.nodeDataArray[k];
          //   //       if (nodeData.category === "questionNode" && nodeData.answers.includes(answer.text)) {
          //   //           // Erstelle eine Verbindung zwischen der Frage und der mehrfach auftauchenden Antwort
          //   //           convertedData.linkDataArray.push({ from: nodeData.key, to: answer.text });
          //   //       }
          //   //   }
          // }
        }


            
          
        }


        

        console.log(convertedData);
        console.log(addedAnswer);
        return convertedData;
      }
      
      // Function for the click event when selecting nodes
      function onNodeClick(e) {
        var node = e.diagram.selection.first();
        if (node) {
          // Check the category value to distinguish between question and answer nodes
          if (node.data.category === "questionNode") {
            // Add your code here to respond to the click event for question nodes
            data.questions.forEach(question => {
              for (let j = 0; j < question.answers.length; j++) {
                var answer = question.answers[j];
                allAnswers.push(answer.text);
    
                convertedData.nodeDataArray.push({ key: answer.text, text: answer.text, category: "answerNode" });
                convertedData.linkDataArray.push({ from: question.name, to: answer.text });
              }  
            });
            console.log("Question clicked:", node.data.text);
          } else {
            // Add your code here to respond to the click event for answer nodes
            console.log("Answer clicked:", node.data.text);
          }
        }
      }

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


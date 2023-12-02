
function init() {

  myDiagram = new go.Diagram("quiz-container",
      {
        // when a drag-drop occurs in the Diagram's background, make it a top-level node
        mouseDrop: e => finishDrop(e, null),
        layout:  // Diagram has simple horizontal layout
          new go.GridLayout(
            { wrappingWidth: Infinity, alignment: go.GridLayout.Position, cellSize: new go.Size(1, 1) }),
        "commandHandler.archetypeGroupData": { isGroup: true, text: "Group", horiz: false },
        "undoManager.isEnabled": true
      });

  // The one template for Groups can be configured to be either layout out its members
  // horizontally or vertically, each with a different default color.

  function makeLayout(horiz) {  // a Binding conversion function
    if (horiz) {
      return new go.GridLayout(
        {
          wrappingWidth: Infinity, alignment: go.GridLayout.Position,
          cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
        });
    } else {
      return new go.GridLayout(
        {
          wrappingColumn: 1, alignment: go.GridLayout.Position,
          cellSize: new go.Size(1, 1), spacing: new go.Size(4, 4)
        });
    }
  }

  function defaultColor(horiz) {  // a Binding conversion function
    return horiz ? "rgba(255, 221, 51, 0.55)" : "rgba(51,211,229, 0.5)";
  }

  function defaultFont(horiz) {  // a Binding conversion function
    return horiz ? "bold 20px sans-serif" : "bold 16px sans-serif";
  }

  // this function is used to highlight a Group that the selection may be dropped into
  function highlightGroup(e, grp, show) {
    if (!grp) return;
    e.handled = true;
    if (show) {
      // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
      // instead depend on the DraggingTool.draggedParts or .copiedParts
      var tool = grp.diagram.toolManager.draggingTool;
      var map = tool.draggedParts || tool.copiedParts;  // this is a Map
      // now we can check to see if the Group will accept membership of the dragged Parts
      if (grp.canAddMembers(map.toKeySet())) {
        grp.isHighlighted = true;
        return;
      }
    }
    grp.isHighlighted = false;
  }

  // Upon a drop onto a Group, we try to add the selection as members of the Group.
  // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
  // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
  function finishDrop(e, grp) {
    var ok = (grp !== null
      ? grp.addMembers(grp.diagram.selection, true)
      : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
    if (!ok) e.diagram.currentTool.doCancel();
  }

  myDiagram.groupTemplate =
    new go.Group("Auto",
      {
        background: "blue",
        ungroupable: true,
        // highlight when dragging into the Group
        mouseDragEnter: (e, grp, prev) => highlightGroup(e, grp, true),
        mouseDragLeave: (e, grp, next) => highlightGroup(e, grp, false),
        computesBoundsAfterDrag: true,
        computesBoundsIncludingLocation: true,
        // when the selection is dropped into a Group, add the selected Parts into that Group;
        // if it fails, cancel the tool, rolling back any changes
        mouseDrop: finishDrop,
        handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
        // Groups containing Groups lay out their members horizontally
        layout: makeLayout(false)
      })
      .bind("layout", "horiz", makeLayout)
      .bind(new go.Binding("background", "isHighlighted", h => h ? "rgba(255,0,0,0.2)" : "transparent").ofObject())
      .add(new go.Shape("Rectangle",
        { fill: null, stroke: defaultColor(false), fill: defaultColor(false), strokeWidth: 2 })
        .bind("stroke", "horiz", defaultColor)
        .bind("fill", "horiz", defaultColor))
      .add(
        new go.Panel("Vertical")  // title above Placeholder
          .add(new go.Panel("Horizontal",  // button next to TextBlock
            { stretch: go.GraphObject.Horizontal, background: defaultColor(false) })
            .bind("background", "horiz", defaultColor)
            .add(go.GraphObject.make("SubGraphExpanderButton", { alignment: go.Spot.Right, margin: 5 }))
            .add(new go.TextBlock(
              {
                alignment: go.Spot.Left,
                editable: true,
                margin: 5,
                font: defaultFont(false),
                opacity: 0.95,  // allow some color to show through
                stroke: "#404040"
              })
              .bind("font", "horiz", defaultFont)
              .bind("text", "text", null, null)) // `null` as the fourth argument makes this a two-way binding
          )  // end Horizontal Panel
          .add(new go.Placeholder({ padding: 5, alignment: go.Spot.TopLeft }))
      )  // end Vertical Panel


  myDiagram.nodeTemplate =
    new go.Node("Auto",
      { // dropping on a Node is the same as dropping on its containing Group, even if it's top-level
        mouseDrop: (e, node) => finishDrop(e, node.containingGroup)
      })
      .add(new go.Shape("RoundedRectangle", { fill: "rgba(172, 230, 0, 0.9)", stroke: "white", strokeWidth: 0.5 }))
      .add(new go.TextBlock(
        {
          margin: 7,
          editable: true,
          font: "bold 13px sans-serif",
          opacity: 0.90
        })
        .bind("text", "text", null, null));  // `null` as the fourth argument makes this a two-way binding

  loadData();
}

function reexpand(e) {
  myDiagram.commit(diag => {
    var level = parseInt(document.getElementById("levelSlider").value);
    diag.findTopLevelGroups().each(g => expandGroups(g, 0, level))
  } ,"reexpand");
}
function expandGroups(g, i, level) {
  if (!(g instanceof go.Group)) return;
  g.isSubGraphExpanded = i < level;
  g.memberParts.each(m => expandGroups(m, i + 1, level))
}

// save a model to and load a model from JSON text, displayed below the Diagram
function save() {
  document.getElementById("mySavedModel").value = myDiagram.model.toJson();
  myDiagram.isModified = false;
}


function loadData() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {

      var quizData = { "nodeDataArray": [], "linkDataArray": [] };
      data.questions.forEach(question =>{

        quizData.nodeDataArray.push({key: question.name ,text: question.text, isGroup:true, horiz:true});
        question.answers.forEach(answer => {
          quizData.nodeDataArray.push({key:answer.id, text: answer.text, isGroup: true, group: question.name});
          quizData.nodeDataArray.push({text: "ist correct: "+answer.correct, group:answer.id});
          quizData.nodeDataArray.push({text: "points: "+answer.points, group:answer.id});
          quizData.nodeDataArray.push({text: "percentage: "+answer.percentage, group:answer.id});

        })

      });
      myDiagram.model = go.Model.fromJson(quizData);


    });
  }
init();
//...............Add New question........................................................................................................................... 
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


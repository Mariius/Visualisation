function init() {

  myDiagram = new go.Diagram("quiz-container",
{
    // when a drag-drop occurs in the Diagram's background, make it a top-level node
    mouseDrop: e => finishDrop(e, null),
    layout:  // Diagram has horizontal layout with wrapping
        new go.GridLayout(
            {
                wrappingColumn: Infinity,
                spacing: new go.Size(5, 5),  // optional: set spacing between nodes
                cellSize: new go.Size(1, 1),
                alignment: go.GridLayout.Position
            }),
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
        isSubGraphExpanded: false,
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

  // ------- Graphic Add question.---------------
  myPalette =
        new go.Palette("myPaletteDiv",
          {
            nodeTemplateMap: myDiagram.nodeTemplateMap,
            groupTemplateMap: myDiagram.groupTemplateMap
          });

  
  var newQuestionKey = "question " + Math.abs(Math.floor(Math.random()));
  var answerKey = 0; // antwort id initialisieren, sie wird dann vom server gesetzt.
  myPalette.model = new go.GraphLinksModel([
    {key:newQuestionKey, text:"new question" ,isGroup:true,horiz:true},
    {key:answerKey, text:"New Answer",isGroup:true, group:newQuestionKey},
    {text:("correct:"+"_"),group:answerKey},
    {text:"points: 10","group":answerKey},
    {text:"percentage: 100","group":answerKey},
    
  ]);

  // search a question-----------------
  document.addEventListener("DOMContentLoaded", function () {
    
    // Neues HTML-Element für die Autovervollständigungsliste
    const autoCompleteList = document.getElementById("autoCompleteList");

    function searchQuestion() {
      try {
        const searchingEl = document.getElementById("searchInput").value.toLowerCase();
        console.log("Search term:", searchingEl);
  
        // Verwende das ursprüngliche nodeDataArray
        const filteredNodes = originalNodeDataArray.filter((element) => {
          const groupData = myDiagram.model.findNodeDataForKey(element.group);
          const parentGroupData = groupData ? myDiagram.model.findNodeDataForKey(groupData.group) : null;
  
          return (
            element.text.toLowerCase().includes(searchingEl) ||
            (groupData && groupData.text.toLowerCase().includes(searchingEl)) ||
            (parentGroupData && parentGroupData.text.toLowerCase().includes(searchingEl))
          );
        });
  
        // Extrahieren aller Nodes mit Details (points, percentage, correct) von jeder Frage oder Antwort
        const detailsNodes = myDiagram.model.nodeDataArray
          .filter((node) => filteredNodes.includes(node.group) || filteredNodes.includes(node.key))
          .map((detailNode) => {
            return {
              ...detailNode,
              isCorrect: detailNode.isCorrect,
              percentage: detailNode.percentage,
              points: detailNode.points,
              id: detailNode.id,
            };
          });
  
        // Diagramm mit den gefilterten Nodes aktualisieren
        myDiagram.model.nodeDataArray = filteredNodes.concat(detailsNodes);
        myDiagram.updateAllTargetBindings();  // Aktualisiere die Bindungen
  
        // Zeige die Liste mit den Texten der gefilterten Nodes an
        updateAutoCompleteList(filteredNodes);

        // Überprüfe, ob das Suchfeld leer ist, und verstecke die Liste entsprechend
        if (searchingEl === "") {
          hideAutoCompleteList();
        }
  
        console.log("Filtered nodes:", myDiagram.model.nodeDataArray);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  
    // Funktion zum Aktualisieren der Autovervollständigungsliste
    function updateAutoCompleteList(filteredNodes) {
      const autoCompleteList = document.getElementById("autoCompleteList");
      autoCompleteList.innerHTML = "";
  
      // Füge die Texte der gefilterten Nodes zur Liste hinzu
      filteredNodes.forEach((node) => {
        const listItem = document.createElement("li");
        listItem.textContent = node.text;
        listItem.addEventListener("click", () => {
          // Fülle das Suchfeld mit dem ausgewählten Text
          document.getElementById("searchInput").value = node.text;
          // Führe die Suche erneut aus, um das Diagramm zu aktualisieren
          search();
          hideAutoCompleteList();
        });
        autoCompleteList.appendChild(listItem);
      });
    }

    // Neue Funktion zum Verstecken der Autovervollständigungsliste
    function hideAutoCompleteList() {
      autoCompleteList.style.display = "none";
    }

    // Neue Funktion zum Anzeigen der Autovervollständigungsliste
    function showAutoCompleteList() {
      autoCompleteList.style.display = "block";
    }

    // Event Listener für das Input-Feld, um die Liste bei Eingabe anzuzeigen und zu aktualisieren
    document.getElementById('searchInput').addEventListener('input', (event) => {
      searchQuestion();
      // Zeige die Liste, wenn das Suchfeld nicht leer ist
      if (event.target.value !== "") {
        showAutoCompleteList();
      } else {
        // Verstecke die Liste, wenn das Suchfeld leer ist
        hideAutoCompleteList();
      }
    });
  
  });

  
  loadData();
}
// initiate the diagram
init();

//--------- Event-Handler für das contextmenu-Ereignis----------------
myDiagram.div.addEventListener('contextmenu', function (e) {
  e.preventDefault(); // Verhindert das Standardkontextmenü des Browsers
  showCustomContextMenu(e.pageX, e.pageY);
});

// Funktion zum Anzeigen des benutzerdefinierten Kontextmenüs
function showCustomContextMenu(x, y) {
  // Erstellen Sie ein HTML-Element für das benutzerdefinierte Kontextmenü
  var contextMenu = document.createElement('div');
  contextMenu.style.position = 'absolute';
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.style.backgroundColor = '#fff';
  contextMenu.style.border = '1px solid #ccc';
  contextMenu.style.padding = '5px';
  contextMenu.style.zIndex = '1000';

  // Fügen Sie Menüelemente hinzu (ersetzen Sie dies durch Ihre eigenen Aktionen)
  var copyMenuItem = document.createElement('div');
  copyMenuItem.textContent = 'Copy';
  copyMenuItem.addEventListener('click', function () {
    // Fügen Sie die Logik für die "Copy"-Aktion hinzu
    myDiagram.commandHandler.copySelection(); 
    //alert('Copy action');
    contextMenu.remove();
  });
  contextMenu.appendChild(copyMenuItem);

  var pasteMenuItem = document.createElement('div');
  pasteMenuItem.textContent = 'Paste';
  pasteMenuItem.addEventListener('click', function () {
    // Fügen Sie die Logik für die "Paste"-Aktion hinzu
    myDiagram.commandHandler.pasteSelection(); 
    //alert('Paste action');
    contextMenu.remove();
  });
  contextMenu.appendChild(pasteMenuItem);

  var undoMenuItem = document.createElement('div');
  undoMenuItem.textContent = 'Undo';
  undoMenuItem.addEventListener('click', function () {
    // Fügen Sie die Logik für die "Undo"-Aktion hinzu
    myDiagram.commandHandler.undo(); 
    //alert('Undo action');
    contextMenu.remove();
  });
  contextMenu.appendChild(undoMenuItem);

  var redoMenuItem = document.createElement('div');
  redoMenuItem.textContent = 'Redo';
  redoMenuItem.addEventListener('click', function () {
    // Fügen Sie die Logik für die "Redo"-Aktion hinzu
    myDiagram.commandHandler.redo(); 
   // alert('Redo action');
    contextMenu.remove();
  });
  contextMenu.appendChild(redoMenuItem);

  // Fügen Sie das benutzerdefinierte Kontextmenü zum DOM hinzu
  document.body.appendChild(contextMenu);

  // Event-Handler zum Entfernen des Kontextmenüs beim Klicken außerhalb
  document.addEventListener('click', function (event) {
    if (!contextMenu.contains(event.target)) {
      contextMenu.remove();
    }
  });
}


// ..................................Load data to Diagramm..............................
function loadData() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      console.log(data);

      var quizData = { "nodeDataArray": [], "linkDataArray": [] };
      quizData.nodeDataArray.push({text: "lastID: "+ data.lastID})
      data.questions.forEach(question =>{

        quizData.nodeDataArray.push({key: question.name ,text: question.text, isGroup:true, horiz:true});
        question.answers.forEach(answer => {
          quizData.nodeDataArray.push({key:answer.id, text: answer.text, isGroup: true, group: question.name});
          quizData.nodeDataArray.push({text: "correct: "+answer.correct, group:answer.id});
          quizData.nodeDataArray.push({text: "points: "+answer.points, group:answer.id});
          quizData.nodeDataArray.push({text: "percentage: "+answer.percentage, group:answer.id});
        })

      });
      myDiagram.model = go.Model.fromJson(quizData);

      originalNodeDataArray = quizData.nodeDataArray.slice(); // Kopiere die Daten für die spätere Verwendung
      myDiagram.model = go.Model.fromJson(quizData);
    });

    // Daten beim Laden speichern
    originalNodeDataArray = JSON.parse(JSON.stringify(myDiagram.model.nodeDataArray));
}


//..............................UPDATE JSON FILE..........................................
function updateData() {
  var Data = myDiagram.model.toJson();
  console.log(JSON.parse(Data));
  myDiagram.isModified = false;
  var newQuizData = JSON.parse(Data);
  const updatedData = {
    lastID: getLastID(), // Replace with the new lastID
    questions: [
      // Replace with the updated array of questions
      // ...
    ]
  };

  newQuizData.nodeDataArray.forEach(element => {
    if(element.isGroup)
    {
    if(element.horiz ){  updatedData.questions.push({ "name": element.key, "text":element.text ,"answers":[]});
    } 
    }

  });

  newQuizData.nodeDataArray.forEach(el => {
      updatedData.questions.forEach(ques => {
          if(ques.name == el.group){
              ques.answers.push({"id":el.key, "text":el.text, "points": getPoints(el.key) , "correct": getCorrect(el.key), "percentage":getPercentage(el.key)});
          }
      })
  });

  function getPoints(group) {
      const match = newQuizData.nodeDataArray.find(node => node.group === group && node.text.includes("points"));
      return match ? parseInt(match.text.split(":")[1].trim()) : 0;
    }
  function getPercentage(group) {
    const match = newQuizData.nodeDataArray.find(node => node.group === group && node.text.includes("percentage"));
    return match ? parseInt(match.text.split(":")[1].trim()) : 0;
  }

  function getCorrect(group) {
    const match = newQuizData.nodeDataArray.find(node => node.group === group && node.text.includes("correct"));
    // return match.text.split(":")[1].trim();
    return /^true$/i.test(match.text.split(":")[1].trim());
  }
  function getLastID() {
    const match = newQuizData.nodeDataArray.find(node =>  node.text.includes("lastID"));
    return match ? parseInt(match.text.split(":")[1].trim()) : 0;
  }
  
  fetch('/api/updateAll', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(data); // Output success or any other response from the server

      // dialog Fenster
      const dialog = document.getElementById("dialog");

      // dialog.show();
      dialog.showModal();

      // Warte 10 Sekunden, bevor das Modal geschlossen wird
      setTimeout(function() {
          // Schließe das Modal nach 10 Sekunden
          dialog.close();
      }, 5000); // 10000 Millisekunden entsprechen 10 Sekunden

    })
    .catch(error => {
      console.error('Error:', error);
    });
}

//...............Add New question........................................................................................................................... 
document.addEventListener("DOMContentLoaded", function () {

  function setId() {
    return 0;
  }

  function populateAnswerSelect(data, answerSelect) {
    // answerSelect.name = 'answerSelect';
    // answerSelect.classList.add('answerSelect');
    answerSelect.innerHTML = '<option value="" disabled selected >Select an Answer</option>';
    data.questions.forEach(question => {
      question.answers.forEach(answer => {
        const option = document.createElement('option');
        option.value = answer.id;
        option.text = answer.text;
        answerSelect.appendChild(option);
      });
    });
  }

  function addAnswerRow(answersContainer) {
    const newRow = document.createElement("tbody");
    newRow.classList.add("answerRow");

    const answerSelect = document.createElement("select");
    populateAnswerSelect(data, answerSelect);

    const answerId = Math.random(); // Jede Antwortzeile erhält eine neue eindeutige ID
    newRow.innerHTML = `
      <tr>
        <td><label for="${answerId}_select">Select answer:</label></td>
        <td>${answerSelect.outerHTML}</td>
      </tr>
      <tr><td><label for="${answerId}_text">Answer Text:</label></td>
      <td><input type="text" id="${answerId}_text" class="ansText" name="ansText" required></td></tr>
      <tr><td><label for="${answerId}_points">Points:</label></td>
      <td><input type="number" id="${answerId}_points" class="ansPoints" name="ansPoints" required></td></tr>
      <tr><td><label for="${answerId}_correct">Correct:</label></td>
      <td><input type="checkbox" id="${answerId}_correct" class="ansCorrect" name="ansCorrect"></td></tr>
      <tr><td><label for="${answerId}_percentage">Percentage:</label></td>
      <td><input type="number" id="${answerId}_percentage" class="ansPercentage" name="ansPercentage" required></td></tr>
    `;

    answersContainer.appendChild(newRow);
  }

  function resetForm(answersContainer) {
    document.getElementById("questionName").value = "";
    document.getElementById("questionText").value = "";
    answersContainer.innerHTML = "";
  }
  
  window.resetForm = resetForm; // Die Funktion wird global zugänglich gemacht


  function submitForm(event) {
    event.preventDefault();

    const questionName = document.getElementById("questionName").value;
    const questionText = document.getElementById("questionText").value;

    const answers = [];
    document.querySelectorAll(".answerRow").forEach((row, index) => {
      const answerSelect = row.querySelector("select");
      const answerText = row.querySelector(".ansText").value;
      const answerPoints = parseInt(row.querySelector(".ansPoints").value);
      const answerCorrect = row.querySelector(".ansCorrect").checked;
      const answerPercentage = parseInt(row.querySelector(".ansPercentage").value);

      answers.push({
        id: setId(), // Nutze die aktualisierte setId-Funktion
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
      .then((responseData) => {
        if (responseData.success) {
          loadData();
          resetForm(document.getElementById("answersContainer"));
        }
      })
      .catch(error => console.error('Error:', error));
  }

  const answersContainer = document.getElementById("answersContainer");

  document.getElementById("addAnswerBtn").addEventListener("click", () => {
    addAnswerRow(answersContainer);
  });

  document.getElementById("cancelAnswerBtn").addEventListener("click", function () {
    const answersContainer = document.getElementById("answersContainer");
    const lastAnswerRow = answersContainer.lastElementChild;
    if (lastAnswerRow) {
      answersContainer.removeChild(lastAnswerRow);
    }
  });

  fetch("/api/data")
    .then((response) => response.json())
    .then((responseData) => {
      data = responseData;
    });

  document.getElementById('answersContainer').addEventListener('input', (event) => {
    // Prüfen, ob das Event von einem select-Element ausgelöst wurde
    if (event.target.tagName.toLowerCase() === 'select') {
        const selectedAnswerId = parseInt(event.target.value);

        if (!isNaN(selectedAnswerId)) {
            const selectedQuestion = data.questions.find(question => 
                question.answers.some(answer => answer.id === selectedAnswerId)
            );

            if (selectedQuestion) {
                const selectedAnswer = selectedQuestion.answers.find(answer => answer.id === selectedAnswerId);

                const answerRow = event.target.closest('.answerRow');
                if (answerRow) {
                    answerRow.querySelector('.ansText').value = selectedAnswer.text;
                    answerRow.querySelector('.ansPoints').value = selectedAnswer.points;
                    answerRow.querySelector('.ansCorrect').checked = selectedAnswer.correct;
                    answerRow.querySelector('.ansPercentage').value = selectedAnswer.percentage;
                }
            }
        }
    }
  });
  document.getElementById("dataForm").addEventListener("submit", submitForm);
});



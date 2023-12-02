function loadData() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {

      

    });
  }

  loadData();
  
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


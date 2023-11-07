// function newElement(event) {
//     event.preventDefault();
//     var el = document.getElementById("el");
//     var inputValue = el.value; 
//     var elementeList = document.getElementById("elemente");
//     elementeList.innerHTML += `<li>${inputValue}</li>`;
//     el.value = ""; 
// }

// --------------------load json data, add data to the json file -----------------------------------------------------------------------------------------------------------------
    const dataList = document.getElementById('data-list');
    const myQuestions= [];

    // Funktion zum Laden der JSON-Daten und Anzeigen als Liste
    function loadData() {
      fetch('/api/data')
        .then(response => response.json())
        .then(data => {
          dataList.innerHTML = '';
          data.questions.forEach(question => {
            const listItem = document.createElement('li');
           listItem+= document.createAttribute()
            listItem.textContent = `${question.name}: ${question.text}`;
            dataList.appendChild(listItem);
            myQuestions.push(`${question.name}: ${question.text}`);
          });
        });
    }
    
    console.log(myQuestions);
   
    const form = document.getElementById("dataForm");
        const messageDiv = document.getElementById("message");

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const questionName = document.getElementById("questionName").value;
            const questionText = document.getElementById("questionText").value;
            const answer1Text = document.getElementById("answer1Text").value;
            const answer1Points = parseInt(document.getElementById("answer1Points").value);
            const answer1Correct = document.getElementById("answer1Correct").checked;
            const answer2Text = document.getElementById("answer2Text").value;
            const answer2Points = parseInt(document.getElementById("answer2Points").value);
            const answer2Correct = document.getElementById("answer2Correct").checked;
            const answer3Text = document.getElementById("answer3Text").value;
            const answer3Points = parseInt(document.getElementById("answer3Points").value);
            const answer3Correct = document.getElementById("answer3Correct").checked;

            const newData = {
                "name": questionName,
                "text": questionText,
                "answers": [
                    {
                        "id": 0,
                        "text": answer1Text,
                        "points": answer1Points,
                        "correct": answer1Correct,
                        "percentage": answer1Correct ? 100 : 0
                    },
                    {
                        "id": 1,
                        "text": answer2Text,
                        "points": answer2Points,
                        "correct": answer2Correct,
                        "percentage": answer2Correct ? 100 : 0
                    },
                    {
                        "id": 2,
                        "text": answer3Text,
                        "points": answer3Points,
                        "correct": answer3Correct,
                        "percentage": answer3Correct ? 100 : 0
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
            
          }
        });

    });

    // Initial laden der Daten
    loadData();

    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("jsonFileInput");
  const testContainer = document.getElementById("testContainer");
  const fileNameSpan = document.getElementById("fileName");

  fileInput.addEventListener("change", handleFileSelect);

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
      fileNameSpan.textContent = "No file chosen";
      return;
    }

    fileNameSpan.textContent = file.name;
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const jsonContent = JSON.parse(e.target.result);
        renderTest(jsonContent);
      } catch (error) {
        testContainer.innerHTML = `<div class="placeholder"><p style="color: red;">Error: Could not parse JSON file. Please ensure it's a valid test file.</p></div>`;
        console.error("JSON Parsing Error:", error);
      }
    };

    reader.readAsText(file);
  }

  function renderTest(data) {
    let html = "";
    const scoringMap = createScoringMap(data.scoring);

    data.test.sections.forEach((section) => {
      if (section.type === "routing" || section.type === "destination") {
        html += `<div class="module">`;
        html += `<h2 class="module-title">${section.title}</h2>`;
        html += `<div class="instructions">${section.instructions}</div>`;

        section.chunks.forEach((chunk) => {
          chunk.items.forEach((item) => {
            const correctAnswerId = scoringMap.get(item.id);
            html += renderQuestion(item, correctAnswerId);
          });
        });

        html += `</div>`;
      }
    });

    testContainer.innerHTML = html;
  }

  function createScoringMap(scoringData) {
    const map = new Map();
    if (!scoringData || !scoringData.sections) return map;

    Object.values(scoringData.sections).forEach((section) => {
      if (section.questions) {
        Object.entries(section.questions).forEach(([itemId, questionData]) => {
          map.set(itemId, questionData.keys[0]);
        });
      }
    });
    return map;
  }

  function renderQuestion(item, correctAnswerKey) {
    let questionHtml = `<div class="question" id="${item.id}">`;
    questionHtml += `<div class="question-header">Question ${item.displayNumber}</div>`;

    if (item.stimulus) {
      questionHtml += `<div class="stimulus">${item.stimulus}</div>`;
    }

    if (item.stem) {
      questionHtml += `<div class="stem">${item.stem}</div>`;
    }

    if (item.type === "mcq") {
      questionHtml += `<div class="answer-options"><ul>`;
      item.answerOptions.forEach((option) => {
        const isCorrect = option.id === correctAnswerKey;
        questionHtml += `<li class="${isCorrect ? "correct" : ""}">${
          option.content
        }</li>`;
      });
      questionHtml += `</ul></div>`;
    } else if (item.type === "spr") {
      const answers = correctAnswerKey.split("||").join(" or ");
      questionHtml += `<div class="spr-answer">`;
      questionHtml += `<strong>Correct Answer:</strong> <span class="correct-text">${answers}</span>`;
      questionHtml += `</div>`;
    }

    questionHtml += `</div>`;
    return questionHtml;
  }
});
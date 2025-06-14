
// script.js

// ─── Question Data ─────────────────────────────────────────────────────────
const questions = [
  {
    "question": "Your company's user-feedback portal comprises a standard LAMP stack replicated across two zones. It is deployed in the us-central1 region and uses autoscaled managed instance groups on all layers, except the database. Currently, only a small group of select customers have access to the portal. The portal meets a 99,99% availability SLA under these conditions. However next quarter, your company will be making the portal available to all users, including unauthenticated users. You need to develop a resiliency testing strategy to ensure the system maintains the SLA once they introduce additional user load.\n\nWhat should you do?",
    "options": [
      "Capture existing users input, and replay captured user load until autoscale is triggered on all layers. At the same time, terminate all resources in one of the zones",
      "Create synthetic random user input, replay synthetic load until autoscale logic is triggered on at least one layer, and introduce \u05d2\u20acchaos\u05d2\u20ac to the system by terminating random resources on both zones",
      "Expose the new system to a larger group of users, and increase group size each day until autoscale logic is triggered on all layers. At the same time, terminate random resources on both zones",
      "Capture existing users input, and replay captured user load until resource utilization crosses 80%. Also, derive estimated number of users based on existing user's usage of the app, and deploy enough resources to handle 200% of expected load"
    ],
    "answer": [
      "Create synthetic random user input, replay synthetic load until autoscale logic is triggered on at least one layer, and introduce \u05d2\u20acchaos\u05d2\u20ac to the system by terminating random resources on both zones"
    ],
    "multiple": false
  },
  {
    "question": "One of the developers on your team deployed their application in Google Container Engine with the Dockerfile below. They report that their application deployments are taking too long.\n\nhttps://www.examtopics.com/assets/media/exam-media/04339/0008300001.png\n\nYou want to optimize this Dockerfile for faster deployment times without adversely affecting the app's functionality.\n\nWhich two actions should you take? (Choose two.)",
    "options": [
      "Remove Python after running pip",
      "Remove dependencies from requirements.txt",
      "Use a slimmed-down base image like Alpine Linux",
      "Use larger machine types for your Google Container Engine node pools",
      "Copy the source after he package dependencies (Python and pip) are installed"
    ],
    "answer": [
      "Use a slimmed-down base image like Alpine Linux",
      "Copy the source after he package dependencies (Python and pip) are installed"
    ],
    "multiple": true
  },
];

questions.sort(() => Math.random() - 0.5);

// ─── State & DOM References ───────────────────────────────────────────────────
let currentQuestion   = 0;
let score             = 0;
let showingFeedback   = false;
let quizStartTime     = new Date();
let totalTimeSeconds  = 90 * 60;
let countdownInterval = null;
let userAnswers = [];

const questionEl = document.getElementById("question");
const optionsEl  = document.getElementById("options");
const nextBtn    = document.getElementById("nextBtn");
const finishBtn  = document.getElementById("finishTestBtn");
const resultEl   = document.getElementById("result");
const timerEl    = document.getElementById("timer");

// ─── Utility Functions ───────────────────────────────────────────────────────
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function normalize(str) {
  return str
    .replace(/\\/g, "")     // remove all backslashes
    .replace(/\s+/g, " ")   // collapse whitespace/newlines into single spaces
    .trim();
}

function updateProgress() {
  const pct = (currentQuestion / questions.length) * 100;
  document.getElementById("progressBar").style.width = `${pct}%`;
  document.getElementById("progressText").textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;
}

// ─── Render Question ─────────────────────────────────────────────────────────
function loadQuestion() {
  showingFeedback    = false;
  resultEl.innerHTML = "";
  nextBtn.textContent = "Submit";

  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML    = "";

  const shuffled = shuffleArray([...q.options]);
  const type     = q.multiple ? "checkbox" : "radio";

  shuffled.forEach(opt => {
    const li    = document.createElement("li");
    const label = document.createElement("label");
    label.className = "option";

    const input = document.createElement("input");
    input.type  = type;
    input.name  = "option";
    input.value = opt;

    const span = document.createElement("span");
    span.textContent = opt;

    input.addEventListener("change", () => {
      document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
      label.classList.add("selected");
    });

    label.append(input, span);
    li.appendChild(label);
    optionsEl.appendChild(li);
  });

  updateProgress();
  finishBtn.style.display = (currentQuestion === questions.length - 1) ? "block" : "none";
}

// ─── Timer ────────────────────────────────────────────────────────────────────
function updateTimerDisplay() {
  const h = Math.floor(totalTimeSeconds / 3600);
  const m = Math.floor((totalTimeSeconds % 3600) / 60);
  const s = totalTimeSeconds % 60;

  let parts = [];
  if (h) parts.push(`${h}h`);
  if (m || h) parts.push(`${m}m`);
  parts.push(`${s}s`);

  timerEl.textContent = `Time Remaining: ${parts.join(" ")}`;
  totalTimeSeconds--;

  if (totalTimeSeconds < 0) {
    clearInterval(countdownInterval);
    alert("Time's up! Submitting your quiz.");
    showResult();
  }
}

function startTimer() {
  updateTimerDisplay();
  countdownInterval = setInterval(updateTimerDisplay, 1000);
}

// ─── Submission & Feedback ───────────────────────────────────────────────────
nextBtn.addEventListener("click", () => {
  const currentQ       = questions[currentQuestion];
  const selectedInputs = Array.from(
    document.querySelectorAll("input[name='option']:checked")
  );

  if (!showingFeedback) {
    if (selectedInputs.length === 0) {
      alert("Please select at least one option.");
      return;
    }

    // Normalize selected vs. correct
    const selectedNorm = selectedInputs.map(i => normalize(i.value));
    const correctNorm  = currentQ.answer.map(a => normalize(a));

    const isCorrect =
      selectedNorm.length === correctNorm.length &&
      correctNorm.every(ans => selectedNorm.includes(ans));

    const selectedRaw = selectedInputs.map(input => input.value); // preserve original formatting
      userAnswers[currentQuestion] = {
        selected: selectedRaw,
        correct: currentQ.answer,
        question: currentQ.question
      };


    // Disable & highlight in one pass
    optionsEl.querySelectorAll("input[name='option']").forEach(input => {
      input.disabled = true;
      const valNorm = normalize(input.value);
      const lbl     = input.parentElement;

      if (correctNorm.includes(valNorm))       lbl.classList.add("correct");
      else if (input.checked)                  lbl.classList.add("incorrect");
    });

    // Show feedback message
    resultEl.innerHTML = isCorrect
      ? `<p style="color:green;">✅ Correct!</p>`
      : `<p style="color:red;">❌ Incorrect.</p>
         <p>Correct Answer:<br><strong>${currentQ.answer.join("<br>")}</strong></p>`;

    if (isCorrect) score++;
    showingFeedback     = true;
    nextBtn.textContent = (currentQuestion < questions.length - 1)
      ? "Next Question"
      : "See Result";

  } else {
    // Move to next question or finish
    currentQuestion++;
    if (currentQuestion < questions.length) {
      loadQuestion();
    } else {
      showResult();
    }
  }
});

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m || h) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function saveScoreToHistory(score, total) {
  const endTime = new Date();
  const duration = formatDuration(Math.floor((endTime - quizStartTime) / 1000));

  const record = {
    score,
    total,
    date: endTime.toLocaleString(),
    duration
  };

  let history = JSON.parse(localStorage.getItem("quizScoreHistory")) || [];
  history.push(record);
  localStorage.setItem("quizScoreHistory", JSON.stringify(history));
}

function displayScoreHistory() {
  const container = document.querySelector(".container");
  const historyDiv = document.getElementById("scoreHistory");
  if (historyDiv) historyDiv.remove();

  let history = JSON.parse(localStorage.getItem("quizScoreHistory")) || [];
  if (history.length === 0) return;

  const div = document.createElement("div");
  div.id = "scoreHistory";
  div.style.display = "none";
  div.innerHTML = `
    <h3>Score History</h3>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr><th>#</th><th>Score</th><th>Time Taken</th><th>Date</th></tr>
      </thead>
      <tbody>
        ${history.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.score} / ${r.total}</td>
            <td>${r.duration}</td>
            <td>${r.date}</td>
          </tr>`).join("")}
      </tbody>
    </table>
    
    <div style="margin-top: 10px;">
      <button id="clearHistoryBtn">Clear History</button>
      <button id="restartFromHistoryBtn" style="margin-left: 10px;">Restart Quiz</button>
    </div>
    <hr>
  `;
  container.insertBefore(div, document.getElementById("quiz"));

  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    if (confirm("Clear all score history?")) {
      localStorage.removeItem("quizScoreHistory");
      displayScoreHistory();
    }
  });

  document.getElementById('restartFromHistoryBtn').addEventListener('click', () => {
    if (confirm("Do you want to restart the quiz?")) {
      // Reset quiz state
      score = 0;
      currentQuestion = 0;
      showingFeedback = false;
      quizStartTime = new Date();
  
      // Reset timer
      clearInterval(countdownInterval);
      totalTimeSeconds = 90 * 60; // reset to your default duration
      updateTimerDisplay();
      startTimer();

      // Hide score history section
      const historySection = document.getElementById("scoreHistory");
      if (historySection) historySection.style.display = "none";
  
      // Shuffle and reload quiz
      questions.sort(() => Math.random() - 0.5);
      document.getElementById("quiz").style.display = "block";
      document.getElementById("finalResult").style.display = "none";
      const summary = document.getElementById("summaryPage");
      if (summary) summary.style.display = "none";
  
      loadQuestion();
    }
  });

}


// ─── Show Result & Restart ───────────────────────────────────────────────────
function showResult() {
  clearInterval(countdownInterval);
  saveScoreToHistory(score, questions.length);

  document.getElementById("quiz").style.display = "none";
  document.getElementById("finalResult").style.display = "block";
  document.getElementById("finalResult").innerHTML = `
    <h2>Your Score: ${score}/${questions.length}</h2>
    <button id="restartQuizBtn" style="margin-top: 16px;">Restart Quiz</button>
  `;
  finishBtn.style.display = "none";

  displayScoreHistory();
  document.getElementById("scoreHistory").style.display = "block";


  document.getElementById("restartQuizBtn").addEventListener("click", () => {
    score = 0;
    currentQuestion = 0;
    showingFeedback = false;
    quizStartTime = new Date();

    clearInterval(countdownInterval);
    totalTimeSeconds = 90 * 60;
    startTimer();

    questions.sort(() => Math.random() - 0.5);
    document.getElementById("quiz").style.display = "block";
    document.getElementById("finalResult").style.display = "none";
    loadQuestion();
  });

  const summaryDiv = document.getElementById("summaryPage");
    summaryDiv.innerHTML = "<h3>Question Summary</h3>";
    
    userAnswers.forEach((entry, index) => {
      const isCorrect = 
        entry.selected.length === entry.correct.length &&
        entry.correct.every(ans => entry.selected.includes(ans));
    
      const questionHTML = `
        <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 12px;">
          <p><strong>Q${index + 1}:</strong> ${entry.question}</p>
          <p><strong>Your Answer:</strong><br>${entry.selected.join("<br>")}</p>
          <p><strong>Correct Answer:</strong><br>${entry.correct.join("<br>")}</p>
          <p>${isCorrect ? "✅ Correct" : "❌ Incorrect"}</p>
        </div>
      `;
    
      summaryDiv.innerHTML += questionHTML;
    });
    
    // Hide quiz and show summary
    document.getElementById("quiz").style.display = "none";
    document.getElementById("finalResult").style.display = "block";
    document.getElementById("scoreHistory").style.display = "block";
    summaryDiv.style.display = "block";

}


// ─── Bootstrap ───────────────────────────────────────────────────────────────

finishBtn.style.display = "none";
loadQuestion();
startTimer();

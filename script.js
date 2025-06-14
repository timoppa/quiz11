
// script.js

// ─── Question Data ─────────────────────────────────────────────────────────
const questions = [
  {
    "question": "For this question, refer to the Helicopter Racing League (HRL) case study. Your team is in charge of creating a payment card data vault for card numbers used to bill tens of thousands of viewers, merchandise consumers, and season ticket holders. You need to implement a custom card tokenization service that meets the following requirements:\n* It must provide low latency at minimal cost.\n* It must be able to identify duplicate credit cards and must not store plaintext card numbers.\n* It should support annual key rotation.\n\nWhich storage approach should you adopt for your tokenization service?",
    "options": [
      "Store the card data in Secret Manager after running a query to identify duplicates.",
      "Encrypt the card data with a deterministic algorithm stored in Firestore using Datastore mode.",
      "Encrypt the card data with a deterministic algorithm and shard it across multiple Memorystore instances.",
      "Use column-level encryption to store the data in Cloud SQL."
    ],
    "answer": [
      "Encrypt the card data with a deterministic algorithm stored in Firestore using Datastore mode."
    ],
    "multiple": false
  },
  {
    "question": "Question\nFor this question, refer to the Helicopter Racing League (HRL) case study. Recently HRL started a new regional racing league in Cape Town, South Africa. In an effort to give customers in Cape Town a better user experience, HRL has partnered with the Content Delivery Network provider, Fastly. HRL needs to allow traffic coming from all of the Fastly IP address ranges into their Virtual Private Cloud network (VPC network). You are a member of the HRL security team and you need to configure the update that will allow only the Fastly IP address ranges through the External HTTP(S) load balancer. Which command should you use?",
    "options": [
      "gcloud compute security-policies rules update 1000 \\\n-- security-policy from-fastly \\ \n-- src-ip-ranges * \\\n-- action \"allow\"",
      "gcloud firewall rules update sourceiplist-fastly \\\n-- priority 1000 \\ \n-- allow tcp:443",
      "gcloud firewall rules update hlr-policies \\\n-- priority 1000 \\ \n-- target-tags=sourceiplist-fastly \\\n-- allow tcp:443",
      "gcloud compute security-policies rules update 1000 \\\n-- security-policy hlr-policy \\ \n-- expression \"evaluatePreconfiguredExpr ('sourceiplist-fastly')\" \\\n-- action \"allow\""
    ],
    "answer": [
      "gcloud compute security-policies rules update 1000 \\\n-- security-policy from-fastly \\ \n-- src-ip-ranges * \\\n-- action \"allow\""
    ],
    "multiple": false
  },
  {
    "question": "For this question, refer to the Helicopter Racing League (HRL) case study. The HRL development team releases a new version of their predictive capability application every Tuesday evening at 3 a.m. UTC to a repository. The security team at HRL has developed an in-house penetration test Cloud Function called\nAirwolf. The security team wants to run Airwolf against the predictive capability application as soon as it is released every Tuesday. You need to set up Airwolf to run at the recurring weekly cadence. \n\nWhat should you do?",
    "options": [
      "Set up Cloud Tasks and a Cloud Storage bucket that triggers a Cloud Function.",
      "Set up a Cloud Logging sink and a Cloud Storage bucket that triggers a Cloud Function.",
      "Configure the deployment job to notify a Pub/Sub queue that triggers a Cloud Function.",
      "Set up Identity and Access Management (IAM) and Confidential Computing to trigger a Cloud Function."
    ],
    "answer": [
      "Configure the deployment job to notify a Pub/Sub queue that triggers a Cloud Function."
    ],
    "multiple": false
  },
  {
    "question": "Question\nFor this question, refer to the Helicopter Racing League (HRL) case study. HRL wants better prediction accuracy from their ML prediction models. They want you to use Google's AI Platform so HRL can understand and interpret the predictions. \n\nWhat should you do?",
    "options": [
      "Use Explainable AI.",
      "Use Vision AI.",
      "Use Google Cloud's operations suite.",
      "Use Jupyter Notebooks."
    ],
    "answer": [
      "Use Explainable AI."
    ],
    "multiple": false
  },
  {
    "question": "For this question, refer to the Helicopter Racing League (HRL) case study. HRL is looking for a cost-effective approach for storing their race data such as telemetry. They want to keep all historical records, train models using only the previous season's data, and plan for data growth in terms of volume and information collected. You need to propose a data solution. \n\nConsidering HRL business requirements and the goals expressed by CEO S. Hawke, what should you do?",
    "options": [
      "Use Firestore for its scalable and flexible document-based database. Use collections to aggregate race data by season and event.",
      "Use Cloud Spanner for its scalability and ability to version schemas with zero downtime. Split race data using season as a primary key.",
      "Use BigQuery for its scalability and ability to add columns to a schema. Partition race data based on season.",
      "Use Cloud SQL for its ability to automatically manage storage increases and compatibility with MySQL. Use separate database instances for each season."
    ],
    "answer": [
      "Use BigQuery for its scalability and ability to add columns to a schema. Partition race data based on season."
    ],
    "multiple": false
  },
  {
    "question": "For this question, refer to the Helicopter Racing League (HRL) case study. A recent finance audit of cloud infrastructure noted an exceptionally high number of\nCompute Engine instances are allocated to do video encoding and transcoding. You suspect that these Virtual Machines are zombie machines that were not deleted after their workloads completed. You need to quickly get a list of which VM instances are idle. \n\nWhat should you do?",
    "options": [
      "Log into each Compute Engine instance and collect disk, CPU, memory, and network usage statistics for analysis.",
      "Use the gcloud compute instances list to list the virtual machine instances that have the idle: true label set.",
      "Use the gcloud recommender command to list the idle virtual machine instances.",
      "From the Google Console, identify which Compute Engine instances in the managed instance groups are no longer responding to health check probes."
    ],
    "answer": [
      "Use the gcloud recommender command to list the idle virtual machine instances."
    ],
    "multiple": false
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

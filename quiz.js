(() => {
  const questions = window.QUIZ_DATA || [];
  const topics = [...new Set(questions.map((item) => item.topic))];
  const state = { topic: "Todos los temas", list: questions, index: 0, selected: null, checked: false, answers: new Map() };
  const $ = (id) => document.getElementById(id);
  const letters = ["A", "B", "C", "D"];

  function setTopic(topic) {
    state.topic = topic;
    state.list = topic === "Todos los temas" ? questions : questions.filter((item) => item.topic === topic);
    state.index = 0; state.selected = null; state.checked = false;
    document.querySelectorAll(".topic-button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.topic === topic)));
    $("topicPanel").classList.remove("open");
    $("menuButton").setAttribute("aria-expanded", "false");
    $("resultsView").hidden = true; $("quizView").hidden = false;
    render();
  }

  function renderTopics() {
    ["Todos los temas", ...topics].forEach((topic) => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "topic-button"; button.dataset.topic = topic;
      button.textContent = topic === "Todos los temas" ? "Repaso completo (30)" : `${topic} (10)`;
      button.addEventListener("click", () => setTopic(topic));
      $("topicList").append(button);
    });
  }

  function render() {
    const item = state.list[state.index];
    const saved = state.answers.get(item.id);
    state.selected = saved?.selected ?? null; state.checked = Boolean(saved);
    $("topicName").textContent = item.topic;
    $("questionNumber").textContent = `Pregunta ${state.index + 1} de ${state.list.length}`;
    $("questionText").textContent = item.question;
    $("options").replaceChildren();
    item.options.forEach((text, index) => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "option"; button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(state.selected === index));
      button.innerHTML = `<span class="option-letter">${letters[index]}</span><span></span>`;
      button.lastElementChild.textContent = text;
      if (state.selected === index) button.classList.add("selected");
      if (state.checked) {
        button.disabled = true;
        if (index === item.correct) button.classList.add("correct");
        if (index === state.selected && index !== item.correct) button.classList.add("wrong");
      } else button.addEventListener("click", () => { state.selected = index; renderCurrentSelection(); });
      $("options").append(button);
    });
    updateFeedback(item);
    $("previousButton").disabled = state.index === 0;
    $("checkButton").hidden = state.checked; $("checkButton").disabled = state.selected === null;
    $("nextButton").hidden = !state.checked;
    $("nextButton").textContent = state.index === state.list.length - 1 ? "Ver resultado" : "Siguiente";
    updateProgress();
  }

  function renderCurrentSelection() {
    document.querySelectorAll(".option").forEach((button, index) => {
      button.classList.toggle("selected", index === state.selected);
      button.setAttribute("aria-checked", String(index === state.selected));
    });
    $("checkButton").disabled = false;
  }

  function updateFeedback(item) {
    const feedback = $("feedback"); feedback.className = "feedback"; feedback.textContent = "";
    if (!state.checked) return;
    const correct = state.selected === item.correct;
    feedback.textContent = correct ? "Respuesta correcta." : `La respuesta correcta es ${letters[item.correct]}.`;
    feedback.classList.add(correct ? "correct" : "wrong");
  }

  function check() {
    if (state.selected === null) return;
    const item = state.list[state.index];
    state.answers.set(item.id, { selected: state.selected, correct: state.selected === item.correct });
    state.checked = true; render();
  }

  function updateProgress() {
    const answered = questions.filter((item) => state.answers.has(item.id)).length;
    const correct = questions.filter((item) => state.answers.get(item.id)?.correct).length;
    $("progressText").textContent = `${answered} / ${questions.length}`;
    $("progressBar").style.width = `${(answered / questions.length) * 100}%`;
    $("mobileProgressText").textContent = `${answered} / ${questions.length}`;
    $("mobileProgressBar").style.width = `${(answered / questions.length) * 100}%`;
    $("scoreValue").textContent = correct;
  }

  function showResults() {
    const payload = {
      mode: state.topic,
      results: state.list.map((item) => ({
        topic: item.topic,
        question: item.question,
        correct: Boolean(state.answers.get(item.id)?.correct)
      }))
    };
    sessionStorage.setItem("tp2QuizResults", JSON.stringify(payload));
    window.location.href = "resultados.html";
  }

  $("checkButton").addEventListener("click", check);
  $("previousButton").addEventListener("click", () => { if (state.index > 0) { state.index--; render(); } });
  $("nextButton").addEventListener("click", () => { if (state.index < state.list.length - 1) { state.index++; render(); } else showResults(); });
  $("restartButton").addEventListener("click", () => { state.list.forEach((item) => state.answers.delete(item.id)); setTopic(state.topic); updateProgress(); });
  $("menuButton").addEventListener("click", () => {
    const open = $("topicPanel").classList.toggle("open");
    $("menuButton").setAttribute("aria-expanded", String(open));
  });
  renderTopics(); setTopic("Todos los temas"); updateProgress();
})();

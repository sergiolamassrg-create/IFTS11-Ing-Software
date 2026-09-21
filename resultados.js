(() => {
  const raw = sessionStorage.getItem("tp2QuizResults");
  if (!raw) {
    document.getElementById("dashboard").hidden = true;
    document.getElementById("emptyResults").hidden = false;
    return;
  }

  const payload = JSON.parse(raw);
  const results = payload.results || [];
  const total = results.length;
  const correct = results.filter((item) => item.correct).length;
  const wrong = total - correct;
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  const topics = [...new Set(results.map((item) => item.topic))];
  const $ = (id) => document.getElementById(id);

  $("points").textContent = `${correct} / ${total}`;
  $("correctCount").textContent = correct;
  $("wrongCount").textContent = wrong;
  $("percentage").textContent = `${percentage}%`;
  $("scoreRing").style.setProperty("--score", `${percentage * 3.6}deg`);
  $("dashboardSummary").textContent = percentage >= 80
    ? "Muy buen dominio de los contenidos principales."
    : percentage >= 60
      ? "Buen avance general, con algunos conceptos para reforzar."
      : "El tablero señala los temas que conviene volver a revisar.";

  const topicStats = topics.map((topic) => {
    const items = results.filter((item) => item.topic === topic);
    const hits = items.filter((item) => item.correct).length;
    return { topic, total: items.length, hits, percentage: Math.round((hits / items.length) * 100) };
  });

  topicStats.forEach((stat) => {
    const card = document.createElement("article");
    card.className = "topic-stat";
    card.innerHTML = `<div><strong></strong><span>${stat.hits} de ${stat.total}</span></div><div class="stat-track"><span style="width:${stat.percentage}%"></span></div><small>${stat.percentage}%</small>`;
    card.querySelector("strong").textContent = stat.topic;
    $("topicResults").append(card);
  });

  const strong = topicStats.filter((stat) => stat.percentage >= 70).sort((a, b) => b.percentage - a.percentage);
  const adjust = topicStats.filter((stat) => stat.percentage < 70).sort((a, b) => a.percentage - b.percentage);

  function renderInsights(target, items, emptyText) {
    if (!items.length) {
      const text = document.createElement("p"); text.className = "insight-empty"; text.textContent = emptyText; target.append(text); return;
    }
    items.forEach((item) => {
      const row = document.createElement("div"); row.className = "insight-row";
      row.innerHTML = `<span></span><strong>${item.percentage}%</strong>`;
      row.firstElementChild.textContent = item.topic; target.append(row);
    });
  }

  renderInsights($("strongPoints"), strong, "Todavía no hay un tema por encima del 70%.");
  renderInsights($("adjustPoints"), adjust, "No hay temas pendientes de refuerzo.");
})();

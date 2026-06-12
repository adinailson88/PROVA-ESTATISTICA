const CSV_URL = "questoes_exemplo.csv";

let questoes = [];
let filtradas = [];
let indiceSimulado = 0;

const moduloInfo = {
  "1": "Valor de p",
  "2": "Testes estatisticos",
  "3": "Parametricos e nao parametricos",
  "4": "Dados razoaveis",
  "5": "Hipoteses"
};

document.addEventListener("DOMContentLoaded", () => {
  prepararMenu();
  prepararBotoesCodigo();
  prepararFiltros();
  carregarQuestoes();
});

function prepararMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  toggle.addEventListener("click", () => {
    const aberto = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(aberto));
  });
}

function prepararBotoesCodigo() {
  document.querySelectorAll(".copy-code").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.parentElement.querySelector("code").innerText;
      await navigator.clipboard.writeText(code);
      const textoOriginal = button.textContent;
      button.textContent = "Copiado";
      setTimeout(() => { button.textContent = textoOriginal; }, 1200);
    });
  });
}

function prepararFiltros() {
  ["modoExibicao", "filtroModulo", "filtroAssunto", "filtroNivel", "filtroTipo", "buscaTexto"].forEach((id) => {
    document.getElementById(id).addEventListener("input", aplicarFiltros);
  });
  document.getElementById("limparFiltros").addEventListener("click", () => {
    document.getElementById("modoExibicao").value = "estudo";
    document.getElementById("filtroModulo").value = "";
    document.getElementById("filtroAssunto").value = "";
    document.getElementById("filtroNivel").value = "";
    document.getElementById("filtroTipo").value = "";
    document.getElementById("buscaTexto").value = "";
    indiceSimulado = 0;
    aplicarFiltros();
  });
  document.getElementById("anteriorSimulado").addEventListener("click", () => moverSimulado(-1));
  document.getElementById("proximaSimulado").addEventListener("click", () => moverSimulado(1));
}

async function carregarQuestoes() {
  try {
    const resposta = await fetch(CSV_URL, { cache: "no-store" });
    if (!resposta.ok) throw new Error(`Falha ao carregar CSV: ${resposta.status}`);
    const texto = await resposta.text();
    questoes = parseCsv(texto)
      .filter((q) => normalizar(q.ativo) === "sim")
      .sort((a, b) => Number(a.ordem || 9999) - Number(b.ordem || 9999));
    popularSelects();
    renderModuleCards();
    aplicarFiltros();
  } catch (erro) {
    document.getElementById("listaQuestoes").innerHTML = `<article class="question-card"><strong>Erro ao carregar questoes.</strong><p>${escapeHtml(erro.message)}</p></article>`;
  }
}

function parseCsv(texto) {
  const linhas = [];
  let campo = "";
  let linha = [];
  let entreAspas = false;

  for (let i = 0; i < texto.length; i += 1) {
    const char = texto[i];
    const prox = texto[i + 1];
    if (char === '"' && entreAspas && prox === '"') {
      campo += '"';
      i += 1;
    } else if (char === '"') {
      entreAspas = !entreAspas;
    } else if (char === "," && !entreAspas) {
      linha.push(campo);
      campo = "";
    } else if ((char === "\n" || char === "\r") && !entreAspas) {
      if (char === "\r" && prox === "\n") i += 1;
      linha.push(campo);
      if (linha.some((valor) => valor.trim() !== "")) linhas.push(linha);
      linha = [];
      campo = "";
    } else {
      campo += char;
    }
  }
  linha.push(campo);
  if (linha.some((valor) => valor.trim() !== "")) linhas.push(linha);

  const headers = linhas.shift().map((h) => h.trim());
  return linhas.map((valores) => Object.fromEntries(headers.map((h, index) => [h, (valores[index] || "").trim()])));
}

function popularSelects() {
  preencherSelect("filtroModulo", questoes.map((q) => q.modulo), (v) => `Modulo ${v} - ${moduloInfo[v] || v}`);
  preencherSelect("filtroAssunto", questoes.map((q) => q.assunto));
  preencherSelect("filtroNivel", questoes.map((q) => q.nivel));
  preencherSelect("filtroTipo", questoes.map((q) => q.tipo_questao));
}

function preencherSelect(id, valores, rotulo = (v) => v) {
  const select = document.getElementById(id);
  const unicos = [...new Set(valores.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
  select.innerHTML = `<option value="">Todos</option>` + unicos.map((valor) => `<option value="${escapeAttr(valor)}">${escapeHtml(rotulo(valor))}</option>`).join("");
}

function renderModuleCards() {
  const container = document.getElementById("moduleCards");
  const total = questoes.length;
  document.getElementById("totalQuestoesHero").textContent = total;
  container.innerHTML = Object.entries(moduloInfo).map(([modulo, nome]) => {
    const quantidade = questoes.filter((q) => q.modulo === modulo).length;
    return `<article class="module-card"><span class="pill">Modulo ${modulo}</span><h3>${escapeHtml(nome)}</h3><p><strong>${quantidade}</strong> questoes ativas</p></article>`;
  }).join("");
}

function aplicarFiltros() {
  const modo = document.getElementById("modoExibicao").value;
  const modulo = document.getElementById("filtroModulo").value;
  const assunto = document.getElementById("filtroAssunto").value;
  const nivel = document.getElementById("filtroNivel").value;
  const tipo = document.getElementById("filtroTipo").value;
  const busca = normalizar(document.getElementById("buscaTexto").value);

  filtradas = questoes.filter((q) => {
    const textoBusca = normalizar([q.enunciado, q.assunto, q.tags, q.contexto_biossistemas].join(" "));
    return (!modulo || q.modulo === modulo)
      && (!assunto || q.assunto === assunto)
      && (!nivel || q.nivel === nivel)
      && (!tipo || q.tipo_questao === tipo)
      && (!busca || textoBusca.includes(busca));
  });

  if (modo === "revisao") {
    filtradas = filtradas.filter((q) => normalizar(q.revisado) !== "sim");
  }

  if (indiceSimulado >= filtradas.length) indiceSimulado = 0;
  renderQuestoes();
}

function renderQuestoes() {
  const modo = document.getElementById("modoExibicao").value;
  const painel = document.getElementById("simuladoPanel");
  const lista = document.getElementById("listaQuestoes");
  document.getElementById("contadorQuestoes").textContent = `${filtradas.length} questao${filtradas.length === 1 ? "" : "es"} filtrada${filtradas.length === 1 ? "" : "s"}`;

  painel.classList.toggle("hidden", modo !== "simulado");
  if (!filtradas.length) {
    lista.innerHTML = `<article class="question-card">Nenhuma questao encontrada para os filtros atuais.</article>`;
    return;
  }

  const paraRenderizar = modo === "simulado" ? [filtradas[indiceSimulado]] : filtradas;
  if (modo === "simulado") {
    document.getElementById("simuladoProgresso").textContent = `Questao ${indiceSimulado + 1} de ${filtradas.length}`;
  }
  lista.innerHTML = paraRenderizar.map(renderQuestao).join("");
  lista.querySelectorAll("[data-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const alvo = document.getElementById(button.dataset.toggle);
      alvo.classList.toggle("hidden");
    });
  });
  prepararBotoesCodigo();
}

function renderQuestao(q) {
  const idSeguro = escapeAttr(q.id);
  const alternativas = ["a", "b", "c", "d", "e"]
    .map((letra) => [letra.toUpperCase(), q[`alternativa_${letra}`]])
    .filter(([, valor]) => valor)
    .map(([letra, valor]) => `<div><strong>${letra})</strong> ${escapeHtml(valor)}</div>`)
    .join("");

  const codigo = q.codigo_r ? `<pre><button class="copy-code" type="button">Copiar</button><code>${escapeHtml(q.codigo_r)}</code></pre>` : "";
  const saida = q.saida_esperada_r ? `<div class="answer-box"><strong>Saida esperada:</strong><pre><code>${escapeHtml(q.saida_esperada_r)}</code></pre></div>` : "";
  const link = q.link_fonte ? `<a href="${escapeAttr(q.link_fonte)}" target="_blank" rel="noopener">fonte</a>` : escapeHtml(q.fonte || "Fonte nao informada");

  return `<article class="question-card">
    <header>
      <span class="pill">Modulo ${escapeHtml(q.modulo)}</span>
      <span class="pill">${escapeHtml(q.assunto)}</span>
      <span class="pill">${escapeHtml(q.nivel)}</span>
      <span class="pill">${escapeHtml(q.tipo_questao)}</span>
    </header>
    <h3>${escapeHtml(q.enunciado)}</h3>
    <p>${escapeHtml(q.contexto_biossistemas)}</p>
    ${alternativas ? `<div class="alternatives">${alternativas}</div>` : `<p class="source-line">Questao discursiva.</p>`}
    ${codigo}
    ${saida}
    <div class="hero-actions">
      <button type="button" data-toggle="gab-${idSeguro}">Mostrar/ocultar gabarito</button>
      <button type="button" data-toggle="exp-${idSeguro}">Mostrar/ocultar explicacao</button>
    </div>
    <div id="gab-${idSeguro}" class="answer-box hidden"><strong>Gabarito:</strong> ${escapeHtml(q.resposta_correta)}</div>
    <div id="exp-${idSeguro}" class="answer-box hidden"><strong>Explicacao:</strong> ${escapeHtml(q.explicacao)}</div>
    <p class="source-line">Fonte: ${link}. Direitos: ${escapeHtml(q.observacao_direitos || "conteudo autoral")}</p>
  </article>`;
}

function moverSimulado(delta) {
  if (!filtradas.length) return;
  indiceSimulado = (indiceSimulado + delta + filtradas.length) % filtradas.length;
  renderQuestoes();
}

function normalizar(valor) {
  return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function escapeHtml(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(valor) {
  return escapeHtml(valor).replaceAll("`", "&#096;");
}

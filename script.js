// Lista de clubes do Brasileirão com escudos (GE)
const CLUBES_BRASILEIRAO = [
  { id: 1, nome: "Botafogo", escudo: "./escudos/botafogo.png" },
  { id: 2, nome: "Palmeiras", escudo: "./escudos/palmeiras.png" },
  { id: 3, nome: "Flamengo", escudo: "./escudos/flamengo.png" },
  { id: 4, nome: "Chapecoense", escudo: "./escudos/chapecoense.png" },
  { id: 5, nome: "Internacional", escudo: "./escudos/internacional.png" },
  { id: 6, nome: "São Paulo", escudo: "./escudos/saopaulo.png" },
  { id: 7, nome: "Corinthians", escudo: "./escudos/corinthians.png" },
  { id: 8, nome: "Bahia", escudo: "./escudos/bahia.png" },
  { id: 9, nome: "Cruzeiro", escudo: "./escudos/cruzeiro.png" },
  { id: 10, nome: "Vasco", escudo: "./escudos/vasco.png" },
  { id: 11, nome: "Grêmio", escudo: "./escudos/gremio.png" },
  { id: 12, nome: "Atlético-MG", escudo: "./escudos/atleticomg.png" },
  { id: 13, nome: "Fluminense", escudo: "./escudos/fluminense.png" },
  { id: 14, nome: "Vitória", escudo: "./escudos/vitoria.png" },
  { id: 15, nome: "Athletico-PR", escudo: "./escudos/athleticopr.png" },
  { id: 16, nome: "Santos", escudo: "./escudos/santos.png" },
  { id: 17, nome: "Coritiba", escudo: "./escudos/coritiba.png" },
  { id: 18, nome: "Remo", escudo: "./escudos/remo.png" },
  { id: 19, nome: "Mirassol", escudo: "./escudos/mirassol.png" },
  { id: 20, nome: "RB Bragantino", escudo: "./escudos/bragantino.png" },
];

let dados = JSON.parse(localStorage.getItem("csc_fc_v2")) || {
  jogadores: [], // Formato: {nome, clube, escudo}
  rodadas: [],
  placares: {},
  ativo: false,
  config: { idaEVolta: false },
};

// --- FUNÇÕES DE SETUP ---
function popularSelect() {
  const select = document.getElementById("clubSelect");
  if (!select) return;

  select.innerHTML = '<option value="">SELECIONE UM CLUBE</option>';

  // Criamos uma cópia do array e ordenamos por nome (A-Z)
  const clubesOrdenados = [...CLUBES_BRASILEIRAO].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  clubesOrdenados.forEach((c) => {
    select.innerHTML += `<option value="${c.nome}|${c.escudo}">${c.nome}</option>`;
  });
}

function addJogador() {
  const inputNome = document.getElementById("playerInput");
  const selectClube = document.getElementById("clubSelect");

  if (!inputNome.value || !selectClube.value)
    return alert("Preencha nome e clube!");

  const [clube, escudo] = selectClube.value.split("|");

  // Validação: Proibir o mesmo clube duas vezes
  const clubeJaEscolhido = dados.jogadores.some((j) => j.clube === clube);
  if (clubeJaEscolhido) {
    return alert(`O clube ${clube} já foi selecionado por outro jogador!`);
  }

  dados.jogadores.push({
    nome: inputNome.value.trim().toUpperCase(),
    clube: clube,
    escudo: escudo,
  });

  inputNome.value = "";
  selectClube.value = "";
  salvar();
}

function gerarCampeonato() {
  if (dados.jogadores.length < 2)
    return alert("Adicione pelo menos 2 jogadores.");

  const idaEVolta = document.getElementById("idaEVolta").checked;
  dados.config.idaEVolta = idaEVolta;

  let participantes = [...dados.jogadores];
  if (participantes.length % 2 !== 0) {
    participantes.push({ nome: "FOLGA", clube: "FOLGA", escudo: "" });
  }

  const n = participantes.length;
  dados.rodadas = [];
  dados.placares = {};

  // Algoritmo Round Robin
  for (let r = 0; r < n - 1; r++) {
    let jogos = [];
    for (let i = 0; i < n / 2; i++) {
      const casa = participantes[i];
      const fora = participantes[n - 1 - i];
      jogos.push({ casa, fora });
    }
    dados.rodadas.push(jogos);
    participantes.splice(1, 0, participantes.pop());
  }

  // Adiciona o returno se solicitado
  if (idaEVolta) {
    const returno = dados.rodadas.map((rodada) =>
      rodada.map((jogo) => ({ casa: jogo.fora, fora: jogo.casa }))
    );
    dados.rodadas = [...dados.rodadas, ...returno];
  }

  dados.ativo = true;
  salvar();
}

// --- LÓGICA DE JOGO ---
function registrarPlacar(id, valor) {
  dados.placares[id] = valor;
  salvar();
}

function salvar() {
  localStorage.setItem("csc_fc_v2", JSON.stringify(dados));
  render();
}

function render() {
  // 1. Salva a posição atual do scroll
  const scrollPos = window.scrollY;

  // --- NOVA RENDERIZAÇÃO DE INSCRITOS (CARDS) ---
  const containerInscritos = document.getElementById("listaJogadores");
  containerInscritos.innerHTML = ""; // Limpa a área de listagem

  // Define o estilo do container para exibir os cards lado a lado
  containerInscritos.style.display = "flex";
  containerInscritos.style.flexWrap = "wrap";
  containerInscritos.style.gap = "10px";
  containerInscritos.style.marginBottom = "20px";

  dados.jogadores.forEach((j, index) => {
    containerInscritos.innerHTML += `
      <div class="card-inscrito" style="
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 220px;
        position: relative;
      ">
        <img src="${j.escudo}" width="35" height="35" style="object-fit: contain;">
        <div>
          <div style="font-weight: bold; font-size: 0.9rem; color: var(--text-main);">${j.nome}</div>
          <div style="font-size: 0.75rem; color: var(--primary);">${j.clube}</div>
        </div>
        <button onclick="removerJogador(${index})" style="
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          color: var(--negative);
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0 5px;
        ">&times;</button>
      </div>
    `;
  });

  // --- LÓGICA DE EXIBIÇÃO DE TELAS ---
  if (!dados.ativo) {
    document.getElementById("setupArea").style.display = "block";
    document.getElementById("campeonatoArea").style.display = "none";
    popularSelect();
    return;
  }

  document.getElementById("setupArea").style.display = "none";
  document.getElementById("campeonatoArea").style.display = "block";

  // --- RESTANTE DA SUA FUNÇÃO DE RENDERIZAÇÃO DE RODADAS ---
  let html = "";
  dados.rodadas.forEach((rodada, ri) => {
    let jogosHtml = "";
    let espectador = "";

    rodada.forEach((jogo, ji) => {
      if (jogo.casa.nome === "FOLGA" || jogo.fora.nome === "FOLGA") {
        espectador =
          jogo.casa.nome === "FOLGA" ? jogo.fora.nome : jogo.casa.nome;
      } else {
        const keyA = `r${ri}j${ji}a`;
        const keyB = `r${ri}j${ji}b`;
        const valA = dados.placares[keyA] || "";
        const valB = dados.placares[keyB] || "";

        let clA = "",
          clB = "";
        if (valA !== "" && valB !== "") {
          const gA = parseInt(valA);
          const gB = parseInt(valB);
          if (gA > gB) {
            clA = "vitoria";
            clB = "derrota";
          } else if (gB > gA) {
            clB = "vitoria";
            clA = "derrota";
          } else {
            clA = "empate";
            clB = "empate";
          }
        }

        const jogoId = `jogo-${ri}-${ji}`; // ID único para a linha do jogo

        jogosHtml += `
  <div class="jogo-linha" id="${jogoId}">
    <div class="time-container ${clA}" id="${jogoId}-casa" style="text-align:right">
      <img src="${jogo.casa.escudo}" class="escudo">
      <span class="time-label">${jogo.casa.clube}</span>
      <span class="nome-jogador">${jogo.casa.nome}</span>
    </div>
    <div class="placar-input-group">
      <input type="number" value="${valA}" 
        oninput="atualizarPlacarDinamicamente('${ri}', '${ji}', 'a', this.value)">
      <span style="color: var(--border)">x</span>
      <input type="number" value="${valB}" 
        oninput="atualizarPlacarDinamicamente('${ri}', '${ji}', 'b', this.value)">
    </div>
    <div class="time-container ${clB}" id="${jogoId}-fora" style="text-align:left">
      <img src="${jogo.fora.escudo}" class="escudo">
      <span class="time-label">${jogo.fora.clube}</span>
      <span class="nome-jogador">${jogo.fora.nome}</span>
    </div>
  </div>`;
      }
    });

    html += `
      <div class="card">
        <h4 style="color:var(--text-dim); margin-bottom:10px">RODADA ${
          ri + 1
        }</h4>
        ${
          espectador
            ? `<div class="espectador-box">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <strong> Espectador:</strong> ${espectador}</div>`
            : ""
        }
        ${jogosHtml}
      </div>`;
  });

  document.getElementById("rodadasHtml").innerHTML = html;
  calcularTabela();

  // 2. Restaura a posição do scroll após a renderização
  window.scrollTo(0, scrollPos);
}

// Função para remover jogador da lista de inscritos
function removerJogador(index) {
  dados.jogadores.splice(index, 1);
  salvar();
}

// --- CÁLCULO E CLASSIFICAÇÃO ---
function calcularTabela() {
  const s = {};
  dados.jogadores.forEach((j) => {
    s[j.nome] = {
      nome: j.nome,
      clube: j.clube,
      escudo: j.escudo,
      pts: 0,
      j: 0,
      v: 0,
      e: 0,
      d: 0,
      gp: 0,
      gc: 0,
      ultimos: [],
    };
  });

  dados.rodadas.forEach((rodada, ri) => {
    rodada.forEach((jogo, ji) => {
      if (jogo.casa.nome === "FOLGA" || jogo.fora.nome === "FOLGA") return;

      const ga = parseInt(dados.placares[`r${ri}j${ji}a`]);
      const gb = parseInt(dados.placares[`r${ri}j${ji}b`]);

      if (isNaN(ga) || isNaN(gb)) return;

      const pA = s[jogo.casa.nome];
      const pB = s[jogo.fora.nome];

      pA.j++;
      pB.j++;
      pA.gp += ga;
      pA.gc += gb;
      pB.gp += gb;
      pB.gc += ga;

      if (ga > gb) {
        pA.pts += 3;
        pA.v++;
        pA.ultimos.push("v");
        pB.d++;
        pB.ultimos.push("d");
      } else if (gb > ga) {
        pB.pts += 3;
        pB.v++;
        pB.ultimos.push("v");
        pA.d++;
        pA.ultimos.push("d");
      } else {
        pA.pts += 1;
        pA.e++;
        pA.ultimos.push("e");
        pB.pts += 1;
        pB.e++;
        pB.ultimos.push("e");
      }
    });
  });

  const ranking = Object.values(s).sort(
    (a, b) => b.pts - a.pts || b.gp - b.gc - (a.gp - a.gc) || b.gp - a.gp
  );

  // Verifica se o campeonato acabou para mostrar campeão
  const totalJogosEsperados =
    (dados.jogadores.length % 2 === 0
      ? dados.jogadores.length - 1
      : dados.jogadores.length) * (dados.config.idaEVolta ? 2 : 1);
  const campeonatoFinalizado = ranking.every(
    (p) => p.j === totalJogosEsperados
  );

  if (campeonatoFinalizado && ranking.length > 0) {
    exibirCampeao(ranking[0]);
  }

  document.getElementById("corpoTabela").innerHTML = ranking
    .map((t, i) => {
      const sg = t.gp - t.gc;
      const ultimos5 = t.ultimos
        .slice(-5)
        .map((res) => `<span class="forma-ponto ${res}-cor"></span>`)
        .join("");

      let destaque = "";
      if (i === 0) destaque = "👑";
      if (i === ranking.length - 1 && ranking.length > 1) destaque = "👻";

      return `
      <tr>
          <td>${destaque} ${i + 1}º</td>
          <td style="text-align:left">
            <div style="display:flex; align-items:center; gap:8px">
                <img src="${t.escudo}" width="20">
                <div>
                    <div style="font-weight:bold; font-size:0.85rem">${
                      t.clube
                    }</div>
                    <div style="font-size:0.65rem; color:var(--text-dim)">${
                      t.nome
                    }</div>
                </div>
            </div>
          </td>
          <td><strong>${t.pts}</strong></td>
          <td>${t.j}</td>
          <td>${t.v}</td>
          <td>${t.e}</td>
          <td>${t.d}</td>
          <td>${t.gp}</td> <td>${t.gc}</td> <td>${sg}</td>
          <td><div style="display:flex; justify-content:center">${ultimos5}</div></td>
      </tr>`;
    })
    .join("");
}

function exibirCampeao(campeao) {
  const area = document.getElementById("alertaCampeao");
  if (!area) return;
  area.innerHTML = `
        <div class="card" style="border: 2px solid var(--warning); text-align:center; background: rgba(245, 158, 11, 0.1)">
            <h2 style="color: var(--warning)">🏆 CAMPEÃO DEFINIDO 🏆</h2>
            <img src="${campeao.escudo}" width="80" style="margin:10px">
            <h1 style="margin:0">${campeao.clube}</h1>
            <p style="color: var(--text-dim)">Controlado por: ${campeao.nome}</p>
        </div>
    `;
}

// --- UTILITÁRIOS ---
function resetarTudo() {
  if (confirm("Resetar campeonato?")) {
    localStorage.removeItem("csc_fc_v2");
    location.reload();
  }
}

// Função para capturar a tabela como imagem (necessita da lib html2canvas no HTML)
function compartilharTabela() {
  const elemento = document.getElementById("tabelaParaImagem");
  html2canvas(elemento, { backgroundColor: "#1e293b", scale: 2 }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "tabela-campeonato.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

// Função para Exportar os dados do campeonato (Backup)
function exportarJSON() {
  if (dados.jogadores.length === 0) return alert("Não há dados para exportar.");

  const blob = new Blob([JSON.stringify(dados, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `backup_campeonato_${new Date()
    .toLocaleDateString()
    .replace(/\//g, "-")}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

// Função para Importar os dados do campeonato (Restaurar Backup)
function importarJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const conteudo = JSON.parse(e.target.result);

      // Validação básica para garantir que o arquivo é compatível
      if (conteudo.jogadores && conteudo.rodadas) {
        dados = conteudo;
        salvar();
        alert("Campeonato importado com sucesso!");
        location.reload(); // Recarrega para garantir que a interface atualize tudo
      } else {
        alert("Arquivo JSON inválido para este sistema.");
      }
    } catch (err) {
      alert("Erro ao ler o arquivo JSON.");
    }
  };
  reader.readAsText(file);
}

function atualizarPlacarDinamicamente(ri, ji, lado, valor) {
    const key = `r${ri}j${ji}${lado}`;
    dados.placares[key] = valor;
    
    // Salva no localStorage sem renderizar tudo
    localStorage.setItem("csc_fc_v2", JSON.stringify(dados));

    const valA = dados.placares[`r${ri}j${ji}a`] || "";
    const valB = dados.placares[`r${ri}j${ji}b`] || "";

    const elCasa = document.getElementById(`jogo-${ri}-${ji}-casa`);
    const elFora = document.getElementById(`jogo-${ri}-${ji}-fora`);

    if (elCasa && elFora) {
        // Limpa classes anteriores
        elCasa.classList.remove("vitoria", "derrota", "empate");
        elFora.classList.remove("vitoria", "derrota", "empate");

        if (valA !== "" && valB !== "") {
            const gA = parseInt(valA);
            const gB = parseInt(valB);

            if (gA > gB) {
                elCasa.classList.add("vitoria");
                elFora.classList.add("derrota");
            } else if (gB > gA) {
                elFora.classList.add("vitoria");
                elCasa.classList.add("derrota");
            } else {
                elCasa.classList.add("empate");
                elFora.classList.add("empate");
            }
        }
    }

    // Atualiza apenas a tabela de classificação
    calcularTabela();
}

document.addEventListener("DOMContentLoaded", render);

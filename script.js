let dados = JSON.parse(localStorage.getItem("csc_fc_v2")) || {
  jogadores: [],
  rodadas: [],
  placares: {},
  ativo: false,
};

function addJogador() {
  const input = document.getElementById("playerInput");
  const nome = input.value.trim().toUpperCase();
  if (nome && !dados.jogadores.includes(nome)) {
    dados.jogadores.push(nome);
    input.value = "";
    render();
  }
}

function gerarCampeonato() {
  if (dados.jogadores.length < 2)
    return alert("Adicione pelo menos 2 jogadores.");

  let temp = [...dados.jogadores];
  if (temp.length % 2 !== 0) temp.push("FOLGA");

  const n = temp.length;
  dados.rodadas = [];
  dados.placares = {};

  for (let r = 0; r < n - 1; r++) {
    let jogos = [];
    for (let i = 0; i < n / 2; i++) {
      const casa = temp[i];
      const fora = temp[n - 1 - i];
      jogos.push({ casa, fora });
    }
    dados.rodadas.push(jogos);
    temp.splice(1, 0, temp.pop());
  }
  dados.ativo = true;
  salvar();
}

function registrarPlacar(id, valor) {
  dados.placares[id] = valor;
  salvar();
}

function salvar() {
  localStorage.setItem("csc_fc_v2", JSON.stringify(dados));
  render();
}

function render() {
  document.getElementById("listaJogadores").innerText =
    "Inscritos: " + dados.jogadores.join(" • ");

  if (!dados.ativo) {
    document.getElementById("setupArea").style.display = "block";
    document.getElementById("campeonatoArea").style.display = "none";
    return;
  }

  document.getElementById("setupArea").style.display = "none";
  document.getElementById("campeonatoArea").style.display = "block";

  let html = "";
  dados.rodadas.forEach((rodada, ri) => {
    let espectador = "";
    let jogosHtml = "";

    rodada.forEach((jogo, ji) => {
      if (jogo.casa === "FOLGA" || jogo.fora === "FOLGA") {
        espectador = jogo.casa === "FOLGA" ? jogo.fora : jogo.casa;
      } else {
        const keyA = `r${ri}j${ji}a`;
        const keyB = `r${ri}j${ji}b`;
        const valA = dados.placares[keyA] || "";
        const valB = dados.placares[keyB] || "";

        // Lógica de cores
        let classeA = "",
          classeB = "";
        const gA = parseInt(valA);
        const gB = parseInt(valB);
        if (!isNaN(gA) && !isNaN(gB)) {
          if (gA > gB) {
            classeA = "vitoria";
            classeB = "derrota";
          } else if (gB > gA) {
            classeB = "vitoria";
            classeA = "derrota";
          } else {
            classeA = "empate";
            classeB = "empate";
          }
        }

        jogosHtml += `
                        <div class="jogo-linha">
                            <span class="time-label time-a ${classeA}">${jogo.casa}</span>
                            <input type="number" value="${valA}" oninput="registrarPlacar('${keyA}', this.value)">
                            <span style="color: var(--border)">x</span>
                            <input type="number" value="${valB}" oninput="registrarPlacar('${keyB}', this.value)">
                            <span class="time-label time-b ${classeB}">${jogo.fora}</span>
                        </div>`;
      }
    });

    html += `
                <div class="card">
                    <h4 style="margin-bottom:10px; color:var(--text-dim)">Rodada ${
                      ri + 1
                    }</h4>
                    ${
                      espectador
                        ? `<div class="espectador-box">👁️ Espectador: ${espectador}</div>`
                        : ""
                    }
                    ${jogosHtml}
                </div>`;
  });
  document.getElementById("rodadasHtml").innerHTML = html;
  calcularTabela();
}

function exportarJSON() {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(dados, null, 2));
  const dlAnchorElem = document.createElement("a");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "banco_torneio.json");
  dlAnchorElem.click();
}

// --- FUNÇÃO DE IMPORTAR JSON ---
function importarJSON(event) {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = function (e) {
    try {
      const conteudo = JSON.parse(e.target.result);

      // Validação simples para ver se o arquivo tem a estrutura correta
      if (conteudo.jogadores && conteudo.rodadas) {
        dados = conteudo;
        salvar(); // Isso salva no localStorage e faz o render()
        alert("Campeonato importado com sucesso!");
      } else {
        alert("Arquivo JSON inválido!");
      }
    } catch (err) {
      alert("Erro ao ler o arquivo JSON.");
    }
  };
  leitor.readAsText(arquivo);
}

// --- CÁLCULO DA TABELA ATUALIZADO ---
function calcularTabela() {
  const s = {};
  // Inicializa todas as estatísticas
  dados.jogadores.forEach(
    (j) => (s[j] = { pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 })
  );

  dados.rodadas.forEach((rodada, ri) => {
    rodada.forEach((jogo, ji) => {
      if (jogo.casa === "FOLGA" || jogo.fora === "FOLGA") return;

      const ga = parseInt(dados.placares[`r${ri}j${ji}a`]);
      const gb = parseInt(dados.placares[`r${ri}j${ji}b`]);

      if (isNaN(ga) || isNaN(gb)) return;

      // Contabiliza Jogos e Gols
      s[jogo.casa].j++;
      s[jogo.fora].j++;
      s[jogo.casa].gp += ga;
      s[jogo.casa].gc += gb;
      s[jogo.fora].gp += gb;
      s[jogo.fora].gc += ga;

      // Lógica de Vitórias, Empates e Derrotas
      if (ga > gb) {
        s[jogo.casa].pts += 3;
        s[jogo.casa].v++;
        s[jogo.fora].d++;
      } else if (gb > ga) {
        s[jogo.fora].pts += 3;
        s[jogo.fora].v++;
        s[jogo.casa].d++;
      } else {
        s[jogo.casa].pts += 1;
        s[jogo.fora].pts += 1;
        s[jogo.casa].e++;
        s[jogo.fora].e++;
      }
    });
  });

  const ranking = Object.entries(s)
    .map(([nome, stats]) => ({ nome, ...stats, sg: stats.gp - stats.gc }))
    .sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp);

  // Renderiza a tabela com todas as colunas
  document.getElementById("corpoTabela").innerHTML = ranking
    .map(
      (t, i) => `
        <tr>
            <td class="${
              i === 0
                ? "pos-lider"
                : i === ranking.length - 1
                ? "pos-lanterna"
                : ""
            }">${i + 1}º</td>
            <td style="text-align:left; font-weight:bold">${t.nome}</td>
            <td>${t.pts}</td>
            <td>${t.j}</td>
            <td>${t.v}</td>
            <td>${t.e}</td>
            <td>${t.d}</td>
            <td style="color: var(--text-dim)">${t.gp}</td>
            <td style="color: var(--text-dim)">${t.gc}</td>
            <td style="color: ${
              t.sg > 0
                ? "var(--positive)"
                : t.sg < 0
                ? "var(--negative)"
                : "inherit"
            }">${t.sg}</td>
        </tr>
    `
    )
    .join("");
}

function resetarTudo() {
  if (confirm("Resetar campeonato?")) {
    localStorage.removeItem("csc_fc_v2");
    location.reload();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  render();

  if(document.getElementById("playerInput")) {
      document.getElementById("playerInput").focus();
  }
});

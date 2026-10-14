// Array que armazenará as tarefas cadastradas
const listaDeTarefas = [];

// Áreas disponíveis para as tarefas (ícones do Font Awesome).
// Para criar uma nova área, basta adicionar uma linha aqui.
const CATEGORIAS = {
    pessoal:    { nome: "Pessoal",    icone: "fa-user",           cor: "#6C5CE7" },
    trabalho:   { nome: "Trabalho",   icone: "fa-briefcase",      cor: "#0984E3" },
    escola:     { nome: "Escola",     icone: "fa-pencil",         cor: "#E17055" },
    faculdade:  { nome: "Faculdade",  icone: "fa-graduation-cap", cor: "#00946F" },
    casa:       { nome: "Casa",       icone: "fa-house",          cor: "#D68910" },
    saude:      { nome: "Saúde",      icone: "fa-heart-pulse",    cor: "#E84393" },
    financas:   { nome: "Finanças",   icone: "fa-wallet",         cor: "#1F86C4" }
};

const CATEGORIA_PADRAO = "pessoal";

/* ---------- Histórico de atualizações ----------
   Para registrar uma mudança nova, adicione um objeto no INÍCIO
   desta lista (as mais recentes aparecem primeiro). */
const ATUALIZACOES = [
    {
        titulo: "Tarefas salvas no navegador",
        icone: "fa-floppy-disk",
        resumo: "As tarefas agora continuam na lista depois de recarregar ou fechar a página.",
        grupos: [
            {
                nome: "JS",
                itens: [
                    "Persistência com localStorage: a lista é salva ao adicionar, concluir ou remover uma tarefa.",
                    "Ao abrir a página, as tarefas salvas são lidas, validadas e exibidas de novo.",
                    "Dados corrompidos ou inválidos são ignorados sem quebrar a página.",
                    "Se a página estiver aberta em duas abas, elas se mantêm sincronizadas."
                ]
            }
        ]
    },
    {
        titulo: "Animação nos filtros",
        icone: "fa-arrows-left-right",
        resumo: "O fundo dos botões Todas, Pendentes e Concluídas agora desliza até a opção escolhida.",
        grupos: [
            {
                nome: "HTML, CSS e JS",
                itens: [
                    "Novo elemento de fundo dentro dos filtros, que se move e muda de largura com uma leve elasticidade.",
                    "A posição é calculada pelo JavaScript e se ajusta sozinha quando a janela é redimensionada.",
                    "Quem reduz movimento no sistema vê a troca instantânea, sem animação."
                ]
            }
        ]
    },
    {
        titulo: "Botão de atualizações",
        icone: "fa-clock-rotate-left",
        resumo: "Esta janela, com o registro de tudo o que foi alterado no painel hoje.",
        grupos: [
            {
                nome: "HTML, CSS e JS",
                itens: [
                    "Novo botão com ícone de relógio no cabeçalho, ao lado do botão de tema.",
                    "Janela (<dialog>) que fecha com o X, com a tecla Esc ou clicando fora dela.",
                    "A lista de atualizações fica no array ATUALIZACOES do script.js, fácil de editar."
                ]
            }
        ]
    },
    {
        titulo: "Novo visual",
        icone: "fa-palette",
        resumo: "Redesign completo do painel, nos modos claro e escuro.",
        grupos: [
            {
                nome: "CSS",
                itens: [
                    "Fundo com grade de pontos, como papel de planejador, no lugar do degradê.",
                    "Cartão com borda escura e sombra sólida deslocada; o botão Adicionar afunda ao clicar.",
                    "Fontes novas: Bricolage Grotesque nos títulos e Figtree no texto.",
                    "Paleta refeita para os dois temas, mantendo o roxo original.",
                    "Faixa lateral em cada tarefa na cor da sua área.",
                    "Botão circular para concluir, que se preenche de verde.",
                    "Prazo exibido como etiqueta, em vermelho quando está atrasado.",
                    "Filtros viraram um controle segmentado.",
                    "Só a tarefa recém-criada anima ao entrar na lista.",
                    "Layout adaptado ao celular e respeito à opção de reduzir movimento."
                ]
            },
            {
                nome: "HTML e JS",
                itens: [
                    "Data de hoje exibida abaixo do título.",
                    "Barra de progresso com a porcentagem de tarefas concluídas (substitui o contador do rodapé).",
                    "Contagem de tarefas em cada botão de filtro.",
                    "Nome da área escolhida ao lado dos ícones de área.",
                    "Cores de algumas áreas ajustadas para o ícone branco ficar legível."
                ]
            }
        ]
    },
    {
        titulo: "Três novas funções",
        icone: "fa-wand-magic-sparkles",
        resumo: "Prazos, filtros e áreas para organizar melhor as tarefas.",
        grupos: [
            {
                nome: "Calendário para o prazo",
                itens: [
                    "Seletor de data opcional ao lado do campo de texto.",
                    "Datas passadas não podem ser escolhidas.",
                    "O prazo aparece abaixo da tarefa no formato dd/mm/aaaa.",
                    "Tarefas pendentes com prazo vencido são marcadas como atrasadas.",
                    "Calendário também escuro no modo escuro."
                ]
            },
            {
                nome: "Filtros Todas, Pendentes e Concluídas",
                itens: [
                    "Três botões acima da lista, com o filtro ativo destacado.",
                    "Mensagem amigável quando não há tarefas no filtro escolhido."
                ]
            },
            {
                nome: "Logos de área",
                itens: [
                    "Sete áreas com ícone e cor próprios: Pessoal, Trabalho, Escola, Faculdade, Casa, Saúde e Finanças.",
                    "O logo escolhido aparece à esquerda de cada tarefa.",
                    "Para criar uma área nova, basta adicionar uma linha no objeto CATEGORIAS."
                ]
            }
        ]
    },
];

// Chave sob a qual a lista de tarefas é guardada no localStorage do navegador
const CHAVE_ARMAZENAMENTO = "painelTarefas.tarefas";

let proximoId = 1;
let filtroAtual = "todas"; // "todas" | "pendentes" | "concluidas"
let ultimoAdicionadoId = null; // usado só para animar a tarefa recém-criada

class Tarefa {
    #concluida;
    constructor(descricao, categoria = CATEGORIA_PADRAO, prazo = "") {
        if (!descricao || descricao.trim() === "") {
            throw new Error("A tarefa não pode estar vazia.");
        }

        if (descricao.length > 40) {
            throw new Error("A tarefa não pode ter mais de 40 caracteres.");
        }

        if (!CATEGORIAS[categoria]) {
            throw new Error("Escolha uma área válida para a tarefa.");
        }

        this.id = proximoId++;
        this.descricao = descricao.trim();
        this.categoria = categoria;
        this.prazo = prazo || null; // formato "AAAA-MM-DD" ou null

        this.#concluida = false;
    }

    get concluida() {
        return this.#concluida;
    }

    // Tarefa pendente com prazo anterior a hoje
    get atrasada() {
        if (!this.prazo || this.#concluida) {
            return false;
        }
        return dataDoPrazo(this.prazo) < inicioDoDia(new Date());
    }

    alternarConclusao() {
        this.#concluida = !this.#concluida;
    }

    // Campos privados (#) não entram no JSON.stringify sozinhos.
    // Este método diz exatamente o que deve ser salvo de cada tarefa.
    toJSON() {
        return {
            id: this.id,
            descricao: this.descricao,
            categoria: this.categoria,
            prazo: this.prazo,
            concluida: this.#concluida
        };
    }

    // Reconstrói uma Tarefa a partir de um objeto salvo.
    // Passa pelo construtor, então os dados são validados de novo.
    static deDados(dados) {
        const tarefa = new Tarefa(dados.descricao, dados.categoria, dados.prazo);

        if (Number.isInteger(dados.id)) {
            tarefa.id = dados.id;
        }

        if (dados.concluida === true) {
            tarefa.alternarConclusao();
        }

        return tarefa;
    }
}

/* ---------- Armazenamento local (localStorage) ---------- */

function salvarTarefas() {
    try {
        localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(listaDeTarefas));
    } catch (erro) {
        // Pode falhar se o armazenamento estiver bloqueado ou cheio
        console.error("Não foi possível salvar as tarefas:", erro);
    }
}

function carregarTarefas() {
    listaDeTarefas.length = 0;

    try {
        const textoSalvo = localStorage.getItem(CHAVE_ARMAZENAMENTO);

        if (!textoSalvo) {
            return;
        }

        const dadosSalvos = JSON.parse(textoSalvo);

        if (!Array.isArray(dadosSalvos)) {
            return;
        }

        const idsUsados = new Set();

        dadosSalvos.forEach((dados) => {
            try {
                const tarefa = Tarefa.deDados(dados);

                // Garante que não existam dois ids iguais
                if (idsUsados.has(tarefa.id)) {
                    tarefa.id = proximoId++;
                }

                idsUsados.add(tarefa.id);
                listaDeTarefas.push(tarefa);
            } catch (erro) {
                // Ignora apenas o registro inválido e segue com os outros
                console.warn("Tarefa salva ignorada por ser inválida:", dados);
            }
        });
    } catch (erro) {
        console.error("Não foi possível ler as tarefas salvas:", erro);
    }

    // O próximo id precisa ser maior que qualquer id já existente
    proximoId = Math.max(0, ...listaDeTarefas.map((t) => t.id)) + 1;
}

const campoTarefa = document.getElementById("campo-tarefa");
const campoPrazo = document.getElementById("campo-prazo");
const seletorCategoria = document.getElementById("seletor-categoria");
const botaoAdicionar = document.getElementById("botao-adicionar");
const listaTarefasHTML = document.getElementById("lista-tarefas");
const nomeCategoria = document.getElementById("nome-categoria");
const dataHoje = document.getElementById("data-hoje");
const botaoAtualizacoes = document.getElementById("botao-atualizacoes");
const dialogoAtualizacoes = document.getElementById("dialogo-atualizacoes");
const botaoFecharAtualizacoes = document.getElementById("botao-fechar-atualizacoes");
const listaAtualizacoes = document.getElementById("lista-atualizacoes");
const textoProgresso = document.getElementById("texto-progresso");
const porcentagemProgresso = document.getElementById("porcentagem-progresso");
const barraProgresso = document.getElementById("barra-progresso");
const botaoAlternarTema = document.getElementById("botao-alternar-tema");
const botoesFiltro = document.querySelectorAll(".botao-filtro");
const containerFiltros = document.getElementById("filtros");
const indicadorFiltro = document.getElementById("indicador-filtro");

/* ---------- Funções auxiliares de data ---------- */

// Converte "AAAA-MM-DD" em Date local (evita erro de fuso horário)
function dataDoPrazo(prazo) {
    const [ano, mes, dia] = prazo.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

function inicioDoDia(data) {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function formatarPrazo(prazo) {
    return dataDoPrazo(prazo).toLocaleDateString("pt-BR");
}

function dataDeHoje() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${hoje.getFullYear()}-${mes}-${dia}`;
}

/* ---------- Seletor de categoria (logos) ---------- */

function criarSeletorCategorias() {
    Object.entries(CATEGORIAS).forEach(([chave, categoria]) => {
        const rotulo = document.createElement("label");
        rotulo.className = "opcao-categoria";
        rotulo.title = categoria.nome;
        rotulo.style.setProperty("--cor-categoria", categoria.cor);

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "categoria";
        radio.value = chave;
        radio.checked = chave === CATEGORIA_PADRAO;
        radio.setAttribute("aria-label", categoria.nome);

        const icone = document.createElement("i");
        icone.className = `fa-solid ${categoria.icone}`;

        rotulo.append(radio, icone);
        seletorCategoria.appendChild(rotulo);
    });

    atualizarNomeCategoria();
}

function atualizarNomeCategoria() {
    nomeCategoria.textContent = CATEGORIAS[categoriaSelecionada()].nome;
}

function categoriaSelecionada() {
    const marcado = seletorCategoria.querySelector("input[name='categoria']:checked");
    return marcado ? marcado.value : CATEGORIA_PADRAO;
}

/* ---------- Contador e filtros ---------- */

function atualizarResumo() {
    const total = listaDeTarefas.length;
    const concluidas = listaDeTarefas.filter((t) => t.concluida).length;
    const pendentes = total - concluidas;
    const porcentagem = total === 0 ? 0 : Math.round((concluidas / total) * 100);

    // Contagem nos botões de filtro
    document.getElementById("contagem-todas").textContent = total;
    document.getElementById("contagem-pendentes").textContent = pendentes;
    document.getElementById("contagem-concluidas").textContent = concluidas;

    // Barra de progresso
    barraProgresso.style.width = `${porcentagem}%`;
    porcentagemProgresso.textContent = `${porcentagem}%`;

    if (total === 0) {
        textoProgresso.textContent = "Sem tarefas ainda";
    } else if (pendentes === 0) {
        textoProgresso.textContent = "Tudo concluído!";
    } else {
        textoProgresso.textContent = `${concluidas} de ${total} concluídas`;
    }
}

function tarefasFiltradas() {
    switch (filtroAtual) {
        case "pendentes":
            return listaDeTarefas.filter((tarefa) => !tarefa.concluida);
        case "concluidas":
            return listaDeTarefas.filter((tarefa) => tarefa.concluida);
        default:
            return listaDeTarefas;
    }
}

function mensagemListaVazia() {
    if (listaDeTarefas.length === 0) {
        return "Nenhuma tarefa ainda. Adicione a primeira!";
    }
    if (filtroAtual === "pendentes") {
        return "Nenhuma tarefa pendente.";
    }
    return "Nenhuma tarefa concluída.";
}

/* ---------- Renderização ---------- */

function criarBotaoAcao(classes, titulo, iconeClasse, aoClicar) {
    const botao = document.createElement("button");
    botao.className = classes;
    botao.title = titulo;

    const icone = document.createElement("i");
    icone.className = iconeClasse;
    botao.appendChild(icone);

    botao.addEventListener("click", aoClicar);
    return botao;
}

function criarItemTarefa(tarefa) {
    const categoria = CATEGORIAS[tarefa.categoria];

    const item = document.createElement("li");
    item.classList.add("item-tarefa");
    if (tarefa.concluida) item.classList.add("concluido");
    if (tarefa.atrasada) item.classList.add("atrasada");
    if (tarefa.id === ultimoAdicionadoId) item.classList.add("nova");

    // Botão circular de concluir
    const botaoCheck = document.createElement("button");
    botaoCheck.className = "botao-check";
    botaoCheck.title = tarefa.concluida ? "Marcar como pendente" : "Concluir tarefa";
    botaoCheck.setAttribute("aria-pressed", String(tarefa.concluida));
    botaoCheck.innerHTML = '<i class="fa-solid fa-check"></i>';
    botaoCheck.addEventListener("click", () => alternarConclusao(tarefa.id));

    // Logo da área
    const logo = document.createElement("span");
    logo.className = "logo-categoria";
    logo.title = categoria.nome;
    logo.style.setProperty("--cor-categoria", categoria.cor);
    logo.innerHTML = `<i class="fa-solid ${categoria.icone}"></i>`;

    // Texto + prazo
    const conteudo = document.createElement("div");
    conteudo.className = "conteudo-tarefa";

    const descricao = document.createElement("span");
    descricao.className = "descricao-tarefa";
    descricao.textContent = tarefa.descricao; // textContent evita injeção de HTML
    conteudo.appendChild(descricao);

    if (tarefa.prazo) {
        const prazo = document.createElement("small");
        prazo.className = "prazo-tarefa";
        prazo.innerHTML = `<i class="fa-regular fa-calendar"></i> `;
        prazo.append(
            tarefa.atrasada
                ? `Atrasada: ${formatarPrazo(tarefa.prazo)}`
                : formatarPrazo(tarefa.prazo)
        );
        conteudo.appendChild(prazo);
    }

    // Ações
    const acoes = document.createElement("div");
    acoes.className = "acoes-tarefa";
    acoes.append(
        criarBotaoAcao(
            "botao-acao excluir",
            "Remover tarefa",
            "fa-solid fa-trash",
            () => removerTarefa(tarefa.id)
        )
    );

    item.append(botaoCheck, logo, conteudo, acoes);
    return item;
}

function renderizarTarefas() {
    listaTarefasHTML.innerHTML = "";

    const visiveis = tarefasFiltradas();

    if (visiveis.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "lista-vazia";
        vazio.textContent = mensagemListaVazia();
        listaTarefasHTML.appendChild(vazio);
    }

    visiveis.forEach((tarefa) => {
        listaTarefasHTML.appendChild(criarItemTarefa(tarefa));
    });

    ultimoAdicionadoId = null;
    atualizarResumo();
}

/* ---------- Ações ---------- */

function adicionarTarefa() {
    try {
        const novaTarefa = new Tarefa(
            campoTarefa.value,
            categoriaSelecionada(),
            campoPrazo.value
        );

        listaDeTarefas.push(novaTarefa);
        ultimoAdicionadoId = novaTarefa.id;
        salvarTarefas();

        renderizarTarefas();

        campoTarefa.value = "";
        campoPrazo.value = "";

        campoTarefa.focus();
    } catch (error) {
        alert(error.message);
    }
}

// Agora as tarefas são localizadas pelo id (e não pelo índice),
// para que as ações funcionem corretamente com os filtros ativos.
function alternarConclusao(id) {
    const tarefa = listaDeTarefas.find((t) => t.id === id);

    if (!tarefa) {
        return;
    }

    tarefa.alternarConclusao();

    salvarTarefas();
    renderizarTarefas();
}

function removerTarefa(id) {
    const indice = listaDeTarefas.findIndex((t) => t.id === id);

    if (indice === -1) {
        return;
    }

    listaDeTarefas.splice(indice, 1);

    salvarTarefas();
    renderizarTarefas();
}

// Move o fundo deslizante para trás do botão ativo
function posicionarIndicadorFiltro() {
    const ativo = containerFiltros.querySelector(".botao-filtro.ativo");

    if (!ativo) {
        return;
    }

    indicadorFiltro.style.width = `${ativo.offsetWidth}px`;
    indicadorFiltro.style.transform = `translateX(${ativo.offsetLeft}px)`;
}

function definirFiltro(filtro) {
    filtroAtual = filtro;

    botoesFiltro.forEach((botao) => {
        botao.classList.toggle("ativo", botao.dataset.filtro === filtro);
    });

    posicionarIndicadorFiltro();

    renderizarTarefas();
}

/* ---------- Janela de atualizações ---------- */

function renderizarAtualizacoes() {
    listaAtualizacoes.innerHTML = "";

    ATUALIZACOES.forEach((atualizacao) => {
        const secao = document.createElement("section");
        secao.className = "atualizacao";

        const titulo = document.createElement("h3");
        titulo.className = "atualizacao-titulo";
        titulo.innerHTML = `<span class="atualizacao-icone"><i class="fa-solid ${atualizacao.icone}"></i></span>`;
        titulo.append(atualizacao.titulo);

        const resumo = document.createElement("p");
        resumo.className = "atualizacao-resumo";
        resumo.textContent = atualizacao.resumo;

        secao.append(titulo, resumo);

        atualizacao.grupos.forEach((grupo) => {
            const bloco = document.createElement("div");
            bloco.className = "atualizacao-grupo";

            const nome = document.createElement("h4");
            nome.textContent = grupo.nome;

            const lista = document.createElement("ul");
            grupo.itens.forEach((texto) => {
                const li = document.createElement("li");
                li.textContent = texto;
                lista.appendChild(li);
            });

            bloco.append(nome, lista);
            secao.appendChild(bloco);
        });

        listaAtualizacoes.appendChild(secao);
    });
}

/* ---------- Eventos ---------- */

botaoAdicionar.addEventListener("click", () => {
    adicionarTarefa();
});

campoTarefa.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        adicionarTarefa();
    }
});

botoesFiltro.forEach((botao) => {
    botao.addEventListener("click", () => definirFiltro(botao.dataset.filtro));
});

seletorCategoria.addEventListener("change", atualizarNomeCategoria);

botaoAtualizacoes.addEventListener("click", () => {
    listaAtualizacoes.scrollTop = 0;
    dialogoAtualizacoes.showModal();
});

botaoFecharAtualizacoes.addEventListener("click", () => {
    dialogoAtualizacoes.close();
});

// Fecha ao clicar no fundo escurecido (fora da janela)
dialogoAtualizacoes.addEventListener("click", (event) => {
    if (event.target === dialogoAtualizacoes) {
        dialogoAtualizacoes.close();
    }
});

botaoAlternarTema.addEventListener("click", () => {
    document.body.classList.toggle("modo-escuro");

    const icone = botaoAlternarTema.querySelector("i");

    if (document.body.classList.contains("modo-escuro")) {
        icone.classList.remove("fa-moon");
        icone.classList.add("fa-sun");
    } else {
        icone.classList.remove("fa-sun");
        icone.classList.add("fa-moon");
    }
});

/* ---------- Inicialização ---------- */

dataHoje.textContent = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
});

campoPrazo.min = dataDeHoje(); // não permite escolher datas passadas
criarSeletorCategorias();
renderizarAtualizacoes();
carregarTarefas();
renderizarTarefas();

// Se a página estiver aberta em outra aba e as tarefas mudarem lá,
// esta aba recarrega a lista para não sobrescrever os dados novos.
window.addEventListener("storage", (evento) => {
    if (evento.key === CHAVE_ARMAZENAMENTO) {
        carregarTarefas();
        renderizarTarefas();
    }
});

// Posição inicial do fundo dos filtros (sem animar) e ajuste ao redimensionar
posicionarIndicadorFiltro();
requestAnimationFrame(() => indicadorFiltro.classList.add("pronto"));
new ResizeObserver(posicionarIndicadorFiltro).observe(containerFiltros);
document.fonts.ready.then(posicionarIndicadorFiltro);
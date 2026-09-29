// Array que armazenará as tarefas cadastradas
const listaDeTarefas = [];

class Tarefa {
    #concluida;
    constructor(descricao) {
        if (!descricao || descricao.trim() === "") {
            throw new Error("A tarefa não pode estar vazia.");
        }

        if (descricao.length > 40) {
            throw new Error("A tarefa não pode ter mais de 40 caracteres.");
        }

        this.descricao = descricao.trim();

        this.#concluida = false;
    }

    get concluida() {
        return this.#concluida;
    }

    alternarConclusao() {
        this.#concluida = !this.#concluida;
    }
}

const campoTarefa = document.getElementById("campo-tarefa");
const botaoAdicionar = document.getElementById("botao-adicionar");
const listaTarefasHTML = document.getElementById("lista-tarefas");
const contadorTarefas = document.getElementById("contador-tarefas");
const botaoAlternarTema = document.getElementById("botao-alternar-tema");

function atualizarContador() {
    const totalTarefas = listaDeTarefas.length;

    const tarefasConcluidas = listaDeTarefas.filter(
        (tarefa) => tarefa.concluida
    ).length;

    const tarefasPendentes = totalTarefas - tarefasConcluidas;

    if (totalTarefas === 0) {
        contadorTarefas.innerText = "0 tarefas na lista";
    } else {
        contadorTarefas.innerText =
            `${totalTarefas} tarefas na lista | ${tarefasConcluidas} concluídas | ${tarefasPendentes} pendentes`;
    }
}

function renderizarTarefas() {
    listaTarefasHTML.innerHTML = "";

    listaDeTarefas.forEach((tarefa, index) => {
        const item = document.createElement("li");

        item.classList.add("item-tarefa");

        if (tarefa.concluida) {
            item.classList.add("concluido");
        }

        item.innerHTML = `
            <span>${tarefa.descricao}</span>

            <div class="acoes-tarefa">
                <button class="botao-acao" onclick="alternarConclusao(${index})" title="Concluir tarefa">
                    <i class="fa-regular fa-circle-check"></i>
                </button>

                <button class="botao-acao excluir" onclick="removerTarefa(${index})" title="Remover tarefa">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        listaTarefasHTML.appendChild(item);
    });

    atualizarContador();
}

function adicionarTarefa() {
    const descricao = campoTarefa.value;

    try {
        const novaTarefa = new Tarefa(descricao);

        listaDeTarefas.push(novaTarefa);

        renderizarTarefas();

        campoTarefa.value = "";

        campoTarefa.focus();
    } catch (error) {
        alert(error.message);
    }
}

function alternarConclusao(index) {
    const tarefa = listaDeTarefas[index];

    if (!tarefa) {
        return;
    }

    tarefa.alternarConclusao();

    renderizarTarefas();
}

function removerTarefa(index) {
    listaDeTarefas.splice(index, 1);

    renderizarTarefas();
}

botaoAdicionar.addEventListener("click", () => {
    adicionarTarefa();
});

campoTarefa.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        adicionarTarefa();
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

renderizarTarefas();
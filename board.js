const apiBase = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard";

// Função para buscar e exibir as boards
async function taskboards() {
  try {
    const response = await fetch(`${apiBase}/boards`);
    if (response.status === 200) {
      const boards = await response.json();
      renderBoards(boards);
    } else {
      console.error("Erro ao buscar as boards:", response.status);
    }
  } catch (error) {
    console.error("Erro ao conectar na API:", error);
  }
}

// Função para renderizar as boards na tela
function renderBoards(boards) {
  const container = document.getElementById("boards-container");

  // Limpa o container antes de adicionar novos elementos
  container.innerHTML = "";

  boards.forEach(board => {
    const boardElement = document.createElement("div");
    boardElement.classList.add("board");

    boardElement.innerHTML = `
      <h2>${board.Name}</h2>
      <p><strong>ID:</strong> ${board.Id}</p>
      <p><strong>Descrição:</strong> ${board.Description || "Sem descrição"}</p>
      <p><strong>Criado por:</strong> ${board.CreatedBy}</p>
      <button class="details-btn" data-id="${board.Id}">Ver detalhes</button>
    `;

    container.appendChild(boardElement);
  });

  // Adiciona evento aos botões "Ver detalhes"
  const detailButtons = document.querySelectorAll(".details-btn");
  detailButtons.forEach(button => {
    button.addEventListener("click", () => {
      const boardId = button.getAttribute("data-id");
      fetchBoardDetails(boardId);
    });
  });
}

// Função para buscar e exibir os detalhes de uma Board
async function fetchBoardDetails(boardId) {
  try {
    const response = await fetch(`${apiBase}/Board?BoardId=${boardId}`);
    if (response.status === 200) {
      const boardDetails = await response.json();
      renderBoardDetails(boardDetails);
    } else {
      console.error("Erro ao buscar detalhes da board:", response.status);
    }
  } catch (error) {
    console.error("Erro ao conectar na API:", error);
  }
}

// Função para renderizar os detalhes da Board selecionada
function renderBoardDetails(board) {
  const detailsContainer = document.getElementById("board-details");

  // Renderiza os detalhes
  detailsContainer.innerHTML = `
    <h2 class="board-details-title"> ${board.Name}</h2>
    <p class="board-detail"><strong>ID:</strong> ${board.Id}</p>
    <p class="board-detail"><strong>Descrição:</strong> ${board.Description || "Sem descrição"}</p>
    <p class="board-detail"><strong>Criado por:</strong> ${board.CreatedBy}</p>
    <p class="board-detail"><strong>Atualizado por:</strong> ${board.UpdatedBy}</p>
  `;

  // Rola a página até os detalhes
  detailsContainer.scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout-btn");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Exibir mensagem de confirmação antes de deslogar
      const confirmLogout = confirm("Você tem certeza que deseja sair?");
      if (confirmLogout) {
        // Se o usuário confirmar, realiza o logout
        localStorage.removeItem("user");
        window.location.href = "index.html"; // Redireciona para a página principal
      }
    });
  }
});


// Chama a função para carregar as boards
taskboards();

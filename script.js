// script.js

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
  
    // Login event
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const email = document.getElementById("email").value;
  
      try {
        const response = await fetch(
          `https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/GetPersonByEmail?Email=${email}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to authenticate. Check your email.");
        }
  
        const userData = await response.json();
        localStorage.setItem("user", JSON.stringify(userData));
  
        alert(`Welcome, ${userData.Name}!`);
        // Redirect to main dashboard (not implemented yet)
      } catch (error) {
        alert(error.message);
      }
    });
//so pra desbugar o commit
  });

  document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
  
    // Carregar tema salvo do localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  
    // Atualizar texto do botão
    themeToggle.textContent = savedTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode";
  
    // Alternar tema
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";
  
      // Aplicar o novo tema
      document.documentElement.setAttribute("data-theme", newTheme);
  
      // Salvar tema no localStorage
      localStorage.setItem("theme", newTheme);
  
      // Atualizar texto do botão
      themeToggle.textContent = newTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode";
    });
  });
document.addEventListener("DOMContentLoaded", () => {
    console.log("El script login.js está cargado y el DOM está listo.");

    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    if (!loginForm) {
        console.error("No se encontró el formulario en el DOM.");
        return;
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        console.log("Formulario enviado con:", { username, password });

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            console.log("Respuesta del servidor:", data);

            if (response.ok) {
                alert('Login exitoso');
                
                // Guardar el adminId en sessionStorage
                sessionStorage.setItem("adminId", data.adminId);
            
                window.location.replace('/cancha.html');
            }
             else {
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    });
});

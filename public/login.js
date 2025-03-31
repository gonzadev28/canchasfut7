loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Realizamos la petición POST para comprobar las credenciales
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        // Si las credenciales son correctas, redirigimos
        alert('Login exitoso');
        window.location.href = '/cancha.html';  // Redirigir al panel de administración
    } else {
        // Si las credenciales son incorrectas, mostramos un mensaje de error
        errorMessage.style.display = 'block';  
    }
});

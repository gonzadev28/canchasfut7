document.addEventListener("DOMContentLoaded", () => {
    const adminForm = document.getElementById("adminForm");
    const adminList = document.getElementById("adminList");

    // Obtener administradores
    async function fetchAdmins() {
        const res = await fetch("/superadmin/admins");
        const admins = await res.json();
        adminList.innerHTML = ""; // Limpiar la lista
        admins.forEach(admin => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${admin._id}</td>
                <td>${admin.username}</td>
                <td>
                    <button onclick="deleteAdmin('${admin._id}')">Eliminar</button>
                </td>
            `;
            adminList.appendChild(row);
        });
    }

    // Agregar administrador
    adminForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        
        await fetch("/superadmin/admins", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        adminForm.reset(); // Limpiar el formulario después de agregar
        fetchAdmins(); // Volver a cargar la lista de administradores
    });

    // Eliminar administrador
    window.deleteAdmin = async (id) => {
        await fetch(`/superadmin/admins/${id}`, {
            method: "DELETE"
        });
        fetchAdmins(); // Volver a cargar la lista después de eliminar
    };

    fetchAdmins(); // Inicializar la lista al cargar la página
});
// Función para cambiar el color al hacer clic
function cambiarColor(event) {
    // Cambiar el color de fondo del botón
    event.target.style.backgroundColor = "#0056b3";
}

// Obtener todos los botones
const botones = document.querySelectorAll('.boton');

// Agregar el evento de clic a cada botón
botones.forEach(boton => {
    boton.addEventListener('click', cambiarColor);
});
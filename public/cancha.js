document.addEventListener("DOMContentLoaded", () => {
    const addCanchaForm = document.getElementById("add-cancha-form");
    const canchaList = document.getElementById("cancha-list");

    // Función para obtener las canchas desde el servidor
async function fetchCanchas() {
    const adminId = sessionStorage.getItem("adminId");  // Obtener el adminId de sessionStorage
    if (!adminId) {
        alert("No estás logueado correctamente.");
        return;
    }

    // Realizar la solicitud incluyendo el adminId en la URL
    const res = await fetch(`/canchas?adminId=${adminId}`);
    const canchas = await res.json();
    canchaList.innerHTML = ""; // Limpiar la lista antes de mostrar las canchas

    canchas.forEach(cancha => {
        const li = document.createElement('li');
        const adminUsername = cancha.adminId && cancha.adminId.username ? cancha.adminId.username : 'Sin dueño';
        li.innerHTML = `
            ${cancha.nombre} - Dueño: ${adminUsername} 
            <button onclick="deleteCancha('${cancha._id}')">Eliminar</button>
        `;
        canchaList.appendChild(li);
    });
}

    // Obtener el adminId desde sessionStorage
    const adminId = sessionStorage.getItem("adminId");
    if (!adminId) {
        alert("Error: No tienes permisos para gestionar canchas.");
        window.location.replace('/login.html'); // Redirigir al login si no hay adminId en sessionStorage
        return;
    }

    // Función para agregar una nueva cancha
    addCanchaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const canchaName = document.getElementById('cancha-name').value;

        // Verifica si el campo de nombre de la cancha está vacío
        if (!canchaName.trim()) {
            alert("Por favor, ingresa un nombre para la cancha.");
            return;
        }

        const response = await fetch('/canchas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: canchaName, adminId })
        });

        // Si la respuesta es exitosa, recarga las canchas
        if (response.ok) {
            fetchCanchas(); // Recargar las canchas
            addCanchaForm.reset(); // Limpiar el formulario
        } else {
            alert('Hubo un error al agregar la cancha');
        }
    });

    // Función para eliminar una cancha
    window.deleteCancha = async (id) => {
        const response = await fetch(`/canchas/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchCanchas(); // Recargar las canchas después de eliminar
        } else {
            document.getElementById("error-message").style.display = 'block';
        }
    };

    // Cargar las canchas al inicio
    fetchCanchas();
});
// Función para cargar las reservas del admin
async function fetchReservas() {
    const adminId = sessionStorage.getItem("adminId");
    if (!adminId) return;

    const res = await fetch(`/reservas/admin/${adminId}`);
    const reservas = await res.json();
    const reservasList = document.getElementById('reservas-list');
    reservasList.innerHTML = '';

    reservas.forEach(reserva => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p>${reserva.usuario} - ${reserva.cancha_id.nombre} - ${reserva.fecha} ${reserva.hora} hrs</p>
        `;
        reservasList.appendChild(div);
    });
}

// Llama a esta función al final de DOMContentLoaded
fetchReservas();

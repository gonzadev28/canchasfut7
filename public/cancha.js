document.addEventListener("DOMContentLoaded", () => {
    const addCanchaForm = document.getElementById("add-cancha-form");
    const canchaList = document.getElementById("cancha-list");

    // Función para obtener las canchas desde el servidor
    async function fetchCanchas() {
        const res = await fetch('/canchas');
        const canchas = await res.json();
        canchaList.innerHTML = ""; // Limpiar la lista antes de mostrar las canchas
        canchas.forEach(cancha => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${cancha.nombre} 
                <button onclick="deleteCancha('${cancha._id}')">Eliminar</button>
            `;
            canchaList.appendChild(li);
        });
    }

    // Función para agregar una nueva cancha
    addCanchaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const canchaName = document.getElementById('cancha-name').value;

        const response = await fetch('/canchas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: canchaName })
        });

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

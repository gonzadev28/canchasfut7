document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.boton').forEach(boton => {
        boton.addEventListener('click', async function() {
            const canchaContainer = this.closest('.items');
            const canchaId = canchaContainer.dataset.canchaId.trim(); // Asegurar que no haya espacios
            const fecha = canchaContainer.querySelector('#calendar').value;
            const hora = this.textContent.trim();

            if (!canchaId || !fecha) {
                alert('Selecciona una cancha y fecha válida');
                return;
            }

            try {
                // Verificar disponibilidad
                const dispResponse = await fetch(`/reservas/disponibilidad?cancha_id=${canchaId}&fecha=${fecha}&hora=${hora}`);
                const { disponible } = await dispResponse.json();
                
                if (disponible) {
                    const usuario = prompt("Ingrese su nombre para reservar:");
                    if (usuario) {
                        // Obtener info completa de la cancha (incluyendo adminId)
                        const canchaResponse = await fetch(`/canchas/${canchaId}`);
                        const cancha = await canchaResponse.json();
                        
                        // Crear reserva con el admin_id correcto
                        await fetch('/reservas', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                cancha_id: canchaId, 
                                admin_id: cancha.adminId._id, // Acceder al _id del admin
                                fecha, 
                                hora, 
                                usuario 
                            })
                        });
                        alert('¡Reserva confirmada!');
                    }
                } else {
                    alert('Horario no disponible. Elige otro.');
                }
            } catch (error) {
                console.error('Error en reserva:', error);
                alert('Error al procesar la reserva');
            }
        });
    });
});
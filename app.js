document.addEventListener('DOMContentLoaded', () => {
    const ventaForm = document.getElementById('ventaForm');
    const tipoVenta = document.getElementById('tipoVenta');
    const montoInput = document.getElementById('monto');
    const totalTransferencias = document.getElementById('totalTransferencias');
    const totalCodigoQR = document.getElementById('totalCodigoQR');
    const totalVentas = document.getElementById('totalVentas');
    const listaRegistros = document.getElementById('listaRegistros');
    const verRegistrosBtn = document.getElementById('verRegistros');
    const registrosDiv = document.getElementById('registros');
    const verPorDiaBtn = document.getElementById('verPorDiaBtn');
    const toggleButton = document.getElementById('toggleButton');

    // Cargar registros del localStorage al cargar la página
    cargarRegistros();

    // Registrar una nueva venta
    ventaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const tipo = tipoVenta.value;
        const monto = parseFloat(montoInput.value);

        // Verificamos si el monto es válido
        if (isNaN(monto) || monto <= 0) {
            alert('Por favor, ingrese un monto válido.');
            return;
        }

        // Obtener los registros previos
        let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        
        // Crear un nuevo registro de venta
        const nuevoRegistro = {
            tipo,
            monto,
            fecha: new Date().toLocaleString(),
            fechaDia: new Date().toISOString().split('T')[0], // Para filtrar por día
        };
        
        // Agregar el nuevo registro al arreglo
        ventas.push(nuevoRegistro);

        // Guardar los registros en localStorage
        localStorage.setItem('ventas', JSON.stringify(ventas));

        // Actualizar los totales
        actualizarTotales(ventas);

        // Limpiar el formulario
        ventaForm.reset();
    });

    // Función para actualizar los totales
    function actualizarTotales(ventas) {
        let totalTransferenciasMonto = 0;
        let totalCodigoQRMonto = 0;

        ventas.forEach(venta => {
            if (venta.tipo === 'transferencia') {
                totalTransferenciasMonto += venta.monto;
            } else if (venta.tipo === 'codigoQR') {
                totalCodigoQRMonto += venta.monto;
            }
        });

        totalTransferencias.innerText = totalTransferenciasMonto.toFixed(2);
        totalCodigoQR.innerText = totalCodigoQRMonto.toFixed(2);
        totalVentas.innerText = (totalTransferenciasMonto + totalCodigoQRMonto).toFixed(2);
    }

    // Mostrar los registros
    verRegistrosBtn.addEventListener('click', () => {
        registrosDiv.style.display = 'block';
        mostrarRegistros();
    });

    // Mostrar solo los registros del día actual
    verPorDiaBtn.addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0]; // Obtener solo la fecha
        mostrarRegistros(today);
    });

    // Mostrar todos los registros
    function mostrarRegistros(filtroFecha = null) {
        let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        listaRegistros.innerHTML = '';

        ventas = filtroFecha ? ventas.filter(venta => venta.fechaDia === filtroFecha) : ventas;

        ventas.forEach((venta, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${venta.tipo}</td>
                <td>$${venta.monto.toFixed(2)}</td>
                <td>${venta.fecha}</td>
                <td>
                    <button class="editar" onclick="editarRegistro(${index})">Editar</button>
                    <button class="eliminar" onclick="eliminarRegistro(${index})">Eliminar</button>
                </td>
            `;
            listaRegistros.appendChild(row);
        });
    }

    // Función para eliminar un registro
    window.eliminarRegistro = function(index) {
        let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        ventas.splice(index, 1);
        localStorage.setItem('ventas', JSON.stringify(ventas));
        actualizarTotales(ventas);
        mostrarRegistros();
    }

    // Función para contraer y expandir la tabla
    toggleButton.addEventListener('click', () => {
        if (listaRegistros.style.display === 'none') {
            listaRegistros.style.display = 'table-row-group';
            toggleButton.textContent = 'Contraer Registros';
        } else {
            listaRegistros.style.display = 'none';
            toggleButton.textContent = 'Expandir Registros';
        }
    });

    // Cargar los registros iniciales
    function cargarRegistros() {
        let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        actualizarTotales(ventas);
        mostrarRegistros();
    }
});

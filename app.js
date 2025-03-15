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
    const imprimirBtn = document.getElementById('imprimirBtn');
    const exportarBtn = document.getElementById('exportarBtn');
    const verPorDiaBtn = document.getElementById('verPorDiaBtn');
    const indiceEdicion = document.createElement('input');
    indiceEdicion.style.display = 'none';
    document.body.appendChild(indiceEdicion);

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

    // Función para editar un registro
    window.editarRegistro = function(index) {
        let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        const venta = ventas[index];

        tipoVenta.value = venta.tipo;
        montoInput.value = venta.monto;

        // Guardar el índice de edición en un campo oculto
        indiceEdicion.value = index;
    }

    // Función para eliminar un registro
    window.eliminarRegistro = function(index) {
        let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        ventas.splice(index, 1);

        // Guardar los registros actualizados en localStorage
        localStorage.setItem('ventas', JSON.stringify(ventas));

        // Actualizar los totales y la lista
        actualizarTotales(ventas);
        mostrarRegistros();
    }

    // Función para imprimir los registros
    imprimirBtn.addEventListener('click', () => {
        const tablaHtml = tablaRegistros.outerHTML;
        const ventana = window.open('', '', 'width=800,height=600');
        ventana.document.write('<html><head><title>Registros de Ventas</title></head><body>');
        ventana.document.write(tablaHtml);
        ventana.document.write('</body></html>');
        ventana.document.close();
        ventana.print();
    });

    // Función para exportar los registros a CSV
    exportarBtn.addEventListener('click', () => {
        const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        const csv = ventas.map(venta => `${venta.tipo},${venta.monto.toFixed(2)},${venta.fecha}`).join('\n');
        const csvBlob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(csvBlob);
        link.download = 'registros_ventas.csv';
        link.click();
    });

    // Cargar los registros iniciales al cargar la página
    function cargarRegistros() {
        let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        actualizarTotales(ventas);
        mostrarRegistros();
    }

    // Mover al siguiente campo cuando se presiona ENTER
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (document.activeElement === montoInput) {
                tipoVenta.focus();
            }
        }
    });
});
// Obtener el botón y la tabla de registros
const toggleButton = document.getElementById('toggleButton');
const tablaRegistros = document.getElementById('tablaRegistros');

// Función para contraer y expandir la tabla
toggleButton.addEventListener('click', () => {
    // Comprobamos el estado actual de la tabla
    if (tablaRegistros.style.display === 'none') {
        // Si la tabla está oculta, la mostramos y cambiamos el texto del botón
        tablaRegistros.style.display = 'table';  // Mostrar la tabla
        toggleButton.textContent = 'Contraer Registros';  // Cambiar texto del botón
    } else {
        // Si la tabla está visible, la ocultamos y cambiamos el texto del botón
        tablaRegistros.style.display = 'none';  // Ocultar la tabla
        toggleButton.textContent = 'Expandir Registros';  // Cambiar texto del botón
    }
});

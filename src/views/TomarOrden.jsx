import React, { useState } from 'react';
import { Search, Plus, Utensils, Coffee, Pizza, PlusCircle, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { MENU_ESTRUCTURADO } from '../utils/menu';

export default function TomarOrden({ alCambiarVista, alGuardarOrden }) {
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState("");
  const [categoriaActual, setCategoriaActual] = useState("Comida");

  // --- FUNCIÓN PARA EL RESUMEN Y EXTRAS ---
  const mostrarResumen = () => {
    if (!cliente) return Swal.fire("¡Ojo!", "Poné el nombre del cliente", "warning");
    if (carrito.length === 0) return Swal.fire("Carrito vacío", "Agregá algo al pedido", "info");

    const total = carrito.reduce((s, i) => s + (i.precioUnitario * i.cantidad), 0);

    Swal.fire({
      title: `Resumen: ${cliente}`,
      html: `
        <div class="text-left text-sm max-h-60 overflow-y-auto">
          ${carrito.map(i => `
            <div class="flex justify-between border-b py-2">
              <span>${i.cantidad}x ${i.nombre} ${i.nota ? `<br/><small class="text-blue-600 font-bold">(${i.nota})</small>` : ''}</span>
              <span class="font-bold">$${(i.precioUnitario * i.cantidad).toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="flex justify-between mt-4 text-lg font-black text-slate-900">
            <span>TOTAL:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'GUARDAR ORDEN',
      denyButtonText: '+ EXTRA LIBRE',
      cancelButtonText: 'SEGUIR PIDIENDO',
      confirmButtonColor: '#2563eb', // Azul
      denyButtonColor: '#059669',    // Verde
      borderRadius: '2rem'
    }).then((result) => {
      if (result.isConfirmed) {
        alGuardarOrden(cliente, carrito);
      } else if (result.isDenied) {
        agregarExtraLibre();
      }
    });
  };

  const agregarExtraLibre = () => {
    Swal.fire({
      title: 'Agregar Extra Libre',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Descripción (Ej: Extra Queso)">
        <input id="swal-input2" type="number" step="0.01" class="swal2-input" placeholder="Precio $">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const desc = document.getElementById('swal-input1').value;
        const precio = document.getElementById('swal-input2').value;
        if (!desc || !precio) return Swal.showValidationMessage('Llená ambos campos');
        return { desc, precio: parseFloat(precio) };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevoExtra = {
          id: Date.now(),
          nombre: result.value.desc.toUpperCase(),
          precioUnitario: result.value.precio,
          cantidad: 1,
          esExtra: true // Clave para identificarlo en cocina
        };
        setCarrito([...carrito, nuevoExtra]);
        // Volvemos a mostrar el resumen para que el usuario vea el cambio
        setTimeout(mostrarResumen, 500);
      }
    });
  };

  // --- RENDERIZADO ---
  return (
    <div className="flex flex-col h-[85vh]">
      {/* 1. Header de Cliente */}
      <div className="bg-white p-4 rounded-3xl shadow-sm mb-4">
        <input 
          type="text" 
          placeholder="Nombre del Cliente..." 
          className="w-full text-xl font-black border-none focus:ring-0"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
      </div>

      {/* 2. Área de Productos (Scroll) */}
      
<div className="flex-1 overflow-y-auto pb-40 space-y-6">
  {MENU_ESTRUCTURADO
    .filter(c => c.categoria === categoriaActual)
    .map(cat => (
      <div key={cat.categoria} className="space-y-6">
        {cat.subcategorias.map(sub => (
          <div key={sub.nombre} className="space-y-3">
            {/* Título de Subcategoría (Ej: Sodas Italianas) */}
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
              {sub.nombre}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {sub.productos.map(prod => (
                <button 
                  key={prod.id}
                  onClick={() => setCarrito([...carrito, {
                    id: prod.id,
                    nombre: prod.nombre,
                    precioUnitario: prod.precioBase,
                    cantidad: 1,
                    nota: "" // Aquí podrías luego agregar los modificadores
                  }])}
                  className="bg-white p-4 rounded-[2rem] shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition-all border border-slate-100 h-28"
                >
                  <span className="font-bold text-[11px] text-center leading-tight text-slate-700 uppercase">
                    {prod.nombre}
                  </span>
                  <span className="text-blue-600 font-black text-sm">
                    ${prod.precioBase.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    ))
  }
</div>
      {/* 3. BARRA DE CATEGORÍAS (ABAJO) */}
<div className="fixed bottom-24 left-2 right-2 bg-slate-900/95 backdrop-blur-md rounded-3xl p-2 flex justify-around items-center shadow-2xl border border-white/10 overflow-x-auto no-scrollbar">
  {MENU_ESTRUCTURADO.map((cat) => (
    <CategoryTab 
      key={cat.categoria}
      label={cat.categoria.split(',')[0]} // Corta nombres largos como "Papas, Dedos..."
      activa={categoriaActual === cat.categoria} 
      onClick={() => setCategoriaActual(cat.categoria)} 
    />
  ))}
</div>

      {/* 4. BOTÓN FLOTANTE DE RESUMEN */}
      <button 
        onClick={mostrarResumen}
        className="fixed bottom-6 right-6 left-6 bg-blue-600 text-white h-16 rounded-2xl font-black shadow-xl flex items-center justify-between px-8 animate-bounce-subtle"
      >
        <span className="flex items-center gap-2">
          <Save size={20} /> REVISAR PEDIDO
        </span>
        <span className="bg-white/20 px-3 py-1 rounded-lg">
          {carrito.length} items
        </span>
      </button>
    </div>
  );
}

function CategoryTab({ icon, label, activa, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center px-4 py-1 rounded-full transition-all ${activa ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
    >
      {icon}
      <span className="text-[8px] font-bold uppercase mt-0.5">{label}</span>
    </button>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { Save, PlusCircle, Trash2, Zap, UtensilsCrossed } from 'lucide-react';
import Swal from 'sweetalert2';
import { MENU_ESTRUCTURADO } from '../utils/menu';

export default function TomarOrden({ alCambiarVista, alGuardarOrden }) {
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState("");
  const [categoriaActual, setCategoriaActual] = useState("Bebidas");
  
  const carritoRef = useRef(carrito);
  useEffect(() => {
    carritoRef.current = carrito;
  }, [carrito]);

  // --- 1. ELIMINAR ÍTEM INDIVIDUAL (VISTA PREVIA) ---
    const eliminarDelCarrito = (id) => {
    setCarrito((prev) => {
      const nuevoCarrito = prev.map(item => {
        // Si es el ítem que buscamos y tiene más de 1, restamos 1
        if (item.id === id && item.cantidad > 1) {
          return { ...item, cantidad: item.cantidad - 1 };
        }
        // Si tiene 1 o menos (o no es el ítem), lo dejamos para el filter
        return item;
      }).filter(item => {
        // Si el item es el que queremos borrar y su cantidad ya era 1, el filter lo saca
        if (item.id === id && item.cantidad <= 1 && item.id === id) {
          // Esta lógica es un poco redundante pero segura: 
          // Si el ID coincide, pero ya no queremos restarle, el filter lo elimina.
          // Pero para hacerlo más simple, usaremos esta lógica de abajo:
          return false; 
        }
        return true;
      });

      // LÓGICA SIMPLIFICADA Y EFECTIVA:
      const carritoActualizado = prev.reduce((acc, item) => {
        if (item.id === id) {
          if (item.cantidad > 1) {
            acc.push({ ...item, cantidad: item.cantidad - 1 });
          }
          // Si es 1, simplemente no lo agregamos al 'acc' (se elimina)
        } else {
          acc.push(item);
        }
        return acc;
      }, []);

      if (carritoActualizado.length === 0) Swal.close();
      else setTimeout(() => mostrarResumen(carritoActualizado), 100);
      
      return carritoActualizado;
    });
  };

  // --- 2. BOTÓN EXTRA (PRODUCTOS MANUALES) ---
  const agregarExtraManual = () => {
    Swal.fire({
      title: 'PRODUCTO EXTRA',
      html: `
        <input id="ex-nom" class="swal2-input" placeholder="Nombre (ej. Descorche)">
        <input id="ex-pre" type="number" class="swal2-input" placeholder="Precio (ej. 1.50)">
      `,
      showCancelButton: true,
      confirmButtonText: 'AÑADIR',
      preConfirm: () => {
        const nom = document.getElementById('ex-nom').value.toUpperCase();
        const pre = parseFloat(document.getElementById('ex-pre').value);
        if (!nom || isNaN(pre)) return Swal.showValidationMessage('Datos inválidos');
        return { nom, pre };
      }
    }).then(r => {
      if (r.isConfirmed) {
        setCarrito([...carrito, {
          id: Date.now(),
          nombre: `EXTRA: ${r.value.nom}`,
          precioUnitario: r.value.pre,
          cantidad: 1,
          esExtra: true
        }]);
      }
    });
  };

  const abrirConfiguracionProducto = (prod) => {
    let cantidadLocal = 1;
    let aderezosPorPlato = [{}]; 
    let notaLocal = "";
    // Detectamos si es alitas basado en tu menu.js
    const esAlitas = categoriaActual === "Alitas";

    const actualizarContenidoModal = () => {
      const inputCant = document.getElementById('swal-cant');
      if (inputCant) {
        cantidadLocal = parseInt(inputCant.value) || 1;
        if (esAlitas) {
          while (aderezosPorPlato.length < cantidadLocal) aderezosPorPlato.push({});
          while (aderezosPorPlato.length > cantidadLocal) aderezosPorPlato.pop();
        }
      }

      let htmlPlatos = "";
      if (esAlitas) {
        htmlPlatos = aderezosPorPlato.map((ade, i) => {
          const total = Object.values(ade).reduce((a, b) => a + b, 0);
          const extras = Math.max(0, total - (prod.maxAderezosGratis || 0));
          return `
            <div class="p-3 bg-slate-50 rounded-2xl mb-3 border text-left">
              <div class="flex justify-between items-center mb-2">
                <span class="font-black text-blue-600 text-[10px]">PLATO ${i + 1}</span>
                ${extras > 0 ? `<span class="text-[9px] font-black text-red-500">+$${(extras * 0.5).toFixed(2)}</span>` : ''}
              </div>
              <div class="grid grid-cols-2 gap-2">
                ${(prod.aderezosDisponibles || []).map(a => `
                  <div class="flex items-center justify-between p-1 bg-white rounded-lg border">
                    <span class="text-[8px] font-bold">${a}</span>
                    <div class="flex items-center gap-1">
                      <button class="ade-btn w-6 h-6 bg-slate-200 rounded" data-plato="${i}" data-ade="${a}" data-type="minus">-</button>
                      <span class="text-[9px] font-black w-3 text-center">${ade[a] || 0}</span>
                      <button class="ade-btn w-6 h-6 bg-blue-600 text-white rounded" data-plato="${i}" data-ade="${a}" data-type="plus">+</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('');
      }

      return `
        <div class="text-left font-sans">
          <div class="mb-4 bg-slate-900 text-white p-3 rounded-xl flex justify-between">
            <span class="font-black text-xs uppercase">${prod.nombre}</span>
            <span class="font-black text-xs">$${prod.precioBase.toFixed(2)}</span>
          </div>
          <div class="mb-4">
            <label class="text-[10px] font-black uppercase text-slate-400">Cantidad</label>
            <input type="number" id="swal-cant" class="swal2-input !m-0 !w-full" value="${cantidadLocal}" min="1">
          </div>
          <div class="max-h-[250px] overflow-y-auto">${htmlPlatos}</div>
          <textarea id="swal-nota" class="swal2-textarea !m-0 !w-full !text-xs mt-3" placeholder="Notas...">${notaLocal}</textarea>
        </div>
      `;
    };

    Swal.fire({
      title: 'CONFIGURAR',
      html: actualizarContenidoModal(),
      showCancelButton: true,
      didOpen: () => {
        const p = Swal.getPopup();
        p.querySelector('#swal-cant').oninput = () => {
          notaLocal = document.getElementById('swal-nota').value;
          Swal.update({ html: actualizarContenidoModal() });
        };
        p.onclick = (e) => {
          if (e.target.classList.contains('ade-btn')) {
            const { plato, ade, type } = e.target.dataset;
            const idx = parseInt(plato);
            aderezosPorPlato[idx][ade] = (aderezosPorPlato[idx][ade] || 0) + (type === 'plus' ? 1 : -1);
            if (aderezosPorPlato[idx][ade] < 0) aderezosPorPlato[idx][ade] = 0;
            notaLocal = document.getElementById('swal-nota').value;
            Swal.update({ html: actualizarContenidoModal() });
          }
        };
      },
    // ... dentro de abrirConfiguracionProducto
      preConfirm: () => {
        const nt = document.getElementById('swal-nota').value;
        const inputCant = document.getElementById('swal-cant');
        const valorCantidadReal = parseInt(inputCant.value) || 1; // Captura el valor real del input

        if (esAlitas) {
          return aderezosPorPlato.map((ade, i) => {
            const total = Object.values(ade).reduce((a, b) => a + b, 0);
            const ex = Math.max(0, total - (prod.maxAderezosGratis || 0));
            return {
              id: Date.now() + i + Math.random(),
              nombre: `${prod.nombre} (P${i+1})`,
              precioUnitario: prod.precioBase + (ex * 0.5),
              cantidad: 1, // En alitas siempre es 1 por plato
              aderezos: Object.entries(ade).filter(([_, c]) => c > 0).map(([n, c]) => `${n}x${c}`),
              nota: i === 0 ? nt : ""
            };
          });
        }

        // SOLUCIÓN PARA PRODUCTOS NORMALES:
        return [{
          id: Date.now(),
          nombre: prod.nombre,
          precioUnitario: prod.precioBase,
          cantidad: valorCantidadReal, // <--- Aquí usamos el valor real capturado
          nota: nt
        }];
      }
    }).then(r => { 
      if (r.isConfirmed && r.value) { 
        setCarrito([...carrito, ...r.value]); 
      } 
    });
  };
    
    const mostrarResumen = (car = carrito) => {
    // 1. Validaciones preventivas
    if (car.length === 0) {
      return Swal.fire({
        title: "Carrito Vacío",
        text: "Agrega productos antes de enviar, chero.",
        icon: "warning",
        confirmButtonColor: '#3b82f6'
      });
    }
    
    if (!cliente || cliente.trim() === "") {
      return Swal.fire({
        title: "Falta Cliente",
        text: "¿A nombre de quién va el pedido?",
        icon: "warning",
        confirmButtonColor: '#3b82f6'
      });
    }

    const total = car.reduce((s, i) => s + (i.precioUnitario * i.cantidad), 0);

    Swal.fire({
      title: `REVISAR: ${cliente.toUpperCase()}`,
      html: `
        <div class="text-left max-h-[350px] overflow-y-auto font-sans">
          ${car.map(i => `
            <div class="flex justify-between items-center py-3 border-b">
              <div>
                <div class="font-black text-[11px] uppercase">${i.cantidad}x ${i.nombre}</div>
                <div class="text-[9px] text-slate-400">${i.aderezos?.join(', ') || ''}</div>
                ${i.nota ? `<div class="text-[9px] text-blue-500 font-bold">Nota: ${i.nota}</div>` : ''}
              </div>
              <div class="flex items-center gap-3">
                <span class="font-black text-xs">$${(i.precioUnitario * i.cantidad).toFixed(2)}</span>
                <button class="del-btn text-red-500 bg-red-50 p-2 rounded-lg" data-id="${i.id}">🗑️</button>
              </div>
            </div>
          `).join('')}
          <div class="mt-4 p-4 bg-slate-900 text-green-400 rounded-xl flex justify-between items-center">
            <span class="font-black text-[10px]">TOTAL A COBRAR:</span>
            <span class="text-xl font-black">$${total.toFixed(2)}</span>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'ENVIAR A COCINA',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
      didOpen: () => {
        // Manejo de eliminación dentro del resumen
        Swal.getHtmlContainer().onclick = (e) => {
          const btn = e.target.closest('.del-btn');
          if (btn) {
            eliminarDelCarrito(parseFloat(btn.dataset.id));
          }
        };
      }
    }).then((result) => { 
      if (result.isConfirmed) { 
        // Ejecutamos la función que viene de App.jsx
        alGuardarOrden(cliente, car); 
        // Limpiamos el carrito local para la siguiente orden
        setCarrito([]);
        setCliente("");
      } 
    });
  };
  

  return (
    <div className="flex flex-col h-[88vh] bg-slate-50 p-2">
      <div className="bg-white p-4 rounded-3xl shadow-sm mb-4 border flex items-center gap-3">
        <input 
          type="text" placeholder="CLIENTE..." 
          className="flex-1 text-xl font-black border-none focus:ring-0 uppercase"
          value={cliente} onChange={e => setCliente(e.target.value)}
        />
        <button onClick={agregarExtraManual} className="bg-orange-500 text-white p-3 rounded-2xl shadow-lg active:scale-95">
          <PlusCircle size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-44">
        {MENU_ESTRUCTURADO.filter(c => c.categoria === categoriaActual).map(cat => (
          <div key={cat.categoria} className="grid grid-cols-2 gap-3">
            {cat.subcategorias.flatMap(s => s.productos).map(p => (
              <button key={p.id} onClick={() => abrirConfiguracionProducto(p)}
                className="bg-white p-4 rounded-[2rem] border shadow-sm flex flex-col items-center justify-center h-28 active:bg-blue-50">
                <span className="font-bold text-[10px] text-center uppercase mb-1 leading-tight">{p.nombre}</span>
                <span className="text-blue-600 font-black text-sm">${p.precioBase.toFixed(2)}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="fixed bottom-24 left-4 right-4 bg-slate-900 rounded-full p-2 flex justify-around overflow-x-auto">
        {MENU_ESTRUCTURADO.map(c => (
          <button key={c.categoria} onClick={() => setCategoriaActual(c.categoria)}
            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${categoriaActual === c.categoria ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            {c.categoria}
          </button>
        ))}
      </div>

      <button onClick={() => mostrarResumen()}
        className="fixed bottom-6 left-6 right-6 bg-blue-600 text-white h-16 rounded-2xl font-black shadow-xl flex justify-between items-center px-8 active:scale-95 transition-transform">
        <span className="flex items-center gap-2 uppercase tracking-tighter"><Save size={20}/> Revisar Pedido</span>
        <span className="bg-white/20 px-4 py-1 rounded-xl">{carrito.length}</span>
      </button>
    </div>
  );
}
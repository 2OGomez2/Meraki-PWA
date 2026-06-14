import React, { useState, useEffect, useRef } from 'react';
import { Save, PlusCircle } from 'lucide-react';
import Swal from 'sweetalert2';

// Recibe "productosMenu" que viene directo desde App.jsx
export default function TomarOrden({ alCambiarVista, alGuardarOrden, productosMenu = [] }) {
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState("");
  const [busqueda, setBusqueda] = useState(""); 
  
  const carritoRef = useRef(carrito);
  useEffect(() => {
    carritoRef.current = carrito;
  }, [carrito]);

  // --- 1. ELIMINAR ÍTEM INDIVIDUAL (VISTA PREVIA) ---
  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => {
      const carritoActualizado = prev.reduce((acc, item) => {
        if (item.id === id) {
          if (item.cantidad > 1) {
            acc.push({ ...item, cantidad: item.cantidad - 1 });
          }
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

  // --- 3. CONFIGURAR PRODUCTO (MODAL) ---
  const abrirConfiguracionProducto = (prod) => {
    let cantidadLocal = 1;
    let aderezosPorPlato = [{}]; 
    let notaLocal = "";
    
    const esAlitas = Array.isArray(prod.aderezosDisponibles) && prod.aderezosDisponibles.length > 0;

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
            <span class="font-black text-xs">$${(prod.precioUnitario || 0).toFixed(2)}</span>
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
      preConfirm: () => {
        const nt = document.getElementById('swal-nota').value;
        const inputCant = document.getElementById('swal-cant');
        const valorCantidadReal = parseInt(inputCant.value) || 1;

        if (esAlitas) {
          return aderezosPorPlato.map((ade, i) => {
            const total = Object.values(ade).reduce((a, b) => a + b, 0);
            const ex = Math.max(0, total - (prod.maxAderezosGratis || 0));
            return {
              id: `${Date.now()}-${i}-${Math.random()}`,
              nombre: `${prod.nombre} (P${i+1})`,
              precioUnitario: (prod.precioUnitario || 0) + (ex * 0.5),
              cantidad: 1,
              aderezos: Object.entries(ade).filter(([_, c]) => c > 0).map(([n, c]) => `${n}x${c}`),
              nota: i === 0 ? nt : ""
            };
          });
        }

        return [{
          id: prod.id || Date.now(),
          nombre: prod.nombre,
          precioUnitario: prod.precioUnitario || 0,
          cantidad: valorCantidadReal,
          nota: nt
        }];
      }
    }).then(r => { 
      if (r.isConfirmed && r.value) { 
        setCarrito([...carrito, ...r.value]); 
      } 
    });
  };
    
  // --- 4. RESUMEN DE COMPRA ---
  const mostrarResumen = (car = carrito) => {
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
        Swal.getHtmlContainer().onclick = (e) => {
          const btn = e.target.closest('.del-btn');
          if (btn) {
            const idBuscar = isNaN(btn.dataset.id) ? btn.dataset.id : parseFloat(btn.dataset.id);
            eliminarDelCarrito(idBuscar);
          }
        };
      }
    }).then((result) => { 
      if (result.isConfirmed) { 
        alGuardarOrden(cliente, car); 
        setCarrito([]);
        setCliente("");
      } 
    });
  };

  // --- 🛠️ MAPEAR MENÚ CON PRECIO UNITARIO ---
  const mapearMenuSimplificado = () => {
    const categoriasValidas = [
      "Bebidas", 
      "Hamburguesas y Sandwich", 
      "Papas, Dedos de queso y Rollitos", 
      "Alitas"
    ];

    const contenedor = {
      "Bebidas": [],
      "Hamburguesas y Sandwich": [],
      "Papas, Dedos de queso y Rollitos": [],
      "Alitas": []
    };

    productosMenu.forEach(prod => {
      const madre = prod.categoriaMadre;
      if (contenedor[madre] !== undefined) {
        contenedor[madre].push(prod);
      }
    });

    return categoriasValidas.map(nombreCat => ({
      categoria: nombreCat,
      productos: contenedor[nombreCat]
    }));
  };

  const menuEstructurado = mapearMenuSimplificado();

  // --- FILTRADO POR BÚSQUEDA ---
  const menuFiltrado = menuEstructurado.map(cat => {
    const productosFiltrados = cat.productos.filter(p => 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    return { ...cat, productos: productosFiltrados };
  }).filter(cat => cat.productos.length > 0);

  return (
    <div className="flex flex-col h-[88vh] bg-slate-50 p-2">
      {/* 1. INPUT DE CLIENTE */}
      <div className="bg-white p-4 rounded-3xl shadow-sm mb-3 border flex items-center gap-3">
        <input 
          type="text" placeholder="CLIENTE..." 
          className="flex-1 text-xl font-black border-none focus:ring-0 uppercase"
          value={cliente} onChange={e => setCliente(e.target.value)}
        />
        <button onClick={agregarExtraManual} className="bg-orange-500 text-white p-3 rounded-2xl shadow-lg active:scale-95">
          <PlusCircle size={24} />
        </button>
      </div>

      {/* 2. BUSCADOR DIRECTO */}
      <div className="bg-white p-2 rounded-2xl shadow-sm mb-4 border">
        <input 
          type="text" 
          placeholder="🔍 BUSCAR PLATILLO O BEBIDA..." 
          className="w-full text-sm font-bold p-2 border-none focus:ring-0 uppercase text-slate-700 tracking-wide"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* 3. GRID DIRECTO DE PRODUCTOS */}
      <div className="flex-1 overflow-y-auto pb-44 px-1 space-y-6 no-scrollbar">
        {menuFiltrado.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-bold uppercase text-xs italic">
            No se encontraron productos para tu búsqueda.
          </div>
        ) : (
          menuFiltrado.map(cat => (
            <div key={cat.categoria} className="space-y-3">
              <div className="text-[12px] font-black text-slate-900 uppercase tracking-widest pl-2 flex items-center gap-2">
                <span className="bg-[#f4244c] text-white px-3 py-1 rounded-xl text-[10px] font-black shadow-sm">
                  ⚡ {cat.categoria}
                </span>
                <div className="h-[2px] bg-slate-200 flex-1"></div>
              </div>

              <div className="grid grid-cols-2 gap-3 pl-2">
                {cat.productos.map(p => (
                  <button key={p.idFB || p.id} onClick={() => abrirConfiguracionProducto(p)}
                    className="bg-white p-4 rounded-[2rem] border shadow-sm flex flex-col items-center justify-center h-28 active:bg-blue-50 transition-all hover:border-slate-300">
                    <span className="font-bold text-[10px] text-center uppercase mb-1 leading-tight text-slate-800 tracking-tight">
                      {p.nombre}
                    </span>
                    <span className="text-blue-600 font-black text-sm">
                      ${(p.precioUnitario || 0).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. BOTÓN FLOTANTE */}
      <button onClick={() => mostrarResumen()}
        className="fixed bottom-6 left-6 right-6 bg-blue-600 text-white h-16 rounded-2xl font-black shadow-xl flex justify-between items-center px-8 active:scale-95 transition-transform z-40">
        <span className="flex items-center gap-2 uppercase tracking-tighter"><Save size={20}/> Revisar Pedido</span>
        <span className="bg-white/20 px-4 py-1 rounded-xl">{carrito.length}</span>
      </button>
    </div>
  );
}
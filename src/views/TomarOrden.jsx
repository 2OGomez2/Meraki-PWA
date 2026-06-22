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
        <input id="ex-nom" class="swal2-input" placeholder="Nombre (ej. Descorche)" style="border-radius: 12px;">
        <input id="ex-pre" type="number" class="swal2-input" placeholder="Precio (ej. 1.50)" style="border-radius: 12px;">
      `,
      showCancelButton: true,
      confirmButtonText: 'AÑADIR',
      confirmButtonColor: '#FF4081',
      cancelButtonColor: '#E6144A',
      customClass: {
        popup: '!rounded-[1.5rem] !p-6'
      },
      preConfirm: () => {
        const nom = document.getElementById('ex-nom').value.toUpperCase();
        const pre = parseFloat(document.getElementById('ex-pre').value);
        if (!nom || isNaN(pre)) return Swal.showValidationMessage('Datos inválidos');
        return { nom, pre };
      }
    }).then(r => {
      if (r.isConfirmed) {
        setCarrito([...carrito, {
          id: `manual-${Date.now()}`,
          nombre: `EXTRA: ${r.value.nom}`,
          precioUnitario: r.value.pre,
          cantidad: 1,
          esExtra: true
        }]);
      }
    });
  };

  // --- 3. CONFIGURAR PRODUCTO (MODAL CON MANTENIMIENTO DE SCROLL Y FOCO CONTROLADO) ---
  const abrirConfiguracionProducto = (prod) => {
    let cantidadLocal = 1;
    let aderezosPorPlato = [{}]; 
    let notaLocal = "";
    
    const esAlitasCat = prod.categoriaMadre === "Alitas" || prod.categoria === "Alitas";
    const aderezosDisponiblesBase = (Array.isArray(prod.aderezosDisponibles) && prod.aderezosDisponibles.length > 0)
      ? prod.aderezosDisponibles
      : (esAlitasCat ? ["BBQ", "BÚFALO", "RANCH", "ORANGE"] : []);

    let maxGratisBase = parseInt(prod.maxAderezosGratis || prod.aderezosGratis || 0);
    if (esAlitasCat && maxGratisBase === 0) {
      if (prod.nombre.includes("6")) maxGratisBase = 1;
      else if (prod.nombre.includes("12")) maxGratisBase = 2;
      else maxGratisBase = 1; 
    }

    const esAlitas = aderezosDisponiblesBase.length > 0;

    const actualizarContenidoModal = () => {
      const inputCant = document.getElementById('swal-cant');
      if (inputCant) {
        cantidadLocal = inputCant.value === "" ? "" : (parseInt(inputCant.value) || 0);
        if (esAlitas) {
          const limitePlatos = Math.max(1, cantidadLocal || 1);
          while (aderezosPorPlato.length < limitePlatos) aderezosPorPlato.push({});
          while (aderezosPorPlato.length > limitePlatos) aderezosPorPlato.pop();
        }
      }

      let htmlPlatos = "";
      if (esAlitas) {
        htmlPlatos = aderezosPorPlato.map((ade, i) => {
          const total = Object.values(ade).reduce((a, b) => a + b, 0);
          const extras = Math.max(0, total - maxGratisBase);
          return `
            <div class="p-3 rounded-2xl mb-3 border text-left" style="background-color: #FFF8F0; border-color: #FFEBD9;">
              <div class="flex justify-between items-center mb-2">
                <span class="font-black text-[10px]" style="color: #E6144A;">PLATO ${i + 1}</span>
                ${extras > 0 ? `<span class="text-[9px] font-black text-red-500">+$${(extras * 0.5).toFixed(2)}</span>` : ''}
              </div>
              <div class="grid grid-cols-2 gap-2">
                ${aderezosDisponiblesBase.map(a => `
                  <div class="flex items-center justify-between p-1 bg-white rounded-lg border" style="border-color: #FFEBD9;">
                    <span class="text-[8px] font-bold" style="color: #4A4A4A;">${a}</span>
                    <div class="flex items-center gap-1">
                      <button class="ade-btn w-6 h-6 bg-slate-200 rounded font-black text-xs" data-plato="${i}" data-ade="${a}" data-type="minus" type="button">-</button>
                      <span class="text-[9px] font-black w-3 text-center" style="color: #4A4A4A;">${ade[a] || 0}</span>
                      <button class="ade-btn w-6 h-6 text-white rounded font-black text-xs" style="background-color: #FF4081;" data-plato="${i}" data-ade="${a}" data-type="plus" type="button">+</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('');
      }

      return `
        <div class="text-left font-sans" style="color: #4A4A4A;">
          <div class="mb-4 text-white p-3 rounded-xl flex justify-between" style="background-color: #E6144A;">
            <span class="font-black text-xs uppercase">${prod.nombre}</span>
            <span class="font-black text-xs">$${(prod.precioUnitario || 0).toFixed(2)}</span>
          </div>
          ${esAlitas ? `
          <div class="mb-2 text-center">
            <span class="text-[10px] border font-black uppercase px-3 py-1 rounded-full" style="background-color: #FFF8F0; color: #34C759; border-color: #34C759;">
              Incluye ${maxGratisBase} aderezo(s) gratis por plato
            </span>
          </div>
          ` : ''}
          <div class="mb-4">
            <label class="text-[10px] font-black uppercase text-slate-400">Cantidad</label>
            <input type="number" id="swal-cant" class="swal2-input !m-0 !w-full" value="${cantidadLocal}" min="1" placeholder="0" style="border-radius: 12px; border-color: #FFEBD9;">
          </div>
          <div id="contenedor-platos" class="max-h-[250px] overflow-y-auto">${htmlPlatos}</div>
          <textarea id="swal-nota" class="swal2-textarea !m-0 !w-full !text-xs mt-3" placeholder="Notas..." style="border-radius: 12px; border-color: #FFEBD9;">${notaLocal}</textarea>
        </div>
      `;
    };

    Swal.fire({
      title: 'CONFIGURAR',
      html: actualizarContenidoModal(),
      showCancelButton: true,
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#FF4081',
      cancelButtonColor: '#E6144A',
      customClass: {
        popup: '!rounded-[1.5rem] !p-6'
      },
      didOpen: () => {
        const p = Swal.getPopup();
        const inputCant = p.querySelector('#swal-cant');

        const refrescarModal = (mantenerFocoInput = false) => {
          const txtNota = document.getElementById('swal-nota');
          const contenedorPlatos = document.getElementById('contenedor-platos');
          
          // Guardar posición exacta del scroll antes del update
          const posicionScroll = contenedorPlatos ? contenedorPlatos.scrollTop : 0;
          notaLocal = txtNota ? txtNota.value : "";
          
          Swal.update({ html: actualizarContenidoModal() });
          
          // Restaurar la posición del scroll de inmediato
          const nuevoContenedor = document.getElementById('contenedor-platos');
          if (nuevoContenedor) {
            nuevoContenedor.scrollTop = posicionScroll;
          }
          
          const nuevoInput = Swal.getPopup().querySelector('#swal-cant');
          if (nuevoInput) {
            nuevoInput.oninput = () => refrescarModal(true);
            nuevoInput.onchange = () => refrescarModal(true);
            
            // Solo se le da focus si el cambio provino nativamente desde las teclas o flechas del input
            if (mantenerFocoInput) {
              nuevoInput.focus();
              const largo = nuevoInput.value.length;
              nuevoInput.setSelectionRange(largo, largo);
            }
          }
        };

        if (inputCant) {
          inputCant.oninput = () => refrescarModal(true);
          inputCant.onchange = () => refrescarModal(true);
        }

        p.onclick = (e) => {
          if (e.target.classList.contains('ade-btn')) {
            const { plato, ade, type } = e.target.dataset;
            const idx = parseInt(plato);
            aderezosPorPlato[idx][ade] = (aderezosPorPlato[idx][ade] || 0) + (type === 'plus' ? 1 : -1);
            if (aderezosPorPlato[idx][ade] < 0) aderezosPorPlato[idx][ade] = 0;
            
            const txtNota = document.getElementById('swal-nota');
            notaLocal = txtNota ? txtNota.value : "";
            
            // Llamamos pasando false para que no fuerce el foco arriba en el input de cantidad
            refrescarModal(false);
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
            const ex = Math.max(0, total - maxGratisBase);
            const arrayAderezosFormateados = Object.entries(ade)
              .filter(([_, c]) => c > 0)
              .map(([n, c]) => `${c}x ${n}`);

            const sufijoSalsa = arrayAderezosFormateados.length > 0 
              ? ` (${arrayAderezosFormateados.join(" + ")})` 
              : " (SIN ADEREZO)";

            return {
              id: `${prod.id || 'alita'}-${Date.now()}-${i}-${Math.random()}`,
              nombre: prod.nombre.toUpperCase(),
              precioUnitario: (prod.precioUnitario || 0) + (ex * 0.5),
              amount: 1,
              cantidad: 1,
              aderezos: arrayAderezosFormateados,
              nota: i === 0 ? nt : ""
            };
          });
        }

        return [{
          id: `${prod.id || 'prod'}-${Date.now()}-${Math.random()}`, 
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
        confirmButtonColor: '#FF4081'
      });
    }
    
    if (!cliente || cliente.trim() === "") {
      return Swal.fire({
        title: "Falta Cliente",
        text: "¿A nombre de quién va el pedido?",
        icon: "warning",
        confirmButtonColor: '#FF4081'
      });
    }

    const total = car.reduce((s, i) => s + (i.precioUnitario * i.cantidad), 0);

    Swal.fire({
      title: `REVISAR: ${cliente.toUpperCase()}`,
      customClass: {
        popup: '!w-[95vw] !max-w-xl !rounded-[2.5rem] !p-6'
      },
      html: `
        <div class="text-left max-h-[420px] overflow-y-auto font-sans px-1" style="color: #4A4A4A;">
          ${car.map(i => `
            <div class="flex justify-between items-start py-5 border-b gap-4" style="border-color: #FFEBD9;">
              <div class="flex-1 min-w-0">
                <div class="font-black !text-xl uppercase tracking-tight leading-snug break-words" style="color: #4A4A4A;">
                  ${i.cantidad}x ${i.nombre}
                </div>
                
                ${i.aderezos && i.aderezos.length > 0 ? `
                  <div class="!text-sm font-bold mt-1 uppercase tracking-wide" style="color: #E6144A;">
                    ✨ ${i.aderezos.join(', ')}
                  </div>
                ` : ''}
                
                ${i.nota ? `
                  <div class="mt-3 p-3 border rounded-2xl !text-base font-extrabold leading-normal shadow-sm" style="background-color: #FFF8F0; border-color: #FFEBD9; color: #4A4A4A;">
                    <span class="uppercase text-xs font-black block mb-1 tracking-wider" style="color: #FF4081;">📌 NOTA DE COCINA:</span>
                    "${i.nota}"
                  </div>
                ` : ''}
              </div>
              
              <div class="flex items-center gap-3 shrink-0 pt-1">
                <span class="font-black !text-base" style="color: #4A4A4A;">$${(i.precioUnitario * i.cantidad).toFixed(2)}</span>
                <button class="del-btn text-red-500 bg-red-50 hover:bg-red-100 p-3 rounded-2xl transition-colors active:scale-95" data-id="${i.id}">
                  🗑️
                </button>
              </div>
            </div>
          `).join('')}
          
          <div class="mt-6 p-5 text-white rounded-3xl flex justify-between items-center shadow-lg" style="background-color: #E6144A; box-shadow: 0 4px 12px rgba(255, 180, 150, 0.3);">
            <span class="font-black text-sm tracking-widest">TOTAL A COBRAR:</span>
            <span class="text-3xl font-black tracking-tight">$${total.toFixed(2)}</span>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'ENVIAR A COCINA',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#34C759',
      cancelButtonColor: '#E6144A',
      reverseButtons: true,
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          popup.style.backgroundColor = '#FFF8F0';
        }
        Swal.getHtmlContainer().onclick = (e) => {
          const btn = e.target.closest('.del-btn');
          if (btn) {
            const idBuscar = btn.dataset.id;
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

  // --- 🛠️ MAPEAR MENÚ DINÁMICO DESDE FIREBASE ---
  const mapearMenuSimplificado = () => {
    // 1. Extraemos todas las categorías únicas presentes en tus productos reales de Firebase
    const categoriesValidas = [
      ...new Set(
        productosMenu.map(prod => {
          let madre = prod.categoriaMadre;
          if (madre === "Papas, Dedos de queso y Rollitos") {
            return "Papas,Dedos de queso y Rollitos";
          }
          return madre;
        }).filter(Boolean)
      )
    ];

    // 2. Inicializamos el contenedor de forma dinámica
    const contenedor = {};
    categoriesValidas.forEach(cat => {
      contenedor[cat] = [];
    });

    // 3. Agrupamos los productos en su respectiva categoría madre
    productosMenu.forEach(prod => {
      let madre = prod.categoriaMadre;
      if (madre === "Papas, Dedos de queso y Rollitos") {
        madre = "Papas,Dedos de queso y Rollitos";
      }
      if (contenedor[madre] !== undefined) {
        contenedor[madre].push(prod);
      }
    });

    return categoriesValidas.map(nombreCat => ({
      categoria: nombreCat,
      productos: contenedor[nombreCat] || []
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
    <div className="flex flex-col h-[88vh] p-2" style={{ backgroundColor: '#FFF8F0' }}>
      {/* 1. INPUT DE CLIENTE */}
      <div 
        className="p-4 rounded-3xl border flex items-center gap-3"
        style={{ backgroundColor: '#FFEBD9', borderColor: '#FFEBD9', boxShadow: '0 4px 10px rgba(255, 180, 150, 0.2)' }}
      >
        <input 
          type="text" placeholder="CLIENTE..." 
          className="flex-1 text-xl font-black border-none focus:ring-0 uppercase bg-transparent placeholder-neutral-500"
          style={{ color: '#4A4A4A', fontFamily: '"Nunito", "Fredoka One", sans-serif' }}
          value={cliente} onChange={e => setCliente(e.target.value)}
        />
        <button 
          onClick={agregarExtraManual} 
          className="p-3 text-white transition-transform active:scale-95"
          style={{ backgroundColor: '#E6144A', borderRadius: '50px', boxShadow: '0 4px 10px rgba(230, 20, 74, 0.3)' }}
        >
          <PlusCircle size={24} />
        </button>
      </div>

      {/* 2. BUSCADOR DIRECTO */}
      <div 
        className="p-2 rounded-2xl border mt-3 mb-4"
        style={{ backgroundColor: '#FFEBD9', borderColor: '#FFEBD9' }}
      >
        <input 
          type="text" 
          placeholder="🔍 BUSCAR PLATILLO O BEBIDA..." 
          className="w-full text-sm font-bold p-2 border-none focus:ring-0 uppercase tracking-wide bg-transparent placeholder-neutral-500"
          style={{ color: '#4A4A4A' }}
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* 3. GRID DIRECTO DE PRODUCTOS */}
      <div className="flex-1 overflow-y-auto pb-44 px-1 space-y-6 no-scrollbar">
        {menuFiltrado.length === 0 ? (
          <div className="text-center py-10 font-bold uppercase text-xs italic" style={{ color: '#4A4A4A' }}>
            No se encontraron productos para tu búsqueda.
          </div>
        ) : (
          menuFiltrado.map(cat => (
            <div key={cat.categoria} className="space-y-3">
              <div className="text-[12px] font-black uppercase tracking-widest pl-2 flex items-center gap-2" style={{ color: '#4A4A4A' }}>
                <span 
                  className="text-white px-3 py-1 rounded-xl text-[10px] font-black shadow-sm"
                  style={{ backgroundColor: '#FF4081', fontFamily: '"Nunito", "Fredoka One", sans-serif' }}
                >
                  ⚡ {cat.categoria === "Papas,Dedos de queso y Rollitos" ? "Papas y Dedos" : cat.categoria}
                </span>
                <div className="h-[2px] flex-1" style={{ backgroundColor: '#FFEBD9' }}></div>
              </div>

              <div className="grid grid-cols-2 gap-3 pl-2">
                {cat.productos.map(p => (
                  <button 
                    key={p.idFB || p.id} onClick={() => abrirConfiguracionProducto(p)}
                    className="p-4 rounded-[2rem] border flex flex-col items-center justify-center h-28 transition-all"
                    style={{ 
                      backgroundColor: '#FFEBD9', 
                      borderColor: '#FFEBD9',
                      boxShadow: '0 4px 8px rgba(255, 180, 150, 0.15)',
                    }}
                  >
                    <span 
                      className="font-bold text-[11px] text-center uppercase mb-1 leading-tight tracking-tight"
                      style={{ color: '#4A4A4A', fontFamily: '"Nunito", sans-serif' }}
                    >
                      {p.nombre}
                    </span>
                    <span 
                      className="font-black text-sm"
                      style={{ color: '#E6144A', fontFamily: '"Fredoka One", "Nunito", sans-serif' }}
                    >
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
      <button 
        onClick={() => mostrarResumen()}
        className="fixed bottom-6 left-6 right-6 text-white h-16 flex justify-between items-center px-8 transition-transform z-40 active:scale-95 shadow-lg"
        style={{ 
          backgroundColor: '#FF4081', 
          borderRadius: '50px',
          boxShadow: '0 6px 16px rgba(255, 64, 129, 0.4)',
          fontFamily: '"Nunito", "Fredoka One", sans-serif'
        }}
      >
        <span className="flex items-center gap-2 uppercase tracking-tighter font-black text-base"><Save size={20}/> Revisar Pedido</span>
        <span className="bg-white/20 px-4 py-1 rounded-full font-black">{carrito.length}</span>
      </button>
    </div>
  );
}
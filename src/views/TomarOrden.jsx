import React, { useState } from 'react';
import { MENU_ESTRUCTURADO } from '../utils/menu';
import { ChevronLeft } from 'lucide-react';
import ItemCarrito from '../components/ItemCarrito';
import ModalAderezos from '../components/ModalAderezos'; 

export default function TomarOrden({ alCambiarVista, alGuardarOrden, alCobrarTodo }) {
  const [cliente, setCliente] = useState("");
  const [carrito, setCarrito] = useState([]);
  
  // Estados para la navegación del menú
  const [catSel, setCatSel] = useState(null); 
  const [subSel, setSubSel] = useState(null);
  
  // Estado para controlar qué combo de alitas se está configurando
  const [configurandoAlitas, setConfigurandoAlitas] = useState(null);

  // Función principal para añadir productos
  const agregarAlPedido = (p, m = null) => {
    // --- CASO A: ES UN COMBO DE ALITAS (Abrimos el Modal) ---
    if (p.aderezosDisponibles) {
      setConfigurandoAlitas(p);
    } 
    else {
      // --- CASO B: PRODUCTO NORMAL O CON MODIFICADORES ---
      const d = m ? m.nombre : "Normal";
      const pF = p.precioBase + (m ? m.precioEfecto : 0);
      
      // Verificamos si ya existe para sumar cantidad
      const exIdx = carrito.findIndex(i => i.nombre === p.nombre && i.detalle === d);
      
      if (exIdx > -1) {
        const nC = [...carrito];
        nC[exIdx].cantidad += 1;
        setCarrito(nC);
      } else {
        setCarrito([...carrito, { 
          id: Math.random().toString(36).substr(2, 5), 
          nombre: p.nombre, 
          precioUnitario: pF, 
          detalle: d, 
          cantidad: 1 
        }]);
      }
    }
  };

  // Función que recibe los datos desde el ModalAderezos
  const finalizarConfiguracionAlitas = (precio, detalle) => {
    setCarrito([...carrito, { 
      id: Math.random().toString(36).substr(2, 5), 
      nombre: configurandoAlitas.nombre, 
      precioUnitario: precio, 
      detalle: detalle, 
      cantidad: 1 
    }]);
    setConfigurandoAlitas(null);
  };

  return (
    <div className="p-4 pb-48">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => alCambiarVista("home")} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <input 
          value={cliente} 
          onChange={(e) => setCliente(e.target.value)} 
          placeholder="Mesa o Cliente..." 
          className="flex-1 bg-white p-4 rounded-2xl border font-black text-lg outline-none shadow-sm focus:border-blue-500 transition-all" 
        />
      </div>

      {/* Selector de Categorías (Nivel 1) */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {MENU_ESTRUCTURADO.map(c => (
          <button 
            key={c.categoria}
            onClick={() => { setCatSel(c); setSubSel(null); }}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${catSel?.categoria === c.categoria ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border'}`}
          >
            {c.categoria}
          </button>
        ))}
      </div>

      {/* Selector de Subcategorías (Nivel 2) */}
      {catSel && (
        <div className="flex gap-2 overflow-x-auto pb-4 mt-2">
          {catSel.subcategorias.map(s => (
            <button 
              key={s.nombre}
              onClick={() => setSubSel(s)}
              className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase border-2 transition-all ${subSel?.nombre === s.nombre ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
            >
              {s.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Listado de Productos (Nivel 3) */}
      <div className="space-y-4 mt-6">
        {subSel && subSel.productos && subSel.productos.length > 0 ? (
          subSel.productos.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:border-blue-100 transition-all">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-black text-slate-800 text-lg">{p.nombre}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {p.aderezosDisponibles ? "Configuración Requerida" : "Producto individual"}
                  </p>
                </div>
                <span className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-lg shadow-blue-100">
                  ${p.precioBase.toFixed(2)}
                </span>
              </div>

              <button 
                onClick={() => agregarAlPedido(p)} 
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all"
              >
                {p.aderezosDisponibles ? "Configurar Combo" : "Añadir al Carrito"}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-20">
             <p className="font-black uppercase text-xs">Selecciona una categoría arriba</p>
          </div>
        )}
      </div>

      {/* Resumen del Carrito */}
      <div className="mt-8 bg-slate-100 p-4 rounded-[2rem] space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2">Pedido Actual</p>
        {carrito.map(i => (
          <ItemCarrito key={i.id} item={i} alEliminar={(id) => setCarrito(carrito.filter(x => x.id !== id))} />
        ))}
      </div>

      {/* Botones de Acción Global */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t flex gap-4">
        <button 
          onClick={() => { if(!cliente) return alert("Ingresa el nombre del cliente"); alGuardarOrden(cliente, carrito); }} 
          className="flex-1 bg-slate-800 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
        >
          Guardar Pendiente
        </button>
        <button 
          onClick={() => { if(carrito.length === 0) return alert("El carrito está vacío"); alCobrarTodo(cliente || "Mostrador", carrito); }} 
          className="flex-1 bg-green-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-green-100"
        >
          Cobrar Todo
        </button>
      </div>

      {/* MODAL DE ADEREZOS (Se activa solo si hay un combo seleccionado) */}
      {configurandoAlitas && (
        <ModalAderezos 
          producto={configurandoAlitas}
          alCerrar={() => setConfigurandoAlitas(null)}
          alFinalizar={finalizarConfiguracionAlitas}
        />
      )}
    </div>
  );
}
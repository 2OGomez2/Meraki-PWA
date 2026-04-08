import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import ModalPartirCuenta from '../components/ModalPartirCuenta'; // <-- Usamos tu ladrillo

function Pendientes({ alCambiarVista, ordenes, alFinalizarPago }) {
  const [ordenAPartir, setOrdenAPartir] = useState(null);
  const [carritoParcial, setCarritoParcial] = useState([]);

  const toggleSeleccionParcial = (item) => {
    const existe = carritoParcial.find(i => i.id === item.id);
    if (existe) {
      setCarritoParcial(carritoParcial.filter(i => i.id !== item.id));
    } else {
      let cant = 1;
      if (item.cantidad > 1) {
        const res = prompt(`¿Cuántos "${item.nombre}" va a pagar? (Máx: ${item.cantidad})`, "1");
        cant = parseInt(res);
        if (isNaN(cant) || cant <= 0 || cant > item.cantidad) return alert("Cantidad no válida");
      }
      setCarritoParcial([...carritoParcial, { ...item, cantidad: cant }]);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => alCambiarVista("home")} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-black tracking-tight">Cuentas Abiertas</h2>
      </div>

      {/* Listado de Órdenes */}
      {ordenes.length === 0 ? (
        <p className="text-center text-slate-400 font-bold mt-20 uppercase text-xs tracking-widest">
          No hay cuentas pendientes
        </p>
      ) : (
        ordenes.map(o => (
          <div key={o.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">{o.cliente}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{o.hora} • {o.items.length} líneas</p>
              </div>
              <span className="text-2xl font-black text-blue-600">${o.total.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setOrdenAPartir(o)}
                className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                CUENTA APARTE
              </button>
              <button 
                onClick={() => alFinalizarPago(o, o.items, false)}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                COBRAR TODO
              </button>
            </div>
          </div>
        ))
      )}

      {/* AQUÍ USAMOS EL COMPONENTE (Mucho más limpio) */}
      {ordenAPartir && (
        <ModalPartirCuenta 
          orden={ordenAPartir}
          carritoParcial={carritoParcial}
          alCerrar={() => { setOrdenAPartir(null); setCarritoParcial([]); }}
          alToggleItem={toggleSeleccionParcial}
          alFinalizar={() => {
            alFinalizarPago(ordenAPartir, carritoParcial, true);
            setOrdenAPartir(null);
            setCarritoParcial([]);
          }}
        />
      )}
    </div>
  );
}

export default Pendientes;
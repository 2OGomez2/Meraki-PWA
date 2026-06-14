import React, { useState, useEffect } from 'react';
import { PlusCircle, Receipt, DollarSign, FileText } from 'lucide-react';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { db } from "../firebaseConfig";

export default function GastosEncargada() {
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [gastosHoy, setGastosHoy] = useState([]);

  // Obtener la fecha de hoy en formato local YYYY-MM-DD
  const obtenerFechaHoyLocal = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const hoy = new Date(d.getTime() - (offset * 60 * 1000));
    return hoy.toISOString().split('T')[0];
  };

  const hoyLocal = obtenerFechaHoyLocal();

  // Escuchar en vivo los gastos únicamente del día de hoy
  useEffect(() => {
    const q = query(
      collection(db, 'gastos'),
      where('fecha', '==', hoyLocal)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordenar por inserción o ID
      setGastosHoy(lista);
    });

    return () => unsubscribe();
  }, [hoyLocal]);

  const guardarGasto = async (e) => {
    e.preventDefault();
    if (!concepto.trim() || !monto || parseFloat(monto) <= 0) {
      Swal.fire('Error', 'Por favor ingresa un concepto válido y un monto mayor a 0.', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'gastos'), {
        concepto: concepto.trim(),
        monto: parseFloat(monto),
        fecha: hoyLocal, // Guardado estricto YYYY-MM-DD
        timestamp: Date.now()
      });

      Swal.fire({
        title: '¡Gasto Guardado!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      setConcepto('');
      setMonto('');
    } catch (error) {
      console.error("Error al guardar gasto: ", error);
      Swal.fire('Error', 'No se pudo registrar el gasto.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-2">
      <div className="flex items-center gap-3 mb-2">
        <Receipt className="text-[#f4244c]" size={28} />
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Registro de Gastos Diarios</h2>
      </div>

      {/* Formulario de registro */}
      <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
        <form onSubmit={guardarGasto} className="space-y-4">
          <div>
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
              Producto comprado / Concepto
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><FileText size={18} /></span>
              <input 
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej. Compra de servilletas, azúcar, etc."
                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#f4244c] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
              Cantidad Gastada
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input 
                type="number"
                step="any"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3.5 border-2 border-slate-200 rounded-xl font-black text-slate-800 outline-none focus:border-[#f4244c] transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <PlusCircle size={16} /> Guardar Gasto
          </button>
        </form>
      </div>

      {/* Visualización de gastos del día */}
      <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Gastos de Hoy ({hoyLocal})</h3>
        
        {gastosHoy.length === 0 ? (
          <p className="text-slate-400 italic text-sm font-medium py-4 text-center">No se han registrado gastos el día de hoy.</p>
        ) : (
          <div className="space-y-2.5">
            {gastosHoy.map((g) => (
              <div key={g.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="font-bold text-slate-700 uppercase text-xs tracking-wide">
                  • {g.concepto}
                </span>
                <span className="font-black text-[#f4244c] text-sm">
                  -${g.monto.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
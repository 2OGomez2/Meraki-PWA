import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

export default function CorteCaja() {
  const [ingresosHoy, setIngresosHoy] = useState(0);
  const [gastosHoy, setGastosHoy] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Obtener la fecha de hoy en formato exacto YYYY-MM-DD (Evita desfases de zona horaria)
    const hoyRaw = new Date();
    const offset = hoyRaw.getTimezoneOffset() * 60000;
    const hoyLocal = new Date(hoyRaw.getTime() - offset);
    const fechaHoyString = hoyLocal.toISOString().split('T')[0]; // Genera "2026-06-16"

    console.log("Buscando transacciones para la fecha de hoy:", fechaHoyString);

    // 2. Escuchar la colección CORRECTA: 'historial'
    const desuscribirIngresos = onSnapshot(collection(db, 'historial'), (snapshot) => {
      let totalIngresos = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Verificamos que el documento sea de hoy usando el campo 'fecha' de tu Firestore
        if (data.fecha === fechaHoyString) {
          
          // Buscamos el dinero en la raíz del documento (revisa cuál de estos coincide con tu scroll inferior)
          let montoDetectado = data.montoTotalCobrar || data.totalAcumulado || data.montoPagado || data.total || data.monto || data.pago || 0;
          
          // Si el campo raíz no existe o es 0, calculamos sumando los items por si acaso
          if (montoDetectado === 0 && data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
              const precio = Number(item.precio || item.precioUnitario || item.subtotal || 0);
              const cantidad = Number(item.cantidad || 1);
              montoDetectado += (precio * cantidad);
            });
          }
          
          totalIngresos += Number(montoDetectado);
        }
      });
      
      console.log("Total ingresos calculados hoy:", totalIngresos);
      setIngresosHoy(totalIngresos);
    }, (error) => {
      console.error("Error al escuchar historial:", error);
    });

    // 3. Escuchar la colección de gastos
    const desuscribirGastos = onSnapshot(collection(db, 'gastos'), (snapshot) => {
      let totalGastos = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Si tus gastos usan formato string "YYYY-MM-DD", comparamos directo:
        if (data.fecha === fechaHoyString) {
          totalGastos += Number(data.monto || data.total || 0);
        }
      });
      setGastosHoy(totalGastos);
      setCargando(false);
    }, (error) => {
      console.error("Error al escuchar gastos:", error);
      setCargando(false);
    });

    return () => {
      desuscribirIngresos();
      desuscribirGastos();
    };
  }, []);

  const cajaEstimada = ingresosHoy - gastosHoy;

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xs font-black uppercase text-slate-400 tracking-widest animate-pulse">
          Calculando flujos del turno...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-6 font-sans">
      
      {/* TARJETA PRINCIPAL: BALANCE ESTIMADO */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl border border-slate-800 text-center space-y-2 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-slate-800/40 pointer-events-none">
          <Wallet size={160} />
        </div>
        <p className="text-[10px] font-black uppercase text-[#f4244c] tracking-widest">
          Control de Turno Activo
        </p>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Efectivo Estimado en Caja (Hoy)
        </h2>
        <p className="text-5xl font-black tracking-tight text-white flex items-center justify-center gap-0.5">
          <span className="text-2xl text-[#f4244c] font-black">$</span>
          {cajaEstimada.toFixed(2)}
        </p>
        <span className="inline-block bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
          Solo Visualización
        </span>
      </div>

      {/* DETALLE DE FLUJOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Dinero Ingresado (Hoy)
            </p>
            <p className="text-2xl font-black text-slate-800">
              ${ingresosHoy.toFixed(2)}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
              Historial de ventas y abonos
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ArrowUpRight size={22} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Dinero Gastado (Hoy)
            </p>
            <p className="text-2xl font-black text-slate-800">
              ${gastosHoy.toFixed(2)}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
              Egresos registrados hoy
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-[#f4244c] rounded-2xl">
            <ArrowDownRight size={22} />
          </div>
        </div>
      </div>

    </div>
  );
}
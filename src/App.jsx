import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; 
import { 
  collection, addDoc, onSnapshot, updateDoc, 
  doc, deleteDoc, query, orderBy 
} from "firebase/firestore";
import Swal from 'sweetalert2';

import { LayoutGrid, Clock, Wallet, CheckCircle, Calculator, TrendingUp } from 'lucide-react';

import Home from './views/Home';
import TomarOrden from './views/TomarOrden';
import Pendientes from './views/Pendientes';
import Caja from './views/Caja'; 
import CorteCaja from './views/CorteCaja';
import Dashboard from './views/Dashboard';
import Solventes from './views/Solventes';

function App() {
  const [vista, setVista] = useState("home");
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  const [historialVentas, setHistorialVentas] = useState([]);

  const GASTOS_FIJOS_DIARIOS = 30.00; 

  useEffect(() => {
    const qP = query(collection(db, "pendientes"), orderBy("id", "desc"));
    const unsubP = onSnapshot(qP, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), idFB: d.id }));
      setOrdenesPendientes(data);
    });

    const qH = query(collection(db, "historial"), orderBy("id", "desc"));
    const unsubH = onSnapshot(qH, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), idFB: d.id }));
      setHistorialVentas(data);
    });

    return () => { unsubP(); unsubH(); };
  }, []);

  const navegarA = (nuevaVista) => setVista(nuevaVista);
     
    const alGuardarOrden = async (cliente, carrito) => {
  try {
    if (carrito.length === 0) return;
    const totalCalculado = carrito.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
    
    // Guardar en Firebase
    await addDoc(collection(db, "pendientes"), {
      id: Date.now(),
      cliente: cliente.trim().toUpperCase(),
      items: carrito,
      total: totalCalculado,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estado: "por_preparar"
    });

    Swal.fire({ icon: 'success', title: '¡Pedido Enviado!', timer: 1500, showConfirmButton: false });
    setVista("pendientes"); 

  } catch (error) { 
    // ESTO ES LO IMPORTANTE:
    console.error("ERROR REAL:", error); // Revisa la consola del navegador (F12)
    Swal.fire("Error", `Detalle: ${error.message}`, "error");
  }
};

  const pasarACaja = async (orden) => {
    try {
      await addDoc(collection(db, "historial"), {
        ...orden,
        idOrden: orden.id,
        pagado: false,
        totalAcumulado: orden.total,
        conteoCobros: 0,
        pagos: [{ monto: 0, items: orden.items }]
      });
      await deleteDoc(doc(db, "pendientes", orden.idFB));
    } catch (error) { console.error(error); }
  };

  const finalizarVenta = async (ventaIdFB) => {
    try {
      const ventaActual = historialVentas.find(v => v.idFB === ventaIdFB);
      const totalReal = ventaActual.pagos[0].items.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);
      const ventaRef = doc(db, "historial", ventaIdFB);
      await updateDoc(ventaRef, {
        pagado: true,
        totalAcumulado: totalReal,
        horaFinalizacion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      Swal.fire({ icon: 'success', title: 'Venta Finalizada', timer: 1500, showConfirmButton: false });
    } catch (error) { console.error(error); }
  };

  const realizarPagoParcial = async (ventaIdFB, itemsAPagar) => {
  try {
    const ventaActual = historialVentas.find(v => v.idFB === ventaIdFB);
    if (!ventaActual) return;

    const ventaRef = doc(db, "historial", ventaIdFB);
    const montoRealAbono = itemsAPagar.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);

    // 1. GUARDAR EL ABONO: Aseguramos que idPadre sea EXACTAMENTE el idFB del padre real
    await addDoc(collection(db, "historial"), {
      id: Date.now(),
      cliente: `${ventaActual.cliente} (ABONO)`,
      items: itemsAPagar, 
      totalAcumulado: montoRealAbono, 
      pagado: true, 
      horaFinalizacion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      esPagoParcial: true,
      idPadre: ventaIdFB // <-- Vinculación perfecta de FireBase ID
    });

    // 2. FILTRAR ITEMS RESTANTES
    const itemsRestantes = ventaActual.pagos[0].items.filter(item => 
      !itemsAPagar.some(p => p.nombre === item.nombre)
    );
    const esUltimo = itemsRestantes.length === 0;
    const nuevoTotalRestante = itemsRestantes.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);

    // 3. ACTUALIZAR EL PADRE: Mantenemos el idFB intacto y solo modificamos contenido
    await updateDoc(ventaRef, {
      "pagos.0.items": itemsRestantes,
      totalAcumulado: nuevoTotalRestante,
      pagado: esUltimo,
      conteoCobros: (ventaActual.conteoCobros || 0) + 1,
      horaFinalizacion: esUltimo ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
    });

    Swal.fire("¡Cobro Realizado!", `Ticket de $${montoRealAbono.toFixed(2)}`, "success");
  } catch (error) { 
    console.error("Error en cobro parcial:", error); 
  }
};
  
  const agregarExtraAFirebase = async (ventaIdFB, nuevoExtra) => {
  try {
    const ventaRef = doc(db, "historial", ventaIdFB);
    const ventaActual = historialVentas.find(v => v.idFB === ventaIdFB);
    
    if (!ventaActual) return;

    const itemsPrevios = ventaActual.pagos[0]?.items || [];
    // Usamos Number() para asegurar que no se concatenen como texto
    const nuevoTotalCalculado = Number(ventaActual.totalAcumulado || 0) + (Number(nuevoExtra.precioUnitario) * Number(nuevoExtra.cantidad));

    await updateDoc(ventaRef, {
      "pagos.0.items": [...itemsPrevios, nuevoExtra],
      "totalAcumulado": nuevoTotalCalculado
    });

    Swal.fire({ icon: 'success', title: 'Extra sumado', timer: 800, showConfirmButton: false });
  } catch (error) {
    console.error("Error al guardar extra:", error);
    Swal.fire("Error", "No se guardó el extra", "error");
  }
};

  // NUEVA FUNCIÓN PARA EL DASHBOARD
  const cerrarCajaFirebase = async (resumen) => {
    try {
      await addDoc(collection(db, "reportes_diarios"), {
        ...resumen,
        fechaCompleta: new Date().toISOString(),
        fechaFormateada: new Date().toLocaleDateString()
      });
      Swal.fire("¡Cierre Guardado!", "El reporte diario ha sido archivado.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar el cierre.", "error");
    }
  };

  const NavBarSuperior = () => (
    <div className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="flex overflow-x-auto no-scrollbar items-center p-2 gap-2">
        <NavButton icon={<LayoutGrid size={18}/>} label="Menú" activa={vista === "home" || vista === "tomar"} onClick={() => navegarA("home")} />
        <NavButton icon={<Clock size={18}/>} label="Cocina" activa={vista === "pendientes"} onClick={() => navegarA("pendientes")} />
        <NavButton icon={<Wallet size={18}/>} label="Caja" activa={vista === "caja"} onClick={() => navegarA("caja")} />
        <NavButton icon={<CheckCircle size={18}/>} label="Tickets" activa={vista === "solventes"} onClick={() => navegarA("solventes")} />
        <NavButton icon={<TrendingUp size={18}/>} label="Negocio" activa={vista === "dashboard"} onClick={() => navegarA("dashboard")} />
        <NavButton icon={<Calculator size={18}/>} label="Corte" activa={vista === "corte"} onClick={() => navegarA("corte")} />
      </div>
    </div>
  );

  const NavButton = ({ icon, label, activa, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center min-w-[80px] p-2 rounded-xl transition-all ${activa ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {vista !== "dashboard" && <NavBarSuperior />}
      <div className={vista === "dashboard" ? "" : "p-4 pb-24"}> 
        {vista === "home" && <Home alCambiarVista={navegarA} cantidadPendientes={ordenesPendientes.length} />}
        {vista === "tomar" && <TomarOrden alCambiarVista={navegarA} alGuardarOrden={alGuardarOrden} />}
        {vista === "pendientes" && <Pendientes ordenes={ordenesPendientes} alFinalizarPago={pasarACaja} />}
        {vista === "caja" && (
  <Caja 
    alCambiarVista={navegarA} 
    ventas={historialVentas.filter(v => v.pagado === false)} 
    alCobrar={finalizarVenta}
    alCobrarParcial={realizarPagoParcial}
    alAgregarExtra={agregarExtraAFirebase} // <-- ESTA LÍNEA ES LA CLAVE
  />
)}
        {vista === "solventes" && <Solventes ventasFinalizadas={historialVentas.filter(v => v.pagado === true )} />}
        {vista === "dashboard" && <Dashboard alCambiarVista={navegarA} ventas={historialVentas} gastosFijos={GASTOS_FIJOS_DIARIOS} alCerrarCaja={cerrarCajaFirebase} />}
        {vista === "corte" && <CorteCaja alCambiarVista={navegarA} ventas={historialVentas} />}
      </div>
    </div>
  );
}

export default App;
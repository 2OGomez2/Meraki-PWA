import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; 
import { 
  collection, addDoc, onSnapshot, updateDoc, 
  doc, deleteDoc, query, orderBy 
} from "firebase/firestore";
import Swal from 'sweetalert2';

import { LayoutGrid, Clock, Wallet, CheckCircle, Calculator, TrendingUp, ShieldAlert } from 'lucide-react';

import TomarOrden from './views/TomarOrden';
import Pendientes from './views/Pendientes';
import Caja from './views/Caja'; 
import CorteCaja from './views/CorteCaja';
import Administracion from './views/Administracion';
import GastosEncargada from './views/GastosEncargada';
import Solventes from './views/Solventes';
import GestionMenu from './views/GestionMenu';

function App() {
  
  const [vista, setVista] = useState("tomar");
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  const [historialVentas, setHistorialVentas] = useState([]);
  
  // 1. PASO NUEVO: Creamos el estado para almacenar los productos del menú de Firebase
  const [productosMenu, setProductosMenu] = useState([]);

  // Función reutilizable para obtener la fecha local exacta YYYY-MM-DD sin desfases
  const obtenerFechaLocalStr = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

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

    // 2. PASO NUEVO: Escuchamos la colección "menu" en tiempo real desde Firestore
    // Ordenamos por nombre para que te aparezcan alfabéticamente en la toma de orden
    const qM = query(collection(db, "menu"), orderBy("nombre", "asc"));
    const unsubM = onSnapshot(qM, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), idFB: d.id }));
      setProductosMenu(data);
    });

    // Agregamos unsubM a la limpieza del useEffect
    return () => { unsubP(); unsubH(); unsubM(); };
  }, []);

  const navegarA = (nuevaVista) => setVista(nuevaVista);
      
  const alGuardarOrden = async (cliente, carrito) => {
    try {
      if (carrito.length === 0) return;
      const totalCalculado = carrito.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
      
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
      console.error("ERROR REAL:", error);
      Swal.fire("Error", `Detalle: ${error.message}`, "error");
    }
  };

  // MODIFICACIÓN 1: Al pasar a caja se le estampa la fecha de creación de la cuenta
  const pasarACaja = async (orden) => {
    try {
      await addDoc(collection(db, "historial"), {
        ...orden,
        idOrden: orden.id,
        fecha: obtenerFechaLocalStr(), // <-- AGREGADO: "2026-06-12"
        pagado: false,
        totalAcumulado: orden.total,
        conteoCobros: 0,
        pagos: [{ monto: 0, items: orden.items }]
      });
      await deleteDoc(doc(db, "pendientes", orden.idFB));
    } catch (error) { console.error(error); }
  };

  // MODIFICACIÓN 2: Al liquidar, aseguramos que mantenga o actualice la fecha string del cobro definitivo
  const finalizarVenta = async (ventaIdFB) => {
    try {
      const ventaActual = historialVentas.find(v => v.idFB === ventaIdFB);
      const totalReal = ventaActual.pagos[0].items.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);
      const ventaRef = doc(db, "historial", ventaIdFB);
      
      await updateDoc(ventaRef, {
        pagado: true,
        fecha: ventaActual.fecha || obtenerFechaLocalStr(), // Asegura que tenga el string de fecha
        totalAcumulado: totalReal,
        horaFinalizacion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      Swal.fire({ icon: 'success', title: 'Venta Finalizada', timer: 1500, showConfirmButton: false });
    } catch (error) { console.error(error); }
  };

  // MODIFICACIÓN 3: Al dividir cuentas, el ticket hijo (Abono) se guarda con su fecha string nativa
  const realizarPagoParcial = async (ventaIdFB, itemsAPagar) => {
    try {
      const ventaActual = historialVentas.find(v => v.idFB === ventaIdFB);
      if (!ventaActual) return;

      const ventaRef = doc(db, "historial", ventaIdFB);
      const montoRealAbono = itemsAPagar.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);
      const fechaHoy = obtenerFechaLocalStr(); // <-- Obtenemos la fecha limpia

      await addDoc(collection(db, "historial"), {
        id: Date.now(),
        cliente: `${ventaActual.cliente} (ABONO)`,
        fecha: fechaHoy, // <-- AGREGADO para el desglose del abono individual
        items: itemsAPagar, 
        totalAcumulado: montoRealAbono, 
        pagado: true, 
        horaFinalizacion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        esPagoParcial: true,
        idPadre: ventaIdFB
      });

      const itemsRestantes = ventaActual.pagos[0].items.filter(item => 
        !itemsAPagar.some(p => p.nombre === item.nombre)
      );
      const esUltimo = itemsRestantes.length === 0;
      const nuevoTotalRestante = itemsRestantes.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);

      await updateDoc(ventaRef, {
        "pagos.0.items": itemsRestantes,
        totalAcumulado: nuevoTotalRestante,
        pagado: esUltimo,
        fecha: ventaActual.fecha || fechaHoy, // Mantiene la fecha de la cuenta padre
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

  const NavBarSuperior = () => (
    <div className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="flex overflow-x-auto no-scrollbar items-center p-2 gap-2">
        <NavButton icon={<LayoutGrid size={18}/>} label="Menú" activa={vista === "tomar"} onClick={() => navegarA("tomar")} />
        <NavButton icon={<Clock size={18}/>} label="Cocina" activa={vista === "pendientes"} onClick={() => navegarA("pendientes")} />
        <NavButton icon={<Wallet size={18}/>} label="Caja" activa={vista === "caja"} onClick={() => navegarA("caja")} />
        <NavButton icon={<CheckCircle size={18}/>} label="Tickets" activa={vista === "solventes"} onClick={() => navegarA("solventes")} />
        <NavButton icon={<TrendingUp size={18}/>} label="Gastos" activa={vista === "gastos"} onClick={() => navegarA("gastos")} />
        <NavButton icon={<Calculator size={18}/>} label="Corte" activa={vista === "corte"} onClick={() => navegarA("corte")} />
        <NavButton icon={<ShieldAlert size={18}/>} label="Admin" activa={vista === "admin"} onClick={() => navegarA("admin")} />
      </div>
    </div>
  );

  const NavButton = ({ icon, label, activa, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center min-w-[80px] p-2 rounded-xl transition-all ${activa ? 'bg-[#f4244c] text-white' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {vista !== "admin" && <NavBarSuperior />}
      <div className={vista === "admin" ? "" : "p-4 pb-24"}> 
      
        {/* 3. PASO NUEVO: Le inyectamos los "productosMenu" del estado como una prop a TomarOrden */}
        {vista === "tomar" && (
          <TomarOrden 
            alCambiarVista={navegarA} 
            alGuardarOrden={alGuardarOrden} 
            productosMenu={productosMenu} 
          />
        )}

        {vista === "pendientes" && <Pendientes ordenes={ordenesPendientes} alFinalizarPago={pasarACaja} />}
        {vista === "caja" && (
          <Caja 
            alCambiarVista={navegarA} 
            ventas={historialVentas.filter(v => v.pagado === false)} 
            alCobrar={finalizarVenta}
            alCobrarParcial={realizarPagoParcial}
            alAgregarExtra={agregarExtraAFirebase}
          />
        )}
        {vista === "solventes" && <Solventes ventasFinalizadas={historialVentas.filter(v => v.pagado === true )} />}
        {vista === "gastos" && <GastosEncargada />}
        {vista === "corte" && <CorteCaja alCambiarVista={navegarA} ventas={historialVentas} />}
        {vista === "admin" && <Administracion alCambiarVista={navegarA} />}
      </div>
    </div>
  );
}

export default App;
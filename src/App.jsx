import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; 
import { 
  collection, addDoc, onSnapshot, updateDoc, 
  doc, deleteDoc, query, orderBy 
} from "firebase/firestore";
import Swal from 'sweetalert2';

import Home from './views/Home';
import TomarOrden from './views/TomarOrden';
import Pendientes from './views/Pendientes';
import Historial from './views/Historial';
import CorteCaja from './views/CorteCaja';
import Dashboard from './views/Dashboard';

function App() {
  const [vista, setVista] = useState("home");
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  const [historialVentas, setHistorialVentas] = useState([]);

  // --- 1. SISTEMA DE NAVEGACIÓN PARA MÓVIL ---
  const navegarA = (nuevaVista) => {
    window.history.pushState({ vista: nuevaVista }, "");
    setVista(nuevaVista);
  };

  useEffect(() => {
    const manejarBotonAtras = (event) => {
      if (vista !== "home") {
        event.preventDefault();
        setVista("home");
      }
    };

    window.addEventListener("popstate", manejarBotonAtras);
    return () => window.removeEventListener("popstate", manejarBotonAtras);
  }, [vista]);

  // --- 2. ESCUCHA DE DATOS (FIREBASE) ---
  useEffect(() => {
    const qP = query(collection(db, "pendientes"), orderBy("id", "desc"));
    const unsubP = onSnapshot(qP, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), idFB: d.id }));
      setOrdenesPendientes(data);
    });

    const qH = query(collection(db, "historial"), orderBy("idOrden", "desc"));
    const unsubH = onSnapshot(qH, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), idFB: d.id }));
      setHistorialVentas(data);
    });

    return () => { unsubP(); unsubH(); };
  }, []);

  // --- 3. LÓGICA DE NEGOCIO ---
 const guardarOrdenPendiente = async (cliente, carrito) => {
    try {
      await addDoc(collection(db, "pendientes"), {
        id: Date.now(),
        cliente,
        items: [...carrito],
        total: carrito.reduce((s, i) => s + (i.precioUnitario * i.cantidad), 0),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // --- CAMBIO AQUÍ ---
      Swal.fire({
        title: '¡Orden Lista!',
        text: `Pedido de ${cliente} guardado con éxito`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        borderRadius: '20px'
      });
      
      setVista("home");
    } catch (e) { 
      Swal.fire('Error', 'No se pudo guardar la orden', 'error');
    }
  };

  const finalizarPagoConsolidado = async (ordenOrg, itemsAPagar, esParcial) => {
    const totalPago = itemsAPagar.reduce((s, i) => s + (i.precioUnitario * i.cantidad), 0);
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nuevoPago = { id: Math.random().toString(36).substr(2, 5), hora, items: [...itemsAPagar], monto: totalPago };

    try {
      const ventaEx = historialVentas.find(v => v.idOrden === ordenOrg.id);
      if (ventaEx) {
        await updateDoc(doc(db, "historial", ventaEx.idFB), {
          pagos: [...ventaEx.pagos, nuevoPago],
          totalAcumulado: ventaEx.totalAcumulado + totalPago
        });
      } else {
        await addDoc(collection(db, "historial"), {
          idOrden: ordenOrg.id,
          cliente: ordenOrg.cliente,
          horaInicio: ordenOrg.hora || "Venta Rápida",
          pagos: [nuevoPago],
          totalAcumulado: totalPago
        });
      }

      if (esParcial) {
        const nItems = ordenOrg.items.map(it => {
          const p = itemsAPagar.find(ip => ip.id === it.id);
          return p ? { ...it, cantidad: it.cantidad - p.cantidad } : it;
        }).filter(i => i.cantidad > 0);
        await updateDoc(doc(db, "pendientes", ordenOrg.idFB), {
          items: nItems,
          total: nItems.reduce((s, i) => s + (i.precioUnitario * i.cantidad), 0)
        });
      } else if (ordenOrg.idFB) {
        await deleteDoc(doc(db, "pendientes", ordenOrg.idFB));
      }
      setVista("home");
    } catch (e) { alert("Error al procesar el pago."); }
  };

 const resetearCaja = () => {
    Swal.fire({
      title: '¿Cerrar Turno?',
      text: "El administrador podrá ver los datos en el Dashboard.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a', // Slate-900
      cancelButtonColor: '#94a3b8', // Slate-400
      confirmButtonText: 'SÍ, CERRAR TURNO',
      cancelButtonText: 'CANCELAR',
      borderRadius: '25px'
    }).then((result) => {
      if (result.isConfirmed) {
        setVista("home");
        Swal.fire({
          title: 'Corte Realizado',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });
      }
    });
  };

  // --- 4. RENDERIZADO ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {vista === "home" && (
        <Home alCambiarVista={navegarA} cantidadPendientes={ordenesPendientes.length} />
      )}
      {vista === "tomar" && (
        <TomarOrden alCambiarVista={navegarA} alGuardarOrden={guardarOrdenPendiente} alCobrarTodo={(c, items) => finalizarPagoConsolidado({id: Date.now(), cliente: c}, items, false)} />
      )}
      {vista === "pendientes" && (
        <Pendientes alCambiarVista={navegarA} ordenes={ordenesPendientes} alFinalizarPago={finalizarPagoConsolidado} />
      )}
      {vista === "historial" && (
        <Historial alCambiarVista={navegarA} ventas={historialVentas} />
      )}
      {vista === "corte" && (
        <CorteCaja alCambiarVista={navegarA} ventas={historialVentas} alResetearCaja={resetearCaja} />
      )}
      {vista === "dashboard" && (
        <Dashboard alCambiarVista={navegarA} ventas={historialVentas} />
      )}
    </div>
  );
}

export default App;
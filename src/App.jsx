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
  const [productosMenu, setProductosMenu] = useState([]);

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

    const qM = query(collection(db, "menu"), orderBy("nombre", "asc"));
    const unsubM = onSnapshot(qM, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), idFB: d.id }));
      setProductosMenu(data);
    });

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

  const pasarACaja = async (orden) => {
    try {
      await addDoc(collection(db, "historial"), {
        ...orden,
        idOrden: orden.id,
        fecha: obtenerFechaLocalStr(), 
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
        fecha: ventaActual.fecha || obtenerFechaLocalStr(), 
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
      const fechaHoy = obtenerFechaLocalStr();

      await addDoc(collection(db, "historial"), {
        id: Date.now(),
        cliente: `${ventaActual.cliente} (ABONO)`,
        fecha: fechaHoy, 
        items: itemsAPagar, 
        totalAcumulado: montoRealAbono, 
        pagado: true, 
        horaFinalizacion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        esPagoParcial: true,
        idPadre: ventaIdFB
      });

      const itemsPadreDesglosados = [];
      const itemsOriginalesRaw = ventaActual.pagos?.[0]?.items || [];
      
      itemsOriginalesRaw.forEach((item) => {
        const cantidadCiclo = item.cantidad || 1;
        for (let i = 0; i < cantidadCiclo; i++) {
          itemsPadreDesglosados.push({
            ...item,
            text: item.nombre,
            cantidad: 1
          });
        }
      });

      let pendientesActualizados = [...itemsPadreDesglosados];
      itemsAPagar.forEach((cobrado) => {
        const indexARemover = pendientesActualizados.findIndex(p => p.nombre === cobrado.nombre);
        if (indexARemover !== -1) {
          pendientesActualizados.splice(indexARemover, 1);
        }
      });

      const itemsAgrupadosFinal = [];
      pendientesActualizados.forEach((item) => {
        const existente = itemsAgrupadosFinal.find(x => x.nombre === item.nombre);
        
        if (existente) {
          existente.cantidad += 1;
        } else {
          itemsAgrupadosFinal.push({ 
            ...item, 
            shadowId: Date.now(),
            cantidad: 1 
          });
        }
      });

      const esUltimo = itemsAgrupadosFinal.length === 0;
      const nuevoTotalRestante = itemsAgrupadosFinal.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0);

      await updateDoc(ventaRef, {
        "pagos.0.items": itemsAgrupadosFinal,
        totalAcumulado: nuevoTotalRestante,
        pagado: esUltimo,
        fecha: ventaActual.fecha || fechaHoy, 
        conteoCobros: (ventaActual.conteoCobros || 0) + 1,
        horaFinalizacion: esUltimo ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
      });

      Swal.fire("¡Cobro Realizado!", `Ticket de $${montoRealAbono.toFixed(2)}`, "success");
    } catch (error) { 
      console.error("Error en cobro parcial:", error); 
      Swal.fire("Error", "No se pudo procesar el cobro parcial", "error");
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

  // --- NAVBAR SUPERIOR CON CONTADORES CORREGIDO ---
  // --- NAVBAR SUPERIOR CON CONTADORES CORREGIDO ---
  const NavBarSuperior = () => {
    const fechaHoy = obtenerFechaLocalStr();
    const cuentasEnCaja = historialVentas.filter(v => v.pagado === false).length;
    
    // Filtramos las ventas pagadas de hoy
    const ticketsDeHoyRaw = historialVentas.filter(v => v.pagado === true && v.fecha === fechaHoy);

    // Agrupamos en un objeto hash por el nombre base del cliente para remover duplicados por cobros/abonos extra
    const hashCuentasMadres = {};
    ticketsDeHoyRaw.forEach(t => {
      // Si el cliente tiene el sufijo " (ABONO)", se lo removemos para que unifique con el nombre de la cuenta madre original
      const nombreLimpio = t.cliente ? t.cliente.replace(/\s*\(ABONO\)\s*/i, "").trim().toUpperCase() : t.idFB;
      hashCuentasMadres[nombreLimpio] = true;
    });

    // Obtenemos la cantidad exacta de cuentas madres reales
    const cantidadCuentasMadresReales = Object.keys(hashCuentasMadres).length;

    return (
      <div className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="flex overflow-x-auto no-scrollbar items-center p-2 gap-2">
          <NavButton icon={<LayoutGrid size={18}/>} label="Menú" activa={vista === "tomar"} onClick={() => navegarA("tomar")} />
          
          <NavButton 
            icon={<Clock size={18}/>} 
            label="Cocina" 
            activa={vista === "pendientes"} 
            onClick={() => navegarA("pendientes")} 
            badgeCount={ordenesPendientes.length} 
          />
          
          <NavButton 
            icon={<Wallet size={18}/>} 
            label="Caja" 
            activa={vista === "caja"} 
            onClick={() => navegarA("caja")} 
            badgeCount={cuentasEnCaja} 
          />
          
          <NavButton 
            icon={<CheckCircle size={18}/>} 
            label="Tickets" 
            activa={vista === "solventes"} 
            onClick={() => navegarA("solventes")} 
            badgeCount={cantidadCuentasMadresReales} 
          />
          
          <NavButton icon={<TrendingUp size={18}/>} label="Gastos" activa={vista === "gastos"} onClick={() => navegarA("gastos")} />
          <NavButton icon={<Calculator size={18}/>} label="Corte" activa={vista === "corte"} onClick={() => navegarA("corte")} />
          <NavButton icon={<ShieldAlert size={18}/>} label="Admin" activa={vista === "admin"} onClick={() => navegarA("admin")} />
        </div>
      </div>
    );
  };

  const NavButton = ({ icon, label, activa, onClick, badgeCount = 0 }) => (
    <button 
      onClick={onClick} 
      className={`relative flex flex-col items-center min-w-[80px] p-2 rounded-xl transition-all ${activa ? 'bg-[#f4244c] text-white' : 'text-slate-400'}`}
    >
      {icon}
      <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">{label}</span>
      
      {badgeCount > 0 && (
        <span className="absolute top-1 right-2 bg-[#f4244c] text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-slate-900 shadow-md animate-pulse">
          {badgeCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <NavBarSuperior />
      
      <div className="p-4 pb-36"> 
      
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

        {vista === "solventes" && (
          <Solventes 
            ventasFinalizadas={historialVentas.filter(v => v.pagado === true && v.fecha === obtenerFechaLocalStr())} 
          />
        )}
        
        {vista === "gastos" && <GastosEncargada />}
        {vista === "corte" && <CorteCaja alCambiarVista={navegarA} ventas={historialVentas} />}
        {vista === "admin" && <Administracion alCambiarVista={navegarA} />}
      </div>
    </div>
  );
}

export default App;
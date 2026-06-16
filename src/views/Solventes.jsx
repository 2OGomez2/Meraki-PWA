import React from 'react';
import { CheckCircle, Receipt, MessageSquare, Eye, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Solventes({ ventasFinalizadas }) {
  
  // 1. FILTRO INTERNO: Para las tarjetas principales de la lista, solo queremos las cuentas padre
  const cuentasPrincipales = ventasFinalizadas.filter(v => !v.idPadre);

  if (!cuentasPrincipales || cuentasPrincipales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <CheckCircle size={64} className="mb-4 opacity-10" />
        <p className="font-black uppercase tracking-widest text-xs italic text-center">No hay cobros realizados aún</p>
      </div>
    );
  }

  const verDesgloseCompleto = (ticketPrincipal) => {
    // 2. Aquí buscamos en TODO el universo de ventasFinalizadas (que ahora sí incluye los abonos)
    const todosLosCobros = ventasFinalizadas.filter(v => 
      v.idFB === ticketPrincipal.idFB || 
      v.idPadre === ticketPrincipal.idFB ||
      v.idPadre === ticketPrincipal.idOrden
    );

    // Ordenamos cronológicamente por id
    todosLosCobros.sort((a, b) => a.id - b.id);

    const cantidadCobros = todosLosCobros.length;
    
    // Calculamos el Gran Total real sumando lo que costó cada cobro individualizado
    const granTotalCuenta = todosLosCobros.reduce((acc, c) => {
      const items = c.pagos?.[0]?.items || c.items || [];
      const totalTransaccion = items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
      return acc + totalTransaccion;
    }, 0);

    // 3. Renderizado del SweetAlert dinámico
    Swal.fire({
      title: `CUENTA: ${ticketPrincipal.cliente}`,
      html: `
        <div style="text-align: left; font-family: sans-serif; max-height: 420px; overflow-y: auto; padding-right: 5px;">
          
          <p style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em;">
            Se registraron ${cantidadCobros} transacciones para esta mesa:
          </p>

          ${todosLosCobros.map((cobro, index) => {
            const productosCobro = cobro.pagos?.[0]?.items || cobro.items || [];
            const subtotalCobro = productosCobro.reduce((sum, i) => sum + (i.precioUnitario * i.cantidad), 0);
            
            // Extraer la fecha del cobro (prioriza campos comunes)
            const fechaDocumento = cobro.fechaCancelado || cobro.fecha || '---';

            return `
              <div style="margin-bottom: 12px; padding: 14px; border: 2px solid ${cobro.esPagoParcial ? '#e2e8f0' : '#bbf7d0'}; background: ${cobro.esPagoParcial ? '#f8fafc' : '#f0fdf4'}; border-radius: 1.25rem;">
                
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 900; color: #475569; margin-bottom: 8px; text-transform: uppercase;">
                  <span>${cobro.esPagoParcial ? `Cobro Parcial #${index + 1}` : 'Liquidación Final'}</span>
                  <span style="color: #2563eb; background-color: rgba(37, 99, 235, 0.08); padding: 2px 6px; border-radius: 6px;">
                    📅 ${fechaDocumento} &nbsp; 🕒 ${cobro.horaFinalizacion || cobro.hora || '--:--'}
                  </span>
                </div>

                <div style="margin-bottom: 6px;">
                  ${productosCobro.map(item => `
                    <div style="margin-bottom: 4px;">
                      <div style="display: flex; justify-content: space-between; font-size: 13px; color: #1e293b;">
                        <span><strong style="color: #2563eb;">${item.cantidad}x</strong> ${item.nombre}</span>
                        <span style="font-weight: 800; color: #0f172a;">$${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                      </div>
                      
                      <div style="margin-left: 20px; font-size: 10px; display: flex; flex-direction: column; gap: 2px; margin-top: 1px;">
                        ${item.aderezos && item.aderezos.length > 0 ? `<span style="color: #d97706; font-weight: bold; text-transform: uppercase;">Aderezos: ${item.aderezos.join(', ')}</span>` : ''}
                        ${item.nota ? `<span style="color: #3b82f6; font-style: italic;">📝 ${item.nota}</span>` : ''}
                        ${item.modificadores && item.modificadores.length > 0 ? `<span style="color: #94a3b8; font-style: italic;">+ ${item.modificadores.join(', ')}</span>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <div style="text-align: right; font-weight: 900; font-size: 13px; margin-top: 8px; border-top: 1px dashed #cbd5e1; padding-top: 6px; color: #0f172a;">
                  Monto Pagado: $${subtotalCobro.toFixed(2)}
                </div>
              </div>
            `;
          }).join('')}

          <div style="margin-top: 16px; padding: 16px; background: #0f172a; color: white; border-radius: 1.25rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <div>
              <span style="font-weight: 900; font-size: 10px; tracking-widest: 0.1em; display: block; color: #94a3b8; text-transform: uppercase;">TOTAL GENERAL</span>
              <span style="font-size: 11px; color: #38bdf8; font-weight: bold;">(${cantidadCobros} Cobros Totales)</span>
            </div>
            <span style="font-size: 24px; font-weight: 900; color: #4ade80;">$${granTotalCuenta.toFixed(2)}</span>
          </div>

        </div>
      `,
      confirmButtonText: 'CERRAR DETALLES',
      confirmButtonColor: '#1e293b',
      customClass: {
        popup: 'rounded-[2rem]'
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase">Ventas Pagadas</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historial Unificado</p>
        </div>
        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black">
          {cuentasPrincipales.length} CUENTAS
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {cuentasPrincipales.map((venta) => {
          // MODIFICACIÓN DE CÁLCULO: Escaneamos todo el historial para sumar los cobros asociados a este padre
          const todosMisCobros = ventasFinalizadas.filter(v => 
            v.idFB === venta.idFB || v.idPadre === venta.idFB || v.idPadre === venta.idOrden
          );

          // Sumamos los subtotales de cada ticket individual para obtener el total general acumulado
          const totalGeneralHistorico = todosMisCobros.reduce((acc, cobro) => {
            const items = cobro.pagos?.[0]?.items || cobro.items || [];
            return acc + items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
          }, 0);

          const nCobros = todosMisCobros.length;
          
          // Extraer fecha para la fila principal
          const fechaPrincipal = venta.fechaCancelado || venta.fecha || '---';

          return (
            <div 
              key={venta.idFB}
              onClick={() => verDesgloseCompleto(venta)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2.5 rounded-xl text-green-600">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">{venta.cliente}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-bold mt-0.5">
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black text-[9px]">
                      📅 {fechaPrincipal}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={10}/> {venta.horaFinalizacion || "Finalizado"}
                    </span>
                    {nCobros > 1 && (
                      <span className="text-blue-600 bg-blue-50 px-1 rounded font-black text-[9px]">
                        {nCobros} PAGOS
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider">Ver Desglose</span>
                  {/* AQUÍ SE RENDERIZA EL TOTAL HISTÓRICO COMPLETO */}
                  <span className="font-black text-slate-900 text-base">
                    ${totalGeneralHistorico.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                  <Eye size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
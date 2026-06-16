import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Save, X, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

// CORREGIDO: Modificado a "Papas,Dedos de queso y Rollitos" (Estrictamente sin espacio)
const CATEGORIAS_MADRES = [
  "Bebidas",
  "Hamburguesas y Sandwich",
  "Papas,Dedos de queso y Rollitos",
  "Alitas"
];

export default function GestionMenu({ productos = [] }) {
  const [nombreInput, setNombreInput] = useState('');
  const [precioInput, setPrecioInput] = useState('');
  const [categoriaMadre, setCategoriaMadre] = useState('Bebidas');
  const [aderezosGratisInput, setAderezosGratisInput] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  // --- 1. GUARDAR O ACTUALIZAR EN FIREBASE ---
  const guardarProducto = async (e) => {
    e.preventDefault();
    if (!nombreInput.trim() || !precioInput) {
      return Swal.fire('Error', 'Por favor llena todos los campos.', 'error');
    }

    const precioNum = parseFloat(precioInput);
    if (isNaN(precioNum) || precioNum <= 0) {
      return Swal.fire('Error', 'Ingresa un precio válido.', 'error');
    }

    // Si es Alitas, procesamos la cantidad, de lo contrario se guarda en 0
    const esAlitasCat = categoriaMadre === "Alitas";
    const aderezosGratisNum = esAlitasCat ? parseInt(aderezosGratisInput) || 0 : 0;

    try {
      if (editandoId) {
        const productoRef = doc(db, 'menu', editandoId);
        await updateDoc(productoRef, {
          nombre: nombreInput.trim().toUpperCase(),
          precioUnitario: precioNum,
          categoriaMadre: categoriaMadre,
          aderezosGratis: aderezosGratisNum
        });
        setEditandoId(null);
        Swal.fire({ icon: 'success', title: '¡Producto Actualizado!', timer: 1500, showConfirmButton: false });
      } else {
        await addDoc(collection(db, 'menu'), {
          nombre: nombreInput.trim().toUpperCase(),
          precioUnitario: precioNum,
          categoriaMadre: categoriaMadre,
          aderezosGratis: aderezosGratisNum
        });
        Swal.fire({ icon: 'success', title: '¡Producto Añadido!', timer: 1500, showConfirmButton: false });
      }

      setNombreInput('');
      setPrecioInput('');
      setAderezosGratisInput('');
    } catch (error) {
      console.error("Error al procesar producto:", error);
      Swal.fire('Error', 'No se pudo guardar en la base de datos.', 'error');
    }
  };

  // --- 2. PREPARAR EDICIÓN ---
  const seleccionarParaEditar = (prod) => {
    setEditandoId(prod.id);
    setNombreInput(prod.nombre || '');
    setPrecioInput(prod.precioUnitario ? prod.precioUnitario.toString() : '');
    setCategoriaMadre(prod.categoriaMadre || 'Bebidas');
    setAderezosGratisInput(prod.aderezosGratis !== undefined ? prod.aderezosGratis.toString() : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 3. CANCELAR EDICIÓN ---
  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreInput('');
    setPrecioInput('');
    setCategoriaMadre('Bebidas');
    setAderezosGratisInput('');
  };

  // --- 4. ELIMINAR PRODUCTO ---
  const eliminarProducto = (id, nombreProd) => {
    Swal.fire({
      title: '¿Está seguro de querer eliminar?',
      text: `Vas a borrar permanentemente: "${nombreProd}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f4244c',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'SÍ, BORRAR',
      cancelButtonText: 'CANCELAR',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, 'menu', id));
          Swal.fire('¡Eliminado!', `"${nombreProd}" ha sido removido del catálogo.`, 'success');
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
        }
      }
    });
  };

  // --- 5. FILTRADO SEGURO ---
  const textBusqueda = busqueda.toLowerCase();
  const productosFiltrados = productos.filter(p => {
    const nombre = (p.nombre || '').toLowerCase();
    const categoria = (p.categoriaMadre || 'Sin Categoría').toLowerCase();
    return nombre.includes(textBusqueda) || categoria.includes(textBusqueda);
  });

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-6 font-sans">
      
      {/* 📋 FORMULARIO DE GESTIÓN */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4">
          {editandoId ? '⚡ Modificando Producto' : '📋 Gestión de Catálogo de Productos'}
        </h2>
        
        <form onSubmit={guardarProducto} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1">Nombre del Producto</label>
              <input 
                type="text" 
                value={nombreInput}
                onChange={e => setNombreInput(e.target.value)}
                placeholder="EJ. HAMBURGUESA DOBLE CARNE" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-[#f4244c] transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1">Precio Unitario ($)</label>
              <input 
                type="number" 
                step="any"
                value={precioInput}
                onChange={e => setPrecioInput(e.target.value)}
                placeholder="0.00" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-[#f4244c] transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1">Categoría Madre</label>
              <select 
                value={categoriaMadre}
                onChange={e => setCategoriaMadre(e.target.value)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#f4244c] transition-all"
              >
                {CATEGORIAS_MADRES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CAMPO DINÁMICO EXCLUSIVO PARA ALITAS */}
          {categoriaMadre === "Alitas" && (
            <div className="flex flex-col max-w-sm animation-fade-in">
              <label className="text-[10px] font-black uppercase text-[#f4244c] mb-1">
                ¿Cuántos aderezos incluye gratis este producto?
              </label>
              <input 
                type="number" 
                min="0"
                value={aderezosGratisInput}
                onChange={e => setAderezosGratisInput(e.target.value)}
                placeholder="Ej. 1 para el de 6, 2 para el de 12" 
                className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl text-xs font-bold outline-none focus:border-[#f4244c] transition-all"
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            {editandoId && (
              <button 
                type="button" 
                onClick={cancelarEdicion}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
              >
                <X size={14} /> Cancelar
              </button>
            )}
            <button 
              type="submit" 
              className="flex items-center gap-1.5 bg-[#f4244c] hover:bg-[#d61b3f] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md"
            >
              {editandoId ? <Save size={14} /> : <Plus size={14} />}
              {editandoId ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>
          </div>
        </form>
      </div>

      {/* 🔍 BUSCADOR Y TABLA DE PRODUCTOS */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">Vista general del catálogo activo</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productos registrados: ({productosFiltrados.length})</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o categoría..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#f4244c] w-full sm:w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                <th className="p-3">Categoría</th>
                <th className="p-3">Producto</th>
                <th className="p-3 text-right">Precio Unitario</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-100">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400 italic bg-slate-50/50">
                    No se encontraron productos en esta categoría o catálogo.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-all">
                    <td className="p-3 text-slate-400 uppercase text-[10px] tracking-wide">
                      {p.categoriaMadre || 'Sin Categoría'}
                      {p.categoriaMadre === "Alitas" && p.aderezosGratis > 0 && (
                        <span className="block text-[8px] text-emerald-600 font-black mt-0.5 uppercase tracking-tighter">
                          ({p.aderezosGratis} Gratis)
                        </span>
                      )}
                    </td>
                    <td className="p-3 uppercase text-slate-800 font-black tracking-tight">{p.nombre}</td>
                    <td className="p-3 text-right text-[#f4244c] font-black">${parseFloat(p.precioUnitario || 0).toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => seleccionarParaEditar(p)} 
                          className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => eliminarProducto(p.id, p.nombre)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
import React from 'react';
import { CheckCircle2, Save, FileText, FileCode } from 'lucide-react';

export default function ModalCierre({ alCerrar, alExportar }) {
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95">
        <div className="text-center mb-8">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Finalizar Turno</h2>
        </div>

        <div className="space-y-3 mb-8">
          <button onClick={() => alExportar('guardar')} className="w-full flex items-center gap-4 p-5 bg-slate-900 text-white rounded-2xl">
            <Save size={24}/><span className="font-black uppercase text-xs">Guardar y Limpiar Caja</span>
          </button>
          <button onClick={() => alExportar('pdf')} className="w-full flex items-center gap-4 p-5 border-2 border-slate-100 rounded-2xl text-slate-700">
            <FileText size={24}/><span className="font-black uppercase text-xs">PDF</span>
          </button>
        </div>

        <button onClick={alCerrar} className="w-full text-slate-400 font-black text-[10px] uppercase">Cancelar</button>
      </div>
    </div>
  );
}
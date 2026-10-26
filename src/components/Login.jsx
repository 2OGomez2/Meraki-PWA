import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import Swal from "sweetalert2";

export const Login = ({ alIniciarSesion }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      if (alIniciarSesion) {
        await alIniciarSesion(email, password);
      } else {
        // Autenticación directa con Firebase Authentication
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      let mensajeError = "Correo o contraseña incorrectos.";

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        mensajeError = "Las credenciales ingresadas son incorrectas.";
      } else if (error.code === "auth/too-many-requests") {
        mensajeError = "Demasiados intentos fallidos. Intenta más tarde.";
      }

      Swal.fire({
        title: "Error de acceso",
        text: mensajeError,
        icon: "error",
        confirmButtonColor: "#FF4081",
        customClass: { popup: "rounded-[2rem]" },
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-orange-100">
        <h2 className="text-2xl font-black text-center mb-1 text-gray-800 uppercase tracking-wide">
          MERAKI
        </h2>
        <p className="text-xs text-center text-gray-500 mb-6 uppercase tracking-wider font-bold">
          Ingresa tus credenciales para acceder
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="ejemplo@meraki.com"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FF4081]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FF4081]"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF4081] transition-colors"
              >
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 bg-[#FF4081] hover:bg-[#e0356f] text-white font-bold rounded-xl shadow-md transition-all uppercase tracking-wider text-sm mt-2 disabled:opacity-50 cursor-pointer"
          >
            {cargando ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

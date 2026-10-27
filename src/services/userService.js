import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, firebaseConfig } from "../firebaseConfig";

export const registrarUsuario = async (
  email,
  password,
  nombre,
  role = "employee",
) => {
  let secondaryApp = null;

  try {
    // Crear una instancia secundaria temporal con un nombre único por registro
    const tempAppName = `SecondaryApp_${Date.now()}`;
    secondaryApp = initializeApp(firebaseConfig, tempAppName);
    const secondaryAuth = getAuth(secondaryApp);

    // 1. Crear credencial en Firebase Auth con email y password limpios
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.trim(),
      password,
    );
    const uid = userCredential.user.uid;

    // 2. Guardar el perfil y rol en Firestore usando el UID del usuario recién creado
    await setDoc(doc(db, "users", uid), {
      uid,
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      role: role,
      createdAt: new Date().toISOString(),
    });

    // 3. Cerrar la sesión del nuevo usuario en la app secundaria
    await signOut(secondaryAuth);

    return { success: true, uid };
  } catch (error) {
    console.error("Error exacto en registrarUsuario:", error);

    let mensaje = "No se pudo crear el usuario.";
    if (error.code === "auth/email-already-in-use") {
      mensaje = "El correo electrónico ya está registrado.";
    } else if (error.code === "auth/invalid-email") {
      mensaje = "El correo electrónico ingresado no es válido.";
    } else if (error.code === "auth/weak-password") {
      mensaje = "La contraseña debe tener al menos 6 caracteres.";
    } else if (error.message) {
      mensaje = error.message;
    }

    throw new Error(mensaje);
  } finally {
    // 4. Eliminar la app secundaria de la memoria utilizando deleteApp
    if (secondaryApp) {
      try {
        await deleteApp(secondaryApp);
      } catch (e) {
        console.warn("Aviso al limpiar app secundaria:", e);
      }
    }
  }
};
// Actualizar nombre y correo en Firestore
export const actualizarUsuario = async (uid, nombre, email, role) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      role: role,
    });
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw new Error("No se pudo actualizar la información del empleado.");
  }
};

// Eliminar perfil de empleado en Firestore
export const eliminarUsuario = async (uid) => {
  try {
    await deleteDoc(doc(db, "users", uid));
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw new Error("No se pudo eliminar el registro del empleado.");
  }
};

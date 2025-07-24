"use client";

import Link from 'next/link';
import { useState } from 'react';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const authResponse = await fetch('http://localhost:5170/api/Usuarios/autenticar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        if (authData.autenticado) {
          const userResponse = await fetch(`http://localhost:5170/api/Usuarios?CorreoElectronico=${email}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData && userData.length > 0) {
              const user = { ...userData[0], contrasenaActualizada: authData.contrasenaActualizada };
              Cookies.set('userId', user.idUsuario, { expires: 7 }); // Expira en 7 días
              Cookies.set('userRoleId', user.idRol, { expires: 7 }); // Expira en 7 días

              if (!authData.contrasenaActualizada) {
                router.push('/update-password'); // Redirigir a la página de actualización de contraseña
                return;
              }

              console.log('Login successful:', user);
              alert('Inicio de sesión exitoso!');
              router.push('/'); // Redirigir a la página principal
            } else {
              alert('Error: No se encontraron datos de usuario para el correo proporcionado.');
            }
          } else {
            const errorData = await userResponse.json();
            console.error('Failed to fetch user data:', errorData);
            alert(`Error al obtener datos del usuario: ${errorData.message || userResponse.statusText}`);
          }
        } else {
          alert('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
        }
      } else {
        const errorData = await authResponse.json();
        console.error('Login failed:', errorData);
        alert(`Error al iniciar sesión: ${errorData.message || authResponse.statusText}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Error de red al intentar iniciar sesión.');
    }
  };

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md px-8 py-8 bg-white shadow-lg rounded-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">UrbanPark</h1>
            <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                  type="email"
                  id="email"
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>

              <Link
                  href="/forgot-password"
                  className="text-sm text-orange-500 hover:text-orange-700 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div>
              <button
                  type="submit"
                  className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
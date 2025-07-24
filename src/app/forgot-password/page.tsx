'use client';

import React from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Por favor, ponte en contacto con el administrador del sistema para restablecer tu contraseña.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Correo electrónico</label>
              <p className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm">
                Correo de contacto: <span className="font-medium">admin@urbanpark.com</span>
              </p>
            </div>
            <div className="pt-4">
              <label htmlFor="phone-number" className="sr-only">Número de teléfono</label>
              <p className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm">
                Teléfono 1: <span className="font-medium">+506 8888-8888</span>
              </p>
            </div>
            <div className="pt-2">
              <label htmlFor="phone-number-2" className="sr-only">Número de teléfono 2</label>
              <p className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm">
                Teléfono 2: <span className="font-medium">+506 7777-7777</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

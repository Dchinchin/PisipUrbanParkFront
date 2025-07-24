'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<number | null>(null);

    useEffect(() => {
        const userId = Cookies.get('userId');
        const roleId = Cookies.get('userRoleId');
        if (userId && roleId) {
            setIsLoggedIn(true);
            setUserRole(parseInt(roleId));
        } else {
            setIsLoggedIn(false);
            setUserRole(null);
        }
    }, []);

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen py-8 px-4 bg-gray-100">
            <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0 md:pr-8">
                <div className="w-full max-w-md md:max-w-none shadow-lg rounded-lg overflow-hidden">
                    <Image
                        src="/Banner-urbanpark.png"
                        alt="UrbanPark Banner"
                        width={600}
                        height={300}
                        className="w-full h-auto rounded-lg"
                    />
                </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start md:pl-8">
                <h1 className="text-3xl md:text-5xl font-extrabold text-center md:text-left text-primary mb-4">
                    {isLoggedIn ? (
                        userRole === 1 ? "Bienvenido Administrador!" : "Bienvenido!"
                    ) : (
                        "Bienvenido a UrbanPark!"
                    )}
                </h1>
                <p className="text-base md:text-xl text-center md:text-left max-w-md md:max-w-none text-gray-700 leading-relaxed">
                    UrbanPark es su solución integral para la gestión y mantenimiento de parqueaderos.
                    Nuestro sistema le permite llevar un control eficiente de los espacios,
                    programar mantenimientos preventivos y correctivos, y generar informes detallados
                    para optimizar la operación de sus instalaciones.
                </p>
                <div className="mt-6">
                    {isLoggedIn ? (
                        <Link
                            href="/logout"
                            className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                        >
                            Cerrar Sesión
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                        >
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
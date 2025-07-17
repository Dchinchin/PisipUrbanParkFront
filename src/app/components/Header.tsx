"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<number | null>(null);
    const pathname = usePathname();

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
    }, [pathname]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-white text-black p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-md">
            <div className="flex items-center">
                <Link href="/">
                    <Image
                        src="/UrbaPark-logo.png"
                        alt="UrbanPark Logo"
                        width={200}
                        height={200}
                        className="w-32 md:w-40"
                    />
                </Link>
            </div>
            <nav className="hidden md:block">
                <ul className="flex  lg:space-x-4 text-sm lg:text-lg text-nowrap">
                    {isLoggedIn && (userRole === 1 || userRole !== 1) && (
                        <li><Link href="/mantenimientos" className="px-2 py-2 hover:bg-gray-200 rounded">Mantenimientos</Link></li>
                    )}
                    {isLoggedIn && userRole === 1 && (
                        <li><Link href="/parqueaderos" className="px-2 py-2 hover:bg-gray-200 rounded">Parqueaderos</Link></li>
                    )}
                    {isLoggedIn && (userRole === 1 || userRole !== 1) && (
                        <li><Link href="/informes" className="px-2 py-2 hover:bg-gray-200 rounded">Informes</Link></li>
                    )}
                    {isLoggedIn && userRole === 1 && (
                        <li><Link href="/personal" className="px-2 py-2 hover:bg-gray-200 rounded">Personal</Link></li>
                    )}
                    {!isLoggedIn ? (
                        <li><Link href="/login" className="bg-orange-500 text-white px-3 py-2 rounded-2xl">Iniciar Sesión</Link></li>
                    ) : (
                        <li><Link href="/logout" className="bg-orange-500 text-white px-3 py-2 rounded-2xl">Cerrar Sesión</Link></li>
                    )}
                </ul>
            </nav>

            {/* Mobile Hamburger Button */}
            <button
                className="md:hidden p-2 focus:outline-none"
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {isMenuOpen && (
                <nav className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg">
                    <ul className="flex flex-col text-base">
                        {isLoggedIn && (userRole === 1 || userRole !== 1) && (
                            <li><Link href="/mantenimientos" className="block px-4 py-3 hover:bg-gray-200 border-b border-gray-100" onClick={toggleMenu}>Mantenimientos</Link></li>
                        )}
                        {isLoggedIn && userRole === 1 && (
                            <li><Link href="/parqueaderos" className="block px-4 py-3 hover:bg-gray-200 border-b border-gray-100" onClick={toggleMenu}>Parqueaderos</Link></li>
                        )}
                        {isLoggedIn && (userRole === 1 || userRole !== 1) && (
                            <li><Link href="/informes" className="block px-4 py-3 hover:bg-gray-200 border-b border-gray-100" onClick={toggleMenu}>Informes</Link></li>
                        )}
                        {isLoggedIn && userRole === 1 && (
                            <li><Link href="/personal" className="block px-4 py-3 hover:bg-gray-200 border-b border-gray-100" onClick={toggleMenu}>Personal</Link></li>
                        )}
                        {!isLoggedIn ? (
                            <li><Link href="/login" className="block px-4 py-3 bg-orange-500 text-white rounded-2xl" onClick={toggleMenu}>Iniciar Sesión</Link></li>
                        ) : (
                            <li><Link href="/logout" className="block px-4 py-3 bg-orange-500 text-white rounded-2xl" onClick={toggleMenu}>Cerrar Sesión</Link></li>
                        )}
                    </ul>
                </nav>
            )}
        </header>
    );
}
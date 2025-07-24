"use client";

import Link from 'next/link';
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-blue-900 text-white p-6 md:p-8 mt-auto">
            <div className="container mx-auto">
                {/* Main Footer Content */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-6 md:mb-8">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Image
                            src="/UrbaPark-logo.png"
                            alt="UrbanPark Logo"
                            width={200}
                            height={100}
                            className="w-40 md:w-48 h-auto"
                        />
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-base md:text-lg">
                        <Link href="#" className="hover:underline transition-colors duration-200">
                            Facebook
                        </Link>
                        <Link href="#" className="hover:underline transition-colors duration-200">
                            Twitter
                        </Link>
                        <Link href="#" className="hover:underline transition-colors duration-200">
                            Instagram
                        </Link>
                        <Link href="/contacto" className="hover:underline transition-colors duration-200">
                            Contacto
                        </Link>
                        <Link href="/privacidad" className="hover:underline transition-colors duration-200">
                            Política de Privacidad
                        </Link>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-blue-800 pt-6 md:pt-8">
                    <p className="text-center text-sm md:text-base">
                        &copy; {new Date().getFullYear()} UrbanPark. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
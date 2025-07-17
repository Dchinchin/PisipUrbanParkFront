'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    Cookies.remove('userId');
    Cookies.remove('userRoleId');
    router.push('/');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">Cerrando Sesión...</h1>
      <p className="mt-3 text-xl">Serás redirigido pronto.</p>
    </div>
  );
}

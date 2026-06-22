'use client'
import { SignOutButton } from '@clerk/nextjs';
import { AlertCircle } from 'lucide-react';
export default function SuspendedStorePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
                <div className="flex justify-center">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Tienda Suspendida
                    </h1>
                    <p className="text-gray-500">
                        Tu tienda ha sido suspendida por un administrador. No puedes acceder al panel de control ni gestionar tus productos.
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <SignOutButton redirectUrl="/sign-in">
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            Cerrar sesión
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </div>
    );
}

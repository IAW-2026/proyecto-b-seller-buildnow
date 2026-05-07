import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigimos automáticamente a la zona del vendedor
  redirect('/seller/dashboard');
}

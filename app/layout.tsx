import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ConversorMP - Graniplast',
  description: 'Sistema de gestión de fórmulas de pinturas Graniplast',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

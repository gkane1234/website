export const metadata = {
  title: 'My Website',
  description: 'A simple website deployed on Vercel',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

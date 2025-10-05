import '../globals.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        />
      </head>
      <body className="admin-layout">
        <div className="admin-container" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 9999, 
          backgroundColor: '#f9fafb',
          overflow: 'auto'
        }}>
          {children}
        </div>
      </body>
    </html>
  )
}
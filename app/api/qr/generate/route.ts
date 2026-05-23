import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, clientName, size = 256 } = await request.json();

    if (!url || !clientName) {
      return NextResponse.json(
        { error: 'URL et nom du client requis' },
        { status: 400 }
      );
    }

    // Generate QR code SVG (simple implementation)
    // In production, use a proper QR code library like 'qrcode'
    const qrCodeSVG = generateQRCodeSVG(url, size);

    return NextResponse.json({
      success: true,
      qrCode: qrCodeSVG,
      url,
      clientName,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur génération QR Code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du code QR' },
      { status: 500 }
    );
  }
}

function generateQRCodeSVG(url: string, size: number): string {
  // Simple QR code placeholder - in production, use a proper QR library
  const border = 20;
  const totalSize = size + (border * 2);
  
  return `
    <svg width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${totalSize}" height="${totalSize}" fill="white"/>
      
      <!-- QR Pattern placeholder - replace with actual QR generation -->
      <rect x="${border}" y="${border}" width="${size}" height="${size}" fill="white" stroke="#000" stroke-width="2"/>
      
      <!-- Corner squares -->
      <rect x="${border + 10}" y="${border + 10}" width="40" height="40" fill="black"/>
      <rect x="${border + size - 50}" y="${border + 10}" width="40" height="40" fill="black"/>
      <rect x="${border + 10}" y="${border + size - 50}" width="40" height="40" fill="black"/>
      
      <!-- Center logo -->
      <circle cx="${totalSize/2}" cy="${totalSize/2}" r="20" fill="#10b981"/>
      <text x="${totalSize/2}" y="${totalSize/2 + 5}" text-anchor="middle" fill="white" font-size="12" font-weight="bold">C360</text>
      
      <!-- URL text -->
      <text x="${totalSize/2}" y="${totalSize - 5}" text-anchor="middle" fill="#666" font-size="10">${url}</text>
      
      <!-- Pattern dots -->
      ${generatePatternDots(border, size)}
    </svg>
  `;
}

function generatePatternDots(border: number, size: number): string {
  let dots = '';
  const dotSize = 8;
  const spacing = 16;
  
  for (let x = border + 70; x < border + size - 70; x += spacing) {
    for (let y = border + 70; y < border + size - 70; y += spacing) {
      if (Math.random() > 0.3) { // Randomly place dots for QR-like pattern
        dots += `<rect x="${x}" y="${y}" width="${dotSize}" height="${dotSize}" fill="black"/>`;
      }
    }
  }
  
  return dots;
}

// GET endpoint to generate QR for specific client
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const client = searchParams.get('client');
  const domain = searchParams.get('domain') || 'csecur360.com';
  
  if (!client) {
    return NextResponse.json(
      { error: 'Paramètre client requis' },
      { status: 400 }
    );
  }

  const url = `https://${domain}/${client}`;
  const qrCodeSVG = generateQRCodeSVG(url, 256);

  return NextResponse.json({
    success: true,
    qrCode: qrCodeSVG,
    url,
    client,
    generatedAt: new Date().toISOString()
  });
}
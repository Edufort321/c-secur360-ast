import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      items,
      labelTemplate = 'avery_5160',
      includeQR = true,
      includeName = true,
      includeSKU = true,
      includeCode = true,
      qrSize = 'medium'
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Aucun article fourni' }, { status: 400 });
    }

    console.log(`🏷️ Génération de ${items.length} étiquettes, template: ${labelTemplate}`);

    // Configuration des templates d'étiquettes
    const templates = {
      avery_5160: {
        pageWidth: 216, // 8.5" * 25.4mm/inch
        pageHeight: 279, // 11" * 25.4mm/inch
        labelWidth: 66.7, // 2.625" * 25.4mm/inch
        labelHeight: 25.4, // 1" * 25.4mm/inch
        marginLeft: 5.1,
        marginTop: 12.7,
        columns: 3,
        rows: 10,
        gapX: 3.2,
        gapY: 0
      },
      avery_8160: {
        pageWidth: 216,
        pageHeight: 279,
        labelWidth: 66.7,
        labelHeight: 25.4,
        marginLeft: 5.1,
        marginTop: 12.7,
        columns: 3,
        rows: 10,
        gapX: 3.2,
        gapY: 0
      }
    };

    const template = templates[labelTemplate as keyof typeof templates] || templates.avery_5160;
    
    // Taille des QR codes
    const qrSizes = {
      small: 15,
      medium: 18,
      large: 20
    };
    const qrDimension = qrSizes[qrSize as keyof typeof qrSizes] || qrSizes.medium;

    // Créer le PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    let currentPage = 1;
    let labelCount = 0;

    // Fonction pour ajouter une nouvelle page si nécessaire
    const addPageIfNeeded = () => {
      const labelsPerPage = template.columns * template.rows;
      if (labelCount > 0 && labelCount % labelsPerPage === 0) {
        pdf.addPage();
        currentPage++;
        console.log(`📄 Nouvelle page ${currentPage} créée`);
      }
    };

    // Fonction pour calculer la position d'une étiquette
    const getLabelPosition = (index: number) => {
      const labelsPerPage = template.columns * template.rows;
      const pageIndex = index % labelsPerPage;
      
      const row = Math.floor(pageIndex / template.columns);
      const col = pageIndex % template.columns;
      
      const x = template.marginLeft + col * (template.labelWidth + template.gapX);
      const y = template.marginTop + row * (template.labelHeight + template.gapY);
      
      return { x, y };
    };

    // Traitement de chaque article
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      addPageIfNeeded();
      
      const position = getLabelPosition(labelCount);
      
      try {
        // Génération du QR Code si demandé
        let qrDataURL = null;
        if (includeQR && item.qrPayload) {
          const qrText = typeof item.qrPayload === 'string' 
            ? item.qrPayload 
            : JSON.stringify(item.qrPayload);
          
          qrDataURL = await QRCode.toDataURL(qrText, {
            width: qrDimension * 10, // Pixels (converti pour meilleure qualité)
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
        }

        // Layout de l'étiquette
        let currentY = position.y + 2;
        const labelCenterX = position.x + template.labelWidth / 2;
        const textStartX = position.x + 2;
        
        // Zone de texte disponible
        const textWidth = includeQR 
          ? template.labelWidth - qrDimension - 6 
          : template.labelWidth - 4;

        // Dessiner le QR Code
        if (qrDataURL) {
          const qrX = position.x + template.labelWidth - qrDimension - 2;
          pdf.addImage(qrDataURL, 'PNG', qrX, currentY, qrDimension, qrDimension);
        }

        // Configuration des polices et tailles
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);

        // Nom de l'article (tronqué si nécessaire)
        if (includeName && item.name) {
          const maxNameLength = Math.floor(textWidth / 1.8); // Approximation caractères
          const displayName = item.name.length > maxNameLength 
            ? item.name.substring(0, maxNameLength - 3) + '...'
            : item.name;
          
          pdf.text(displayName, textStartX, currentY + 3);
          currentY += 4;
        }

        // SKU
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        
        if (includeSKU && item.sku) {
          pdf.text(`SKU: ${item.sku}`, textStartX, currentY + 3);
          currentY += 3;
        }

        // Code instance ou article
        if (includeCode && (item.instance_code || item.id)) {
          const code = item.instance_code || item.id;
          const displayCode = code.length > 15 ? code.substring(0, 12) + '...' : code;
          pdf.text(displayCode, textStartX, currentY + 3);
          currentY += 3;
        }

        // Informations supplémentaires si espace disponible
        if (currentY < position.y + template.labelHeight - 2) {
          pdf.setFontSize(6);
          if (item.category) {
            pdf.text(item.category, textStartX, currentY + 2);
          }
        }

        // Bordure de débogage (à supprimer en prod)
        if (process.env.NODE_ENV === 'development') {
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(position.x, position.y, template.labelWidth, template.labelHeight);
        }

        labelCount++;
        
        if (labelCount % 10 === 0) {
          console.log(`🏷️ ${labelCount}/${items.length} étiquettes générées...`);
        }

      } catch (itemError) {
        console.error(`❌ Erreur génération étiquette pour ${item.name}:`, itemError);
        // Continuer avec les autres articles
      }
    }

    // Générer le PDF
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    
    console.log(`✅ PDF généré: ${labelCount} étiquettes, ${currentPage} page(s), ${pdfBuffer.length} bytes`);

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="etiquettes-inventaire-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('💥 Erreur génération étiquettes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des étiquettes', details: error.message },
      { status: 500 }
    );
  }
}

// Configuration pour les gros PDFs
export const maxDuration = 30; // 30 secondes max
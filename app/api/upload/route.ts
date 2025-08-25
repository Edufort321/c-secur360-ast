import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePermission } from '@/lib/auth/rbac-helpers';
import crypto from 'crypto';

// Configuration sécurisée des uploads
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf'
};

const UPLOAD_TYPES = {
  'expense_receipt': 'receipts',
  'profile_avatar': 'avatars',
  'document': 'documents',
  'inventory_photo': 'inventory'
};

export async function POST(request: NextRequest) {
  try {
    // Vérifier authentification
    const authContext = await requirePermission('general.upload', 'global');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'document';
    const entityId = formData.get('entityId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });
    }

    // Validation sécurité fichier
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé' },
        { status: 400 }
      );
    }

    if (!UPLOAD_TYPES[type as keyof typeof UPLOAD_TYPES]) {
      return NextResponse.json(
        { error: 'Type d\'upload invalide' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Générer nom de fichier sécurisé
    const fileExtension = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES];
    const fileName = `${crypto.randomUUID()}${fileExtension}`;
    const folderPath = UPLOAD_TYPES[type as keyof typeof UPLOAD_TYPES];
    const fullPath = `${folderPath}/${fileName}`;

    // Convertir File en ArrayBuffer puis Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fullPath, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600' // 1 heure de cache
      });

    if (uploadError) {
      console.error('Erreur upload Supabase:', uploadError);
      throw new Error('Erreur lors du téléchargement');
    }

    // Générer URL publique sécurisée (avec expiration)
    const { data: urlData } = supabase.storage
      .from('uploads')
      .createSignedUrl(fullPath, 24 * 60 * 60); // 24h d'expiration

    const publicUrl = urlData?.signedUrl;

    // Enregistrer métadonnées en base
    const { data: fileRecord, error: dbError } = await supabase
      .from('file_uploads')
      .insert({
        id: crypto.randomUUID(),
        user_id: authContext.user.id,
        entity_type: type,
        entity_id: entityId,
        original_name: file.name,
        file_path: fullPath,
        file_size: file.size,
        mime_type: file.type,
        public_url: publicUrl || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erreur sauvegarde métadonnées:', dbError);
      // Tentative de cleanup du fichier uploadé
      await supabase.storage.from('uploads').remove([fullPath]);
      throw new Error('Erreur lors de la sauvegarde');
    }

    console.log(`📁 Fichier uploadé par ${authContext.user.email}: ${file.name} (${file.size} bytes)`);

    return NextResponse.json({
      id: fileRecord.id,
      url: publicUrl,
      path: fullPath,
      originalName: file.name,
      size: file.size,
      type: file.type
    }, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur upload:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authContext = await requirePermission('general.view', 'global');
    
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const userId = searchParams.get('userId');

    const supabase = createClient();
    
    let query = supabase
      .from('file_uploads')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtres selon permissions
    if (authContext.hasPermission('general.manage', 'global')) {
      // Admin peut voir tous les fichiers
      if (userId) query = query.eq('user_id', userId);
    } else {
      // Utilisateur ne peut voir que ses fichiers
      query = query.eq('user_id', authContext.user.id);
    }

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    
    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    const { data: files, error } = await query.limit(100);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      files: files || []
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur récupération fichiers:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}
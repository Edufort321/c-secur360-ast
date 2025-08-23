import { NextRequest, NextResponse } from 'next/server';
import { 
  generateTOTPSetup, 
  updateUserTOTP, 
  verifyTOTPCode,
  getUserByEmail,
  logAuthEvent
} from '@/lib/auth-utils';
import { TOTPSetupResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, action, totp_code, secret } = body;

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email requis'
      } as TOTPSetupResponse, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé'
      } as TOTPSetupResponse, { status: 404 });
    }

    switch (action) {
      case 'generate':
        // Generate new TOTP secret and QR code
        try {
          const { secret, qrCodeUrl, backupCodes } = await generateTOTPSetup(email);
          
          await logAuthEvent('totp_setup', {
            action: 'generate_qr',
            user_email: email
          }, { ip, userAgent }, user.id, email);

          return NextResponse.json({
            success: true,
            secret,
            qr_code_url: qrCodeUrl,
            backup_codes: backupCodes
          } as TOTPSetupResponse);

        } catch (error) {
          console.error('TOTP generation error:', error);
          return NextResponse.json({
            success: false,
            error: 'Erreur lors de la génération du QR code'
          } as TOTPSetupResponse, { status: 500 });
        }

      case 'verify':
        // Verify TOTP code and enable 2FA
        if (!totp_code || !secret) {
          return NextResponse.json({
            success: false,
            error: 'Code TOTP et secret requis'
          } as TOTPSetupResponse, { status: 400 });
        }

        const isValidCode = verifyTOTPCode(totp_code, secret);
        if (!isValidCode) {
          await logAuthEvent('totp_setup', {
            action: 'verify_fail',
            user_email: email
          }, { ip, userAgent }, user.id, email);

          return NextResponse.json({
            success: false,
            error: 'Code TOTP invalide'
          } as TOTPSetupResponse, { status: 400 });
        }

        // Generate backup codes for the final setup
        const backupCodes = Array.from({ length: 10 }, () => 
          Math.random().toString(36).substr(2, 8).toUpperCase()
        );

        // Save TOTP settings
        const updateSuccess = await updateUserTOTP(user.id, secret, backupCodes);
        if (!updateSuccess) {
          return NextResponse.json({
            success: false,
            error: 'Erreur lors de la sauvegarde TOTP'
          } as TOTPSetupResponse, { status: 500 });
        }

        await logAuthEvent('totp_setup', {
          action: 'verify_success',
          user_email: email,
          backup_codes_generated: backupCodes.length
        }, { ip, userAgent }, user.id, email);

        return NextResponse.json({
          success: true,
          backup_codes: backupCodes
        } as TOTPSetupResponse);

      default:
        return NextResponse.json({
          success: false,
          error: 'Action non supportée'
        } as TOTPSetupResponse, { status: 400 });
    }

  } catch (error) {
    console.error('TOTP setup error:', error);
    
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await logAuthEvent('totp_setup', {
      action: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { ip, userAgent });

    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    } as TOTPSetupResponse, { status: 500 });
  }
}
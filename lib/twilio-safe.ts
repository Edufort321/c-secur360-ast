// Safe Twilio import - évite les erreurs de compilation
export function createTwilioClient(accountSid: string, authToken: string) {
  try {
    // @ts-ignore - Dynamic import pour éviter erreur de compilation
    const twilio = eval('require')('twilio');
    return twilio(accountSid, authToken);
  } catch (error) {
    console.warn('Twilio not installed - using simulation mode');
    return null;
  }
}

export function isTwilioAvailable(): boolean {
  try {
    // @ts-ignore - Dynamic import
    eval('require')('twilio');
    return true;
  } catch {
    return false;
  }
}
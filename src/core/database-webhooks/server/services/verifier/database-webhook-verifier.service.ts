export abstract class DatabaseWebhookVerifierService {
  abstract verifySignatureOrThrow(header: string): Promise<boolean>;
}

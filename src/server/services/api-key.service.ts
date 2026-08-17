import { Firestore, Timestamp } from '@google-cloud/firestore';
import * as crypto from 'node:crypto';

// Use standard Firestore client for GCP backend.
// ADC (Application Default Credentials) will be used automatically.
const db = new Firestore();

export interface ApiKeyDocument {
  tenantId: string;
  name: string;
  keyHash: string;
  prefix: string;
  createdAt: FirebaseFirestore.Timestamp;
  lastUsedAt?: FirebaseFirestore.Timestamp;
  status: 'active' | 'revoked';
}

const HMAC_PEPPER = process.env['API_KEY_PEPPER'] || 'pocketgull-hmac-sha256-secret-pepper-v1';

function hashApiKey(rawKey: string): string {
  return crypto.createHmac('sha256', HMAC_PEPPER).update(rawKey).digest('hex');
}

export class ApiKeyService {
  private collection = db.collection('api_keys');

  /**
   * Generates a new API key for a given tenant.
   * Returns the raw key (which MUST be shown to the user exactly once) and the document ID.
   */
  async generateKey(tenantId: string, name: string): Promise<{ rawKey: string; keyId: string }> {
    const rawKey = 'sk_live_' + crypto.randomBytes(32).toString('base64url');
    const keyHash = hashApiKey(rawKey);
    const prefix = rawKey.substring(0, 16) + '...';

    const docRef = this.collection.doc();
    const docData: ApiKeyDocument = {
      tenantId,
      name,
      keyHash,
      prefix,
      createdAt: Timestamp.now(),
      status: 'active',
    };

    await docRef.set(docData);

    return { rawKey, keyId: docRef.id };
  }

  /**
   * Validates a raw API key.
   * Returns the tenantId if valid, or null if invalid/revoked.
   */
  async validateKey(rawKey: string): Promise<string | null> {
    if (!rawKey || !rawKey.startsWith('sk_live_')) return null;

    const keyHash = hashApiKey(rawKey);
    const snapshot = await this.collection
      .where('keyHash', '==', keyHash)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as ApiKeyDocument;
    
    // Update lastUsedAt in the background (fire and forget)
    doc.ref.update({ lastUsedAt: Timestamp.now() }).catch(console.error);

    return data.tenantId;
  }

  /**
   * Lists all keys for a tenant (without the raw keys).
   */
  async listKeys(tenantId: string) {
    const snapshot = await this.collection.where('tenantId', '==', tenantId).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as ApiKeyDocument)
    }));
  }

  /**
   * Revokes an API key.
   */
  async revokeKey(keyId: string, tenantId: string): Promise<boolean> {
    const docRef = this.collection.doc(keyId);
    const doc = await docRef.get();
    
    if (!doc.exists) return false;
    
    const data = doc.data() as ApiKeyDocument;
    if (data.tenantId !== tenantId) return false;
    
    await docRef.update({ status: 'revoked' });
    return true;
  }
}

export const apiKeyService = new ApiKeyService();

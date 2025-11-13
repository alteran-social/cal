import { BskyAgent } from '@atproto/api';
import type { Availability } from './schema';

/**
 * atproto Client for interacting with Personal Data Servers
 */
export class AtProtoClient {
  private agent: BskyAgent;

  constructor(serviceUrl: string = 'https://bsky.social') {
    this.agent = new BskyAgent({ service: serviceUrl });
  }

  /**
   * Resolve a handle to a DID (Decentralized Identifier)
   */
  async resolveHandle(handle: string): Promise<string> {
    const response = await this.agent.resolveHandle({ handle });
    return response.data.did;
  }

  /**
   * Get a user's PDS URL from their DID
   */
  async getPdsUrl(did: string): Promise<string> {
    // In a real implementation, this would use DID resolution
    // For now, we'll use the default Bluesky PDS
    return 'https://bsky.social';
  }

  /**
   * Fetch availability records from a user's PDS
   */
  async getAvailability(did: string): Promise<Availability[]> {
    // This would use the atproto API to fetch records from the collection
    // social.schedule.availability on the user's PDS
    
    // Placeholder implementation
    try {
      // In production, this would use:
      // const records = await this.agent.com.atproto.repo.listRecords({
      //   repo: did,
      //   collection: 'social.schedule.availability'
      // });
      return [];
    } catch (error) {
      console.error('Error fetching availability:', error);
      return [];
    }
  }

  /**
   * Create an availability record on the user's PDS
   */
  async createAvailability(
    did: string,
    availability: Omit<Availability, 'id' | 'createdAt'>
  ): Promise<Availability> {
    // This would write to the user's PDS
    // Requires authentication with the user's credentials
    
    const record: Availability = {
      ...availability,
      id: this.generateTid(),
      createdAt: new Date().toISOString(),
    };

    // In production:
    // await this.agent.com.atproto.repo.createRecord({
    //   repo: did,
    //   collection: 'social.schedule.availability',
    //   record
    // });

    return record;
  }

  /**
   * Update an availability record
   */
  async updateAvailability(
    did: string,
    recordKey: string,
    availability: Partial<Availability>
  ): Promise<void> {
    // In production:
    // await this.agent.com.atproto.repo.putRecord({
    //   repo: did,
    //   collection: 'social.schedule.availability',
    //   rkey: recordKey,
    //   record: availability
    // });
  }

  /**
   * Delete an availability record
   */
  async deleteAvailability(did: string, recordKey: string): Promise<void> {
    // In production:
    // await this.agent.com.atproto.repo.deleteRecord({
    //   repo: did,
    //   collection: 'social.schedule.availability',
    //   rkey: recordKey
    // });
  }

  /**
   * Generate a TID (Timestamp Identifier) for records
   */
  private generateTid(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${timestamp}${random}`;
  }

  /**
   * Login with credentials (for authenticated operations)
   */
  async login(identifier: string, password: string): Promise<void> {
    await this.agent.login({ identifier, password });
  }
}

/**
 * Create a new atproto client instance
 */
export function createAtProtoClient(serviceUrl?: string): AtProtoClient {
  return new AtProtoClient(serviceUrl);
}

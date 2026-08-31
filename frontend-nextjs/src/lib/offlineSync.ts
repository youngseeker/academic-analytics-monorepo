export interface OfflineAction {
    id: string;
    timestamp: number;
    actionType: 'SAVE_COURSE' | 'DELETE_COURSE' | 'UPDATE_PROFILE';
    payload: any;
}

export class OfflineSyncManager {
    private static DB_NAME = 'StudentOS_OfflineDB';
    private static STORE_NAME = 'pending_actions';

    private static openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !('indexedDB' in window)) {
                reject('IndexedDB not available');
                return;
            }

            const request = indexedDB.open(this.DB_NAME, 1);

            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                }
            };

            request.onsuccess = (event: any) => resolve(event.target.result);
            request.onerror = (event: any) => reject(event.target.error);
        });
    }

    /**
     * Queues an offline mutation when network connection is down.
     */
    static async queueAction(actionType: OfflineAction['actionType'], payload: any): Promise<void> {
        try {
            const db = await this.openDB();
            const tx = db.transaction(this.STORE_NAME, 'readwrite');
            const store = tx.objectStore(this.STORE_NAME);

            const action: OfflineAction = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                actionType,
                payload
            };

            store.add(action);
            console.log('Action queued offline in IndexedDB:', action);
        } catch (e) {
            console.error('Failed to queue offline action:', e);
        }
    }

    /**
     * Retrieves all pending un-synced actions.
     */
    static async getPendingActions(): Promise<OfflineAction[]> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.STORE_NAME, 'readonly');
                const store = tx.objectStore(this.STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            return [];
        }
    }

    /**
     * Clears processed actions after successful sync.
     */
    static async clearAction(id: string): Promise<void> {
        try {
            const db = await this.openDB();
            const tx = db.transaction(this.STORE_NAME, 'readwrite');
            const store = tx.objectStore(this.STORE_NAME);
            store.delete(id);
        } catch (e) {
            console.error('Failed to clear action:', e);
        }
    }
}

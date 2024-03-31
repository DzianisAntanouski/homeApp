// dbModule.js
export class DBModule {
    constructor(dbName, version) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    openDB(stores) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                stores.forEach(store => {
                    if (!db.objectStoreNames.contains(store.name)) {
                        const objectStore = db.createObjectStore(store.name, store.options);
                        store.indexes.forEach(index => {
                            objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                        });
                    }
                });
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error("DBModule: OpenDB error", event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    }

    addData(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    getAllData(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], "readonly");
            const store = transaction.objectStore(storeName);
            const request = store.openCursor();
            const data = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.value.key = cursor.key;
                    data.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(data);
                }
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    deleteData(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    exportData() {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject('База данных не инициализирована');
                return;
            }

            let exportData = {};
            const storeNames = Array.from(this.db.objectStoreNames);

            try {
                for (const storeName of storeNames) {
                    const storeData = await this.getAllData(storeName);
                    exportData[storeName] = storeData;
                }
                resolve(JSON.stringify(exportData));
            } catch (error) {
                reject(error);
            }
        });
    }

    importData(jsonData) {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject('База данных не инициализирована');
                return;
            }

            const importData = JSON.parse(jsonData);
            const storeNames = Object.keys(importData);

            const transaction = this.db.transaction(storeNames, 'readwrite');

            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject('Ошибка транзакции: ', event.target.error);

            try {
                for (const storeName of storeNames) {
                    const store = transaction.objectStore(storeName);
                    // Очистить хранилище перед импортом
                    await new Promise((resolve, reject) => {
                        const clearRequest = store.clear();
                        clearRequest.onsuccess = () => resolve();
                        clearRequest.onerror = (event) => reject('Ошибка очистки: ', event.target.error);
                    });

                    // Добавление данных
                    for (const item of importData[storeName]) {
                        delete item.key; // Удаляем ключ, если он был добавлен при экспорте
                        store.add(item);
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    }

}

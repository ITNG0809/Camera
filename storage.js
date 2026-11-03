// IndexedDB photo storage
const PhotoDB = (() => {
  const DB_NAME = "SilentCamDB", STORE = "photos", VERSION = 1;
  let dbPromise;
  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }
  async function transaction(mode, action) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode), store = tx.objectStore(STORE);
      let result;
      try { result = action(store); } catch (e) { reject(e); return; }
      tx.oncomplete = () => resolve(result?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("保存処理が中断されました"));
    });
  }
  return {
    add: photo => transaction("readwrite", s => s.add(photo)),
    getAll: async () => {
      const db = await open();
      return new Promise((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
        req.onsuccess = () => resolve(req.result.sort((a,b) => b.createdAt-a.createdAt));
        req.onerror = () => reject(req.error);
      });
    },
    get: async id => {
      const db = await open();
      return new Promise((resolve,reject) => {
        const req=db.transaction(STORE,"readonly").objectStore(STORE).get(id);
        req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
      });
    },
    delete: id => transaction("readwrite", s => s.delete(id)),
    clear: () => transaction("readwrite", s => s.clear())
  };
})();
function generateUUID() {
  if (
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      const r = Math.floor(Math.random() * 16);
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
}

export function createSyncData(data = {}) {
  const now = new Date().toISOString();

  return {
    ...data,
    uuid: data.uuid || generateUUID(),
    createdAt: now,
    updatedAt: now,
    synced: false,
    deleted: false,
    deletedAt: null,
  };
}

export function updateSyncData(data = {}) {
  return {
    ...data,
    updatedAt: new Date().toISOString(),
    synced: false,
  };
}

export function deleteSyncData() {
  const now = new Date().toISOString();

  return {
    deleted: true,
    deletedAt: now,
    updatedAt: now,
    synced: false,
  };
}

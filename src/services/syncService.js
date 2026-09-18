import db from "../db";
import { supabase } from "./supabase";

/*
 * SINCRONIZAÇÃO OFFLINE-FIRST
 *
 * Regras:
 * 1. IndexedDB é a fonte local.
 * 2. UUID identifica registros entre dispositivos.
 * 3. Dados normais vão para sync_data.
 * 4. Arquivos de foto vão para Storage.
 * 5. Foto só vira synced=true depois de Storage + sync_data.
 * 6. Falha em qualquer etapa interrompe a sincronização e é
 *    devolvida para a interface.
 */

const PHOTO_BUCKET = "activity-photos";

const DATA_TABLES = [
  "properties",
  "plots",
  "activities",
  "products",
  "library",
  "pests",
  "diseases",
  "cultures",
  "orders",
];

const ALL_TABLES = [...DATA_TABLES, "photos"];

const PULL_ORDER = [
  "properties",
  "products",
  "library",
  "pests",
  "diseases",
  "cultures",
  "plots",
  "activities",
  "orders",
  "photos",
];

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

function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const numeric = Number(value);
    const date = new Date(numeric);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  if (value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  return new Date().toISOString();
}

function isOnline() {
  return typeof navigator === "undefined" || navigator.onLine;
}

function throwIfOffline() {
  if (!isOnline()) {
    throw new Error("Sem conexão com a internet.");
  }
}

async function getUuid(tableName, id) {
  if (id === null || id === undefined || id === "") return null;

  const numericId = Number(id);
  if (Number.isNaN(numericId)) return null;

  const row = await db.table(tableName).get(numericId);
  return row?.uuid || null;
}

async function ensureUuids() {
  for (const tableName of ALL_TABLES) {
    const table = db.table(tableName);
    const rows = await table.toArray();

    for (const row of rows) {
      const changes = {};

      if (!row.uuid) {
        changes.uuid = generateUUID();
        changes.synced = false;
      }

      if (!row.createdAt) {
        changes.createdAt = new Date().toISOString();
      }

      if (!row.updatedAt) {
        changes.updatedAt = changes.createdAt || new Date().toISOString();
      }

      if (Object.keys(changes).length > 0) {
        await table.update(row.id, changes);
      }
    }
  }
}

async function relationData(tableName, row) {
  const data = { ...row };

  if (tableName === "plots" && !data.propertyUuid) {
    data.propertyUuid = await getUuid("properties", row.propertyId);
  }

  if (tableName === "activities") {
    if (!data.propertyUuid) {
      data.propertyUuid = await getUuid("properties", row.propertyId);
    }

    if (!data.plotUuid) {
      data.plotUuid = await getUuid("plots", row.plotId);
    }
  }

  return data;
}

function cleanLocalFields(row, data) {
  const result = { ...data };

  delete result.id;
  delete result.synced;
  delete result.file;
  delete result.storagePath;
  delete result.createdAt;
  delete result.updatedAt;
  delete result.deletedAt;

  return result;
}

async function upsertRemote(item) {
  const { error } = await supabase
    .from("sync_data")
    .upsert(item, { onConflict: "uuid" });

  if (error) {
    throw new Error(
      `Não foi possível salvar ${item.table_name}: ${error.message}`
    );
  }
}

async function deleteRemotePhoto(storagePath) {
  if (!storagePath) return;

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .remove([storagePath]);

  // Se o arquivo já não existir, a exclusão continua válida.
  if (error && !/not found|does not exist|no such file/i.test(error.message || "")) {
    throw new Error(`Exclusão da foto no Storage falhou: ${error.message}`);
  }
}

async function uploadPhoto(photo) {
  if (photo.deleted) return photo.storagePath || null;

  if (!photo.file) {
    if (photo.storagePath) return photo.storagePath;

    throw new Error(
      `A foto ${photo.uuid || photo.id} não possui arquivo local.`
    );
  }

  const extensionFromName =
    photo.name?.includes(".")
      ? photo.name.split(".").pop().toLowerCase()
      : "";

  const extension =
    extensionFromName ||
    photo.type?.split("/").pop()?.toLowerCase() ||
    "jpg";

  const storagePath =
    photo.storagePath || `photos/${photo.uuid}.${extension}`;

  let rawFile = photo.file;

  if (rawFile instanceof Blob) {
    // Compatibilidade com fotos antigas que ainda estejam guardadas
    // como Blob no IndexedDB.
    rawFile = await rawFile.arrayBuffer();
  }

  const blob =
    rawFile instanceof Blob
      ? rawFile
      : new Blob([rawFile], {
          type: photo.type || "image/jpeg",
        });

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, blob, {
      contentType:
        photo.type ||
        blob.type ||
        "image/jpeg",
      upsert: true,
      cacheControl: "31536000",
    });

  if (error) {
    throw new Error(
      `Upload da foto falhou: ${error.message}`
    );
  }

  return storagePath;
}

async function pushNormalTable(tableName, onProgress) {
  const table = db.table(tableName);

  const pending = await table
    .filter((row) => row.synced !== true)
    .toArray();

  let count = 0;

  for (const original of pending) {
    throwIfOffline();

    const row = await table.get(original.id);
    if (!row) continue;

    if (!row.uuid) {
      row.uuid = generateUUID();
      await table.update(row.id, {
        uuid: row.uuid,
        synced: false,
      });
    }

    const createdAt = normalizeDate(row.createdAt);
    const updatedAt = normalizeDate(row.updatedAt);

    const withRelations = await relationData(
      tableName,
      row
    );

    const data = cleanLocalFields(
      row,
      withRelations
    );

    await upsertRemote({
      uuid: row.uuid,
      table_name: tableName,
      data,
      created_at: createdAt,
      updated_at: updatedAt,
      deleted: Boolean(row.deleted),
    });

    await table.update(row.id, {
      uuid: row.uuid,
      createdAt,
      updatedAt,
      synced: true,
    });

    count++;

    onProgress?.({
      phase: "uploading",
      table: tableName,
      current: count,
      total: pending.length,
    });
  }

  return count;
}

async function pushPhotos(onProgress) {
  const table = db.photos;

  /*
   * Não confiamos apenas em synced.
   * Uma foto com storagePath mas sem metadata também precisa
   * conseguir completar a sincronização.
   */
  const pending = await table
    .filter(
      (photo) =>
        photo.synced !== true ||
        (!photo.deleted && !photo.storagePath)
    )
    .toArray();

  let count = 0;

  for (const original of pending) {
    throwIfOffline();

    const photo = await table.get(original.id);
    if (!photo) continue;

    if (!photo.uuid) {
      photo.uuid = generateUUID();
      await table.update(photo.id, {
        uuid: photo.uuid,
        synced: false,
      });
    }

    // Normaliza fotos antigas para ArrayBuffer antes de qualquer
    // outra alteração no registro. Isso evita o UnknownError do
    // IndexedDB móvel ao modificar objetos que contêm Blob/File.
    if (photo.file instanceof Blob) {
      const fileBuffer = await photo.file.arrayBuffer();
      photo.file = fileBuffer;
      await table.update(photo.id, {
        file: fileBuffer,
      });
    }

    let activityUuid = photo.activityUuid || null;

    if (!activityUuid && photo.activityId) {
      activityUuid = await getUuid(
        "activities",
        photo.activityId
      );
    }

    if (!activityUuid) {
      throw new Error(
        `A foto ${photo.uuid} não está vinculada a uma atividade.`
      );
    }

    const createdAt = normalizeDate(photo.createdAt);
    const updatedAt = normalizeDate(photo.updatedAt);

    const storagePath = await uploadPhoto({
      ...photo,
      activityUuid,
    });

    if (photo.deleted && storagePath) {
      await deleteRemotePhoto(storagePath);
    }

    await table.update(photo.id, {
      uuid: photo.uuid,
      activityUuid,
      storagePath,
      createdAt,
      updatedAt,
      synced: false,
    });

    const photoData = {
      activityUuid,
      name: photo.name || "foto.jpg",
      type: photo.type || photo.file?.type || "image/jpeg",
      storagePath,
    };

    await upsertRemote({
      uuid: photo.uuid,
      table_name: "photos",
      data: photoData,
      created_at: createdAt,
      updated_at: updatedAt,
      deleted: Boolean(photo.deleted),
    });

    await table.update(photo.id, {
      uuid: photo.uuid,
      activityUuid,
      storagePath,
      createdAt,
      updatedAt,
      synced: true,
    });

    count++;

    onProgress?.({
      phase: "photos",
      current: count,
      total: pending.length,
    });
  }

  return count;
}

export async function pushChanges(onProgress) {
  throwIfOffline();
  await ensureUuids();

  let total = 0;

  for (const tableName of DATA_TABLES) {
    total += await pushNormalTable(
      tableName,
      onProgress
    );
  }

  total += await pushPhotos(onProgress);

  return total;
}

async function localIdByUuid(tableName, uuid) {
  if (!uuid) return null;

  const row = await db
    .table(tableName)
    .where("uuid")
    .equals(uuid)
    .first();

  return row?.id ?? null;
}

async function applyNormalRemote(remote) {
  const table = db.table(remote.table_name);
  const local = await table
    .where("uuid")
    .equals(remote.uuid)
    .first();

  const data = { ...(remote.data || {}) };

  const incoming = {
    ...data,
    uuid: remote.uuid,
    createdAt: normalizeDate(remote.created_at),
    updatedAt: normalizeDate(remote.updated_at),
    deleted: Boolean(remote.deleted),
    synced: true,
  };

  if (remote.table_name === "plots") {
    incoming.propertyId = await localIdByUuid(
      "properties",
      data.propertyUuid
    );
  }

  if (remote.table_name === "activities") {
    incoming.propertyId = await localIdByUuid(
      "properties",
      data.propertyUuid
    );

    incoming.plotId = await localIdByUuid(
      "plots",
      data.plotUuid
    );
  }

  if (!local) {
    await table.add(incoming);
    return;
  }

  const remoteTime = new Date(
    incoming.updatedAt
  ).getTime();

  const localTime = new Date(
    normalizeDate(local.updatedAt)
  ).getTime();

  if (remoteTime >= localTime) {
    await table.update(local.id, incoming);
  }
}

async function applyPhotoRemote(remote) {
  const table = db.photos;
  const data = remote.data || {};

  const local = await table
    .where("uuid")
    .equals(remote.uuid)
    .first();

  const activityId = await localIdByUuid(
    "activities",
    data.activityUuid
  );

  const incoming = {
    uuid: remote.uuid,
    activityUuid: data.activityUuid || null,
    activityId,
    name: data.name || "foto.jpg",
    type: data.type || "image/jpeg",
    storagePath: data.storagePath || null,
    createdAt: normalizeDate(remote.created_at),
    updatedAt: normalizeDate(remote.updated_at),
    deleted: Boolean(remote.deleted),
    synced: true,

    /*
     * Se a foto já existe localmente, preservamos o Blob.
     * Isso evita apagar uma foto offline enquanto os metadados
     * são atualizados.
     */
    file: local?.file || null,
  };

  if (!local) {
    await table.add(incoming);
    return;
  }

  const remoteTime = new Date(
    incoming.updatedAt
  ).getTime();

  const localTime = new Date(
    normalizeDate(local.updatedAt)
  ).getTime();

  const shouldUpdate =
    remoteTime >= localTime ||
    local.activityId !== activityId ||
    local.storagePath !== incoming.storagePath;

  if (shouldUpdate) {
    await table.update(local.id, incoming);
  }
}

export async function pullChanges(onProgress) {
  throwIfOffline();

  const { data, error } = await supabase
    .from("sync_data")
    .select("*")
    .order("updated_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Download da sincronização falhou: ${error.message}`
    );
  }

  const items = Array.isArray(data) ? data : [];

  for (const tableName of PULL_ORDER) {
    const records = items.filter(
      (item) => item.table_name === tableName
    );

    for (const remote of records) {
      throwIfOffline();

      if (tableName === "photos") {
        await applyPhotoRemote(remote);
      } else {
        await applyNormalRemote(remote);
      }
    }

    onProgress?.({
      phase: "downloading",
      table: tableName,
      current: 1,
      total: PULL_ORDER.length,
    });
  }

  /*
   * Corrige vínculos de fotos depois que todas as atividades
   * já foram carregadas.
   */
  const photos = await db.photos.toArray();

  for (const photo of photos) {
    if (!photo.activityUuid) continue;

    const activityId = await localIdByUuid(
      "activities",
      photo.activityUuid
    );

    if (
      activityId &&
      photo.activityId !== activityId
    ) {
      await db.photos.update(photo.id, {
        activityId,
      });
    }
  }

  return items.length;
}

export async function syncNow(onProgress) {
  throwIfOffline();

  onProgress?.({
    phase: "preparing",
  });

  const sent = await pushChanges(onProgress);

  onProgress?.({
    phase: "downloading",
  });

  const received = await pullChanges(onProgress);

  window.dispatchEvent(
    new CustomEvent("caderno-sync-complete", {
      detail: {
        sent,
        received,
      },
    })
  );

  return {
    success: true,
    sent,
    received,
  };
}

export function getSyncErrorMessage(error) {
  const message =
    error?.message ||
    String(error || "Erro desconhecido.");

  if (
    /Failed to fetch|NetworkError|ERR_NETWORK|ERR_FAILED/i.test(
      message
    )
  ) {
    return "Não foi possível conectar ao servidor. Verifique a internet e tente novamente.";
  }

  if (/permission|policy|row-level security|RLS/i.test(message)) {
    return "O servidor recusou o acesso. Verifique as permissões do Supabase.";
  }

  if (/storage|upload da foto/i.test(message)) {
    return `Não foi possível enviar uma foto. ${message}`;
  }

  return message;
}

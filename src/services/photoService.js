import db from "../db";

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

/*
 * Alguns navegadores móveis são mais consistentes ao guardar
 * um Blob no IndexedDB do que um objeto File inteiro.
 *
 * O nome/tipo ficam guardados separadamente no registro da foto.
 */
async function fileToArrayBuffer(file) {
  if (file instanceof ArrayBuffer) return file;

  if (ArrayBuffer.isView(file)) {
    return file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength
    );
  }

  if (!(file instanceof Blob)) {
    throw new Error("Arquivo de imagem inválido.");
  }

  return file.arrayBuffer();
}

/*
 * Reduz fotos enormes antes de guardá-las offline.
 * Isso diminui muito o tamanho do IndexedDB e do upload móvel.
 *
 * Se o navegador não conseguir decodificar a imagem (ex.: alguns
 * formatos específicos do celular), usamos o arquivo original.
 */
async function optimizeImage(file) {
  if (!(file instanceof Blob)) return file;

  const type = file.type || "";

  if (!type.startsWith("image/")) return file;

  if (
    type === "image/svg+xml" ||
    type === "image/gif"
  ) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    const maxSize = 1920;
    const scale = Math.min(
      1,
      maxSize / Math.max(bitmap.width, bitmap.height)
    );

    const width = Math.max(
      1,
      Math.round(bitmap.width * scale)
    );

    const height = Math.max(
      1,
      Math.round(bitmap.height * scale)
    );

    if (
      scale === 1 &&
      file.size <= 3 * 1024 * 1024
    ) {
      bitmap.close();
      return fileToArrayBuffer(file);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      bitmap.close();
      return fileToArrayBuffer(file);
    }

    context.drawImage(
      bitmap,
      0,
      0,
      width,
      height
    );

    bitmap.close();

    const compressed = await new Promise(
      (resolve) => {
        canvas.toBlob(
          resolve,
          "image/jpeg",
          0.84
        );
      }
    );

    return compressed ? await fileToArrayBuffer(compressed) : fileToArrayBuffer(file);
  } catch {
    return fileToArrayBuffer(file);
  }
}

export async function addPhoto(activityId, file) {
  if (!activityId || !file) {
    throw new Error(
      "Atividade ou arquivo não informado."
    );
  }

  const activity = await db.activities.get(
    Number(activityId)
  );

  if (!activity) {
    throw new Error(
      "Atividade não encontrada."
    );
  }

  let activityUuid = activity.uuid;

  if (!activityUuid) {
    activityUuid = generateUUID();

    await db.activities.update(
      Number(activityId),
      {
        uuid: activityUuid,
        synced: false,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  const optimized = await optimizeImage(file);
  const fileBuffer = await fileToArrayBuffer(optimized);
  const now = new Date().toISOString();

  const photoUuid = generateUUID();

  const id = await db.photos.add({
    uuid: photoUuid,

    activityId: Number(activityId),
    activityUuid,

    /*
     * IndexedDB móvel é muito mais estável com ArrayBuffer do que
     * com Blob/File. O arquivo é reconstruído como Blob somente
     * no momento da visualização/upload.
     */
    file: fileBuffer,

    name:
      file.name ||
      `foto-${photoUuid}.jpg`,

    type:
      optimized?.type ||
      file.type ||
      "image/jpeg",

    storagePath: null,

    synced: false,
    deleted: false,

    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function getPhotosByActivity(activityId) {
  if (!activityId) return [];

  const numericActivityId = Number(activityId);

  let photos = await db.photos
    .where("activityId")
    .equals(numericActivityId)
    .toArray();

  /*
   * Compatibilidade com registros antigos que tenham somente
   * activityUuid.
   */
  if (photos.length === 0) {
    const activity = await db.activities.get(
      numericActivityId
    );

    if (activity?.uuid) {
      photos = await db.photos
        .where("activityUuid")
        .equals(activity.uuid)
        .toArray();
    }
  }

  return photos
    .filter((photo) => !photo.deleted)
    .sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
    );
}

export async function deletePhoto(id) {
  const photo = await db.photos.get(id);

  if (!photo) return;

  await db.photos.update(id, {
    deleted: true,
    synced: false,
    updatedAt: new Date().toISOString(),
  });
}

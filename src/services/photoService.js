import db from "../db";

/* =========================================================
   GERAR UUID
========================================================= */

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

/* =========================================================
   CONVERTER ARQUIVO PARA ARRAYBUFFER
========================================================= */

/*
 * Alguns navegadores móveis são mais consistentes ao guardar
 * um ArrayBuffer no IndexedDB do que um objeto File/Blob inteiro.
 *
 * O nome e o tipo ficam guardados separadamente no registro.
 */

async function fileToArrayBuffer(file) {
  if (file instanceof ArrayBuffer) {
    return file;
  }

  if (ArrayBuffer.isView(file)) {
    return file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength
    );
  }

  if (!(file instanceof Blob)) {
    throw new Error("Arquivo de imagem inválido.");
  }

  return await file.arrayBuffer();
}

/* =========================================================
   OTIMIZAR IMAGEM
========================================================= */

/*
 * Reduz fotos grandes antes de armazená-las offline.
 *
 * Isso diminui:
 * - espaço usado no IndexedDB;
 * - tamanho dos uploads;
 * - consumo de internet no celular;
 * - tempo de geração dos relatórios.
 */

async function optimizeImage(file) {
  if (!(file instanceof Blob)) {
    return file;
  }

  const type = file.type || "";

  if (!type.startsWith("image/")) {
    return file;
  }

  /*
   * SVG e GIF não são convertidos para JPEG porque isso poderia
   * alterar o comportamento desses formatos.
   */
  if (type === "image/svg+xml" || type === "image/gif") {
    return file;
  }

  try {
    /*
     * Alguns navegadores podem não possuir createImageBitmap.
     */
    if (typeof createImageBitmap !== "function") {
      return await fileToArrayBuffer(file);
    }

    const bitmap = await createImageBitmap(file);

    const maxSize = 1920;

    const largestDimension = Math.max(
      bitmap.width,
      bitmap.height
    );

    const scale = Math.min(
      1,
      maxSize / largestDimension
    );

    const width = Math.max(
      1,
      Math.round(bitmap.width * scale)
    );

    const height = Math.max(
      1,
      Math.round(bitmap.height * scale)
    );

    /*
     * Se a imagem já for pequena, não precisamos recomprimir.
     */
    if (
      scale === 1 &&
      file.size <= 3 * 1024 * 1024
    ) {
      bitmap.close();

      return await fileToArrayBuffer(file);
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      bitmap.close();

      return await fileToArrayBuffer(file);
    }

    context.drawImage(
      bitmap,
      0,
      0,
      width,
      height
    );

    bitmap.close();

    const compressed = await new Promise((resolve) => {
      canvas.toBlob(
        resolve,
        "image/jpeg",
        0.84
      );
    });

    if (compressed) {
      return await fileToArrayBuffer(compressed);
    }

    return await fileToArrayBuffer(file);
  } catch (error) {
    console.warn(
      "Não foi possível otimizar a imagem. Arquivo original será utilizado.",
      error
    );

    return await fileToArrayBuffer(file);
  }
}

/* =========================================================
   ADICIONAR FOTO
========================================================= */

export async function addPhoto(activityId, file) {
  if (!activityId) {
    throw new Error("Atividade não informada.");
  }

  if (!file) {
    throw new Error("Arquivo de imagem não informado.");
  }

  const numericActivityId = Number(activityId);

  if (!Number.isFinite(numericActivityId)) {
    throw new Error("ID da atividade inválido.");
  }

  const activity = await db.activities.get(
    numericActivityId
  );

  if (!activity) {
    throw new Error("Atividade não encontrada.");
  }

  /*
   * Toda atividade precisa possuir UUID para que a sincronização
   * com o Supabase consiga identificar corretamente a atividade.
   */
  let activityUuid = activity.uuid;

  if (!activityUuid) {
    activityUuid = generateUUID();

    await db.activities.update(
      numericActivityId,
      {
        uuid: activityUuid,
        synced: false,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  /*
   * Otimiza a imagem antes de guardar.
   */
  const optimized = await optimizeImage(file);

  const fileBuffer = await fileToArrayBuffer(
    optimized
  );

  const now = new Date().toISOString();

  const photoUuid = generateUUID();

  /*
   * Se a imagem foi convertida para JPEG, o tipo precisa refletir
   * isso corretamente.
   */
  const originalType = file.type || "";
  const optimizedType =
    optimized instanceof ArrayBuffer ||
    ArrayBuffer.isView(optimized)
      ? (
          originalType === "image/svg+xml" ||
          originalType === "image/gif"
            ? originalType
            : "image/jpeg"
        )
      : optimized?.type ||
        originalType ||
        "image/jpeg";

  const photo = {
    uuid: photoUuid,

    activityId: numericActivityId,

    activityUuid,

    /*
     * Guardamos ArrayBuffer no IndexedDB.
     */
    file: fileBuffer,

    name:
      file.name ||
      `foto-${photoUuid}.jpg`,

    type:
      optimizedType ||
      "image/jpeg",

    /*
     * Enquanto a foto não for enviada para o Supabase,
     * storagePath permanece nulo.
     */
    storagePath: null,

    synced: false,

    deleted: false,

    createdAt: now,

    updatedAt: now,
  };

  const id = await db.photos.add(photo);

  console.log("FOTO SALVA NO BANCO LOCAL:", id);
  console.log("DADOS DA FOTO:", {
    ...photo,
    file: `[ArrayBuffer - ${fileBuffer.byteLength} bytes]`,
  });

  return {
    id,
    ...photo,
  };
}

/* =========================================================
   BUSCAR FOTOS DE UMA ATIVIDADE
========================================================= */

export async function getPhotosByActivity(activityId) {
  if (!activityId) {
    return [];
  }

  const numericActivityId = Number(activityId);

  if (!Number.isFinite(numericActivityId)) {
    return [];
  }

  /*
   * Busca pelo ID local da atividade.
   */
  const byLocalId = await db.photos
    .where("activityId")
    .equals(numericActivityId)
    .toArray();

  /*
   * Compatibilidade com fotos antigas que possuem somente
   * activityUuid.
   */
  let byUuid = [];

  const activity = await db.activities.get(
    numericActivityId
  );

  if (activity?.uuid) {
    byUuid = await db.photos
      .where("activityUuid")
      .equals(activity.uuid)
      .toArray();
  }

  /*
   * Junta os dois resultados sem duplicar fotos.
   */
  const photos = Array.from(
    new Map(
      [...byLocalId, ...byUuid].map((photo) => [
        photo.uuid || String(photo.id),
        photo,
      ])
    ).values()
  );

  /*
   * Não mostramos fotos marcadas como excluídas.
   */
  return photos
    .filter((photo) => photo.deleted !== true)
    .sort((a, b) => {
      const dateA = new Date(
        a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || 0
      ).getTime();

      return dateA - dateB;
    });
}

/* =========================================================
   BUSCAR FOTO POR ID
========================================================= */

export async function getPhotoById(id) {
  if (!id) {
    return null;
  }

  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  return await db.photos.get(numericId);
}

/* =========================================================
   CRIAR BLOB PARA VISUALIZAÇÃO
========================================================= */

/*
 * Converte o ArrayBuffer armazenado no IndexedDB em Blob.
 *
 * Isso é útil para:
 * - <img src="...">
 * - geração de PDF;
 * - visualização offline.
 */

export function photoToBlob(photo) {
  if (!photo?.file) {
    return null;
  }

  try {
    if (photo.file instanceof Blob) {
      return photo.file;
    }

    if (photo.file instanceof ArrayBuffer) {
      return new Blob(
        [photo.file],
        {
          type:
            photo.type ||
            "image/jpeg",
        }
      );
    }

    if (ArrayBuffer.isView(photo.file)) {
      return new Blob(
        [photo.file.buffer],
        {
          type:
            photo.type ||
            "image/jpeg",
        }
      );
    }

    return null;
  } catch (error) {
    console.error(
      "Erro ao reconstruir Blob da foto:",
      error
    );

    return null;
  }
}

/* =========================================================
   CRIAR URL LOCAL DA FOTO
========================================================= */

/*
 * Retorna uma URL temporária para mostrar a foto.
 *
 * IMPORTANTE:
 * Quem chamar esta função deve executar URL.revokeObjectURL()
 * quando não precisar mais da URL.
 */

export function createPhotoObjectURL(photo) {
  const blob = photoToBlob(photo);

  if (!blob) {
    return null;
  }

  try {
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(
      "Erro ao criar URL da foto:",
      error
    );

    return null;
  }
}

/* =========================================================
   EXCLUIR FOTO
========================================================= */

export async function deletePhoto(id) {
  if (!id) {
    throw new Error("ID da foto não informado.");
  }

  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    throw new Error("ID da foto inválido.");
  }

  const photo = await db.photos.get(
    numericId
  );

  if (!photo) {
    console.warn(
      "Foto não encontrada:",
      numericId
    );

    return null;
  }

  const now = new Date().toISOString();

  await db.photos.update(
    numericId,
    {
      deleted: true,
      deletedAt: now,
      synced: false,
      updatedAt: now,
    }
  );

  console.log(
    "FOTO MARCADA COMO EXCLUÍDA:",
    numericId
  );

  return {
    ...photo,
    deleted: true,
    deletedAt: now,
    synced: false,
    updatedAt: now,
  };
}
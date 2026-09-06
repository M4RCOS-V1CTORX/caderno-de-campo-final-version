import db from "../db";

/**
 * Adiciona uma foto vinculada a uma atividade
 */
export async function addPhoto(activityId, file) {
  if (!activityId || !file) {
    throw new Error(
      "Atividade ou arquivo não informado."
    );
  }

  return await db.photos.add({
    activityId: Number(activityId),
    file,
    name: file.name,
    type: file.type,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Busca todas as fotos de uma atividade
 */
export async function getPhotosByActivity(
  activityId
) {
  if (!activityId) {
    return [];
  }

  return await db.photos
    .where("activityId")
    .equals(Number(activityId))
    .sortBy("createdAt");
}

/**
 * Exclui uma foto
 */
export async function deletePhoto(id) {
  return await db.photos.delete(id);
}
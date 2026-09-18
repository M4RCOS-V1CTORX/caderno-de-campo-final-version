import db from "../db";

/* =========================================================
   UTILITÁRIOS
========================================================= */

function toNullableNumber(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function cleanString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeActivityData(activity = {}, options = {}) {
  const {
    preserveCreatedAt = false,
  } = options;

  const data = {
    ...activity,

    propertyId: toNullableNumber(activity.propertyId),

    plotId: toNullableNumber(activity.plotId),

    title: cleanString(activity.title),

    date: activity.date || "",

    location: cleanString(activity.location),

    description: cleanString(activity.description),

    managementType: cleanString(
      activity.managementType
    ),

    managementStatus:
      activity.managementStatus || "",

    /* DATAS DO MANEJO */
    managementPlannedDate:
      activity.managementPlannedDate || "",

    managementCompletedDate:
      activity.managementCompletedDate || "",

    pest: cleanString(activity.pest),

    disease: cleanString(activity.disease),

    product: cleanString(activity.product),

    productId: toNullableNumber(
      activity.productId
    ),

    quantity: cleanString(activity.quantity),

    quantityValue:
      activity.quantityValue !== undefined &&
      activity.quantityValue !== null &&
      activity.quantityValue !== ""
        ? toNullableNumber(activity.quantityValue)
        : null,

    synced: false,
  };

  if (!preserveCreatedAt) {
    data.createdAt =
      activity.createdAt ||
      new Date().toISOString();
  }

  return data;
}

/* =========================================================
   CRIAR ATIVIDADE
========================================================= */

export async function createActivity(activity = {}) {
  const newActivity = normalizeActivityData(
    activity
  );

  const id = await db.activities.add(
    newActivity
  );

  console.log(
    "ATIVIDADE SALVA:",
    id
  );

  console.log(
    "DADOS SALVOS:",
    newActivity
  );

  return {
    id,
    ...newActivity,
  };
}

/* =========================================================
   BUSCAR ATIVIDADES
========================================================= */

export async function getActivities() {
  console.log(
    "LENDO BANCO LOCAL..."
  );

  try {
    // Registros excluídos permanecem no IndexedDB
    // como tombstones para que a exclusão possa
    // ser enviada ao Supabase durante a sincronização.

    const activities =
      await db.activities
        .filter(
          (activity) =>
            activity?.deleted !== true
        )
        .toArray();

    console.log(
      "TOTAL NO BANCO:",
      activities.length
    );

    console.log(
      "DADOS DO BANCO:",
      activities
    );

    return activities.sort(
      (a, b) => {
        const dateA = new Date(
          a?.date ||
            a?.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b?.date ||
            b?.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      }
    );
  } catch (error) {
    console.error(
      "ERRO AO LER ATIVIDADES:",
      error
    );

    throw error;
  }
}

/* =========================================================
   BUSCAR ATIVIDADE POR ID
========================================================= */

export async function getActivityById(id) {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return undefined;
  }

  return await db.activities.get(
    numericId
  );
}

/* =========================================================
   EXCLUIR ATIVIDADE
========================================================= */

export async function deleteActivity(id) {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    throw new Error(
      "ID da atividade inválido."
    );
  }

  const activity =
    await db.activities.get(
      numericId
    );

  if (!activity) {
    throw new Error(
      "Atividade não encontrada."
    );
  }

  console.log(
    "EXCLUINDO ATIVIDADE:",
    numericId
  );

  const now =
    new Date().toISOString();

  /*
    Exclusão lógica:
    o registro continua localmente até a
    sincronização enviar o tombstone ao Supabase.
  */

  await db.activities.update(
    numericId,
    {
      deleted: true,
      deletedAt: now,
      updatedAt: now,
      synced: false,
    }
  );

  /*
    As fotos relacionadas também recebem
    tombstone para que possam ser removidas
    dos demais dispositivos e do Storage
    durante a sincronização.
  */

  const byActivityId =
    await db.photos
      .where("activityId")
      .equals(numericId)
      .toArray();

  const byActivityUuid =
    activity.uuid
      ? await db.photos
          .where("activityUuid")
          .equals(activity.uuid)
          .toArray()
      : [];

  /*
    Remove possíveis duplicidades quando
    a mesma foto possui activityId e activityUuid.
  */

  const photos = Array.from(
    new Map(
      [
        ...byActivityId,
        ...byActivityUuid,
      ].map((photo) => [
        photo.uuid ||
          String(photo.id),
        photo,
      ])
    ).values()
  );

  if (photos.length > 0) {
    await db.transaction(
      "rw",
      db.photos,
      async () => {
        for (const photo of photos) {
          await db.photos.update(
            photo.id,
            {
              deleted: true,
              deletedAt: now,
              updatedAt: now,
              synced: false,
            }
          );
        }
      }
    );
  }

  console.log(
    "ATIVIDADE MARCADA COMO EXCLUÍDA:",
    numericId
  );
}

/* =========================================================
   ATUALIZAR ATIVIDADE
========================================================= */

export async function updateActivity(
  id,
  activity = {}
) {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    throw new Error(
      "ID da atividade inválido."
    );
  }

  console.log(
    "ATUALIZANDO ATIVIDADE:",
    numericId
  );

  const existingActivity =
    await db.activities.get(
      numericId
    );

  if (!existingActivity) {
    throw new Error(
      "Atividade não encontrada."
    );
  }

  const updatedActivity =
    normalizeActivityData(
      activity,
      {
        preserveCreatedAt: true,
      }
    );

  /*
    Mantém o createdAt original caso
    o formulário não o envie novamente.
  */

  if (!updatedActivity.createdAt) {
    updatedActivity.createdAt =
      existingActivity.createdAt ||
      new Date().toISOString();
  }

  /*
    Atualização local precisa voltar
    para a fila de sincronização.
  */

  updatedActivity.synced = false;

  await db.activities.update(
    numericId,
    updatedActivity
  );

  console.log(
    "ATIVIDADE ATUALIZADA COM SUCESSO"
  );

  console.log(
    "DADOS ATUALIZADOS:",
    updatedActivity
  );

  return {
    id: numericId,
    ...updatedActivity,
  };
}
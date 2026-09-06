import db from "../db";

/* =========================================================
   CRIAR ATIVIDADE
========================================================= */

export async function createActivity(activity) {
  const newActivity = {
    ...activity,

    propertyId: activity.propertyId
      ? Number(activity.propertyId)
      : null,

    plotId: activity.plotId
      ? Number(activity.plotId)
      : null,

    title: activity.title?.trim() || "",
    date: activity.date || "",
    location: activity.location?.trim() || "",
    description: activity.description?.trim() || "",

    managementType:
      activity.managementType?.trim() || "",

    managementStatus:
      activity.managementStatus || "",

    /* DATAS DO MANEJO */
    managementPlannedDate:
      activity.managementPlannedDate || "",

    managementCompletedDate:
      activity.managementCompletedDate || "",

    pest:
      activity.pest?.trim() || "",

    disease:
      activity.disease?.trim() || "",

    product:
      activity.product?.trim() || "",

    productId: activity.productId
      ? Number(activity.productId)
      : null,

    quantity:
      activity.quantity?.trim() || "",

    quantityValue:
      activity.quantityValue !== undefined &&
      activity.quantityValue !== null &&
      activity.quantityValue !== ""
        ? Number(activity.quantityValue)
        : null,

    synced: false,

    createdAt: new Date().toISOString(),
  };

  const id = await db.activities.add(newActivity);

  console.log("ATIVIDADE SALVA:", id);
  console.log("DADOS SALVOS:", newActivity);

  return {
    id,
    ...newActivity,
  };
}

/* =========================================================
   BUSCAR ATIVIDADES
========================================================= */

export async function getActivities() {
  console.log("LENDO BANCO LOCAL...");

  const activities = await db.activities.toArray();

  console.log("TOTAL NO BANCO:", activities.length);
  console.log("DADOS DO BANCO:", activities);

  return activities.sort((a, b) => {
    return (
      new Date(b.createdAt) -
      new Date(a.createdAt)
    );
  });
}

/* =========================================================
   BUSCAR ATIVIDADE POR ID
========================================================= */

export async function getActivityById(id) {
  return await db.activities.get(Number(id));
}

/* =========================================================
   EXCLUIR ATIVIDADE
========================================================= */

export async function deleteActivity(id) {
  console.log("EXCLUINDO ATIVIDADE:", id);

  await db.activities.delete(Number(id));

  console.log("ATIVIDADE EXCLUÍDA COM SUCESSO");
}

/* =========================================================
   ATUALIZAR ATIVIDADE
========================================================= */

export async function updateActivity(id, activity) {
  console.log("ATUALIZANDO ATIVIDADE:", id);

  const updatedActivity = {
    ...activity,

    propertyId: activity.propertyId
      ? Number(activity.propertyId)
      : null,

    plotId: activity.plotId
      ? Number(activity.plotId)
      : null,

    title: activity.title?.trim() || "",
    date: activity.date || "",
    location: activity.location?.trim() || "",
    description: activity.description?.trim() || "",

    managementType:
      activity.managementType?.trim() || "",

    managementStatus:
      activity.managementStatus || "",

    /* DATAS DO MANEJO */
    managementPlannedDate:
      activity.managementPlannedDate || "",

    managementCompletedDate:
      activity.managementCompletedDate || "",

    pest:
      activity.pest?.trim() || "",

    disease:
      activity.disease?.trim() || "",

    product:
      activity.product?.trim() || "",

    productId: activity.productId
      ? Number(activity.productId)
      : null,

    quantity:
      activity.quantity?.trim() || "",

    quantityValue:
      activity.quantityValue !== undefined &&
      activity.quantityValue !== null &&
      activity.quantityValue !== ""
        ? Number(activity.quantityValue)
        : null,

    synced: false,
  };

  await db.activities.update(
    Number(id),
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
    id: Number(id),
    ...updatedActivity,
  };
}
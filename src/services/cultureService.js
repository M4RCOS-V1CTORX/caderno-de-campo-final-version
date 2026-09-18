import db from "../db";

// =========================================================
// CRIAR CULTURA
// =========================================================

export async function createCulture(culture) {
  const newCulture = {
    ...culture,

    name: culture.name?.trim() || "",
    variety: culture.variety?.trim() || "",
    cycle: culture.cycle?.trim() || "",
    observations:
      culture.observations?.trim() || "",

    synced: false,

    createdAt: Date.now(),
  };

  const id = await db.cultures.add(newCulture);

  console.log("CULTURA SALVA:", id);

  return {
    id,
    ...newCulture,
  };
}

// =========================================================
// BUSCAR TODAS AS CULTURAS
// =========================================================

export async function getCultures() {
  const cultures = await db.cultures
    .orderBy("createdAt")
    .reverse()
    .toArray();

  return cultures.filter((culture) => culture.deleted !== true);
}

// =========================================================
// BUSCAR CULTURA POR ID
// =========================================================

export async function getCultureById(id) {
  return await db.cultures.get(Number(id));
}

// =========================================================
// ATUALIZAR CULTURA
// =========================================================

export async function updateCulture(id, culture) {
  const updatedCulture = {
    ...culture,

    name: culture.name?.trim() || "",
    variety: culture.variety?.trim() || "",
    cycle: culture.cycle?.trim() || "",
    observations:
      culture.observations?.trim() || "",

    synced: false,
  };

  await db.cultures.update(
    Number(id),
    updatedCulture
  );

  console.log("CULTURA ATUALIZADA:", id);

  return updatedCulture;
}

// =========================================================
// EXCLUIR CULTURA
// =========================================================

export async function deleteCulture(id) {
  const numericId = Number(id);
  const existing = await db.cultures.get(numericId);
  if (!existing) return false;

  await db.cultures.update(numericId, {
    deleted: true,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: false,
  });

  console.log("CULTURA EXCLUÍDA:", id);
  return true;
}
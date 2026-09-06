import db from "../db";

/* =========================================================
   CRIAR PRAGA
========================================================= */

export async function createPest(pest) {
  const newPest = {
    name: pest.name?.trim() || "",
    description:
      pest.description?.trim() || "",
    synced: false,
    createdAt: Date.now(),
  };

  const id = await db.pests.add(newPest);

  return {
    id,
    ...newPest,
  };
}

/* =========================================================
   BUSCAR PRAGAS
========================================================= */

export async function getPests() {
  return await db.pests
    .orderBy("createdAt")
    .reverse()
    .toArray();
}

/* =========================================================
   BUSCAR PRAGA POR ID
========================================================= */

export async function getPestById(id) {
  return await db.pests.get(Number(id));
}

/* =========================================================
   ATUALIZAR PRAGA
========================================================= */

export async function updatePest(id, pest) {
  return await db.pests.update(Number(id), {
    name: pest.name?.trim() || "",
    description:
      pest.description?.trim() || "",
    synced: false,
  });
}

/* =========================================================
   EXCLUIR PRAGA
========================================================= */

export async function deletePest(id) {
  return await db.pests.delete(Number(id));
}
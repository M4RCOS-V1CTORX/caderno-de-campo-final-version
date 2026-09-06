import db from "../db";

/* =========================================================
   CRIAR DOENÇA
========================================================= */

export async function createDisease(disease) {
  const newDisease = {
    name: disease.name?.trim() || "",
    description:
      disease.description?.trim() || "",
    synced: false,
    createdAt: Date.now(),
  };

  const id = await db.diseases.add(newDisease);

  return {
    id,
    ...newDisease,
  };
}

/* =========================================================
   BUSCAR DOENÇAS
========================================================= */

export async function getDiseases() {
  return await db.diseases
    .orderBy("createdAt")
    .reverse()
    .toArray();
}

/* =========================================================
   BUSCAR DOENÇA POR ID
========================================================= */

export async function getDiseaseById(id) {
  return await db.diseases.get(Number(id));
}

/* =========================================================
   ATUALIZAR DOENÇA
========================================================= */

export async function updateDisease(
  id,
  disease
) {
  return await db.diseases.update(
    Number(id),
    {
      name: disease.name?.trim() || "",
      description:
        disease.description?.trim() || "",
      synced: false,
    }
  );
}

/* =========================================================
   EXCLUIR DOENÇA
========================================================= */

export async function deleteDisease(id) {
  return await db.diseases.delete(Number(id));
}
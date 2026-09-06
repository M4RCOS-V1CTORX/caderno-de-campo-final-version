
import db from "../db";

/* =========================================================
   CRIAR PROPRIEDADE
========================================================= */

export async function createProperty(property) {
  const newProperty = {
    ...property,
    synced: false,
    createdAt: Date.now(),
  };

  const id = await db.properties.add(newProperty);

  return {
    id,
    ...newProperty,
  };
}

/* =========================================================
   BUSCAR TODAS AS PROPRIEDADES
========================================================= */

export async function getProperties() {
  return await db.properties
    .orderBy("createdAt")
    .reverse()
    .toArray();
}

/* =========================================================
   BUSCAR PROPRIEDADE POR ID
========================================================= */

export async function getPropertyById(id) {
  return await db.properties.get(Number(id));
}

/* =========================================================
   ATUALIZAR PROPRIEDADE
========================================================= */

export async function updateProperty(id, property) {
  return await db.properties.update(Number(id), {
    ...property,
    synced: false,
  });
}

/* =========================================================
   EXCLUIR PROPRIEDADE
========================================================= */

export async function deleteProperty(id) {
  return await db.properties.delete(Number(id));
}


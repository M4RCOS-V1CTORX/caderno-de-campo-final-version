
import db from "../db";

/* =========================================================
   CRIAR ITEM NA BIBLIOTECA
========================================================= */

export async function createLibraryItem(item) {
  const newItem = {
    ...item,
    name: item.name?.trim() || "",
    type: item.type || "",
    description: item.description?.trim() || "",
    unit: item.unit?.trim() || "",
    synced: false,
    createdAt: Date.now(),
  };

  const id = await db.library.add(newItem);

  return {
    id,
    ...newItem,
  };
}

/* =========================================================
   BUSCAR TODOS OS ITENS
========================================================= */

export async function getLibraryItems() {
  return await db.library
    .orderBy("createdAt")
    .reverse()
    .toArray();
}

/* =========================================================
   BUSCAR ITENS POR TIPO
========================================================= */

export async function getLibraryItemsByType(type) {
  return await db.library
    .where("type")
    .equals(type)
    .sortBy("createdAt")
    .then((items) => items.reverse());
}

/* =========================================================
   BUSCAR ITEM POR ID
========================================================= */

export async function getLibraryItemById(id) {
  return await db.library.get(Number(id));
}

/* =========================================================
   ATUALIZAR ITEM
========================================================= */

export async function updateLibraryItem(id, item) {
  return await db.library.update(Number(id), {
    ...item,
    name: item.name?.trim() || "",
    type: item.type || "",
    description: item.description?.trim() || "",
    unit: item.unit?.trim() || "",
    synced: false,
  });
}

/* =========================================================
   EXCLUIR ITEM
========================================================= */

export async function deleteLibraryItem(id) {
  return await db.library.delete(Number(id));
}

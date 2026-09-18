import db from "../db";

/* =========================================================
   CRIAR TALHÃO
========================================================= */

export async function createPlot(plot) {
  const newPlot = {
    ...plot,
    propertyId: Number(plot.propertyId),
    synced: false,
    createdAt: Date.now(),
  };

  const id = await db.plots.add(newPlot);

  return {
    id,
    ...newPlot,
  };
}

/* =========================================================
   BUSCAR TODOS OS TALHÕES
========================================================= */

export async function getPlots() {
  return await db.plots
    .orderBy("createdAt")
    .reverse()
    .toArray()
    .then((items) => items.filter((item) => item.deleted !== true));
}

/* =========================================================
   BUSCAR TALHÕES DE UMA PROPRIEDADE
========================================================= */

export async function getPlotsByProperty(propertyId) {
  const plots = await db.plots
    .where("propertyId")
    .equals(Number(propertyId))
    .sortBy("createdAt");

  return plots.filter((plot) => plot.deleted !== true).reverse();
}

/* =========================================================
   BUSCAR TALHÃO POR ID
========================================================= */

export async function getPlotById(id) {
  return await db.plots.get(Number(id));
}

/* =========================================================
   ATUALIZAR TALHÃO
========================================================= */

export async function updatePlot(id, plot) {
  return await db.plots.update(Number(id), {
    ...plot,
    propertyId: Number(plot.propertyId),
    synced: false,
  });
}

/* =========================================================
   EXCLUIR TALHÃO
========================================================= */

export async function deletePlot(id) {
  const numericId = Number(id);
  const existing = await db.plots.get(numericId);
  if (!existing) return false;

  await db.plots.update(numericId, {
    deleted: true,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: false,
  });

  return true;
}
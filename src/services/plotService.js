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
    .toArray();
}

/* =========================================================
   BUSCAR TALHÕES DE UMA PROPRIEDADE
========================================================= */

export async function getPlotsByProperty(propertyId) {
  const plots = await db.plots
    .where("propertyId")
    .equals(Number(propertyId))
    .sortBy("createdAt");

  return plots.reverse();
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
  return await db.plots.delete(Number(id));
}
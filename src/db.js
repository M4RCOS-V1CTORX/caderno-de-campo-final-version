import Dexie from "dexie";

const db = new Dexie("CadernoDeCampo");

/*
=========================================================
  VERSÃO 1 — ESTRUTURA INICIAL
=========================================================
*/

db.version(1).stores({
  activities:
    "++id, title, date, location, synced, createdAt",

  properties:
    "++id, name, owner, city, state, synced, createdAt",

  plots:
    "++id, propertyId, name, culture, soil, area, synced, createdAt",

  photos:
    "++id, activityId, createdAt",
});

/*
=========================================================
  VERSÃO 2 — RELAÇÃO ATIVIDADE / PROPRIEDADE / TALHÃO
=========================================================
*/

db.version(2).stores({
  activities:
    "++id, propertyId, plotId, title, date, location, synced, createdAt",

  properties:
    "++id, name, owner, city, state, synced, createdAt",

  plots:
    "++id, propertyId, name, culture, soil, area, synced, createdAt",

  photos:
    "++id, activityId, createdAt",
});

/*
=========================================================
  VERSÃO 3 — PRODUTOS
=========================================================
*/

db.version(3).stores({
  activities:
    "++id, propertyId, plotId, title, date, location, synced, createdAt",

  properties:
    "++id, name, owner, city, state, synced, createdAt",

  plots:
    "++id, propertyId, name, culture, soil, area, synced, createdAt",

  photos:
    "++id, activityId, createdAt",

  products:
    "++id, name, type, unit, synced, createdAt",
});

/*
=========================================================
  VERSÃO 4 — BIBLIOTECA
=========================================================
*/

db.version(4).stores({
  activities:
    "++id, propertyId, plotId, title, date, location, synced, createdAt",

  properties:
    "++id, name, owner, city, state, synced, createdAt",

  plots:
    "++id, propertyId, name, culture, soil, area, synced, createdAt",

  photos:
    "++id, activityId, createdAt",

  products:
    "++id, name, type, unit, synced, createdAt",

  library:
    "++id, name, type, description, unit, synced, createdAt",

  pests:
    "++id, name, type, description, synced, createdAt",

  diseases:
    "++id, name, type, description, synced, createdAt",
});

/*
=========================================================
  VERSÃO 5 — CULTURAS
=========================================================
*/

db.version(5).stores({
  activities:
    "++id, propertyId, plotId, title, date, location, synced, createdAt",

  properties:
    "++id, name, owner, city, state, synced, createdAt",

  plots:
    "++id, propertyId, name, culture, soil, area, synced, createdAt",

  photos:
    "++id, activityId, createdAt",

  products:
    "++id, name, type, unit, synced, createdAt",

  pests:
    "++id, name, type, description, synced, createdAt",

  diseases:
    "++id, name, type, description, synced, createdAt",

  cultures:
    "++id, name, scientificName, description, synced, createdAt",
});

/*
=========================================================
  VERSÃO 6 — PEDIDOS
=========================================================
*/

db.version(6).stores({
  activities:
    "++id, propertyId, plotId, title, date, location, synced, createdAt",

  properties:
    "++id, name, owner, city, state, synced, createdAt",

  plots:
    "++id, propertyId, name, culture, soil, area, synced, createdAt",

  photos:
    "++id, activityId, createdAt",

  products:
    "++id, name, type, unit, synced, createdAt",

  library:
    "++id, name, type, description, unit, synced, createdAt",

  pests:
    "++id, name, type, description, synced, createdAt",

  diseases:
    "++id, name, type, description, synced, createdAt",

  cultures:
    "++id, name, scientificName, description, synced, createdAt",

  orders:
    "++id, customer, date, status, total, synced, createdAt",
});

export default db;
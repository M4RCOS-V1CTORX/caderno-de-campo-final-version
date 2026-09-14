
import Dexie from "dexie";

/**
 * =========================================================
 * BANCO LOCAL — CADERNO DE CAMPO
 * =========================================================
 *
 * Estrutura limpa preparada para:
 *
 * ✅ Funcionamento offline
 * ✅ IndexedDB
 * ✅ Sincronização PC ↔ Celular
 * ✅ UUID universal
 * ✅ Supabase
 * ✅ Fotos no Supabase Storage
 * ✅ Fotos vinculadas corretamente às atividades
 *
 * IMPORTANTE:
 *
 * activityId
 * → ID LOCAL do dispositivo
 *
 * activityUuid
 * → UUID UNIVERSAL usado para sincronização
 *
 * Cada dispositivo pode possuir IDs diferentes,
 * mas o UUID identifica o mesmo registro.
 *
 * =========================================================
 */

const db = new Dexie("CadernoDeCampo");

/**
 * =========================================================
 * VERSÃO ATUAL DO BANCO
 * =========================================================
 *
 * Como você não precisa manter os dados antigos,
 * estamos utilizando uma estrutura única e limpa.
 */

db.version(4).stores({
  /**
   * =========================================================
   * ATIVIDADES
   * =========================================================
   */

  activities:
    "++id, uuid, propertyId, propertyUuid, plotId, plotUuid, title, date, location, synced, createdAt, updatedAt, deleted",

  /**
   * =========================================================
   * PROPRIEDADES
   * =========================================================
   */

  properties:
    "++id, uuid, name, owner, city, state, synced, createdAt, updatedAt, deleted",

  /**
   * =========================================================
   * TALHÕES
   * =========================================================
   */

  plots:
    "++id, uuid, propertyId, propertyUuid, name, culture, soil, area, synced, createdAt, updatedAt, deleted",

  /**
   * =========================================================
   * FOTOS
   * =========================================================
   *
   * activityId
   * → ID local da atividade neste dispositivo
   *
   * activityUuid
   * → UUID universal da atividade
   *
   * Isso permite que uma foto criada no PC seja
   * corretamente vinculada à mesma atividade no celular,
   * mesmo que os IDs locais sejam diferentes.
   */

  photos:
    "++id, uuid, activityId, activityUuid, storagePath, createdAt, updatedAt, synced, deleted",

  /**
   * =========================================================
   * PRODUTOS
   * =========================================================
   */

  products:
    "++id, uuid, name, type, unit, synced, createdAt, updatedAt, deleted",

  /**
   * =========================================================
   * BIBLIOTECA
   * =========================================================
   */

  library:
    "++id, uuid, name, type, description, unit, synced, createdAt, updatedAt, deleted",

  /**
   * =========================================================
   * PRAGAS
   * =========================================================
   */

  pests:
    "++id, uuid, name, type, description, synced, createdAt, updatedAt, deleted",

  /**
   * =========================================================
   * DOENÇAS
   * =========================================================
   */

  diseases:
    "++id, uuid, name, type, description, synced, createdAt, updatedAt, deleted",

  /**
   * =========================================================
   * CULTURAS
   * =========================================================
   */

  cultures:
    "++id, uuid, name, scientificName, description, synced, createdAt, updatedAt, deleted",

  /**
   * =========================================================
   * PEDIDOS
   * =========================================================
   */

  orders:
    "++id, uuid, customer, date, status, total, synced, createdAt, updatedAt, deleted",
});


/**
 * =========================================================
 * VERSÃO 6 — MIGRAÇÃO SEGURA PARA MOBILE
 * =========================================================
 *
 * Não fazemos conversões assíncronas de Blob/File dentro do
 * upgrade do IndexedDB. Alguns navegadores móveis encerram a
 * transação enquanto uma Promise de Blob está pendente, deixando
 * o banco em DatabaseClosedError.
 *
 * A conversão das fotos é feita pelo photoService/syncService,
 * fora da migração do banco.
 */
db.version(6).stores({
  activities:
    "++id, uuid, propertyId, propertyUuid, plotId, plotUuid, title, date, location, synced, createdAt, updatedAt, deleted",
  properties:
    "++id, uuid, name, owner, city, state, synced, createdAt, updatedAt, deleted",
  plots:
    "++id, uuid, propertyId, propertyUuid, name, culture, soil, area, synced, createdAt, updatedAt, deleted",
  photos:
    "++id, uuid, activityId, activityUuid, storagePath, createdAt, updatedAt, synced, deleted",
  products:
    "++id, uuid, name, type, unit, synced, createdAt, updatedAt, deleted",
  library:
    "++id, uuid, name, type, description, unit, synced, createdAt, updatedAt, deleted",
  pests:
    "++id, uuid, name, type, description, synced, createdAt, updatedAt, deleted",
  diseases:
    "++id, uuid, name, type, description, synced, createdAt, updatedAt, deleted",
  cultures:
    "++id, uuid, name, scientificName, description, synced, createdAt, updatedAt, deleted",
  orders:
    "++id, uuid, customer, date, status, total, synced, createdAt, updatedAt, deleted",
});

/**
 * =========================================================
 * EXPORTAÇÃO
 * =========================================================
 */

export default db;

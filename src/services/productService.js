import db from "../db";

/* =========================================================
   CRIAR PRODUTO
========================================================= */

export async function createProduct(product) {
  const initialStock = Number(product.stock) || 0;
  const minimumStock = Number(product.minimumStock) || 0;

  const newProduct = {
    ...product,

    name: product.name?.trim() || "",
    type: product.type?.trim() || "",
    unit: product.unit?.trim() || "",
    notes: product.notes?.trim() || "",

    stock: initialStock,
    minimumStock,

    stockMovements:
      initialStock > 0
        ? [
            {
              id: Date.now(),
              type: "entrada",
              quantity: initialStock,
              reason: "Estoque inicial",
              date: new Date().toISOString(),
            },
          ]
        : [],

    synced: false,
    createdAt: Date.now(),
  };

  const id = await db.products.add(newProduct);

  return {
    id,
    ...newProduct,
  };
}

/* =========================================================
   LISTAR PRODUTOS
========================================================= */

export async function getProducts() {
  return await db.products
    .orderBy("createdAt")
    .reverse()
    .toArray();
}

/* =========================================================
   BUSCAR PRODUTO
========================================================= */

export async function getProductById(id) {
  return await db.products.get(Number(id));
}

/* =========================================================
   ATUALIZAR PRODUTO
========================================================= */

export async function updateProduct(id, product) {
  const currentProduct = await db.products.get(Number(id));

  if (!currentProduct) {
    throw new Error("Produto não encontrado.");
  }

  return await db.products.update(Number(id), {
    ...product,

    name: product.name?.trim() || "",
    type: product.type?.trim() || "",
    unit: product.unit?.trim() || "",
    notes: product.notes?.trim() || "",

    /*
      O estoque atual NÃO é alterado pela edição.
    */
    stock: currentProduct.stock ?? 0,

    minimumStock: Number(product.minimumStock) || 0,

    stockMovements:
      currentProduct.stockMovements || [],

    synced: false,
  });
}

/* =========================================================
   EXCLUIR PRODUTO
========================================================= */

export async function deleteProduct(id) {
  return await db.products.delete(Number(id));
}

/* =========================================================
   ENTRADA DE ESTOQUE
========================================================= */

export async function addStock(
  productId,
  quantity,
  reason = "",
  metadata = {}
) {
  const id = Number(productId);
  const amount = Number(quantity);

  if (!amount || amount <= 0) {
    throw new Error("Informe uma quantidade válida.");
  }

  const product = await db.products.get(id);

  if (!product) {
    throw new Error("Produto não encontrado.");
  }

  const currentStock = Number(product.stock) || 0;

  const movement = {
    id: Date.now(),

    type: "entrada",

    quantity: amount,

    reason:
      reason?.trim() || "Entrada de estoque",

    date: new Date().toISOString(),

    /*
      Informações adicionais da origem
      da movimentação.
    */
    ...metadata,
  };

  const movements = [
    ...(product.stockMovements || []),
    movement,
  ];

  await db.products.update(id, {
    stock: currentStock + amount,

    stockMovements: movements,

    synced: false,
  });

  return await db.products.get(id);
}

/* =========================================================
   SAÍDA DE ESTOQUE
========================================================= */

export async function removeStock(
  productId,
  quantity,
  reason = "",
  metadata = {}
) {
  const id = Number(productId);
  const amount = Number(quantity);

  if (!amount || amount <= 0) {
    throw new Error("Informe uma quantidade válida.");
  }

  const product = await db.products.get(id);

  if (!product) {
    throw new Error("Produto não encontrado.");
  }

  const currentStock = Number(product.stock) || 0;

  if (amount > currentStock) {
    throw new Error(
      `Estoque insuficiente. Estoque disponível: ${currentStock} ${
        product.unit || ""
      }.`
    );
  }

  const movement = {
    id: Date.now(),

    type: "saida",

    quantity: amount,

    reason:
      reason?.trim() || "Saída de estoque",

    date: new Date().toISOString(),

    /*
      Informações adicionais da origem
      da movimentação.
    */
    ...metadata,
  };

  const movements = [
    ...(product.stockMovements || []),
    movement,
  ];

  await db.products.update(id, {
    stock: currentStock - amount,

    stockMovements: movements,

    synced: false,
  });

  return await db.products.get(id);
}

/* =========================================================
   HISTÓRICO DE MOVIMENTAÇÕES
========================================================= */

export async function getStockMovements(productId) {
  const product = await db.products.get(
    Number(productId)
  );

  if (!product) {
    return [];
  }

  return [...(product.stockMovements || [])].sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date)
  );
}/* =========================================================
   RESUMO DO ESTOQUE DO PRODUTO
========================================================= */

export async function getStockSummary(productId) {
  const product = await db.products.get(Number(productId));

  if (!product) {
    return null;
  }

  const movements = Array.isArray(product.stockMovements)
    ? product.stockMovements
    : [];

  let totalEntries = 0;
  let totalExits = 0;
  let diaryConsumption = 0;

  movements.forEach((movement) => {
    const quantity = Number(movement.quantity) || 0;

    if (movement.type === "entrada") {
      totalEntries += quantity;
    }

    if (movement.type === "saida") {
      totalExits += quantity;
    }

    if (
      movement.type === "saida" &&
      movement.source === "diario"
    ) {
      diaryConsumption += quantity;
    }
  });

  const lastMovement =
    movements.length > 0
      ? [...movements].sort(
          (a, b) =>
            new Date(b.date) - new Date(a.date)
        )[0]
      : null;

  return {
    productId: product.id,
    productName: product.name || "Produto sem nome",
    unit: product.unit || "un",
    currentStock: Number(product.stock) || 0,
    minimumStock: Number(product.minimumStock) || 0,
    totalEntries,
    totalExits,
    diaryConsumption,
    movementCount: movements.length,
    lastMovement,
  };
}
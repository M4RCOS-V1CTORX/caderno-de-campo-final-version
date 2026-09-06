import db from "../db";

/*
=========================================================
  CRIAR PEDIDO
=========================================================
*/

export async function createOrder(orderData) {
  const now = new Date().toISOString();

  const order = {
    customer: orderData.customer?.trim() || "",
    date: orderData.date || new Date().toISOString().split("T")[0],
    status: orderData.status || "pendente",
    total: Number(orderData.total) || 0,

    items: Array.isArray(orderData.items)
      ? orderData.items
      : [],

    notes: orderData.notes?.trim() || "",

    synced: false,
    createdAt: now,
  };

  const id = await db.orders.add(order);

  return {
    ...order,
    id,
  };
}

/*
=========================================================
  LISTAR TODOS OS PEDIDOS
=========================================================
*/

export async function getOrders() {
  const orders = await db.orders.toArray();

  return orders.sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0);
    const dateB = new Date(b.date || b.createdAt || 0);

    return dateB - dateA;
  });
}

/*
=========================================================
  BUSCAR PEDIDO POR ID
=========================================================
*/

export async function getOrderById(id) {
  if (!id) {
    return null;
  }

  const order = await db.orders.get(Number(id));

  return order || null;
}

/*
=========================================================
  ATUALIZAR PEDIDO
=========================================================
*/

export async function updateOrder(id, orderData) {
  if (!id) {
    throw new Error("ID do pedido não informado.");
  }

  const existingOrder = await db.orders.get(Number(id));

  if (!existingOrder) {
    throw new Error("Pedido não encontrado.");
  }

  const updatedOrder = {
    customer:
      orderData.customer !== undefined
        ? orderData.customer.trim()
        : existingOrder.customer,

    date:
      orderData.date !== undefined
        ? orderData.date
        : existingOrder.date,

    status:
      orderData.status !== undefined
        ? orderData.status
        : existingOrder.status,

    total:
      orderData.total !== undefined
        ? Number(orderData.total) || 0
        : existingOrder.total,

    items:
      Array.isArray(orderData.items)
        ? orderData.items
        : existingOrder.items || [],

    notes:
      orderData.notes !== undefined
        ? orderData.notes.trim()
        : existingOrder.notes || "",

    synced: false,

    createdAt: existingOrder.createdAt || new Date().toISOString(),
  };

  await db.orders.update(Number(id), updatedOrder);

  return {
    ...existingOrder,
    ...updatedOrder,
    id: Number(id),
  };
}

/*
=========================================================
  EXCLUIR PEDIDO
=========================================================
*/

export async function deleteOrder(id) {
  if (!id) {
    throw new Error("ID do pedido não informado.");
  }

  const existingOrder = await db.orders.get(Number(id));

  if (!existingOrder) {
    throw new Error("Pedido não encontrado.");
  }

  await db.orders.delete(Number(id));

  return true;
}

/*
=========================================================
  BUSCAR PEDIDOS POR STATUS
=========================================================
*/

export async function getOrdersByStatus(status) {
  if (!status) {
    return getOrders();
  }

  const orders = await db.orders
    .where("status")
    .equals(status)
    .toArray();

  return orders.sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0);
    const dateB = new Date(b.date || b.createdAt || 0);

    return dateB - dateA;
  });
}

/*
=========================================================
  BUSCAR PEDIDOS POR CLIENTE
=========================================================
*/

export async function searchOrders(searchTerm) {
  const orders = await getOrders();

  const term = String(searchTerm || "")
    .trim()
    .toLowerCase();

  if (!term) {
    return orders;
  }

  return orders.filter((order) => {
    const customer = String(order.customer || "").toLowerCase();

    const notes = String(order.notes || "").toLowerCase();

    const status = String(order.status || "").toLowerCase();

    return (
      customer.includes(term) ||
      notes.includes(term) ||
      status.includes(term) ||
      String(order.id).includes(term)
    );
  });
}

/*
=========================================================
  RESUMO DOS PEDIDOS
=========================================================
*/

export async function getOrdersSummary() {
  const orders = await getOrders();

  const total = orders.length;

  const pending = orders.filter(
    (order) => order.status === "pendente"
  ).length;

  const inProgress = orders.filter(
    (order) => order.status === "em andamento"
  ).length;

  const completed = orders.filter(
    (order) => order.status === "concluido"
  ).length;

  const cancelled = orders.filter(
    (order) => order.status === "cancelado"
  ).length;

  const totalValue = orders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  return {
    total,
    pending,
    inProgress,
    completed,
    cancelled,
    totalValue,
  };
}
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  Package,
  Plus,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  createOrder,
  updateOrder,
} from "../services/orderService";

import {
  getProducts,
  addStock,
  removeStock,
} from "../services/productService";

import "../styles/newOrder.css";

function NewOrder({
  onBack,
  onOrderCreated,
  orderToEdit,
}) {
  const isEditing = Boolean(orderToEdit);

  const [products, setProducts] = useState([]);

  const [customer, setCustomer] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [status, setStatus] = useState("pendente");

  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([]);

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [quantity, setQuantity] = useState("");

  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // CARREGAR PRODUTOS
  // =========================================================

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const data = await getProducts();

        setProducts(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "ERRO AO CARREGAR PRODUTOS:",
          err
        );

        setError(
          "Não foi possível carregar os produtos."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // =========================================================
  // CARREGAR PEDIDO PARA EDIÇÃO
  // =========================================================

  useEffect(() => {
    if (!orderToEdit) {
      setCustomer("");
      setDate(
        new Date().toISOString().split("T")[0]
      );
      setStatus("pendente");
      setNotes("");
      setItems([]);
      return;
    }

    setCustomer(orderToEdit.customer || "");

    setDate(
      orderToEdit.date ||
        new Date().toISOString().split("T")[0]
    );

    setStatus(
      orderToEdit.status || "pendente"
    );

    setNotes(orderToEdit.notes || "");

    setItems(
      Array.isArray(orderToEdit.items)
        ? orderToEdit.items.map((item) => ({
            productId: item.productId,
            name:
              item.name ||
              "Produto sem nome",
            quantity: Number(item.quantity) || 0,
            unit: item.unit || "un",
            price: Number(item.price) || 0,
          }))
        : []
    );

    setSelectedProductId("");
    setQuantity("");
    setPrice("");
    setError("");
  }, [orderToEdit]);

  // =========================================================
  // PRODUTO SELECIONADO
  // =========================================================

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) {
      return null;
    }

    return (
      products.find(
        (product) =>
          Number(product.id) ===
          Number(selectedProductId)
      ) || null
    );
  }, [selectedProductId, products]);

  // =========================================================
  // FORMATAR MOEDA
  // =========================================================

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  // =========================================================
  // TOTAL DO PEDIDO
  // =========================================================

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return (
        sum +
        Number(item.quantity || 0) *
          Number(item.price || 0)
      );
    }, 0);
  }, [items]);

  // =========================================================
  // QUANTIDADE TOTAL DE ITENS
  // =========================================================

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.quantity || 0);
    }, 0);
  }, [items]);

  // =========================================================
  // ESTOQUE DISPONÍVEL PARA EDIÇÃO
  // =========================================================
  //
  // Quando estamos editando um pedido, a quantidade que
  // pertence ao pedido já foi descontada do estoque.
  //
  // Exemplo:
  // Pedido tinha 5 unidades.
  // Estoque atual = 10.
  //
  // Para editar, podemos considerar:
  // 10 + 5 = 15 disponíveis para esse produto.
  //
  // Assim podemos alterar de 5 para até 15.
  // =========================================================

  function getAvailableStockForItem(product) {
    if (!product) {
      return 0;
    }

    if (!isEditing || !orderToEdit) {
      return Number(product.stock || 0);
    }

    const originalItem = (
      Array.isArray(orderToEdit.items)
        ? orderToEdit.items
        : []
    ).find(
      (item) =>
        Number(item.productId) ===
        Number(product.id)
    );

    const originalQuantity = originalItem
      ? Number(originalItem.quantity) || 0
      : 0;

    return (
      Number(product.stock || 0) +
      originalQuantity
    );
  }

  // =========================================================
  // ADICIONAR PRODUTO
  // =========================================================

  function handleAddItem() {
    setError("");

    if (!selectedProduct) {
      setError("Selecione um produto.");
      return;
    }

    const amount = Number(quantity);

    const unitPrice = Number(price);

    if (!amount || amount <= 0) {
      setError(
        "Informe uma quantidade válida."
      );
      return;
    }

    const availableStock =
      getAvailableStockForItem(selectedProduct);

    if (amount > availableStock) {
      setError(
        `Estoque insuficiente. Disponível: ${availableStock} ${
          selectedProduct.unit || ""
        }.`
      );
      return;
    }

    if (
      unitPrice < 0 ||
      Number.isNaN(unitPrice)
    ) {
      setError("Informe um preço válido.");
      return;
    }

    const alreadyAdded = items.find(
      (item) =>
        Number(item.productId) ===
        Number(selectedProduct.id)
    );

    if (alreadyAdded) {
      setError(
        "Esse produto já foi adicionado ao pedido."
      );
      return;
    }

    const newItem = {
      productId: selectedProduct.id,
      name:
        selectedProduct.name ||
        "Produto sem nome",
      quantity: amount,
      unit:
        selectedProduct.unit || "un",
      price: unitPrice,
    };

    setItems((current) => [
      ...current,
      newItem,
    ]);

    setSelectedProductId("");
    setQuantity("");
    setPrice("");
  }

  // =========================================================
  // REMOVER ITEM
  // =========================================================

  function handleRemoveItem(productId) {
    setItems((current) =>
      current.filter(
        (item) =>
          Number(item.productId) !==
          Number(productId)
      )
    );
  }

  // =========================================================
  // ALTERAR QUANTIDADE
  // =========================================================

  function handleQuantityChange(
    productId,
    value
  ) {
    const amount = Number(value);

    setItems((current) =>
      current.map((item) => {
        if (
          Number(item.productId) !==
          Number(productId)
        ) {
          return item;
        }

        return {
          ...item,
          quantity:
            value === ""
              ? ""
              : amount,
        };
      })
    );
  }

  // =========================================================
  // ALTERAR PREÇO
  // =========================================================

  function handlePriceChange(
    productId,
    value
  ) {
    const unitPrice = Number(value);

    setItems((current) =>
      current.map((item) => {
        if (
          Number(item.productId) !==
          Number(productId)
        ) {
          return item;
        }

        return {
          ...item,
          price:
            value === ""
              ? ""
              : unitPrice,
        };
      })
    );
  }

  // =========================================================
  // MAPA DOS ITENS ORIGINAIS
  // =========================================================

  function getOriginalItemsMap() {
    const map = new Map();

    if (
      !isEditing ||
      !orderToEdit ||
      !Array.isArray(orderToEdit.items)
    ) {
      return map;
    }

    orderToEdit.items.forEach((item) => {
      map.set(
        Number(item.productId),
        {
          ...item,
          quantity:
            Number(item.quantity) || 0,
        }
      );
    });

    return map;
  }

  // =========================================================
  // AJUSTAR ESTOQUE NA EDIÇÃO
  // =========================================================

  async function adjustStockForEdit() {
    const originalItems =
      getOriginalItemsMap();

    const currentItemsMap = new Map();

    items.forEach((item) => {
      currentItemsMap.set(
        Number(item.productId),
        {
          ...item,
          quantity:
            Number(item.quantity) || 0,
        }
      );
    });

    const stockOperations = [];

    // -------------------------------------------------------
    // DEVOLVER PRODUTOS REMOVIDOS OU REDUZIDOS
    // -------------------------------------------------------

    for (const [
      productId,
      originalItem,
    ] of originalItems.entries()) {
      const currentItem =
        currentItemsMap.get(productId);

      const originalQuantity =
        Number(
          originalItem.quantity
        ) || 0;

      const currentQuantity =
        currentItem
          ? Number(currentItem.quantity) || 0
          : 0;

      if (
        currentQuantity <
        originalQuantity
      ) {
        const quantityToReturn =
          originalQuantity -
          currentQuantity;

        const product =
          products.find(
            (item) =>
              Number(item.id) ===
              Number(productId)
          );

        if (!product) {
          throw new Error(
            `O produto "${originalItem.name}" não foi encontrado.`
          );
        }

        await addStock(
          productId,
          quantityToReturn,
          `Ajuste do pedido #${orderToEdit.id}`,
          {
            source: "pedido-edicao",
            orderId: orderToEdit.id,
            customer:
              customer.trim(),
          }
        );

        stockOperations.push({
          type: "entrada",
          productId,
          quantity:
            quantityToReturn,
        });
      }
    }

    // -------------------------------------------------------
    // DESCONTAR PRODUTOS NOVOS OU AUMENTADOS
    // -------------------------------------------------------

    for (const [
      productId,
      currentItem,
    ] of currentItemsMap.entries()) {
      const originalItem =
        originalItems.get(productId);

      const originalQuantity =
        originalItem
          ? Number(
              originalItem.quantity
            ) || 0
          : 0;

      const currentQuantity =
        Number(
          currentItem.quantity
        ) || 0;

      if (
        currentQuantity >
        originalQuantity
      ) {
        const quantityToRemove =
          currentQuantity -
          originalQuantity;

        const product =
          products.find(
            (item) =>
              Number(item.id) ===
              Number(productId)
          );

        if (!product) {
          throw new Error(
            `O produto "${currentItem.name}" não foi encontrado.`
          );
        }

        await removeStock(
          productId,
          quantityToRemove,
          `Ajuste do pedido #${orderToEdit.id}`,
          {
            source: "pedido-edicao",
            orderId: orderToEdit.id,
            customer:
              customer.trim(),
          }
        );

        stockOperations.push({
          type: "saida",
          productId,
          quantity:
            quantityToRemove,
        });
      }
    }

    return stockOperations;
  }

  // =========================================================
  // DESFAZER AJUSTES DE ESTOQUE
  // =========================================================

  async function rollbackStockOperations(
    operations
  ) {
    for (
      let index =
        operations.length - 1;
      index >= 0;
      index--
    ) {
      const operation =
        operations[index];

      try {
        if (
          operation.type ===
          "entrada"
        ) {
          await removeStock(
            operation.productId,
            operation.quantity,
            `Estorno do ajuste do pedido #${orderToEdit?.id}`,
            {
              source:
                "pedido-edicao-estorno",
              orderId:
                orderToEdit?.id,
            }
          );
        }

        if (
          operation.type ===
          "saida"
        ) {
          await addStock(
            operation.productId,
            operation.quantity,
            `Estorno do ajuste do pedido #${orderToEdit?.id}`,
            {
              source:
                "pedido-edicao-estorno",
              orderId:
                orderToEdit?.id,
            }
          );
        }
      } catch (rollbackError) {
        console.error(
          "ERRO AO REVERTER ESTOQUE:",
          rollbackError
        );
      }
    }
  }

  // =========================================================
  // VALIDAR ITENS
  // =========================================================

  function validateItems() {
    for (const item of items) {
      const amount =
        Number(item.quantity);

      const unitPrice =
        Number(item.price);

      if (!amount || amount <= 0) {
        return `Informe uma quantidade válida para ${item.name}.`;
      }

      if (
        unitPrice < 0 ||
        Number.isNaN(unitPrice)
      ) {
        return `Informe um preço válido para ${item.name}.`;
      }

      const product =
        products.find(
          (product) =>
            Number(product.id) ===
            Number(item.productId)
        );

      if (!product) {
        return `O produto "${item.name}" não foi encontrado.`;
      }

      const availableStock =
        getAvailableStockForItem(
          product
        );

      if (
        amount >
        availableStock
      ) {
        return `Estoque insuficiente para ${item.name}. Disponível: ${availableStock} ${
          product.unit || ""
        }.`;
      }
    }

    return "";
  }

  // =========================================================
  // SALVAR PEDIDO
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!customer.trim()) {
      setError(
        "Informe o nome do cliente."
      );
      return;
    }

    if (!date) {
      setError(
        "Informe a data do pedido."
      );
      return;
    }

    if (items.length === 0) {
      setError(
        "Adicione pelo menos um produto ao pedido."
      );
      return;
    }

    const validationError =
      validateItems();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // NOVO PEDIDO
      // =====================================================

      if (!isEditing) {
        const order =
          await createOrder({
            customer:
              customer.trim(),
            date,
            status,
            total,
            items,
            notes:
              notes.trim(),
          });

        for (const item of items) {
          await removeStock(
            item.productId,
            item.quantity,
            `Pedido #${order.id}`,
            {
              source: "pedido",
              orderId: order.id,
              customer:
                customer.trim(),
            }
          );
        }

        if (onOrderCreated) {
          onOrderCreated(order);
        }

        if (onBack) {
          onBack();
        }

        return;
      }

      // =====================================================
      // EDITAR PEDIDO
      // =====================================================

      const stockOperations =
        await adjustStockForEdit();

      try {
        const updatedOrder =
          await updateOrder(
            orderToEdit.id,
            {
              customer:
                customer.trim(),
              date,
              status,
              total,
              items,
              notes:
                notes.trim(),
            }
          );

        if (onOrderCreated) {
          onOrderCreated(
            updatedOrder
          );
        }

        if (onBack) {
          onBack();
        }
      } catch (updateError) {
        // Se a atualização do pedido falhar,
        // tentamos devolver o estoque ao
        // estado anterior.

        await rollbackStockOperations(
          stockOperations
        );

        throw updateError;
      }
    } catch (err) {
      console.error(
        "ERRO AO SALVAR PEDIDO:",
        err
      );

      setError(
        err?.message ||
          "Não foi possível salvar o pedido."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // CANCELAR
  // =========================================================

  function handleCancel() {
    if (saving) {
      return;
    }

    if (onBack) {
      onBack();
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="new-order-page">
      <div className="new-order-container">

        {/* ===================================================
            VOLTAR
        ==================================================== */}

        <button
          type="button"
          className="new-order-back-button"
          onClick={handleCancel}
          disabled={saving}
        >
          <ArrowLeft size={17} />
          Voltar para Pedidos
        </button>

        {/* ===================================================
            CABEÇALHO
        ==================================================== */}

        <header className="new-order-header">
          <div>
            <span className="new-order-eyebrow">
              PEDIDOS
            </span>

            <h1>
              {isEditing
                ? `Editar Pedido #${orderToEdit?.id || ""}`
                : "Novo Pedido"}
            </h1>

            <p>
              {isEditing
                ? "Atualize os dados do pedido e ajuste automaticamente o estoque."
                : "Registre um novo pedido e acompanhe automaticamente os produtos utilizados."}
            </p>
          </div>
        </header>

        {/* ===================================================
            ERRO
        ==================================================== */}

        {error && (
          <div className="new-order-error">
            <X size={18} />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form
          className="new-order-content"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              DADOS DO PEDIDO
          ================================================== */}

          <section className="new-order-section">

            <div className="new-order-section-heading">
              <div className="new-order-section-icon">
                <FileIcon />
              </div>

              <div>
                <span>
                  INFORMAÇÕES
                </span>

                <h2>
                  Dados do pedido
                </h2>
              </div>
            </div>

            <div className="new-order-fields">

              {/* CLIENTE */}

              <div className="new-order-field new-order-field-full">
                <label htmlFor="customer">
                  Cliente
                </label>

                <div className="new-order-input-icon">
                  <UserRound size={17} />

                  <input
                    id="customer"
                    type="text"
                    value={customer}
                    onChange={(event) =>
                      setCustomer(
                        event.target.value
                      )
                    }
                    placeholder="Nome do cliente"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* DATA */}

              <div className="new-order-field">
                <label htmlFor="date">
                  Data
                </label>

                <div className="new-order-input-icon">
                  <CalendarDays size={17} />

                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              {/* STATUS */}

              <div className="new-order-field">
                <label htmlFor="status">
                  Status
                </label>

                <div className="new-order-select-icon">
                  <select
                    id="status"
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value
                      )
                    }
                    disabled={saving}
                  >
                    <option value="pendente">
                      Pendente
                    </option>

                    <option value="em andamento">
                      Em andamento
                    </option>

                    <option value="concluido">
                      Concluído
                    </option>

                    <option value="cancelado">
                      Cancelado
                    </option>
                  </select>
                </div>
              </div>

            </div>
          </section>

          {/* =================================================
              PRODUTOS
          ================================================== */}

          <section className="new-order-section">

            <div className="new-order-section-heading">
              <div className="new-order-section-icon">
                <Package size={19} />
              </div>

              <div>
                <span>
                  PRODUTOS
                </span>

                <h2>
                  Itens do pedido
                </h2>
              </div>
            </div>

            {/* ADICIONAR PRODUTO */}

            <div className="new-order-add-product">

              <div className="new-order-field">
                <label htmlFor="product">
                  Produto
                </label>

                <div className="new-order-select-icon">
                  <Package size={17} />

                  <select
                    id="product"
                    value={selectedProductId}
                    onChange={(event) =>
                      setSelectedProductId(
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      loading
                    }
                  >
                    <option value="">
                      {loading
                        ? "Carregando produtos..."
                        : "Selecione um produto"}
                    </option>

                    {products.map(
                      (product) => {
                        const alreadyAdded =
                          items.some(
                            (item) =>
                              Number(
                                item.productId
                              ) ===
                              Number(
                                product.id
                              )
                          );

                        const availableStock =
                          getAvailableStockForItem(
                            product
                          );

                        return (
                          <option
                            key={
                              product.id
                            }
                            value={
                              product.id
                            }
                            disabled={
                              alreadyAdded
                            }
                          >
                            {product.name} — estoque:{" "}
                            {availableStock}{" "}
                            {product.unit ||
                              "un"}
                          </option>
                        );
                      }
                    )}
                  </select>
                </div>
              </div>

              <div className="new-order-field new-order-quantity-field">
                <label htmlFor="quantity">
                  Quantidade
                </label>

                <input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      event.target.value
                    )
                  }
                  placeholder="0"
                  disabled={
                    saving ||
                    !selectedProduct
                  }
                />

                {selectedProduct && (
                  <small>
                    Disponível:{" "}
                    {
                      getAvailableStockForItem(
                        selectedProduct
                      )
                    }{" "}
                    {selectedProduct.unit ||
                      "un"}
                  </small>
                )}
              </div>

              <div className="new-order-field new-order-price-field">
                <label htmlFor="price">
                  Preço unitário
                </label>

                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) =>
                    setPrice(
                      event.target.value
                    )
                  }
                  placeholder="0,00"
                  disabled={
                    saving ||
                    !selectedProduct
                  }
                />
              </div>

              <button
                type="button"
                className="new-order-add-button"
                onClick={
                  handleAddItem
                }
                disabled={
                  saving ||
                  loading ||
                  !selectedProduct
                }
              >
                <Plus size={17} />
                Adicionar
              </button>

            </div>

            {/* LISTA */}

            {items.length > 0 ? (
              <div className="new-order-items">

                <div className="new-order-items-header">
                  <span>
                    Produto
                  </span>

                  <span>
                    Quantidade
                  </span>

                  <span>
                    Preço
                  </span>

                  <span>
                    Total
                  </span>

                  <span></span>
                </div>

                {items.map((item) => {
                  const itemTotal =
                    Number(
                      item.quantity || 0
                    ) *
                    Number(
                      item.price || 0
                    );

                  return (
                    <div
                      className="new-order-item"
                      key={
                        item.productId
                      }
                    >

                      <div className="new-order-item-product">

                        <div className="new-order-item-icon">
                          <Package
                            size={17}
                          />
                        </div>

                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.unit ||
                              "un"}
                          </span>
                        </div>

                      </div>

                      <div className="new-order-item-input">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={
                            item.quantity
                          }
                          onChange={(
                            event
                          ) =>
                            handleQuantityChange(
                              item.productId,
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            saving
                          }
                        />
                      </div>

                      <div className="new-order-item-input">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            item.price
                          }
                          onChange={(
                            event
                          ) =>
                            handlePriceChange(
                              item.productId,
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            saving
                          }
                        />
                      </div>

                      <strong className="new-order-item-total">
                        {formatCurrency(
                          itemTotal
                        )}
                      </strong>

                      <button
                        type="button"
                        className="new-order-remove-button"
                        onClick={() =>
                          handleRemoveItem(
                            item.productId
                          )
                        }
                        disabled={
                          saving
                        }
                        title="Remover produto"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>

                    </div>
                  );
                })}

              </div>
            ) : (
              <div className="new-order-items-empty">

                <Package size={22} />

                <div>
                  <strong>
                    Nenhum produto adicionado
                  </strong>

                  <span>
                    Selecione um produto acima
                    para começar o pedido.
                  </span>
                </div>

              </div>
            )}

          </section>

          {/* =================================================
              OBSERVAÇÕES
          ================================================== */}

          <section className="new-order-section">

            <div className="new-order-section-heading">

              <div className="new-order-section-icon">
                <FileIcon />
              </div>

              <div>
                <span>
                  OBSERVAÇÕES
                </span>

                <h2>
                  Informações adicionais
                </h2>
              </div>

            </div>

            <div className="new-order-field">

              <label htmlFor="notes">
                Observações
              </label>

              <textarea
                id="notes"
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                placeholder="Adicione alguma observação sobre este pedido..."
                rows={5}
                disabled={saving}
              />

            </div>

          </section>

          {/* =================================================
              RESUMO
          ================================================== */}

          <section className="new-order-summary">

            <div className="new-order-summary-info">

              <div>
                <span>
                  ITENS
                </span>

                <strong>
                  {totalQuantity}
                </strong>
              </div>

              <div>
                <span>
                  PRODUTOS
                </span>

                <strong>
                  {items.length}
                </strong>
              </div>

            </div>

            <div className="new-order-total">

              <span>
                TOTAL DO PEDIDO
              </span>

              <strong>
                {formatCurrency(total)}
              </strong>

            </div>

          </section>

          {/* =================================================
              AÇÕES
          ================================================== */}

          <div className="new-order-actions">

            <button
              type="button"
              className="new-order-cancel-button"
              onClick={
                handleCancel
              }
              disabled={saving}
            >
              <X size={17} />
              Cancelar
            </button>

            <button
              type="submit"
              className="new-order-save-button"
              disabled={
                saving ||
                items.length === 0
              }
            >
              {saving ? (
                <>
                  <span className="new-order-spinner"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={17} />
                  {isEditing
                    ? "Salvar Alterações"
                    : "Salvar Pedido"}
                </>
              )}
            </button>

          </div>

        </form>

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <footer className="new-order-footer">

          <div>
            <strong>
              CADERNO DE CAMPO
            </strong>

            <span>
              Gestão agrícola inteligente
            </span>
          </div>

          <div>
            <span>
              Responsável técnica
            </span>

            <strong>
              Laís L. Andrade
            </strong>
          </div>

        </footer>

      </div>
    </div>
  );
}

// =============================================================
// ÍCONE AUXILIAR
// =============================================================

function FileIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line
        x1="16"
        y1="13"
        x2="8"
        y2="13"
      />
      <line
        x1="16"
        y1="17"
        x2="8"
        y2="17"
      />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export default NewOrder;
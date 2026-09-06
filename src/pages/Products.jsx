import { useEffect, useState } from "react";

import {
  getProducts,
  deleteProduct,
  addStock,
  removeStock,
} from "../services/productService";

import "../styles/products.css";

function Products({
  onBack,
  onNewProduct,
  onEditProduct,
  onPests,
  onDiseases,
}) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [movementProduct, setMovementProduct] = useState(null);
  const [movementType, setMovementType] = useState("");
  const [movementQuantity, setMovementQuantity] = useState("");
  const [movementReason, setMovementReason] = useState("");
  const [processingMovement, setProcessingMovement] = useState(false);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("ERRO AO CARREGAR PRODUTOS:", error);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o produto "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      await loadProducts();
    } catch (error) {
      console.error("ERRO AO EXCLUIR PRODUTO:", error);

      alert(
        error?.message ||
          "Não foi possível excluir o produto."
      );
    }
  }

  function openMovement(product, type) {
    setMovementProduct(product);
    setMovementType(type);
    setMovementQuantity("");
    setMovementReason("");
  }

  function closeMovement() {
    if (processingMovement) return;

    setMovementProduct(null);
    setMovementType("");
    setMovementQuantity("");
    setMovementReason("");
  }

  async function handleMovementSubmit(event) {
    event.preventDefault();

    if (!movementProduct) return;

    const quantity = Number(movementQuantity);

    if (!quantity || quantity <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    try {
      setProcessingMovement(true);

      if (movementType === "entrada") {
        await addStock(
          movementProduct.id,
          quantity,
          movementReason
        );
      } else {
        await removeStock(
          movementProduct.id,
          quantity,
          movementReason
        );
      }

      await loadProducts();
      closeMovement();
    } catch (error) {
      console.error(
        "ERRO AO REGISTRAR MOVIMENTAÇÃO:",
        error
      );

      alert(
        error?.message ||
          "Não foi possível registrar a movimentação."
      );
    } finally {
      setProcessingMovement(false);
    }
  }

  function getStockStatus(product) {
    const stock = Number(product.stock) || 0;
    const minimum = Number(product.minimumStock) || 0;

    if (stock <= 0) {
      return {
        label: "Esgotado",
        className: "empty",
        icon: "●",
      };
    }

    if (minimum > 0 && stock <= minimum) {
      return {
        label: "Estoque baixo",
        className: "low",
        icon: "●",
      };
    }

    return {
      label: "Normal",
      className: "normal",
      icon: "●",
    };
  }

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    return (
      product.name?.toLowerCase().includes(searchText) ||
      product.type?.toLowerCase().includes(searchText) ||
      product.unit?.toLowerCase().includes(searchText)
    );
  });

  const totalProducts = products.length;

  const normalStock = products.filter(
    (product) =>
      getStockStatus(product).className === "normal"
  ).length;

  const lowStock = products.filter(
    (product) =>
      getStockStatus(product).className === "low"
  ).length;

  const emptyStock = products.filter(
    (product) =>
      getStockStatus(product).className === "empty"
  ).length;

  return (
    <main className="products-page">
      {/* VOLTAR */}
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        ← Voltar
      </button>

      {/* CABEÇALHO */}
      <header className="products-heading">
        <div>
          <span className="products-label">
            BIBLIOTECA
          </span>

          <h1>Biblioteca</h1>

          <p>
            Gerencie produtos, pragas e doenças utilizados
            nos registros de campo.
          </p>
        </div>

        <button
          type="button"
          className="new-product-button"
          onClick={onNewProduct}
        >
          + Novo produto
        </button>
      </header>

      {/* CATEGORIAS */}
      <div className="library-tabs">
        <button
          type="button"
          className="library-tab active"
        >
          <span className="library-tab-icon">🧪</span>

          <span>
            <strong>Produtos</strong>
            <small>
              {totalProducts} cadastrados
            </small>
          </span>
        </button>

        <button
          type="button"
          className="library-tab"
          onClick={onPests}
        >
          <span className="library-tab-icon">🐛</span>

          <span>
            <strong>Pragas</strong>
            <small>Gerenciar pragas</small>
          </span>
        </button>

        <button
          type="button"
          className="library-tab"
          onClick={onDiseases}
        >
          <span className="library-tab-icon">🦠</span>

          <span>
            <strong>Doenças</strong>
            <small>
              Cadastrar e consultar doenças
            </small>
          </span>
        </button>
      </div>

      {/* TÍTULO DA ÁREA */}
      <section className="products-section">
        <div className="products-section-heading">
          <h2>Produtos</h2>

          <p>
            Controle seus produtos e acompanhe o estoque
            disponível.
          </p>
        </div>

        {/* RESUMO DO ESTOQUE */}
        <div className="stock-summary">
          <div className="stock-summary-card">
            <span className="stock-summary-number">
              {totalProducts}
            </span>

            <span className="stock-summary-label">
              Produtos
            </span>
          </div>

          <div className="stock-summary-card">
            <span className="stock-summary-number">
              {normalStock}
            </span>

            <span className="stock-summary-label">
              Estoque normal
            </span>
          </div>

          <div className="stock-summary-card">
            <span className="stock-summary-number">
              {lowStock}
            </span>

            <span className="stock-summary-label">
              Estoque baixo
            </span>
          </div>

          <div className="stock-summary-card">
            <span className="stock-summary-number">
              {emptyStock}
            </span>

            <span className="stock-summary-label">
              Esgotados
            </span>
          </div>
        </div>

        {/* PESQUISA */}
        <div className="products-search">
          <span className="search-icon">🔎</span>

          <input
            type="text"
            placeholder="Pesquisar produto..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {/* LISTA */}
        <div className="products-list">
          {filteredProducts.length === 0 ? (
            <div className="products-empty">
              <div className="products-empty-icon">
                🧪
              </div>

              <h3>
                {search
                  ? "Nenhum produto encontrado"
                  : "Nenhum produto cadastrado"}
              </h3>

              <p>
                {search
                  ? "Tente pesquisar por outro nome, tipo ou unidade."
                  : "Cadastre seu primeiro produto para começar o controle de estoque."}
              </p>

              {!search && (
                <button
                  type="button"
                  className="empty-new-button"
                  onClick={onNewProduct}
                >
                  + Cadastrar produto
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const stock =
                Number(product.stock) || 0;

              const minimum =
                Number(product.minimumStock) || 0;

              const status =
                getStockStatus(product);

              return (
                <article
                  className="product-card"
                  key={product.id}
                >
                  {/* INFORMAÇÕES */}
                  <div className="product-info">
                    <div className="product-icon">
                      🧪
                    </div>

                    <div className="product-details">
                      <h3>
                        {product.name ||
                          "Produto sem nome"}
                      </h3>

                      <div className="product-meta">
                        <span>
                          Tipo:{" "}
                          <strong>
                            {product.type ||
                              "Não informado"}
                          </strong>
                        </span>

                        <span>
                          Unidade:{" "}
                          <strong>
                            {product.unit ||
                              "Não informada"}
                          </strong>
                        </span>
                      </div>

                      {product.notes && (
                        <p className="product-notes">
                          {product.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ESTOQUE */}
                  <div className="product-stock">
                    <div className="stock-title">
                      ESTOQUE DISPONÍVEL
                    </div>

                    <div className="stock-quantity">
                      <strong>{stock}</strong>

                      <span>
                        {product.unit || "un"}
                      </span>
                    </div>

                    <div className="stock-extra">
                      {minimum > 0 ? (
                        <span>
                          Mínimo:{" "}
                          <strong>
                            {minimum}{" "}
                            {product.unit}
                          </strong>
                        </span>
                      ) : (
                        <span>
                          Sem estoque mínimo definido
                        </span>
                      )}
                    </div>

                    <span
                      className={`stock-status ${status.className}`}
                    >
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {/* AÇÕES */}
                  <div className="product-actions">
                    <button
                      type="button"
                      className="stock-button entry"
                      onClick={() =>
                        openMovement(
                          product,
                          "entrada"
                        )
                      }
                    >
                      + Entrada
                    </button>

                    <button
                      type="button"
                      className="stock-button exit"
                      onClick={() =>
                        openMovement(
                          product,
                          "saida"
                        )
                      }
                    >
                      − Saída
                    </button>

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        onEditProduct(product)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(product)
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* MODAL DE MOVIMENTAÇÃO */}
      {movementProduct && (
        <div
          className="stock-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeMovement();
            }
          }}
        >
          <div className="stock-modal">
            <div className="stock-modal-header">
              <div>
                <span className="products-label">
                  ESTOQUE
                </span>

                <h2>
                  {movementType === "entrada"
                    ? "Entrada de estoque"
                    : "Saída de estoque"}
                </h2>

                <p>
                  {movementProduct.name}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeMovement}
                disabled={processingMovement}
              >
                ×
              </button>
            </div>

            <div className="modal-current-stock">
              <span>
                Estoque atual
              </span>

              <strong>
                {Number(
                  movementProduct.stock
                ) || 0}{" "}
                {movementProduct.unit}
              </strong>
            </div>

            <form
              onSubmit={handleMovementSubmit}
              className="stock-movement-form"
            >
              <div className="form-group">
                <label htmlFor="movement-quantity">
                  Quantidade
                </label>

                <input
                  id="movement-quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Ex.: 20"
                  value={movementQuantity}
                  onChange={(event) =>
                    setMovementQuantity(
                      event.target.value
                    )
                  }
                  autoFocus
                  required
                />

                <small>
                  Unidade:{" "}
                  {movementProduct.unit ||
                    "não informada"}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="movement-reason">
                  Motivo / observação
                </label>

                <input
                  id="movement-reason"
                  type="text"
                  placeholder={
                    movementType === "entrada"
                      ? "Ex.: Compra de produto"
                      : "Ex.: Aplicação na lavoura"
                  }
                  value={movementReason}
                  onChange={(event) =>
                    setMovementReason(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="stock-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeMovement}
                  disabled={processingMovement}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={
                    movementType === "entrada"
                      ? "confirm-entry-button"
                      : "confirm-exit-button"
                  }
                  disabled={processingMovement}
                >
                  {processingMovement
                    ? "Salvando..."
                    : movementType === "entrada"
                    ? "Registrar entrada"
                    : "Registrar saída"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Products;
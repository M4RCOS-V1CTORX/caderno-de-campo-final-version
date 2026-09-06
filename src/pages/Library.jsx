import { useEffect, useMemo, useState } from "react";

import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  BarChart3,
  Bug,
  ChevronRight,
  Clock3,
  Database,
  FileText,
  FlaskConical,
  History,
  Leaf,
  Minus,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import {
  getProducts,
  deleteProduct,
  addStock,
  removeStock,
  getStockMovements,
  getStockSummary,
} from "../services/productService";

import "../styles/library.css";

function Library({
  onNewProduct,
  onEditProduct,
  onBack,
  onPests,
  onDiseases,
}) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [movementProduct, setMovementProduct] = useState(null);
  const [movementType, setMovementType] = useState("entrada");
  const [movementQuantity, setMovementQuantity] = useState("");
  const [movementReason, setMovementReason] = useState("");
  const [processingMovement, setProcessingMovement] = useState(false);

  const [historyProduct, setHistoryProduct] = useState(null);
  const [historyMovements, setHistoryMovements] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySummary, setHistorySummary] = useState(null);

  /* =========================================================
     CARREGAR PRODUTOS
  ========================================================= */

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts();

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("ERRO AO CARREGAR PRODUTOS:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* =========================================================
     EXCLUIR
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (error) {
      console.error("ERRO AO EXCLUIR PRODUTO:", error);

      alert("Não foi possível excluir o produto.");
    }
  };

  /* =========================================================
     STATUS DO ESTOQUE
  ========================================================= */

  const getStockStatus = (product) => {
    const stock = Number(product.stock) || 0;
    const minimum = Number(product.minimumStock) || 0;

    if (stock <= 0) {
      return {
        label: "Esgotado",
        className: "empty",
      };
    }

    if (minimum > 0 && stock <= minimum) {
      return {
        label: "Estoque baixo",
        className: "low",
      };
    }

    return {
      label: "Estoque normal",
      className: "normal",
    };
  };

  /* =========================================================
     PESQUISA
  ========================================================= */

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return products;
    }

    return products.filter((product) => {
      return (
        String(product.name || "")
          .toLowerCase()
          .includes(term) ||
        String(product.type || "")
          .toLowerCase()
          .includes(term) ||
        String(product.unit || "")
          .toLowerCase()
          .includes(term)
      );
    });
  }, [products, search]);

  /* =========================================================
     RESUMO
  ========================================================= */

  const stockSummary = useMemo(() => {
    let normal = 0;
    let low = 0;
    let empty = 0;

    products.forEach((product) => {
      const status = getStockStatus(product);

      if (status.className === "normal") {
        normal++;
      } else if (status.className === "low") {
        low++;
      } else {
        empty++;
      }
    });

    return {
      total: products.length,
      normal,
      low,
      empty,
    };
  }, [products]);

  /* =========================================================
     PRODUTOS QUE PRECISAM DE ATENÇÃO
  ========================================================= */

  const attentionProducts = useMemo(() => {
    return products
      .filter((product) => {
        const status = getStockStatus(product);

        return (
          status.className === "low" ||
          status.className === "empty"
        );
      })
      .sort((a, b) => {
        const stockA = Number(a.stock) || 0;
        const stockB = Number(b.stock) || 0;

        return stockA - stockB;
      });
  }, [products]);

  /* =========================================================
     ÚLTIMAS MOVIMENTAÇÕES
  ========================================================= */

  const recentMovements = useMemo(() => {
    const movements = [];

    products.forEach((product) => {
      const productMovements = Array.isArray(
        product.stockMovements
      )
        ? product.stockMovements
        : [];

      productMovements.forEach((movement) => {
        movements.push({
          ...movement,
          productId: product.id,
          productName:
            product.name || "Produto sem nome",
          productUnit: product.unit || "un",
        });
      });
    });

    return movements
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 6);
  }, [products]);

  /* =========================================================
     MOVIMENTAÇÃO
  ========================================================= */

  const openMovement = (product, type) => {
    setMovementProduct(product);
    setMovementType(type);
    setMovementQuantity("");
    setMovementReason("");
    setProcessingMovement(false);
  };

  const closeMovement = () => {
    if (processingMovement) return;

    setMovementProduct(null);
    setMovementQuantity("");
    setMovementReason("");
  };

  const handleMovementSubmit = async (event) => {
    event.preventDefault();

    if (!movementProduct) return;

    const quantity = Number(movementQuantity);

    if (!quantity || quantity <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    try {
      setProcessingMovement(true);

      const reason =
        movementReason.trim() ||
        (movementType === "entrada"
          ? "Entrada de estoque"
          : "Saída de estoque");

      if (movementType === "entrada") {
        await addStock(
          movementProduct.id,
          quantity,
          reason
        );
      } else {
        await removeStock(
          movementProduct.id,
          quantity,
          reason
        );
      }

      await loadProducts();

      setMovementProduct(null);
      setMovementQuantity("");
      setMovementReason("");
    } catch (error) {
      console.error(
        "ERRO AO MOVIMENTAR ESTOQUE:",
        error
      );

      alert(
        error?.message ||
          "Não foi possível atualizar o estoque."
      );
    } finally {
      setProcessingMovement(false);
    }
  };

  /* =========================================================
     HISTÓRICO
  ========================================================= */

  const openHistory = async (product) => {
    try {
      setHistoryProduct(product);
      setHistoryMovements([]);
      setHistorySummary(null);
      setLoadingHistory(true);

      const movements =
        await getStockMovements(product.id);

      const summary =
        await getStockSummary(product.id);

      setHistoryMovements(
        Array.isArray(movements)
          ? movements
          : []
      );

      setHistorySummary(summary);
    } catch (error) {
      console.error(
        "ERRO AO CARREGAR HISTÓRICO:",
        error
      );

      alert(
        "Não foi possível carregar o histórico."
      );

      setHistoryProduct(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeHistory = () => {
    if (loadingHistory) return;

    setHistoryProduct(null);
    setHistoryMovements([]);
    setHistorySummary(null);
  };

  /* =========================================================
     DATA
  ========================================================= */

  const formatMovementDate = (date) => {
    if (!date) {
      return "Data não informada";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Data não informada";
    }

    return parsedDate.toLocaleString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =========================================================
     PERCENTUAL
  ========================================================= */

  const getStockPercentage = (product) => {
    const stock = Number(product.stock) || 0;
    const minimum =
      Number(product.minimumStock) || 0;

    if (minimum <= 0) {
      return stock > 0 ? 100 : 0;
    }

    const percentage =
      (stock / minimum) * 100;

    return Math.min(
      Math.max(percentage, 0),
      100
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="library-page">
      <button
            type="button"
            className="library-back-button"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            Voltar para a Home
          </button>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="library-hero">

        <div className="library-hero-content">

          <div className="library-eyebrow">
            <FlaskConical size={14} />
            BIBLIOTECA DE INSUMOS
          </div>

          <h1>
            Produtos.
            <br />
            Estoque organizado.
          </h1>

          <p>
            Gerencie seus insumos, acompanhe quantidades
            disponíveis e registre cada movimentação.
          </p>

          <div className="library-hero-meta">
            <span>
              <Database size={14} />
              Dados salvos localmente
            </span>

            <span>
              <Package size={14} />
              {stockSummary.total} produtos cadastrados
            </span>
          </div>

        </div>

        <div className="library-hero-side">

          <div className="library-hero-icon">
            <FlaskConical size={32} />
          </div>

          <div>
            <span>RESPONSÁVEL TÉCNICA</span>
            <strong>Laís L. Andrade</strong>
          </div>

        </div>

      </section>

      {/* =====================================================
          CATEGORIAS
      ===================================================== */}

      <section className="library-categories">

        <button
          type="button"
          className="library-category active"
        >
          <div className="library-category-icon">
            <FlaskConical size={19} />
          </div>

          <div>
            <strong>Produtos</strong>
            <span>Insumos e estoque</span>
          </div>

          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          className="library-category"
          onClick={onPests}
        >
          <div className="library-category-icon">
            <Bug size={19} />
          </div>

          <div>
            <strong>Pragas</strong>
            <span>Pragas cadastradas</span>
          </div>

          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          className="library-category"
          onClick={onDiseases}
        >
          <div className="library-category-icon">
            <Leaf size={19} />
          </div>

          <div>
            <strong>Doenças</strong>
            <span>Doenças cadastradas</span>
          </div>

          <ChevronRight size={16} />
        </button>

      </section>

      {/* =====================================================
          RESUMO
      ===================================================== */}

      <section className="stock-summary">

        <div className="stock-summary-card">

          <div className="stock-summary-top">
            <span>PRODUTOS</span>

            <div className="stock-summary-icon">
              <Package size={16} />
            </div>
          </div>

          <strong>{stockSummary.total}</strong>

          <p>cadastrados</p>

        </div>

        <div className="stock-summary-card normal">

          <div className="stock-summary-top">
            <span>NORMAL</span>

            <div className="stock-summary-icon">
              <TrendingUp size={16} />
            </div>
          </div>

          <strong>{stockSummary.normal}</strong>

          <p>estoque adequado</p>

        </div>

        <div className="stock-summary-card low">

          <div className="stock-summary-top">
            <span>ESTOQUE BAIXO</span>

            <div className="stock-summary-icon">
              <TrendingDown size={16} />
            </div>
          </div>

          <strong>{stockSummary.low}</strong>

          <p>atenção necessária</p>

        </div>

        <div className="stock-summary-card empty">

          <div className="stock-summary-top">
            <span>ESGOTADOS</span>

            <div className="stock-summary-icon">
              <Package size={16} />
            </div>
          </div>

          <strong>{stockSummary.empty}</strong>

          <p>sem estoque</p>

        </div>

      </section>

      {/* =====================================================
          ATENÇÃO
      ===================================================== */}

      {!loading &&
        attentionProducts.length > 0 && (
          <section className="stock-dashboard-panel">

            <div className="stock-dashboard-heading">

              <div>
                <span>ATENÇÃO AO ESTOQUE</span>

                <h3>
                  Produtos que precisam de reposição
                </h3>

                <p>
                  Confira os produtos abaixo do estoque
                  mínimo ou já esgotados.
                </p>
              </div>

              <div className="stock-dashboard-count">
                {attentionProducts.length}
              </div>

            </div>

            <div className="stock-attention-list">

              {attentionProducts
                .slice(0, 5)
                .map((product) => {
                  const status =
                    getStockStatus(product);

                  const stock =
                    Number(product.stock) || 0;

                  const minimum =
                    Number(
                      product.minimumStock
                    ) || 0;

                  return (
                    <div
                      className="stock-attention-item"
                      key={product.id}
                    >

                      <div
                        className={`stock-attention-icon ${status.className}`}
                      >
                        {status.className ===
                        "empty" ? (
                          <TrendingDown size={17} />
                        ) : (
                          <TrendingDown size={17} />
                        )}
                      </div>

                      <div className="stock-attention-info">

                        <strong>
                          {product.name ||
                            "Produto sem nome"}
                        </strong>

                        <span>
                          {stock}{" "}
                          {product.unit || "un"}{" "}
                          disponíveis
                        </span>

                      </div>

                      <div className="stock-attention-minimum">

                        <span>Mínimo</span>

                        <strong>
                          {minimum}{" "}
                          {product.unit || "un"}
                        </strong>

                      </div>

                      <span
                        className={`stock-attention-status ${status.className}`}
                      >
                        {status.label}
                      </span>

                      <button
                        type="button"
                        className="stock-attention-action"
                        onClick={() =>
                          openMovement(
                            product,
                            "entrada"
                          )
                        }
                      >
                        <Plus size={14} />
                        Repor
                      </button>

                    </div>
                  );
                })}

            </div>

            {attentionProducts.length > 5 && (
              <div className="stock-dashboard-more">
                + {attentionProducts.length - 5} outros
                produtos precisam de atenção.
              </div>
            )}

          </section>
        )}

      {/* =====================================================
          MOVIMENTAÇÕES
      ===================================================== */}

      {!loading &&
        recentMovements.length > 0 && (
          <section className="stock-dashboard-panel">

            <div className="stock-dashboard-heading">

              <div>
                <span>MOVIMENTAÇÕES</span>

                <h3>
                  Últimas movimentações
                </h3>

                <p>
                  Acompanhe as entradas e saídas mais
                  recentes do estoque.
                </p>
              </div>

              <div className="stock-dashboard-count">
                {recentMovements.length}
              </div>

            </div>

            <div className="recent-movements-list">

              {recentMovements.map(
                (movement, index) => {
                  const isEntry =
                    movement.type === "entrada";

                  return (
                    <div
                      className="recent-movement-item"
                      key={
                        movement.id ||
                        `${movement.date}-${index}`
                      }
                    >

                      <div
                        className={`recent-movement-icon ${
                          isEntry
                            ? "entrada"
                            : "saida"
                        }`}
                      >
                        {isEntry ? (
                          <ArrowDownToLine size={16} />
                        ) : (
                          <ArrowUpFromLine size={16} />
                        )}
                      </div>

                      <div className="recent-movement-main">

                        <div className="recent-movement-top">

                          <strong>
                            {movement.productName}
                          </strong>

                          <span
                            className={`recent-movement-quantity ${
                              isEntry
                                ? "entrada"
                                : "saida"
                            }`}
                          >
                            {isEntry ? "+" : "-"}
                            {Number(
                              movement.quantity
                            )}{" "}
                            {movement.productUnit}
                          </span>

                        </div>

                        <span className="recent-movement-reason">
                          {movement.reason ||
                            "Sem motivo informado"}
                        </span>

                        <small>
                          {formatMovementDate(
                            movement.date
                          )}
                        </small>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>
        )}

      {/* =====================================================
          PRODUTOS
      ===================================================== */}

      <section className="library-content">

        <div className="library-section-heading">

          <div>
            <span>CONTROLE DE INSUMOS</span>

            <h2>Produtos</h2>

            <p>
              Controle a quantidade disponível de cada
              produto.
            </p>
          </div>

          <button
            type="button"
            className="library-primary-button"
            onClick={onNewProduct}
          >
            <Plus size={17} />
            Novo produto
          </button>

        </div>

        <div className="library-search">

          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Pesquisar produto, tipo ou unidade..."
          />

          {search && (
            <button
              type="button"
              className="library-search-clear"
              onClick={() => setSearch("")}
              aria-label="Limpar pesquisa"
            >
              <X size={15} />
            </button>
          )}

        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="library-empty">

            <div className="library-empty-icon">
              <Package size={25} />
            </div>

            <h3>
              Carregando produtos...
            </h3>

            <p>
              Aguarde enquanto carregamos os produtos
              cadastrados.
            </p>

          </div>
        )}

        {/* ===================================================
            VAZIO
        =================================================== */}

        {!loading &&
          filteredProducts.length === 0 && (
            <div className="library-empty">

              <div className="library-empty-icon">
                <FlaskConical size={25} />
              </div>

              <h3>
                {search
                  ? "Nenhum produto encontrado"
                  : "Nenhum produto cadastrado"}
              </h3>

              <p>
                {search
                  ? "Tente pesquisar usando outro nome, tipo ou unidade."
                  : "Cadastre seu primeiro produto para começar a controlar o estoque."}
              </p>

              {!search && (
                <button
                  type="button"
                  className="library-primary-button"
                  onClick={onNewProduct}
                >
                  <Plus size={16} />
                  Cadastrar produto
                </button>
              )}

            </div>
          )}

        {/* ===================================================
            LISTA
        =================================================== */}

        {!loading &&
          filteredProducts.length > 0 && (
            <div className="products-list">

              {filteredProducts.map((product) => {
                const status =
                  getStockStatus(product);

                const stock =
                  Number(product.stock) || 0;

                const minimum =
                  Number(
                    product.minimumStock
                  ) || 0;

                const percentage =
                  getStockPercentage(product);

                return (
                  <article
                    className="product-card"
                    key={product.id}
                  >

                    <div className="product-card-main">

                      <div className="product-card-content">

                        <div className="product-icon">
                          <FlaskConical size={20} />
                        </div>

                        <div className="product-info">

                          <h4>
                            {product.name ||
                              "Produto sem nome"}
                          </h4>

                          <div className="product-details">

                            {product.type && (
                              <span>
                                <strong>Tipo</strong>
                                {product.type}
                              </span>
                            )}

                            {product.unit && (
                              <span>
                                <strong>Unidade</strong>
                                {product.unit}
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                      <div
                        className={`product-stock ${status.className}`}
                      >

                        <span className="product-stock-label">
                          ESTOQUE DISPONÍVEL
                        </span>

                        <div className="product-stock-value">

                          <strong>{stock}</strong>

                          <span>
                            {product.unit || "un"}
                          </span>

                        </div>

                        <div className="product-stock-bar">

                          <div
                            className={`product-stock-bar-fill ${status.className}`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                        <div className="product-stock-meta">

                          <span>
                            Mínimo: {minimum}{" "}
                            {product.unit || "un"}
                          </span>

                          <span
                            className={`stock-status-badge ${status.className}`}
                          >
                            <i />
                            {status.label}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="product-actions">

                      <button
                        type="button"
                        className="stock-entry-button"
                        onClick={() =>
                          openMovement(
                            product,
                            "entrada"
                          )
                        }
                      >
                        <ArrowDownToLine size={15} />
                        Entrada
                      </button>

                      <button
                        type="button"
                        className="stock-exit-button"
                        onClick={() =>
                          openMovement(
                            product,
                            "saida"
                          )
                        }
                      >
                        <ArrowUpFromLine size={15} />
                        Saída
                      </button>

                      <button
                        type="button"
                        className="stock-history-button"
                        onClick={() =>
                          openHistory(product)
                        }
                      >
                        <History size={15} />
                        Histórico
                      </button>

                      <button
                        type="button"
                        className="library-secondary-button"
                        onClick={() =>
                          onEditProduct(product)
                        }
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      <button
                        type="button"
                        className="library-delete-button"
                        onClick={() =>
                          handleDelete(product.id)
                        }
                      >
                        <Trash2 size={15} />
                        Excluir
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </section>

      {/* =====================================================
          MODAL — MOVIMENTAÇÃO
      ===================================================== */}

      {movementProduct && (
        <div
          className="stock-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !processingMovement
            ) {
              closeMovement();
            }
          }}
        >

          <div className="stock-modal">

            <div className="stock-modal-header">

              <div>
                <span>MOVIMENTAÇÃO DE ESTOQUE</span>

                <h3>
                  {movementType === "entrada"
                    ? "Entrada de produto"
                    : "Saída de produto"}
                </h3>
              </div>

              <button
                type="button"
                className="stock-modal-close"
                onClick={closeMovement}
                disabled={processingMovement}
                aria-label="Fechar"
              >
                <X size={19} />
              </button>

            </div>

            <div className="stock-modal-product">

              <div className="stock-modal-product-icon">
                <FlaskConical size={20} />
              </div>

              <div>
                <strong>
                  {movementProduct.name}
                </strong>

                <span>
                  Estoque atual:{" "}
                  {Number(
                    movementProduct.stock
                  ) || 0}{" "}
                  {movementProduct.unit || "un"}
                </span>
              </div>

            </div>

            <form onSubmit={handleMovementSubmit}>

              <div className="stock-type-selector">

                <button
                  type="button"
                  className={
                    movementType === "entrada"
                      ? "active entrada"
                      : ""
                  }
                  onClick={() =>
                    setMovementType("entrada")
                  }
                  disabled={processingMovement}
                >
                  <ArrowDownToLine size={16} />
                  Entrada
                </button>

                <button
                  type="button"
                  className={
                    movementType === "saida"
                      ? "active saida"
                      : ""
                  }
                  onClick={() =>
                    setMovementType("saida")
                  }
                  disabled={processingMovement}
                >
                  <ArrowUpFromLine size={16} />
                  Saída
                </button>

              </div>

              <div className="stock-form-field">

                <label htmlFor="movementQuantity">
                  Quantidade
                </label>

                <div className="stock-quantity-input">

                  <input
                    id="movementQuantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={movementQuantity}
                    onChange={(event) =>
                      setMovementQuantity(
                        event.target.value
                      )
                    }
                    placeholder="0"
                    disabled={processingMovement}
                    autoFocus
                  />

                  <span>
                    {movementProduct.unit || "un"}
                  </span>

                </div>

              </div>

              <div className="stock-form-field">

                <label htmlFor="movementReason">
                  Motivo
                </label>

                <input
                  id="movementReason"
                  type="text"
                  value={movementReason}
                  onChange={(event) =>
                    setMovementReason(
                      event.target.value
                    )
                  }
                  placeholder={
                    movementType === "entrada"
                      ? "Ex.: Compra de insumos"
                      : "Ex.: Aplicação na lavoura"
                  }
                  disabled={processingMovement}
                />

              </div>

              <div className="stock-modal-actions">

                <button
                  type="button"
                  className="stock-cancel-button"
                  onClick={closeMovement}
                  disabled={processingMovement}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={
                    movementType === "entrada"
                      ? "stock-confirm-button entrada"
                      : "stock-confirm-button saida"
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

      {/* =====================================================
          MODAL — HISTÓRICO
      ===================================================== */}

      {historyProduct && (
        <div
          className="stock-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !loadingHistory
            ) {
              closeHistory();
            }
          }}
        >

          <div className="stock-history-modal">

            <div className="stock-modal-header">

              <div>
                <span>HISTÓRICO DE ESTOQUE</span>

                <h3>
                  Movimentações
                </h3>
              </div>

              <button
                type="button"
                className="stock-modal-close"
                onClick={closeHistory}
                disabled={loadingHistory}
                aria-label="Fechar"
              >
                <X size={19} />
              </button>

            </div>

            <div className="history-product-header">

              <div className="stock-modal-product-icon">
                <FlaskConical size={20} />
              </div>

              <div>
                <strong>
                  {historyProduct.name}
                </strong>

                <span>
                  Estoque atual:{" "}
                  {Number(
                    historyProduct.stock
                  ) || 0}{" "}
                  {historyProduct.unit || "un"}
                </span>
              </div>

            </div>

            {historySummary && (
              <div className="history-summary">

                <div className="history-summary-item">
                  <span>Estoque atual</span>

                  <strong>
                    {historySummary.currentStock}{" "}
                    {historySummary.unit}
                  </strong>
                </div>

                <div className="history-summary-item">
                  <span>Total de entradas</span>

                  <strong className="entry-value">
                    +{historySummary.totalEntries}{" "}
                    {historySummary.unit}
                  </strong>
                </div>

                <div className="history-summary-item">
                  <span>Total de saídas</span>

                  <strong className="exit-value">
                    -{historySummary.totalExits}{" "}
                    {historySummary.unit}
                  </strong>
                </div>

                <div className="history-summary-item">
                  <span>Consumido no Diário</span>

                  <strong>
                    {historySummary.diaryConsumption}{" "}
                    {historySummary.unit}
                  </strong>
                </div>

                <div className="history-summary-item">
                  <span>Movimentações</span>

                  <strong>
                    {historySummary.movementCount}
                  </strong>
                </div>

              </div>
            )}

            {loadingHistory && (
              <div className="history-loading">
                <Clock3 size={19} />
                Carregando histórico...
              </div>
            )}

            {!loadingHistory &&
              historyMovements.length === 0 && (
                <div className="history-empty">

                  <div>
                    <History size={23} />
                  </div>

                  <strong>
                    Nenhuma movimentação
                  </strong>

                  <span>
                    Este produto ainda não possui
                    movimentações registradas.
                  </span>

                </div>
              )}

            {!loadingHistory &&
              historyMovements.length > 0 && (
                <div className="history-list">

                  {historyMovements.map(
                    (movement, index) => {
                      const isEntry =
                        movement.type === "entrada";

                      return (
                        <div
                          className="history-item"
                          key={
                            movement.id ||
                            `${movement.date}-${index}`
                          }
                        >

                          <div
                            className={
                              isEntry
                                ? "history-icon entrada"
                                : "history-icon saida"
                            }
                          >
                            {isEntry ? (
                              <ArrowDownToLine size={16} />
                            ) : (
                              <ArrowUpFromLine size={16} />
                            )}
                          </div>

                          <div className="history-main">

                            <div className="history-top">

                              <strong>
                                {isEntry
                                  ? "Entrada"
                                  : "Saída"}
                              </strong>

                              <span
                                className={
                                  isEntry
                                    ? "history-quantity entrada"
                                    : "history-quantity saida"
                                }
                              >
                                {isEntry ? "+" : "-"}
                                {Number(
                                  movement.quantity
                                )}{" "}
                                {historyProduct.unit ||
                                  "un"}
                              </span>

                            </div>

                            <p>
                              {movement.reason ||
                                "Sem motivo informado"}
                            </p>

                            {movement.source ===
                              "diario" && (
                              <div className="history-traceability">

                                <span className="history-traceability-badge">
                                  <FileText size={12} />
                                  Diário de Campo
                                </span>

                                {movement.propertyName && (
                                  <span>
                                    <Database size={12} />
                                    {movement.propertyName}
                                  </span>
                                )}

                                {movement.plotName && (
                                  <span>
                                    <Leaf size={12} />
                                    {movement.plotName}
                                  </span>
                                )}

                                {movement.activityTitle && (
                                  <span>
                                    <FileText size={12} />
                                    {movement.activityTitle}
                                  </span>
                                )}

                              </div>
                            )}

                            <small>
                              {formatMovementDate(
                                movement.date
                              )}
                            </small>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            <div className="history-footer">

              <button
                type="button"
                className="stock-cancel-button"
                onClick={closeHistory}
                disabled={loadingHistory}
              >
                Fechar
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default Library;
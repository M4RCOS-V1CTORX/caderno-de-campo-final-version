import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  Package,
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  XCircle,
  ClipboardList,
  UserRound,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import {
  getOrders,
  deleteOrder,
} from "../services/orderService";

import "../styles/orders.css";

function Orders({
  onBack,
  onNewOrder,
  onEditOrder,
  onViewOrder,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  /*
  =========================================================
    CARREGAR PEDIDOS
  =========================================================
  */

  const loadOrders = async () => {
    try {
      setLoading(true);

      const data = await getOrders();

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("ERRO AO CARREGAR PEDIDOS:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /*
  =========================================================
    RESUMO
  =========================================================
  */

  const summary = useMemo(() => {
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

    return {
      total,
      pending,
      inProgress,
      completed,
    };
  }, [orders]);

  /*
  =========================================================
    FILTROS
  =========================================================
  */

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = String(
        order.customer || ""
      ).toLowerCase();

      const notes = String(
        order.notes || ""
      ).toLowerCase();

      const id = String(
        order.id || ""
      ).toLowerCase();

      const matchesSearch =
        !term ||
        customer.includes(term) ||
        notes.includes(term) ||
        id.includes(term);

      const matchesStatus =
        statusFilter === "todos" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  /*
  =========================================================
    EXCLUIR PEDIDO
  =========================================================
  */

  const handleDelete = async (order) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir o pedido #${order.id}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteOrder(order.id);

      setOrders((current) =>
        current.filter(
          (item) => item.id !== order.id
        )
      );
    } catch (error) {
      console.error(
        "ERRO AO EXCLUIR PEDIDO:",
        error
      );

      window.alert(
        "Não foi possível excluir o pedido."
      );
    }
  };

  /*
  =========================================================
    FORMATAÇÕES
  =========================================================
  */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(
      `${date}T00:00:00`
    );

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "pt-BR"
    );
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pendente":
        return "Pendente";

      case "em andamento":
        return "Em andamento";

      case "concluido":
        return "Concluído";

      case "cancelado":
        return "Cancelado";

      default:
        return "Não informado";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pendente":
        return "pending";

      case "em andamento":
        return "progress";

      case "concluido":
        return "completed";

      case "cancelado":
        return "cancelled";

      default:
        return "unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pendente":
        return <Clock3 size={14} />;

      case "em andamento":
        return <Package size={14} />;

      case "concluido":
        return <CheckCircle2 size={14} />;

      case "cancelado":
        return <XCircle size={14} />;

      default:
        return <FileText size={14} />;
    }
  };

  const getItemsCount = (order) => {
    if (!Array.isArray(order.items)) {
      return 0;
    }

    return order.items.reduce(
      (total, item) => {
        return (
          total +
          (Number(item.quantity) || 0)
        );
      },
      0
    );
  };

  /*
  =========================================================
    RENDER
  =========================================================
  */

  return (
    <div className="orders-page">
      <div className="orders-container">

        {/* =================================================
            VOLTAR PARA HOME
        ================================================= */}

        <button
          type="button"
          className="orders-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Voltar para Home
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="orders-header">
          <div className="orders-header-content">

            <div>
              <span className="orders-eyebrow">
                GESTÃO DE PEDIDOS
              </span>

              <h1>
                Pedidos
              </h1>

              <p>
                Organize solicitações, produtos e
                entregas em um só lugar.
              </p>
            </div>

            <button
              type="button"
              className="orders-primary-button"
              onClick={onNewOrder}
            >
              <Plus size={18} />

              Novo Pedido

              <ArrowUpRight size={16} />
            </button>

          </div>
        </header>

        {/* =================================================
            CARDS DE RESUMO
        ================================================= */}

        <section className="orders-summary-grid">

          <div className="order-summary-card">

            <div className="order-summary-icon">
              <ClipboardList size={20} />
            </div>

            <div className="order-summary-content">
              <span>
                Total de pedidos
              </span>

              <strong>
                {summary.total}
              </strong>
            </div>

          </div>

          <div className="order-summary-card">

            <div className="order-summary-icon pending-icon">
              <Clock3 size={20} />
            </div>

            <div className="order-summary-content">
              <span>
                Pendentes
              </span>

              <strong>
                {summary.pending}
              </strong>
            </div>

          </div>

          <div className="order-summary-card">

            <div className="order-summary-icon progress-icon">
              <Package size={20} />
            </div>

            <div className="order-summary-content">
              <span>
                Em andamento
              </span>

              <strong>
                {summary.inProgress}
              </strong>
            </div>

          </div>

          <div className="order-summary-card">

            <div className="order-summary-icon completed-icon">
              <CheckCircle2 size={20} />
            </div>

            <div className="order-summary-content">
              <span>
                Concluídos
              </span>

              <strong>
                {summary.completed}
              </strong>
            </div>

          </div>

        </section>

        {/* =================================================
            FILTROS
        ================================================= */}

        <section className="orders-filters">

          <div className="orders-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Buscar por cliente, número ou observação..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="orders-search-clear"
                onClick={() =>
                  setSearchTerm("")
                }
                aria-label="Limpar busca"
              >
                <XCircle size={16} />
              </button>
            )}

          </div>

          <div className="orders-status-filter">

            <div className="orders-select-icon">
              <FileText size={16} />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="todos">
                Todos os status
              </option>

              <option value="pendente">
                Pendentes
              </option>

              <option value="em andamento">
                Em andamento
              </option>

              <option value="concluido">
                Concluídos
              </option>

              <option value="cancelado">
                Cancelados
              </option>
            </select>

            <ChevronDown
              size={15}
              className="orders-select-arrow"
            />

          </div>

        </section>

        {/* =================================================
            CABEÇALHO DOS RESULTADOS
        ================================================= */}

        <div className="orders-results-header">

          <div>

            <span className="orders-results-eyebrow">
              PEDIDOS REGISTRADOS
            </span>

            <h2>
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1
                ? "pedido encontrado"
                : "pedidos encontrados"}
            </h2>

          </div>

          {(searchTerm ||
            statusFilter !== "todos") && (
            <button
              type="button"
              className="orders-clear-filters"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("todos");
              }}
            >
              Limpar filtros
            </button>
          )}

        </div>

        {/* =================================================
            CARREGAMENTO
        ================================================= */}

        {loading ? (
          <div className="orders-empty-state">

            <div className="orders-loading-spinner" />

            <h3>
              Carregando pedidos...
            </h3>

            <p>
              Aguarde enquanto buscamos os
              registros salvos localmente.
            </p>

          </div>
        ) : filteredOrders.length === 0 ? (

          /* =================================================
             ESTADO VAZIO
          ================================================= */

          <div className="orders-empty-state">

            <div className="orders-empty-icon">
              <ClipboardList size={30} />
            </div>

            <h3>
              {orders.length === 0
                ? "Nenhum pedido cadastrado"
                : "Nenhum pedido encontrado"}
            </h3>

            <p>
              {orders.length === 0
                ? "Comece cadastrando o primeiro pedido do sistema."
                : "Tente alterar a busca ou os filtros utilizados."}
            </p>

            {orders.length === 0 && (
              <button
                type="button"
                className="orders-empty-button"
                onClick={onNewOrder}
              >
                <Plus size={17} />
                Criar primeiro pedido
              </button>
            )}

          </div>

        ) : (

          /* =================================================
             LISTA DE PEDIDOS
          ================================================= */

          <section className="orders-list">

            {filteredOrders.map((order) => {

              const itemsCount =
                getItemsCount(order);

              return (
                <article
                  className="order-card"
                  key={order.id}
                >

                  <div className="order-card-main">

                    {/* PEDIDO */}

                    <div className="order-number">
                      <span>
                        PEDIDO
                      </span>

                      <strong>
                        #
                        {String(order.id).padStart(
                          4,
                          "0"
                        )}
                      </strong>
                    </div>

                    {/* CLIENTE */}

                    <div className="order-customer">

                      <div className="order-customer-icon">
                        <UserRound size={17} />
                      </div>

                      <div>
                        <span>
                          Cliente
                        </span>

                        <strong>
                          {order.customer ||
                            "Não informado"}
                        </strong>
                      </div>

                    </div>

                    {/* DATA */}

                    <div className="order-info-item">

                      <CalendarDays size={16} />

                      <div>
                        <span>
                          Data
                        </span>

                        <strong>
                          {formatDate(
                            order.date
                          )}
                        </strong>
                      </div>

                    </div>

                    {/* ITENS */}

                    <div className="order-info-item">

                      <Package size={16} />

                      <div>
                        <span>
                          Itens
                        </span>

                        <strong>
                          {itemsCount}{" "}
                          {itemsCount === 1
                            ? "unidade"
                            : "unidades"}
                        </strong>
                      </div>

                    </div>

                    {/* VALOR */}

                    <div className="order-value">

                      <span>
                        Total
                      </span>

                      <strong>
                        {formatCurrency(
                          order.total
                        )}
                      </strong>

                    </div>

                    {/* STATUS */}

                    <div
                      className={`order-status ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(
                        order.status
                      )}

                      <span>
                        {getStatusLabel(
                          order.status
                        )}
                      </span>
                    </div>

                  </div>

                  {/* AÇÕES */}

                  <div className="order-card-actions">

                    <button
                      type="button"
                      className="order-action-button"
                      onClick={() =>
                        onViewOrder?.(order)
                      }
                      title="Visualizar pedido"
                    >
                      <Eye size={16} />
                      <span>
                        Ver
                      </span>
                    </button>

                    <button
                      type="button"
                      className="order-action-button"
                      onClick={() =>
                        onEditOrder?.(order)
                      }
                      title="Editar pedido"
                    >
                      <Edit3 size={16} />
                      <span>
                        Editar
                      </span>
                    </button>

                    <button
                      type="button"
                      className="order-action-button danger"
                      onClick={() =>
                        handleDelete(order)
                      }
                      title="Excluir pedido"
                    >
                      <Trash2 size={16} />
                      <span>
                        Excluir
                      </span>
                    </button>

                  </div>

                </article>
              );
            })}

          </section>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="orders-footer">

          <div>
            <strong>
              CADERNO DE CAMPO
            </strong>

            <span>
              Gestão agrícola inteligente
            </span>
          </div>

          <div className="orders-footer-responsible">

            <span>
              RESPONSÁVEL TÉCNICA
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

export default Orders;
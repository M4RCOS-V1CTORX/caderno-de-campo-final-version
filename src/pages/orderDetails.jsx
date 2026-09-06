import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Package,
  UserRound,
  FileText,
  CircleCheck,
  Clock3,
  XCircle,
} from "lucide-react";

import "../styles/orderDetails.css";

function OrderDetails({ order, onBack }) {
  if (!order) {
    return (
      <main className="order-details-page">
        <div className="order-details-container">
          <button
            type="button"
            className="order-details-back"
            onClick={onBack}
          >
            <ArrowLeft size={17} />
            Voltar para Pedidos
          </button>

          <div className="order-details-empty">
            <ClipboardList size={40} />

            <h2>Pedido não encontrado</h2>

            <p>
              Não foi possível encontrar os dados deste pedido.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const totalItems = items.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const totalValue = Number(order.total || 0);

  function formatDate(date) {
    if (!date) {
      return "Não informado";
    }

    const parts = String(date).split("-");

    if (parts.length !== 3) {
      return date;
    }

    const [year, month, day] = parts;

    return `${day}/${month}/${year}`;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value || 0));
  }

  function getStatusLabel(status) {
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
        return status || "Sem status";
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "concluido":
        return <CircleCheck size={17} />;

      case "cancelado":
        return <XCircle size={17} />;

      case "em andamento":
        return <Clock3 size={17} />;

      default:
        return <Clock3 size={17} />;
    }
  }

  return (
    <main className="order-details-page">

      <div className="order-details-container">

        {/* =================================================
            VOLTAR
        ================================================= */}

        <button
          type="button"
          className="order-details-back"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Voltar para Pedidos
        </button>

        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <header className="order-details-header">

          <div>

            <span className="order-details-eyebrow">
              PEDIDO #{order.id}
            </span>

            <h1>
              Detalhes do pedido
            </h1>

            <p>
              Consulte todas as informações
              e produtos deste pedido.
            </p>

          </div>

          <div
            className={`order-details-status status-${String(
              order.status || "pendente"
            ).replace(/\s+/g, "-")}`}
          >
            {getStatusIcon(order.status)}

            {getStatusLabel(order.status)}
          </div>

        </header>

        {/* =================================================
            INFORMAÇÕES PRINCIPAIS
        ================================================= */}

        <section className="order-details-grid">

          <div className="order-details-card">

            <div className="order-details-card-heading">

              <span className="order-details-card-icon">
                <UserRound size={18} />
              </span>

              <div>
                <span>
                  CLIENTE
                </span>

                <h2>
                  Cliente
                </h2>
              </div>

            </div>

            <strong className="order-details-main-value">
              {order.customer || "Não informado"}
            </strong>

          </div>

          <div className="order-details-card">

            <div className="order-details-card-heading">

              <span className="order-details-card-icon">
                <CalendarDays size={18} />
              </span>

              <div>
                <span>
                  DATA DO PEDIDO
                </span>

                <h2>
                  Data
                </h2>
              </div>

            </div>

            <strong className="order-details-main-value">
              {formatDate(order.date)}
            </strong>

          </div>

          <div className="order-details-card">

            <div className="order-details-card-heading">

              <span className="order-details-card-icon">
                <Package size={18} />
              </span>

              <div>
                <span>
                  PRODUTOS
                </span>

                <h2>
                  Quantidade
                </h2>
              </div>

            </div>

            <strong className="order-details-main-value">
              {totalItems}
              {" "}
              {totalItems === 1
                ? "item"
                : "itens"}
            </strong>

          </div>

          <div className="order-details-card order-details-total-card">

            <div className="order-details-card-heading">

              <span className="order-details-card-icon">
                <ClipboardList size={18} />
              </span>

              <div>
                <span>
                  VALOR TOTAL
                </span>

                <h2>
                  Total do pedido
                </h2>
              </div>

            </div>

            <strong className="order-details-total">
              {formatCurrency(totalValue)}
            </strong>

          </div>

        </section>

        {/* =================================================
            PRODUTOS
        ================================================= */}

        <section className="order-details-section">

          <div className="order-details-section-heading">

            <div>

              <span>
                ITENS DO PEDIDO
              </span>

              <h2>
                Produtos
              </h2>

            </div>

            <span className="order-details-item-count">
              {items.length}
              {" "}
              {items.length === 1
                ? "produto"
                : "produtos"}
            </span>

          </div>

          {items.length === 0 ? (

            <div className="order-details-no-items">

              <Package size={28} />

              <p>
                Nenhum produto foi adicionado
                a este pedido.
              </p>

            </div>

          ) : (

            <div className="order-details-items">

              {items.map((item, index) => {

                const quantity =
                  Number(item.quantity || 0);

                const price =
                  Number(item.price || 0);

                const subtotal =
                  quantity * price;

                return (
                  <div
                    className="order-details-item"
                    key={`${item.productId || item.name}-${index}`}
                  >

                    <div className="order-details-item-icon">
                      <Package size={18} />
                    </div>

                    <div className="order-details-item-info">

                      <strong>
                        {item.name ||
                          "Produto sem nome"}
                      </strong>

                      <span>
                        {quantity}
                        {" "}
                        {item.unit || "un."}
                      </span>

                    </div>

                    <div className="order-details-item-price">

                      <span>
                        {formatCurrency(price)}
                        {" "}
                        / unidade
                      </span>

                      <strong>
                        {formatCurrency(subtotal)}
                      </strong>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* =================================================
            OBSERVAÇÕES
        ================================================= */}

        <section className="order-details-section">

          <div className="order-details-section-heading">

            <div>

              <span>
                OBSERVAÇÕES
              </span>

              <h2>
                Informações adicionais
              </h2>

            </div>

          </div>

          <div className="order-details-notes">

            <FileText size={18} />

            <p>
              {order.notes
                ? order.notes
                : "Nenhuma observação registrada neste pedido."}
            </p>

          </div>

        </section>

        {/* =================================================
            RODAPÉ
        ================================================= */}

        <footer className="order-details-footer">

          <div>

            <strong>
              CADERNO DE CAMPO
            </strong>

            <span>
              Gestão agrícola inteligente
            </span>

          </div>

          <div className="order-details-footer-responsible">

            <span>
              RESPONSÁVEL TÉCNICA
            </span>

            <strong>
              Laís L. Andrade
            </strong>

          </div>

        </footer>

      </div>

    </main>
  );
}

export default OrderDetails;
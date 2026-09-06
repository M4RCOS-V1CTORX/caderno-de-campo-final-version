import { useEffect, useState } from "react";

import {
  Wrench,
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Building2,
  Sprout,
  Search,
  ListChecks,
  CircleDot,
  RotateCcw,
} from "lucide-react";

import { getActivities } from "../services/activityService";
import { getPropertyById } from "../services/propertyService";
import { getPlotById } from "../services/plotService";

import "../styles/management.css";

function Management({ onBack }) {
  const [activities, setActivities] = useState([]);
  const [properties, setProperties] = useState({});
  const [plots, setPlots] = useState({});
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("Todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function loadManagements() {
    try {
      setLoading(true);

      const data = await getActivities();

      const managements = (Array.isArray(data) ? data : []).filter(
        (activity) =>
          activity.managementType || activity.managementStatus
      );

      setActivities(managements);

      const propertyMap = {};
      const plotMap = {};

      for (const activity of managements) {
        if (
          activity.propertyId &&
          !propertyMap[activity.propertyId]
        ) {
          const property = await getPropertyById(
            activity.propertyId
          );

          if (property) {
            propertyMap[activity.propertyId] = property;
          }
        }

        if (
          activity.plotId &&
          !plotMap[activity.plotId]
        ) {
          const plot = await getPlotById(activity.plotId);

          if (plot) {
            plotMap[activity.plotId] = plot;
          }
        }
      }

      setProperties(propertyMap);
      setPlots(plotMap);
    } catch (error) {
      console.error("ERRO AO CARREGAR MANEJOS:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadManagements();
  }, []);

  const totalManagements = activities.length;

  const plannedManagements = activities.filter(
    (activity) =>
      activity.managementStatus === "Planejado"
  ).length;

  const inProgressManagements = activities.filter(
    (activity) =>
      activity.managementStatus === "Em andamento"
  ).length;

  const completedManagements = activities.filter(
    (activity) =>
      activity.managementStatus === "Concluído"
  ).length;

  const filteredActivities = activities.filter(
    (activity) => {
      if (
        statusFilter !== "Todos" &&
        activity.managementStatus !== statusFilter
      ) {
        return false;
      }

      if (startDate) {
        if (
          !activity.managementPlannedDate ||
          activity.managementPlannedDate < startDate
        ) {
          return false;
        }
      }

      if (endDate) {
        if (
          !activity.managementPlannedDate ||
          activity.managementPlannedDate > endDate
        ) {
          return false;
        }
      }

      return true;
    }
  );

  function formatDate(date) {
    if (!date) {
      return "Não definida";
    }

    const [year, month, day] = date.split("-");

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  }

  function normalizeStatus(status) {
    return String(status || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  }

  function getStatusLabel(status) {
    if (!status) {
      return "Sem status";
    }

    return status;
  }

  function getStatusIcon(status) {
    switch (status) {
      case "Planejado":
        return <Clock3 size={15} />;

      case "Em andamento":
        return <RotateCcw size={15} />;

      case "Concluído":
        return <Check size={15} />;

      default:
        return <CircleDot size={15} />;
    }
  }

  return (
    <main className="management-page">
      <header className="management-header">
        <button
          type="button"
          className="management-back"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Voltar para Home
        </button>

        <div className="management-hero">
          <div className="management-hero-content">
            <span className="management-label">
              MANEJO
            </span>

            <h1>
              Organização do campo.
              <br />
              <span>Controle do manejo.</span>
            </h1>

            <p>
              Acompanhe os manejos planejados,
              em andamento e concluídos em um
              só lugar.
            </p>
          </div>

          <div className="management-hero-icon">
            <Wrench size={54} strokeWidth={1.5} />

            <div className="management-hero-floating">
              <Check size={15} />
              Manejo acompanhado
            </div>
          </div>
        </div>
      </header>

      <section className="management-overview">
        <div className="management-section-heading">
          <div>
            <span>VISÃO DO MANEJO</span>
            <h2>Acompanhe suas atividades</h2>
          </div>
        </div>

        <div className="management-summary">
          <article className="management-summary-card">
            <div className="management-summary-icon">
              <ListChecks size={19} />
            </div>

            <div>
              <span>Total de manejos</span>
              <strong>{totalManagements}</strong>
            </div>
          </article>

          <article className="management-summary-card">
            <div className="management-summary-icon planned">
              <Clock3 size={19} />
            </div>

            <div>
              <span>Planejados</span>
              <strong>{plannedManagements}</strong>
            </div>
          </article>

          <article className="management-summary-card">
            <div className="management-summary-icon progress">
              <RotateCcw size={19} />
            </div>

            <div>
              <span>Em andamento</span>
              <strong>{inProgressManagements}</strong>
            </div>
          </article>

          <article className="management-summary-card">
            <div className="management-summary-icon completed">
              <Check size={19} />
            </div>

            <div>
              <span>Concluídos</span>
              <strong>{completedManagements}</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="management-content">
        <div className="management-content-header">
          <div>
            <span className="management-section-label">
              ACOMPANHAMENTO
            </span>

            <h2>Filtre seus manejos</h2>
          </div>
        </div>

        <div className="management-filters">
          <button
            type="button"
            className={
              statusFilter === "Todos"
                ? "management-filter active"
                : "management-filter"
            }
            onClick={() => setStatusFilter("Todos")}
          >
            <div>
              <ListChecks size={16} />
              <span>Todos</span>
            </div>

            <strong>{activities.length}</strong>
          </button>

          <button
            type="button"
            className={
              statusFilter === "Planejado"
                ? "management-filter active"
                : "management-filter"
            }
            onClick={() =>
              setStatusFilter("Planejado")
            }
          >
            <div>
              <Clock3 size={16} />
              <span>Planejados</span>
            </div>

            <strong>{plannedManagements}</strong>
          </button>

          <button
            type="button"
            className={
              statusFilter === "Em andamento"
                ? "management-filter active"
                : "management-filter"
            }
            onClick={() =>
              setStatusFilter("Em andamento")
            }
          >
            <div>
              <RotateCcw size={16} />
              <span>Em andamento</span>
            </div>

            <strong>{inProgressManagements}</strong>
          </button>

          <button
            type="button"
            className={
              statusFilter === "Concluído"
                ? "management-filter active"
                : "management-filter"
            }
            onClick={() =>
              setStatusFilter("Concluído")
            }
          >
            <div>
              <Check size={16} />
              <span>Concluídos</span>
            </div>

            <strong>{completedManagements}</strong>
          </button>
        </div>

        <div className="management-period-filter">
          <div className="management-date-field">
            <label htmlFor="managementStartDate">
              Data inicial
            </label>

            <div className="management-date-input">
              <CalendarDays size={16} />

              <input
                id="managementStartDate"
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
              />
            </div>
          </div>

          <div className="management-date-field">
            <label htmlFor="managementEndDate">
              Data final
            </label>

            <div className="management-date-input">
              <CalendarDays size={16} />

              <input
                id="managementEndDate"
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
              />
            </div>
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              className="management-clear-date"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              <RotateCcw size={14} />
              Limpar período
            </button>
          )}
        </div>

        {loading ? (
          <div className="management-empty">
            <div className="management-empty-icon">
              <Wrench size={28} />
            </div>

            <h3>Carregando manejos...</h3>

            <p>
              Aguarde enquanto carregamos os
              registros do campo.
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="management-empty">
            <div className="management-empty-icon">
              <Wrench size={28} />
            </div>

            <h3>Nenhum manejo cadastrado</h3>

            <p>
              Os manejos registrados no Diário
              de Campo aparecerão aqui.
            </p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="management-empty">
            <div className="management-empty-icon">
              <Search size={28} />
            </div>

            <h3>Nenhum manejo encontrado</h3>

            <p>
              Não existem manejos que correspondam
              aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="management-list">
            {filteredActivities.map((activity) => {
              const property =
                properties[activity.propertyId];

              const plot =
                plots[activity.plotId];

              return (
                <article
                  className="management-card"
                  key={activity.id}
                >
                  <div className="management-card-top">
                    <div className="management-card-main">
                      <div className="management-card-icon">
                        <Wrench size={21} />
                      </div>

                      <div className="management-card-title">
                        <span>TIPO DE MANEJO</span>

                        <h3>
                          {activity.managementType ||
                            "Manejo"}
                        </h3>
                      </div>
                    </div>

                    {activity.managementStatus && (
                      <span
                        className={`management-status status-${normalizeStatus(
                          activity.managementStatus
                        )}`}
                      >
                        {getStatusIcon(
                          activity.managementStatus
                        )}

                        {getStatusLabel(
                          activity.managementStatus
                        )}
                      </span>
                    )}
                  </div>

                  <div className="management-card-info">
                    <div className="management-info-item">
                      <span>
                        <CalendarDays size={14} />
                        Data prevista
                      </span>

                      <strong>
                        {formatDate(
                          activity.managementPlannedDate
                        )}
                      </strong>
                    </div>

                    {activity.managementCompletedDate && (
                      <div className="management-info-item">
                        <span>
                          <Check size={14} />
                          Conclusão
                        </span>

                        <strong>
                          {formatDate(
                            activity.managementCompletedDate
                          )}
                        </strong>
                      </div>
                    )}

                    <div className="management-info-item">
                      <span>
                        <Building2 size={14} />
                        Propriedade
                      </span>

                      <strong>
                        {property?.name ||
                          "Não informada"}
                      </strong>
                    </div>

                    <div className="management-info-item">
                      <span>
                        <Sprout size={14} />
                        Talhão
                      </span>

                      <strong>
                        {plot?.name ||
                          "Não informado"}
                      </strong>
                    </div>

                    {plot?.culture && (
                      <div className="management-info-item">
                        <span>
                          <Sprout size={14} />
                          Cultura
                        </span>

                        <strong>
                          {plot.culture}
                        </strong>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="management-footer">
        <div>
          <strong>CADERNO DE CAMPO</strong>
          <span>Gestão agrícola inteligente</span>
        </div>

        <div>
          <span>RESPONSÁVEL TÉCNICA</span>
          <strong>Laís L. Andrade</strong>
        </div>
      </footer>
    </main>
  );
}

export default Management;
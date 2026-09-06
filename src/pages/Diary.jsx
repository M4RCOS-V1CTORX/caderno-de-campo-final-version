import { useEffect, useState } from "react";

import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Bug,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Database,
  FlaskConical,
  Leaf,
  ListFilter,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Sprout,
  Trash2,
  X,
} from "lucide-react";

import { getActivities, deleteActivity } from "../services/activityService";
import { getPropertyById } from "../services/propertyService";
import { getPlotById } from "../services/plotService";
import { getPhotosByActivity } from "../services/photoService";

import "../styles/diary.css";

function Diary({
  onNewActivity,
  onEditActivity,
  onViewActivity,
  onBack,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedPlot, setSelectedPlot] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");

  async function loadActivities() {
    try {
      setLoading(true);

      const data = await getActivities();

      if (!Array.isArray(data)) {
        setActivities([]);
        return;
      }

      const enrichedActivities = await Promise.all(
        data.map(async (activity) => {
          let property = null;
          let plot = null;
          let photoCount = 0;

          try {
            if (activity.propertyId !== undefined && activity.propertyId !== null) {
              property = await getPropertyById(Number(activity.propertyId));
            }
          } catch (error) {
            console.error("Erro ao carregar propriedade:", error);
          }

          try {
            if (activity.plotId !== undefined && activity.plotId !== null) {
              plot = await getPlotById(Number(activity.plotId));
            }
          } catch (error) {
            console.error("Erro ao carregar talhão:", error);
          }

          try {
            if (activity.id !== undefined && activity.id !== null) {
              const photos = await getPhotosByActivity(activity.id);
              photoCount = Array.isArray(photos) ? photos.length : 0;
            }
          } catch (error) {
            console.error("Erro ao carregar fotos:", error);
          }

          return {
            ...activity,
            property,
            plot,
            photoCount,
          };
        })
      );

      setActivities(enrichedActivities);
    } catch (error) {
      console.error("Erro ao carregar Diário de Campo:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  const properties = Array.from(
    new Map(
      activities
        .filter((activity) => activity.property)
        .map((activity) => [activity.property.id, activity.property])
    ).values()
  ).sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "pt-BR")
  );

  const plots = Array.from(
    new Map(
      activities
        .filter(
          (activity) =>
            activity.plot &&
            (!selectedProperty ||
              String(activity.propertyId) === String(selectedProperty))
        )
        .map((activity) => [activity.plot.id, activity.plot])
    ).values()
  ).sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "pt-BR")
  );

  const filteredActivities = activities
    .filter((activity) => {
      const searchText = search.trim().toLowerCase();

      if (searchText) {
        const searchableText = [
          activity.title,
          activity.location,
          activity.description,
          activity.managementType,
          activity.managementStatus,
          activity.pest,
          activity.disease,
          activity.product,
          activity.quantity,
          activity.property?.name,
          activity.plot?.name,
          activity.plot?.culture,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(searchText)) {
          return false;
        }
      }

      if (
        selectedProperty &&
        String(activity.propertyId) !== String(selectedProperty)
      ) {
        return false;
      }

      if (
        selectedPlot &&
        String(activity.plotId) !== String(selectedPlot)
      ) {
        return false;
      }

      if (
        selectedStatus &&
        String(activity.managementStatus || "") !== selectedStatus
      ) {
        return false;
      }

      if (startDate && String(activity.date || "") < startDate) {
        return false;
      }

      if (endDate && String(activity.date || "") > endDate) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = String(a.date || "");
      const dateB = String(b.date || "");

      if (dateA !== dateB) {
        return sortOrder === "recent"
          ? dateB.localeCompare(dateA)
          : dateA.localeCompare(dateB);
      }

      const createdA = Number(a.createdAt || 0);
      const createdB = Number(b.createdAt || 0);

      return sortOrder === "recent"
        ? createdB - createdA
        : createdA - createdB;
    });

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este registro do diário?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteActivity(id);
      await loadActivities();
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
      alert("Não foi possível excluir o registro.");
    }
  }

  function clearFilters() {
    setSearch("");
    setSelectedProperty("");
    setSelectedPlot("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
  }

  const hasFilters =
    search ||
    selectedProperty ||
    selectedPlot ||
    selectedStatus ||
    startDate ||
    endDate;

  function getDateLabel(date) {
    if (!date) {
      return "SEM DATA";
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return "SEM DATA";
    }

    return parsedDate
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(".", "")
      .toUpperCase();
  }

  function getStatusClass(status) {
    if (status === "Concluído") {
      return "status-completed";
    }

    if (status === "Em andamento") {
      return "status-progress";
    }

    if (status === "Planejado") {
      return "status-planned";
    }

    return "status-empty";
  }

  function getStatusLabel(status) {
    return status || "Sem status";
  }

  const totalPhotos = activities.reduce(
    (total, activity) => total + Number(activity.photoCount || 0),
    0
  );

  const completedCount = activities.filter(
    (activity) => activity.managementStatus === "Concluído"
  ).length;

  const inProgressCount = activities.filter(
    (activity) => activity.managementStatus === "Em andamento"
  ).length;

  const today = new Date().toISOString().split("T")[0];

  const todayCount = activities.filter(
    (activity) => activity.date === today
  ).length;

  return (
    <main className="diary">
      <div className="diary-page-top">
        <button
          type="button"
          className="diary-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Voltar para a Home
        </button>
      </div>

      <section className="diary-hero">
        <div className="diary-hero-content">
          <div className="diary-hero-icon">
            <ClipboardList size={25} strokeWidth={1.8} />
          </div>

          <div className="diary-hero-copy">
            <span className="diary-kicker">
              REGISTROS DE CAMPO
            </span>

            <h1>Diário de Campo</h1>

            <p>
              Acompanhe as atividades realizadas, observações e
              informações importantes de cada propriedade.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="diary-primary-button"
          onClick={onNewActivity}
        >
          <Plus size={18} />
          Novo registro
          <ArrowRight size={16} />
        </button>
      </section>

      <section className="diary-stats">
        <article className="diary-stat-card">
          <div className="diary-stat-icon">
            <ClipboardList size={19} />
          </div>

          <div>
            <span>REGISTROS</span>
            <strong>{activities.length}</strong>
            <small>Total cadastrado</small>
          </div>
        </article>

        <article className="diary-stat-card diary-stat-highlight">
          <div className="diary-stat-icon">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>HOJE</span>
            <strong>{todayCount}</strong>
            <small>Registros do dia</small>
          </div>
        </article>

        <article className="diary-stat-card">
          <div className="diary-stat-icon">
            <Camera size={19} />
          </div>

          <div>
            <span>FOTOS</span>
            <strong>{totalPhotos}</strong>
            <small>Imagens registradas</small>
          </div>
        </article>

        <article className="diary-stat-card">
          <div className="diary-stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>CONCLUÍDOS</span>
            <strong>{completedCount}</strong>
            <small>Manejos finalizados</small>
          </div>
        </article>

        <article className="diary-stat-card">
          <div className="diary-stat-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <span>EM ANDAMENTO</span>
            <strong>{inProgressCount}</strong>
            <small>Manejos em execução</small>
          </div>
        </article>
      </section>

      <section className="diary-section">
        <div className="diary-section-header">
          <div>
            <span className="diary-section-kicker">
              HISTÓRICO DO CAMPO
            </span>

            <h2>Registros</h2>

            <p>
              Consulte, filtre e acompanhe todas as informações
              registradas no diário.
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              className="diary-clear-button"
              onClick={clearFilters}
            >
              <X size={15} />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="diary-filters">
          <div className="diary-filter-field diary-filter-search">
            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar nos registros..."
            />

            {search && (
              <button
                type="button"
                className="diary-filter-clear"
                onClick={() => setSearch("")}
                aria-label="Limpar busca"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <label className="diary-filter-field">
            <Building2 size={16} />

            <select
              value={selectedProperty}
              onChange={(event) => {
                setSelectedProperty(event.target.value);
                setSelectedPlot("");
              }}
            >
              <option value="">Todas as propriedades</option>

              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </label>

          <label
            className={`diary-filter-field ${
              selectedProperty ? "" : "diary-filter-disabled"
            }`}
          >
            <Sprout size={16} />

            <select
              value={selectedPlot}
              onChange={(event) => setSelectedPlot(event.target.value)}
              disabled={!selectedProperty && plots.length === 0}
            >
              <option value="">Todos os talhões</option>

              {plots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.name}
                </option>
              ))}
            </select>
          </label>

          <label className="diary-filter-field">
            <ListFilter size={16} />

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="Planejado">Planejado</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
            </select>
          </label>

          <label className="diary-filter-field">
            <CalendarDays size={16} />

            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              title="Data inicial"
            />
          </label>

          <label className="diary-filter-field">
            <CalendarDays size={16} />

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              title="Data final"
            />
          </label>

          <label className="diary-filter-field">
            <ArrowDownUp size={16} />

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
            </select>
          </label>
        </div>

        {!loading && activities.length > 0 && hasFilters && (
          <div className="diary-filter-result">
            <span>
              <ListFilter size={15} />
              {filteredActivities.length}{" "}
              {filteredActivities.length === 1
                ? "registro encontrado"
                : "registros encontrados"}
            </span>
          </div>
        )}

        {loading ? (
          <div className="diary-empty-state">
            <div className="diary-empty-icon">
              <LoaderCircle size={28} className="diary-spinner" />
            </div>

            <h3>Carregando registros...</h3>

            <p>
              Estamos organizando as informações do seu diário.
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="diary-empty-state">
            <div className="diary-empty-icon">
              <Database size={28} />
            </div>

            <span className="diary-empty-kicker">
              DIÁRIO DE CAMPO
            </span>

            <h3>Nenhum registro cadastrado</h3>

            <p>
              Comece registrando uma atividade ou observação
              realizada no campo.
            </p>

            <button
              type="button"
              className="diary-empty-button"
              onClick={onNewActivity}
            >
              <Plus size={17} />
              Criar primeiro registro
            </button>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="diary-empty-state diary-search-empty">
            <div className="diary-empty-icon">
              <Search size={28} />
            </div>

            <span className="diary-empty-kicker">
              NENHUM RESULTADO
            </span>

            <h3>Nenhum registro encontrado</h3>

            <p>
              Tente alterar os filtros ou realizar uma nova busca.
            </p>

            <button
              type="button"
              className="diary-empty-button"
              onClick={clearFilters}
            >
              <X size={17} />
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="diary-list">
            {filteredActivities.map((activity) => (
              <article
                key={activity.id}
                className="diary-card"
                onClick={() => onViewActivity(activity)}
              >
                <div className="diary-card-date">
                  <span>{getDateLabel(activity.date)}</span>
                </div>

                <div className="diary-card-main">
                  <div className="diary-card-top">
                    <div className="diary-card-icon">
                      <Leaf size={20} />
                    </div>

                    <div className="diary-card-title-area">
                      <div className="diary-card-title-row">
                        <h3>
                          {activity.title || "Registro de campo"}
                        </h3>

                        {activity.managementStatus && (
                          <span
                            className={`diary-status ${getStatusClass(
                              activity.managementStatus
                            )}`}
                          >
                            {getStatusLabel(
                              activity.managementStatus
                            )}
                          </span>
                        )}
                      </div>

                      <div className="diary-card-meta">
                        {activity.location && (
                          <span>
                            <MapPin size={14} />
                            {activity.location}
                          </span>
                        )}

                        {activity.property?.name && (
                          <span>
                            <Building2 size={14} />
                            {activity.property.name}
                          </span>
                        )}

                        {activity.plot?.name && (
                          <span>
                            <Sprout size={14} />
                            {activity.plot.name}
                          </span>
                        )}

                        {activity.plot?.culture && (
                          <span>
                            <Leaf size={14} />
                            {activity.plot.culture}
                          </span>
                        )}

                        {activity.photoCount > 0 && (
                          <span>
                            <Camera size={14} />
                            {activity.photoCount}{" "}
                            {activity.photoCount === 1
                              ? "foto"
                              : "fotos"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {activity.managementType && (
                    <div className="diary-card-detail diary-management">
                      <span className="diary-detail-icon">
                        <ClipboardList size={15} />
                      </span>

                      <div>
                        <small>TIPO DE MANEJO</small>
                        <strong>{activity.managementType}</strong>
                      </div>
                    </div>
                  )}

                  {(activity.pest || activity.disease) && (
                    <div className="diary-card-occurrences">
                      {activity.pest && (
                        <span>
                          <Bug size={14} />
                          Praga: {activity.pest}
                        </span>
                      )}

                      {activity.disease && (
                        <span>
                          <ShieldAlert size={14} />
                          Doença: {activity.disease}
                        </span>
                      )}
                    </div>
                  )}

                  {(activity.product || activity.quantity) && (
                    <div className="diary-card-product">
                      <FlaskConical size={15} />

                      <span>
                        {activity.product || "Produto registrado"}

                        {activity.quantity
                          ? ` · ${activity.quantity}`
                          : ""}
                      </span>
                    </div>
                  )}

                  {activity.description && (
                    <p className="diary-card-description">
                      {activity.description}
                    </p>
                  )}

                  <div className="diary-card-footer">
                    <button
                      type="button"
                      className="diary-view-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onViewActivity(activity);
                      }}
                    >
                      Ver registro
                      <ArrowRight size={15} />
                    </button>

                    <div className="diary-card-actions">
                      <button
                        type="button"
                        className="diary-action-button diary-edit"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditActivity(activity);
                        }}
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      <button
                        type="button"
                        className="diary-action-button diary-delete"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(activity.id);
                        }}
                      >
                        <Trash2 size={15} />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="diary-footer">
        <div>
          <strong>CADERNO DE CAMPO</strong>
          <span>Gestão agrícola inteligente</span>
        </div>

        <div className="diary-footer-tech">
          <span>RESPONSÁVEL TÉCNICA</span>
          <strong>Laís L. Andrade</strong>
        </div>
      </footer>
    </main>
  );
}

export default Diary;
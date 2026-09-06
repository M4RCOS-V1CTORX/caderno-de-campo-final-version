import { useEffect, useMemo, useState } from "react";

import {
  getProperties,
  deleteProperty,
} from "../services/propertyService";

import { getPlotsByProperty } from "../services/plotService";

import {
  Building2,
  MapPin,
  Sprout,
  Search,
  X,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  ArrowLeft,
  LoaderCircle,
  Database,
} from "lucide-react";

import "../styles/properties.css";

function Properties({
  onNewProperty,
  onEditProperty,
  onViewProperty,
  onViewPlots,
  onBack,
}) {
  const [properties, setProperties] = useState([]);
  const [plotCounts, setPlotCounts] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================================================
     CARREGAR PROPRIEDADES
  ========================================================= */

  async function loadProperties() {
    try {
      setLoading(true);

      const data = await getProperties();

      const propertyList = Array.isArray(data) ? data : [];

      setProperties(propertyList);

      const counts = {};

      await Promise.all(
        propertyList.map(async (property) => {
          try {
            const plots = await getPlotsByProperty(
              Number(property.id)
            );

            counts[property.id] = Array.isArray(plots)
              ? plots.length
              : 0;
          } catch (error) {
            console.error(
              `ERRO AO CARREGAR TALHÕES DA PROPRIEDADE ${property.id}:`,
              error
            );

            counts[property.id] = 0;
          }
        })
      );

      setPlotCounts(counts);
    } catch (error) {
      console.error(
        "ERRO AO CARREGAR PROPRIEDADES:",
        error
      );

      setProperties([]);
      setPlotCounts({});
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CARREGAMENTO INICIAL
  ========================================================= */

  useEffect(() => {
    loadProperties();
  }, []);

  /* =========================================================
     ABRIR TALHÕES
  ========================================================= */

  function handleViewPlots(property) {
    if (onViewPlots) {
      onViewPlots(property);
      return;
    }

    if (onViewProperty) {
      onViewProperty(property);
    }
  }

  /* =========================================================
     FILTRO DE PESQUISA
  ========================================================= */

  const filteredProperties = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return properties;
    }

    return properties.filter((property) => {
      const name = String(
        property.name || ""
      ).toLowerCase();

      const location = String(
        property.location ||
          property.address ||
          property.city ||
          ""
      ).toLowerCase();

      return (
        name.includes(normalizedSearch) ||
        location.includes(normalizedSearch)
      );
    });
  }, [properties, search]);

  /* =========================================================
     EXCLUIR PROPRIEDADE
  ========================================================= */

  async function handleDeleteProperty(property) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a propriedade "${property.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProperty(property.id);

      setProperties((currentProperties) =>
        currentProperties.filter(
          (item) => item.id !== property.id
        )
      );

      setPlotCounts((currentCounts) => {
        const updatedCounts = {
          ...currentCounts,
        };

        delete updatedCounts[property.id];

        return updatedCounts;
      });

      alert("Propriedade excluída com sucesso!");
    } catch (error) {
      console.error(
        "ERRO AO EXCLUIR PROPRIEDADE:",
        error
      );

      alert(
        "Não foi possível excluir a propriedade."
      );
    }
  }

  /* =========================================================
     LIMPAR PESQUISA
  ========================================================= */

  function clearSearch() {
    setSearch("");
  }

  /* =========================================================
     TOTAL DE TALHÕES
  ========================================================= */

  const totalPlots = Object.values(plotCounts).reduce(
    (total, count) => total + count,
    0
  );

  /* =========================================================
     TELA
  ========================================================= */

  return (
    <main className="properties">
      <button
  className="properties-back-button"
  onClick={onBack}
>
  <ArrowLeft size={16} />
  Voltar para a Home
</button>

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <header className="properties-header">

        <div className="properties-heading">

          <span className="properties-label">
            CADASTROS
          </span>

          <div className="properties-title-row">

            <div className="properties-title-icon">
              <Building2 size={20} strokeWidth={1.7} />
            </div>

            <h2>
              Propriedades
            </h2>

          </div>

          <p>
            Gerencie as propriedades cadastradas
            no seu caderno de campo.
          </p>

        </div>

        <button
          type="button"
          className="primary-button properties-new-button"
          onClick={onNewProperty}
        >
          <Plus size={17} strokeWidth={2} />
          Nova propriedade
        </button>

      </header>

      {/* =====================================================
          RESUMO
      ===================================================== */}

      <section className="properties-summary">

        <div className="summary-card">

          <div className="summary-icon">
            <Building2
              size={20}
              strokeWidth={1.7}
            />
          </div>

          <div className="summary-content">

            <strong>
              {properties.length}
            </strong>

            <p>
              {properties.length === 1
                ? "PROPRIEDADE CADASTRADA"
                : "PROPRIEDADES CADASTRADAS"}
            </p>

          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon">
            <Sprout
              size={20}
              strokeWidth={1.7}
            />
          </div>

          <div className="summary-content">

            <strong>
              {totalPlots}
            </strong>

            <p>
              {totalPlots === 1
                ? "TALHÃO CADASTRADO"
                : "TALHÕES CADASTRADOS"}
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          LISTA
      ===================================================== */}

      <section className="properties-section">

        <div className="section-title">

          <div>

            <span className="section-kicker">
              PROPRIEDADES
            </span>

            <h3>
              Minhas propriedades
            </h3>

            <p>
              Consulte e gerencie seus locais
              de trabalho.
            </p>

          </div>

          {properties.length > 0 && (
            <div className="properties-count">
              <Database
                size={14}
                strokeWidth={1.7}
              />

              <span>
                {properties.length}
              </span>
            </div>
          )}

        </div>

        {/* ===================================================
            PESQUISA
        =================================================== */}

        <div className="property-search">

          <Search
            size={17}
            strokeWidth={1.7}
          />

          <input
            type="text"
            placeholder="Pesquisar propriedade..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={clearSearch}
              aria-label="Limpar pesquisa"
            >
              <X size={14} />
            </button>
          )}

        </div>

        {/* ===================================================
            CARREGANDO
        =================================================== */}

        {loading ? (

          <div className="properties-loading">

            <LoaderCircle
              className="loading-spinner"
              size={30}
              strokeWidth={1.7}
            />

            <p>
              Carregando propriedades...
            </p>

          </div>

        ) : filteredProperties.length > 0 ? (

          <div className="properties-list">

            {filteredProperties.map((property) => (

              <article
                className="property-card"
                key={property.id}
              >

                {/* ÍCONE */}

                <div className="property-icon">

                  <Building2
                    size={21}
                    strokeWidth={1.6}
                  />

                </div>

                {/* INFORMAÇÕES */}

                <div className="property-info">

                  <h4>
                    {property.name ||
                      "Propriedade sem nome"}
                  </h4>

                  <p className="property-location">

                    <MapPin
                      size={12}
                      strokeWidth={1.8}
                    />

                    <span>
                      {property.location ||
                        property.address ||
                        property.city ||
                        "Localização não informada"}
                    </span>

                  </p>

                </div>

                {/* META */}

                <div className="property-meta">

                  <span className="plot-badge">

                    <Sprout
                      size={13}
                      strokeWidth={1.8}
                    />

                    <span>
                      {plotCounts[property.id] || 0}
                    </span>

                    <span>
                      {plotCounts[property.id] === 1
                        ? "talhão"
                        : "talhões"}
                    </span>

                  </span>

                </div>

                {/* AÇÕES */}

                <div
                  className="property-actions"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >

                  <button
                    type="button"
                    className="plots-button"
                    onClick={() =>
                      handleViewPlots(property)
                    }
                  >
                    <Sprout
                      size={13}
                      strokeWidth={1.8}
                    />

                    Talhões
                  </button>

                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => {
                      if (onEditProperty) {
                        onEditProperty(property);
                      }
                    }}
                    aria-label={`Editar ${property.name}`}
                  >
                    <Pencil
                      size={13}
                      strokeWidth={1.8}
                    />

                    Editar
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      handleDeleteProperty(property)
                    }
                    aria-label={`Excluir ${property.name}`}
                  >
                    <Trash2
                      size={13}
                      strokeWidth={1.8}
                    />

                    Excluir
                  </button>

                </div>

                {/* SETA */}

                <span className="property-arrow">

                  <ArrowRight
                    size={17}
                    strokeWidth={1.7}
                  />

                </span>

              </article>

            ))}

          </div>

        ) : search ? (

          /* =================================================
             PESQUISA SEM RESULTADO
          ================================================= */

          <div className="properties-empty">

            <div className="empty-icon">

              <Search
                size={22}
                strokeWidth={1.6}
              />

            </div>

            <span className="empty-kicker">
              PESQUISA
            </span>

            <h3>
              Nenhuma propriedade encontrada
            </h3>

            <p>
              Não encontramos nenhuma propriedade
              correspondente à sua pesquisa.
            </p>

            <button
              type="button"
              className="secondary-button"
              onClick={clearSearch}
            >
              Limpar pesquisa
            </button>

          </div>

        ) : (

          /* =================================================
             NENHUMA PROPRIEDADE
          ================================================= */

          <div className="properties-empty">

            <div className="empty-icon">

              <Building2
                size={23}
                strokeWidth={1.6}
              />

            </div>

            <span className="empty-kicker">
              CADASTRO
            </span>

            <h3>
              Nenhuma propriedade cadastrada
            </h3>

            <p>
              Cadastre sua primeira propriedade
              para começar a organizar os locais
              e talhões utilizados nas atividades
              de campo.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={onNewProperty}
            >
              <Plus
                size={16}
                strokeWidth={2}
              />

              Nova propriedade
            </button>

          </div>

        )}

      </section>

    </main>
  );
}

export default Properties;
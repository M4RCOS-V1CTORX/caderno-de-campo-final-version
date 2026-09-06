import { useEffect, useState } from "react";

import {
  getCultures,
  deleteCulture,
} from "../services/cultureService";

import {
  Sprout,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Search,
  X,
  CalendarDays,
  Leaf,
  FileText,
  LoaderCircle,
  Database,
  ChevronRight,
} from "lucide-react";

import "../styles/cultures.css";

function Cultures({
  onNewCulture,
  onEditCulture,
  onBack,
}) {
  const [cultures, setCultures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // =========================================================
  // CARREGAR CULTURAS
  // =========================================================

  async function loadCultures() {
    try {
      setLoading(true);

      const data = await getCultures();

      setCultures(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "ERRO AO CARREGAR CULTURAS:",
        error
      );

      setCultures([]);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // CARREGAMENTO INICIAL
  // =========================================================

  useEffect(() => {
    loadCultures();
  }, []);

  // =========================================================
  // EXCLUIR CULTURA
  // =========================================================

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta cultura?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCulture(id);

      await loadCultures();
    } catch (error) {
      console.error(
        "ERRO AO EXCLUIR CULTURA:",
        error
      );

      alert(
        "Não foi possível excluir a cultura."
      );
    }
  }

  // =========================================================
  // FILTRO
  // =========================================================

  const filteredCultures = cultures.filter((culture) => {
    const searchTerm = search
      .trim()
      .toLowerCase();

    if (!searchTerm) {
      return true;
    }

    return (
      culture.name
        ?.toLowerCase()
        .includes(searchTerm) ||
      culture.variety
        ?.toLowerCase()
        .includes(searchTerm) ||
      culture.cycle
        ?.toLowerCase()
        .includes(searchTerm) ||
      culture.observations
        ?.toLowerCase()
        .includes(searchTerm)
    );
  });

  return (
    <main className="cultures-page">

      {/* =====================================================
          VOLTAR
      ===================================================== */}

      <button
        type="button"
        className="cultures-back-button"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Voltar para a Home
      </button>

      {/* =====================================================
          HERO / CABEÇALHO
      ===================================================== */}

      <section className="cultures-hero">

        <div className="cultures-hero-content">

          <div className="cultures-hero-icon">
            <Sprout size={23} />
          </div>

          <div>
            <span className="cultures-kicker">
              CADASTROS AGRÍCOLAS
            </span>

            <h1>
              Culturas
            </h1>

            <p>
              Organize as culturas utilizadas
              nas propriedades e mantenha
              suas informações sempre acessíveis.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="cultures-new-button"
          onClick={onNewCulture}
        >
          <Plus size={17} />
          Nova cultura
          <ChevronRight size={15} />
        </button>

      </section>

      {/* =====================================================
          RESUMO
      ===================================================== */}

      {!loading && (
        <section className="cultures-overview">

          <div className="overview-card overview-main">

            <div className="overview-icon">
              <Database size={19} />
            </div>

            <div className="overview-info">
              <span>
                TOTAL CADASTRADO
              </span>

              <strong>
                {cultures.length}
              </strong>

              <small>
                {cultures.length === 1
                  ? "cultura registrada"
                  : "culturas registradas"}
              </small>
            </div>

          </div>

          <div className="overview-card">

            <div className="overview-icon">
              <Leaf size={19} />
            </div>

            <div className="overview-info">
              <span>
                CATÁLOGO
              </span>

              <strong>
                Agrícola
              </strong>

              <small>
                Culturas disponíveis para os talhões
              </small>
            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          ÁREA DE BUSCA
      ===================================================== */}

      {!loading && cultures.length > 0 && (
        <section className="cultures-toolbar">

          <div className="cultures-toolbar-title">
            <span>
              CATÁLOGO
            </span>

            <h2>
              Suas culturas
            </h2>
          </div>

          <div className="culture-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Buscar cultura, variedade ou ciclo..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="culture-search-clear"
                onClick={() => setSearch("")}
                aria-label="Limpar busca"
              >
                <X size={15} />
              </button>
            )}

          </div>

        </section>
      )}

      {/* =====================================================
          CONTEÚDO
      ===================================================== */}

      <section className="cultures-content">

        {/* ===================================================
            CARREGANDO
        =================================================== */}

        {loading ? (

          <div className="cultures-empty">

            <div className="cultures-empty-icon loading">
              <LoaderCircle
                size={25}
                className="cultures-spinner"
              />
            </div>

            <h3>
              Carregando culturas
            </h3>

            <p>
              Aguarde enquanto carregamos
              o catálogo agrícola.
            </p>

          </div>

        ) : cultures.length === 0 ? (

          /* =================================================
             NENHUMA CULTURA
          ================================================= */

          <div className="cultures-empty">

            <div className="cultures-empty-icon">
              <Sprout size={28} />
            </div>

            <span className="empty-kicker">
              CATÁLOGO VAZIO
            </span>

            <h3>
              Nenhuma cultura cadastrada
            </h3>

            <p>
              Cadastre sua primeira cultura para
              começar a organizar as informações
              utilizadas nos seus talhões.
            </p>

            <button
              type="button"
              className="empty-primary-button"
              onClick={onNewCulture}
            >
              <Plus size={16} />
              Cadastrar primeira cultura
            </button>

          </div>

        ) : filteredCultures.length === 0 ? (

          /* =================================================
             BUSCA SEM RESULTADO
          ================================================= */

          <div className="cultures-empty search-empty">

            <div className="cultures-empty-icon">
              <Search size={25} />
            </div>

            <span className="empty-kicker">
              PESQUISA
            </span>

            <h3>
              Nenhuma cultura encontrada
            </h3>

            <p>
              Não encontramos nenhuma cultura
              correspondente a "{search}".
            </p>

            <button
              type="button"
              className="empty-secondary-button"
              onClick={() => setSearch("")}
            >
              <X size={15} />
              Limpar pesquisa
            </button>

          </div>

        ) : (

          /* =================================================
             LISTA
          ================================================= */

          <div className="cultures-list">

            <div className="cultures-list-header">

              <div>
                <span>
                  REGISTROS
                </span>

                <h2>
                  {filteredCultures.length}{" "}
                  {filteredCultures.length === 1
                    ? "cultura"
                    : "culturas"}
                </h2>
              </div>

              {search && (
                <div className="search-result-label">
                  Busca por:
                  <strong>
                    "{search}"
                  </strong>
                </div>
              )}

            </div>

            {filteredCultures.map((culture) => (

              <article
                className="culture-card"
                key={culture.id}
              >

                {/* =================================================
                    IDENTIDADE
                ================================================= */}

                <div className="culture-main">

                  <div className="culture-icon">
                    <Sprout size={22} />
                  </div>

                  <div className="culture-info">

                    <div className="culture-name-row">

                      <h3>
                        {culture.name ||
                          "Cultura sem nome"}
                      </h3>

                    </div>

                    <div className="culture-tags">

                      {culture.variety && (
                        <span className="culture-tag">
                          <Leaf size={12} />
                          {culture.variety}
                        </span>
                      )}

                      {culture.cycle && (
                        <span className="culture-tag">
                          <CalendarDays size={12} />
                          {culture.cycle}
                        </span>
                      )}

                    </div>

                    {culture.observations && (
                      <div className="culture-note">

                        <FileText size={13} />

                        <span>
                          {culture.observations}
                        </span>

                      </div>
                    )}

                  </div>

                </div>

                {/* =================================================
                    AÇÕES
                ================================================= */}

                <div className="culture-actions">

                  <button
                    type="button"
                    className="culture-edit-button"
                    onClick={() =>
                      onEditCulture(culture)
                    }
                  >
                    <Pencil size={15} />
                    Editar
                  </button>

                  <button
                    type="button"
                    className="culture-delete-button"
                    onClick={() =>
                      handleDelete(culture.id)
                    }
                  >
                    <Trash2 size={15} />
                    Excluir
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}

export default Cultures;
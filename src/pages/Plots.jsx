import { useEffect, useState } from "react";

import {
  getPlotsByProperty,
  deletePlot,
} from "../services/plotService";

import {
  Building2,
  Sprout,
  MapPin,
  Ruler,
  Mountain,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  ArrowRight,
  LoaderCircle,
  Search,
} from "lucide-react";

import "../styles/plots.css";

function Plots({
  property,
  onNewPlot,
  onEditPlot,
  onBack,
}) {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     CARREGAR TALHÕES
  ========================================================= */

  async function loadPlots() {
    if (!property?.id) {
      setPlots([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getPlotsByProperty(property.id);

      setPlots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "ERRO AO CARREGAR TALHÕES:",
        error
      );

      setPlots([]);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CARREGAMENTO INICIAL
  ========================================================= */

  useEffect(() => {
    loadPlots();
  }, [property]);

  /* =========================================================
     EXCLUIR TALHÃO
  ========================================================= */

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este talhão?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePlot(id);

      await loadPlots();
    } catch (error) {
      console.error(
        "ERRO AO EXCLUIR TALHÃO:",
        error
      );

      alert(
        "Não foi possível excluir o talhão."
      );
    }
  }

  /* =========================================================
     TELA
  ========================================================= */

  return (
    <main className="plots-page">

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <div className="plots-heading">

        <div className="plots-heading-content">

          <span className="home-label">
            PROPRIEDADE
          </span>

          <div className="plots-title-row">

            <div className="plots-title-icon">
              <Building2
                size={21}
                strokeWidth={1.8}
              />
            </div>

            <h2>
              {property?.name || "Talhões"}
            </h2>

          </div>

          <p>
            Gerencie os talhões desta propriedade.
          </p>

        </div>

        <button
          type="button"
          className="primary-button plots-new-button"
          onClick={onNewPlot}
          disabled={!property}
        >
          <Plus
            size={16}
            strokeWidth={2}
          />

          Novo talhão
        </button>

      </div>

      {/* =====================================================
          CAMINHO / VOLTAR
      ===================================================== */}

      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        <ArrowLeft
          size={15}
          strokeWidth={1.9}
        />

        Voltar para propriedades
      </button>

      {/* =====================================================
          RESUMO
      ===================================================== */}

      {property && (
        <div className="plots-summary">

          <div className="plots-summary-card">

            <div className="plots-summary-icon">
              <Sprout
                size={17}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <span>Talhões cadastrados</span>

              <strong>
                {plots.length}
              </strong>
            </div>

          </div>

          <div className="plots-summary-card">

            <div className="plots-summary-icon">
              <Building2
                size={17}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <span>Propriedade</span>

              <strong className="summary-property-name">
                {property.name}
              </strong>
            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          CONTEÚDO
      ===================================================== */}

      <section className="plots-content">

        {!property ? (

          /* =================================================
             NENHUMA PROPRIEDADE
          ================================================= */

          <div className="empty-state">

            <div className="empty-icon">
              <Building2
                size={25}
                strokeWidth={1.7}
              />
            </div>

            <span className="empty-kicker">
              TALHÕES
            </span>

            <h3>
              Nenhuma propriedade selecionada
            </h3>

            <p>
              Selecione uma propriedade para
              visualizar seus talhões.
            </p>

            <button
              type="button"
              className="secondary-button"
              onClick={onBack}
            >
              <ArrowLeft
                size={15}
                strokeWidth={1.9}
              />

              Voltar para propriedades
            </button>

          </div>

        ) : loading ? (

          /* =================================================
             CARREGANDO
          ================================================= */

          <div className="empty-state loading-state">

            <LoaderCircle
              className="loading-spinner"
              size={30}
              strokeWidth={1.8}
            />

            <h3>
              Carregando talhões...
            </h3>

            <p>
              Aguarde enquanto buscamos os
              registros desta propriedade.
            </p>

          </div>

        ) : plots.length === 0 ? (

          /* =================================================
             NENHUM TALHÃO
          ================================================= */

          <div className="empty-state">

            <div className="empty-icon">
              <Sprout
                size={26}
                strokeWidth={1.7}
              />
            </div>

            <span className="empty-kicker">
              TALHÕES
            </span>

            <h3>
              Nenhum talhão cadastrado
            </h3>

            <p>
              Esta propriedade ainda não possui
              talhões cadastrados.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={onNewPlot}
            >
              <Plus
                size={16}
                strokeWidth={2}
              />

              Cadastrar primeiro talhão
            </button>

          </div>

        ) : (

          /* =================================================
             LISTA DE TALHÕES
          ================================================= */

          <div className="plots-list">

            <div className="plots-list-heading">

              <div>
                <span className="section-kicker">
                  ORGANIZAÇÃO DA PROPRIEDADE
                </span>

                <h3>
                  Talhões cadastrados
                </h3>
              </div>

              <span className="plots-count">
                {plots.length}{" "}
                {plots.length === 1
                  ? "talhão"
                  : "talhões"}
              </span>

            </div>

            {plots.map((plot) => (

              <article
                className="plot-card"
                key={plot.id}
              >

                {/* =================================================
                    INFORMAÇÕES
                ================================================= */}

                <div className="plot-card-content">

                  <div className="plot-icon">
                    <Sprout
                      size={21}
                      strokeWidth={1.7}
                    />
                  </div>

                  <div className="plot-info">

                    <h3>
                      {plot.name ||
                        "Talhão sem nome"}
                    </h3>

                    <div className="plot-details">

                      {plot.culture && (
                        <span className="plot-detail">
                          <Sprout
                            size={13}
                            strokeWidth={1.7}
                          />

                          <span>
                            <strong>
                              Cultura
                            </strong>

                            {plot.culture}
                          </span>
                        </span>
                      )}

                      {plot.area && (
                        <span className="plot-detail">
                          <Ruler
                            size={13}
                            strokeWidth={1.7}
                          />

                          <span>
                            <strong>
                              Área
                            </strong>

                            {plot.area}
                          </span>
                        </span>
                      )}

                      {plot.soil && (
                        <span className="plot-detail">
                          <Mountain
                            size={13}
                            strokeWidth={1.7}
                          />

                          <span>
                            <strong>
                              Solo
                            </strong>

                            {plot.soil}
                          </span>
                        </span>
                      )}

                    </div>

                  </div>

                </div>

                {/* =================================================
                    AÇÕES
                ================================================= */}

                <div className="plot-actions">

                  <button
                    type="button"
                    className="plot-action-button edit"
                    onClick={() =>
                      onEditPlot(plot)
                    }
                  >
                    <Pencil
                      size={14}
                      strokeWidth={1.8}
                    />

                    Editar
                  </button>

                  <button
                    type="button"
                    className="plot-action-button delete"
                    onClick={() =>
                      handleDelete(plot.id)
                    }
                  >
                    <Trash2
                      size={14}
                      strokeWidth={1.8}
                    />

                    Excluir
                  </button>

                  <span className="plot-arrow">
                    <ArrowRight
                      size={16}
                      strokeWidth={1.7}
                    />
                  </span>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}

export default Plots;
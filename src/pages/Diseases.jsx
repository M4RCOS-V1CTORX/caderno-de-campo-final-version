import { useEffect, useState } from "react";

import {
  getDiseases,
  deleteDisease,
} from "../services/diseaseService";

import "../styles/diseases.css";

function Diseases({
  onNewDisease,
  onEditDisease,
  onBack,
}) {
  const [diseases, setDiseases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================================================
  // CARREGAR DOENÇAS
  // =========================================================

  async function loadDiseases() {
    try {
      setLoading(true);

      const data = await getDiseases();

      setDiseases(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "ERRO AO CARREGAR DOENÇAS:",
        error
      );

      setDiseases([]);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // CARREGAMENTO INICIAL
  // =========================================================

  useEffect(() => {
    loadDiseases();
  }, []);

  // =========================================================
  // FILTRO
  // =========================================================

  const filteredDiseases = diseases.filter(
    (disease) => {
      const term = search
        .toLowerCase()
        .trim();

      if (!term) {
        return true;
      }

      return (
        disease.name
          ?.toLowerCase()
          .includes(term) ||
        disease.description
          ?.toLowerCase()
          .includes(term)
      );
    }
  );

  // =========================================================
  // EXCLUIR
  // =========================================================

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta doença?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDisease(id);

      await loadDiseases();
    } catch (error) {
      console.error(
        "ERRO AO EXCLUIR DOENÇA:",
        error
      );

      alert(
        "Não foi possível excluir a doença."
      );
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="diseases-page">

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <section className="diseases-heading">

        <div className="diseases-heading-content">

          <button
            type="button"
            className="diseases-back-button"
            onClick={onBack}
          >
            ← Voltar
          </button>

          <span className="diseases-label">
            BIBLIOTECA
          </span>

          <h2>
            Doenças
          </h2>

          <p>
            Cadastre e consulte doenças
            encontradas nas atividades de campo.
          </p>

        </div>

        <button
          type="button"
          className="diseases-primary-button"
          onClick={onNewDisease}
        >
          + Nova doença
        </button>

      </section>

      {/* =====================================================
          CONTEÚDO
      ===================================================== */}

      <section className="diseases-content">

        <div className="diseases-section-heading">

          <div>
            <h3>
              Doenças cadastradas
            </h3>

            <p>
              Consulte e gerencie as doenças
              utilizadas nos registros.
            </p>
          </div>

        </div>

        {/* ===================================================
            PESQUISA
        =================================================== */}

        <div className="diseases-search">

          <span>
            🔎
          </span>

          <input
            type="text"
            placeholder="Pesquisar doença..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        {/* ===================================================
            CARREGANDO
        =================================================== */}

        {loading ? (

          <div className="diseases-empty">

            <div className="diseases-empty-icon">
              ⏳
            </div>

            <h3>
              Carregando doenças
            </h3>

            <p>
              Aguarde enquanto buscamos as doenças cadastradas.
            </p>

          </div>

        ) : diseases.length === 0 ? (

          /* =================================================
             NENHUMA DOENÇA
          ================================================= */

          <div className="diseases-empty">

            <div className="diseases-empty-icon">
              🦠
            </div>

            <h3>
              Nenhuma doença cadastrada
            </h3>

            <p>
              Cadastre sua primeira doença para
              começar a montar sua biblioteca.
            </p>

            <button
              type="button"
              className="diseases-primary-button"
              onClick={onNewDisease}
            >
              + Cadastrar primeira doença
            </button>

          </div>

        ) : filteredDiseases.length === 0 ? (

          /* =================================================
             PESQUISA SEM RESULTADO
          ================================================= */

          <div className="diseases-empty">

            <div className="diseases-empty-icon">
              🔎
            </div>

            <h3>
              Nenhuma doença encontrada
            </h3>

            <p>
              Tente pesquisar utilizando outro termo.
            </p>

          </div>

        ) : (

          /* =================================================
             LISTA DE DOENÇAS
          ================================================= */

          <div className="diseases-list">

            {filteredDiseases.map(
              (disease) => (

                <article
                  className="disease-card"
                  key={disease.id}
                >

                  <div className="disease-card-content">

                    <div className="disease-icon">
                      🦠
                    </div>

                    <div className="disease-info">

                      <h4>
                        {disease.name ||
                          "Doença sem nome"}
                      </h4>

                      {disease.description && (
                        <p>
                          {disease.description}
                        </p>
                      )}

                    </div>

                  </div>

                  <div className="disease-actions">

                    <button
                      type="button"
                      className="diseases-secondary-button"
                      onClick={() =>
                        onEditDisease(disease)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="diseases-delete-button"
                      onClick={() =>
                        handleDelete(disease.id)
                      }
                    >
                      Excluir
                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default Diseases;
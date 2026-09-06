
import { useEffect, useState } from "react";

import {
  getPests,
  deletePest,
} from "../services/pestService";

import "../styles/pests.css";

function Pests({
  onNewPest,
  onEditPest,
  onBack,
}) {
  const [pests, setPests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadPests() {
    try {
      setLoading(true);

      const data = await getPests();

      setPests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "ERRO AO CARREGAR PRAGAS:",
        error
      );

      setPests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPests();
  }, []);

  const filteredPests = pests.filter((pest) => {
    const term = search
      .toLowerCase()
      .trim();

    if (!term) {
      return true;
    }

    return (
      pest.name
        ?.toLowerCase()
        .includes(term) ||
      pest.description
        ?.toLowerCase()
        .includes(term)
    );
  });

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta praga?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePest(id);
      await loadPests();
    } catch (error) {
      console.error(
        "ERRO AO EXCLUIR PRAGA:",
        error
      );

      alert(
        "Não foi possível excluir a praga."
      );
    }
  }

  return (
    <main className="pests-page">

      <section className="pests-heading">

        <div className="pests-heading-content">

          <button
            type="button"
            className="pests-back-button"
            onClick={onBack}
          >
            ← Voltar
          </button>

          <span className="pests-label">
            BIBLIOTECA
          </span>

          <h2>
            Pragas
          </h2>

          <p>
            Cadastre e consulte as pragas
            identificadas nas atividades de campo.
          </p>

        </div>

        <button
          type="button"
          className="pests-primary-button"
          onClick={onNewPest}
        >
          + Nova praga
        </button>

      </section>

      <section className="pests-content">

        <div className="pests-section-heading">

          <div>
            <h3>
              Pragas cadastradas
            </h3>

            <p>
              Mantenha sua biblioteca de pragas
              organizada para facilitar os registros.
            </p>
          </div>

          <strong className="pests-count">
            {pests.length} cadastradas
          </strong>

        </div>

        <div className="pests-search">

          <span>
            🔎
          </span>

          <input
            type="text"
            placeholder="Pesquisar praga..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        {loading ? (

          <div className="pests-empty">

            <div className="pests-empty-icon">
              ⏳
            </div>

            <h3>
              Carregando pragas
            </h3>

            <p>
              Aguarde enquanto buscamos as pragas cadastradas.
            </p>

          </div>

        ) : pests.length === 0 ? (

          <div className="pests-empty">

            <div className="pests-empty-icon">
              🐛
            </div>

            <h3>
              Nenhuma praga cadastrada
            </h3>

            <p>
              Cadastre sua primeira praga para começar
              a montar sua biblioteca.
            </p>

            <button
              type="button"
              className="pests-primary-button"
              onClick={onNewPest}
            >
              + Cadastrar primeira praga
            </button>

          </div>

        ) : filteredPests.length === 0 ? (

          <div className="pests-empty">

            <div className="pests-empty-icon">
              🔎
            </div>

            <h3>
              Nenhuma praga encontrada
            </h3>

            <p>
              Tente pesquisar utilizando outro termo.
            </p>

          </div>

        ) : (

          <div className="pests-list">

            {filteredPests.map((pest) => (

              <article
                className="pest-card"
                key={pest.id}
              >

                <div className="pest-card-content">

                  <div className="pest-icon">
                    🐛
                  </div>

                  <div className="pest-info">

                    <h4>
                      {pest.name ||
                        "Praga sem nome"}
                    </h4>

                    {pest.description && (
                      <p>
                        {pest.description}
                      </p>
                    )}

                  </div>

                </div>

                <div className="pest-actions">

                  <button
                    type="button"
                    className="pests-secondary-button"
                    onClick={() =>
                      onEditPest(pest)
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="pests-delete-button"
                    onClick={() =>
                      handleDelete(pest.id)
                    }
                  >
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

export default Pests;

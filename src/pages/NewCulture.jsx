import { useEffect, useState } from "react";

import {
  createCulture,
  updateCulture,
} from "../services/cultureService";

import "../styles/newCulture.css";

function NewCulture({
  onCancel,
  onCultureCreated,
  cultureToEdit,
}) {
  const [name, setName] = useState("");
  const [variety, setVariety] = useState("");
  const [cycle, setCycle] = useState("");
  const [observations, setObservations] = useState("");

  /* =========================================================
     CARREGAR CULTURA PARA EDIÇÃO
  ========================================================= */

  useEffect(() => {
    if (cultureToEdit) {
      setName(cultureToEdit.name || "");
      setVariety(cultureToEdit.variety || "");
      setCycle(cultureToEdit.cycle || "");
      setObservations(
        cultureToEdit.observations || ""
      );
    } else {
      setName("");
      setVariety("");
      setCycle("");
      setObservations("");
    }
  }, [cultureToEdit]);

  /* =========================================================
     SALVAR
  ========================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Informe o nome da cultura.");
      return;
    }

    const culture = {
      name,
      variety,
      cycle,
      observations,
    };

    try {
      if (cultureToEdit) {
        await updateCulture(
          cultureToEdit.id,
          culture
        );

        alert(
          "Cultura atualizada com sucesso!"
        );
      } else {
        await createCulture(culture);

        alert(
          "Cultura cadastrada com sucesso!"
        );
      }

      if (onCultureCreated) {
        onCultureCreated();
      }
    } catch (error) {
      console.error(
        "ERRO AO SALVAR CULTURA:",
        error
      );

      alert(
        "Erro ao salvar a cultura. Veja o Console (F12)."
      );
    }
  }

  return (
    <main className="new-culture">

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <div className="page-heading">

        <span className="home-label">
          CULTURAS
        </span>

        <h2>
          {cultureToEdit
            ? "Editar cultura"
            : "Nova cultura"}
        </h2>

        <p>
          {cultureToEdit
            ? "Atualize as informações da cultura."
            : "Cadastre uma nova cultura para utilizar no sistema."}
        </p>

      </div>

      {/* =====================================================
          FORMULÁRIO
      ===================================================== */}

      <form
        className="culture-form"
        onSubmit={handleSubmit}
      >

        <div className="form-section">

          <h3>
            Informações da cultura
          </h3>

          <div className="form-grid">

            {/* =================================================
                NOME
            ================================================= */}

            <div className="form-group full">

              <label htmlFor="culture-name">
                Nome da cultura
              </label>

              <input
                id="culture-name"
                type="text"
                placeholder="Ex.: Café"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />

            </div>

            {/* =================================================
                VARIEDADE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="culture-variety">
                Variedade
              </label>

              <input
                id="culture-variety"
                type="text"
                placeholder="Ex.: Arábica"
                value={variety}
                onChange={(event) =>
                  setVariety(event.target.value)
                }
              />

            </div>

            {/* =================================================
                CICLO
            ================================================= */}

            <div className="form-group">

              <label htmlFor="culture-cycle">
                Ciclo
              </label>

              <input
                id="culture-cycle"
                type="text"
                placeholder="Ex.: 12 meses"
                value={cycle}
                onChange={(event) =>
                  setCycle(event.target.value)
                }
              />

            </div>

            {/* =================================================
                OBSERVAÇÕES
            ================================================= */}

            <div className="form-group full">

              <label htmlFor="culture-observations">
                Observações
              </label>

              <textarea
                id="culture-observations"
                placeholder="Informações adicionais sobre esta cultura..."
                value={observations}
                onChange={(event) =>
                  setObservations(
                    event.target.value
                  )
                }
                rows={5}
              />

            </div>

          </div>

        </div>

        {/* =====================================================
            AÇÕES
        ===================================================== */}

        <div className="form-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            {cultureToEdit
              ? "Salvar alterações"
              : "Salvar cultura"}
          </button>

        </div>

      </form>

    </main>
  );
}

export default NewCulture;
import { useEffect, useState } from "react";

import {
  createDisease,
  updateDisease,
} from "../services/diseaseService";

import "../styles/newDisease.css";

function NewDisease({
  onCancel,
  onDiseaseCreated,
  diseaseToEdit,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // =========================================================
  // PREENCHER FORMULÁRIO NA EDIÇÃO
  // =========================================================

  useEffect(() => {
    if (diseaseToEdit) {
      setName(diseaseToEdit.name || "");
      setDescription(diseaseToEdit.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [diseaseToEdit]);

  // =========================================================
  // SALVAR
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Informe o nome da doença.");
      return;
    }

    const disease = {
      name: name.trim(),
      description: description.trim(),
    };

    try {
      // =====================================================
      // EDITAR
      // =====================================================

      if (diseaseToEdit) {
        await updateDisease(
          diseaseToEdit.id,
          disease
        );

        alert("Doença atualizada com sucesso!");
      }

      // =====================================================
      // NOVA DOENÇA
      // =====================================================

      else {
        await createDisease(disease);

        alert("Doença cadastrada com sucesso!");
      }

      // =====================================================
      // ATUALIZAR LISTA / VOLTAR
      // =====================================================

      if (onDiseaseCreated) {
        onDiseaseCreated();
      } else if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error(
        "ERRO AO SALVAR DOENÇA:",
        error
      );

      alert(
        "Erro ao salvar a doença. Veja o Console (F12)."
      );
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="new-disease">

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <header className="page-heading">

        <div className="page-heading-content">

          <span className="home-label">
            BIBLIOTECA
          </span>

          <h2>
            {diseaseToEdit
              ? "Editar doença"
              : "Nova doença"}
          </h2>

          <p>
            {diseaseToEdit
              ? "Atualize as informações desta doença."
              : "Cadastre uma doença para utilizar nos registros de campo."}
          </p>

        </div>

      </header>

      {/* =====================================================
          FORMULÁRIO
      ===================================================== */}

      <form
        className="disease-form"
        onSubmit={handleSubmit}
      >

        {/* ===================================================
            INFORMAÇÕES
        =================================================== */}

        <section className="form-section">

          <div className="form-section-header">

            <div className="form-section-icon">
              🦠
            </div>

            <div>

              <h3>
                Informações da doença
              </h3>

              <p>
                Preencha os dados principais da doença.
              </p>

            </div>

          </div>

          <div className="form-grid">

            {/* NOME */}

            <div className="form-group full">

              <label htmlFor="disease-name">
                Nome da doença
              </label>

              <input
                id="disease-name"
                type="text"
                placeholder="Ex.: Ferrugem"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />

            </div>

            {/* DESCRIÇÃO */}

            <div className="form-group full">

              <label htmlFor="disease-description">
                Descrição
              </label>

              <textarea
                id="disease-description"
                rows="6"
                placeholder="Adicione informações sobre sintomas, características ou observações da doença..."
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
              />

            </div>

          </div>

        </section>

        {/* ===================================================
            AÇÕES
        =================================================== */}

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
            {diseaseToEdit
              ? "Salvar alterações"
              : "Salvar doença"}
          </button>

        </div>

      </form>

    </main>
  );
}

export default NewDisease;
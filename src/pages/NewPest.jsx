
import { useEffect, useState } from "react";

import {
  createPest,
  updatePest,
} from "../services/pestService";

import "../styles/newPest.css";

function NewPest({
  onCancel,
  onPestCreated,
  pestToEdit,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (pestToEdit) {
      setName(pestToEdit.name || "");
      setDescription(
        pestToEdit.description || ""
      );
    } else {
      setName("");
      setDescription("");
    }
  }, [pestToEdit]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Informe o nome da praga.");
      return;
    }

    const pest = {
      name: name.trim(),
      description: description.trim(),
    };

    try {
      if (pestToEdit) {
        await updatePest(
          pestToEdit.id,
          pest
        );

        alert("Praga atualizada com sucesso!");
      } else {
        await createPest(pest);

        alert("Praga cadastrada com sucesso!");
      }

      if (onPestCreated) {
        onPestCreated();
      } else if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error(
        "ERRO AO SALVAR PRAGA:",
        error
      );

      alert(
        "Erro ao salvar a praga. Veja o Console (F12)."
      );
    }
  }

  return (
    <main className="new-pest">

      <header className="page-heading">

        <div className="page-heading-content">

          <span className="home-label">
            BIBLIOTECA
          </span>

          <h2>
            {pestToEdit
              ? "Editar praga"
              : "Nova praga"}
          </h2>

          <p>
            {pestToEdit
              ? "Atualize as informações desta praga."
              : "Cadastre uma praga para utilizar nos registros de campo."}
          </p>

        </div>

      </header>

      <form
        className="pest-form"
        onSubmit={handleSubmit}
      >

        <section className="form-section">

          <div className="form-section-header">

            <div className="form-section-icon">
              🐛
            </div>

            <div>

              <h3>
                Informações da praga
              </h3>

              <p>
                Preencha os dados principais da praga.
              </p>

            </div>

          </div>

          <div className="form-grid">

            <div className="form-group full">

              <label htmlFor="pest-name">
                Nome da praga
              </label>

              <input
                id="pest-name"
                type="text"
                placeholder="Ex.: Lagarta-do-cartucho"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />

            </div>

            <div className="form-group full">

              <label htmlFor="pest-description">
                Descrição
              </label>

              <textarea
                id="pest-description"
                rows="6"
                placeholder="Adicione informações sobre identificação, características ou observações..."
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
              />

            </div>

          </div>

        </section>

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
            {pestToEdit
              ? "Salvar alterações"
              : "Salvar praga"}
          </button>

        </div>

      </form>

    </main>
  );
}

export default NewPest;

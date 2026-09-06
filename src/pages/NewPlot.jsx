import { useEffect, useState } from "react";

import {
  createPlot,
  updatePlot,
} from "../services/plotService";

import { getCultures } from "../services/cultureService";

import {
  Building2,
  Sprout,
  Ruler,
  Mountain,
  Save,
  X,
  LoaderCircle,
  Leaf,
} from "lucide-react";

import "../styles/newPlot.css";

function NewPlot({
  property,
  onCancel,
  onPlotCreated,
  plotToEdit,
}) {
  const [name, setName] = useState("");
  const [culture, setCulture] = useState("");
  const [soil, setSoil] = useState("");
  const [area, setArea] = useState("");
  const [cultures, setCultures] = useState([]);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // CARREGAR CULTURAS
  // =========================================================

  async function loadCultures() {
    try {
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
    }
  }

  // =========================================================
  // CARREGAR DADOS
  // =========================================================

  useEffect(() => {
    loadCultures();

    if (plotToEdit) {
      setName(plotToEdit.name || "");
      setCulture(plotToEdit.culture || "");
      setSoil(plotToEdit.soil || "");
      setArea(plotToEdit.area || "");
    } else {
      setName("");
      setCulture("");
      setSoil("");
      setArea("");
    }
  }, [plotToEdit]);

  // =========================================================
  // SALVAR
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (!property?.id) {
      alert("Nenhuma propriedade foi selecionada.");
      return;
    }

    if (!name.trim()) {
      alert("Informe o nome do talhão.");
      return;
    }

    const plot = {
      propertyId: property.id,
      name: name.trim(),
      culture,
      soil: soil.trim(),
      area: area.trim(),
    };

    try {
      setSaving(true);

      if (plotToEdit) {
        await updatePlot(
          plotToEdit.id,
          plot
        );

        alert("Talhão atualizado com sucesso!");
      } else {
        await createPlot(plot);

        alert("Talhão cadastrado com sucesso!");
      }

      if (onPlotCreated) {
        onPlotCreated();
      }
    } catch (error) {
      console.error(
        "ERRO AO SALVAR TALHÃO:",
        error
      );

      alert(
        "Erro ao salvar o talhão. Veja o Console (F12)."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="new-plot">
      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <div className="page-heading">
        <div className="heading-icon">
          <Sprout size={20} />
        </div>

        <div>
          <span className="home-label">
            TALHÕES
          </span>

          <h2>
            {plotToEdit
              ? "Editar talhão"
              : "Novo talhão"}
          </h2>

          <p>
            {property
              ? `Cadastre um talhão da propriedade ${property.name}.`
              : "Cadastre as informações do talhão."}
          </p>
        </div>
      </div>

      {/* =====================================================
          FORMULÁRIO
      ===================================================== */}

      <form
        className="plot-form"
        onSubmit={handleSubmit}
      >
        <div className="form-section">

          <div className="section-header">
            <div className="section-icon">
              <Leaf size={18} />
            </div>

            <div>
              <span>CADASTRO</span>
              <h3>Informações do talhão</h3>
            </div>
          </div>

          <div className="form-grid">

            {/* =================================================
                PROPRIEDADE
            ================================================= */}

            <div className="form-group full">
              <label>
                Propriedade
              </label>

              <div className="property-selected">
                <div className="property-icon">
                  <Building2 size={18} />
                </div>

                <div>
                  <span>Propriedade vinculada</span>

                  <strong>
                    {property?.name ||
                      "Nenhuma propriedade selecionada"}
                  </strong>
                </div>
              </div>
            </div>

            {/* =================================================
                NOME DO TALHÃO
            ================================================= */}

            <div className="form-group full">
              <label htmlFor="plot-name">
                Nome do talhão
              </label>

              <div className="input-wrapper">
                <Sprout size={17} />

                <input
                  id="plot-name"
                  type="text"
                  placeholder="Ex.: Talhão Norte"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* =================================================
                CULTURA
            ================================================= */}

            <div className="form-group">
              <label htmlFor="culture">
                Cultura
              </label>

              <div className="input-wrapper">
                <Sprout size={17} />

                <select
                  id="culture"
                  value={culture}
                  onChange={(event) =>
                    setCulture(event.target.value)
                  }
                >
                  <option value="">
                    Selecione uma cultura
                  </option>

                  {cultures.map((item) => (
                    <option
                      key={item.id}
                      value={item.name}
                    >
                      {item.name}
                      {item.variety
                        ? ` — ${item.variety}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* =================================================
                ÁREA
            ================================================= */}

            <div className="form-group">
              <label htmlFor="area">
                Área
              </label>

              <div className="input-wrapper">
                <Ruler size={17} />

                <input
                  id="area"
                  type="text"
                  placeholder="Ex.: 12,5 ha"
                  value={area}
                  onChange={(event) =>
                    setArea(event.target.value)
                  }
                />
              </div>
            </div>

            {/* =================================================
                SOLO
            ================================================= */}

            <div className="form-group full">
              <label htmlFor="soil">
                Tipo de solo
              </label>

              <div className="input-wrapper">
                <Mountain size={17} />

                <input
                  id="soil"
                  type="text"
                  placeholder="Ex.: Latossolo"
                  value={soil}
                  onChange={(event) =>
                    setSoil(event.target.value)
                  }
                />
              </div>
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
            disabled={saving}
          >
            <X size={16} />
            Cancelar
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={!property || saving}
          >
            {saving ? (
              <>
                <LoaderCircle
                  size={16}
                  className="loading-icon"
                />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />

                {plotToEdit
                  ? "Salvar alterações"
                  : "Salvar talhão"}
              </>
            )}
          </button>

        </div>
      </form>
    </main>
  );
}

export default NewPlot;
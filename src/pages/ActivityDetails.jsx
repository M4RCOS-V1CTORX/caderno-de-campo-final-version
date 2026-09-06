import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Bug,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Image as ImageIcon,
  Layers3,
  Leaf,
  MapPin,
  Mountain,
  Package,
  Pencil,
  Ruler,
  Scale,
  Sprout,
  Wrench,
  X,
} from "lucide-react";

import { getPropertyById } from "../services/propertyService";
import { getPlotById } from "../services/plotService";
import { getPhotosByActivity } from "../services/photoService";
import { getProductById } from "../services/productService";
import { getCultures } from "../services/cultureService";

import "../styles/activityDetails.css";

function ActivityDetails({ activity, onBack, onEdit }) {
  const [property, setProperty] = useState(null);
  const [plot, setPlot] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [productData, setProductData] = useState(null);
  const [cultureData, setCultureData] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  /*
   * =========================================================
   * CARREGAR TODOS OS DADOS RELACIONADOS
   * =========================================================
   */
  useEffect(() => {
    let mounted = true;

    async function loadDetails() {
      try {
        /*
         * -----------------------------------------------------
         * PROPRIEDADE
         * -----------------------------------------------------
         */
        let propertyResult = null;

        if (activity?.propertyId) {
          propertyResult = await getPropertyById(activity.propertyId);
        }

        /*
         * -----------------------------------------------------
         * TALHÃO
         * -----------------------------------------------------
         */
        let plotResult = null;

        if (activity?.plotId) {
          plotResult = await getPlotById(activity.plotId);
        }

        /*
         * -----------------------------------------------------
         * FOTOS
         * -----------------------------------------------------
         */
        let photosResult = [];

        if (activity?.id) {
          photosResult = await getPhotosByActivity(activity.id);
        }

        /*
         * -----------------------------------------------------
         * PRODUTO
         * -----------------------------------------------------
         */
        let productResult = null;

        if (activity?.productId) {
          productResult = await getProductById(activity.productId);
        }

        /*
         * -----------------------------------------------------
         * CULTURA
         *
         * A cultura do registro vem do talhão.
         *
         * Exemplo:
         * plot.culture = "Milho"
         *
         * Depois procuramos "Milho" dentro da tabela cultures.
         * -----------------------------------------------------
         */
        let foundCulture = null;

        try {
          const culturesResult = await getCultures();

          if (Array.isArray(culturesResult)) {
            const cultureName =
              activity?.selectedCulture ||
              activity?.culture ||
              plotResult?.culture ||
              "";

            if (cultureName) {
              const normalizedCultureName = String(cultureName)
                .trim()
                .toLowerCase();

              foundCulture =
                culturesResult.find((culture) => {
                  const name = String(culture?.name || "")
                    .trim()
                    .toLowerCase();

                  return name === normalizedCultureName;
                }) || null;
            }
          }
        } catch (cultureError) {
          console.error(
            "ERRO AO CARREGAR CULTURA:",
            cultureError
          );
        }

        /*
         * -----------------------------------------------------
         * ATUALIZAR ESTADOS SOMENTE DEPOIS DE TUDO CARREGADO
         * -----------------------------------------------------
         */
        if (!mounted) return;

        setProperty(propertyResult || null);
        setPlot(plotResult || null);
        setPhotos(Array.isArray(photosResult) ? photosResult : []);
        setProductData(productResult || null);
        setCultureData(foundCulture || null);
      } catch (error) {
        console.error(
          "ERRO AO CARREGAR DETALHES DA ATIVIDADE:",
          error
        );

        if (!mounted) return;

        setProperty(null);
        setPlot(null);
        setPhotos([]);
        setProductData(null);
        setCultureData(null);
      }
    }

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [activity]);

  /*
   * =========================================================
   * CRIAR URL DAS FOTOS
   * =========================================================
   */
  useEffect(() => {
    let mounted = true;
    const urls = [];

    async function createPhotoUrls() {
      try {
        for (const photo of photos) {
          if (!photo?.file) continue;

          const url = URL.createObjectURL(photo.file);
          urls.push(url);
        }

        if (mounted) {
          setPhotoUrls(urls);
        }
      } catch (error) {
        console.error("ERRO AO CARREGAR FOTOS:", error);

        if (mounted) {
          setPhotoUrls([]);
        }
      }
    }

    createPhotoUrls();

    return () => {
      mounted = false;

      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [photos]);

  /*
   * =========================================================
   * TECLADO DA GALERIA
   * =========================================================
   */
  useEffect(() => {
    function handleKeyDown(event) {
      if (selectedPhoto === null) return;

      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }

      if (event.key === "ArrowLeft") {
        handlePreviousPhoto();
      }

      if (event.key === "ArrowRight") {
        handleNextPhoto();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto, photoUrls.length]);

  /*
   * =========================================================
   * FORMATAR DATA
   * =========================================================
   */
  function formatDate(date) {
    if (!date) {
      return "Não informado";
    }

    try {
      /*
       * Datas do input type="date" vêm como:
       * YYYY-MM-DD
       *
       * Criar diretamente com new Date("YYYY-MM-DD")
       * pode gerar problemas de fuso horário.
       *
       * Por isso tratamos esse formato separadamente.
       */
      if (
        typeof date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(date)
      ) {
        const [year, month, day] = date.split("-");

        return `${day}/${month}/${year}`;
      }

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "Não informado";
      }

      return parsedDate.toLocaleDateString("pt-BR");
    } catch {
      return "Não informado";
    }
  }

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */
  function normalizeStatus(status) {
    if (!status) {
      return "Não informado";
    }

    const normalized = String(status)
      .trim()
      .toLowerCase();

    if (
      normalized === "concluida" ||
      normalized === "concluído" ||
      normalized === "concluida" ||
      normalized === "concluído"
    ) {
      return "Concluído";
    }

    if (
      normalized === "em andamento" ||
      normalized === "andamento" ||
      normalized === "in progress"
    ) {
      return "Em andamento";
    }

    if (
      normalized === "planejada" ||
      normalized === "planejado" ||
      normalized === "planned"
    ) {
      return "Planejado";
    }

    if (
      normalized === "cancelada" ||
      normalized === "cancelado" ||
      normalized === "cancelled"
    ) {
      return "Cancelado";
    }

    return status;
  }

  /*
   * =========================================================
   * QUANTIDADE DO PRODUTO
   * =========================================================
   */
  function getProductQuantity() {
    if (!activity) {
      return "Não informado";
    }

    if (
      activity.quantityValue !== undefined &&
      activity.quantityValue !== null &&
      activity.quantityValue !== ""
    ) {
      const unit = productData?.unit
        ? ` ${productData.unit}`
        : "";

      return `${activity.quantityValue}${unit}`;
    }

    if (
      activity.quantity !== undefined &&
      activity.quantity !== null &&
      activity.quantity !== ""
    ) {
      return String(activity.quantity);
    }

    return "Não informado";
  }

  /*
   * =========================================================
   * CULTURA
   * =========================================================
   */
  function getCultureName() {
    return (
      cultureData?.name ||
      activity?.selectedCulture ||
      activity?.culture ||
      plot?.culture ||
      "Não informado"
    );
  }

  /*
   * =========================================================
   * VARIEDADE
   * =========================================================
   */
  function getCultureVariety() {
    return (
      cultureData?.variety ||
      cultureData?.variedade ||
      activity?.variety ||
      "Não informado"
    );
  }

  /*
   * =========================================================
   * CICLO
   *
   * Aceita os formatos:
   * cycle
   * ciclo
   * activity.cycle
   * activity.ciclo
   * =========================================================
   */
  function getCultureCycle() {
    return (
      cultureData?.cycle ||
      cultureData?.ciclo ||
      activity?.cycle ||
      activity?.ciclo ||
      "Não informado"
    );
  }

  /*
   * =========================================================
   * ÁREA
   * =========================================================
   */
  function getPlotArea() {
    if (
      plot?.area !== undefined &&
      plot?.area !== null &&
      plot?.area !== ""
    ) {
      return plot.area;
    }

    if (
      activity?.area !== undefined &&
      activity?.area !== null &&
      activity?.area !== ""
    ) {
      return activity.area;
    }

    return "Não informado";
  }

  /*
   * =========================================================
   * SOLO
   * =========================================================
   */
  function getPlotSoil() {
    return (
      plot?.soil ||
      plot?.soilType ||
      activity?.soil ||
      "Não informado"
    );
  }

  /*
   * =========================================================
   * PRODUTO EXISTE?
   * =========================================================
   */
  function hasProduct() {
    return Boolean(
      activity?.productId ||
      activity?.product ||
      productData
    );
  }

  /*
   * =========================================================
   * FOTOS
   * =========================================================
   */
  function openPhoto(index) {
    if (!photoUrls[index]) return;

    setSelectedPhoto(index);
  }

  function closePhoto() {
    setSelectedPhoto(null);
  }

  function handlePreviousPhoto() {
    if (
      photoUrls.length === 0 ||
      selectedPhoto === null
    ) {
      return;
    }

    setSelectedPhoto((current) => {
      if (current === 0) {
        return photoUrls.length - 1;
      }

      return current - 1;
    });
  }

  function handleNextPhoto() {
    if (
      photoUrls.length === 0 ||
      selectedPhoto === null
    ) {
      return;
    }

    setSelectedPhoto((current) => {
      if (current === photoUrls.length - 1) {
        return 0;
      }

      return current + 1;
    });
  }

  /*
   * =========================================================
   * REGISTRO NÃO EXISTE
   * =========================================================
   */
  if (!activity) {
    return (
      <main className="activity-details">
        <div className="details-empty">
          <div className="details-empty-icon">
            <FileText size={26} />
          </div>

          <h2>Registro não encontrado</h2>

          <p>
            Não foi possível carregar os dados deste
            registro.
          </p>

          <button
            type="button"
            className="details-primary-button"
            onClick={onBack}
          >
            <ArrowLeft size={17} />
            Voltar
          </button>
        </div>
      </main>
    );
  }

  const status = normalizeStatus(
    activity.managementStatus
  );

  return (
    <main className="activity-details">
      {/* =====================================================
          VOLTAR
      ===================================================== */}
      <button
        type="button"
        className="details-back-button"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        Voltar para atividades
      </button>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="details-hero">
        <div className="details-hero-glow" />

        <div className="details-hero-content">
          <div className="details-eyebrow">
            <FileText size={14} />
            REGISTRO DE CAMPO
          </div>

          <h1>
            {activity.title || "Registro sem título"}
          </h1>

          <p>
            {activity.description ||
              "Detalhamento das informações registradas no campo."}
          </p>

          <div className="details-hero-meta">
            <span>
              <CalendarDays size={15} />
              {formatDate(activity.date)}
            </span>

            <span>
              <MapPin size={15} />
              {activity.location || "Local não informado"}
            </span>
          </div>
        </div>

        <div className="details-hero-side">
          <div className="details-status">
            <span className="details-status-dot" />

            <div>
              <small>STATUS DO REGISTRO</small>
              <strong>Registro salvo</strong>
            </div>
          </div>

          <div className="details-responsible">
            <span>RESPONSÁVEL TÉCNICA</span>
            <strong>Laís L. Andrade</strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          RESUMO
      ===================================================== */}
      <section className="details-summary">
        <div className="summary-item">
          <div className="summary-icon">
            <CalendarDays size={18} />
          </div>

          <div>
            <span>Data do registro</span>
            <strong>{formatDate(activity.date)}</strong>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon">
            <MapPin size={18} />
          </div>

          <div>
            <span>Local</span>
            <strong>
              {activity.location || "Não informado"}
            </strong>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Status</span>
            <strong>{status}</strong>
          </div>
        </div>
      </section>

      <div className="details-layout">
        {/* ===================================================
            CAMPO / CULTURA
        =================================================== */}
        <section className="details-card details-card-wide">
          <div className="details-card-header">
            <div className="details-card-title">
              <div className="details-card-icon">
                <Mountain size={18} />
              </div>

              <div>
                <span>INFORMAÇÕES DO CAMPO</span>
                <h2>Localização e cultura</h2>
              </div>
            </div>
          </div>

          <div className="details-grid">
            {/* PROPRIEDADE */}
            <div className="detail-item">
              <div className="detail-item-icon">
                <Building2 size={17} />
              </div>

              <div>
                <span>Propriedade</span>

                <strong>
                  {property?.name || "Não informado"}
                </strong>
              </div>
            </div>

            {/* TALHÃO */}
            <div className="detail-item">
              <div className="detail-item-icon">
                <Mountain size={17} />
              </div>

              <div>
                <span>Talhão</span>

                <strong>
                  {plot?.name || "Não informado"}
                </strong>
              </div>
            </div>

            {/* CULTURA */}
            <div className="detail-item">
              <div className="detail-item-icon">
                <Sprout size={17} />
              </div>

              <div>
                <span>Cultura</span>

                <strong>{getCultureName()}</strong>
              </div>
            </div>

            {/* VARIEDADE */}
            <div className="detail-item">
              <div className="detail-item-icon">
                <Leaf size={17} />
              </div>

              <div>
                <span>Variedade</span>

                <strong>
                  {getCultureVariety()}
                </strong>
              </div>
            </div>

            {/* CICLO */}
            <div className="detail-item">
              <div className="detail-item-icon">
                <Clock3 size={17} />
              </div>

              <div>
                <span>Ciclo</span>

                <strong>
                  {getCultureCycle()}
                </strong>
              </div>
            </div>

            {/* ÁREA */}
            <div className="detail-item">
              <div className="detail-item-icon">
                <Ruler size={17} />
              </div>

              <div>
                <span>Área</span>

                <strong>{getPlotArea()}</strong>
              </div>
            </div>

            {/* SOLO */}
            <div className="detail-item">
              <div className="detail-item-icon">
                <Layers3 size={17} />
              </div>

              <div>
                <span>Solo</span>

                <strong>{getPlotSoil()}</strong>
              </div>
            </div>

            {/* LOCAL */}
            <div className="detail-item">
              <div className="detail-item-icon">
                <MapPin size={17} />
              </div>

              <div>
                <span>Local do registro</span>

                <strong>
                  {activity.location ||
                    "Não informado"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            MANEJO
        =================================================== */}
        <section className="details-card">
          <div className="details-card-header">
            <div className="details-card-title">
              <div className="details-card-icon">
                <Wrench size={18} />
              </div>

              <div>
                <span>MANEJO</span>
                <h2>Informações do manejo</h2>
              </div>
            </div>
          </div>

          <div className="details-list">
            <div className="details-list-row">
              <span>Tipo de manejo</span>

              <strong>
                {activity.managementType ||
                  "Não informado"}
              </strong>
            </div>

            <div className="details-list-row">
              <span>Status</span>

              <strong className="status-value">
                {status}
              </strong>
            </div>

            <div className="details-list-row">
              <span>Data planejada</span>

              <strong>
                {formatDate(
                  activity.managementPlannedDate ||
                    activity.plannedDate
                )}
              </strong>
            </div>

            <div className="details-list-row">
              <span>Data de conclusão</span>

              <strong>
                {formatDate(
                  activity.managementCompletedDate ||
                    activity.completedDate
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* ===================================================
            PRAGAS / DOENÇAS
        =================================================== */}
        <section className="details-card">
          <div className="details-card-header">
            <div className="details-card-title">
              <div className="details-card-icon">
                <Bug size={18} />
              </div>

              <div>
                <span>OCORRÊNCIAS</span>
                <h2>Pragas e doenças</h2>
              </div>
            </div>
          </div>

          <div className="details-list">
            <div className="details-list-row">
              <span>Praga identificada</span>

              <strong>
                {activity.pest ||
                  "Nenhuma informada"}
              </strong>
            </div>

            <div className="details-list-row">
              <span>Doença identificada</span>

              <strong>
                {activity.disease ||
                  "Nenhuma informada"}
              </strong>
            </div>
          </div>
        </section>

        {/* ===================================================
            PRODUTO
        =================================================== */}
        <section className="details-card">
          <div className="details-card-header">
            <div className="details-card-title">
              <div className="details-card-icon">
                <Package size={18} />
              </div>

              <div>
                <span>INSUMO</span>
                <h2>Produto utilizado</h2>
              </div>
            </div>
          </div>

          {hasProduct() ? (
            <div className="product-detail">
              <div className="product-main">
                <div className="product-icon">
                  <Package size={20} />
                </div>

                <div>
                  <span>PRODUTO</span>

                  <strong>
                    {productData?.name ||
                      activity.product ||
                      "Produto informado"}
                  </strong>
                </div>
              </div>

              <div className="product-quantity">
                <Scale size={17} />

                <div>
                  <span>QUANTIDADE</span>

                  <strong>
                    {getProductQuantity()}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="details-no-data">
              <Package size={20} />

              <span>
                Nenhum produto foi associado a este
                registro.
              </span>
            </div>
          )}
        </section>

        {/* ===================================================
            OBSERVAÇÕES
        =================================================== */}
        <section className="details-card details-card-wide">
          <div className="details-card-header">
            <div className="details-card-title">
              <div className="details-card-icon">
                <FileText size={18} />
              </div>

              <div>
                <span>REGISTRO</span>
                <h2>Observações</h2>
              </div>
            </div>
          </div>

          <div className="details-description">
            {activity.description ? (
              <p>{activity.description}</p>
            ) : (
              <div className="details-no-data">
                <FileText size={20} />

                <span>
                  Nenhuma observação foi adicionada a
                  este registro.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            FOTOS
        =================================================== */}
        <section className="details-card details-card-wide">
          <div className="details-card-header">
            <div className="details-card-title">
              <div className="details-card-icon">
                <Camera size={18} />
              </div>

              <div>
                <span>REGISTRO VISUAL</span>
                <h2>Fotos do campo</h2>
              </div>
            </div>

            <span className="photo-count">
              {photoUrls.length}{" "}
              {photoUrls.length === 1
                ? "foto"
                : "fotos"}
            </span>
          </div>

          {photoUrls.length > 0 ? (
            <div className="details-photo-grid">
              {photoUrls.map((url, index) => (
                <button
                  type="button"
                  className="details-photo"
                  key={`${url}-${index}`}
                  onClick={() => openPhoto(index)}
                >
                  <img
                    src={url}
                    alt={`Foto do registro ${
                      index + 1
                    }`}
                  />

                  <span className="photo-overlay">
                    <ImageIcon size={20} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="details-no-photos">
              <div className="details-no-photos-icon">
                <Camera size={24} />
              </div>

              <div>
                <strong>
                  Nenhuma foto registrada
                </strong>

                <span>
                  As fotos adicionadas ao registro
                  aparecerão nesta seção.
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          AÇÕES
      ===================================================== */}
      <div className="details-actions">
        <button
          type="button"
          className="details-secondary-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Voltar
        </button>

        <button
          type="button"
          className="details-primary-button"
          onClick={() => onEdit(activity)}
        >
          <Pencil size={17} />
          Editar registro
          <ArrowRight size={16} />
        </button>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="details-footer">
        <div>
          <strong>CADERNO DE CAMPO</strong>
          <span>Gestão agrícola inteligente</span>
        </div>

        <div className="details-footer-responsible">
          <span>RESPONSÁVEL TÉCNICA</span>
          <strong>Laís L. Andrade</strong>
        </div>
      </footer>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}
      {selectedPhoto !== null &&
        photoUrls[selectedPhoto] && (
          <div
            className="photo-lightbox"
            onClick={closePhoto}
            role="dialog"
            aria-modal="true"
            aria-label="Visualização da foto"
          >
            <button
              type="button"
              className="lightbox-close"
              onClick={closePhoto}
              aria-label="Fechar"
            >
              <X size={22} />
            </button>

            {photoUrls.length > 1 && (
              <button
                type="button"
                className="lightbox-nav lightbox-prev"
                onClick={(event) => {
                  event.stopPropagation();
                  handlePreviousPhoto();
                }}
                aria-label="Foto anterior"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <div
              className="lightbox-content"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <img
                src={photoUrls[selectedPhoto]}
                alt={`Foto ${
                  selectedPhoto + 1
                } do registro`}
              />

              <div className="lightbox-counter">
                {selectedPhoto + 1} /{" "}
                {photoUrls.length}
              </div>
            </div>

            {photoUrls.length > 1 && (
              <button
                type="button"
                className="lightbox-nav lightbox-next"
                onClick={(event) => {
                  event.stopPropagation();
                  handleNextPhoto();
                }}
                aria-label="Próxima foto"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>
        )}
    </main>
  );
}

export default ActivityDetails;
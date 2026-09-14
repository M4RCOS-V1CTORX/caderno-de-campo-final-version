import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileText,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Mountain,
  Package,
  Ruler,
  Save,
  Sprout,
  Trash2,
  Wrench,
  X,
  Bug,
} from "lucide-react";

import {
  createActivity,
  updateActivity,
} from "../services/activityService";

import { addPhoto } from "../services/photoService";

import { getProperties } from "../services/propertyService";

import { getPlotsByProperty } from "../services/plotService";

import { getCultures } from "../services/cultureService";

import {
  getProducts,
  getProductById,
  addStock,
  removeStock,
} from "../services/productService";

import { getPests } from "../services/pestService";

import { getDiseases } from "../services/diseaseService";

import "../styles/newActivity.css";

function NewActivity({
  onCancel,
  onActivityCreated,
  activityToEdit,
}) {
  /* =========================================================
     ESTADOS PRINCIPAIS
  ========================================================= */

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [propertyId, setPropertyId] = useState("");
  const [plotId, setPlotId] = useState("");

  const [properties, setProperties] = useState([]);
  const [plots, setPlots] = useState([]);

  const [selectedCulture, setSelectedCulture] = useState("");
  const [cultures, setCultures] = useState([]);

  /* =========================================================
     MANEJO
  ========================================================= */

  const [managementType, setManagementType] = useState("");
  const [managementStatus, setManagementStatus] = useState("");
  const [managementPlannedDate, setManagementPlannedDate] =
    useState("");
  const [managementCompletedDate, setManagementCompletedDate] =
    useState("");

  /* =========================================================
     OCORRÊNCIAS
  ========================================================= */

  const [pest, setPest] = useState("");
  const [disease, setDisease] = useState("");

  /* =========================================================
     PRODUTOS / ESTOQUE
  ========================================================= */

  const [product, setProduct] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityValue, setQuantityValue] = useState("");

  const [products, setProducts] = useState([]);
  const [pests, setPests] = useState([]);
  const [diseases, setDiseases] = useState([]);

  /* =========================================================
     FOTOS
  ========================================================= */

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  /* =========================================================
     CONTROLE DE SALVAMENTO
  ========================================================= */

  const [saving, setSaving] = useState(false);

  /* =========================================================
     CARREGAR BIBLIOTECA
  ========================================================= */

  useEffect(() => {
    async function loadLibrary() {
      try {
        const [
          productsData,
          pestsData,
          diseasesData,
        ] = await Promise.all([
          getProducts(),
          getPests(),
          getDiseases(),
        ]);

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : []
        );

        setPests(
          Array.isArray(pestsData)
            ? pestsData
            : []
        );

        setDiseases(
          Array.isArray(diseasesData)
            ? diseasesData
            : []
        );
      } catch (error) {
        console.error(
          "ERRO AO CARREGAR BIBLIOTECA:",
          error
        );

        setProducts([]);
        setPests([]);
        setDiseases([]);
      }
    }

    loadLibrary();
  }, []);

  /* =========================================================
     CARREGAR PROPRIEDADES
  ========================================================= */

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getProperties();

        setProperties(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "ERRO AO CARREGAR PROPRIEDADES:",
          error
        );

        setProperties([]);
      }
    }

    loadProperties();
  }, []);

  /* =========================================================
     CARREGAR TALHÕES
  ========================================================= */

  useEffect(() => {
    async function loadPlots() {
      if (!propertyId) {
        setPlots([]);
        setPlotId("");
        setSelectedCulture("");
        return;
      }

      try {
        const data = await getPlotsByProperty(
          Number(propertyId)
        );

        setPlots(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "ERRO AO CARREGAR TALHÕES:",
          error
        );

        setPlots([]);
      }
    }

    loadPlots();
  }, [propertyId]);

  /* =========================================================
     CARREGAR CULTURAS
  ========================================================= */

  useEffect(() => {
    async function loadCultures() {
      try {
        const data = await getCultures();

        setCultures(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "ERRO AO CARREGAR CULTURAS:",
          error
        );

        setCultures([]);
      }
    }

    loadCultures();
  }, []);

  /* =========================================================
     PREENCHER FORMULÁRIO NA EDIÇÃO
  ========================================================= */

  useEffect(() => {
    if (activityToEdit) {
      setTitle(activityToEdit.title || "");
      setDate(activityToEdit.date || "");
      setLocation(activityToEdit.location || "");
      setDescription(
        activityToEdit.description || ""
      );

      setPropertyId(
        activityToEdit.propertyId !== null &&
          activityToEdit.propertyId !== undefined
          ? String(activityToEdit.propertyId)
          : ""
      );

      setPlotId(
        activityToEdit.plotId !== null &&
          activityToEdit.plotId !== undefined
          ? String(activityToEdit.plotId)
          : ""
      );

      setManagementType(
        activityToEdit.managementType || ""
      );

      setManagementStatus(
        activityToEdit.managementStatus || ""
      );

      setManagementPlannedDate(
        activityToEdit.managementPlannedDate || ""
      );

      setManagementCompletedDate(
        activityToEdit.managementCompletedDate || ""
      );

      setPest(activityToEdit.pest || "");
      setDisease(activityToEdit.disease || "");

      setProduct(activityToEdit.product || "");

      setProductId(
        activityToEdit.productId
          ? String(activityToEdit.productId)
          : ""
      );

      setQuantity(
        activityToEdit.quantity || ""
      );

      setQuantityValue(
        activityToEdit.quantityValue !== undefined &&
          activityToEdit.quantityValue !== null
          ? String(activityToEdit.quantityValue)
          : ""
      );

      setSelectedCulture("");
      setPhotos([]);
    } else {
      setTitle("");
      setDate("");
      setLocation("");
      setDescription("");

      setPropertyId("");
      setPlotId("");
      setSelectedCulture("");

      setManagementType("");
      setManagementStatus("");
      setManagementPlannedDate("");
      setManagementCompletedDate("");

      setPest("");
      setDisease("");

      setProduct("");
      setProductId("");
      setQuantity("");
      setQuantityValue("");

      setPhotos([]);
    }
  }, [activityToEdit]);

  /* =========================================================
     COMPATIBILIDADE COM DIÁRIOS ANTIGOS
  ========================================================= */

  useEffect(() => {
    if (!activityToEdit) {
      return;
    }

    if (
      !productId &&
      activityToEdit.product &&
      products.length > 0
    ) {
      const matchingProduct = products.find(
        (item) =>
          String(item.name)
            .trim()
            .toLowerCase() ===
          String(activityToEdit.product)
            .trim()
            .toLowerCase()
      );

      if (matchingProduct) {
        setProductId(
          String(matchingProduct.id)
        );
      }
    }
  }, [
    activityToEdit,
    products,
    productId,
  ]);

  /* =========================================================
     CRIAR PRÉ-VISUALIZAÇÕES DAS FOTOS
  ========================================================= */

  useEffect(() => {
    const previews = photos.map(
      (photo) => ({
        file: photo,
        url: URL.createObjectURL(photo),
      })
    );

    setPhotoPreviews(previews);

    return () => {
      previews.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview.url
          );
        }
      );
    };
  }, [photos]);

  /* =========================================================
     PROPRIEDADE
  ========================================================= */

  function handlePropertyChange(event) {
  const value = event.target.value;

  setPropertyId(value);

  // Ao trocar de propriedade, limpa o talhão selecionado
  setPlotId("");

  // Limpa a cultura até que um novo talhão seja selecionado
  setSelectedCulture("");
}

  /* =========================================================
     PRODUTO
  ========================================================= */

  function handleProductChange(event) {
    const selectedId =
      event.target.value;

    setProductId(selectedId);

    if (!selectedId) {
      setProduct("");
      setQuantity("");
      setQuantityValue("");
      return;
    }

    const selectedProduct =
      products.find(
        (item) =>
          String(item.id) ===
          String(selectedId)
      );

    if (!selectedProduct) {
      setProduct("");
      return;
    }

    setProduct(
      selectedProduct.name
    );
  }

  function handleQuantityChange(event) {
    const value =
      event.target.value;

    setQuantityValue(value);

    const selectedProduct =
      products.find(
        (item) =>
          String(item.id) ===
          String(productId)
      );

    if (
      selectedProduct &&
      value !== ""
    ) {
      setQuantity(
        `${value} ${
          selectedProduct.unit || ""
        }`.trim()
      );
    } else {
      setQuantity(value);
    }
  }

  /* =========================================================
     FOTOS
  ========================================================= */

  function handlePhotoChange(event) {
    const selectedFiles =
      Array.from(
        event.target.files || []
      );

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    setPhotos(
      (currentPhotos) => [
        ...currentPhotos,
        ...selectedFiles,
      ]
    );

    event.target.value = "";
  }

  function removePhoto(index) {
    setPhotos(
      (currentPhotos) =>
        currentPhotos.filter(
          (_, photoIndex) =>
            photoIndex !== index
        )
    );
  }

  /* =========================================================
     VERIFICAR ESTOQUE
  ========================================================= */

  async function validateStockForNewActivity() {
    if (!productId) {
      return null;
    }

    const amount =
      Number(quantityValue);

    if (!amount || amount <= 0) {
      throw new Error(
        "Informe uma quantidade válida para o produto."
      );
    }

    const selectedProduct =
      await getProductById(productId);

    if (!selectedProduct) {
      throw new Error(
        "O produto selecionado não foi encontrado no estoque."
      );
    }

    const currentStock =
      Number(selectedProduct.stock) || 0;

    if (amount > currentStock) {
      throw new Error(
        `Estoque insuficiente para "${selectedProduct.name}". Disponível: ${currentStock} ${
          selectedProduct.unit || ""
        }.`
      );
    }

    return selectedProduct;
  }

  /* =========================================================
     PRODUTO SELECIONADO
  ========================================================= */

  const selectedProduct =
    products.find(
      (item) =>
        String(item.id) ===
        String(productId)
    );

  /* =========================================================
     PROPRIEDADE SELECIONADA
  ========================================================= */

  const selectedProperty =
    properties.find(
      (item) =>
        String(item.id) ===
        String(propertyId)
    );

  /* =========================================================
     TALHÃO SELECIONADO
  ========================================================= */

  const selectedPlot =
    plots.find(
      (item) =>
        String(item.id) ===
        String(plotId)
    );

  const selectedCultureData =
    cultures.find(
      (item) =>
        String(item.name)
          .trim()
          .toLowerCase() ===
        String(
          selectedPlot?.culture || ""
        )
          .trim()
          .toLowerCase()
    );

  /* =========================================================
     INFORMAÇÕES DA ORIGEM DO ESTOQUE
  ========================================================= */

  function getStockMetadata() {
    return {
      source: "diario",

      activityId:
        activityToEdit?.id || null,

      activityTitle:
        title?.trim() || "",

      propertyId:
        propertyId
          ? Number(propertyId)
          : null,

      propertyName:
        selectedProperty?.name || "",

      plotId:
        plotId
          ? Number(plotId)
          : null,

      plotName:
        selectedPlot?.name || "",
    };
  }

  /* =========================================================
     AJUSTAR ESTOQUE NA EDIÇÃO
  ========================================================= */

  async function adjustStockForEdit() {
    if (
      !activityToEdit ||
      !activityToEdit.productId ||
      activityToEdit.quantityValue ===
        undefined ||
      activityToEdit.quantityValue ===
        null
    ) {
      if (productId) {
        const newAmount =
          Number(quantityValue);

        if (
          !newAmount ||
          newAmount <= 0
        ) {
          throw new Error(
            "Informe uma quantidade válida para o produto."
          );
        }

        const newProduct =
          await getProductById(productId);

        if (!newProduct) {
          throw new Error(
            "Produto selecionado não encontrado."
          );
        }

        const currentStock =
          Number(newProduct.stock) || 0;

        if (
          newAmount >
          currentStock
        ) {
          throw new Error(
            `Estoque insuficiente para "${newProduct.name}". Disponível: ${currentStock} ${
              newProduct.unit || ""
            }.`
          );
        }

        await removeStock(
          newProduct.id,
          newAmount,
          `Uso no diário: ${title.trim()}`,
          getStockMetadata()
        );

        return {
          type: "new",
          productId:
            newProduct.id,
          quantity:
            newAmount,
        };
      }

      return null;
    }

    const oldProductId =
      Number(
        activityToEdit.productId
      );

    const oldQuantity =
      Number(
        activityToEdit.quantityValue
      ) || 0;

    const newProductId =
      productId
        ? Number(productId)
        : null;

    const newQuantity =
      productId
        ? Number(quantityValue) || 0
        : 0;

    /* =======================================================
       REMOVER PRODUTO DO DIÁRIO
    ======================================================= */

    if (!newProductId) {
      if (
        oldProductId &&
        oldQuantity > 0
      ) {
        await addStock(
          oldProductId,
          oldQuantity,
          `Estorno de uso do diário: ${title.trim()}`,
          getStockMetadata()
        );

        return {
          type: "remove",
          productId:
            oldProductId,
          quantity:
            oldQuantity,
        };
      }

      return null;
    }

    /* =======================================================
       PRODUTO NÃO MUDOU
    ======================================================= */

    if (
      oldProductId ===
      newProductId
    ) {
      const difference =
        newQuantity -
        oldQuantity;

      if (difference === 0) {
        return null;
      }

      if (difference > 0) {
        const currentProduct =
          await getProductById(
            newProductId
          );

        if (!currentProduct) {
          throw new Error(
            "Produto não encontrado."
          );
        }

        const currentStock =
          Number(
            currentProduct.stock
          ) || 0;

        if (
          difference >
          currentStock
        ) {
          throw new Error(
            `Estoque insuficiente para aumentar a quantidade. Disponível: ${currentStock} ${
              currentProduct.unit || ""
            }.`
          );
        }

        await removeStock(
          newProductId,
          difference,
          `Ajuste de uso no diário: ${title.trim()}`,
          getStockMetadata()
        );

        return {
          type: "increase",
          productId:
            newProductId,
          quantity:
            difference,
        };
      }

      const returnedQuantity =
        Math.abs(difference);

      await addStock(
        newProductId,
        returnedQuantity,
        `Estorno de quantidade no diário: ${title.trim()}`,
        getStockMetadata()
      );

      return {
        type: "decrease",
        productId:
          newProductId,
        quantity:
          returnedQuantity,
      };
    }

    /* =======================================================
       PRODUTO MUDOU
    ======================================================= */

    if (
      oldProductId &&
      oldQuantity > 0
    ) {
      await addStock(
        oldProductId,
        oldQuantity,
        `Estorno por troca de produto no diário: ${title.trim()}`,
        getStockMetadata()
      );
    }

    if (
      !newQuantity ||
      newQuantity <= 0
    ) {
      return {
        type: "change-remove-new",
        oldProductId,
        oldQuantity,
      };
    }

    const newProduct =
      await getProductById(
        newProductId
      );

    if (!newProduct) {
      if (
        oldProductId &&
        oldQuantity > 0
      ) {
        await removeStock(
          oldProductId,
          oldQuantity,
          `Reversão de troca de produto no diário: ${title.trim()}`,
          getStockMetadata()
        );
      }

      throw new Error(
        "Novo produto não encontrado."
      );
    }

    const currentStock =
      Number(newProduct.stock) || 0;

    if (
      newQuantity >
      currentStock
    ) {
      if (
        oldProductId &&
        oldQuantity > 0
      ) {
        await removeStock(
          oldProductId,
          oldQuantity,
          `Reversão de troca de produto no diário: ${title.trim()}`,
          getStockMetadata()
        );
      }

      throw new Error(
        `Estoque insuficiente para "${newProduct.name}". Disponível: ${currentStock} ${
          newProduct.unit || ""
        }.`
      );
    }

    await removeStock(
      newProductId,
      newQuantity,
      `Uso no diário: ${title.trim()}`,
      getStockMetadata()
    );

    return {
      type: "change",
      oldProductId,
      oldQuantity,
      newProductId,
      newQuantity,
    };
  }

  /* =========================================================
     DESFAZER AJUSTE DE ESTOQUE EM CASO DE ERRO
  ========================================================= */

  async function rollbackStockAdjustment(
    adjustment
  ) {
    if (!adjustment) {
      return;
    }

    try {
      if (
        adjustment.type ===
        "new"
      ) {
        await addStock(
          adjustment.productId,
          adjustment.quantity,
          `Estorno por erro ao salvar diário: ${title.trim()}`,
          getStockMetadata()
        );
      }

      if (
        adjustment.type ===
        "remove"
      ) {
        await removeStock(
          adjustment.productId,
          adjustment.quantity,
          `Reversão de estorno por erro no diário: ${title.trim()}`,
          getStockMetadata()
        );
      }

      if (
        adjustment.type ===
        "increase"
      ) {
        await addStock(
          adjustment.productId,
          adjustment.quantity,
          `Estorno de ajuste por erro no diário: ${title.trim()}`,
          getStockMetadata()
        );
      }

      if (
        adjustment.type ===
        "decrease"
      ) {
        await removeStock(
          adjustment.productId,
          adjustment.quantity,
          `Reversão de ajuste por erro no diário: ${title.trim()}`,
          getStockMetadata()
        );
      }

      if (
        adjustment.type ===
        "change"
      ) {
        if (
          adjustment.newProductId &&
          adjustment.newQuantity > 0
        ) {
          await addStock(
            adjustment.newProductId,
            adjustment.newQuantity,
            `Estorno por erro ao salvar troca no diário: ${title.trim()}`,
            getStockMetadata()
          );
        }

        if (
          adjustment.oldProductId &&
          adjustment.oldQuantity > 0
        ) {
          await removeStock(
            adjustment.oldProductId,
            adjustment.oldQuantity,
            `Reversão por erro ao salvar troca no diário: ${title.trim()}`,
            getStockMetadata()
          );
        }
      }

      if (
        adjustment.type ===
        "change-remove-new"
      ) {
        if (
          adjustment.oldProductId &&
          adjustment.oldQuantity > 0
        ) {
          await removeStock(
            adjustment.oldProductId,
            adjustment.oldQuantity,
            `Reversão por erro na troca do diário: ${title.trim()}`,
            getStockMetadata()
          );
        }
      }
    } catch (rollbackError) {
      console.error(
        "ERRO AO REVERTER ESTOQUE:",
        rollbackError
      );
    }
  }

  /* =========================================================
     SALVAR
  ========================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (productId) {
      const amount =
        Number(quantityValue);

      if (
        !amount ||
        amount <= 0
      ) {
        alert(
          "Informe uma quantidade válida para o produto utilizado."
        );

        return;
      }
    }

    const selectedProduct =
      productId
        ? products.find(
            (item) =>
              String(item.id) ===
              String(productId)
          )
        : null;

    const formattedQuantity =
      selectedProduct &&
      quantityValue !== ""
        ? `${quantityValue} ${
            selectedProduct.unit || ""
          }`.trim()
        : quantity;

    const activityCulture =
  selectedCulture ||
  selectedPlot?.culture ||
  activityToEdit?.culture ||
  "";

const activityCultureData =
  selectedCultureData ||
  cultures.find(
    (item) =>
      String(item?.name || "")
        .trim()
        .toLowerCase() ===
      String(activityCulture)
        .trim()
        .toLowerCase()
  ) ||
  null;

const activity = {
  title: title.trim(),

  date,

  location: location.trim(),

  description: description.trim(),

  propertyId: propertyId
    ? Number(propertyId)
    : null,

  plotId: plotId
    ? Number(plotId)
    : null,

  /* =====================================================
     CULTURA
  ===================================================== */

  culture: activityCulture,

  variety:
    activityCultureData?.variety ||
    activityToEdit?.variety ||
    "",

  cycle:
    activityCultureData?.cycle ||
    activityToEdit?.cycle ||
    "",

  /* =====================================================
     MANEJO
  ===================================================== */

  managementType:
    managementType.trim(),

  managementStatus,

  managementPlannedDate:
    managementPlannedDate || "",

  managementCompletedDate:
    managementCompletedDate || "",

  /* COMPATIBILIDADE */
  plannedDate:
    managementPlannedDate || "",

  completedDate:
    managementCompletedDate || "",

  /* =====================================================
     OCORRÊNCIAS
  ===================================================== */

  pest:
    pest.trim(),

  disease:
    disease.trim(),

  /* =====================================================
     PRODUTO
  ===================================================== */

  product:
    selectedProduct?.name ||
    product.trim(),

  productId:
    productId
      ? Number(productId)
      : null,

  quantity:
    formattedQuantity,

  quantityValue:
    productId
      ? Number(quantityValue)
      : null,
};

    let stockAdjustment = null;

    try {
      setSaving(true);

      let savedActivity;

      /* =====================================================
         NOVA ATIVIDADE
      ===================================================== */

      if (!activityToEdit) {
        if (productId) {
          await validateStockForNewActivity();
        }

        savedActivity =
          await createActivity(
            activity
          );

        if (productId) {
          const amount =
            Number(
              quantityValue
            );

          await removeStock(
            productId,
            amount,
            `Uso no diário: ${title.trim()}`,
            {
              ...getStockMetadata(),
              activityId:
                savedActivity?.id ||
                null,
            }
          );

          stockAdjustment = {
            type: "new",
            productId:
              Number(productId),
            quantity:
              amount,
          };
        }
      }

      /* =====================================================
         EDITAR ATIVIDADE
      ===================================================== */

      else {
        stockAdjustment =
          await adjustStockForEdit();

        await updateActivity(
          activityToEdit.id,
          activity
        );

        savedActivity = {
          ...activityToEdit,
          ...activity,
        };
      }

      /* =====================================================
         SALVAR NOVAS FOTOS
      ===================================================== */

      if (photos.length > 0) {
        for (const photo of photos) {
          await addPhoto(
            savedActivity.id,
            photo
          );
        }
      }

      /* =====================================================
         SUCESSO
      ===================================================== */

      alert(
        activityToEdit
          ? "Atividade atualizada com sucesso!"
          : "Atividade cadastrada com sucesso!"
      );

      if (onActivityCreated) {
        onActivityCreated();
      } else {
        onCancel();
      }
    } catch (error) {
      console.error(
        "ERRO AO SALVAR ATIVIDADE:",
        error
      );

      if (stockAdjustment) {
        await rollbackStockAdjustment(
          stockAdjustment
        );
      }

      alert(
        error?.message ||
          "Erro ao salvar a atividade. Veja o Console (F12)."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="new-activity">

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <header className="new-activity-header">

        <button
          type="button"
          className="new-activity-back"
          onClick={onCancel}
          disabled={saving}
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="new-activity-heading">

          <div>
            <span className="new-activity-label">
              ATIVIDADES
            </span>

            <h2>
              {activityToEdit
                ? "Editar atividade"
                : "Nova atividade"}
            </h2>

            <p>
              {activityToEdit
                ? "Atualize as informações deste registro de campo."
                : "Registre uma nova atividade de campo."}
            </p>
          </div>

          <div className="new-activity-client">
            <span>
              RESPONSÁVEL TÉCNICA
            </span>

            <strong>
              Laís L. Andrade
            </strong>
          </div>

        </div>
      </header>

      {/* =====================================================
          FORMULÁRIO
      ===================================================== */}

      <form
        className="activity-form"
        onSubmit={handleSubmit}
      >

        {/* ===================================================
            INFORMAÇÕES DA ATIVIDADE
        =================================================== */}

        <section className="form-section">

          <div className="form-section-header">

            <div className="form-section-icon">
              <ClipboardList size={18} />
            </div>

            <div>
              <h3>
                Informações da atividade
              </h3>

              <p>
                Preencha os dados principais do registro.
              </p>
            </div>

          </div>

          <div className="form-grid">

            <div className="form-group full">

              <label htmlFor="title">
                Nome da atividade
              </label>

              <div className="field-with-icon">
                <ClipboardList size={16} />

                <input
                  id="title"
                  type="text"
                  placeholder="Ex.: Visita à propriedade"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

            </div>

            <div className="form-group">

              <label htmlFor="date">
                Data
              </label>

              <div className="field-with-icon">
                <CalendarDays size={16} />

                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

            </div>

            <div className="form-group">

              <label htmlFor="location">
                Local
              </label>

              <div className="field-with-icon">
                <MapPin size={16} />

                <input
                  id="location"
                  type="text"
                  placeholder="Ex.: Fazenda Boa Vista"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                />
              </div>

            </div>

            {/* PROPRIEDADE */}

            <div className="form-group">

              <label htmlFor="property">
                Propriedade
              </label>

              <div className="select-field">

                <Building2 size={16} />

                <select
                  id="property"
                  value={propertyId}
                  onChange={
                    handlePropertyChange
                  }
                >
                  <option value="">
                    Selecione uma propriedade
                  </option>

                  {properties.map(
                    (property) => (
                      <option
                        key={property.id}
                        value={property.id}
                      >
                        {property.name}
                      </option>
                    )
                  )}
                </select>

              </div>

            </div>

            {/* TALHÃO */}

            <div className="form-group">

              <label htmlFor="plot">
                Talhão
              </label>

              <div className="select-field">

                <Mountain size={16} />

                <select
                  id="plot"
                  value={plotId}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setPlotId(value);

                    const selected =
                      plots.find(
                        (plot) =>
                          String(plot.id) ===
                          String(value)
                      );

                    setSelectedCulture(
                      selected?.culture ||
                        ""
                    );
                  }}
                  disabled={!propertyId}
                >
                  <option value="">
                    {propertyId
                      ? "Selecione um talhão"
                      : "Selecione uma propriedade primeiro"}
                  </option>

                  {plots.map(
                    (plot) => (
                      <option
                        key={plot.id}
                        value={plot.id}
                      >
                        {plot.name}
                      </option>
                    )
                  )}
                </select>

              </div>

              {selectedCulture && (
                <div className="selected-culture-info">

                  <div className="culture-info-main">

                    <span className="culture-info-icon">
                      <Sprout size={18} />
                    </span>

                    <div>
                      <span>
                        Cultura do talhão
                      </span>

                      <strong>
                        {selectedCulture}
                      </strong>
                    </div>

                  </div>

                  {selectedCultureData?.variety && (
                    <div className="culture-info-item">

                      <span>
                        Variedade
                      </span>

                      <strong>
                        {
                          selectedCultureData.variety
                        }
                      </strong>

                    </div>
                  )}

                  {selectedCultureData?.cycle && (
                    <div className="culture-info-item">

                      <span>
                        Ciclo
                      </span>

                      <strong>
                        {
                          selectedCultureData.cycle
                        }
                      </strong>

                    </div>
                  )}

                  {selectedPlot?.area && (
                    <div className="culture-info-item">

                      <span>
                        Área
                      </span>

                      <strong>
                        {selectedPlot.area}
                      </strong>

                    </div>
                  )}

                  {selectedPlot?.soil && (
                    <div className="culture-info-item">

                      <span>
                        Solo
                      </span>

                      <strong>
                        {selectedPlot.soil}
                      </strong>

                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        </section>

        {/* ===================================================
            MANEJO
        =================================================== */}

        <section className="form-section">

          <div className="form-section-header">

            <div className="form-section-icon">
              <Wrench size={18} />
            </div>

            <div>
              <h3>
                Manejo
              </h3>

              <p>
                Informe o tipo e o andamento do manejo.
              </p>
            </div>

          </div>

          <div className="form-grid">

            {/* TIPO DE MANEJO */}

            <div className="form-group">

              <label htmlFor="managementType">
                Tipo de manejo
              </label>

              <div className="select-field">

                <Wrench size={16} />

                <select
                  id="managementType"
                  value={managementType}
                  onChange={(event) =>
                    setManagementType(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione o tipo de manejo
                  </option>

                  <option value="Adubação">
                    Adubação
                  </option>

                  <option value="Irrigação">
                    Irrigação
                  </option>

                  <option value="Pulverização">
                    Pulverização
                  </option>

                  <option value="Aplicação de defensivo">
                    Aplicação de defensivo
                  </option>

                  <option value="Controle de pragas">
                    Controle de pragas
                  </option>

                  <option value="Controle de doenças">
                    Controle de doenças
                  </option>

                  <option value="Capina">
                    Capina
                  </option>

                  <option value="Poda">
                    Poda
                  </option>

                  <option value="Plantio">
                    Plantio
                  </option>

                  <option value="Colheita">
                    Colheita
                  </option>

                  <option value="Preparo do solo">
                    Preparo do solo
                  </option>

                  <option value="Outro">
                    Outro
                  </option>

                </select>

              </div>

            </div>

            {/* STATUS */}

            <div className="form-group">

              <label htmlFor="managementStatus">
                Status
              </label>

              <div className="select-field">

                <CheckCircle2 size={16} />

                <select
                  id="managementStatus"
                  value={managementStatus}
                  onChange={(event) =>
                    setManagementStatus(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione o status
                  </option>

                  <option value="Planejado">
                    Planejado
                  </option>

                  <option value="Em andamento">
                    Em andamento
                  </option>

                  <option value="Concluído">
                    Concluído
                  </option>

                </select>

              </div>

            </div>

            {/* DATA PREVISTA */}

            <div className="form-group">

              <label htmlFor="managementPlannedDate">
                Data prevista
              </label>

              <div className="field-with-icon">

                <CalendarDays size={16} />

                <input
                  id="managementPlannedDate"
                  type="date"
                  value={
                    managementPlannedDate
                  }
                  onChange={(event) =>
                    setManagementPlannedDate(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* DATA DE CONCLUSÃO */}

            {managementStatus ===
              "Concluído" && (
              <div className="form-group">

                <label htmlFor="managementCompletedDate">
                  Data de conclusão
                </label>

                <div className="field-with-icon">

                  <CheckCircle2 size={16} />

                  <input
                    id="managementCompletedDate"
                    type="date"
                    value={
                      managementCompletedDate
                    }
                    onChange={(event) =>
                      setManagementCompletedDate(
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>
            )}

          </div>
        </section>

        {/* ===================================================
            OCORRÊNCIAS
        =================================================== */}

        <section className="form-section">

          <div className="form-section-header">

            <div className="form-section-icon">
              <Bug size={18} />
            </div>

            <div>
              <h3>
                Ocorrências
              </h3>

              <p>
                Registre pragas ou doenças observadas.
              </p>
            </div>

          </div>

          <div className="form-grid">

            {/* PRAGA */}

            <div className="form-group">

              <label htmlFor="pest">
                Praga
              </label>

              <div className="select-field">

                <Bug size={16} />

                <select
                  id="pest"
                  value={pest}
                  onChange={(event) =>
                    setPest(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione uma praga
                  </option>

                  {pests.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* DOENÇA */}

            <div className="form-group">

              <label htmlFor="disease">
                Doença
              </label>

              <div className="select-field">

                <Bug size={16} />

                <select
                  id="disease"
                  value={disease}
                  onChange={(event) =>
                    setDisease(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione uma doença
                  </option>

                  {diseases.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </div>
        </section>

        {/* ===================================================
            PRODUTO / ESTOQUE
        =================================================== */}

        <section className="form-section">

          <div className="form-section-header">

            <div className="form-section-icon">
              <Package size={18} />
            </div>

            <div>
              <h3>
                Produto utilizado
              </h3>

              <p>
                Registre o produto e a quantidade retirada do estoque.
              </p>
            </div>

          </div>

          <div className="form-grid">

            {/* PRODUTO */}

            <div className="form-group">

              <label htmlFor="product">
                Produto
              </label>

              <div className="select-field">

                <Package size={16} />

                <select
                  id="product"
                  value={productId}
                  onChange={
                    handleProductChange
                  }
                >
                  <option value="">
                    Nenhum produto
                  </option>

                  {products.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* QUANTIDADE */}

            <div className="form-group">

              <label htmlFor="quantity">
                Quantidade utilizada
              </label>

              <div className="quantity-field">

                <div className="field-with-icon">

                  <Ruler size={16} />

                  <input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex.: 20"
                    value={quantityValue}
                    onChange={
                      handleQuantityChange
                    }
                    disabled={!productId}
                  />

                </div>

                {selectedProduct && (
                  <span className="quantity-unit">
                    {selectedProduct.unit}
                  </span>
                )}

              </div>

              {selectedProduct && (
                <div className="stock-info">

                  <Package size={14} />

                  <span>
                    Estoque disponível:
                  </span>

                  <strong>
                    {
                      Number(
                        selectedProduct.stock
                      ) || 0
                    }{" "}
                    {
                      selectedProduct.unit
                    }
                  </strong>

                </div>
              )}

            </div>

          </div>
        </section>

        {/* ===================================================
            OBSERVAÇÕES
        =================================================== */}

        <section className="form-section">

          <div className="form-section-header">

            <div className="form-section-icon">
              <FileText size={18} />
            </div>

            <div>
              <h3>
                Observações
              </h3>

              <p>
                Descreva o que foi realizado ou observado.
              </p>
            </div>

          </div>

          <div className="form-grid">

            <div className="form-group full">

              <label htmlFor="description">
                Descrição
              </label>

              <div className="field-with-icon textarea-field">

                <FileText size={16} />

                <textarea
                  id="description"
                  rows="6"
                  placeholder="Descreva o que foi realizado, observações, ocorrências ou informações importantes..."
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>
        </section>

        {/* ===================================================
            FOTOS
        =================================================== */}

        <section className="form-section photos-form-section">

          <div className="form-section-header">

            <div className="form-section-icon">
              <Camera size={18} />
            </div>

            <div>
              <h3>
                Fotos da atividade
              </h3>

              <p>
                Registre visualmente o que foi observado no campo.
              </p>
            </div>

          </div>

          <label
            htmlFor="activity-photos"
            className="photo-upload-button"
          >
            <span className="photo-upload-icon">
              <ImagePlus size={19} />
            </span>

            <span>
              Adicionar fotos
            </span>
          </label>

          <input
            id="activity-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={
              handlePhotoChange
            }
            className="photo-input"
          />

          {photos.length > 0 && (
            <div className="photo-preview-area">

              <div className="photo-preview-heading">

                <span>
                  Fotos selecionadas
                </span>

                <span>
                  {photos.length}
                </span>

              </div>

              <div className="photo-preview-grid">

                {photoPreviews.map(
                  (
                    preview,
                    index
                  ) => (
                    <div
                      className="photo-preview"
                      key={`${preview.file.name}-${index}`}
                    >

                      <img
                        src={preview.url}
                        alt={
                          preview.file
                            .name ||
                          "Pré-visualização"
                        }
                      />

                      <button
                        type="button"
                        className="remove-photo-button"
                        onClick={() =>
                          removePhoto(
                            index
                          )
                        }
                        aria-label="Remover foto"
                        title="Remover foto"
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>
                  )
                )}

              </div>
            </div>
          )}

          {photos.length > 0 && (
            <p className="photos-selected-count">

              {photos.length}{" "}

              {photos.length === 1
                ? "foto pronta para ser salva"
                : "fotos prontas para serem salvas"}

            </p>
          )}

        </section>

        {/* ===================================================
            AÇÕES
        =================================================== */}

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
            disabled={saving}
          >
            {saving ? (
              <>
                <LoaderCircle
                  size={16}
                  className="button-spinner"
                />

                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />

                {activityToEdit
                  ? "Salvar alterações"
                  : "Salvar atividade"}
              </>
            )}
          </button>

        </div>

      </form>
    </main>
  );
}

export default NewActivity;
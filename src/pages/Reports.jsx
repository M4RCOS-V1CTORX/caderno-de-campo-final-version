import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  ClipboardList,
  FileBarChart,
  FileDown,
  Filter,
  Package,
  PieChart,
  RefreshCw,
  Sprout,
  Bug,
  Droplets,
  Activity,
  Layers3,
  MapPinned,
  ArrowLeft,
  Building2,
  Leaf,
  ShoppingCart,
  Map,
} from "lucide-react";

import db from "../db";
import "../styles/reports.css";

function Reports({ onBack }) {
  /* =========================================================
     ESTADOS
  ========================================================= */

  const [activities, setActivities] = useState([]);
  const [properties, setProperties] = useState([]);
  const [plots, setPlots] = useState([]);
  const [cultures, setCultures] = useState([]);
  const [products, setProducts] = useState([]);
  const [pests, setPests] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedReport, setSelectedReport] = useState("geral");

  const [propertyFilter, setPropertyFilter] = useState("");
  const [plotFilter, setPlotFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* =========================================================
     CARREGAMENTO SEGURO DE TABELAS
  ========================================================= */

  const getTableData = async (tableName) => {
    try {
      if (!db[tableName]) {
        return [];
      }

      const data = await db[tableName].toArray();

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn(
        `Tabela ${tableName} não disponível nos relatórios:`,
        error
      );

      return [];
    }
  };

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        activitiesData,
        propertiesData,
        plotsData,
        culturesData,
        productsData,
        pestsData,
        diseasesData,
        ordersData,
      ] = await Promise.all([
        getTableData("activities"),
        getTableData("properties"),
        getTableData("plots"),
        getTableData("cultures"),
        getTableData("products"),
        getTableData("pests"),
        getTableData("diseases"),
        getTableData("orders"),
      ]);

      setActivities(activitiesData);
      setProperties(propertiesData);
      setPlots(plotsData);
      setCultures(culturesData);
      setProducts(productsData);
      setPests(pestsData);
      setDiseases(diseasesData);
      setOrders(ordersData);
    } catch (error) {
      console.error(
        "Erro ao carregar dados dos relatórios:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =========================================================
     MAPAS
  ========================================================= */

  const propertyNameMap = useMemo(() => {
    const map = {};

    properties.forEach((property) => {
      map[String(property.id)] =
        property.name ||
        property.nome ||
        "Sem nome";
    });

    return map;
  }, [properties]);

  const plotNameMap = useMemo(() => {
    const map = {};

    plots.forEach((plot) => {
      map[String(plot.id)] =
        plot.name ||
        plot.nome ||
        "Sem nome";
    });

    return map;
  }, [plots]);

  const getPropertyName = (propertyId) => {
    if (
      propertyId === null ||
      propertyId === undefined ||
      propertyId === ""
    ) {
      return "—";
    }

    return (
      propertyNameMap[String(propertyId)] ||
      "—"
    );
  };

  const getPlotName = (plotId) => {
    if (
      plotId === null ||
      plotId === undefined ||
      plotId === ""
    ) {
      return "—";
    }

    return (
      plotNameMap[String(plotId)] ||
      "—"
    );
  };

  /* =========================================================
     FILTROS
  ========================================================= */

  const availablePlots = useMemo(() => {
    if (!propertyFilter) {
      return plots;
    }

    return plots.filter(
      (plot) =>
        String(
          plot.propertyId ??
            plot.property ??
            ""
        ) === String(propertyFilter)
    );
  }, [plots, propertyFilter]);

  useEffect(() => {
    if (
      plotFilter &&
      !availablePlots.some(
        (plot) =>
          String(plot.id) ===
          String(plotFilter)
      )
    ) {
      setPlotFilter("");
    }
  }, [availablePlots, plotFilter]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const activityPropertyId =
        activity.propertyId ??
        activity.property ??
        "";

      const activityPlotId =
        activity.plotId ??
        activity.fieldId ??
        activity.talhaoId ??
        "";

      if (
        propertyFilter &&
        String(activityPropertyId) !==
          String(propertyFilter)
      ) {
        return false;
      }

      if (
        plotFilter &&
        String(activityPlotId) !==
          String(plotFilter)
      ) {
        return false;
      }

      const activityDate =
        getActivityDate(activity);

      if (
        startDate &&
        activityDate &&
        activityDate < startDate
      ) {
        return false;
      }

      if (
        endDate &&
        activityDate &&
        activityDate > endDate
      ) {
        return false;
      }

      return true;
    });
  }, [
    activities,
    propertyFilter,
    plotFilter,
    startDate,
    endDate,
  ]);

  /* =========================================================
     PROPRIEDADES FILTRADAS
  ========================================================= */

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (
        propertyFilter &&
        String(property.id) !==
          String(propertyFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [properties, propertyFilter]);

  /* =========================================================
     TALHÕES FILTRADOS
  ========================================================= */

  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      const propertyId =
        plot.propertyId ??
        plot.property ??
        "";

      if (
        propertyFilter &&
        String(propertyId) !==
          String(propertyFilter)
      ) {
        return false;
      }

      if (
        plotFilter &&
        String(plot.id) !==
          String(plotFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [
    plots,
    propertyFilter,
    plotFilter,
  ]);

  /* =========================================================
     CULTURAS
  ========================================================= */

  const filteredCultures = useMemo(() => {
    return cultures.filter((culture) => {
      const culturePropertyId =
        culture.propertyId ??
        culture.property ??
        "";

      const culturePlotId =
        culture.plotId ??
        culture.fieldId ??
        culture.talhaoId ??
        "";

      if (
        propertyFilter &&
        culturePropertyId &&
        String(culturePropertyId) !==
          String(propertyFilter)
      ) {
        return false;
      }

      if (
        plotFilter &&
        culturePlotId &&
        String(culturePlotId) !==
          String(plotFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [
    cultures,
    propertyFilter,
    plotFilter,
  ]);

  /* =========================================================
     PEDIDOS FILTRADOS
  ========================================================= */

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const date = getOrderDate(order);

      if (
        startDate &&
        date &&
        date < startDate
      ) {
        return false;
      }

      if (
        endDate &&
        date &&
        date > endDate
      ) {
        return false;
      }

      return true;
    });
  }, [
    orders,
    startDate,
    endDate,
  ]);

  /* =========================================================
     ENTIDADES SELECIONADAS
  ========================================================= */

  const selectedProperty = useMemo(() => {
    if (!propertyFilter) {
      return null;
    }

    return properties.find(
      (property) =>
        String(property.id) ===
        String(propertyFilter)
    );
  }, [properties, propertyFilter]);

  const selectedPlot = useMemo(() => {
    if (!plotFilter) {
      return null;
    }

    return plots.find(
      (plot) =>
        String(plot.id) ===
        String(plotFilter)
    );
  }, [plots, plotFilter]);

  /* =========================================================
     ESTATÍSTICAS
  ========================================================= */

  const statistics = useMemo(() => {
    const total = filteredActivities.length;

    const completed =
      filteredActivities.filter(
        (activity) =>
          normalizeStatus(
            activity.managementStatus
          ) === "concluido"
      ).length;

    const inProgress =
      filteredActivities.filter(
        (activity) =>
          normalizeStatus(
            activity.managementStatus
          ) === "em andamento"
      ).length;

    const planned =
      filteredActivities.filter(
        (activity) =>
          normalizeStatus(
            activity.managementStatus
          ) === "planejado"
      ).length;

    const withPest =
      filteredActivities.filter(
        (activity) =>
          getActivityPest(activity)
      ).length;

    const withDisease =
      filteredActivities.filter(
        (activity) =>
          getActivityDisease(activity)
      ).length;

    const withProduct =
      filteredActivities.filter(
        (activity) =>
          getActivityProduct(activity)
      ).length;

    const withPhotos =
      filteredActivities.filter(
        (activity) =>
          Array.isArray(activity.photos) &&
          activity.photos.length > 0
      ).length;

    const completionRate =
      total > 0
        ? Math.round(
            (completed / total) * 100
          )
        : 0;

    return {
      total,
      completed,
      inProgress,
      planned,
      withPest,
      withDisease,
      withProduct,
      withPhotos,
      completionRate,
    };
  }, [filteredActivities]);

  /* =========================================================
     RESUMO DE MANEJO
  ========================================================= */

  const managementSummary = useMemo(() => {
    const map = {};

    filteredActivities.forEach((activity) => {
      const value =
        activity.managementType ||
        activity.type ||
        activity.category ||
        "Não informado";

      map[value] =
        (map[value] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort(
        (a, b) => b.count - a.count
      );
  }, [filteredActivities]);

  /* =========================================================
     PRAGAS
  ========================================================= */

  const pestSummary = useMemo(() => {
    const map = {};

    filteredActivities.forEach((activity) => {
      const pest =
        getActivityPest(activity);

      if (!pest) {
        return;
      }

      map[pest] =
        (map[pest] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort(
        (a, b) => b.count - a.count
      );
  }, [filteredActivities]);

  /* =========================================================
     DOENÇAS
  ========================================================= */

  const diseaseSummary = useMemo(() => {
    const map = {};

    filteredActivities.forEach((activity) => {
      const disease =
        getActivityDisease(activity);

      if (!disease) {
        return;
      }

      map[disease] =
        (map[disease] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort(
        (a, b) => b.count - a.count
      );
  }, [filteredActivities]);

  /* =========================================================
     PRODUTOS
  ========================================================= */

  const productSummary = useMemo(() => {
    const map = {};

    filteredActivities.forEach((activity) => {
      const product =
        getActivityProduct(activity);

      if (!product) {
        return;
      }

      if (!map[product]) {
        map[product] = {
          name: product,
          applications: 0,
          quantity: 0,
          unit: getProductUnit(activity),
        };
      }

      map[product].applications += 1;

      map[product].quantity +=
        getActivityQuantity(activity);

      if (!map[product].unit) {
        map[product].unit =
          getProductUnit(activity);
      }
    });

    return Object.values(map).sort(
      (a, b) =>
        b.applications -
        a.applications
    );
  }, [filteredActivities]);

  /* =========================================================
     ESTOQUE
  ========================================================= */

  const stockSummary = useMemo(() => {
    return products
      .map((product) => {
        const stock = parseNumber(
          product.stock ??
            product.quantity ??
            product.estoque ??
            0
        );

        const minimumStock = parseNumber(
          product.minimumStock ??
            product.minStock ??
            product.estoqueMinimo ??
            0
        );

        return {
          id: product.id,
          name:
            product.name ||
            product.nome ||
            product.title ||
            "Produto sem nome",
          stock,
          minimumStock,
          unit:
            product.unit ||
            product.unidade ||
            "",
          lowStock:
            minimumStock > 0 &&
            stock <= minimumStock,
        };
      })
      .sort((a, b) => {
        if (
          a.lowStock &&
          !b.lowStock
        ) {
          return -1;
        }

        if (
          !a.lowStock &&
          b.lowStock
        ) {
          return 1;
        }

        return a.name.localeCompare(
          b.name
        );
      });
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return stockSummary.filter(
      (product) =>
        product.lowStock
    );
  }, [stockSummary]);

  /* =========================================================
     RESUMO MENSAL
  ========================================================= */

  const monthlySummary = useMemo(() => {
    const map = {};

    filteredActivities.forEach((activity) => {
      const date =
        getActivityDate(activity);

      if (!date) {
        return;
      }

      const monthKey =
        date.slice(0, 7);

      map[monthKey] =
        (map[monthKey] || 0) + 1;
    });

    return Object.entries(map)
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(([month, count]) => ({
        month,
        label: formatMonth(month),
        count,
      }));
  }, [filteredActivities]);

  /* =========================================================
     RESUMO POR TALHÃO
  ========================================================= */

  const plotSummary = useMemo(() => {
    const map = {};

    filteredActivities.forEach(
      (activity) => {
        const activityPlotId =
          activity.plotId ??
          activity.fieldId ??
          activity.talhaoId;

        const plot = plots.find(
          (item) =>
            String(item.id) ===
            String(activityPlotId)
        );

        const name =
          plot?.name ||
          plot?.nome ||
          activity.plotName ||
          "Talhão não informado";

        if (!map[name]) {
          map[name] = {
            name,
            culture:
              plot?.culture ||
              plot?.cultureName ||
              activity.culture ||
              "Cultura não informada",
            count: 0,
          };
        }

        map[name].count += 1;
      }
    );

    return Object.values(map).sort(
      (a, b) => b.count - a.count
    );
  }, [filteredActivities, plots]);

  /* =========================================================
     TALHÕES COM OCORRÊNCIAS
  ========================================================= */

  const phytosanitaryPlots = useMemo(() => {
    return new Set(
      filteredActivities
        .filter(
          (activity) =>
            getActivityPest(activity) ||
            getActivityDisease(activity)
        )
        .map(
          (activity) =>
            activity.plotId ??
            activity.fieldId ??
            activity.talhaoId
        )
        .filter(Boolean)
    ).size;
  }, [filteredActivities]);

  /* =========================================================
     TALHÕES COM PRODUTOS
  ========================================================= */

  const productPlots = useMemo(() => {
    return new Set(
      filteredActivities
        .filter((activity) =>
          getActivityProduct(activity)
        )
        .map(
          (activity) =>
            activity.plotId ??
            activity.fieldId ??
            activity.talhaoId
        )
        .filter(Boolean)
    ).size;
  }, [filteredActivities]);

  /* =========================================================
     RESUMO DOS PEDIDOS
  ========================================================= */

  const ordersSummary = useMemo(() => {
    const total = filteredOrders.length;

    const pending =
      filteredOrders.filter(
        (order) =>
          normalizeStatus(
            order.status
          ) === "pendente"
      ).length;

    const inProgress =
      filteredOrders.filter(
        (order) =>
          normalizeStatus(
            order.status
          ) === "em andamento"
      ).length;

    const completed =
      filteredOrders.filter(
        (order) =>
          normalizeStatus(
            order.status
          ) === "concluido"
      ).length;

    const cancelled =
      filteredOrders.filter(
        (order) =>
          normalizeStatus(
            order.status
          ) === "cancelado"
      ).length;

    const totalValue =
      filteredOrders.reduce(
        (sum, order) =>
          sum +
          parseNumber(
            order.total ??
              order.valor ??
              order.amount ??
              0
          ),
        0
      );

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      totalValue,
    };
  }, [filteredOrders]);

  /* =========================================================
     MÁXIMOS
  ========================================================= */

  const maxMonthly = useMemo(() => {
    return Math.max(
      ...monthlySummary.map(
        (item) => item.count
      ),
      1
    );
  }, [monthlySummary]);

  const maxManagement = useMemo(() => {
    return Math.max(
      ...managementSummary.map(
        (item) => item.count
      ),
      1
    );
  }, [managementSummary]);

  const maxPest = useMemo(() => {
    return Math.max(
      ...pestSummary.map(
        (item) => item.count
      ),
      1
    );
  }, [pestSummary]);

  const maxDisease = useMemo(() => {
    return Math.max(
      ...diseaseSummary.map(
        (item) => item.count
      ),
      1
    );
  }, [diseaseSummary]);

  const maxPlot = useMemo(() => {
    return Math.max(
      ...plotSummary.map(
        (item) => item.count
      ),
      1
    );
  }, [plotSummary]);

  const maxProduct = useMemo(() => {
    return Math.max(
      ...productSummary.map(
        (item) =>
          item.applications
      ),
      1
    );
  }, [productSummary]);

  /* =========================================================
     RESUMO EXECUTIVO
  ========================================================= */

  const executiveSummary = useMemo(() => {
    return {
      topManagement:
        managementSummary[0] || null,

      topPest:
        pestSummary[0] || null,

      topDisease:
        diseaseSummary[0] || null,

      topProduct:
        productSummary[0] || null,

      topPlot:
        plotSummary[0] || null,
    };
  }, [
    managementSummary,
    pestSummary,
    diseaseSummary,
    productSummary,
    plotSummary,
  ]);

  /* =========================================================
     TIPOS DE RELATÓRIO
  ========================================================= */

  const reportTypes = [
    {
      id: "geral",
      label: "Visão Geral",
      description:
        "Indicadores gerais e panorama do campo",
      icon: <BarChart3 size={19} />,
    },
    {
      id: "propriedades",
      label: "Propriedades",
      description:
        "Relação das propriedades cadastradas",
      icon: <Building2 size={19} />,
    },
    {
      id: "talhoes",
      label: "Talhões",
      description:
        "Talhões, áreas e culturas vinculadas",
      icon: <Map size={19} />,
    },
    {
      id: "culturas",
      label: "Culturas",
      description:
        "Culturas cadastradas e distribuição",
      icon: <Leaf size={19} />,
    },
    {
      id: "diario",
      label: "Diário de Campo",
      description:
        "Registros completos do período",
      icon: <ClipboardList size={19} />,
    },
    {
      id: "manejo",
      label: "Manejo",
      description:
        "Atividades, tipos de manejo e andamento",
      icon: <Sprout size={19} />,
    },
    {
      id: "fitossanitario",
      label: "Fitossanitário",
      description:
        "Pragas, doenças e ocorrências",
      icon: <Bug size={19} />,
    },
    {
      id: "produtos",
      label: "Produtos / Estoque",
      description:
        "Aplicações, estoque e alertas",
      icon: <Package size={19} />,
    },
    {
      id: "pedidos",
      label: "Pedidos",
      description:
        "Pedidos, valores e situação",
      icon: <ShoppingCart size={19} />,
    },
  ];

  const reportTitles = {
    geral: {
      title: "Visão Geral do Campo",
      description:
        "Panorama consolidado dos registros e atividades agrícolas.",
      label: "VISÃO GERAL",
    },

    propriedades: {
      title: "Relatório de Propriedades",
      description:
        "Relação das propriedades cadastradas no Caderno de Campo.",
      label: "PROPRIEDADES",
    },

    talhoes: {
      title: "Relatório de Talhões",
      description:
        "Relação dos talhões, áreas e informações agrícolas cadastradas.",
      label: "TALHÕES",
    },

    culturas: {
      title: "Relatório de Culturas",
      description:
        "Relação das culturas cadastradas e suas informações.",
      label: "CULTURAS",
    },

    manejo: {
      title: "Relatório de Manejo",
      description:
        "Acompanhamento das atividades e respectivos status.",
      label: "MANEJO",
    },

    fitossanitario: {
      title: "Relatório Fitossanitário",
      description:
        "Resumo das ocorrências de pragas e doenças registradas.",
      label: "FITOSSANITÁRIO",
    },

    produtos: {
      title: "Relatório de Produtos e Estoque",
      description:
        "Consolidação dos produtos utilizados e situação do estoque.",
      label: "PRODUTOS / ESTOQUE",
    },

    diario: {
      title: "Diário de Campo",
      description:
        "Relação completa dos registros realizados no período.",
      label: "DIÁRIO DE CAMPO",
    },

    pedidos: {
      title: "Relatório de Pedidos",
      description:
        "Resumo dos pedidos cadastrados, valores e situação.",
      label: "PEDIDOS",
    },
  };

  /* =========================================================
     FILTROS ATIVOS
  ========================================================= */

  const activeFilters = useMemo(() => {
    const filters = [];

    if (selectedProperty) {
      filters.push(
        `Propriedade: ${selectedProperty.name || selectedProperty.nome}`
      );
    }

    if (selectedPlot) {
      filters.push(
        `Talhão: ${selectedPlot.name || selectedPlot.nome}`
      );
    }

    if (startDate) {
      filters.push(
        `A partir de ${formatDate(startDate)}`
      );
    }

    if (endDate) {
      filters.push(
        `Até ${formatDate(endDate)}`
      );
    }

    return filters;
  }, [
    selectedProperty,
    selectedPlot,
    startDate,
    endDate,
  ]);

  /* =========================================================
     PERÍODO
  ========================================================= */

  const reportPeriod = useMemo(() => {
    if (startDate && endDate) {
      return `${formatDate(
        startDate
      )} até ${formatDate(endDate)}`;
    }

    if (startDate) {
      return `A partir de ${formatDate(
        startDate
      )}`;
    }

    if (endDate) {
      return `Até ${formatDate(endDate)}`;
    }

    return "Todos os registros disponíveis";
  }, [startDate, endDate]);

  /* =========================================================
     CONTAGEM DO FILTRO
  ========================================================= */

  const reportRecordCount = useMemo(() => {
    switch (selectedReport) {
      case "propriedades":
        return filteredProperties.length;

      case "talhoes":
        return filteredPlots.length;

      case "culturas":
        return filteredCultures.length;

      case "pedidos":
        return filteredOrders.length;

      case "produtos":
        return stockSummary.length;

      default:
        return filteredActivities.length;
    }
  }, [
    selectedReport,
    filteredProperties,
    filteredPlots,
    filteredCultures,
    filteredOrders,
    stockSummary,
    filteredActivities,
  ]);

  /* =========================================================
     AÇÕES
  ========================================================= */

  const clearFilters = () => {
    setPropertyFilter("");
    setPlotFilter("");
    setStartDate("");
    setEndDate("");
  };

  const handlePrint = () => {
    window.print();
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <div className="loading-spinner" />

          <h2>
            Preparando seus relatórios
          </h2>

          <p>
            Estamos organizando os dados
            do Caderno de Campo.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="reports-page">
      <div className="reports-container">

        <button
          type="button"
          className="report-back-button no-print"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Voltar para Home
        </button>

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <header className="report-header no-print">
          <div>
            <div className="report-eyebrow">
              <FileBarChart size={12} />
              CENTRAL DE RELATÓRIOS
            </div>

            <h1>Relatórios</h1>

            <p>
              Transforme os registros do
              campo em informações claras
              para acompanhar, analisar e
              tomar decisões.
            </p>
          </div>

          <button
            type="button"
            className="report-print-button"
            onClick={handlePrint}
          >
            <FileDown size={17} />
            Gerar PDF
          </button>
        </header>

        {/* =====================================================
            CABEÇALHO DE IMPRESSÃO
        ===================================================== */}

        <div className="print-report-header print-only">
          <div>
            <strong>
              CADERNO DE CAMPO
            </strong>

            <h1>
              {reportTitles[selectedReport].title}
            </h1>

            <div className="print-contact">
              Responsável técnica: Laís L. Andrade
            </div>

            <div className="print-contact">
              WhatsApp: 74 9957-5038
            </div>
          </div>

          <div className="print-report-date">
            Gerado em{" "}
            {formatDateTime(new Date())}
          </div>
        </div>

        {/* =====================================================
            TIPOS DE RELATÓRIO
        ===================================================== */}

        <section className="report-types no-print">
          <div className="report-types-heading">
            <span>
              ESCOLHA O RELATÓRIO
            </span>

            <h2>
              O que você deseja analisar?
            </h2>

            <p>
              Selecione uma visão para
              organizar os dados do campo.
            </p>
          </div>

          <div className="report-types-grid">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                type="button"
                className={`report-type-card ${
                  selectedReport === report.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedReport(report.id)
                }
              >
                <div className="report-type-top">
                  <span className="report-type-icon">
                    {report.icon}
                  </span>

                  {selectedReport ===
                    report.id && (
                    <span className="report-type-selected">
                      <Check size={13} />
                    </span>
                  )}
                </div>

                <strong>
                  {report.label}
                </strong>

                <span>
                  {report.description}
                </span>

                <span className="report-type-arrow">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* =====================================================
            FILTROS
        ===================================================== */}

        <section className="report-filters no-print">
          <div className="filter-heading">
            <div className="filter-icon">
              <Filter size={18} />
            </div>

            <div>
              <strong>
                Filtros do relatório
              </strong>

              <span>
                Refine os dados antes de
                gerar ou imprimir o relatório.
              </span>
            </div>
          </div>

          <div className="filters-grid">

            <div className="filter-group">
              <label>
                Propriedade
              </label>

              <select
                value={propertyFilter}
                onChange={(event) =>
                  setPropertyFilter(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Todas as propriedades
                </option>

                {properties.map(
                  (property) => (
                    <option
                      key={property.id}
                      value={property.id}
                    >
                      {property.name ||
                        property.nome ||
                        "Sem nome"}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="filter-group">
              <label>
                Talhão
              </label>

              <select
                value={plotFilter}
                onChange={(event) =>
                  setPlotFilter(
                    event.target.value
                  )
                }
                disabled={
                  availablePlots.length === 0
                }
              >
                <option value="">
                  Todos os talhões
                </option>

                {availablePlots.map(
                  (plot) => (
                    <option
                      key={plot.id}
                      value={plot.id}
                    >
                      {plot.name ||
                        plot.nome ||
                        "Sem nome"}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="filter-group">
              <label>
                Data inicial
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="filter-group">
              <label>
                Data final
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
              />
            </div>

          </div>

          <div className="filter-footer">
            <span>
              {reportRecordCount}{" "}
              {reportRecordCount === 1
                ? "registro encontrado"
                : "registros encontrados"}
            </span>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  loadData(true)
                }
                disabled={refreshing}
              >
                <RefreshCw
                  size={12}
                  style={{
                    marginRight: "5px",
                    verticalAlign:
                      "middle",
                  }}
                />

                {refreshing
                  ? "Atualizando..."
                  : "Atualizar"}
              </button>

              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            DOCUMENTO
        ===================================================== */}

        <main className="report-document">

          {/* ===================================================
              TÍTULO
          =================================================== */}

          <div className="report-title">
            <div>
              <span className="report-label">
                {reportTitles[selectedReport].label}
              </span>

              <h2>
                {reportTitles[selectedReport].title}
              </h2>

              <p>
                {reportTitles[selectedReport].description}
              </p>
            </div>

            <div className="report-period">
              <span>
                PERÍODO ANALISADO
              </span>

              <strong>
                {reportPeriod}
              </strong>
            </div>
          </div>

          {/* ===================================================
              VISÃO GERAL
          =================================================== */}

          {selectedReport === "geral" && (
            <>
              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      RESUMO EXECUTIVO
                    </span>

                    <h3>
                      Panorama do período
                    </h3>
                  </div>

                  <span>
                    {filteredActivities.length}{" "}
                    {filteredActivities.length === 1
                      ? "registro"
                      : "registros"}
                  </span>
                </div>

                <div className="analytics-grid">

                  <div className="analytics-card">
                    <div className="analytics-card-header">
                      <div>
                        <span>
                          PANORAMA
                        </span>

                        <h4>
                          Resumo dos dados
                        </h4>
                      </div>

                      <div className="analytics-icon">
                        <FileBarChart size={16} />
                      </div>
                    </div>

                    <p>
                      {statistics.total === 0
                        ? "Nenhum registro foi encontrado no período selecionado."
                        : `Foram encontrados ${statistics.total} registros no período analisado, sendo ${statistics.completed} concluído(s), ${statistics.inProgress} em andamento e ${statistics.planned} planejado(s).`}
                    </p>
                  </div>

                  <div className="analytics-card">
                    <div className="analytics-card-header">
                      <div>
                        <span>
                          ESTRUTURA
                        </span>

                        <h4>
                          Cadastro do campo
                        </h4>
                      </div>

                      <div className="analytics-icon">
                        <Layers3 size={16} />
                      </div>
                    </div>

                    <div className="summary-list">

                      <div className="summary-row">
                        <div className="summary-row-info">
                          <strong>
                            {properties.length}
                          </strong>

                          <span>
                            Propriedades cadastradas
                          </span>
                        </div>

                        <Building2 size={17} />
                      </div>

                      <div className="summary-row">
                        <div className="summary-row-info">
                          <strong>
                            {plots.length}
                          </strong>

                          <span>
                            Talhões cadastrados
                          </span>
                        </div>

                        <MapPinned size={17} />
                      </div>

                      <div className="summary-row">
                        <div className="summary-row-info">
                          <strong>
                            {cultures.length}
                          </strong>

                          <span>
                            Culturas cadastradas
                          </span>
                        </div>

                        <Leaf size={17} />
                      </div>

                      <div className="summary-row">
                        <div className="summary-row-info">
                          <strong>
                            {orders.length}
                          </strong>

                          <span>
                            Pedidos cadastrados
                          </span>
                        </div>

                        <ShoppingCart size={17} />
                      </div>

                    </div>
                  </div>

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      INDICADORES
                    </span>

                    <h3>
                      Seu campo em números
                    </h3>
                  </div>
                </div>

                <div className="report-stat-grid">

                  <StatCard
                    icon={
                      <ClipboardList size={16} />
                    }
                    label="Registros"
                    value={statistics.total}
                  />

                  <StatCard
                    icon={<Check size={16} />}
                    label="Concluídos"
                    value={statistics.completed}
                  />

                  <StatCard
                    icon={
                      <Activity size={16} />
                    }
                    label="Em andamento"
                    value={statistics.inProgress}
                  />

                  <StatCard
                    icon={
                      <CalendarDays size={16} />
                    }
                    label="Planejados"
                    value={statistics.planned}
                  />

                  <StatCard
                    icon={<Bug size={16} />}
                    label="Com pragas"
                    value={statistics.withPest}
                  />

                  <StatCard
                    icon={
                      <Package size={16} />
                    }
                    label="Com produtos"
                    value={statistics.withProduct}
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      ANÁLISE
                    </span>

                    <h3>
                      Evolução dos registros
                    </h3>
                  </div>
                </div>

                <div className="analytics-grid">

                  <div className="analytics-card">
                    <div className="analytics-card-header">
                      <div>
                        <span>
                          EVOLUÇÃO
                        </span>

                        <h4>
                          Registros por mês
                        </h4>
                      </div>

                      <div className="analytics-icon">
                        <BarChart3 size={16} />
                      </div>
                    </div>

                    {monthlySummary.length === 0 ? (
                      <div className="analytics-empty">
                        Nenhum registro disponível
                        para análise.
                      </div>
                    ) : (
                      <div className="monthly-chart">
                        {monthlySummary.map(
                          (item) => {
                            const percentage =
                              (item.count /
                                maxMonthly) *
                              100;

                            return (
                              <div
                                className="monthly-row"
                                key={item.month}
                              >
                                <span className="monthly-label">
                                  {item.label}
                                </span>

                                <div className="monthly-bar-area">
                                  <div
                                    className="monthly-bar"
                                    style={{
                                      width: `${percentage}%`,
                                    }}
                                  />
                                </div>

                                <strong>
                                  {item.count}
                                </strong>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>

                  <div className="analytics-card">
                    <div className="analytics-card-header">
                      <div>
                        <span>
                          DESEMPENHO
                        </span>

                        <h4>
                          Taxa de conclusão
                        </h4>
                      </div>

                      <div className="analytics-icon">
                        <PieChart size={16} />
                      </div>
                    </div>

                    <div className="completion-content">

                      <div
                        className="completion-circle"
                        style={{
                          "--completion": `${statistics.completionRate * 3.6}deg`,
                        }}
                      >
                        <div>
                          <strong>
                            {statistics.completionRate}%
                          </strong>

                          <span>
                            concluído
                          </span>
                        </div>
                      </div>

                      <div className="completion-details">

                        <div>
                          <span>
                            Concluídos
                          </span>

                          <strong>
                            {statistics.completed}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Em andamento
                          </span>

                          <strong>
                            {statistics.inProgress}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Planejados
                          </span>

                          <strong>
                            {statistics.planned}
                          </strong>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      DISTRIBUIÇÃO
                    </span>

                    <h3>
                      Registros por talhão
                    </h3>
                  </div>
                </div>

                {plotSummary.length === 0 ? (
                  <div className="report-empty">
                    Nenhum talhão possui registros
                    no período selecionado.
                  </div>
                ) : (
                  <div className="plot-report-list">
                    {plotSummary.map(
                      (plot) => (
                        <div
                          className="plot-report-row"
                          key={plot.name}
                        >
                          <div className="plot-report-info">
                            <strong>
                              {plot.name}
                            </strong>

                            <span>
                              {plot.culture}
                            </span>
                          </div>

                          <div className="plot-report-bar">
                            <div
                              style={{
                                width: `${(plot.count / maxPlot) * 100}%`,
                              }}
                            />
                          </div>

                          <strong>
                            {plot.count}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      MANEJO
                    </span>

                    <h3>
                      Tipos de atividade
                    </h3>
                  </div>
                </div>

                {managementSummary.length === 0 ? (
                  <div className="report-empty">
                    Nenhum tipo de manejo
                    foi encontrado.
                  </div>
                ) : (
                  <div className="summary-list">
                    {managementSummary.map(
                      (item) => (
                        <div
                          className="summary-row"
                          key={item.name}
                        >
                          <div className="summary-row-info">
                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              Registros realizados
                            </span>
                          </div>

                          <div className="summary-bar">
                            <div
                              style={{
                                width: `${(item.count / maxManagement) * 100}%`,
                              }}
                            />
                          </div>

                          <strong>
                            {item.count}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      FITOSSANITÁRIO
                    </span>

                    <h3>
                      Ocorrências registradas
                    </h3>
                  </div>
                </div>

                <div className="occurrence-grid">

                  <OccurrenceCard
                    icon={<Bug size={15} />}
                    title="Pragas"
                    subtitle={`${statistics.withPest} registros com ocorrência`}
                    data={pestSummary}
                    empty="Nenhuma praga registrada."
                  />

                  <OccurrenceCard
                    icon={
                      <Droplets size={15} />
                    }
                    title="Doenças"
                    subtitle={`${statistics.withDisease} registros com ocorrência`}
                    data={diseaseSummary}
                    empty="Nenhuma doença registrada."
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      INSUMOS
                    </span>

                    <h3>
                      Produtos registrados
                    </h3>
                  </div>
                </div>

                {productSummary.length === 0 ? (
                  <div className="report-empty">
                    Nenhum produto foi
                    registrado nas atividades
                    do período.
                  </div>
                ) : (
                  <div className="product-report-grid">
                    {productSummary
                      .slice(0, 9)
                      .map(
                        (product) => (
                          <div
                            className="product-report-card"
                            key={product.name}
                          >
                            <div className="product-report-icon">
                              <Package size={15} />
                            </div>

                            <div>
                              <strong>
                                {product.name}
                              </strong>

                              <span>
                                {product.applications}{" "}
                                {product.applications === 1
                                  ? "aplicação"
                                  : "aplicações"}
                              </span>

                              <small>
                                {formatQuantity(
                                  product.quantity
                                )}{" "}
                                {product.unit || ""}
                              </small>
                            </div>
                          </div>
                        )
                      )}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ===================================================
              PROPRIEDADES
          =================================================== */}

          {selectedReport === "propriedades" && (
            <>
              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      INDICADORES
                    </span>

                    <h3>
                      Estrutura das propriedades
                    </h3>
                  </div>
                </div>

                <div className="report-stat-grid">

                  <StatCard
                    icon={
                      <Building2 size={16} />
                    }
                    label="Propriedades"
                    value={filteredProperties.length}
                  />

                  <StatCard
                    icon={
                      <MapPinned size={16} />
                    }
                    label="Talhões"
                    value={
                      filteredPlots.length
                    }
                  />

                  <StatCard
                    icon={
                      <ClipboardList size={16} />
                    }
                    label="Registros"
                    value={
                      filteredActivities.length
                    }
                  />

                  <StatCard
                    icon={
                      <Leaf size={16} />
                    }
                    label="Culturas"
                    value={filteredCultures.length}
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      CADASTRO
                    </span>

                    <h3>
                      Propriedades cadastradas
                    </h3>
                  </div>
                </div>

                {filteredProperties.length === 0 ? (
                  <div className="report-empty">
                    Nenhuma propriedade encontrada.
                  </div>
                ) : (
                  <div className="activities-table-wrapper">
                    <table className="activities-table">
                      <thead>
                        <tr>
                          <th>
                            Propriedade
                          </th>
                          <th>
                            Responsável
                          </th>
                          <th>
                            Cidade
                          </th>
                          <th>
                            Estado
                          </th>
                          <th>
                            Talhões
                          </th>
                          <th>
                            Registros
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredProperties.map(
                          (property) => {
                            const propertyPlots =
                              plots.filter(
                                (plot) =>
                                  String(
                                    plot.propertyId ??
                                      plot.property ??
                                      ""
                                  ) ===
                                  String(property.id)
                              );

                            const propertyActivities =
                              activities.filter(
                                (activity) =>
                                  String(
                                    activity.propertyId ??
                                      activity.property ??
                                      ""
                                  ) ===
                                  String(property.id)
                              );

                            return (
                              <tr
                                key={property.id}
                              >
                                <td>
                                  <strong>
                                    {property.name ||
                                      property.nome ||
                                      "Sem nome"}
                                  </strong>
                                </td>

                                <td>
                                  {property.owner ||
                                    property.responsible ||
                                    property.responsavel ||
                                    "—"}
                                </td>

                                <td>
                                  {property.city ||
                                    property.cidade ||
                                    "—"}
                                </td>

                                <td>
                                  {property.state ||
                                    property.estado ||
                                    "—"}
                                </td>

                                <td>
                                  {propertyPlots.length}
                                </td>

                                <td>
                                  {propertyActivities.length}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ===================================================
              TALHÕES
          =================================================== */}

          {selectedReport === "talhoes" && (
            <>
              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      INDICADORES
                    </span>

                    <h3>
                      Estrutura dos talhões
                    </h3>
                  </div>
                </div>

                <div className="report-stat-grid">

                  <StatCard
                    icon={
                      <MapPinned size={16} />
                    }
                    label="Talhões"
                    value={filteredPlots.length}
                  />

                  <StatCard
                    icon={
                      <Building2 size={16} />
                    }
                    label="Propriedades"
                    value={
                      new Set(
                        filteredPlots
                          .map(
                            (plot) =>
                              plot.propertyId ??
                              plot.property
                          )
                          .filter(Boolean)
                      ).size
                    }
                  />

                  <StatCard
                    icon={
                      <ClipboardList size={16} />
                    }
                    label="Registros"
                    value={
                      filteredActivities.length
                    }
                  />

                  <StatCard
                    icon={
                      <Leaf size={16} />
                    }
                    label="Culturas"
                    value={
                      new Set(
                        filteredPlots
                          .map(
                            (plot) =>
                              plot.culture ||
                              plot.cultureName ||
                              plot.cultura
                          )
                          .filter(Boolean)
                      ).size
                    }
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      CADASTRO
                    </span>

                    <h3>
                      Talhões cadastrados
                    </h3>
                  </div>
                </div>

                {filteredPlots.length === 0 ? (
                  <div className="report-empty">
                    Nenhum talhão encontrado.
                  </div>
                ) : (
                  <div className="activities-table-wrapper">
                    <table className="activities-table">
                      <thead>
                        <tr>
                          <th>
                            Talhão
                          </th>
                          <th>
                            Propriedade
                          </th>
                          <th>
                            Cultura
                          </th>
                          <th>
                            Solo
                          </th>
                          <th>
                            Área
                          </th>
                          <th>
                            Registros
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredPlots.map(
                          (plot) => {
                            const activityCount =
                              activities.filter(
                                (activity) =>
                                  String(
                                    activity.plotId ??
                                      activity.fieldId ??
                                      activity.talhaoId ??
                                      ""
                                  ) ===
                                  String(plot.id)
                              ).length;

                            return (
                              <tr
                                key={plot.id}
                              >
                                <td>
                                  <strong>
                                    {plot.name ||
                                      plot.nome ||
                                      "Sem nome"}
                                  </strong>
                                </td>

                                <td>
                                  {getPropertyName(
                                    plot.propertyId ??
                                      plot.property
                                  )}
                                </td>

                                <td>
                                  {plot.culture ||
                                    plot.cultureName ||
                                    plot.cultura ||
                                    "—"}
                                </td>

                                <td>
                                  {plot.soil ||
                                    plot.solo ||
                                    "—"}
                                </td>

                                <td>
                                  {formatArea(
                                    plot.area ??
                                      plot.areaHa ??
                                      plot.hectares
                                  )}
                                </td>

                                <td>
                                  {activityCount}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ===================================================
              CULTURAS
          =================================================== */}

          {selectedReport === "culturas" && (
            <>
              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      INDICADORES
                    </span>

                    <h3>
                      Cadastro de culturas
                    </h3>
                  </div>
                </div>

                <div className="report-stat-grid">

                  <StatCard
                    icon={
                      <Leaf size={16} />
                    }
                    label="Culturas"
                    value={
                      filteredCultures.length
                    }
                  />

                  <StatCard
                    icon={
                      <MapPinned size={16} />
                    }
                    label="Talhões"
                    value={
                      filteredPlots.length
                    }
                  />

                  <StatCard
                    icon={
                      <ClipboardList size={16} />
                    }
                    label="Registros"
                    value={
                      filteredActivities.length
                    }
                  />

                  <StatCard
                    icon={
                      <Building2 size={16} />
                    }
                    label="Propriedades"
                    value={
                      properties.length
                    }
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      CADASTRO
                    </span>

                    <h3>
                      Culturas cadastradas
                    </h3>
                  </div>
                </div>

                {filteredCultures.length === 0 ? (
                  <div className="report-empty">
                    Nenhuma cultura encontrada.
                  </div>
                ) : (
                  <div className="activities-table-wrapper">
                    <table className="activities-table">
                      <thead>
                        <tr>
                          <th>
                            Cultura
                          </th>
                          <th>
                            Variedade
                          </th>
                          <th>
                            Ciclo
                          </th>
                          <th>
                            Talhão
                          </th>
                          <th>
                            Propriedade
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredCultures.map(
                          (culture) => (
                            <tr
                              key={
                                culture.id
                              }
                            >
                              <td>
                                <strong>
                                  {culture.name ||
                                    culture.nome ||
                                    culture.title ||
                                    "Sem nome"}
                                </strong>
                              </td>

                              <td>
                                {culture.variety ||
                                  culture.variedade ||
                                  culture.type ||
                                  "—"}
                              </td>

                              <td>
                                {culture.cycle ||
                                  culture.ciclo ||
                                  "—"}
                              </td>

                              <td>
                                {getPlotName(
                                  culture.plotId ??
                                    culture.fieldId ??
                                    culture.talhaoId
                                )}
                              </td>

                              <td>
                                {getPropertyName(
                                  culture.propertyId ??
                                    culture.property
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ===================================================
              MANEJO
          =================================================== */}

          {selectedReport === "manejo" && (
            <>
              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      INDICADORES
                    </span>

                    <h3>
                      Acompanhamento do manejo
                    </h3>
                  </div>
                </div>

                <div className="report-stat-grid">

                  <StatCard
                    icon={
                      <ClipboardList size={16} />
                    }
                    label="Total de atividades"
                    value={statistics.total}
                  />

                  <StatCard
                    icon={<Check size={16} />}
                    label="Concluídas"
                    value={statistics.completed}
                  />

                  <StatCard
                    icon={
                      <Activity size={16} />
                    }
                    label="Em andamento"
                    value={statistics.inProgress}
                  />

                  <StatCard
                    icon={
                      <CalendarDays size={16} />
                    }
                    label="Planejadas"
                    value={statistics.planned}
                  />

                  <StatCard
                    icon={
                      <MapPinned size={16} />
                    }
                    label="Talhões envolvidos"
                    value={plotSummary.length}
                  />

                  <StatCard
                    icon={
                      <Sprout size={16} />
                    }
                    label="Tipos de manejo"
                    value={
                      managementSummary.length
                    }
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      DISTRIBUIÇÃO
                    </span>

                    <h3>
                      Tipos de manejo
                    </h3>
                  </div>
                </div>

                {managementSummary.length === 0 ? (
                  <div className="report-empty">
                    Nenhuma atividade de
                    manejo encontrada.
                  </div>
                ) : (
                  <div className="summary-list">
                    {managementSummary.map(
                      (item) => (
                        <div
                          className="summary-row"
                          key={item.name}
                        >
                          <div className="summary-row-info">
                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              Atividades
                              registradas
                            </span>
                          </div>

                          <div className="summary-bar">
                            <div
                              style={{
                                width: `${(item.count / maxManagement) * 100}%`,
                              }}
                            />
                          </div>

                          <strong>
                            {item.count}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      DETALHAMENTO
                    </span>

                    <h3>
                      Atividades realizadas
                    </h3>
                  </div>

                  <span>
                    {filteredActivities.length}{" "}
                    registros
                  </span>
                </div>

                <ActivitiesTable
                  activities={
                    filteredActivities
                  }
                  getPropertyName={
                    getPropertyName
                  }
                  getPlotName={
                    getPlotName
                  }
                />
              </section>
            </>
          )}

          {/* ===================================================
              FITOSSANITÁRIO
          =================================================== */}

          {selectedReport ===
            "fitossanitario" && (
            <>
              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      INDICADORES
                    </span>

                    <h3>
                      Situação fitossanitária
                    </h3>
                  </div>
                </div>

                <div className="report-stat-grid">

                  <StatCard
                    icon={<Bug size={16} />}
                    label="Com pragas"
                    value={statistics.withPest}
                  />

                  <StatCard
                    icon={
                      <Droplets size={16} />
                    }
                    label="Com doenças"
                    value={statistics.withDisease}
                  />

                  <StatCard
                    icon={
                      <ClipboardList size={16} />
                    }
                    label="Total de registros"
                    value={statistics.total}
                  />

                  <StatCard
                    icon={
                      <MapPinned size={16} />
                    }
                    label="Talhões envolvidos"
                    value={phytosanitaryPlots}
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      OCORRÊNCIAS
                    </span>

                    <h3>
                      Pragas e doenças
                    </h3>
                  </div>
                </div>

                <div className="occurrence-grid">

                  <OccurrenceCard
                    icon={<Bug size={15} />}
                    title="Pragas"
                    subtitle={`${statistics.withPest} registros`}
                    data={pestSummary}
                    empty="Nenhuma praga registrada."
                  />

                  <OccurrenceCard
                    icon={
                      <Droplets size={15} />
                    }
                    title="Doenças"
                    subtitle={`${statistics.withDisease} registros`}
                    data={diseaseSummary}
                    empty="Nenhuma doença registrada."
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      DETALHAMENTO
                    </span>

                    <h3>
                      Registros fitossanitários
                    </h3>
                  </div>
                </div>

                <ActivitiesTable
                  activities={filteredActivities.filter(
                    (activity) =>
                      getActivityPest(
                        activity
                      ) ||
                      getActivityDisease(
                        activity
                      )
                  )}
                  getPropertyName={
                    getPropertyName
                  }
                  getPlotName={
                    getPlotName
                  }
                  fitossanitary
                />
              </section>
            </>
          )}

          {/* ===================================================
              PRODUTOS / ESTOQUE
          =================================================== */}

          {selectedReport === "produtos" && (
            <>
              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      INDICADORES
                    </span>

                    <h3>
                      Produtos e estoque
                    </h3>
                  </div>
                </div>

                <div className="report-stat-grid">

                  <StatCard
                    icon={
                      <Package size={16} />
                    }
                    label="Produtos"
                    value={stockSummary.length}
                  />

                  <StatCard
                    icon={
                      <Activity size={16} />
                    }
                    label="Aplicações"
                    value={
                      statistics.withProduct
                    }
                  />

                  <StatCard
                    icon={
                      <ClipboardList size={16} />
                    }
                    label="Registros"
                    value={statistics.total}
                  />

                  <StatCard
                    icon={
                      <MapPinned size={16} />
                    }
                    label="Talhões envolvidos"
                    value={productPlots}
                  />

                  <StatCard
                    icon={
                      <RefreshCw size={16} />
                    }
                    label="Estoque baixo"
                    value={
                      lowStockProducts.length
                    }
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      ESTOQUE
                    </span>

                    <h3>
                      Situação atual dos produtos
                    </h3>
                  </div>
                </div>

                {stockSummary.length === 0 ? (
                  <div className="report-empty">
                    Nenhum produto cadastrado
                    no estoque.
                  </div>
                ) : (
                  <div className="activities-table-wrapper">
                    <table className="activities-table">
                      <thead>
                        <tr>
                          <th>
                            Produto
                          </th>
                          <th>
                            Estoque atual
                          </th>
                          <th>
                            Estoque mínimo
                          </th>
                          <th>
                            Unidade
                          </th>
                          <th>
                            Situação
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {stockSummary.map(
                          (product) => (
                            <tr
                              key={
                                product.id
                              }
                            >
                              <td>
                                <strong>
                                  {product.name}
                                </strong>
                              </td>

                              <td>
                                {formatQuantity(
                                  product.stock
                                )}
                              </td>

                              <td>
                                {formatQuantity(
                                  product.minimumStock
                                )}
                              </td>

                              <td>
                                {product.unit ||
                                  "—"}
                              </td>

                              <td>
                                <span
                                  className={`status-badge ${
                                    product.lowStock
                                      ? "planejado"
                                      : "concluído"
                                  }`}
                                >
                                  {product.lowStock
                                    ? "Estoque baixo"
                                    : "Estoque normal"}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      CONSOLIDAÇÃO
                    </span>

                    <h3>
                      Produtos mais utilizados
                    </h3>
                  </div>
                </div>

                {productSummary.length === 0 ? (
                  <div className="report-empty">
                    Nenhum produto foi
                    encontrado no período
                    selecionado.
                  </div>
                ) : (
                  <div className="summary-list">
                    {productSummary.map(
                      (product) => (
                        <div
                          className="summary-row"
                          key={product.name}
                        >
                          <div className="summary-row-info">
                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              {formatQuantity(
                                product.quantity
                              )}{" "}
                              {product.unit || ""}
                            </span>
                          </div>

                          <div className="summary-bar">
                            <div
                              style={{
                                width: `${(product.applications / maxProduct) * 100}%`,
                              }}
                            />
                          </div>

                          <strong>
                            {product.applications}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      DETALHAMENTO
                    </span>

                    <h3>
                      Atividades com produtos
                    </h3>
                  </div>
                </div>

                <ActivitiesTable
                  activities={filteredActivities.filter(
                    (activity) =>
                      getActivityProduct(
                        activity
                      )
                  )}
                  getPropertyName={
                    getPropertyName
                  }
                  getPlotName={
                    getPlotName
                  }
                  products
                />
              </section>
            </>
          )}

          {/* ===================================================
              DIÁRIO
          =================================================== */}

          {selectedReport === "diario" && (
            <>
              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      RESUMO
                    </span>

                    <h3>
                      Registros do Diário de Campo
                    </h3>
                  </div>
                </div>

                <div className="report-stat-grid">

                  <StatCard
                    icon={
                      <ClipboardList size={16} />
                    }
                    label="Registros"
                    value={statistics.total}
                  />

                  <StatCard
                    icon={<Check size={16} />}
                    label="Concluídos"
                    value={statistics.completed}
                  />

                  <StatCard
                    icon={
                      <Activity size={16} />
                    }
                    label="Em andamento"
                    value={statistics.inProgress}
                  />

                  <StatCard
                    icon={
                      <CalendarDays size={16} />
                    }
                    label="Planejados"
                    value={statistics.planned}
                  />

                  <StatCard
                    icon={<Bug size={16} />}
                    label="Com ocorrências"
                    value={
                      statistics.withPest +
                      statistics.withDisease
                    }
                  />

                  <StatCard
                    icon={
                      <Package size={16} />
                    }
                    label="Com produtos"
                    value={
                      statistics.withProduct
                    }
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      REGISTROS
                    </span>

                    <h3>
                      Diário completo
                    </h3>
                  </div>

                  <span>
                    Ordem cronológica
                  </span>
                </div>

                <ActivitiesTable
                  activities={
                    filteredActivities
                  }
                  getPropertyName={
                    getPropertyName
                  }
                  getPlotName={
                    getPlotName
                  }
                />
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      OCORRÊNCIAS
                    </span>

                    <h3>
                      Resumo adicional
                    </h3>
                  </div>
                </div>

                <div className="occurrence-grid">

                  <OccurrenceCard
                    icon={<Bug size={15} />}
                    title="Pragas"
                    subtitle={`${statistics.withPest} registros`}
                    data={pestSummary}
                    empty="Nenhuma praga registrada."
                  />

                  <OccurrenceCard
                    icon={
                      <Droplets size={15} />
                    }
                    title="Doenças"
                    subtitle={`${statistics.withDisease} registros`}
                    data={diseaseSummary}
                    empty="Nenhuma doença registrada."
                  />

                </div>
              </section>
            </>
          )}

          {/* ===================================================
              PEDIDOS
          =================================================== */}

          {selectedReport === "pedidos" && (
            <>
              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      INDICADORES
                    </span>

                    <h3>
                      Resumo dos pedidos
                    </h3>
                  </div>
                </div>

                <div className="report-stat-grid">

                  <StatCard
                    icon={
                      <ShoppingCart size={16} />
                    }
                    label="Pedidos"
                    value={
                      ordersSummary.total
                    }
                  />

                  <StatCard
                    icon={
                      <CalendarDays size={16} />
                    }
                    label="Pendentes"
                    value={
                      ordersSummary.pending
                    }
                  />

                  <StatCard
                    icon={
                      <Activity size={16} />
                    }
                    label="Em andamento"
                    value={
                      ordersSummary.inProgress
                    }
                  />

                  <StatCard
                    icon={
                      <Check size={16} />
                    }
                    label="Concluídos"
                    value={
                      ordersSummary.completed
                    }
                  />

                  <StatCard
                    icon={
                      <FileBarChart size={16} />
                    }
                    label="Valor total"
                    value={formatCurrency(
                      ordersSummary.totalValue
                    )}
                  />

                </div>
              </section>

              <section className="report-section">
                <div className="section-heading">
                  <div>
                    <span>
                      PEDIDOS
                    </span>

                    <h3>
                      Relação de pedidos
                    </h3>
                  </div>

                  <span>
                    {filteredOrders.length}{" "}
                    pedidos
                  </span>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="report-empty">
                    Nenhum pedido encontrado
                    para o período selecionado.
                  </div>
                ) : (
                  <div className="activities-table-wrapper">
                    <table className="activities-table">
                      <thead>
                        <tr>
                          <th>
                            Pedido
                          </th>
                          <th>
                            Cliente
                          </th>
                          <th>
                            Data
                          </th>
                          <th>
                            Itens
                          </th>
                          <th>
                            Total
                          </th>
                          <th>
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {[...filteredOrders]
                          .sort(
                            (a, b) =>
                              getOrderDate(
                                b
                              ).localeCompare(
                                getOrderDate(
                                  a
                                )
                              )
                          )
                          .map(
                            (order) => {
                              const status =
                                order.status ||
                                "Não informado";

                              const normalized =
                                normalizeStatus(
                                  status
                                );

                              const statusClass =
                                normalized ===
                                "concluido"
                                  ? "concluído"
                                  : normalized ===
                                    "em andamento"
                                  ? "em-andamento"
                                  : normalized ===
                                    "pendente"
                                  ? "planejado"
                                  : "";

                              return (
                                <tr
                                  key={
                                    order.id
                                  }
                                >
                                  <td>
                                    <strong>
                                      #{order.id}
                                    </strong>
                                  </td>

                                  <td>
                                    {order.customer ||
                                      order.cliente ||
                                      "—"}
                                  </td>

                                  <td>
                                    {formatDate(
                                      getOrderDate(
                                        order
                                      )
                                    )}
                                  </td>

                                  <td>
                                    {getOrderItemCount(
                                      order
                                    )}
                                  </td>

                                  <td>
                                    {formatCurrency(
                                      parseNumber(
                                        order.total ??
                                          order.valor ??
                                          0
                                      )
                                    )}
                                  </td>

                                  <td>
                                    <span
                                      className={`status-badge ${statusClass}`}
                                    >
                                      {status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ===================================================
              RODAPÉ
          =================================================== */}

          <footer className="report-footer">
            <div>
              <strong>
                CADERNO DE CAMPO
              </strong>

              <span>
                Gestão agrícola inteligente
              </span>
            </div>

            <div>
              <strong>
                Responsável técnica:
                {" "}
                Laís L. Andrade
              </strong>

              <span>
                Relatório gerado em{" "}
                {formatDateTime(
                  new Date()
                )}
              </span>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}

/* =========================================================
   CARD DE ESTATÍSTICA
========================================================= */

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="report-stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   CARD DE OCORRÊNCIA
========================================================= */

function OccurrenceCard({
  icon,
  title,
  subtitle,
  data,
  empty,
}) {
  return (
    <div className="occurrence-card">
      <div className="occurrence-header">
        <span>
          {icon}
        </span>

        <div>
          <strong>
            {title}
          </strong>

          <small>
            {subtitle}
          </small>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="occurrence-empty">
          {empty}
        </div>
      ) : (
        <div className="occurrence-list">
          {data
            .slice(0, 8)
            .map((item) => (
              <div
                className="occurrence-item"
                key={item.name}
              >
                <span>
                  {item.name}
                </span>

                <strong>
                  {item.count}
                </strong>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TABELA DE ATIVIDADES
========================================================= */

function ActivitiesTable({
  activities,
  getPropertyName,
  getPlotName,
  fitossanitary = false,
  products = false,
}) {
  const sortedActivities =
    [...activities].sort((a, b) =>
      getActivityDate(b).localeCompare(
        getActivityDate(a)
      )
    );

  if (sortedActivities.length === 0) {
    return (
      <div className="report-empty">
        Nenhum registro encontrado
        para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="activities-table-wrapper">
      <table className="activities-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Atividade</th>
            <th>Propriedade</th>
            <th>Talhão</th>
            <th>Status</th>

            {fitossanitary && (
              <th>
                Ocorrência
              </th>
            )}

            {products && (
              <th>
                Produto
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {sortedActivities.map(
            (activity) => {
              const status =
                activity.managementStatus ||
                "Não informado";

              const normalized =
                normalizeStatus(
                  status
                );

              const statusClass =
                normalized ===
                "concluido"
                  ? "concluído"
                  : normalized ===
                    "em andamento"
                  ? "em-andamento"
                  : normalized ===
                    "planejado"
                  ? "planejado"
                  : "";

              const pest =
                getActivityPest(
                  activity
                );

              const disease =
                getActivityDisease(
                  activity
                );

              const occurrence =
                pest && disease
                  ? `${pest} / ${disease}`
                  : pest ||
                    disease ||
                    "—";

              return (
                <tr
                  key={activity.id}
                >
                  <td>
                    {formatDate(
                      getActivityDate(
                        activity
                      )
                    )}
                  </td>

                  <td>
                    <strong>
                      {activity.title ||
                        activity.activity ||
                        activity.name ||
                        "Sem título"}
                    </strong>

                    {activity.location && (
                      <small>
                        {
                          activity.location
                        }
                      </small>
                    )}
                  </td>

                  <td>
                    {getPropertyName(
                      activity.propertyId ??
                        activity.property
                    )}
                  </td>

                  <td>
                    {getPlotName(
                      activity.plotId ??
                        activity.fieldId ??
                        activity.talhaoId
                    )}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${statusClass}`}
                    >
                      {status}
                    </span>
                  </td>

                  {fitossanitary && (
                    <td>
                      {occurrence}
                    </td>
                  )}

                  {products && (
                    <td>
                      {getActivityProduct(
                        activity
                      ) || "—"}
                    </td>
                  )}
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   HELPERS — ATIVIDADES
========================================================= */

function getActivityDate(activity) {
  if (!activity) {
    return "";
  }

  const value =
    activity.date ||
    activity.activityDate ||
    activity.createdAt;

  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getOrderDate(order) {
  if (!order) {
    return "";
  }

  const value =
    order.date ||
    order.orderDate ||
    order.createdAt;

  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getOrderItemCount(order) {
  if (!order) {
    return 0;
  }

  if (
    Array.isArray(order.items)
  ) {
    return order.items.reduce(
      (total, item) =>
        total +
        parseNumber(
          item.quantity ??
            item.quantidade ??
            1
        ),
      0
    );
  }

  return parseNumber(
    order.itemCount ??
      order.itemsCount ??
      0
  );
}

function getActivityPest(activity) {
  if (!activity) {
    return "";
  }

  const value =
    activity.pest ||
    activity.pests ||
    activity.praga ||
    activity.pragas;

  return extractName(value);
}

function getActivityDisease(activity) {
  if (!activity) {
    return "";
  }

  const value =
    activity.disease ||
    activity.diseases ||
    activity.doenca ||
    activity.doencas;

  return extractName(value);
}

function getActivityProduct(activity) {
  if (!activity) {
    return "";
  }

  const value =
    activity.product ||
    activity.products ||
    activity.productName ||
    activity.produto ||
    activity.produtos;

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "";
    }

    return value
      .map((item) =>
        extractName(item)
      )
      .filter(Boolean)
      .join(", ");
  }

  return extractName(value);
}

function getProductUnit(activity) {
  if (!activity) {
    return "";
  }

  return (
    activity.unit ||
    activity.productUnit ||
    activity.unidade ||
    ""
  );
}

function getActivityQuantity(activity) {
  if (!activity) {
    return 0;
  }

  const value =
    activity.quantity ??
    activity.productQuantity ??
    activity.quantidade ??
    activity.amount ??
    0;

  if (Array.isArray(value)) {
    return value.reduce(
      (total, item) =>
        total + parseNumber(item),
      0
    );
  }

  return parseNumber(value);
}

function extractName(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        extractName(item)
      )
      .filter(Boolean)
      .join(", ");
  }

  if (
    typeof value === "object"
  ) {
    return (
      value.name ||
      value.nome ||
      value.title ||
      value.label ||
      ""
    );
  }

  return "";
}

function parseNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (!value) {
    return 0;
  }

  const normalized = String(value)
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const number =
    Number(normalized);

  return Number.isFinite(number)
    ? number
    : 0;
}

/* =========================================================
   HELPERS — STATUS
========================================================= */

function normalizeStatus(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim()
    .toLowerCase();
}

/* =========================================================
   HELPERS — DATAS
========================================================= */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    const [
      year,
      month,
      day,
    ] = value.split("-");

    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "pt-BR"
  );
}

function formatDateTime(value) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "pt-BR"
  );
}

function formatMonth(value) {
  if (!value) {
    return "";
  }

  const [
    year,
    month,
  ] = value.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date
    .toLocaleDateString(
      "pt-BR",
      {
        month: "short",
        year: "numeric",
      }
    )
    .replace(".", "");
}

/* =========================================================
   HELPERS — NÚMEROS
========================================================= */

function formatQuantity(value) {
  const number = parseNumber(value);

  return Number.isInteger(number)
    ? String(number)
    : number.toLocaleString(
        "pt-BR",
        {
          maximumFractionDigits: 2,
        }
      );
}

function formatCurrency(value) {
  return parseNumber(value).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function formatArea(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = parseNumber(value);

  return `${number.toLocaleString(
    "pt-BR",
    {
      maximumFractionDigits: 2,
    }
  )} ha`;
}

export default Reports;
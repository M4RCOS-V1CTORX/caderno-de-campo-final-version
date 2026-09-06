import { useEffect, useState } from "react";

import {
  Building2,
  ClipboardList,
  Library,
  Sprout,
  BarChart3,
  ArrowUpRight,
  Database,
  MapPinned,
  CalendarDays,
  Check,
  Plus,
} from "lucide-react";

import { getActivities } from "../services/activityService";

import "../styles/home.css";

function Home({
  onNewActivity,
  onEditActivity,
  onViewActivity,
  onProperties,
  onDiary,
  onLibrary,
  onReports,
  onCultures,
  onManagement,
  onOrders,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     CARREGAR DADOS
  ========================================================= */

  async function loadActivities() {
    try {
      const data = await getActivities();

      setActivities(data || []);
    } catch (error) {
      console.error("ERRO AO CARREGAR ATIVIDADES:", error);

      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  /* =========================================================
     DATA
  ========================================================= */

  const today = new Date().toISOString().split("T")[0];

  const todayActivities = activities.filter(
    (activity) => activity.date === today
  );

  const uniqueLocations = new Set(
    activities
      .map((activity) => activity.location)
      .filter(Boolean)
  );

  const locationsCount = uniqueLocations.size;

  const recentActivities = [...activities]
    .sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return dateB - dateA;
    })
    .slice(0, 4);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="home">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="home-hero">

        <div className="hero-background-glow"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            SISTEMA DE GESTÃO AGRÍCOLA
          </div>

          <div className="hero-client">
            <span>RESPONSÁVEL TÉCNICA</span>

            <strong>
              Laís L. Andrade
            </strong>
          </div>

          <h1>
            Seu campo.
            <br />
            <span>Mais organizado.</span>
          </h1>

          <p className="hero-description">
            Organize propriedades, acompanhe talhões,
            registre atividades e mantenha todas as
            informações do campo em um só lugar.
          </p>

          <div className="hero-actions">

            <button
              type="button"
              className="hero-primary-button"
              onClick={onDiary}
            >
              <span className="button-icon">
                <ClipboardList
                  size={20}
                  strokeWidth={1.6}
                />
              </span>

              <span>
                <strong>
                  Abrir Diário de Campo
                </strong>

                <small>
                  Registrar e acompanhar atividades
                </small>
              </span>

              <span className="button-arrow">
                <ArrowUpRight
                  size={17}
                  strokeWidth={1.7}
                />
              </span>
            </button>

            <button
              type="button"
              className="hero-secondary-button"
              onClick={onNewActivity}
            >
              <Plus
                size={14}
                strokeWidth={2}
              />

              Nova atividade
            </button>

          </div>
        </div>

        {/* ===================================================
            VISUAL DO HERO
        =================================================== */}

        <div className="hero-visual">

          <div className="hero-circle hero-circle-one"></div>
          <div className="hero-circle hero-circle-two"></div>

          <div className="field-scene">

            <div className="sun"></div>

            <div className="mountain mountain-back"></div>

            <div className="mountain mountain-front"></div>

            <div className="field-lines">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="plant plant-one">
              <i></i>
              <b></b>
              <em></em>
            </div>

            <div className="plant plant-two">
              <i></i>
              <b></b>
              <em></em>
            </div>

            <div className="plant plant-three">
              <i></i>
              <b></b>
              <em></em>
            </div>

            <div className="plant plant-four">
              <i></i>
              <b></b>
              <em></em>
            </div>

            <div className="hero-floating-card">

              <div className="floating-icon">
                <Check
                  size={15}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <strong>
                  Campo organizado
                </strong>

                <span>
                  Dados salvos localmente
                </span>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* =====================================================
          FRASE DE DESTAQUE
      ===================================================== */}

      <section className="home-intro">

        <div className="intro-line"></div>

        <div>
          <span className="intro-label">
            TUDO EM UM SÓ LUGAR
          </span>

          <h2>
            Gestão agrícola feita
            <span> para o seu dia a dia.</span>
          </h2>
        </div>

        <p>
          Menos papelada. Mais organização.
          Tenha uma visão clara das informações
          importantes da sua propriedade.
        </p>

      </section>

      {/* =====================================================
          ACESSO RÁPIDO
      ===================================================== */}

      <section className="home-modules">

        <div className="home-section-heading">

          <div>
            <span>
              EXPLORE O SISTEMA
            </span>

            <h3>
              Tudo o que você precisa
            </h3>
          </div>

          <p>
            Acesse rapidamente os principais
            recursos do Caderno de Campo.
          </p>

        </div>

        <div className="premium-modules">

          {/* =================================================
              PROPRIEDADES
          ================================================= */}

          <button
            type="button"
            className="premium-module property-module"
            onClick={onProperties}
          >

            <div className="module-top">

              <span className="module-number">
                01
              </span>

              <span className="module-open">
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.6}
                />
              </span>

            </div>

            <div className="large-module-icon">

              <Building2
                size={23}
                strokeWidth={1.5}
              />

            </div>

            <div className="module-text">

              <h4>
                Propriedades
              </h4>

              <p>
                Organize propriedades,
                talhões e informações da área.
              </p>

            </div>

            <div className="module-bottom">

              <span>
                Acessar módulo
              </span>

              <strong>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.6}
                />
              </strong>

            </div>

          </button>

          {/* =================================================
              DIÁRIO DE CAMPO
          ================================================= */}

          <button
            type="button"
            className="premium-module diary-module"
            onClick={onDiary}
          >

            <div className="module-top">

              <span className="module-number">
                02
              </span>

              <span className="module-open">
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.6}
                />
              </span>

            </div>

            <div className="large-module-icon">

              <ClipboardList
                size={23}
                strokeWidth={1.5}
              />

            </div>

            <div className="module-text">

              <h4>
                Diário de Campo
              </h4>

              <p>
                Registre atividades,
                observações, manejos e ocorrências.
              </p>

            </div>

            <div className="module-bottom">

              <span>
                Acessar módulo
              </span>

              <strong>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.6}
                />
              </strong>

            </div>

          </button>

          {/* =================================================
              BIBLIOTECA
          ================================================= */}

          <button
            type="button"
            className="premium-module library-module"
            onClick={onLibrary}
          >

            <div className="module-top">

              <span className="module-number">
                03
              </span>

              <span className="module-open">
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.6}
                />
              </span>

            </div>

            <div className="large-module-icon">

              <Library
                size={23}
                strokeWidth={1.5}
              />

            </div>

            <div className="module-text">

              <h4>
                Biblioteca
              </h4>

              <p>
                Consulte produtos, pragas
                e doenças cadastrados.
              </p>

            </div>

            <div className="module-bottom">

              <span>
                Acessar módulo
              </span>

              <strong>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.6}
                />
              </strong>

            </div>

          </button>

          {/* =================================================
              MANEJO
          ================================================= */}

          <button
            type="button"
            className="premium-module management-module"
            onClick={onManagement}
          >

            <div className="module-top">

              <span className="module-number">
                04
              </span>

              <span className="module-open">
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.6}
                />
              </span>

            </div>

            <div className="large-module-icon">

              <Sprout
                size={23}
                strokeWidth={1.5}
              />

            </div>

            <div className="module-text">

              <h4>
                Manejo
              </h4>

              <p>
                Acompanhe os manejos planejados,
                em andamento e concluídos.
              </p>

            </div>

            <div className="module-bottom">

              <span>
                Acessar módulo
              </span>

              <strong>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.6}
                />
              </strong>

            </div>

          </button>

          {/* =================================================
              CULTURAS
          ================================================= */}

          <button
            type="button"
            className="premium-module culture-module"
            onClick={onCultures}
          >

            <div className="module-top">

              <span className="module-number">
                05
              </span>

              <span className="module-open">
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.6}
                />
              </span>

            </div>

            <div className="large-module-icon">

              <Sprout
                size={23}
                strokeWidth={1.5}
              />

            </div>

            <div className="module-text">

              <h4>
                Culturas
              </h4>

              <p>
                Cadastre e organize as culturas
                utilizadas nas propriedades.
              </p>

            </div>

            <div className="module-bottom">

              <span>
                Acessar módulo
              </span>

              <strong>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.6}
                />
              </strong>

            </div>

          </button>

          {/* =================================================
              RELATÓRIOS
          ================================================= */}

          <button
            type="button"
            className="premium-module reports-module"
            onClick={onReports}
          >

            <div className="module-top">

              <span className="module-number">
                06
              </span>

              <span className="module-open">
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.6}
                />
              </span>

            </div>

            <div className="large-module-icon">

              <BarChart3
                size={23}
                strokeWidth={1.5}
              />

            </div>

            <div className="module-text">

              <h4>
                Relatórios
              </h4>

              <p>
                Analise atividades, manejos,
                ocorrências e resultados do campo.
              </p>

            </div>

            <div className="module-bottom">

              <span>
                Acessar módulo
              </span>

              <strong>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.6}
                />
              </strong>

            </div>

          </button>

          {/* =================================================
              PEDIDOS
          ================================================= */}

          <button
            type="button"
            className="premium-module orders-module"
            onClick={onOrders}
          >

            <div className="module-top">

              <span className="module-number">
                07
              </span>

              <span className="module-open">
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.6}
                />
              </span>

            </div>

            <div className="large-module-icon">

              <ClipboardList
                size={23}
                strokeWidth={1.5}
              />

            </div>

            <div className="module-text">

              <h4>
                Pedidos
              </h4>

              <p>
                Organize pedidos, produtos
                e movimentações de estoque.
              </p>

            </div>

            <div className="module-bottom">

              <span>
                Acessar módulo
              </span>

              <strong>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.6}
                />
              </strong>

            </div>

          </button>

        </div>

      </section>

      {/* =====================================================
          PAINEL DE VISÃO GERAL
      ===================================================== */}

      <section className="overview-section">

        <div className="overview-main">

          <div className="overview-heading">

            <div>

              <span>
                VISÃO DO SISTEMA
              </span>

              <h3>
                Seu campo em números
              </h3>

            </div>

            <div className="online-status">

              <span></span>

              Sistema disponível

            </div>

          </div>

          <div className="overview-stats">

            {/* REGISTROS */}

            <div className="overview-stat">

              <span className="overview-stat-icon">

                <Database
                  size={16}
                  strokeWidth={1.6}
                />

              </span>

              <div>

                <strong>
                  {loading ? "—" : activities.length}
                </strong>

                <span>
                  Registros
                </span>

              </div>

            </div>

            {/* LOCAIS */}

            <div className="overview-stat">

              <span className="overview-stat-icon">

                <MapPinned
                  size={16}
                  strokeWidth={1.6}
                />

              </span>

              <div>

                <strong>
                  {loading ? "—" : locationsCount}
                </strong>

                <span>
                  Locais registrados
                </span>

              </div>

            </div>

            {/* REGISTROS DE HOJE */}

            <div className="overview-stat">

              <span className="overview-stat-icon">

                <CalendarDays
                  size={16}
                  strokeWidth={1.6}
                />

              </span>

              <div>

                <strong>
                  {loading ? "—" : todayActivities.length}
                </strong>

                <span>
                  Registros hoje
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            ÚLTIMOS REGISTROS
        =================================================== */}

        <div className="recent-mini">

          <div className="recent-mini-heading">

            <div>

              <span>
                ATIVIDADE
              </span>

              <h3>
                Últimos registros
              </h3>

            </div>

            <button
              type="button"
              onClick={onDiary}
            >
              Ver todos →
            </button>

          </div>

          {recentActivities.length === 0 ? (

            <div className="recent-empty">

              <span>
                —
              </span>

              <p>
                Seus próximos registros aparecerão aqui.
              </p>

            </div>

          ) : (

            <div className="mini-activity-list">

              {recentActivities.map((activity) => (

                <button
                  type="button"
                  className="mini-activity"
                  key={activity.id}
                  onClick={() =>
                    onViewActivity(activity)
                  }
                >

                  <span className="mini-activity-icon">

                    <ClipboardList
                      size={14}
                      strokeWidth={1.6}
                    />

                  </span>

                  <span className="mini-activity-info">

                    <strong>
                      {activity.title ||
                        "Atividade sem título"}
                    </strong>

                    <small>
                      {activity.location ||
                        "Local não informado"}
                    </small>

                  </span>

                  <span className="mini-activity-date">
                    {formatDate(activity.date)}
                  </span>

                  <span className="mini-activity-arrow">

                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.6}
                    />

                  </span>

                </button>

              ))}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          CTA FINAL
      ===================================================== */}

      <section className="home-final">

        <div className="final-decoration">

          <Sprout
            size={170}
            strokeWidth={1}
          />

        </div>

        <div>

          <span>
            DIÁRIO DE CAMPO
          </span>

          <h2>
            Pronto para cuidar
            <br />
            melhor do seu campo?
          </h2>

          <p>
            Comece registrando uma nova atividade
            e mantenha sua propriedade organizada.
          </p>

        </div>

        <button
          type="button"
          onClick={onNewActivity}
        >

          <span>

            <Plus
              size={15}
              strokeWidth={2}
            />

          </span>

          Nova atividade

        </button>

      </section>

      {/* =====================================================
          RODAPÉ INSTITUCIONAL
      ===================================================== */}

      <footer className="home-footer">

        <div>

          <strong>
            CADERNO DE CAMPO
          </strong>

          <span>
            Gestão agrícola inteligente
          </span>

        </div>

        <div className="home-footer-responsible">

          <span>
            RESPONSÁVEL TÉCNICA
          </span>

          <strong>
            Laís L. Andrade
          </strong>

          <small>
            WhatsApp: 74 9957-5038
          </small>

        </div>

      </footer>

    </main>
  );
}

/* =========================================================
   FORMATAR DATA
========================================================= */

function formatDate(date) {
  if (!date) {
    return "Sem data";
  }

  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  const [year, month, day] = parts;

  return `${day}/${month}/${year}`;
}

export default Home;
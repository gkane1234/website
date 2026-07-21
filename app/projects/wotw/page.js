export const metadata = {
  title: 'Maternal Health Analytics — Well on Their Way',
  description:
    'Python data pipeline, QGIS boundary layers, and Tableau dashboards for maternal-health M&E in Gulu, Uganda.',
}

const figures = [
  {
    src: '/wotw/pipeline-overview.png',
    alt: 'Plotly chart from the cleaned Impact or VHT training pipeline',
    caption: 'Pipeline output — interactive Plotly charts from cleaned long-format data',
  },
  {
    src: '/wotw/qgis-boundaries.png',
    alt: 'QGIS map of cleaned Gulu subcounty boundary layers',
    caption: 'QGIS — cleaned and aligned district / subcounty boundaries',
  },
  {
    src: '/wotw/tableau-anc-map.png',
    alt: 'Tableau dashboard map for antenatal care coverage',
    caption: 'Tableau — ANC / coverage map joined to custom GeoJSON layers',
  },
  {
    src: '/wotw/tableau-impact.png',
    alt: 'Tableau dashboard comparing Gulu and Omoro impact metrics',
    caption: 'Tableau — Gulu vs Omoro impact comparison',
  },
  {
    src: '/wotw/tableau-pocus.png',
    alt: 'Tableau storyboard for POCUS survey results',
    caption: 'Tableau — POCUS field survey storyboard',
  },
]

export default function WotwProject() {
  return (
    <article className="case-study container">
      <header className="case-study-header">
        <p className="case-study-eyebrow">Case study · 2026</p>
        <h1>Maternal Health Analytics</h1>
        <p className="case-study-lead">
          Well on Their Way — turning fragmented Excel health databanks into
          analysis-ready tables, GIS layers, and Tableau dashboards for
          maternal–child programs in Gulu District, Uganda.
        </p>
        <div className="tech case-study-tech">
          {['Python', 'Pandas', 'Tableau', 'QGIS', 'Plotly', 'GeoPandas'].map(
            (t) => (
              <span key={t}>{t}</span>
            )
          )}
        </div>
      </header>

      <section className="case-study-section">
        <h2>Overview</h2>
        <p>
          Well on Their Way supports maternal and child health through village
          health team (VHT) training and facility-level monitoring. Program
          data lived in large Excel “databanks” that were hard to refresh and
          join to maps. I built a repeatable Python pipeline, cleaned spatial
          boundaries in QGIS, and published interactive Tableau dashboards for
          training coverage, district impact (Gulu vs Omoro), and obstetric
          POCUS field data.
        </p>
      </section>

      <section className="case-study-section">
        <h2>Data pipeline</h2>
        <p>
          Excel sheets were imported into long-format CSVs, then reshaped into
          analysis tables with population denominators and inferred coverage
          rates for Impact and VHT Training metrics. Plotly scripts produced
          HTML chart hubs for quick exploration before dashboarding.
        </p>
        <ul>
          <li>Import fragmented databanks → standardized long output</li>
          <li>Build comparison and per-source tables with formula-based %</li>
          <li>Generate interactive charts for recurring metric reviews</li>
        </ul>
        <figure className="case-study-figure">
          <img src={figures[0].src} alt={figures[0].alt} />
          <figcaption>{figures[0].caption}</figcaption>
        </figure>
      </section>

      <section className="case-study-section">
        <h2>GIS &amp; QGIS</h2>
        <p>
          Public and local shapefiles needed cleanup before joining metrics.
          Boundaries were fixed in QGIS, exported as GeoJSON, and joined to VHT
          and impact indicators so Tableau maps aligned with real subcounties
          and health-center catchments.
        </p>
        <figure className="case-study-figure">
          <img src={figures[1].src} alt={figures[1].alt} />
          <figcaption>{figures[1].caption}</figcaption>
        </figure>
      </section>

      <section className="case-study-section">
        <h2>Tableau dashboards</h2>
        <p>
          Dashboards and storyboards covered antenatal and postnatal coverage,
          immunization and nutrition indicators, Gulu vs Omoro impact
          comparisons, and POCUS survey results — filtering by period and
          geography on the cleaned layers.
        </p>
        <div className="case-study-gallery">
          {figures.slice(2).map((fig) => (
            <figure key={fig.src} className="case-study-figure">
              <img src={fig.src} alt={fig.alt} />
              <figcaption>{fig.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="case-study-section">
        <h2>Interactive demo</h2>
        <p className="case-study-note">
          Live Tableau embeds are withheld while program data stays private.
          An interactive walkthrough is available on request; a scrubbed Tableau
          Public link can be added here later.
        </p>
      </section>
    </article>
  )
}

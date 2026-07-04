const sections = [
  { id: 'palvelut', label: 'Palvelut' },
  { id: 'yritysasiakkaat', label: 'Yritysasiakkaat' },
  { id: 'yksityismuutot', label: 'Yksityismuutot' },
  { id: 'referenssit', label: 'Referenssit' },
  { id: 'yhteys', label: 'Yhteys' },
];

function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#etusivu" aria-label="KukaKuskaa Oy etusivu">
          KukaKuskaa Oy
        </a>
        <nav className="site-nav" aria-label="Päävalikko">
          <a href="#etusivu">Etusivu</a>
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section id="etusivu" className="hero-section" aria-labelledby="home-title">
          <div className="section-inner">
            <p className="eyebrow">Virallinen verkkosivusto</p>
            <h1 id="home-title">KukaKuskaa Oy</h1>
            <p className="placeholder-copy">
              Sivuston varsinainen sisältö lisätään myöhemmin hyväksyttyjen
              tekstien ja materiaalien pohjalta.
            </p>
          </div>
        </section>

        <div className="content-sections">
          {sections.map((section) => (
            <section
              className="content-section"
              id={section.id}
              key={section.id}
              aria-labelledby={`${section.id}-title`}
            >
              <div className="section-inner">
                <p className="section-kicker">Sisältöpaikka</p>
                <h2 id={`${section.id}-title`}>{section.label}</h2>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;

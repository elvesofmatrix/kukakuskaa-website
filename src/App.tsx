import { FormEvent, useEffect, useMemo, useState } from 'react';

type Locale = 'fi' | 'en';

type NavItem = {
  id: string;
  label: string;
};

type Service = {
  title: string;
  eyebrow: string;
  situation: string;
  responsibility: string;
  outcome: string;
  cta: string;
  image: ImageAsset;
};

type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
};

type LogoAsset = {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
};

type SiteCopy = {
  htmlLang: string;
  title: string;
  description: string;
  path: string;
  otherPath: string;
  navLabel: string;
  menuOpen: string;
  menuClose: string;
  nav: NavItem[];
  headerCta: string;
  hero: {
    eyebrow: string;
    title: string;
    copy: string;
    primaryCta: string;
    secondaryCta: string;
  };
  logosHeading: string;
  positioning: string[];
  services: {
    kicker: string;
    heading: string;
    intro: string;
    items: Service[];
  };
  visibility: {
    kicker: string;
    heading: string;
    copy: string;
    points: string[];
    note: string;
  };
  process: {
    kicker: string;
    heading: string;
    intro: string;
    steps: string[];
  };
  trust: {
    kicker: string;
    heading: string;
    copy: string;
    points: string[];
  };
  contact: {
    kicker: string;
    heading: string;
    copy: string;
    fields: {
      name: string;
      company: string;
      phone: string;
      email: string;
      type: string;
      description: string;
      submit: string;
    };
    projectTypes: string[];
    validation: {
      required: string;
      email: string;
      inactive: string;
    };
  };
  footer: {
    language: string;
    copyright: string;
  };
};

const routes: Record<Locale, string> = {
  fi: '/',
  en: '/en',
};

const nav: Record<Locale, NavItem[]> = {
  fi: [
    { id: 'services', label: 'Palvelut' },
    { id: 'visibility', label: 'Projektin näkyvyys' },
    { id: 'process', label: 'Näin etenemme' },
    { id: 'contact', label: 'Yhteys' },
  ],
  en: [
    { id: 'services', label: 'Services' },
    { id: 'visibility', label: 'Project visibility' },
    { id: 'process', label: 'How we work' },
    { id: 'contact', label: 'Contact' },
  ],
};

const images = {
  hero: {
    src: '/assets/images/a_wide_high_resolution_architectural_interior_sce.webp',
    width: 1672,
    height: 941,
    alt: {
      fi: 'Rauhallinen pohjoismainen toimitila, jossa vaativa kalusteprojekti on viimeistelyvaiheessa.',
      en: 'Calm Nordic commercial interior where a demanding furniture project is being completed.',
    },
  },
  business: {
    src: '/assets/images/service-business-relocation.webp',
    width: 1447,
    height: 1087,
    alt: {
      fi: 'Suojattua toimistokalustetta kannetaan huolellisesti työympäristöprojektissa.',
      en: 'Protected office furniture being carried carefully during a workplace project.',
    },
  },
  furniture: {
    src: '/assets/images/service-furniture-logistics.webp',
    width: 1536,
    height: 1024,
    alt: {
      fi: 'Kalustetoimituksen tavarat odottavat hallitusti toimistokäytävällä.',
      en: 'Furniture delivery items staged carefully in an office corridor.',
    },
  },
  home: {
    src: '/assets/images/service-premium-home-relocation.webp',
    width: 1535,
    height: 1024,
    alt: {
      fi: 'Laadukas koti, jossa suojatut kalusteet ja harkittu työskentely tukevat premium-muuttoa.',
      en: 'High-quality home with protected furniture and careful work supporting a premium relocation.',
    },
  },
  clearance: {
    src: '/assets/images/service-estate-clearance.webp',
    width: 1536,
    height: 1024,
    alt: {
      fi: 'Kodin tyhjennysprojekti etenee rauhallisesti ja järjestelmällisesti.',
      en: 'Home clearance project progressing calmly and systematically.',
    },
  },
  visibility: {
    src: '/assets/images/project-visibility.webp',
    width: 1672,
    height: 941,
    alt: {
      fi: 'Projektivastaava tarkistaa etenemisnäkymää kalustetoimituksen yhteydessä.',
      en: 'Project lead reviewing progress visibility during a furniture delivery.',
    },
  },
  process: {
    src: '/assets/images/process-planning.webp',
    width: 1536,
    height: 1024,
    alt: {
      fi: 'Työryhmä käy läpi suunnitelmaa ennen vaativan projektin toteutusta.',
      en: 'Team reviewing a plan before delivering a demanding practical project.',
    },
  },
  trust: {
    src: '/assets/images/service-office-installation.webp',
    width: 1536,
    height: 1024,
    alt: {
      fi: 'Kalusteasennus tehdään suojatussa työympäristössä rauhallisesti ja tarkasti.',
      en: 'Furniture installation handled carefully in a protected workplace environment.',
    },
  },
  contact: {
    src: '/assets/images/contact-project-discussion.webp',
    width: 1536,
    height: 1024,
    alt: {
      fi: 'Projektista keskustellaan suunnitelman ja muistiinpanojen äärellä.',
      en: 'Project discussion around a plan and notes.',
    },
  },
} satisfies Record<string, ImageAsset>;

const clientLogos: LogoAsset[] = [
  {
    src: '/assets/logos/Kartanon_Mittakaluste_Logo-1024x276.png',
    width: 334,
    height: 90,
    alt: {
      fi: 'Kartanon Mittakaluste -logo.',
      en: 'Kartanon Mittakaluste logo.',
    },
  },
  {
    src: '/assets/logos/RT%20kaluste.png',
    width: 400,
    height: 122,
    alt: {
      fi: 'RT-Kaluste-logo.',
      en: 'RT-Kaluste logo.',
    },
  },
  {
    src: '/assets/logos/images.png',
    width: 224,
    height: 90,
    alt: {
      fi: 'Hempan Kaluste -logo.',
      en: 'Hempan Kaluste logo.',
    },
  },
  {
    src: '/assets/logos/kimi%20logot%20sivuille.png',
    width: 310,
    height: 90,
    alt: {
      fi: 'Savon Kuljetus -logo.',
      en: 'Savon Kuljetus logo.',
    },
  },
];

const copy: Record<Locale, SiteCopy> = {
  fi: {
    htmlLang: 'fi',
    title:
      'KukaKuskaa – Projektipohjainen kalustelogistiikka, yritysmuutot ja vaativat tyhjennysprojektit kautta Suomen',
    description:
      'KukaKuskaa Oy on rauhallinen, vastuullinen kumppani vaativiin yritysmuuttoihin, kalustetoimituksiin, premium-kotimuuttoihin ja kuolinpesän tyhjennykseen. Yksi projekti, yksi vastuunkantaja, selkeä näkyvyys etenemiseen.',
    path: routes.fi,
    otherPath: routes.en,
    navLabel: 'Päävalikko',
    menuOpen: 'Avaa valikko',
    menuClose: 'Sulje valikko',
    nav: nav.fi,
    headerCta: 'Keskustellaan projektistasi',
    hero: {
      eyebrow: 'Projektipohjainen kumppani kautta Suomen',
      title: 'Kokonaisuuksia, joita ei voi jättää puoliksi tehtäviksi.',
      copy:
        'KukaKuskaa Oy on rauhallinen, käytännönläheinen kumppani silloin, kun tavaravirta, kalusteet, muutto tai tyhjennys muodostavat vaativan kokonaisuuden. Toteutamme yritysmuuttoja, työympäristöprojekteja, kalustetoimituksia, premium-kotimuuttoja ja vaativia koti- ja kuolinpesätyhjennyksiä projektina – yhdellä vastuullisella kumppanilla, selkeällä etenemisellä.',
      primaryCta: 'Keskustellaan projektistasi',
      secondaryCta: 'Tutustu palveluihin',
    },
    logosHeading: 'Meitä suosittelevat',
    positioning: [
      'Projektipohjainen kumppani vaativiin käytännön toimituksiin.',
      'Juuret Kuopiossa, mutta toteutamme projekteja kautta Suomen.',
      'Teemme tavaravirran ja työn etenemisen näkyväksi projektikohtaisesti.',
    ],
    services: {
      kicker: 'Palvelut',
      heading: 'Vaativat käytännön kokonaisuudet yhdellä vastuunkantajalla',
      intro:
        'Kun projektissa yhdistyvät aikataulu, tavara, tila ja vastuu, KukaKuskaa kokoaa käytännön työn hallituksi kokonaisuudeksi.',
      items: [
        {
          title: 'Yritysmuutot ja työympäristöprojektit',
          eyebrow: 'Toimitilat ja työympäristöt',
          situation:
            'Yritysmuutossa tai työympäristömuutoksessa arki ei saa pysähtyä tavaravirran, kalusteiden ja tilojen koordinointiin.',
          responsibility:
            'KukaKuskaa huolehtii sisäänkannosta, sijoittelusta, vaiheistuksesta ja käytännön etenemisestä sovitun suunnitelman mukaan.',
          outcome:
            'Tavoitteena on selkeästi valmis tila ja rauhallinen siirtymä, jossa vastuu ei hajoa usealle tekijälle.',
          cta: 'Kerro yritysprojektista',
          image: images.business,
        },
        {
          title: 'Kalustetoimitukset ja asennustuki',
          eyebrow: 'Kalusteet ja toimitukset',
          situation:
            'Kalustetoimitus vaatii usein enemmän kuin kuljetuksen ovelle: vastaanoton, suojauksen, kantamisen, purun, asennustuen ja viimeistelyn.',
          responsibility:
            'Toimimme käytännön kenttäkumppanina toimittajille, projektipäälliköille ja asiakkaille, jotka tarvitsevat hallittua toteutusta paikan päällä.',
          outcome:
            'Kalusteet päätyvät oikeaan paikkaan, oikeassa järjestyksessä ja projektin kokonaisuutta tukien.',
          cta: 'Suunnitellaan kalustetoimitus',
          image: images.furniture,
        },
        {
          title: 'Hallittu premium-kotimuutto',
          eyebrow: 'Koti ja arvokkaat tavarat',
          situation:
            'Kun kodissa on paljon suojattavaa, arvokkaita esineitä tai useita sovitettavia vaiheita, tuntiperusteinen muutto ei ole oikea lähtökohta.',
          responsibility:
            'KukaKuskaa suunnittelee ja toteuttaa muuton kokonaisuutena, jossa valmistelu, suojaus, kuljetus ja loppuun saattaminen kulkevat yhdessä.',
          outcome:
            'Asiakas saa rauhallisen, huolellisen ja läpinäkyvän muuttoprojektin ilman tarvetta koordinoida kaikkea itse.',
          cta: 'Keskustellaan kotimuutosta',
          image: images.home,
        },
        {
          title: 'Vaativat koti- ja kuolinpesätyhjennykset',
          eyebrow: 'Tyhjennykset ja loppuunsaattaminen',
          situation:
            'Kodin tai kuolinpesän tyhjennys voi olla sekä käytännössä monimutkainen että henkilökohtaisesti kuormittava tilanne.',
          responsibility:
            'KukaKuskaa voi hoitaa lajittelua, pakkaamista, kuljetuksia, kierrätystä ja loppuunsaattamista tilanteen vaatimalla hienovaraisuudella.',
          outcome:
            'Lopputuloksena on selkeä tila, järjestelmällinen eteneminen ja dokumentoitu valmistuminen silloin, kun se projektiin sopii.',
          cta: 'Sovi arvio tyhjennysprojektista',
          image: images.clearance,
        },
      ],
    },
    visibility: {
      kicker: 'Projektin näkyvyys',
      heading: 'Projektin eteneminen ei jää arvailun varaan',
      copy:
        'Vaativassa käytännön projektissa asiakkaan pitää ymmärtää, missä mennään. KukaKuskaa voi tehdä tavaravirran, työvaiheet ja valmistumisen näkyväksi projektikohtaisella raportoinnilla ja selkeällä yhteydenpidolla.',
      points: [
        'Projektikohtainen näkyvyys työn etenemiseen.',
        'Dokumentoituja vaiheita, havaintoja ja valmistumista tilanteen mukaan.',
        'Parempi yhteinen tilannekuva asiakkaalle, toimittajalle ja kenttätiimille.',
      ],
      note:
        'Emme lupaa automaattista reaaliaikaista seurantaa jokaiseen projektiin. Näkyvyys määritellään aina projektin tarpeen ja sovitun toimintamallin mukaan.',
    },
    process: {
      kicker: 'Näin etenemme',
      heading: 'Näin etenemme projektisi kanssa',
      intro:
        'Hyvä toteutus alkaa rauhallisesta kartoituksesta ja päättyy siihen, että kokonaisuus on käytännössä valmis.',
      steps: [
        'Keskustelu ja kartoitus',
        'Suunnitelma',
        'Valmistelut',
        'Toteutus',
        'Luovutus ja raportointi',
      ],
    },
    trust: {
      kicker: 'Luottamus',
      heading: 'Luottamus syntyy tavasta tehdä',
      copy:
        'Vaativissa tiloissa, arvokkaiden tavaroiden äärellä ja henkilökohtaisissa tilanteissa ratkaisee työn tapa. KukaKuskaa korostaa suojausta, rauhallista toteutusta, huolellista käsittelyä ja selkeää viestintää.',
      points: [
        'Asiakkaan tiloja ja omaisuutta kunnioittava työskentely.',
        'Huolellinen suojaus, kantaminen ja sijoittelu.',
        'Selkeä yhteydenpito ja tarvittaessa dokumentoitu valmistuminen.',
      ],
    },
    contact: {
      kicker: 'Yhteys',
      heading: 'Keskustellaan projektistasi',
      copy:
        'Paras tapa aloittaa on lyhyt keskustelu projektisi laajuudesta, aikataulusta ja siitä, mistä käytännön kokonaisuudesta haluat KukaKuskaa’n ottavan vastuun.',
      fields: {
        name: 'Nimi',
        company: 'Yritys / organisaatio',
        phone: 'Puhelin',
        email: 'Sähköposti',
        type: 'Projektin tyyppi',
        description: 'Lyhyt kuvaus projektista',
        submit: 'Tarkista lomake',
      },
      projectTypes: [
        'Yritysmuutto',
        'Kalustetoimitus',
        'Kotimuutto',
        'Tyhjennysprojekti',
        'Muu vaativa kokonaisuus',
      ],
      validation: {
        required: 'Täytä tämä kenttä.',
        email: 'Anna toimiva sähköpostiosoite.',
        inactive:
          'Lomakkeen lähetys ei ole vielä käytössä. Ota yhteyttä puhelimitse tai sähköpostilla.',
      },
    },
    footer: {
      language: 'Kieli',
      copyright: 'Kaikki oikeudet pidätetään.',
    },
  },
  en: {
    htmlLang: 'en',
    title:
      'KukaKuskaa – Project-based furniture delivery, commercial relocation and demanding estate clearance in Finland',
    description:
      'KukaKuskaa is a calm, accountable partner for complex furniture logistics, office transitions, premium home moves and demanding estate clearance projects across Finland. One project, one responsible partner, visible progress.',
    path: routes.en,
    otherPath: routes.fi,
    navLabel: 'Main navigation',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    nav: nav.en,
    headerCta: 'Discuss your project',
    hero: {
      eyebrow: 'Project-based partner across Finland',
      title: 'Projects too important to leave half-finished.',
      copy:
        'KukaKuskaa is a calm, practical partner when goods flow, furnishings, relocation or clearance turn into a demanding project. We handle business relocations, workplace transitions, furniture delivery, premium home moves and demanding estate and home clearance as projects – with one responsible partner and clear progress.',
      primaryCta: 'Discuss your project',
      secondaryCta: 'Explore services',
    },
    logosHeading: 'Trusted by our clients',
    positioning: [
      'Project-based partner for demanding practical deliveries.',
      'Rooted in Kuopio, delivering projects across Finland.',
      'Making goods flow and progress visible for each project.',
    ],
    services: {
      kicker: 'Services',
      heading: 'Demanding practical work with one accountable partner',
      intro:
        'When schedule, goods, space and responsibility meet, KukaKuskaa turns practical work into a controlled project.',
      items: [
        {
          title: 'Business relocations and workplace projects',
          eyebrow: 'Workplaces and commercial spaces',
          situation:
            'In a business relocation or workplace transition, daily operations should not get stuck in fragmented goods flow, furniture and space coordination.',
          responsibility:
            'KukaKuskaa manages carry-in, placement, staging and practical progress according to the agreed plan.',
          outcome:
            'The goal is a clearly completed space and a calm transition where responsibility does not split across several suppliers.',
          cta: 'Tell us about the business project',
          image: images.business,
        },
        {
          title: 'Furniture delivery and installation support',
          eyebrow: 'Furnishings and delivery',
          situation:
            'A furniture delivery often requires more than transport to the door: receiving, protection, carrying, unpacking, installation support and finishing.',
          responsibility:
            'We act as a practical field partner for suppliers, project managers and customers who need controlled on-site delivery.',
          outcome:
            'Furniture reaches the right place, in the right order and in a way that supports the whole project.',
          cta: 'Plan a furniture delivery',
          image: images.furniture,
        },
        {
          title: 'Managed premium home relocation',
          eyebrow: 'Homes and valuable belongings',
          situation:
            'When a home includes valuable items, sensitive spaces or several moving parts, an hourly moving crew is not the right starting point.',
          responsibility:
            'KukaKuskaa plans and delivers the move as a whole, connecting preparation, protection, transport and completion.',
          outcome:
            'The customer gets a calm, careful and visible relocation project without having to coordinate everything alone.',
          cta: 'Discuss a home relocation',
          image: images.home,
        },
        {
          title: 'Demanding estate and home clearance',
          eyebrow: 'Clearance and completion',
          situation:
            'Clearing a home or estate can be both practically complex and personally sensitive.',
          responsibility:
            'KukaKuskaa can handle sorting, packing, transport, recycling and completion with the discretion the situation requires.',
          outcome:
            'The result is a clear space, structured progress and documented completion where appropriate.',
          cta: 'Arrange a clearance assessment',
          image: images.clearance,
        },
      ],
    },
    visibility: {
      kicker: 'Project visibility',
      heading: 'Project delivery that stays visible',
      copy:
        'In demanding practical work, the customer needs to understand what is happening. KukaKuskaa can make goods flow, work stages and completion visible through project-specific reporting and clear communication.',
      points: [
        'Project-specific visibility into practical progress.',
        'Documented stages, observations and completion where the project calls for it.',
        'A clearer shared situation picture for the customer, supplier and field team.',
      ],
      note:
        'We do not promise automated real-time tracking for every project. Visibility is defined according to the project need and agreed operating model.',
    },
    process: {
      kicker: 'How we work',
      heading: 'How we work with your project',
      intro:
        'Good delivery starts with a calm assessment and ends when the practical whole is complete.',
      steps: [
        'Discussion and assessment',
        'Plan',
        'Preparation',
        'Delivery',
        'Handover and reporting',
      ],
    },
    trust: {
      kicker: 'Trust',
      heading: 'Trust through the way we work',
      copy:
        'In demanding spaces, around valuable goods and in sensitive situations, the way the work is done matters. KukaKuskaa emphasizes protection, calm execution, careful handling and clear communication.',
      points: [
        'Respectful work in customer spaces and around customer property.',
        'Careful protection, carrying and placement.',
        'Clear communication and documented completion where appropriate.',
      ],
    },
    contact: {
      kicker: 'Contact',
      heading: 'Let’s talk about your project',
      copy:
        'The best way to begin is a short conversation about your project: its scope, timing and which practical tasks you want KukaKuskaa to take responsibility for.',
      fields: {
        name: 'Name',
        company: 'Company / organisation',
        phone: 'Phone',
        email: 'Email',
        type: 'Type of project',
        description: 'Brief project description',
        submit: 'Check form',
      },
      projectTypes: [
        'Business relocation',
        'Furniture delivery',
        'Home relocation',
        'Clearance project',
        'Other demanding project',
      ],
      validation: {
        required: 'Fill in this field.',
        email: 'Enter a valid email address.',
        inactive:
          'Form submission is not active yet. Please contact us by phone or email.',
      },
    },
    footer: {
      language: 'Language',
      copyright: 'All rights reserved.',
    },
  },
};

function getLocaleFromPath(): Locale {
  return window.location.pathname.startsWith('/en') ? 'en' : 'fi';
}

function buildUrl(path: string): string {
  return `https://www.kukakuskaa.com${path === '/' ? '/' : path}`;
}

function App() {
  const [locale, setLocale] = useState<Locale>(() => getLocaleFromPath());
  const [menuOpen, setMenuOpen] = useState(false);
  const content = copy[locale];
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const onPopState = () => setLocale(getLocaleFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = content.htmlLang;
    document.title = content.title;

    const description = ensureMeta('description');
    description.setAttribute('content', content.description);

    ensureLink('canonical').setAttribute('href', buildUrl(content.path));
    ensureAlternate('fi').setAttribute('href', buildUrl(routes.fi));
    ensureAlternate('en').setAttribute('href', buildUrl(routes.en));
    ensureAlternate('x-default').setAttribute('href', buildUrl(routes.fi));

    const schema = ensureSchema();
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': ['Organization', 'LocalBusiness'],
      name: 'KukaKuskaa Oy',
      url: 'https://www.kukakuskaa.com/',
      telephone: '+358440335538',
      email: 'kimi.kuosmanen@kukakuskaa.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Eteläniementie 21',
        postalCode: '71750',
        addressLocality: 'Maaninka',
        addressCountry: 'FI',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Finland',
      },
    });
  }, [content]);

  const alternateHref = useMemo(() => {
    const hash = window.location.hash || '';
    return `${content.otherPath}${hash}`;
  }, [content.otherPath]);

  function switchLanguage(nextLocale: Locale) {
    const targetPath = routes[nextLocale];
    const hash = window.location.hash;
    window.history.pushState({}, '', `${targetPath}${hash}`);
    setLocale(nextLocale);
    setMenuOpen(false);
  }

  return (
    <div className="site-shell">
      <Header
        content={content}
        locale={locale}
        menuOpen={menuOpen}
        alternateHref={alternateHref}
        onMenuToggle={() => setMenuOpen((open) => !open)}
        onNavigate={() => setMenuOpen(false)}
        onLanguageChange={switchLanguage}
      />

      <main>
        <Hero content={content} />
        <ClientLogoStrip content={content} />
        <PositioningStrip points={content.positioning} />
        <Services content={content} locale={locale} />
        <ProjectVisibility content={content} locale={locale} />
        <ProcessSection content={content} locale={locale} />
        <TrustSection content={content} locale={locale} />
        <ContactSection content={content} locale={locale} />
      </main>

      <Footer
        content={content}
        locale={locale}
        currentYear={currentYear}
        onLanguageChange={switchLanguage}
      />
    </div>
  );
}

function Header({
  content,
  locale,
  menuOpen,
  alternateHref,
  onMenuToggle,
  onNavigate,
  onLanguageChange,
}: {
  content: SiteCopy;
  locale: Locale;
  menuOpen: boolean;
  alternateHref: string;
  onMenuToggle: () => void;
  onNavigate: () => void;
  onLanguageChange: (locale: Locale) => void;
}) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={onNavigate} aria-label="KukaKuskaa Oy">
        <img
          src="/assets/brand/kukakuskaa-logo-white.png"
          width={2078}
          height={269}
          alt="KukaKuskaa Oy"
        />
      </a>

      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? content.menuClose : content.menuOpen}
        aria-controls="site-navigation"
        aria-expanded={menuOpen}
        onClick={onMenuToggle}
      >
        <span />
        <span />
      </button>

      <div className={`header-panel${menuOpen ? ' is-open' : ''}`} id="site-navigation">
        <nav className="site-nav" aria-label={content.navLabel}>
          {content.nav.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={onNavigate}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <div className="language-switcher" aria-label="Language">
            <button
              type="button"
              className={locale === 'fi' ? 'is-active' : ''}
              aria-current={locale === 'fi' ? 'true' : undefined}
              onClick={() => onLanguageChange('fi')}
            >
              FI
            </button>
            <a
              href={alternateHref}
              className={locale === 'en' ? 'is-active' : ''}
              aria-current={locale === 'en' ? 'true' : undefined}
              onClick={(event) => {
                event.preventDefault();
                onLanguageChange('en');
              }}
            >
              EN
            </a>
          </div>
          <a className="header-cta" href="#contact" onClick={onNavigate}>
            {content.headerCta}
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero({ content }: { content: SiteCopy }) {
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <img
        className="hero-image"
        src={images.hero.src}
        width={images.hero.width}
        height={images.hero.height}
        alt={images.hero.alt[content.htmlLang as Locale]}
        fetchPriority="high"
      />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow">{content.hero.eyebrow}</p>
        <h1 id="hero-title">{content.hero.title}</h1>
        <p>{content.hero.copy}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#contact">
            {content.hero.primaryCta}
          </a>
          <a className="button button-secondary" href="#services">
            {content.hero.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

function ClientLogoStrip({ content }: { content: SiteCopy }) {
  const sequence = [...clientLogos, ...clientLogos];
  return (
    <section className="logo-strip" aria-labelledby="logo-strip-title">
      <div className="logo-strip-inner">
        <h2 id="logo-strip-title">{content.logosHeading}</h2>
        <div className="logo-marquee" tabIndex={0}>
          <div className="logo-track">
            {sequence.map((logo, index) => (
              <img
                key={`${logo.src}-${index}`}
                src={logo.src}
                width={logo.width}
                height={logo.height}
                alt={index < clientLogos.length ? logo.alt[content.htmlLang as Locale] : ''}
                aria-hidden={index >= clientLogos.length ? 'true' : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PositioningStrip({ points }: { points: string[] }) {
  return (
    <section className="positioning-strip" aria-label="Positioning">
      <div className="positioning-grid">
        {points.map((point, index) => (
          <p key={point}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {point}
          </p>
        ))}
      </div>
    </section>
  );
}

function Services({ content, locale }: { content: SiteCopy; locale: Locale }) {
  return (
    <section className="services-section section-pad" id="services" aria-labelledby="services-title">
      <div className="section-heading">
        <p className="eyebrow">{content.services.kicker}</p>
        <h2 id="services-title">{content.services.heading}</h2>
        <p>{content.services.intro}</p>
      </div>

      <div className="service-list">
        {content.services.items.map((service, index) => (
          <article className="service-row" key={service.title}>
            <div className="service-media">
              <img
                src={service.image.src}
                width={service.image.width}
                height={service.image.height}
                alt={service.image.alt[locale]}
                loading="lazy"
              />
            </div>
            <div className="service-copy">
              <p className="service-number">{String(index + 1).padStart(2, '0')}</p>
              <p className="eyebrow">{service.eyebrow}</p>
              <h3>{service.title}</h3>
              <dl>
                <div>
                  <dt>{locale === 'fi' ? 'Tilanne' : 'Situation'}</dt>
                  <dd>{service.situation}</dd>
                </div>
                <div>
                  <dt>{locale === 'fi' ? 'Vastuu' : 'Responsibility'}</dt>
                  <dd>{service.responsibility}</dd>
                </div>
                <div>
                  <dt>{locale === 'fi' ? 'Lopputulos' : 'Outcome'}</dt>
                  <dd>{service.outcome}</dd>
                </div>
              </dl>
              <a className="text-link" href="#contact">
                {service.cta}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectVisibility({ content, locale }: { content: SiteCopy; locale: Locale }) {
  return (
    <section className="visibility-section section-pad" id="visibility" aria-labelledby="visibility-title">
      <div className="split-layout">
        <div>
          <p className="eyebrow">{content.visibility.kicker}</p>
          <h2 id="visibility-title">{content.visibility.heading}</h2>
          <p className="lead">{content.visibility.copy}</p>
          <ul className="refined-list">
            {content.visibility.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="careful-note">{content.visibility.note}</p>
        </div>
        <img
          className="section-image"
          src={images.visibility.src}
          width={images.visibility.width}
          height={images.visibility.height}
          alt={images.visibility.alt[locale]}
          loading="lazy"
        />
      </div>
    </section>
  );
}

function ProcessSection({ content, locale }: { content: SiteCopy; locale: Locale }) {
  return (
    <section className="process-section section-pad" id="process" aria-labelledby="process-title">
      <div className="split-layout reverse">
        <img
          className="section-image"
          src={images.process.src}
          width={images.process.width}
          height={images.process.height}
          alt={images.process.alt[locale]}
          loading="lazy"
        />
        <div>
          <p className="eyebrow">{content.process.kicker}</p>
          <h2 id="process-title">{content.process.heading}</h2>
          <p className="lead">{content.process.intro}</p>
          <ol className="process-list">
            {content.process.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TrustSection({ content, locale }: { content: SiteCopy; locale: Locale }) {
  return (
    <section className="trust-section section-pad" aria-labelledby="trust-title">
      <div className="trust-panel">
        <div>
          <p className="eyebrow">{content.trust.kicker}</p>
          <h2 id="trust-title">{content.trust.heading}</h2>
          <p className="lead">{content.trust.copy}</p>
          <ul className="refined-list">
            {content.trust.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <img
          src={images.trust.src}
          width={images.trust.width}
          height={images.trust.height}
          alt={images.trust.alt[locale]}
          loading="lazy"
        />
      </div>
    </section>
  );
}

function ContactSection({ content, locale }: { content: SiteCopy; locale: Locale }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');

  function validate(form: HTMLFormElement) {
    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};

    for (const field of ['name', 'email', 'projectType', 'description']) {
      if (!String(data.get(field) || '').trim()) {
        nextErrors[field] = content.contact.validation.required;
      }
    }

    const email = String(data.get('email') || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = content.contact.validation.email;
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(event.currentTarget);
    setErrors(nextErrors);
    setNotice(Object.keys(nextErrors).length === 0 ? content.contact.validation.inactive : '');
    // Future submission handling will connect here when the approved form endpoint exists.
  }

  return (
    <section className="contact-section section-pad" id="contact" aria-labelledby="contact-title">
      <div className="contact-layout">
        <div className="contact-copy">
          <p className="eyebrow">{content.contact.kicker}</p>
          <h2 id="contact-title">{content.contact.heading}</h2>
          <p className="lead">{content.contact.copy}</p>
          <address>
            <strong>Kimi Kuosmanen</strong>
            <span>KukaKuskaa Oy</span>
            <a href="tel:+358440335538">044 0335 538</a>
            <a href="mailto:kimi.kuosmanen@kukakuskaa.com">kimi.kuosmanen@kukakuskaa.com</a>
            <span>www.kukakuskaa.com</span>
            <span>Eteläniementie 21, 71750 Maaninka</span>
          </address>
          <img
            src={images.contact.src}
            width={images.contact.width}
            height={images.contact.height}
            alt={images.contact.alt[locale]}
            loading="lazy"
          />
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <FormField label={content.contact.fields.name} name="name" error={errors.name} required />
          <FormField label={content.contact.fields.company} name="company" />
          <FormField label={content.contact.fields.phone} name="phone" type="tel" />
          <FormField label={content.contact.fields.email} name="email" type="email" error={errors.email} required />
          <label>
            <span>{content.contact.fields.type}</span>
            <select name="projectType" required aria-invalid={errors.projectType ? 'true' : undefined}>
              <option value="">{locale === 'fi' ? 'Valitse' : 'Choose'}</option>
              {content.contact.projectTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            {errors.projectType ? <small>{errors.projectType}</small> : null}
          </label>
          <label className="span-2">
            <span>{content.contact.fields.description}</span>
            <textarea
              name="description"
              rows={5}
              required
              aria-invalid={errors.description ? 'true' : undefined}
            />
            {errors.description ? <small>{errors.description}</small> : null}
          </label>
          <button className="button button-primary span-2" type="submit">
            {content.contact.fields.submit}
          </button>
          {notice ? (
            <p className="form-notice" role="status">
              {notice}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function FormField({
  label,
  name,
  type = 'text',
  error,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span>{label}</span>
      <input name={name} type={type} required={required} aria-invalid={error ? 'true' : undefined} />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function Footer({
  content,
  locale,
  currentYear,
  onLanguageChange,
}: {
  content: SiteCopy;
  locale: Locale;
  currentYear: number;
  onLanguageChange: (locale: Locale) => void;
}) {
  return (
    <footer className="site-footer">
      <div>
        <strong>KukaKuskaa Oy</strong>
        <p>Eteläniementie 21, 71750 Maaninka</p>
      </div>
      <nav aria-label={content.navLabel}>
        {content.nav.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="footer-meta">
        <span>
          © {currentYear} KukaKuskaa Oy. {content.footer.copyright}
        </span>
        <span>{content.footer.language}</span>
        <button type="button" onClick={() => onLanguageChange('fi')} aria-current={locale === 'fi' ? 'true' : undefined}>
          FI
        </button>
        <button type="button" onClick={() => onLanguageChange('en')} aria-current={locale === 'en' ? 'true' : undefined}>
          EN
        </button>
      </div>
    </footer>
  );
}

function ensureMeta(name: string): HTMLMetaElement {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.append(element);
  }
  return element;
}

function ensureLink(rel: string): HTMLLinkElement {
  let element = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]:not([hreflang])`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.append(element);
  }
  return element;
}

function ensureAlternate(hreflang: string): HTMLLinkElement {
  let element = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hreflang}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = 'alternate';
    element.hreflang = hreflang;
    document.head.append(element);
  }
  return element;
}

function ensureSchema(): HTMLScriptElement {
  let element = document.querySelector<HTMLScriptElement>('script[data-schema="organization"]');
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.dataset.schema = 'organization';
    document.head.append(element);
  }
  return element;
}

export default App;

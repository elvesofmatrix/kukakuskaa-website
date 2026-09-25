import { FocusEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  type AnalyticsConsentChoice,
  getStoredConsentChoice,
  initializeAnalytics,
  persistConsentChoice,
  trackEvent,
  trackPageView,
  updateAnalyticsConsent,
} from './analytics';

type Locale = 'fi' | 'en';
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';
type PageKey = 'home' | 'dataCenter';
type CoreProjectTypeKey = 'business' | 'furniture' | 'home' | 'clearance' | 'other';
type ProjectTypeKey = CoreProjectTypeKey | 'dataCenter';
type FilmPlayControl = 'descriptive' | 'center';

type NavItem = {
  id: string;
  label: string;
  path?: string;
};

type Service = {
  title: string;
  eyebrow: string;
  situation: string;
  responsibility: string;
  outcome: string;
  cta: string;
  contactIntent?: ProjectTypeKey;
  image: ImageAsset;
};

type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
  srcSet?: string;
  sizes?: string;
  objectPosition?: string;
};

type LogoAsset = {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
};

type ContactProjectTypes = Record<CoreProjectTypeKey, string> & Partial<Record<ProjectTypeKey, string>>;

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
  projectFilm: {
    eyebrow: string;
    heading: string;
    copy: string;
    playLabel: string;
    duration: string;
    ariaLabel: string;
    centerAriaLabel: string;
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
      phone: string;
      email: string;
      type: string;
      description: string;
      submit: string;
    };
    projectTypes: ContactProjectTypes;
    validation: {
      required: string;
      email: string;
      submitting: string;
      success: string;
      error: string;
    };
  };
  footer: {
    language: string;
    copyright: string;
  };
  consent: {
    title: string;
    copy: string;
    necessary: string;
    acceptAll: string;
    settings: string;
  };
};

type ProjectFilmCopy = SiteCopy['projectFilm'];

const dataCenterRoute = '/en/data-center-logistics-finland/';
const englishHomeRoute = '/en/';

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
    { id: 'data-center-logistics', label: 'Data Center Logistics', path: dataCenterRoute },
    { id: 'visibility', label: 'Project visibility' },
    { id: 'process', label: 'How we work' },
    { id: 'contact', label: 'Contact' },
  ],
};

const images = {
  hero: {
    src: '/assets/images/hero-interior-desktop.avif',
    width: 1672,
    height: 941,
    srcSet:
      '/assets/images/hero-interior-mobile.avif 900w, /assets/images/hero-interior-tablet.avif 1280w, /assets/images/hero-interior-desktop.avif 1672w',
    sizes: '100vw',
    alt: {
      fi: 'Rauhallinen pohjoismainen toimitila, jossa vaativa kalusteprojekti on viimeistelyvaiheessa.',
      en: 'Calm Nordic commercial interior where a demanding furniture project is being completed.',
    },
  },
  business: {
    src: '/assets/images/business-relocation-care-bed-installation-desktop.avif',
    width: 1806,
    height: 872,
    srcSet:
      '/assets/images/business-relocation-care-bed-installation-mobile.avif 900w, /assets/images/business-relocation-care-bed-installation-tablet.avif 1200w, /assets/images/business-relocation-care-bed-installation-desktop.avif 1806w',
    sizes: '(max-width: 900px) calc(100vw - 32px), 650px',
    objectPosition: '58% 50%',
    alt: {
      fi: 'KukaKuskaa-asentajat asentamassa hoivasänkyä',
      en: 'KukaKuskaa installers assembling a care bed',
    },
  },
  furniture: {
    src: '/assets/images/service-furniture-logistics-desktop.avif',
    width: 1536,
    height: 1024,
    srcSet:
      '/assets/images/service-furniture-logistics-mobile.avif 900w, /assets/images/service-furniture-logistics-tablet.avif 1200w, /assets/images/service-furniture-logistics-desktop.avif 1536w',
    sizes: '(max-width: 900px) calc(100vw - 32px), 650px',
    alt: {
      fi: 'Kalustetoimituksen tavarat odottavat hallitusti toimistokäytävällä.',
      en: 'Furniture delivery items staged carefully in an office corridor.',
    },
  },
  home: {
    src: '/assets/images/service-premium-home-relocation-desktop.avif',
    width: 1535,
    height: 1024,
    srcSet:
      '/assets/images/service-premium-home-relocation-mobile.avif 900w, /assets/images/service-premium-home-relocation-tablet.avif 1200w, /assets/images/service-premium-home-relocation-desktop.avif 1535w',
    sizes: '(max-width: 900px) calc(100vw - 32px), 650px',
    alt: {
      fi: 'Laadukas koti, jossa suojatut kalusteet ja harkittu työskentely tukevat premium-muuttoa.',
      en: 'High-quality home with protected furniture and careful work supporting a premium relocation.',
    },
  },
  clearance: {
    src: '/assets/images/service-estate-clearance-desktop.avif',
    width: 1536,
    height: 1024,
    srcSet:
      '/assets/images/service-estate-clearance-mobile.avif 900w, /assets/images/service-estate-clearance-tablet.avif 1200w, /assets/images/service-estate-clearance-desktop.avif 1536w',
    sizes: '(max-width: 900px) calc(100vw - 32px), 650px',
    alt: {
      fi: 'Kodin tyhjennysprojekti etenee rauhallisesti ja järjestelmällisesti.',
      en: 'Home clearance project progressing calmly and systematically.',
    },
  },
  visibility: {
    src: '/assets/images/project-visibility-dashboard.webp',
    width: 1672,
    height: 941,
    alt: {
      fi: 'Asiakas seuraamassa KukaKuskaa PRO -projektin etenemistä',
      en: 'Customer following project progress with KukaKuskaa PRO',
    },
  },
  process: {
    src: '/assets/images/process-planning-desktop.avif',
    width: 1536,
    height: 1024,
    srcSet: '/assets/images/process-planning-mobile.avif 900w, /assets/images/process-planning-tablet.avif 1200w, /assets/images/process-planning-desktop.avif 1536w',
    sizes: '(max-width: 900px) calc(100vw - 32px), 650px',
    alt: {
      fi: 'Työryhmä käy läpi suunnitelmaa ennen vaativan projektin toteutusta.',
      en: 'Team reviewing a plan before delivering a demanding practical project.',
    },
  },
  trust: {
    src: '/assets/images/project-trust-office-fitout.webp',
    width: 1536,
    height: 1024,
    alt: {
      fi: 'KukaKuskaa PRO -tiimi toteuttamassa toimitusta asiakkaan toimitiloissa',
      en: 'KukaKuskaa PRO team carrying out a project delivery at a customer site',
    },
  },
  dataCenter: {
    src: '/assets/images/data-center-logistics-finland-desktop.avif',
    width: 800,
    height: 540,
    srcSet:
      '/assets/images/data-center-logistics-finland-mobile.avif 560w, /assets/images/data-center-logistics-finland-desktop.avif 800w',
    sizes: '(max-width: 900px) calc(100vw - 32px), 650px',
    alt: {
      fi: '',
      en: 'KukaKuskaa PRO crew handling protected data center equipment in a logistics staging area',
    },
  },
} satisfies Record<string, ImageAsset>;

const projectFilmMedia = {
  video: '/assets/video/kukakuskaa-pro-project-film.mp4',
  posterDesktop: '/assets/images/kukakuskaa-pro-video-poster-desktop.webp',
  posterMobile: '/assets/images/kukakuskaa-pro-video-poster-mobile.webp',
  desktopWidth: 1536,
  desktopHeight: 864,
  mobileWidth: 960,
  mobileHeight: 1200,
};

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
      eyebrow: 'PROJEKTITOIMITUKSET · KOKO SUOMI',
      title: 'Kokonaisuuksia, joita\nei voi jättää\npuoliksi tehtäviksi.',
      copy:
        'Kalustetoimitukset, yritysmuutot ja vaativat muuttoprojektit yhdeltä vastuulliselta kumppanilta.',
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
          contactIntent: 'business',
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
          contactIntent: 'furniture',
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
          contactIntent: 'home',
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
          contactIntent: 'clearance',
          image: images.clearance,
        },
      ],
    },
    visibility: {
      kicker: 'Projektin näkyvyys',
      heading: 'Projektitoimitus, joka pysyy näkyvänä',
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
      kicker: 'Toimintamallimme',
      heading: 'Näin viemme projektisi läpi',
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
    projectFilm: {
      eyebrow: 'PROJEKTITOIMITUS KÄYTÄNNÖSSÄ',
      heading: 'Katso, kuinka kokonaisuus syntyy.',
      copy: 'Suunnittelusta toimitukseen, asennukseen ja valmiiseen kohteeseen.',
      playLabel: 'Katso video',
      duration: '0:30',
      ariaLabel: 'Katso KukaKuskaa PRO -projektifilmi',
      centerAriaLabel: 'Toista KukaKuskaa PRO -projektifilmi',
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
        name: 'Nimi, yritys tai yhteisö',
        phone: 'Puhelin',
        email: 'Sähköposti',
        type: 'Projektin tyyppi',
        description: 'Lyhyt kuvaus projektista',
        submit: 'Lähetä viesti',
      },
      projectTypes: {
        business: 'Yritysprojekti',
        furniture: 'Kalustetoimitus',
        home: 'Kotimuutto',
        clearance: 'Tyhjennysprojekti',
        other: 'Muu vaativa kokonaisuus',
      },
      validation: {
        required: 'Täytä tämä kenttä.',
        email: 'Anna toimiva sähköpostiosoite.',
        submitting: 'Lähetetään viestiä...',
        success: 'Kiitos. Viesti on lähetetty, ja palaamme asiaan mahdollisimman pian.',
        error: 'Viestin lähetys ei onnistunut. Yritä hetken kuluttua uudelleen tai ota yhteyttä puhelimitse tai sähköpostilla.',
      },
    },
    footer: {
      language: 'Kieli',
      copyright: 'Kaikki oikeudet pidätetään.',
    },
    consent: {
      title: 'Evästeet',
      copy:
        'Käytämme välttämättömiä evästeitä sivuston toimintaan. Analytiikka auttaa ymmärtämään PRO-sivuston käyttöä ilman henkilötietojen lähettämistä.',
      necessary: 'Vain välttämättömät',
      acceptAll: 'Hyväksy kaikki',
      settings: 'Evästeasetukset',
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
      eyebrow: 'PROJECT DELIVERIES · FINLAND',
      title: 'Projects too important to leave half-finished.',
      copy:
        'Furniture deliveries, business relocations and demanding moving projects from one accountable partner.',
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
          contactIntent: 'business',
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
          contactIntent: 'furniture',
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
          contactIntent: 'home',
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
          contactIntent: 'clearance',
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
    projectFilm: {
      eyebrow: 'PROJECT DELIVERY IN PRACTICE',
      heading: 'See how a project comes together.',
      copy: 'From planning to delivery, installation and a finished site.',
      playLabel: 'Watch video',
      duration: '0:30',
      ariaLabel: 'Watch the KukaKuskaa PRO project film',
      centerAriaLabel: 'Play the KukaKuskaa PRO project film',
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
        name: 'Name, company or organisation',
        phone: 'Phone',
        email: 'Email',
        type: 'Type of project',
        description: 'Brief project description',
        submit: 'Send message',
      },
      projectTypes: {
        business: 'Business relocation',
        furniture: 'Furniture delivery',
        home: 'Home relocation',
        clearance: 'Clearance project',
        dataCenter: 'Data Center Logistics',
        other: 'Other demanding project',
      },
      validation: {
        required: 'Fill in this field.',
        email: 'Enter a valid email address.',
        submitting: 'Sending message...',
        success: 'Thank you. Your message has been sent, and we will get back to you as soon as possible.',
        error: 'The message could not be sent. Please try again shortly or contact us by phone or email.',
      },
    },
    footer: {
      language: 'Language',
      copyright: 'All rights reserved.',
    },
    consent: {
      title: 'Cookies',
      copy:
        'We use necessary cookies for the site to work. Analytics helps us understand how the PRO site is used without sending personal information.',
      necessary: 'Necessary only',
      acceptAll: 'Accept all',
      settings: 'Cookie settings',
    },
  },
};

const dataCenterPage = {
  path: dataCenterRoute,
  title: 'Data Center Logistics Finland | KukaKuskaa PRO',
  description:
    'Local logistics support for data center construction projects in Finland. Site logistics, staging, scheduled deliveries, material handling and equipment positioning.',
  eyebrow: 'DATA CENTER LOGISTICS · FINLAND',
  heading: 'Data Center Logistics in Finland',
  lead: 'Local logistics support for data center construction projects.',
  intro: [
    'KukaKuskaa PRO supports international contractors, equipment suppliers and project teams with local logistics execution in Finland.',
    'We coordinate the physical flow of equipment and materials from receiving and staging to scheduled site delivery, internal movement and final positioning.',
  ],
  highlights: [
    'Local execution for construction and fit-out logistics.',
    'Controlled material flow from arrival to designated location.',
    'Project visibility through practical coordination and reporting.',
  ],
  servicesHeading: 'Five practical logistics responsibilities',
  services: [
    {
      title: 'Site logistics',
      copy:
        'Physical logistics support during data center construction and fit-out, including incoming material coordination, site deliveries and movement between staging areas and work areas.',
    },
    {
      title: 'Receiving & staging',
      copy:
        'Receiving equipment and materials, arranging temporary staging or short-term buffer storage where applicable, and preparing material flows for scheduled delivery.',
    },
    {
      title: 'Scheduled & final-mile delivery',
      copy:
        'Delivery-window coordination, final-mile transport and sequencing so the correct equipment reaches the correct location at the agreed time.',
    },
    {
      title: 'Internal logistics & material handling',
      copy:
        'Internal movement on the project site, practical material handling and distribution toward designated work areas with attention to access and movement routes.',
    },
    {
      title: 'Equipment handling & positioning',
      copy:
        'Careful inside delivery, movement through the facility and physical positioning at the designated installation location, including packaging removal where applicable.',
    },
  ],
  partnerEyebrow: 'LOCAL EXECUTION PARTNER IN FINLAND',
  partnerHeading: 'Local hands on the ground in Finland',
  partnerCopy:
    'International projects need local execution. KukaKuskaa PRO provides people, transport and practical logistics coordination to move equipment from arrival to its designated location on site.',
  process: ['Receive', 'Stage', 'Schedule', 'Deliver', 'Position', 'Report'],
  clarificationHeading: 'Construction and fit-out logistics, not technical installation',
  clarification:
    'The focus is physical project logistics for equipment such as server racks, cabinets, electrical equipment, UPS equipment, switchgear, cooling equipment, packaged technical equipment and project materials. KukaKuskaa PRO does not claim electrical installation, MEP installation, server configuration, networking, commissioning or data center operations.',
  ctaHeading: 'Discuss your data center project',
  ctaCopy:
    'Tell us the project location, schedule, equipment volumes and required logistics scope.',
  ctaLabel: 'Discuss your data center project',
};

const dataCenterFilm: ProjectFilmCopy = {
  eyebrow: 'HOW WE WORK',
  heading: 'See how we deliver projects',
  copy:
    'Planning, logistics, installation support and project visibility — coordinated as one practical delivery.',
  playLabel: 'Watch video',
  duration: '0:30',
  ariaLabel: 'Watch the KukaKuskaa PRO project film',
  centerAriaLabel: 'Play the KukaKuskaa PRO project film',
};

const projectTypeOrder: ProjectTypeKey[] = ['business', 'furniture', 'home', 'clearance', 'dataCenter', 'other'];

function getLocaleFromPath(): Locale {
  return window.location.pathname.startsWith('/en') ? 'en' : 'fi';
}

function getPageFromPath(): PageKey {
  const normalizedPath = window.location.pathname.replace(/\/$/, '');
  return normalizedPath === dataCenterRoute.replace(/\/$/, '') ? 'dataCenter' : 'home';
}

function buildUrl(path: string): string {
  return `https://kukakuskaapro.com${path === '/' ? '/' : path}`;
}

function App() {
  const [locale, setLocale] = useState<Locale>(() => getLocaleFromPath());
  const [page, setPage] = useState<PageKey>(() => getPageFromPath());
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectTypeKey | ''>('');
  const [consentChoice, setConsentChoice] = useState<AnalyticsConsentChoice>(() => getStoredConsentChoice());
  const [consentPanelOpen, setConsentPanelOpen] = useState(() => getStoredConsentChoice() === null);
  const content = copy[locale];
  const isDataCenterPage = page === 'dataCenter';
  const pagePath = isDataCenterPage ? dataCenterPage.path : content.path;
  const pageTitle = isDataCenterPage ? dataCenterPage.title : content.title;
  const pageDescription = isDataCenterPage ? dataCenterPage.description : content.description;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    initializeAnalytics();
  }, []);

  useEffect(() => {
    updateAnalyticsConsent(consentChoice);
  }, [consentChoice]);

  useEffect(() => {
    trackPageView(pagePath, locale);
  }, [pagePath, locale, consentChoice]);

  useEffect(() => {
    const onPopState = () => {
      setLocale(getLocaleFromPath());
      setPage(getPageFromPath());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = content.htmlLang;
    document.title = pageTitle;

    const description = ensureMeta('description');
    description.setAttribute('content', pageDescription);

    ensureLink('canonical').setAttribute('href', buildUrl(pagePath));
    if (isDataCenterPage) {
      removeAlternate('fi');
      ensureAlternate('en').setAttribute('href', buildUrl(dataCenterPage.path));
      ensureAlternate('x-default').setAttribute('href', buildUrl(dataCenterPage.path));
    } else {
      ensureAlternate('fi').setAttribute('href', buildUrl(routes.fi));
      ensureAlternate('en').setAttribute('href', buildUrl(routes.en));
      ensureAlternate('x-default').setAttribute('href', buildUrl(routes.fi));
    }

    const schema = ensureSchema();
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': ['Organization', 'LocalBusiness'],
      name: 'KukaKuskaa Oy',
      url: 'https://kukakuskaapro.com/',
      telephone: '+358440335538',
      email: 'myynti@kukakuskaa.com',
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
  }, [content, isDataCenterPage, pageDescription, pagePath, pageTitle]);

  const alternateHref = useMemo(() => {
    const hash = window.location.hash || '';
    return isDataCenterPage ? dataCenterPage.path : `${content.otherPath}${hash}`;
  }, [content.otherPath, isDataCenterPage]);

  function switchLanguage(nextLocale: Locale) {
    const targetPath = isDataCenterPage && nextLocale === 'en' ? dataCenterPage.path : routes[nextLocale];
    const hash = window.location.hash;
    window.history.pushState({}, '', `${targetPath}${hash}`);
    setLocale(nextLocale);
    setPage(getPageFromPath());
    setMenuOpen(false);
  }

  function navigateToPath(path: string) {
    window.history.pushState({}, '', path);
    setLocale(getLocaleFromPath());
    setPage(getPageFromPath());
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function clearContactIntent() {
    setSelectedProjectType('');
  }

  function saveConsentChoice(choice: Exclude<AnalyticsConsentChoice, null>) {
    persistConsentChoice(choice);
    setConsentChoice(choice);
    setConsentPanelOpen(false);
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
        onContactNavigate={clearContactIntent}
        onContactCtaClick={() => {
          trackEvent('contact_cta_click', {
            cta_id: 'header_contact',
            location: 'header',
            locale,
          });
        }}
        onLanguageChange={switchLanguage}
        onRouteNavigate={navigateToPath}
        homeHref={isDataCenterPage ? englishHomeRoute : '#top'}
      />

      <main>
        {isDataCenterPage ? (
          <DataCenterLogisticsPage onContactIntent={setSelectedProjectType} />
        ) : (
          <>
            <Hero
              content={content}
              locale={locale}
              onContactNavigate={clearContactIntent}
            />
            <ClientLogoStrip content={content} />
            <PositioningStrip points={content.positioning} />
            <Services
              content={content}
              locale={locale}
              onContactIntent={setSelectedProjectType}
            />
            <ProjectVisibility content={content} locale={locale} />
            <ProcessSection content={content} locale={locale} />
            <ProjectFilmSection content={content} locale={locale} />
            <TrustSection content={content} locale={locale} />
          </>
        )}
        <ContactSection
          content={content}
          locale={locale}
          selectedProjectType={selectedProjectType}
          onProjectTypeChange={setSelectedProjectType}
        />
      </main>

      <Footer
        content={content}
        locale={locale}
        currentYear={currentYear}
        onContactNavigate={clearContactIntent}
        onLanguageChange={switchLanguage}
        onRouteNavigate={navigateToPath}
        onConsentSettings={() => setConsentPanelOpen(true)}
      />
      {consentPanelOpen ? (
        <ConsentPanel
          content={content}
          onAcceptAll={() => saveConsentChoice('accepted')}
          onNecessaryOnly={() => saveConsentChoice('necessary')}
        />
      ) : null}
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
  onContactNavigate,
  onContactCtaClick,
  onLanguageChange,
  onRouteNavigate,
  homeHref,
}: {
  content: SiteCopy;
  locale: Locale;
  menuOpen: boolean;
  alternateHref: string;
  onMenuToggle: () => void;
  onNavigate: () => void;
  onContactNavigate: () => void;
  onContactCtaClick: () => void;
  onLanguageChange: (locale: Locale) => void;
  onRouteNavigate: (path: string) => void;
  homeHref: string;
}) {
  function handleNavClick(itemId: string) {
    if (itemId === 'contact') {
      onContactNavigate();
    }
    onNavigate();
  }

  return (
    <header className="site-header">
      <a
        className="brand"
        href={homeHref}
        onClick={(event) => {
          if (homeHref !== '#top') {
            event.preventDefault();
            onRouteNavigate(homeHref);
            return;
          }
          onNavigate();
        }}
        aria-label={locale === 'fi' ? 'KukaKuskaa PRO etusivu' : 'KukaKuskaa PRO home'}
      >
        <img
          src="/assets/brand/kukakuskaapro-logo-black.png"
          width={1207}
          height={224}
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
            <a
              key={item.id}
              href={item.path || `#${item.id}`}
              onClick={(event) => {
                if (item.path) {
                  event.preventDefault();
                  onRouteNavigate(item.path);
                  return;
                }
                handleNavClick(item.id);
              }}
            >
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
          <a
            className="header-cta"
            href="#contact"
            onClick={() => {
              onContactCtaClick();
              onContactNavigate();
              onNavigate();
            }}
          >
            {content.headerCta}
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero({
  content,
  locale,
  onContactNavigate,
}: {
  content: SiteCopy;
  locale: Locale;
  onContactNavigate: () => void;
}) {
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <img
        className="hero-image"
        src={images.hero.src}
        srcSet={images.hero.srcSet}
        sizes={images.hero.sizes}
        width={images.hero.width}
        height={images.hero.height}
        alt={images.hero.alt[content.htmlLang as Locale]}
        fetchPriority="high"
      />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow">{content.hero.eyebrow}</p>
        <h1 id="hero-title">{content.hero.title}</h1>
        <p className="hero-support">{content.hero.copy}</p>
        <div className="hero-actions">
          <a
            className="button button-primary"
            href="#contact"
            onClick={() => {
              trackEvent('contact_cta_click', {
                cta_id: 'hero_contact',
                location: 'hero',
                locale,
              });
              onContactNavigate();
            }}
          >
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

function Services({
  content,
  locale,
  onContactIntent,
}: {
  content: SiteCopy;
  locale: Locale;
  onContactIntent: (intent: ProjectTypeKey) => void;
}) {
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
                srcSet={service.image.srcSet}
                sizes={service.image.sizes}
                alt={service.image.alt[locale]}
                loading="lazy"
                style={service.image.objectPosition ? { objectPosition: service.image.objectPosition } : undefined}
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
              <a
                className="text-link"
                href="#contact"
                onClick={() => {
                  if (service.contactIntent) {
                    trackEvent('contact_cta_click', {
                      cta_id: `service_${service.contactIntent}`,
                      location: 'services',
                      locale,
                      project_type_key: service.contactIntent,
                    });
                    onContactIntent(service.contactIntent);
                  }
                }}
              >
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
          srcSet={images.process.srcSet}
          sizes={images.process.sizes}
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

function ProjectFilmSection({
  content,
  locale,
  filmContent,
  processSteps,
}: {
  content: SiteCopy;
  locale: Locale;
  filmContent?: ProjectFilmCopy;
  processSteps?: string[];
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const film = filmContent || content.projectFilm;

  function startFilm(control: FilmPlayControl) {
    trackEvent('project_film_play', {
      locale,
      control,
    });
    setIsPlaying(true);
  }

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    videoRef.current?.play().catch(() => {
      // Native controls remain visible if a browser requires a second user gesture.
    });
  }, [isPlaying]);

  return (
    <section
      className={`project-film-section section-pad${processSteps ? ' data-center-film-section' : ''}`}
      aria-labelledby="project-film-title"
    >
      <div className="project-film-copy">
        <p className="eyebrow">{film.eyebrow}</p>
        <h2 id="project-film-title">{film.heading}</h2>
        <p className="lead">{film.copy}</p>
      </div>
      {processSteps ? (
        <div className="data-center-process" aria-label="Physical logistics flow">
          {processSteps.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
      ) : null}

      <div className={`project-film-media${isPlaying ? ' is-playing' : ''}`}>
        {isPlaying ? (
          <video
            ref={videoRef}
            src={projectFilmMedia.video}
            controls
            playsInline
            preload="metadata"
            poster={projectFilmMedia.posterDesktop}
          />
        ) : (
          <>
            <picture>
              {processSteps ? null : <source media="(max-width: 640px)" srcSet={projectFilmMedia.posterMobile} />}
              <img
                src={projectFilmMedia.posterDesktop}
                width={projectFilmMedia.desktopWidth}
                height={projectFilmMedia.desktopHeight}
                alt=""
                aria-hidden="true"
                loading="lazy"
              />
            </picture>
            <button
              className="film-play-button"
              type="button"
              aria-label={`${film.ariaLabel}, ${film.duration}`}
              onClick={() => startFilm('descriptive')}
            >
              <span className="film-play-icon" aria-hidden="true" />
              <span className="film-play-text">{film.playLabel}</span>
              <span className="film-duration">{film.duration}</span>
            </button>
            <button
              className="film-center-play-button"
              type="button"
              aria-label={film.centerAriaLabel}
              onClick={() => startFilm('center')}
            >
              <span aria-hidden="true" />
            </button>
          </>
        )}
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

function DataCenterLogisticsPage({ onContactIntent }: { onContactIntent: (intent: ProjectTypeKey) => void }) {
  function handleDataCenterCta() {
    trackEvent('contact_cta_click', {
      cta_id: 'data_center_logistics_contact',
      location: 'data_center_logistics_page',
      locale: 'en',
      project_type_key: 'dataCenter',
    });
    onContactIntent('dataCenter');
  }

  return (
    <>
      <section className="data-center-hero section-pad" id="top" aria-labelledby="data-center-title">
        <div className="split-layout">
          <div>
            <p className="eyebrow">{dataCenterPage.eyebrow}</p>
            <h1 id="data-center-title">{dataCenterPage.heading}</h1>
            <p className="lead">{dataCenterPage.lead}</p>
            {dataCenterPage.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="hero-actions">
              <a className="button button-primary" href="#contact" onClick={handleDataCenterCta}>
                {dataCenterPage.ctaLabel}
              </a>
              <a className="button button-secondary" href="#data-center-services">
                View service areas
              </a>
            </div>
          </div>
          <picture className="data-center-media">
            <source media="(max-width: 640px)" srcSet="/assets/images/data-center-logistics-finland-mobile.avif" />
            <img
              className="data-center-image"
              src={images.dataCenter.src}
              srcSet="/assets/images/data-center-logistics-finland-desktop.avif 800w"
              sizes={images.dataCenter.sizes}
              width={images.dataCenter.width}
              height={images.dataCenter.height}
              alt={images.dataCenter.alt.en}
            />
          </picture>
        </div>
      </section>

      <section className="data-center-services section-pad" id="data-center-services" aria-labelledby="data-center-services-title">
        <div className="section-heading">
          <p className="eyebrow">Construction-phase project logistics</p>
          <h2 id="data-center-services-title">{dataCenterPage.servicesHeading}</h2>
          <p>
            KukaKuskaa PRO focuses on the physical flow around the project: receive, stage, schedule, deliver, move internally, position and report.
          </p>
        </div>
        <div className="data-center-card-grid">
          {dataCenterPage.services.map((service, index) => (
            <article className="data-center-card" key={service.title}>
              <div className="data-center-card-marker" aria-hidden="true">
                <span className="service-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="data-center-card-line" />
              </div>
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <ProjectFilmSection
        content={copy.en}
        locale="en"
        filmContent={dataCenterFilm}
        processSteps={dataCenterPage.process}
      />

      <section className="visibility-section data-center-partner section-pad" aria-labelledby="data-center-partner-title">
        <div className="section-heading">
          <p className="eyebrow">{dataCenterPage.partnerEyebrow}</p>
          <h2 id="data-center-partner-title">{dataCenterPage.partnerHeading}</h2>
          <p className="lead">{dataCenterPage.partnerCopy}</p>
          <ul className="refined-list">
            {dataCenterPage.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="trust-section section-pad" aria-labelledby="data-center-scope-title">
        <div className="trust-panel">
          <div>
            <p className="eyebrow">Scope clarity</p>
            <h2 id="data-center-scope-title">{dataCenterPage.clarificationHeading}</h2>
            <p className="lead">{dataCenterPage.clarification}</p>
          </div>
          <div className="careful-note">
            <strong>Physical positioning for the installation team.</strong>
            <span>
              Not electrical connection, MEP installation, commissioning, IT configuration or live data center operations.
            </span>
          </div>
        </div>
      </section>

      <section className="data-center-cta section-pad" aria-labelledby="data-center-cta-title">
        <div>
          <p className="eyebrow">Start the discussion</p>
          <h2 id="data-center-cta-title">{dataCenterPage.ctaHeading}</h2>
          <p className="lead">{dataCenterPage.ctaCopy}</p>
        </div>
        <a className="button button-primary" href="#contact" onClick={handleDataCenterCta}>
          {dataCenterPage.ctaLabel}
        </a>
      </section>
    </>
  );
}

function ContactSection({
  content,
  locale,
  selectedProjectType,
  onProjectTypeChange,
}: {
  content: SiteCopy;
  locale: Locale;
  selectedProjectType: ProjectTypeKey | '';
  onProjectTypeChange: (projectType: ProjectTypeKey | '') => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const formStartTrackedRef = useRef(false);
  const selectedProjectTypeLabel = selectedProjectType ? content.contact.projectTypes[selectedProjectType] || '' : '';
  const availableProjectTypes = projectTypeOrder.filter((key) => content.contact.projectTypes[key]);

  function resolveProjectTypeKey(value: string): ProjectTypeKey | '' {
    return availableProjectTypes.find((key) => content.contact.projectTypes[key] === value) || '';
  }

  function analyticsProjectParams(projectType: ProjectTypeKey | '') {
    return {
      locale,
      project_type_key: projectType || undefined,
    };
  }

  function trackFormStart(event: FocusEvent<HTMLFormElement>) {
    if (formStartTrackedRef.current) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
      return;
    }

    if (target.name === 'website') {
      return;
    }

    const tracked = trackEvent('contact_form_start', analyticsProjectParams(selectedProjectType));
    if (tracked) {
      formStartTrackedRef.current = true;
    }
  }

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setNotice('');

    if (Object.keys(nextErrors).length > 0) {
      setStatus('idle');
      return;
    }

    setStatus('submitting');

    try {
      const formData = new FormData(form);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        const serverErrors = result?.errors && typeof result.errors === 'object' ? result.errors : {};
        setErrors(serverErrors);
        setNotice(content.contact.validation.error);
        setStatus('error');
        return;
      }

      form.reset();
      trackEvent('contact_submit_success', analyticsProjectParams(selectedProjectType));
      onProjectTypeChange('');
      setErrors({});
      setNotice(content.contact.validation.success);
      setStatus('success');
    } catch {
      setNotice(content.contact.validation.error);
      setStatus('error');
    }
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
            <a
              href="tel:+358440335538"
              onClick={() => {
                trackEvent('contact_method_click', {
                  method: 'phone',
                  locale,
                  location: 'contact_section',
                });
              }}
            >
              044 033 5538
            </a>
            <a
              href="mailto:myynti@kukakuskaa.com"
              onClick={() => {
                trackEvent('contact_method_click', {
                  method: 'email',
                  locale,
                  location: 'contact_section',
                });
              }}
            >
              myynti@kukakuskaa.com
            </a>
            <span>www.kukakuskaa.com</span>
            <span>Eteläniementie 21, 71750 Maaninka</span>
          </address>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} onFocusCapture={trackFormStart} noValidate>
          <label className="honeypot" aria-hidden="true">
            <span>Website</span>
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
          <FormField className="span-2" label={content.contact.fields.name} name="name" error={errors.name} required />
          <FormField label={content.contact.fields.phone} name="phone" type="tel" />
          <FormField label={content.contact.fields.email} name="email" type="email" error={errors.email} required />
          <label>
            <span>{content.contact.fields.type}</span>
            <select
              name="projectType"
              value={selectedProjectTypeLabel}
              required
              aria-invalid={errors.projectType ? 'true' : undefined}
              onChange={(event) => onProjectTypeChange(resolveProjectTypeKey(event.currentTarget.value))}
            >
              <option value="">{locale === 'fi' ? 'Valitse' : 'Choose'}</option>
                {availableProjectTypes.map((typeKey) => {
                  const label = content.contact.projectTypes[typeKey] || '';
                  return (
                    <option key={typeKey} value={label}>
                      {label}
                    </option>
                  );
                })}
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
          <button className="button button-primary span-2" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? content.contact.validation.submitting : content.contact.fields.submit}
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
  className,
  label,
  name,
  type = 'text',
  error,
  required = false,
}: {
  className?: string;
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className={className}>
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
  onContactNavigate,
  onConsentSettings,
  onLanguageChange,
  onRouteNavigate,
}: {
  content: SiteCopy;
  locale: Locale;
  currentYear: number;
  onContactNavigate: () => void;
  onConsentSettings: () => void;
  onLanguageChange: (locale: Locale) => void;
  onRouteNavigate: (path: string) => void;
}) {
  return (
    <footer className="site-footer">
      <div>
        <strong>KukaKuskaa Oy</strong>
        <p>Eteläniementie 21, 71750 Maaninka</p>
      </div>
      <nav aria-label={content.navLabel}>
        {content.nav.map((item) => (
          <a
            key={item.id}
            href={item.path || `#${item.id}`}
            onClick={(event) => {
              if (item.path) {
                event.preventDefault();
                onRouteNavigate(item.path);
                return;
              }
              if (item.id === 'contact') {
                onContactNavigate();
              }
            }}
          >
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
        <button type="button" className="footer-consent-button" onClick={onConsentSettings}>
          {content.consent.settings}
        </button>
      </div>
    </footer>
  );
}

function ConsentPanel({
  content,
  onAcceptAll,
  onNecessaryOnly,
}: {
  content: SiteCopy;
  onAcceptAll: () => void;
  onNecessaryOnly: () => void;
}) {
  return (
    <section className="consent-panel" aria-labelledby="consent-title">
      <div>
        <h2 id="consent-title">{content.consent.title}</h2>
        <p>{content.consent.copy}</p>
      </div>
      <div className="consent-actions">
        <button type="button" className="button button-secondary" onClick={onNecessaryOnly}>
          {content.consent.necessary}
        </button>
        <button type="button" className="button button-primary" onClick={onAcceptAll}>
          {content.consent.acceptAll}
        </button>
      </div>
    </section>
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

function removeAlternate(hreflang: string) {
  document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hreflang}"]`)?.remove();
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

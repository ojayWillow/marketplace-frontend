export interface Slide {
  label: string;
  url: string;
  description: string;
}

export interface WebPackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  priceNote: string;
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
  labelColor: string;
  dotColor: string;
  badgeColor: string;
  borderColor: string;
  buttonColor: string;
  icon: string;
  features: string[];
  slides: Slide[];
}

export interface AddOn {
  icon: string;
  title: string;
  description: string;
  price: string;
}

export const WEB_PACKAGES: WebPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Tava pirmā profesionālā vietne',
    description: 'Ideāls risinājums, ja tikko sāc savu uzņēmumu un vajag vienkāršu, skaistu un ātri gatavu mājas lapu. Klienti uzreiz redz, kas tu esi un kā ar tevi sazināties.',
    price: 'no €299',
    priceNote: 'vienreizējs maksājums',
    icon: '🌱',
    gradientFrom: '#10b981',
    gradientTo: '#059669',
    shadowColor: 'rgba(16,185,129,0.3)',
    labelColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    borderColor: 'border-emerald-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    features: [
      'Vienas lapas vietne',
      'Hero sekcija ar aicinājumu rīkoties',
      'Par mums bloks',
      'Kontaktforma',
      'Sociālo tīklu saites',
      'Mobilajām ierīcēm draudzīgs dizains',
      'Piegāde 5–7 darba dienu laikā',
    ],
    slides: [
      {
        label: 'Bloom — ziedu veikals',
        url: 'https://bloom-flower-shop.vercel.app/',
        description: 'Vienkārša un pievilcīga vienas lapas vietne',
      },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Pilnvērtīga klātbūtne internetā',
    description: 'Piemērots uzņēmumiem, kas vēlas izcelties. Vairākas lapas, profesionāls dizains, SEO optimizācija un viss nepieciešāmais, lai piesaistītu jaunus klientus tiešsaistē.',
    price: 'no €799',
    priceNote: 'vienreizējs maksājums',
    icon: '🚀',
    gradientFrom: '#3b82f6',
    gradientTo: '#4f46e5',
    shadowColor: 'rgba(59,130,246,0.3)',
    labelColor: 'text-blue-400',
    dotColor: 'bg-blue-400',
    badgeColor: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-200',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    features: [
      'Vairāku lapu vietne (līdz 6 lapām)',
      'Sākumlapa, Pakalpojumi, Portfolio',
      'Blogs un rakstu sadaļa',
      'Kontaktu lapa ar karti',
      'Pamata SEO optimizācija',
      'Google Analytics integrācija',
      'Piegāde 10–14 darba dienu laikā',
    ],
    slides: [
      {
        label: 'AutoPro Rīga — auto serviss',
        url: 'https://autopro-riga.vercel.app/',
        description: 'Profesionāla vairāku lapu vietne ar booking',
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Augstas veiktspējas risinājums',
    description: 'Piemērots uzņēmumiem, kas vēlas maksimālu rezultātu. Pilna rezervēšanas vai e-komercijas sistēma, ātrums, SEO un prioritārs atbalsts — viss vienā paketē.',
    price: 'no €1499',
    priceNote: 'vienreizējs maksājums',
    icon: '⚡',
    gradientFrom: '#8b5cf6',
    gradientTo: '#7c3aed',
    shadowColor: 'rgba(139,92,246,0.3)',
    labelColor: 'text-violet-400',
    dotColor: 'bg-violet-400',
    badgeColor: 'bg-violet-100 text-violet-700',
    borderColor: 'border-violet-200',
    buttonColor: 'bg-violet-600 hover:bg-violet-700',
    features: [
      'Pilnībā pielāgota vietne',
      'E-komercija vai rezervēšanas sistēma',
      'Maksājumu integrācija',
      'Uzlabota SEO + Google Search Console',
      'Ātruma un veiktspējas optimizācija',
      'Prioritārs atbalsts',
      'Piegāde 3–5 nedēļu laikā',
    ],
    slides: [
      {
        label: 'Estēe City Beauty — booking sistēma',
        url: 'https://estee-city-beauty.vercel.app/',
        description: 'Pilnvērtīga rezervēšanas sistēma ar kalendāru',
      },
    ],
  },
];

export const ADD_ONS: AddOn[] = [
  {
    icon: '🎨',
    title: 'Logo & Zīmola identitāte',
    description: 'Profesionāls logo, krāsu palete un fonti tavam uzņēmumam',
    price: 'no €149',
  },
  {
    icon: '🔍',
    title: 'SEO & Google Business',
    description: 'Google meklēšanas optimizācija un Google Business profila iestatīšana',
    price: 'no €99',
  },
  {
    icon: '📱',
    title: 'Sociālo mediju veidnes',
    description: 'Canva veidnes Instagram, Facebook un LinkedIn',
    price: 'no €79',
  },
  {
    icon: '🔧',
    title: 'Ikmēneša uzturēšana',
    description: 'Regulāri atjauninājumi, drošība un tehniskais atbalsts',
    price: 'no €49/mēn',
  },
  {
    icon: '📧',
    title: 'Domēns & E-pasts',
    description: 'Domēna reģistrācija un profesionāls e-pasts',
    price: 'no €39/gadā',
  },
];

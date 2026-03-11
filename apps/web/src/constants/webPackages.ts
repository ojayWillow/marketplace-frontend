export interface Slide {
  label: string;
  url: string;
  description: string;
}

export interface WebPackage {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  color: string;
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
    tagline: 'Ideāls sākums jaunam uzņēmumam',
    price: 'no €299',
    priceNote: 'vienreizējs maksājums',
    icon: '🌱',
    color: 'from-emerald-500 to-green-600',
    labelColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    borderColor: 'border-emerald-200',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    features: [
      'Vienas lapas vietne',
      'Hero sekcija ar CTA',
      'Par mums bloks',
      'Kontaktforma',
      'Sociālo tīklu saites',
      'Mobilajām ierīcēm draudzīgs',
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
    price: 'no €799',
    priceNote: 'vienreizējs maksājums',
    icon: '🚀',
    color: 'from-blue-500 to-indigo-600',
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
      'Google Analytics',
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
    price: 'no €1499',
    priceNote: 'vienreizējs maksājums',
    icon: '⚡',
    color: 'from-violet-500 to-purple-600',
    labelColor: 'text-violet-400',
    dotColor: 'bg-violet-400',
    badgeColor: 'bg-violet-100 text-violet-700',
    borderColor: 'border-violet-200',
    buttonColor: 'bg-violet-600 hover:bg-violet-700',
    features: [
      'Pilnībā pielāgota vietne',
      'E-komercija vai rezervēšanas sistēma',
      'Maksājumu integrācija',
      'Uzlabota SEO optimizācija',
      'Ātruma optimizācija',
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

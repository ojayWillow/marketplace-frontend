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
  dotColor: string;
  badgeColor: string;
  borderColor: string;
  buttonColor: string;
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
    color: 'from-emerald-500 to-green-600',
    dotColor: 'bg-emerald-400',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    features: [
      'Vienas lapas vietne',
      'Hero sekcija ar aicinājumu rīkoties',
      'Par mums bloks',
      'Kontaktforma',
      'Sociālo tīklu saites',
      'Mobilajām ierīcēm draudzīgs',
      'Piegāde 5–7 darba dienu laikā',
    ],
    slides: [
      {
        label: 'Frizētava — vienkārša un eleganta',
        url: 'https://hair-salon-webpage.vercel.app/',
        description: 'Tīrs vienas lapas dizains ar booking formu',
      },
      {
        label: 'Ziedu veikals — radošs un spilgts',
        url: 'https://bloom-flower-shop.vercel.app/',
        description: 'Vizuāli pievilcīga landing page mazam veikalam',
      },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Pilnvērtīga klātbūtne internetā',
    price: 'no €799',
    priceNote: 'vienreizējs maksājums',
    color: 'from-blue-500 to-indigo-600',
    dotColor: 'bg-blue-400',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
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
        label: 'Auto serviss — profesionāls un uzticams',
        url: 'https://autopro-riga.vercel.app/',
        description: 'Pilnvērtīga uzņēmuma vietne ar vairākām sekcijām',
      },
      {
        label: 'Konditorejas mājas lapa',
        url: 'https://tortes-namins.vercel.app/',
        description: 'Radošs dizains ar interaktīvo tortes veidotāju',
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Augstas veiktspējas risinājums',
    price: 'no €1499',
    priceNote: 'vienreizējs maksājums',
    color: 'from-violet-500 to-purple-600',
    dotColor: 'bg-violet-400',
    badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    borderColor: 'border-violet-200 dark:border-violet-800',
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
        label: 'Beauty studio — pilna booking sistēma',
        url: 'https://estee-city-beauty.vercel.app/',
        description: 'Pilnvērtīga rezervēšanas sistēma ar kalendāru',
      },
      {
        label: 'Samantina — premium klase',
        url: 'https://samantina.vercel.app/',
        description: 'Premium dizains ar pilnu funkcionalitāti',
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
    description: 'Canva veidnes Instagram, Facebook un LinkedIn publicēšanai',
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
    description: 'Domēna reģistrācija un profesionāls e-pasts (info@tavsuznemums.lv)',
    price: 'no €39/gadā',
  },
];

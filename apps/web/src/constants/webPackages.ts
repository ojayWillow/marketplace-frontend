export interface WebPackage {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  color: string;
  badgeColor: string;
  borderColor: string;
  buttonColor: string;
  features: string[];
  slides: { label: string; bg: string; icon: string; description: string }[];
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
      { label: 'Hero sekcija', bg: 'from-emerald-400 to-green-500', icon: '🏠', description: 'Spēcīgs pirmais iespaids — virsraksts, apraksts un CTA poga' },
      { label: 'Par mums', bg: 'from-green-400 to-teal-500', icon: '👋', description: 'Iepazīstini klientus ar sevi un savu uzņēmumu' },
      { label: 'Kontaktforma', bg: 'from-teal-400 to-emerald-500', icon: '✉️', description: 'Vienkārša forma, lai klienti var sazināties' },
      { label: 'Mobilā versija', bg: 'from-emerald-500 to-green-600', icon: '📱', description: 'Perfekti izskatās uz visām ierīcēm' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Pilnvērtīga klātbūtne internetā',
    price: 'no €799',
    priceNote: 'vienreizējs maksājums',
    color: 'from-blue-500 to-indigo-600',
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
      { label: 'Sākumlapa', bg: 'from-blue-400 to-indigo-500', icon: '🌐', description: 'Profesionāla sākumlapa ar navigāciju un sekcijām' },
      { label: 'Pakalpojumi', bg: 'from-indigo-400 to-blue-500', icon: '⚙️', description: 'Skaidri parādīti visi tavi pakalpojumi' },
      { label: 'Portfolio', bg: 'from-blue-500 to-cyan-500', icon: '🖼️', description: 'Vizuāla darbu galerija ar filtriem' },
      { label: 'Blogs', bg: 'from-cyan-400 to-blue-500', icon: '✍️', description: 'Rakstu sadaļa, kas palīdz SEO un uzticamībai' },
      { label: 'Kontakti', bg: 'from-indigo-500 to-blue-600', icon: '📍', description: 'Kontaktforma, adrese un Google Maps' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Augstas veiktspējas risinājums',
    price: 'no €1499',
    priceNote: 'vienreizējs maksājums',
    color: 'from-violet-500 to-purple-600',
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
      { label: 'Pielāgots dizains', bg: 'from-violet-400 to-purple-500', icon: '🎨', description: 'Unikāls dizains, kas atspoguļo tava zīmola identitāti' },
      { label: 'E-komercija', bg: 'from-purple-400 to-violet-500', icon: '🛒', description: 'Pilnvērtīgs veikals ar produktu pārvaldību un maksājumiem' },
      { label: 'Rezervēšana', bg: 'from-violet-500 to-pink-500', icon: '📅', description: 'Online rezervēšanas sistēma ar kalendāru' },
      { label: 'Analītika', bg: 'from-pink-400 to-violet-500', icon: '📊', description: 'Detalizēta statistika par apmeklētājiem un pārdošanu' },
      { label: 'Ātrums', bg: 'from-violet-500 to-purple-600', icon: '⚡', description: '95+ Google PageSpeed rezultāts — ātra ielāde visur' },
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

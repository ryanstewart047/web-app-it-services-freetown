export interface CategoryDetailInfo {
  overview: string;
  whatWeFix: string[];
  supportedBrands?: string[];
  turnaround?: string;
  warranty?: string;
}

export interface TradeCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  type: 'tech' | 'trade';
  image: string;
  popular?: boolean;
  details?: CategoryDetailInfo;
}

export const TRADE_CATEGORIES: TradeCategory[] = [
  // ── Tech & Electronics Specialists ──
  {
    id: 'printer-tech',
    title: 'Printer & Copier Repair',
    subtitle: 'HP, Canon, Epson, Ricoh — paper jams, printheads, power faults & error codes',
    icon: 'fas fa-print',
    color: 'from-blue-600 to-indigo-600',
    badge: 'Tech Specialist',
    type: 'tech',
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'pc-laptop',
    title: 'Computer & Laptop Repair',
    subtitle: 'MacBook, Dell, HP, Lenovo — screen replacement, charging port, motherboard & OS install',
    icon: 'fas fa-laptop',
    color: 'from-blue-600 to-cyan-600',
    badge: 'IT Hardware',
    type: 'tech',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'phone-tablet',
    title: 'Smartphone & Tablet Repair',
    subtitle: 'iPhone, Samsung, Tecno, Infinix — screen replacement, battery swap & water damage',
    icon: 'fas fa-mobile-alt',
    color: 'from-violet-600 to-purple-600',
    badge: 'Mobile Tech',
    type: 'tech',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'gaming-console',
    title: 'Gaming Console Repair',
    subtitle: 'PlayStation (PS4/PS5), Xbox Series X/S, Nintendo Switch — HDMI port, overheating, power faults',
    icon: 'fas fa-gamepad',
    color: 'from-indigo-600 to-blue-600',
    badge: 'Gaming Specialist',
    type: 'tech',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'cctv-security',
    title: 'CCTV & Security Cameras',
    subtitle: 'Hikvision, Dahua DVR/NVR, IP camera setup, mobile viewing & remote monitoring',
    icon: 'fas fa-video',
    color: 'from-purple-600 to-pink-600',
    badge: 'Surveillance Tech',
    type: 'tech',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'networking-wifi',
    title: 'WiFi & Office Networking',
    subtitle: 'Ubiquiti, MikroTik, 4G/5G router setup, mesh WiFi, LAN cabling & fiber termination',
    icon: 'fas fa-network-wired',
    color: 'from-cyan-600 to-blue-600',
    badge: 'Network Engineer',
    type: 'tech',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'solar-inverter',
    title: 'Solar & Inverter Systems',
    subtitle: 'Hybrid inverters, lithium batteries, solar panel mounting & power backup diagnostics',
    icon: 'fas fa-solar-panel',
    color: 'from-yellow-500 to-amber-600',
    badge: 'Clean Energy',
    type: 'tech',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'audio-visual',
    title: 'Audio-Visual & Home Theater',
    subtitle: 'Smart TV wall mounting, conference room audio, projector setup & sound systems',
    icon: 'fas fa-tv',
    color: 'from-rose-600 to-red-600',
    badge: 'AV Tech',
    type: 'tech',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'satellite-dstv',
    title: 'Satellite & DSTV Installation',
    subtitle: 'DSTV, Canal+, Free-to-Air dish alignment, LNB replacement, signal boosting & multi-room cabling',
    icon: 'fas fa-satellite-dish',
    color: 'from-sky-600 to-blue-700',
    badge: 'Satellite Tech',
    type: 'tech',
    image: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },

  // ── Certified Physical Trade Artisans ──
  {
    id: 'electrician',
    title: 'Certified Electricians',
    subtitle: 'House wiring, single/3-phase breaker panels, short circuit troubleshooting & EDSA changeovers',
    icon: 'fas fa-bolt',
    color: 'from-amber-600 to-yellow-600',
    badge: 'Certified Trade',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'plumber',
    title: 'Plumbers & Pipe Fitters',
    subtitle: 'Water pumps, leaking pipes, overhead water tanks & bathroom fittings',
    icon: 'fas fa-faucet',
    color: 'from-sky-600 to-blue-700',
    badge: 'Certified Trade',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'ac-refrigeration',
    title: 'AC & Fridge Technicians',
    subtitle: 'Split AC servicing, gas refilling, compressor repairs & cooling faults',
    icon: 'fas fa-snowflake',
    color: 'from-indigo-600 to-blue-500',
    badge: 'Certified Trade',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'generator-mechanic',
    title: 'Generator Mechanics',
    subtitle: 'Perkins, Lister, Kipor & portable generators — servicing, AVR, injector & rewinding',
    icon: 'fas fa-cogs',
    color: 'from-amber-600 to-red-600',
    badge: 'Power Machinery',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'auto-electrician',
    title: 'Auto-Electricians & Diagnostics',
    subtitle: 'OBD2 computer scanning, starter motor, alternator, ECU wiring & car AC cooling',
    icon: 'fas fa-car',
    color: 'from-red-600 to-rose-700',
    badge: 'Automotive',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'appliance-repair',
    title: 'Home & Kitchen Appliances',
    subtitle: 'Microwaves, washing machines, electric cookers, water dispensers & blenders',
    icon: 'fas fa-blender',
    color: 'from-emerald-600 to-teal-600',
    badge: 'Appliances',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'water-pump-borehole',
    title: 'Borehole & Water Pump Specialists',
    subtitle: 'Deep-well submersible pumps, pressure switch control boxes & float switch setup',
    icon: 'fas fa-water',
    color: 'from-sky-600 to-cyan-700',
    badge: 'Water Systems',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'welder-metal',
    title: 'Welders & Metal Workers',
    subtitle: 'Burglar bars, security metal gates, iron railings & custom metal welding',
    icon: 'fas fa-fire',
    color: 'from-orange-600 to-red-600',
    badge: 'Fabrication',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'carpenter',
    title: 'Carpenters & Woodworkers',
    subtitle: 'Door hanging, lock repairs, kitchen cabinets, office desks & roofing',
    icon: 'fas fa-hammer',
    color: 'from-amber-700 to-orange-800',
    badge: 'Artisan',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'mason-builder',
    title: 'Masons, Tilers & Builders',
    subtitle: 'Floor tiling, bricklaying, wall plastering & building repairs',
    icon: 'fas fa-trowel',
    color: 'from-stone-600 to-stone-800',
    badge: 'Construction',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'painter',
    title: 'Professional Painters',
    subtitle: 'Interior & exterior painting, weatherproofing & damp wall coating',
    icon: 'fas fa-paint-roller',
    color: 'from-emerald-600 to-green-700',
    badge: 'Finishing',
    type: 'trade',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
];

export const FREETOWN_AREAS = [
  'Aberdeen',
  'Lumley',
  'Juba & Goderich',
  'Wilberforce & Spur Road',
  'Congo Cross & Brookfields',
  'Central Freetown',
  'Hill Station & Regent',
  'Kissy & Cline Town',
  'Wellington',
  'Calaba Town',
  'Hastings & Waterloo',
  'Other Western Area',
];

export const CATEGORY_FULL_DESCRIPTIONS: Record<string, CategoryDetailInfo> = {
  'printer-tech': {
    overview: 'Professional on-site diagnosis and repair for desktop printers, office copiers, and multi-function laser printers. We resolve mechanical feeding issues, electronic motherboard failures, and print quality problems.',
    whatWeFix: [
      'Paper jams, roller wear & gear replacements',
      'Clogged printheads & ink delivery system clearing',
      'Continuous Ink Supply System (CISS) installation',
      'Toner & drum unit replacement and error code resets',
      'Power board, logic board, and USB/Ethernet port repair'
    ],
    supportedBrands: ['HP LaserJet & DeskJet', 'Canon Pixma & ImageRunner', 'Epson EcoTank & WorkForce', 'Ricoh Aficio', 'Brother', 'Kyocera'],
    turnaround: 'Same-day or within 24 hours across Freetown',
    warranty: '14-Day Free Service Warranty'
  },
  'pc-laptop': {
    overview: 'Comprehensive hardware and software repair for laptops, desktops, and all-in-one PCs. From broken screens and faulty keyboards to advanced motherboard micro-soldering and performance tuning.',
    whatWeFix: [
      'Broken screen, hinge & chassis replacement',
      'Motherboard micro-soldering & power IC repair',
      'Battery replacement & charging port DC-jack soldering',
      'High-speed SSD upgrades & RAM expansion',
      'Windows & macOS installation, virus removal & data backup',
      'Overheating diagnosis, fan repair & thermal paste renewal'
    ],
    supportedBrands: ['Apple MacBook (Air/Pro)', 'Dell & Alienware', 'HP (Pavilion/Envy/ProBook)', 'Lenovo ThinkPad & IdeaPad', 'ASUS', 'Acer', 'Toshiba'],
    turnaround: '1 to 24 hours depending on component availability',
    warranty: '14-Day Free Service Warranty'
  },
  'phone-tablet': {
    overview: 'Fast, certified mobile phone and tablet repairs with genuine replacement parts. We handle shattered screens, dead batteries, water-damaged logic boards, and software unlocking.',
    whatWeFix: [
      'OLED & LCD display screen replacement',
      'Battery swelling, fast drain & replacement',
      'Type-C and Lightning charging port replacement',
      'Water & liquid damage chemical ultrasonic cleaning',
      'Microphone, earpiece, loudspeaker & camera repairs',
      'iCloud bypass, Google Account FRP removal & software flashing'
    ],
    supportedBrands: ['Apple iPhone & iPad', 'Samsung Galaxy Series', 'Tecno & Infinix', 'Xiaomi & Redmi', 'Huawei & Honor', 'Itel'],
    turnaround: 'Fast 1 to 4 hour turnaround for most common repairs',
    warranty: '14-Day Free Service Warranty'
  },
  'gaming-console': {
    overview: 'Specialized repair and maintenance for video game consoles. We solve HDMI port damage, overheating fans, disc drive laser reading errors, and console motherboard faults.',
    whatWeFix: [
      'HDMI port replacement & micro-soldering',
      'Console overheating, loud fan noise & thermal paste renewal',
      'Power supply unit (PSU) repair & power surge fix',
      'Blu-ray disc drive laser lens repair & disc feeding issues',
      'Storage SSD upgrades & system software recovery',
      'Wireless controller analog drift & button repairs'
    ],
    supportedBrands: ['PlayStation 5 & PS4 (Slim/Pro)', 'Xbox Series X/S & Xbox One', 'Nintendo Switch (OLED/Lite)'],
    turnaround: 'Same-day or 24-48 hours',
    warranty: '14-Day Free Service Warranty'
  },
  'cctv-security': {
    overview: 'Complete commercial and residential security camera installation, maintenance, and mobile surveillance setup. Protect your home, shop, or office with 24/7 video recording.',
    whatWeFix: [
      'New CCTV camera installation & structured cabling',
      'DVR / NVR setup, hard drive configuration & recording',
      'Mobile phone live view app configuration for remote access',
      'Night vision, infrared & motion detection camera troubleshooting',
      'Solar-powered wireless 4G security camera installation',
      'Power supply distribution box replacement & cable neatening'
    ],
    supportedBrands: ['Hikvision', 'Dahua Technology', 'Uniview (UNV)', 'Solar Wireless 4G Cameras', 'CP Plus'],
    turnaround: 'On-site assessment within 24 hours',
    warranty: '14-Day Free Service Warranty'
  },
  'networking-wifi': {
    overview: 'High-performance wireless networking, structured office cabling, and internet distribution. Eliminate WiFi dead zones and build a secure, reliable network for your business or home.',
    whatWeFix: [
      'Long-range outdoor & indoor WiFi access point installation',
      'Multi-room seamless mesh WiFi setup for homes & compounds',
      'Structured Cat6 LAN cabling, patch panels & RJ45 termination',
      '4G/5G SIM router configuration & external antenna setup',
      'Network switch, router configuration & bandwidth allocation',
      'Fiber optic cable termination, splicing & media converters'
    ],
    supportedBrands: ['Ubiquiti UniFi', 'MikroTik', 'TP-Link Omada & Deco', 'Cisco', 'Huawei 4G/5G Routers'],
    turnaround: 'Same-day on-site deployment',
    warranty: '14-Day Free Service Warranty'
  },
  'solar-inverter': {
    overview: 'Certified solar power and inverter technicians to keep your lights, fans, computers, and appliances running smoothly through EDSA outages. System design, installation, and battery diagnostics.',
    whatWeFix: [
      'Pure sine wave inverter installation, servicing & repair',
      'Lithium (LiFePO4) & tubular deep-cycle battery testing',
      'Roof-mounted solar panel wiring & charge controller setup',
      'Automatic changeover switch (ATS) installation (EDSA/Solar/Generator)',
      'Inverter overload, charging failure & error code troubleshooting',
      'System capacity sizing & electrical load balancing'
    ],
    supportedBrands: ['Felicity Solar', 'Must Power', 'Growatt', 'Luminous', 'Victron Energy', 'Eastman'],
    turnaround: 'Rapid dispatch within 24 hours',
    warranty: '14-Day Free Service Warranty'
  },
  'audio-visual': {
    overview: 'Professional audiovisual setups for residential living rooms, corporate boardrooms, places of worship, and entertainment venues. Perfect sound clarity and stunning visual displays.',
    whatWeFix: [
      'Smart TV wall bracket mounting & hidden wire concealment',
      'Conference room projector, motorized screen & video setup',
      'Public address (PA) sound system installation & tuning',
      'Multi-channel audio mixers, amplifiers & speaker wiring',
      'HDMI matrix switchers, wireless display & presentation gear'
    ],
    supportedBrands: ['Samsung', 'LG', 'Sony', 'Yamaha', 'JBL', 'Behringer', 'Epson Projectors'],
    turnaround: 'Same-day or next-day booking',
    warranty: '14-Day Free Service Warranty'
  },
  'satellite-dstv': {
    overview: 'Accurate satellite dish tracking, signal alignment, and multi-room TV distribution. Enjoy crystal clear HD channels without signal loss during rain or heavy cloud cover.',
    whatWeFix: [
      'Satellite dish tracking & fine-tuned signal alignment',
      'LNB (Single, Twin, Smart) replacement & angle calibration',
      'DSTV Explora, HD Zapper & Canal+ decoder setup',
      'Multi-room TV RF cabling, splitters & amplifier installation',
      'Free-to-Air (FTA) satellite channel scanning & dish setup',
      'Coaxial cable replacement & F-connector weatherproofing'
    ],
    supportedBrands: ['DSTV (Explora & HD)', 'Canal+ Afrique', 'Strong Free-To-Air', 'Startimes'],
    turnaround: 'Rapid dispatch within 2 to 4 hours',
    warranty: '14-Day Free Service Warranty'
  },
  'electrician': {
    overview: 'Licensed and vetted electricians providing safe, code-compliant residential and commercial electrical work. We troubleshoot complex electrical faults and protect your property from fire hazards.',
    whatWeFix: [
      'Complete house & office conduit wiring and rewiring',
      'Distribution board (DB) & circuit breaker panel installation',
      'Short circuit, earth leakage & tripping breaker troubleshooting',
      'EDSA prepaid meter changeover & surge protector installation',
      'Generator manual/automatic changeover switch wiring',
      'Sockets, industrial switches, ceiling fans & LED lighting fixtures'
    ],
    turnaround: 'Standard 24h or Emergency 2-4h response',
    warranty: '14-Day Free Service Warranty'
  },
  'plumber': {
    overview: 'Skilled plumbers and pipe fitters for all domestic and commercial water distribution, drainage, and plumbing fixtures. Clean, fast, and durable plumbing solutions.',
    whatWeFix: [
      'Overhead water storage tank (Mambo) plumbing & pipe stands',
      'Automatic water booster pump installation & plumbing',
      'Burst, leaking, or blocked PVC & PPR pipe repairs',
      'Toilet commode, flush cistern, wash basin & tap installation',
      'Water heater installation & hot/cold water piping',
      'Underground drainage unblocking & soak-away pipe laying'
    ],
    turnaround: 'Standard 24h or Emergency 2-4h response',
    warranty: '14-Day Free Service Warranty'
  },
  'ac-refrigeration': {
    overview: 'Certified HVAC technicians for split air conditioners, commercial refrigeration, deep freezers, and cold rooms. Keep your living and working spaces comfortably cool in Freetown’s tropical climate.',
    whatWeFix: [
      'Split unit air conditioner installation & wall bracket mounting',
      'Deep chemical cleaning, coil washing & filter sanitization',
      'R410A / R22 refrigerant gas leak detection & refilling',
      'Compressor testing, capacitor replacement & cooling repairs',
      'Water leakage from indoor unit & drain pipe clearing',
      'Domestic & commercial refrigerator and chest freezer repairs'
    ],
    supportedBrands: ['LG', 'Samsung', 'Hisense', 'Gree', 'Midea', 'Carrier'],
    turnaround: 'Same-day or next-day call-out',
    warranty: '14-Day Free Service Warranty'
  },
  'generator-mechanic': {
    overview: 'Experienced generator mechanics for diesel and heavy-duty petrol power generators. Routine servicing, preventive maintenance, and emergency breakdown repairs to ensure continuous power.',
    whatWeFix: [
      'Comprehensive engine service (oil, oil filter, fuel filter, air filter)',
      'AVR (Automatic Voltage Regulator) replacement & voltage tuning',
      'Fuel injection pump & injector nozzle calibration',
      'Starter motor, battery alternator & ignition circuit repairs',
      'Alternator copper coil rewinding & stator troubleshooting',
      'Lister / Perkins mechanical governor & engine timing adjustment'
    ],
    supportedBrands: ['Perkins', 'Lister Petter', 'Cummins', 'Kipor', 'Honda', 'Elepaq & Tiger'],
    turnaround: 'Rapid on-site emergency call-out',
    warranty: '14-Day Free Service Warranty'
  },
  'auto-electrician': {
    overview: 'Mobile auto-electricians equipped with computerized diagnostic scanners. We diagnose check-engine lights, vehicle charging issues, starting faults, and automotive air conditioning right at your location.',
    whatWeFix: [
      'OBD2 computerized engine diagnostic scanning & error clearing',
      'Alternator charging system & battery load testing',
      'Starter motor servicing & replacement',
      'Car air conditioning electricals, compressor clutch & gas refilling',
      'Headlights, indicators, power window motors & central locking',
      'Wiring harness troubleshooting & blown fuse replacement'
    ],
    supportedBrands: ['Toyota', 'Nissan', 'Honda', 'Hyundai & Kia', 'Mercedes-Benz', 'Ford & Mitsubishi'],
    turnaround: 'Mobile on-site call-out across Freetown',
    warranty: '14-Day Free Service Warranty'
  },
  'appliance-repair': {
    overview: 'Reliable on-site and workshop repairs for kitchen and household electrical appliances. Restore your valuable appliances to working condition without expensive replacements.',
    whatWeFix: [
      'Microwave oven repair (no heating, sparking, dead power)',
      'Automatic & semi-automatic washing machine drum & motor repair',
      'Electric oven, cooker element & temperature thermostat repair',
      'Hot/cold water dispenser heating, cooling & leak repair',
      'Commercial food blenders, meat grinders & food processors',
      'Electric kettle, iron & vacuum cleaner repairs'
    ],
    turnaround: 'Same-day or 24-hour repair',
    warranty: '14-Day Free Service Warranty'
  },
  'water-pump-borehole': {
    overview: 'Specialized borehole technicians and deep-well pump mechanics. We handle deep-well submersible pump installation, retrieval, pressure tank setup, and automatic water pumping control.',
    whatWeFix: [
      'Deep-well submersible water pump retrieval & replacement',
      'Pressure switch & hydro-pneumatic tank calibration',
      'Automatic float switch & dry-run protection wiring',
      'Borehole control box capacitor & overload relay replacement',
      'High-head surface booster pump installation & piping',
      'Borehole water flow testing & yield optimization'
    ],
    supportedBrands: ['Pedrollo', 'Grundfos', 'Leo', 'Shakti', 'Davey'],
    turnaround: '24-48 hours depending on well depth',
    warranty: '14-Day Free Service Warranty'
  },
  'welder-metal': {
    overview: 'Certified welders and structural metal fabricators for residential, commercial, and security installations. Heavy-duty, aesthetically pleasing metalwork built to resist rust in coastal Freetown.',
    whatWeFix: [
      'Heavy-duty burglar proof bars for windows & doors',
      'Custom security iron gates (sliding & swinging)',
      'Steel staircase railings, handrails & balcony balustrades',
      'Generator security cages & air conditioner protector brackets',
      'Metal door frame fabrication & installation',
      'On-site electric arc & gas welding repair for broken metal'
    ],
    turnaround: 'On-site quote within 24 hours',
    warranty: '14-Day Free Service Warranty'
  },
  'carpenter': {
    overview: 'Master carpenters and woodworkers for modern interior cabinetry, solid hardwood door fitting, furniture repairs, and roof timber work. Precision measurements and durable craftsmanship.',
    whatWeFix: [
      'Solid wood internal & external door hanging and leveling',
      'High-security mortise door lock, handle & latch installation',
      'Custom modern kitchen cabinets, shelving & wall units',
      'Built-in bedroom wardrobes & closet organization systems',
      'Office desks, wooden conference tables & reception counters',
      'Roof truss reinforcement, fascia board & ceiling framework'
    ],
    turnaround: 'Quick on-site inspection and quote',
    warranty: '14-Day Free Service Warranty'
  },
  'mason-builder': {
    overview: 'Experienced masons, tilers, and construction artisans for renovations, floor tiling, wall plastering, and masonry structural repairs. Quality finishes using the best mortar and adhesive standards.',
    whatWeFix: [
      'Porcelain, ceramic & granite floor and wall tiling',
      'Bricklaying, block setting & foundation wall construction',
      'Smooth wall plastering, screeding & skimming',
      'Concrete crack repair, lintel casting & structural patching',
      'Soak-away pit & septic tank masonry construction',
      'Paving stone laying for driveways & compound compounds'
    ],
    turnaround: 'Free on-site assessment',
    warranty: '14-Day Free Service Warranty'
  },
  'painter': {
    overview: 'Professional painters for immaculate residential and commercial interior and exterior finishes. We prepare walls thoroughly, cure dampness, and apply premium paints for lasting beauty.',
    whatWeFix: [
      'Complete interior house, apartment & office painting',
      'Weather-resistant exterior building painting & coating',
      'Anti-fungal and moisture-barrier damp wall treatment',
      'Wall crack filling, sanding, skimming & primer undercoating',
      'Wood varnish, stain & protective clear lacquer coating',
      'Metal gate, railing & burglar bar gloss enamel painting'
    ],
    turnaround: 'Prompt on-site measurement & color consultation',
    warranty: '14-Day Free Service Warranty'
  }
};

export function getCategoryDetails(cat: TradeCategory): CategoryDetailInfo {
  if (cat.details) return cat.details;
  if (CATEGORY_FULL_DESCRIPTIONS[cat.id]) {
    return CATEGORY_FULL_DESCRIPTIONS[cat.id];
  }
  return {
    overview: cat.subtitle,
    whatWeFix: [
      'Certified on-site diagnosis and repair',
      'Rapid dispatch across all Western Area / Freetown areas',
      'Genuine parts and professional workmanship',
      'Comprehensive testing before job sign-off'
    ],
    turnaround: 'Within 24 hours',
    warranty: '14-Day Free Service Warranty'
  };
}

/**
 * Sierra Leone Tech News Finder & Intelligence Engine
 * 
 * Aggregates live tech news, government policy developments (MoCTI),
 * telecom infrastructure (NaTCA, fiber, satellite), fintech (Orange Money, Afrimoney),
 * hardware assembly, cybersecurity, and startup ecosystem updates specifically for Sierra Leone.
 */

export interface SierraLeoneTechTopic {
  id: string;
  title: string;
  suggestedBlogTitle: string;
  category: 
    | 'Hardware & Assembly'
    | 'Telecom & 4G/5G'
    | 'Digital Governance & MoCTI'
    | 'FinTech & Payments'
    | 'Cybersecurity & Enterprise'
    | 'Green Tech & Power'
    | 'Startups & Youth STEM';
  source: string;
  sourceUrl?: string;
  pubDate: string;
  summary: string;
  keyFacts: string[];
  suggestedAngle: string;
  writingPrompt: string;
  imageUrl?: string;
  imageCaption?: string;
  sourceImages?: Array<{ url: string; caption?: string }>;
  extractedFacts?: string[];
  isLive?: boolean;
}

export const SL_TECH_CATEGORIES = [
  'All Categories',
  'Digital Governance & MoCTI',
  'Hardware & Assembly',
  'Telecom & 4G/5G',
  'FinTech & Payments',
  'Cybersecurity & Enterprise',
  'Green Tech & Power',
  'Startups & Youth STEM',
] as const;

/**
 * Curated & Verified Sierra Leone Tech Storylines
 * Continuously updated with verified government MoUs, infrastructure projects, and local tech realities.
 */
export const CURATED_SL_TECH_TOPICS: SierraLeoneTechTopic[] = [
  {
    id: 'mocti-unique-group-assembly',
    title: "MoCTI & Unique Group Sign US$21.9M Deal for Sierra Leone's First Mobile Phone & Electronics Assembly Plant",
    suggestedBlogTitle: "Sierra Leone's ICT Ministry Signs Landmark US$21.9M MoU with Unique Group for Mobile Phone & Electronics Assembly in Freetown",
    category: 'Hardware & Assembly',
    source: 'Ministry of Communication, Technology and Innovation (MoCTI)',
    sourceUrl: 'https://mocti.gov.sl/government-and-unique-group-partner-to-advance-local-mobile-phone-assembly-digital-inclusion-and-job-creation-in-sierra-leone/',
    pubDate: 'November 20, 2026',
    summary: "Minister Salima Monorma Bah and President Julius Maada Bio signed an indicative $21.9M MoU with Unique Group (The Gambia) at WAIIS 2026 to construct a state-of-the-art smartphone and electronics assembly factory in Freetown.",
    keyFacts: [
      "Indicative investment value: US$21.9 Million (MoCTI & Unique Group).",
      "Mission: Assemble affordable 4G/5G smartphones, educational tablets, and laptops in Freetown.",
      "Includes a youth technical skills training academy for circuit micro-soldering and quality testing.",
      "Aims to slash smartphone retail prices by 25-35% and serve as an ECOWAS hardware export hub."
    ],
    suggestedAngle: "Analyze how domestic smartphone assembly slashes device import costs and creates high-skilled micro-soldering and technician jobs for Freetown youth.",
    writingPrompt: "Investigate and write a long-form journalistic feature about the US$21.9 Million mobile phone and electronics assembly plant MoU signed between Sierra Leone's Ministry of Communication, Technology and Innovation (MoCTI) and Unique Group at WAIIS 2026. Detail the factory rollout, youth vocational training, ECOWAS export strategy, affordability impact, and only add BridgeTech IT Services' local repair-ecosystem commentary in the closing section right before the references.",
    imageUrl: 'https://mocti.gov.sl/wp-content/uploads/2026/11/government-unique-group-mobile-phone-assembly-mou-waiis-2026-1024x732.jpg',
    imageCaption: 'Official MoCTI Signing: Minister Salima Bah and Unique Group MD Adama Touray sign the US$21.9M MoU in Freetown.',
    isLive: false,
  },
  {
    id: 'mocti-digital-development-strategy',
    title: "Sierra Leone's National Digital Development Strategy 2025–2034: MoCTI's 10-Year Tech Blueprint",
    suggestedBlogTitle: "Inside Sierra Leone's National Digital Development Strategy: MoCTI's 10-Year Roadmap to Transform Freetown into a Tech Hub",
    category: 'Digital Governance & MoCTI',
    source: 'MoCTI Official Strategy Portal',
    sourceUrl: 'https://mocti.gov.sl',
    pubDate: 'October 15, 2026',
    summary: "MoCTI Minister Salima Monorma Bah has outlined a 10-year comprehensive masterplan focusing on national broadband expansion, digitized civil services, STEM curriculum overhauls, and modern data governance.",
    keyFacts: [
      "Targeting 80%+ nationwide broadband coverage by 2030.",
      "Interconnecting all government ministries, departments, and agencies (MDAs) via centralized fiber networks.",
      "Establishing sovereign cloud infrastructure and national digital identity integration.",
      "Prioritizing digital literacy training across rural school districts."
    ],
    suggestedAngle: "Examine how the 10-year strategy will modernize everyday public services and drive private sector IT adoption in Sierra Leone.",
    writingPrompt: "Write a long-form analytical article examining Sierra Leone's National Digital Development Strategy (2025–2034) spearheaded by MoCTI Minister Salima Monorma Bah. Break down the pillars of universal connectivity, MDA fiber interconnection, sovereign cloud infrastructure, and rural STEM literacy, reserving BridgeTech IT Services' brief commentary solely for the closing section before the references.",
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Digital connectivity and fiber optic data infrastructure powering national development initiatives.',
    isLive: false,
  },
  {
    id: 'natca-telecom-qos-fiber',
    title: "NaTCA Enforces New Quality of Service (QoS) Standards and Drives Terrestrial Fiber Expansion Beyond Freetown",
    suggestedBlogTitle: "NaTCA's Telecom QoS Revolution: How Fiber Backbone Expansion is Upgrading Internet Speeds Across Sierra Leone",
    category: 'Telecom & 4G/5G',
    source: 'National Telecommunications Authority (NaTCA)',
    sourceUrl: 'https://natca.gov.sl',
    pubDate: 'November 05, 2026',
    summary: "The National Telecommunications Authority (NaTCA) has imposed stricter latency, packet loss, and uptime mandates on mobile network operators, while accelerating terrestrial fiber backbone link-ups from Freetown into Waterloo, Bo, and Makeni.",
    keyFacts: [
      "Operators required to meet minimum 98.5% network availability and transparent data billing.",
      "Secondary fiber links deployed to prevent nationwide outages during coastal fiber maintenance.",
      "Expanding high-capacity backhaul to provincial administrative centers.",
      "Promoting infrastructure sharing between telecom operators to reduce consumer data costs."
    ],
    suggestedAngle: "Help business owners and remote workers understand why fiber and telecom QoS improvements mean faster cloud backups and fewer dropped VoIP calls.",
    writingPrompt: "Write a detailed, technical industry analysis of the new NaTCA Quality of Service (QoS) regulations and terrestrial fiber expansion in Sierra Leone. Examine how uptime mandates, packet-loss rules, and provincial fiber backhaul reshape reliability for banks, schools, and remote teams, placing BridgeTech IT Services' network-hardware perspective solely in the closing section before the source links.",
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'High-speed fiber optic data cables and telecommunication network hardware.',
    isLive: false,
  },
  {
    id: 'starlink-satellite-broadband-sl',
    title: "Satellite Internet & Starlink in Sierra Leone: Regulatory Framework, Off-Grid Connectivity, and Enterprise Deployment",
    suggestedBlogTitle: "Starlink & Satellite Internet in Sierra Leone: Pricing, NaTCA Licensing, and How Off-Grid Businesses Can Connect",
    category: 'Telecom & 4G/5G',
    source: 'West Africa Telecom News & NaTCA Briefing',
    sourceUrl: 'https://natca.gov.sl',
    pubDate: 'November 12, 2026',
    summary: "As low-earth-orbit (LEO) satellite broadband expands across West Africa, Sierra Leone businesses, mining operations, and maritime vessels are adopting satellite dishes for high-speed off-grid connectivity.",
    keyFacts: [
      "Provides 100-220 Mbps download speeds in remote rural areas with zero terrestrial fiber coverage.",
      "Critical for mining concessions, agricultural estates, and coastal logistics across Sierra Leone.",
      "Requires professional surge protection and UPS power backup to survive Freetown's lightning season and power fluctuations.",
      "NaTCA regulatory framework ensures lawful frequency spectrum alignment and security compliance."
    ],
    suggestedAngle: "A technical guide for businesses evaluating satellite internet: equipment setup, power backup, lightning protection, and local IT installation.",
    writingPrompt: "Write an exhaustive field report and technical breakdown of satellite broadband (including Starlink and VSAT) across Sierra Leone. Cover NaTCA spectrum licensing, coastal weather/lightning resilience, throughput benchmarks, and enterprise WAN integration, keeping BridgeTech IT Services' perspective strictly at the end right before the references.",
    imageUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Satellite communication dish providing broadband connectivity to remote and off-grid facilities.',
    isLive: false,
  },
  {
    id: 'fintech-interoperability-mobile-money',
    title: "Afrimoney & Orange Money Interoperability: How Cross-Network FinTech is Accelerating Freetown's Cashless Economy",
    suggestedBlogTitle: "Cashless Freetown: How Mobile Money Interoperability and FinTech Sandboxes Are Changing Everyday Commerce",
    category: 'FinTech & Payments',
    source: 'Bank of Sierra Leone & FinTech Association',
    sourceUrl: 'https://mocti.gov.sl',
    pubDate: 'October 28, 2026',
    summary: "Regulatory push by the Bank of Sierra Leone and telecom operators has enabled seamless wallet-to-wallet transfers between Orange Money and Afrimoney, lowering transaction fees for retail merchants across Sierra Leone.",
    keyFacts: [
      "Over 65% of adult Sierra Leoneans rely on mobile wallets for daily commercial payments.",
      "Interoperability allows instant payments between different telecom network users without cash withdrawal penalties.",
      "Bank of Sierra Leone Regulatory Sandbox is piloting digital micro-loans, merchant QR systems, and payment gateway APIs.",
      "Spurs e-commerce adoption for local supermarkets, restaurants, and IT service providers in Freetown."
    ],
    suggestedAngle: "Explain how small businesses and tech companies in Freetown can integrate mobile money payment gateways on their websites and retail checkouts.",
    writingPrompt: "Write an analytical feature on mobile money interoperability (Orange Money & Afrimoney) and the Bank of Sierra Leone's fintech initiatives. Detail how wallet-to-wallet clearing, merchant QR systems, and sandbox APIs transform SME commerce across Freetown and the provinces, reserving BridgeTech IT Services' commentary exclusively for the closing section before the source links.",
    imageUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Digital payment checkout and mobile wallet transactions in retail business.',
    isLive: false,
  },
  {
    id: 'cybersecurity-nc3-csirt-sl',
    title: "Strengthening Sierra Leone's Cyber Defenses: National CSIRT and Enterprise Ransomware Protection",
    suggestedBlogTitle: "Cybersecurity in Sierra Leone: Protecting Corporate Networks, Banks, and Small Businesses from Ransomware in 2026",
    category: 'Cybersecurity & Enterprise',
    source: 'National Cybersecurity Coordination Centre (NC3)',
    sourceUrl: 'https://mocti.gov.sl',
    pubDate: 'November 02, 2026',
    summary: "Following the Cyber Security and Crime Act 2021, Sierra Leone's National Computer Security Incident Response Team (CSIRT) is collaborating with banks, government portals, and IT service providers to combat phishing, malware, and data theft.",
    keyFacts: [
      "Significant increase in corporate spear-phishing and business email compromise (BEC) attempts in West Africa.",
      "NC3 guidelines mandate automated data backups, two-factor authentication (2FA), and staff cyber hygiene training.",
      "Local enterprises often leave network router default passwords unchanged, exposing internal servers to automated botnets.",
      "BridgeTech IT Services provides proactive firewall auditing, endpoint antivirus deployment, and disaster recovery planning in Freetown."
    ],
    suggestedAngle: "An urgent, actionable cybersecurity checklist for Sierra Leone business owners, school administrators, and corporate IT managers.",
    writingPrompt: "Write a deep-dive cybersecurity dossier for organizations in Sierra Leone under the Cyber Security and Crime Act 2021 and NC3/CSIRT guidance. Analyze BEC spear-phishing, ransomware exposure, router misconfigurations, and zero-trust backup controls, placing BridgeTech IT Services' commentary solely at the very end before the reference card.",
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Network security monitoring, intrusion detection, and data encryption shields.',
    isLive: false,
  },
  {
    id: 'solar-green-telecom-infrastructure',
    title: "Green Power for Sierra Leone's Tech Grid: Solar Hybrid Systems and Lithium Power for Uninterrupted IT Infrastructure",
    suggestedBlogTitle: "Solving Freetown's Power Challenge: How Solar Hybrid Systems and Lithium Batteries Keep Servers and Tech Hubs Online 24/7",
    category: 'Green Tech & Power',
    source: 'Renewable Energy & ICT Clean Tech Forum',
    sourceUrl: 'https://mocti.gov.sl',
    pubDate: 'October 22, 2026',
    summary: "With recurring power grid fluctuations and diesel fuel price volatility in Sierra Leone, tech hubs, telecom towers, and data centers are aggressively transitioning to solar PV arrays and LiFePO4 battery storage.",
    keyFacts: [
      "Power instability is cited as the #1 operational cost and hardware destruction factor for electronics in Freetown.",
      "Pure sine wave hybrid inverters protect sensitive server motherboards from brownouts and high-voltage line spikes.",
      "Solar conversion reduces generator diesel consumption by up to 75% for corporate offices and telecom base stations.",
      "BridgeTech IT Services designs and installs customized commercial solar backups and surge-suppression systems at Jui Junction."
    ],
    suggestedAngle: "A practical guide showing how local businesses can pair pure sine wave inverters with solar panels to prevent computer motherboard burnout.",
    writingPrompt: "Write a detailed engineering and market analysis on solar hybrid power and LiFePO4 lithium storage for ICT infrastructure in Sierra Leone. Compare grid volatility costs, diesel displacement on telecom towers, pure-sine-wave hardware protection, and TCO economics, leaving BridgeTech IT Services' viewpoint strictly for the closing section before the sources.",
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Solar photovoltaic panels generating sustainable, clean energy for tech hubs and communication towers.',
    isLive: false,
  },
  {
    id: 'orange-digital-center-stem-sl',
    title: "Empowering Sierra Leone's Next Tech Generation: Free AI, Robotics, and Software Bootcamps at Orange Digital Center",
    suggestedBlogTitle: "Freetown's Coding Renaissance: How Youth Coding Bootcamps and Tech Hubs Are Training Sierra Leone's Next Software Engineers",
    category: 'Startups & Youth STEM',
    source: 'Orange Digital Center & FBC Innovation Lab',
    sourceUrl: 'https://mocti.gov.sl',
    pubDate: 'November 14, 2026',
    summary: "Non-profit coding academies, university innovation labs at Fourah Bay College (FBC) and Njala, and tech hubs across Freetown are equipping thousands of young Sierra Leoneans with full-stack programming, AI prompt engineering, and hardware repair skills.",
    keyFacts: [
      "Over 1,200 students graduated in 2026 with certificates in Python, Web Development, and Digital Marketing.",
      "High local demand for web developers, IT network administrators, and smartphone hardware technicians.",
      "Bridging the gender gap in technology through specialized 'Women in Tech' coding scholarships.",
      "Local tech businesses provide apprenticeship pathways and real-world project mentorship."
    ],
    suggestedAngle: "Celebrate the growing tech talent pool in Sierra Leone and discuss how young graduates can turn coding skills into high-paying freelance careers or IT enterprise roles.",
    writingPrompt: "Write an investigative spotlight on youth STEM education, university innovation labs, and software engineering bootcamps in Sierra Leone. Examine graduation numbers, employer skill gaps, women-in-tech pathways, and remote tech exports, keeping BridgeTech IT Services' perspective solely at the very end before the reference links.",
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Young technology students collaborating on software programming and digital innovation in West Africa.',
    isLive: false,
  },
  {
    id: 'ncra-digital-id-integration',
    title: "NCRA's Digital Identity Revolution: Securing Sierra Leone's Banking, Passports, and E-Government",
    suggestedBlogTitle: "The Power of the National ID: How Sierra Leone's NCRA Digital Identification Is Modernizing Banking and Healthcare",
    category: 'Digital Governance & MoCTI',
    source: 'National Civil Registration Authority (NCRA)',
    sourceUrl: 'https://ncra.gov.sl',
    pubDate: 'November 08, 2026',
    summary: "The National Civil Registration Authority (NCRA) has accelerated the mandatory integration of the National Identification Number (NIN) across banking, SIM card registration, driving licenses, and public sector employment verification.",
    keyFacts: [
      "Biometric National ID cards feature high-security chip integration and QR validation.",
      "Eliminates identity fraud and ghost workers across public payroll systems.",
      "Facilitates rapid e-KYC (Know Your Customer) onboarding for commercial banks and microfinance institutions.",
      "Prepares the foundation for centralized digital health records and unified citizen portals."
    ],
    suggestedAngle: "A helpful guide for citizens and business HR departments on how the biometric National ID simplifies verification, tax filings, and banking in Sierra Leone.",
    writingPrompt: "Write a clear, educational blog article explaining the significance of Sierra Leone's National Civil Registration Authority (NCRA) biometric digital ID system. Outline how NIN integration is curbing financial fraud, modernizing banking verification, and setting the stage for fully digital public services.",
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Biometric identification, smart card validation, and digital identity security.',
    isLive: false,
  },
  {
    id: 'subsea-cable-secondary-landing',
    title: "Protecting Sierra Leone's Internet: The Push for a Secondary Submarine Fiber Optic Cable Landing Station",
    suggestedBlogTitle: "Why Sierra Leone Needs a Second Submarine Cable: Securing National Internet Resilience Against Deep-Sea Cable Cuts",
    category: 'Telecom & 4G/5G',
    source: 'West Africa Telecommunications Review',
    sourceUrl: 'https://mocti.gov.sl',
    pubDate: 'October 30, 2026',
    summary: "Following recent undersea fiber cuts along the West African coast that caused severe outages in multiple countries, MoCTI and regional telecom consortiums are pushing for a redundant second submarine cable landing station in Freetown.",
    keyFacts: [
      "Sierra Leone currently depends heavily on the Africa Coast to Europe (ACE) submarine cable landing in Freetown.",
      "Deep-sea seismic events or fishing trawlers can sever underwater cables, crippling banking and international bandwidth.",
      "A secondary cable connection (such as 2Africa or Equiano spur) would provide automatic failover redundancy.",
      "BridgeTech IT Services emphasizes the critical importance of multi-WAN failover routers for local enterprise networks."
    ],
    suggestedAngle: "Explain the vulnerability of undersea internet cables and what Freetown businesses must do to maintain uninterrupted operations during international cable cuts.",
    writingPrompt: "Write a thorough technical investigation into submarine fiber optic cable resilience in Sierra Leone and along West Africa's coast. Analyze single-landing risk on the ACE cable, regional redundancy spurs, multi-WAN continuity architecture, and national telecom strategy, placing BridgeTech IT Services' commentary solely at the closing section before the sources.",
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'High-bandwidth undersea fiber optic communication cables and core switching hardware connecting nations.',
    isLive: false,
  }
];

/**
 * Clean XML text
 */
function cleanXmlText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Categorize a news item based on headline and snippet keywords
 */
function categorizeNewsItem(title: string, snippet: string): SierraLeoneTechTopic['category'] {
  const combined = `${title} ${snippet}`.toLowerCase();
  
  if (combined.includes('unique group') || combined.includes('assembly') || combined.includes('hardware') || combined.includes('laptop') || combined.includes('smartphone') || combined.includes('electronics')) {
    return 'Hardware & Assembly';
  }
  if (combined.includes('mocti') || combined.includes('salima bah') || combined.includes('government') || combined.includes('ministry') || combined.includes('president bio') || combined.includes('parliament') || combined.includes('policy') || combined.includes('ncra')) {
    return 'Digital Governance & MoCTI';
  }
  if (combined.includes('natca') || combined.includes('telecom') || combined.includes('fiber') || combined.includes('cable') || combined.includes('4g') || combined.includes('5g') || combined.includes('starlink') || combined.includes('satellite') || combined.includes('broadband') || combined.includes('orange') || combined.includes('africell') || combined.includes('qcell')) {
    return 'Telecom & 4G/5G';
  }
  if (combined.includes('money') || combined.includes('fintech') || combined.includes('bank') || combined.includes('wallet') || combined.includes('payment') || combined.includes('afrimoney') || combined.includes('cashless')) {
    return 'FinTech & Payments';
  }
  if (combined.includes('cyber') || combined.includes('security') || combined.includes('csirt') || combined.includes('hack') || combined.includes('ransomware') || combined.includes('virus') || combined.includes('malware')) {
    return 'Cybersecurity & Enterprise';
  }
  if (combined.includes('solar') || combined.includes('power') || combined.includes('energy') || combined.includes('grid') || combined.includes('green') || combined.includes('battery') || combined.includes('inverter')) {
    return 'Green Tech & Power';
  }
  return 'Startups & Youth STEM';
}

/**
 * Resolve Google News RSS redirect URLs (`news.google.com/rss/articles/...`)
 * to the actual publisher article URL via Google News batchexecute RPC.
 */
export async function resolveGoogleNewsUrl(sourceUrl: string): Promise<string> {
  if (!sourceUrl || !sourceUrl.includes('news.google.com/')) {
    return sourceUrl;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const html = await res.text();

    const sgMatch = html.match(/data-n-a-sg="([^"]+)"/);
    const tsMatch = html.match(/data-n-a-ts="([^"]+)"/);
    const idMatch = sourceUrl.match(/articles\/([^?]+)/);

    if (!sgMatch || !tsMatch || !idMatch) {
      clearTimeout(timer);
      return sourceUrl;
    }

    const payload = JSON.stringify([
      [
        [
          'Fbv4je',
          JSON.stringify([
            'garturlreq',
            [
              ['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1],
              'X',
              'X',
              1,
              [1, 1, 1],
              1,
              1,
              null,
              0,
              0,
              null,
              0,
            ],
            idMatch[1],
            Number(tsMatch[1]),
            sgMatch[1],
          ]),
          null,
          'generic',
        ],
      ],
    ]);

    const bRes = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
      },
      body: 'f.req=' + encodeURIComponent(payload),
    });
    clearTimeout(timer);

    const bText = await bRes.text();
    const line = bText.split('\n').find((l) => l.includes('garturlres'));
    if (!line) return sourceUrl;

    const outer = JSON.parse(line);
    const inner = JSON.parse(outer[0][2]);
    return typeof inner[1] === 'string' && inner[1].startsWith('http') ? inner[1] : sourceUrl;
  } catch {
    return sourceUrl;
  }
}

export interface FallbackImageSpec {
  id: string;
  url: string;
  caption: string;
  altText: string;
}

/**
 * Verify that a candidate remote image URL actually responds with HTTP 2xx and an image Content-Type.
 * Fast-paths first-party site assets to avoid unnecessary self-fetch round-trips.
 */
export async function verifyReachableImageUrl(url: string, refererUrl?: string): Promise<boolean> {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  if (/^https:\/\/(?:www\.)?itservicesfreetown\.com\//i.test(url)) return true;

  const probe = async (method: 'HEAD' | 'GET', headers: Record<string, string>): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2400);
    try {
      return await fetch(url, {
        method,
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          ...(refererUrl ? { Referer: refererUrl } : {}),
          ...headers,
        },
        redirect: 'follow',
      });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let res = await probe('HEAD', {});
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await probe('GET', { Range: 'bytes=0-0' });
    }
    if (!res.ok) return false;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    return contentType.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Unified, verified HTTP-200 category image fallbacks shared by Storyline Finder & AI Story Investigator.
 */
export function getCategoryFallbackImages(categoryOrTopic: string): FallbackImageSpec[] {
  const lower = categoryOrTopic.toLowerCase();

  if (
    lower.includes('fintech') ||
    lower.includes('orange money') ||
    lower.includes('afrimoney') ||
    lower.includes('payment') ||
    lower.includes('wallet') ||
    lower.includes('cashless') ||
    lower.includes('bank')
  ) {
    return [
      {
        id: 'mobile-money-retail',
        url: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1200&q=80',
        caption: 'Mobile wallet transaction and digital point-of-sale checkout accelerating cashless commerce.',
        altText: 'Digital mobile payment transaction on smartphone screen in retail store',
      },
      {
        id: 'fintech-card-terminal',
        url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
        caption: 'Contactless digital payments and secure fintech payment gateway infrastructure.',
        altText: 'Contactless mobile payment and digital checkout terminal',
      },
    ];
  }

  if (
    lower.includes('hardware') ||
    lower.includes('assembly') ||
    lower.includes('repair') ||
    lower.includes('screen') ||
    lower.includes('motherboard') ||
    lower.includes('laptop') ||
    lower.includes('smartphone') ||
    lower.includes('solder')
  ) {
    return [
      {
        id: 'hardware-assembly-line',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        caption: 'Precision electronics assembly line and component diagnostics testing.',
        altText: 'Technician assembling and testing electronic circuit hardware',
      },
      {
        id: 'bridgetech-motherboard-bench',
        url: 'https://www.itservicesfreetown.com/assets/images/slider/motherboard-repair.jpg',
        caption: 'Precision hardware diagnostics and motherboard micro-soldering at BridgeTech IT Services standards in Freetown.',
        altText: 'Technician performing motherboard diagnostics and repair at BridgeTech IT Services',
      },
    ];
  }

  if (
    lower.includes('fiber') ||
    lower.includes('telecom') ||
    lower.includes('natca') ||
    lower.includes('cable') ||
    lower.includes('subsea') ||
    lower.includes('broadband') ||
    lower.includes('4g') ||
    lower.includes('5g') ||
    lower.includes('sierratel') ||
    lower.includes('africell')
  ) {
    return [
      {
        id: 'fiber-optic-splicing',
        url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
        caption: 'High-speed terrestrial fiber optic data cables and transmission switching hardware.',
        altText: 'Fiber optic communication cables in telecommunications exchange',
      },
      {
        id: 'core-telecom-rack',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        caption: 'Core telecom routing and optical network switching infrastructure.',
        altText: 'Network switching racks and enterprise telecom servers',
      },
    ];
  }

  if (lower.includes('starlink') || lower.includes('satellite')) {
    return [
      {
        id: 'satellite-broadband-dish',
        url: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80',
        caption: 'Satellite communication array supporting off-grid high-speed broadband connectivity.',
        altText: 'Satellite communication infrastructure for broadband internet',
      },
      {
        id: 'network-home-office',
        url: 'https://www.itservicesfreetown.com/assets/images/ai-generated/ai_home_office_network.jpg',
        caption: 'Enterprise WAN failover and local Wi-Fi network distribution in Freetown.',
        altText: 'Enterprise router and local network distribution setup',
      },
    ];
  }

  if (
    lower.includes('cyber') ||
    lower.includes('security') ||
    lower.includes('csirt') ||
    lower.includes('nc3') ||
    lower.includes('ransomware') ||
    lower.includes('data center') ||
    lower.includes('embassy')
  ) {
    return [
      {
        id: 'cybersecurity-monitoring-center',
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        caption: 'Network security monitoring, intrusion detection, and enterprise cyber defense.',
        altText: 'Cybersecurity monitoring dashboard and network defense system',
      },
      {
        id: 'enterprise-server-rack',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        caption: 'Enterprise server hardware racks with redundant power and hardware firewall switches.',
        altText: 'Server room data center equipment with illuminated network switches',
      },
    ];
  }

  if (
    lower.includes('solar') ||
    lower.includes('power') ||
    lower.includes('green') ||
    lower.includes('energy') ||
    lower.includes('inverter') ||
    lower.includes('battery')
  ) {
    return [
      {
        id: 'solar-hybrid-installation',
        url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Solar photovoltaic arrays providing clean, uninterrupted power to IT and telecom equipment.',
        altText: 'Commercial solar panels installed for clean technology power generation',
      },
      {
        id: 'telecom-network-hardware',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        caption: 'Uninterrupted enterprise server and network equipment protected by clean hybrid power.',
        altText: 'Enterprise server rack powered by clean backup energy',
      },
    ];
  }

  if (
    lower.includes('governance') ||
    lower.includes('mocti') ||
    lower.includes('policy') ||
    lower.includes('ncra') ||
    lower.includes('identity') ||
    lower.includes('nin')
  ) {
    return [
      {
        id: 'digital-governance-network',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        caption: 'Digital connectivity and public network infrastructure powering national services.',
        altText: 'Digital connectivity network interconnecting public infrastructure',
      },
      {
        id: 'digital-identity-office',
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
        caption: 'Digital transformation strategy, biometric systems, and institutional governance.',
        altText: 'Technology leadership team reviewing digital transformation systems',
      },
    ];
  }

  if (lower.includes('startup') || lower.includes('stem') || lower.includes('youth') || lower.includes('coding')) {
    return [
      {
        id: 'youth-coding-bootcamp',
        url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
        caption: 'Young technology professionals collaborating on software engineering and STEM training.',
        altText: 'Software engineers collaborating at a coding workshop',
      },
      {
        id: 'tech-team-collaboration',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Digital innovation and startup collaboration in modern tech workspaces.',
        altText: 'Team of tech professionals collaborating in a modern workspace',
      },
    ];
  }

  return [
    {
      id: 'digital-innovation-africa',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      caption: 'Technology professionals collaborating on modern digital systems and IT services.',
      altText: 'Team of tech professionals collaborating in a modern workspace',
    },
    {
      id: 'bridgetech-service-bench',
      url: 'https://www.itservicesfreetown.com/assets/images/slider/slide-2-technician-repair-bench.jpg',
      caption: 'BridgeTech IT Services hardware repair and diagnostics workshop in Freetown, Sierra Leone.',
      altText: 'BridgeTech IT Services technician bench in Freetown',
    },
  ];
}

export interface SourcePhotoCandidate {
  url: string;
  caption?: string;
  altText?: string;
}

export interface ExtractedSourceDetails {
  images: SourcePhotoCandidate[];
  excerpt?: string;
  paragraphs: string[];
  title?: string;
}

const IMAGE_NOISE_PATTERN =
  /(?:logo|icon|favicon|avatar|badge|pixel|1x1|blank|placeholder|spinner|doubleclick|ads|share|social|fb\.png|x\.png|yt\.png|rss\.png|twitter\.png|linkedin\.png|whatsapp|emoji|smilies|gravatar)/i;
const TINY_THUMB_PATTERN = /(?:-(?:1[0-4]\d|[5-9]\d)x(?:1[0-4]\d|[5-9]\d)\b|[?&](?:w|width)=(?:[1-9]\d|1\d\d)\b)/i;

function pickLargestFromSrcset(srcset: string): string | null {
  const parts = srcset
    .split(',')
    .map((part) => {
      const tokens = part.trim().split(/\s+/);
      const urlPart = tokens[0] || '';
      const widthMatch = tokens[1]?.match(/^(\d+)w$/i);
      return { url: urlPart, width: widthMatch ? Number(widthMatch[1]) : 0 };
    })
    .filter((entry) => entry.url && !entry.url.startsWith('data:'));

  if (parts.length === 0) return null;
  parts.sort((a, b) => b.width - a.width);
  return parts[0].url;
}

function normalizeCandidateImageUrl(rawCandidate: string, baseUrl: string): string | null {
  let absUrl = rawCandidate.trim().replace(/&amp;/g, '&');
  if (!absUrl || absUrl.startsWith('data:') || absUrl.startsWith('blob:')) return null;
  try {
    absUrl = new URL(absUrl, baseUrl).href;
  } catch {
    return null;
  }
  if (
    !/^https?:\/\//i.test(absUrl) ||
    IMAGE_NOISE_PATTERN.test(absUrl) ||
    TINY_THUMB_PATTERN.test(absUrl) ||
    /\.(?:svg|ico|gif)(?:\?|$)/i.test(absUrl)
  ) {
    return null;
  }
  return absUrl;
}

function extractArticleProse(htmlChunk: string, maxChars = 4500): { excerpt?: string; paragraphs: string[] } {
  const stripped = htmlChunk
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<(?:nav|aside|footer|header|form|svg)[\s\S]*?<\/(?:nav|aside|footer|header|form|svg)>/gi, ' ');

  const blockMatches = stripped.match(/<(?:p|li|blockquote|h2|h3)\b[^>]*>[\s\S]*?<\/(?:p|li|blockquote|h2|h3)>/gi) || [];
  const paragraphs: string[] = [];
  const seen = new Set<string>();
  let totalLen = 0;

  for (const block of blockMatches) {
    const clean = cleanXmlText(block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    if (clean.length < 40) continue;
    if (/^(?:cookie|subscribe|sign up|follow us|copyright|all rights reserved|read also|related)/i.test(clean)) continue;
    const key = clean.slice(0, 60).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    paragraphs.push(clean);
    totalLen += clean.length + 1;
    if (totalLen >= maxChars) break;
  }

  return {
    excerpt: paragraphs.length > 0 ? paragraphs.join('\n').slice(0, maxChars) : undefined,
    paragraphs,
  };
}

/**
 * Fallback to WordPress JSON REST API when direct HTML returns 403/401/bot-challenge.
 */
async function tryWordPressRestFallback(articleUrl: string): Promise<ExtractedSourceDetails | null> {
  try {
    const parsed = new URL(articleUrl);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const slug = segments[segments.length - 1];
    if (!slug || slug.length < 3) return null;

    const apiUrl = `${parsed.origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3200);
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const posts = await res.json();
    const post = Array.isArray(posts) ? posts[0] : null;
    if (!post) return null;

    const hostname = parsed.hostname.replace(/^www\./, '');
    const title = post.title?.rendered ? cleanXmlText(post.title.rendered.replace(/<[^>]+>/g, '')) : undefined;
    const candidates: Array<{ url: string; caption?: string }> = [];

    const featured = post._embedded?.['wp:featuredmedia']?.[0];
    if (featured?.source_url) {
      const normalized = normalizeCandidateImageUrl(featured.source_url, articleUrl);
      if (normalized) {
        candidates.push({
          url: normalized,
          caption: featured.caption?.rendered
            ? cleanXmlText(featured.caption.rendered.replace(/<[^>]+>/g, ''))
            : `Original source photo (${hostname}): ${title || 'Featured photograph'}`,
        });
      }
    }

    const contentHtml = post.content?.rendered || '';
    const wpImgRegex = /<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>/gi;
    let wpImgMatch: RegExpExecArray | null;
    while ((wpImgMatch = wpImgRegex.exec(contentHtml)) !== null) {
      const normalized = normalizeCandidateImageUrl(wpImgMatch[1], articleUrl);
      if (normalized && !candidates.some((c) => c.url === normalized)) {
        candidates.push({
          url: normalized,
          caption: `Original source photo (${hostname}): ${title || 'Article photograph'}`,
        });
      }
    }

    const checks = await Promise.all(
      candidates.slice(0, 6).map(async (c) => ({
        candidate: c,
        ok: await verifyReachableImageUrl(c.url, articleUrl),
      }))
    );

    const images = checks
      .filter((x) => x.ok)
      .slice(0, 5)
      .map((x) => ({
        url: x.candidate.url,
        caption: x.candidate.caption,
        altText: title || 'Original source photograph',
      }));

    const { excerpt, paragraphs } = extractArticleProse(contentHtml, 4500);
    return { images, excerpt, paragraphs, title };
  } catch {
    return null;
  }
}

/**
 * Extract multiple real source photos (up to 5) AND deep article prose from a resolved publisher article URL.
 */
export async function extractSourceArticleDetails(url: string): Promise<ExtractedSourceDetails> {
  if (!url || !url.startsWith('http') || url.includes('news.google.com')) {
    return { images: [], paragraphs: [] };
  }

  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
      return { images: [], paragraphs: [] };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    clearTimeout(timer);

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        const wpFallback = await tryWordPressRestFallback(url);
        if (wpFallback) return wpFallback;
      }
      return { images: [], paragraphs: [] };
    }

    const html = await res.text();
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    const ogTitle =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
      html.match(/<title>([^<]+)<\/title>/i);
    const cleanTitle = ogTitle ? cleanXmlText(ogTitle[1]) : undefined;

    const candidates: Array<{ url: string; caption?: string; altText?: string }> = [];
    const seenUrls = new Set<string>();

    const pushCandidate = (rawImgUrl: string, caption?: string, altText?: string) => {
      const absUrl = normalizeCandidateImageUrl(rawImgUrl, url);
      if (!absUrl || seenUrls.has(absUrl)) return;
      seenUrls.add(absUrl);
      candidates.push({
        url: absUrl,
        caption: caption || (cleanTitle ? `Original source photo (${hostname}): ${cleanTitle}` : `Original source photo (${hostname})`),
        altText: altText || cleanTitle || 'Original source photograph',
      });
    };

    // 1. OpenGraph & Twitter meta images
    const metaPatterns = [
      /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
      /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
    ];
    for (const pat of metaPatterns) {
      const m = html.match(pat);
      if (m && m[1]) pushCandidate(m[1]);
    }

    // 2. JSON-LD schema images (handles strings, objects, and arrays of photos)
    const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const block of jsonLdMatches) {
      try {
        const parsed = JSON.parse(block.replace(/<script[^>]*>|<\/script>/gi, ''));
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const obj of items) {
          const imgs = Array.isArray(obj?.image) ? obj.image : obj?.image ? [obj.image] : [];
          for (const entry of imgs) {
            const u = typeof entry === 'string' ? entry : entry?.url;
            if (typeof u === 'string') pushCandidate(u);
          }
          if (typeof obj?.thumbnailUrl === 'string') pushCandidate(obj.thumbnailUrl);
        }
      } catch {}
    }

    // 3. Featured & inline content photos strictly inside the article container (ignoring sidebar/nav/footer/related widgets)
    const containerMatch =
      html.match(/<article\b[\s\S]*?<\/article>/i) ||
      html.match(/<div[^>]+class=["'][^"']*(?:entry-content|post-content|article-content|td-post-content|single-post-content|node__content)[^"']*["'][^>]*>[\s\S]*?<\/div>\s*(?:<\/div>|<footer|<aside|<div[^>]+class=["'][^"']*(?:related|share|comment))/i) ||
      html.match(/<main\b[\s\S]*?<\/main>/i);

    const articleScope = (containerMatch ? containerMatch[0] : html)
      .replace(/<(?:aside|nav|footer|script|style)[\s\S]*?<\/(?:aside|nav|footer|script|style)>/gi, ' ')
      .replace(/<div[^>]+class=["'][^"']*(?:related|recommended|popular-posts|trending|sidebar|comments|author-box)[^"']*["'][\s\S]*?<\/div>/gi, ' ');

    const wpMatch = html.match(
      /<img[^>]+class=["'][^"']*(?:wp-post-image|featured-image|entry-thumb|hero-image|post-thumbnail)[^"']*["'][^>]+(?:data-full-src|data-original|data-lazy-src|data-src|src)=["']([^"']+)["']/i
    );
    if (wpMatch && wpMatch[1]) pushCandidate(wpMatch[1]);

    // Extract ALL inline article <img> tags (supporting lazy-loaded data-src, data-lazy-src, data-original, srcset, and src)
    const figureRegex = /<figure\b[\s\S]*?<\/figure>/gi;
    let figMatch: RegExpExecArray | null;
    while ((figMatch = figureRegex.exec(articleScope)) !== null) {
      const figHtml = figMatch[0];
      const capMatch = figHtml.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i);
      const figCaption = capMatch ? cleanXmlText(capMatch[1].replace(/<[^>]+>/g, ' ').trim()) : undefined;
      const altMatch = figHtml.match(/\balt=["']([^"']+)["']/i);
      const imgUrlMatch =
        figHtml.match(/\b(?:data-full-src|data-original|data-lazy-src|data-src)=["']([^"']+)["']/i) ||
        figHtml.match(/\bsrc=["']([^"']+)["']/i);
      const srcsetMatch = figHtml.match(/\b(?:data-srcset|srcset)=["']([^"']+)["']/i);
      const chosen = (srcsetMatch && pickLargestFromSrcset(srcsetMatch[1])) || imgUrlMatch?.[1];
      if (chosen) {
        pushCandidate(chosen, figCaption ? `${figCaption} (${hostname})` : undefined, altMatch?.[1]);
      }
    }

    const inlineImgRegex = /<img\b([^>]+)>/gi;
    let imgTagMatch: RegExpExecArray | null;
    while ((imgTagMatch = inlineImgRegex.exec(articleScope)) !== null) {
      const attrs = imgTagMatch[1];
      const altMatch = attrs.match(/\balt=["']([^"']+)["']/i);
      const srcsetMatch = attrs.match(/\b(?:data-srcset|srcset)=["']([^"']+)["']/i);
      const lazyMatch = attrs.match(/\b(?:data-full-src|data-original|data-lazy-src|data-src)=["']([^"']+)["']/i);
      const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
      const chosen =
        (srcsetMatch && pickLargestFromSrcset(srcsetMatch[1])) ||
        lazyMatch?.[1] ||
        srcMatch?.[1];
      if (chosen) {
        pushCandidate(
          chosen,
          altMatch?.[1] ? `${cleanXmlText(altMatch[1])} (${hostname})` : undefined,
          altMatch?.[1] ? cleanXmlText(altMatch[1]) : undefined
        );
      }
    }

    // Verify top candidates in parallel (pass referer so hotlink-protected CDNs allow probe)
    const verifiedChecks = await Promise.all(
      candidates.slice(0, 8).map(async (c) => ({
        candidate: c,
        ok: await verifyReachableImageUrl(c.url, url),
      }))
    );

    const images = verifiedChecks
      .filter((entry) => entry.ok)
      .slice(0, 5)
      .map((entry) => entry.candidate);

    const prose = extractArticleProse(articleScope, 4500);
    return {
      images,
      excerpt: prose.excerpt,
      paragraphs: prose.paragraphs,
      title: cleanTitle,
    };
  } catch {
    return { images: [], paragraphs: [] };
  }
}

/**
 * Extract the primary original article photo directly from a resolved publisher webpage
 */
export async function extractPrimarySourcePhoto(
  url: string
): Promise<{ url: string; caption?: string } | null> {
  const details = await extractSourceArticleDetails(url);
  if (details.images.length === 0) return null;
  return { url: details.images[0].url, caption: details.images[0].caption };
}

/**
 * Fetch live Sierra Leone tech news from Google News RSS,
 * resolving publisher URLs and capturing multiple original photos & facts from each source.
 */
export async function fetchLiveGoogleNewsSL(searchQuery?: string, forceLive = false): Promise<SierraLeoneTechTopic[]> {
  try {
    const defaultQuery = searchQuery 
      ? `"${searchQuery}" "Sierra Leone"`
      : `("Sierra Leone") AND (technology OR ICT OR digital OR telecom OR "MoCTI" OR "Salima Bah" OR smartphone OR fiber OR internet OR fintech)`;
      
    const encoded = encodeURIComponent(defaultQuery);
    const feedUrl = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      ...(forceLive ? { cache: 'no-store' as const } : { next: { revalidate: 3600 } }),
    };

    const res = await fetch(feedUrl, fetchOptions);
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    const parsedPromises = itemMatches.slice(0, 8).map(async (itemXml): Promise<SierraLeoneTechTopic | null> => {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);

      if (!titleMatch || !linkMatch) return null;

      const rawTitle = cleanXmlText(titleMatch[1]);
      const rawLink = cleanXmlText(linkMatch[1]);
      const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : new Date().toLocaleDateString();
      const sourceName = sourceMatch ? cleanXmlText(sourceMatch[1]) : 'Google News';
      const rawDesc = descMatch ? cleanXmlText(descMatch[1]).replace(/<[^>]*>/g, '') : '';

      // Clean source off title if Google News appends " - Publisher"
      let cleanTitle = rawTitle;
      const lastDash = rawTitle.lastIndexOf(' - ');
      if (lastDash > 15) {
        cleanTitle = rawTitle.slice(0, lastDash).trim();
      }

      const category = categorizeNewsItem(cleanTitle, rawDesc);

      // Decode Google News redirect to actual publisher URL and extract real photos + article paragraphs
      const resolvedUrl = await resolveGoogleNewsUrl(rawLink);
      const sourceDetails = await extractSourceArticleDetails(resolvedUrl);

      const fallbackSpec = getCategoryFallbackImages(category)[0];
      const hasRealSourcePhotos = sourceDetails.images.length > 0;
      const imageUrl = hasRealSourcePhotos ? sourceDetails.images[0].url : fallbackSpec.url;
      const imageCaption = hasRealSourcePhotos
        ? sourceDetails.images[0].caption || `Original photo from ${sourceName}: ${cleanTitle}`
        : fallbackSpec.caption;

      const id = `live-${Buffer.from(cleanTitle.slice(0, 30)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;

      const extractedFacts = sourceDetails.paragraphs.slice(0, 5);
      const richSummary =
        sourceDetails.paragraphs[0]?.slice(0, 280) ||
        rawDesc.slice(0, 280) ||
        `Breaking development in Sierra Leone (${sourceName}): ${cleanTitle}`;

      return {
        id,
        title: cleanTitle,
        suggestedBlogTitle: `${cleanTitle}: What It Means for Sierra Leone's Tech Ecosystem`,
        category,
        source: sourceName,
        sourceUrl: resolvedUrl,
        pubDate: pubDateStr,
        summary: richSummary,
        keyFacts:
          extractedFacts.length > 0
            ? extractedFacts
            : [
                `Reported by ${sourceName} regarding Sierra Leone technology development.`,
                `Source Reference: ${resolvedUrl}`,
              ],
        extractedFacts,
        suggestedAngle: `Write a deeply reported feature examining every angle of this development in Sierra Leone.`,
        writingPrompt: `Write a comprehensive, deeply researched journalistic article about "${cleanTitle}" (Source: ${sourceName}, Reference URL: ${resolvedUrl}). Cover the full factual background, key stakeholders, technical/economic implications for Sierra Leone, and place BridgeTech IT Services' brief commentary solely at the very end immediately before the reference card.`,
        imageUrl,
        imageCaption,
        sourceImages: hasRealSourcePhotos
          ? sourceDetails.images.map((img) => ({ url: img.url, caption: img.caption }))
          : undefined,
        isLive: true,
      };
    });

    const settled = await Promise.all(parsedPromises);
    return settled.filter((item): item is SierraLeoneTechTopic => item !== null);
  } catch (error) {
    console.warn('[SL Tech News Finder] Live RSS fetch failed, relying on curated topics:', error);
    return [];
  }
}

/**
 * Get unified Sierra Leone tech topics, filtered by search query or category
 */
export async function getSierraLeoneTechNews(options: {
  query?: string;
  category?: string;
  forceLive?: boolean;
} = {}): Promise<{
  topics: SierraLeoneTechTopic[];
  total: number;
  categories: string[];
}> {
  const { query, category, forceLive } = options;

  let liveItems: SierraLeoneTechTopic[] = [];
  try {
    liveItems = await fetchLiveGoogleNewsSL(query, Boolean(forceLive));
  } catch {
    liveItems = [];
  }

  // Prioritize verified live Sierra Leone stories (especially those with real source photography), followed by curated dossiers
  const liveWithPhotos = liveItems.filter((item) => item.sourceImages && item.sourceImages.length > 0);
  const liveWithoutPhotos = liveItems.filter((item) => !item.sourceImages || item.sourceImages.length === 0);
  const combined = [...liveWithPhotos, ...CURATED_SL_TECH_TOPICS.slice(0, 1), ...liveWithoutPhotos, ...CURATED_SL_TECH_TOPICS.slice(1)];

  // Deduplicate by title similarity
  const seenTitles = new Set<string>();
  const uniqueTopics: SierraLeoneTechTopic[] = [];

  for (const item of combined) {
    const normalized = item.title.toLowerCase().replace(/[^a-z0-9]/g, ' ').slice(0, 35);
    if (!seenTitles.has(normalized)) {
      seenTitles.add(normalized);
      uniqueTopics.push(item);
    }
  }

  // Apply category filtering
  let filtered = uniqueTopics;
  if (category && category !== 'All Categories') {
    filtered = filtered.filter(item => item.category === category);
  }

  // Apply query filtering if user provided a specific search string
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keyFacts.some(f => f.toLowerCase().includes(q))
    );
  }

  return {
    topics: filtered,
    total: filtered.length,
    categories: [...SL_TECH_CATEGORIES],
  };
}

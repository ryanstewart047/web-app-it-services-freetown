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
    writingPrompt: "Investigate and write an in-depth journalistic feature about the US$21.9 Million mobile phone and electronics assembly plant MoU signed between Sierra Leone's Ministry of Communication, Technology and Innovation (MoCTI) and Unique Group at WAIIS 2026. Detail the factory plans, youth vocational training, regional export strategy, and local hardware repair perspective from BridgeTech IT Services at Jui Junction.",
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
    writingPrompt: "Write a comprehensive analytical blog post about Sierra Leone's National Digital Development Strategy (2025–2034) spearheaded by MoCTI Minister Salima Monorma Bah. Explain the pillars of universal connectivity, government digitalization, data sovereignty, and how local IT service providers like BridgeTech IT Services support enterprise digital readiness.",
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
    writingPrompt: "Write a practical and informative blog post detailing the new NaTCA Quality of Service (QoS) regulations and terrestrial fiber expansion in Sierra Leone. Discuss the impact on internet reliability for corporate offices and home workers, and offer advice from BridgeTech IT Services on enterprise routers, fiber failover switches, and local network optimization.",
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
    writingPrompt: "Write a comprehensive commercial and technical guide on satellite broadband (including Starlink and VSAT) in Sierra Leone. Cover the regulatory backdrop with NaTCA, installation requirements in coastal Freetown, power surge protection, and how BridgeTech IT Services helps businesses integrate satellite feeds into local enterprise LANs.",
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
    writingPrompt: "Write an engaging feature on the rise of mobile money interoperability (Orange Money & Afrimoney) and fintech innovation in Sierra Leone. Analyze the Bank of Sierra Leone's digital payment initiatives, the shift away from physical cash, and how retail businesses can integrate secure digital payment gateways with the help of BridgeTech IT Services.",
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557224d?auto=format&fit=crop&w=1200&q=80',
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
    writingPrompt: "Write an authoritative cybersecurity advisory for businesses and organizations in Sierra Leone. Highlight recent threats reported by NC3/MoCTI, explain why default router configurations and unlicensed software pose catastrophic risks, and detail a step-by-step security hardening blueprint provided by BridgeTech IT Services in Freetown.",
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
    writingPrompt: "Write a high-value practical guide on solving electrical power instability for computers, servers, and network equipment in Freetown, Sierra Leone. Explain how voltage spikes destroy delicate silicon circuits, compare Lead-Acid vs Lithium LiFePO4 batteries, and detail how solar hybrid inverter setups engineered by BridgeTech IT Services provide 24/7 clean power.",
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
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
    writingPrompt: "Write an inspiring, informative blog post on the explosion of youth coding bootcamps, university tech labs, and STEM innovation centers in Freetown, Sierra Leone. Discuss the skills in highest demand by local businesses, provide tips for self-taught programmers, and explain how BridgeTech IT Services mentors upcoming technicians and engineers.",
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
    writingPrompt: "Write a deeply informative technical and strategic blog post on submarine fiber optic cable resilience in Sierra Leone. Discuss the vulnerability of relying on a single subsea landing, analyze the push for secondary cable landings by MoCTI, and outline practical multi-WAN failover strategies that BridgeTech IT Services recommends for Freetown businesses.",
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'High-bandwidth undersea fiber optic communication cables connecting continents and nations.',
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
 * Fetch live Sierra Leone tech news from Google News RSS
 */
export async function fetchLiveGoogleNewsSL(searchQuery?: string): Promise<SierraLeoneTechTopic[]> {
  try {
    const defaultQuery = searchQuery 
      ? `"${searchQuery}" "Sierra Leone"`
      : `("Sierra Leone") AND (technology OR ICT OR digital OR telecom OR "MoCTI" OR "Salima Bah" OR smartphone OR fiber OR internet OR fintech)`;
      
    const encoded = encodeURIComponent(defaultQuery);
    const feedUrl = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      next: { revalidate: 3600 },
    } as any);
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const items: SierraLeoneTechTopic[] = [];
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    for (const itemXml of itemMatches.slice(0, 8)) {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);

      if (titleMatch && linkMatch) {
        const rawTitle = cleanXmlText(titleMatch[1]);
        const link = cleanXmlText(linkMatch[1]);
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

        // Assign curated photo by category
        let imageUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
        let imageCaption = 'Technology, innovation, and digital connectivity in West Africa.';

        if (category === 'Hardware & Assembly') {
          imageUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
          imageCaption = 'Electronics assembly line and precision diagnostics workstation.';
        } else if (category === 'Telecom & 4G/5G') {
          imageUrl = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80';
          imageCaption = 'Fiber optic communication cables and telecommunications switching equipment.';
        } else if (category === 'Digital Governance & MoCTI') {
          imageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
          imageCaption = 'Digital governance network interconnecting public services.';
        } else if (category === 'FinTech & Payments') {
          imageUrl = 'https://images.unsplash.com/photo-1556742049-0a67e557224d?auto=format&fit=crop&w=1200&q=80';
          imageCaption = 'Mobile digital payments and e-commerce transaction processing.';
        } else if (category === 'Cybersecurity & Enterprise') {
          imageUrl = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80';
          imageCaption = 'Enterprise network security defense and cyber threat monitoring.';
        } else if (category === 'Green Tech & Power') {
          imageUrl = 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80';
          imageCaption = 'Solar hybrid systems providing clean power to telecom and computer systems.';
        }

        const id = `live-${Buffer.from(cleanTitle.slice(0, 30)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;

        items.push({
          id,
          title: cleanTitle,
          suggestedBlogTitle: `${cleanTitle}: What It Means for Sierra Leone's Tech Ecosystem`,
          category,
          source: sourceName,
          sourceUrl: link,
          pubDate: pubDateStr,
          summary: rawDesc.slice(0, 280) || `Breaking development in Sierra Leone: ${cleanTitle}`,
          keyFacts: [
            `Reported by ${sourceName} regarding Sierra Leone technology development.`,
            `Direct relevance to Freetown's expanding digital infrastructure and economy.`,
            `Analyzed with local perspective from BridgeTech IT Services.`
          ],
          suggestedAngle: `Investigate how this recent development influences technology adoption, enterprise IT, and digital opportunities in Sierra Leone.`,
          writingPrompt: `Investigate and write an in-depth journalistic feature about "${cleanTitle}". Analyze its significance for Sierra Leone's digital infrastructure, cite statements from relevant authorities, and incorporate professional technology insights from BridgeTech IT Services at Jui Junction, Freetown.`,
          imageUrl,
          imageCaption,
          isLive: true,
        });
      }
    }

    return items;
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
    liveItems = await fetchLiveGoogleNewsSL(query);
  } catch {
    liveItems = [];
  }

  // Combine curated topics with live items (curated topics first for deep dossier richness)
  const combined = [...CURATED_SL_TECH_TOPICS, ...liveItems];

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

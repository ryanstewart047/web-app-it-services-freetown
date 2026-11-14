import { NextRequest, NextResponse } from 'next/server';
import {
  getJobApplications,
  getJobApplicationById,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
  getCareersStats,
  convertApplicantToPro,
  JobApplication,
} from '@/lib/careers-storage';
import { TRADE_CATEGORIES } from '@/lib/on-demand-categories';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

// Rich Job Details for the 20 Positions
const JOB_DEPARTMENTS: Record<string, {
  department: string;
  payEstimate: string;
  requirements: string[];
  keyTools: string[];
}> = {
  'printer-tech': {
    department: 'Digital & IT Hardware',
    payEstimate: 'Le 300 - Le 1,500 / job (Keep 85%)',
    requirements: ['HP, Canon, Epson, Ricoh experience', 'Error code troubleshooting', 'Printhead & roller repair'],
    keyTools: ['Precision screwdriver kit', 'Multimeter', 'Isopropyl cleaning kit', 'Spare test toners'],
  },
  'pc-laptop': {
    department: 'Digital & IT Hardware',
    payEstimate: 'Le 250 - Le 2,000 / job (Keep 85%)',
    requirements: ['Windows & macOS diagnostics', 'Motherboard & screen repair', 'Charging port soldering'],
    keyTools: ['Heat gun / soldering station', 'Anti-static mat & wristband', 'Bootable flash drives'],
  },
  'phone-tablet': {
    department: 'Digital & IT Hardware',
    payEstimate: 'Le 150 - Le 1,200 / job (Keep 85%)',
    requirements: ['iPhone & Android screen replacement', 'Battery & charging flex repair', 'Micro-soldering experience'],
    keyTools: ['Suction & pry tools', 'Curved tweezers', 'LCD separator or heat pad'],
  },
  'gaming-console': {
    department: 'Digital & IT Hardware',
    payEstimate: 'Le 300 - Le 1,800 / job (Keep 85%)',
    requirements: ['PS4, PS5, Xbox Series X/S diagnostics', 'HDMI port replacement', 'Overheating & thermal paste rework'],
    keyTools: ['Torx security bit set (T8/T9/T10)', 'Thermal paste / pads', 'Soldering iron'],
  },
  'cctv-security': {
    department: 'Digital & IT Hardware',
    payEstimate: 'Le 400 - Le 3,000 / job (Keep 85%)',
    requirements: ['Analog & IP camera cabling', 'DVR/NVR remote phone setup', 'Conduit and BNC crimping'],
    keyTools: ['Hammer drill & masonry bits', 'Cable crimper & tester', 'Step ladder'],
  },
  'networking-wifi': {
    department: 'Digital & IT Hardware',
    payEstimate: 'Le 350 - Le 2,500 / job (Keep 85%)',
    requirements: ['Mikrotik, Ubiquiti, TP-Link configuration', 'Office LAN trunking & patch panels', 'WiFi range extension'],
    keyTools: ['RJ45 crimper & toner tracer', 'Punch-down tool', 'Laptop for router configuration'],
  },
  'solar-inverter': {
    department: 'Electrical & Clean Energy',
    payEstimate: 'Le 500 - Le 4,000 / job (Keep 85%)',
    requirements: ['Hybrid inverter setup & sizing', 'Lithium & tubular battery banks', 'Solar panel roof mounting'],
    keyTools: ['DC clamp meter', 'Heavy-duty cable crimper', 'Safety harness for roof installations'],
  },
  'audio-visual': {
    department: 'Electrical & Clean Energy',
    payEstimate: 'Le 250 - Le 1,500 / job (Keep 85%)',
    requirements: ['TV wall mounting up to 85 inches', 'Surround sound & mixer cabling', 'Church/event PA system setup'],
    keyTools: ['Heavy stud finder & spirit level', 'Impact drill', 'Audio cable tester'],
  },
  'satellite-dstv': {
    department: 'Electrical & Clean Energy',
    payEstimate: 'Le 200 - Le 1,000 / job (Keep 85%)',
    requirements: ['DStv, Canal+, Free-to-Air dish alignment', 'LNB replacement & signal tracking', 'Multi-room RF distribution'],
    keyTools: ['Satellite digital signal finder meter', 'Compass & spanner kit', 'Coaxial compression tool'],
  },
  'electrician': {
    department: 'Electrical & Clean Energy',
    payEstimate: 'Le 300 - Le 2,500 / job (Keep 85%)',
    requirements: ['NPA/EDSA domestic & commercial wiring', 'Breaker panel & changeover switch install', 'Short circuit tracing'],
    keyTools: ['Digital multimeter & clamp meter', 'Insulated electricians pliers (1000V)', 'Conduit bender'],
  },
  'plumber': {
    department: 'Plumbing & Mechanical',
    payEstimate: 'Le 250 - Le 2,000 / job (Keep 85%)',
    requirements: ['PPR & PVC pipe hot welding', 'Overhead Geepee tank connection', 'Bathroom toilet & shower fitting'],
    keyTools: ['PPR pipe fusing machine', 'Pipe wrenches (14 & 18 inch)', 'Drain auger snake'],
  },
  'ac-refrigeration': {
    department: 'Plumbing & Mechanical',
    payEstimate: 'Le 400 - Le 2,500 / job (Keep 85%)',
    requirements: ['Split AC gas recharge (R410A / R32 / R22)', 'Compressor diagnostics & swap', 'Deep chemical coil washing'],
    keyTools: ['Manifold gauge set', 'Vacuum pump', 'Flaring tool kit & pressure washer'],
  },
  'generator-mechanic': {
    department: 'Plumbing & Mechanical',
    payEstimate: 'Le 350 - Le 3,500 / job (Keep 85%)',
    requirements: ['Diesel (Perkins, Cummins, Lister) & Petrol (Tiger, Elepaq)', 'AVR alternator voltage calibration', 'Oil, filter & injector servicing'],
    keyTools: ['Complete socket wrench set (metric & imperial)', 'Feeler gauge & compression tester', 'Filter strap wrench'],
  },
  'auto-electrician': {
    department: 'Plumbing & Mechanical',
    payEstimate: 'Le 300 - Le 2,500 / job (Keep 85%)',
    requirements: ['OBD2 computer diagnostics (Toyota, Honda, Benz)', 'Alternator & starter motor rebuild', 'Vehicle harness rewiring'],
    keyTools: ['OBD-II diagnostic scanner', 'Automotive test light & multimeter', 'Wire terminal pin extractor kit'],
  },
  'appliance-repair': {
    department: 'Plumbing & Mechanical',
    payEstimate: 'Le 250 - Le 1,800 / job (Keep 85%)',
    requirements: ['Automatic washing machine PCB & motor repair', 'Microwave magnetron & high-voltage diode', 'Electric oven & water heater elements'],
    keyTools: ['Insulated screwdrivers & pliers', 'Capacitor discharge tool', 'Digital multimeter with continuity beep'],
  },
  'water-pump-borehole': {
    department: 'Plumbing & Mechanical',
    payEstimate: 'Le 450 - Le 3,500 / job (Keep 85%)',
    requirements: ['Submersible borehole pump pull & drop', 'Surface pressure booster pump servicing', 'Float switch & automatic pump control box'],
    keyTools: ['Tripod or rope hoist', 'Heavy pipe grips', 'Megohmmeter for motor insulation check'],
  },
  'welder-metal': {
    department: 'Construction & Finishing',
    payEstimate: 'Le 350 - Le 3,000 / job (Keep 85%)',
    requirements: ['ARC / MIG welding & metal fabrication', 'Security burglar bars & gate fabrication', 'Staircase railing & metal roofing trusses'],
    keyTools: ['Inverter welding machine', 'Angle grinder with cutting & grinding discs', 'Auto-darkening helmet & clamps'],
  },
  'carpenter': {
    department: 'Construction & Finishing',
    payEstimate: 'Le 300 - Le 2,500 / job (Keep 85%)',
    requirements: ['Kitchen cabinet & wardrobe installation', 'Roof timbering & ceiling installation', 'Door hanging & mortise lock fixing'],
    keyTools: ['Circular saw & jigsaw', 'Electric planer & chisels', 'Spirit level & speed square'],
  },
  'mason-builder': {
    department: 'Construction & Finishing',
    payEstimate: 'Le 300 - Le 2,500 / job (Keep 85%)',
    requirements: ['Porcelain & ceramic tile laying with clean joints', 'Plastering & concrete screeding', 'Bricklaying & structural repairs'],
    keyTools: ['Manual tile cutter & angle grinder', 'Notched trowels & floats', 'Laser level or water tube'],
  },
  'painter': {
    department: 'Construction & Finishing',
    payEstimate: 'Le 250 - Le 2,000 / job (Keep 85%)',
    requirements: ['Interior & exterior wall preparation', 'Screeding / skim coating & putty smoothing', 'Clean edging, spray & roller painting'],
    keyTools: ['High-quality rollers & edge brushes', 'Putty knives & scrapers', 'Drop cloths & extension poles'],
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'jobs';

    // 1. Return Open Jobs Catalog
    if (type === 'jobs') {
      const jobs = TRADE_CATEGORIES.map(cat => {
        const details = JOB_DEPARTMENTS[cat.id] || {
          department: cat.type === 'tech' ? 'Digital & IT Hardware' : 'Trades & Craftsmanship',
          payEstimate: 'Le 250 - Le 2,000 / job (Keep 85%)',
          requirements: ['1+ years practical craftsmanship', 'Standard trade tools', 'Valid national ID'],
          keyTools: ['Basic toolkit', 'Smartphone'],
        };

        return {
          id: cat.id,
          title: cat.title,
          subtitle: cat.subtitle,
          department: details.department,
          icon: cat.icon,
          color: cat.color,
          badge: cat.badge,
          type: cat.type,
          image: cat.image,
          payEstimate: details.payEstimate,
          requirements: details.requirements,
          keyTools: details.keyTools,
          location: 'Freetown & Western Area, Sierra Leone',
          openPositions: 'Immediate Openings (All 20 Categories)',
        };
      });

      return NextResponse.json({ success: true, jobs }, { headers: NO_CACHE_HEADERS });
    }

    // 2. Return Recruitment Stats for Admin
    if (type === 'stats') {
      const stats = await getCareersStats();
      return NextResponse.json({ success: true, stats }, { headers: NO_CACHE_HEADERS });
    }

    // 3. Return Single Application
    if (type === 'application') {
      const id = searchParams.get('id');
      if (!id) {
        return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
      }
      const app = await getJobApplicationById(id);
      if (!app) {
        return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, application: app }, { headers: NO_CACHE_HEADERS });
    }

    // 4. Return Filtered Applications List
    if (type === 'applications') {
      const status = searchParams.get('status') || undefined;
      const jobId = searchParams.get('jobId') || undefined;
      const locationArea = searchParams.get('locationArea') || undefined;
      const search = searchParams.get('search') || undefined;

      const [applications, stats] = await Promise.all([
        getJobApplications({ status, jobId, locationArea, search }),
        getCareersStats(),
      ]);

      return NextResponse.json({
        success: true,
        applications,
        stats,
      }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: false, error: 'Invalid type parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('[Careers API] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // ── 1. Submit New Job Application (Candidate Public Apply) ─────────────
    if (action === 'apply' || !action) {
      const {
        jobId,
        jobTitle,
        fullName,
        phone,
        whatsapp,
        email,
        gender,
        dateOfBirth,
        locationArea,
        residentialAddress,
        yearsExperience,
        secondarySkills,
        toolOwnership,
        transportMode,
        availability,
        workSummary,
        pastWorkPhotos,
        nationalIdNumber,
        idCardPhoto,
        certificatePhoto,
        resumeUrlOrData,
        mobileMoneyProvider,
        mobileMoneyNumber,
      } = body;

      // Validation
      if (!fullName || !fullName.trim()) {
        return NextResponse.json({ success: false, error: 'Full name is required' }, { status: 400 });
      }
      if (!phone || !phone.trim()) {
        return NextResponse.json({ success: false, error: 'Active phone number is required' }, { status: 400 });
      }
      if (!jobId || !jobId.trim()) {
        return NextResponse.json({ success: false, error: 'Please select the job role you are applying for' }, { status: 400 });
      }
      if (!residentialAddress || !residentialAddress.trim()) {
        return NextResponse.json({ success: false, error: 'Residential address in Freetown is mandatory' }, { status: 400 });
      }

      // Resolve Job Title
      const resolvedJob = TRADE_CATEGORIES.find(c => c.id === jobId);
      const finalJobTitle = jobTitle || resolvedJob?.title || 'Specialized Technician';

      const application = await createJobApplication({
        jobId,
        jobTitle: finalJobTitle,
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp ? whatsapp.trim() : undefined,
        email: email ? email.trim() : undefined,
        gender: gender || 'unspecified',
        dateOfBirth: dateOfBirth || undefined,
        locationArea: locationArea || 'Central Freetown',
        residentialAddress: residentialAddress.trim(),
        yearsExperience: yearsExperience || '1-2',
        secondarySkills: secondarySkills ? secondarySkills.trim() : undefined,
        toolOwnership: toolOwnership || 'basic_tools',
        transportMode: transportMode || 'commercial',
        availability: availability || 'immediate_fulltime',
        workSummary: workSummary ? workSummary.trim() : undefined,
        pastWorkPhotos: Array.isArray(pastWorkPhotos) ? pastWorkPhotos : [],
        nationalIdNumber: nationalIdNumber ? nationalIdNumber.trim() : undefined,
        idCardPhoto: idCardPhoto || undefined,
        certificatePhoto: certificatePhoto || undefined,
        resumeUrlOrData: resumeUrlOrData || undefined,
        mobileMoneyProvider: mobileMoneyProvider || 'orange',
        mobileMoneyNumber: (mobileMoneyNumber || phone).trim(),
      });

      return NextResponse.json({
        success: true,
        trackingId: application.id,
        application,
        message: 'Your job application has been successfully submitted! Our hiring team will contact you for an interview within 48 to 72 hours.',
      }, { headers: NO_CACHE_HEADERS });
    }

    // ── 2. Admin: Update Candidate Status & Notes ───────────────────────────
    if (action === 'update_status') {
      const { id, status, adminNotes, rating, interviewDate } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
      }

      const updated = await updateJobApplication(id, {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        ...(rating !== undefined ? { rating: Number(rating) } : {}),
        ...(interviewDate !== undefined ? { interviewDate } : {}),
      });

      if (!updated) {
        return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
      }

      const stats = await getCareersStats();
      return NextResponse.json({
        success: true,
        application: updated,
        stats,
        message: 'Application updated successfully',
      }, { headers: NO_CACHE_HEADERS });
    }

    // ── 3. Admin: Convert Candidate to Active OnDemandPro ──────────────────
    if (action === 'convert_to_pro') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
      }

      const result = await convertApplicantToPro(id);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      const stats = await getCareersStats();
      return NextResponse.json({
        success: true,
        pro: result.pro,
        stats,
        message: `Candidate successfully onboarded as Pro #${result.pro?.id}!`,
      }, { headers: NO_CACHE_HEADERS });
    }

    // ── 4. Admin: Delete Application Permanently ────────────────────────────
    if (action === 'delete_application') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
      }

      const success = await deleteJobApplication(id);
      const stats = await getCareersStats();

      return NextResponse.json({
        success,
        stats,
        message: 'Application deleted permanently',
      }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('[Careers API] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

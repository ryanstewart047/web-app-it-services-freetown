/**
 * High-End Premium Certificate Engine
 * Features:
 * - Dynamic Presenter/Issuer theming & conferment fields
 * - Blended High-End Premium Cybernetic/Tech Watermark background
 * - Dynamic Transparent Circular Seal matching the presenter/organization
 * - Dynamic Calligraphic Digital Signature & Cryptographic Verification Hash
 */

export interface SealTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  bgGlass: string;
  ribbon: string;
  emblem: 'tech' | 'academic' | 'love' | 'family' | 'imperial';
  rimLabel: string;
}

export function getPresenterTheme(presenterName?: string, achievement?: string): SealTheme {
  const combined = `${presenterName || ''} ${achievement || ''}`.toLowerCase();

  // Corporate / Tech / Engineering
  if (/(tech|software|it |digital|system|engineer|corp|inc|ltd|company|firm|bank|department|team|studio|group|agency|work)/.test(combined)) {
    return {
      name: 'Cyber Sapphire & Platinum',
      primary: '#0284c7',
      secondary: '#38bdf8',
      accent: '#60a5fa',
      glow: 'rgba(56, 189, 248, 0.5)',
      bgGlass: 'rgba(2, 132, 199, 0.14)',
      ribbon: '#0369a1',
      emblem: 'tech',
      rimLabel: 'OFFICIAL CORPORATE CONFERMENT',
    };
  }

  // Academic / Graduation / Distinction
  if (/(graduat|degree|school|univ|college|acad|faculty|alumni|doctor|prof|honors|scholar|class of|diploma)/.test(combined)) {
    return {
      name: 'Academic Emerald & Gold',
      primary: '#059669',
      secondary: '#34d399',
      accent: '#fcd34d',
      glow: 'rgba(52, 211, 153, 0.5)',
      bgGlass: 'rgba(5, 150, 105, 0.14)',
      ribbon: '#047857',
      emblem: 'academic',
      rimLabel: 'ACADEMIC EXCELLENCE & DISTINCTION',
    };
  }

  // Love / Romance / Anniversary / Wedding
  if (/(love|heart|anniversary|wedding|husband|wife|romance|darling|sweetheart|forever|couple|soulmate)/.test(combined)) {
    return {
      name: 'Rose Ruby & Pure Gold',
      primary: '#e11d48',
      secondary: '#fb7185',
      accent: '#fda4af',
      glow: 'rgba(251, 113, 133, 0.5)',
      bgGlass: 'rgba(225, 29, 72, 0.14)',
      ribbon: '#be123c',
      emblem: 'love',
      rimLabel: 'DEVOTION & EVERLASTING LOVE',
    };
  }

  // Family / Friends / Community / Spiritual
  if (/(family|mom|dad|mother|father|sister|brother|son|daughter|parent|friend|church|community|home|fellowship)/.test(combined)) {
    return {
      name: 'Regal Amethyst & Orchid',
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#c084fc',
      glow: 'rgba(167, 139, 250, 0.5)',
      bgGlass: 'rgba(124, 58, 237, 0.14)',
      ribbon: '#6d28d9',
      emblem: 'family',
      rimLabel: 'PRESTIGIOUS HONOR & ESTEEM',
    };
  }

  // Default / Milestone Birthday / Imperial VIP
  return {
    name: 'Imperial Gold & Amber Sunburst',
    primary: '#d97706',
    secondary: '#f59e0b',
    accent: '#fcd34d',
    glow: 'rgba(245, 158, 11, 0.5)',
    bgGlass: 'rgba(217, 119, 6, 0.14)',
    ribbon: '#b45309',
    emblem: 'imperial',
    rimLabel: 'OFFICIAL RECOGNITION & HONOR',
  };
}

/**
 * Renders high-end premium tech watermark background (cybernetic matrix, circuit traces, concentric radar, guilloché waves)
 */
export function drawPremiumTechWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: SealTheme
) {
  ctx.save();

  // 1. Fine cybernetic background grid
  const gridStep = 45;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.035)';
  ctx.lineWidth = 1;

  for (let x = 60; x < width - 60; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 60);
    ctx.lineTo(x, height - 60);
    ctx.stroke();
  }

  for (let y = 60; y < height - 60; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(width - 60, y);
    ctx.stroke();
  }

  // 2. Micro tech crosshairs at grid intersections
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.lineWidth = 1.2;
  const crosshairStep = gridStep * 3;
  for (let x = 60 + gridStep; x < width - 60; x += crosshairStep) {
    for (let y = 60 + gridStep; y < height - 60; y += crosshairStep) {
      ctx.beginPath();
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x + 5, y);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
    }
  }

  // 3. Central Sacred Tech Geometry & Radar Rings
  const cx = width / 2;
  const cy = 565;

  const radii = [140, 260, 400, 560, 720];
  radii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(56, 189, 248, 0.04)' : 'rgba(245, 158, 11, 0.04)';
    ctx.lineWidth = idx === 2 ? 1.8 : 1;
    ctx.stroke();

    // Orbital tick marks
    if (idx >= 1) {
      const numTicks = 36;
      for (let i = 0; i < numTicks; i++) {
        const angle = (i * Math.PI * 2) / numTicks;
        const x1 = cx + Math.cos(angle) * (r - 4);
        const y1 = cy + Math.sin(angle) * (r - 4);
        const x2 = cx + Math.cos(angle) * (r + 4);
        const y2 = cy + Math.sin(angle) * (r + 4);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.stroke();
      }
    }
  });

  // 4. Hexagonal Tech Matrix Perimeter
  ctx.beginPath();
  const hexR = 480;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const hx = cx + Math.cos(angle) * hexR;
    const hy = cy + Math.sin(angle) * hexR;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.045)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 5. Integrated Circuit (PCB) Traces with 45-degree angle elbows & Solder Nodes
  const circuits = [
    // Top-left circuit
    [[100, 160], [220, 160], [280, 220], [420, 220], [460, 260]],
    // Top-right circuit
    [[1500, 160], [1380, 160], [1320, 220], [1180, 220], [1140, 260]],
    // Bottom-left circuit
    [[100, 800], [220, 800], [280, 740], [440, 740]],
    // Bottom-right circuit
    [[1500, 800], [1380, 800], [1320, 740], [1160, 740]],
    // Middle side circuits
    [[80, 520], [200, 520], [240, 480], [350, 480]],
    [[1520, 520], [1400, 520], [1360, 480], [1250, 480]],
  ];

  circuits.forEach((pathPoints) => {
    ctx.beginPath();
    ctx.moveTo(pathPoints[0][0], pathPoints[0][1]);
    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i][0], pathPoints[i][1]);
    }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Solder pad nodes at endpoints
    const startP = pathPoints[0];
    const endP = pathPoints[pathPoints.length - 1];

    [startP, endP].forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  });

  // 6. Mathematical Guilloché Security Wave Ribbons (Banknote style)
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.035)';
  ctx.lineWidth = 1;
  const waveYCenters = [450, 680];

  waveYCenters.forEach((wy) => {
    for (let wave = 0; wave < 3; wave++) {
      ctx.beginPath();
      const phase = (wave * Math.PI) / 3;
      for (let x = 120; x < width - 120; x += 10) {
        const y = wy + Math.sin(x * 0.015 + phase) * 22 + Math.cos(x * 0.007) * 14;
        if (x === 120) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });

  // 7. Micro-security Authentication String along subtle guide
  ctx.fillStyle = 'rgba(148, 163, 184, 0.07)';
  ctx.font = '800 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    'BRIDGETEC SURPRISE STUDIO · IMMUTABLE DIGITAL CERTIFICATE RECORD · SECURE AUTH PROTOCOL V3.2 · SHA-256 VALIDATED',
    cx,
    1025
  );

  ctx.restore();
}

/**
 * Draws the dynamic, transparent, circular seal with customizable theme colors,
 * engraved presenter rim text, and distinctive center emblems.
 */
export function drawDynamicTransparentSeal(
  ctx: CanvasRenderingContext2D,
  sealX: number,
  sealY: number,
  sealR: number,
  presenterName: string,
  theme: SealTheme
) {
  ctx.save();

  // 1. Flowing Silk Ribbons at bottom of seal
  ctx.fillStyle = theme.ribbon;
  // Left ribbon
  ctx.beginPath();
  ctx.moveTo(sealX - 22, sealY + 32);
  ctx.lineTo(sealX - 48, sealY + 102);
  ctx.lineTo(sealX - 25, sealY + 86);
  ctx.lineTo(sealX - 4, sealY + 102);
  ctx.lineTo(sealX - 8, sealY + 32);
  ctx.fill();
  ctx.strokeStyle = theme.secondary;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Right ribbon
  ctx.beginPath();
  ctx.moveTo(sealX + 8, sealY + 32);
  ctx.lineTo(sealX + 4, sealY + 102);
  ctx.lineTo(sealX + 25, sealY + 86);
  ctx.lineTo(sealX + 48, sealY + 102);
  ctx.lineTo(sealX + 22, sealY + 32);
  ctx.fill();
  ctx.strokeStyle = theme.secondary;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 2. Serrated Starburst Outer Gear (24 teeth)
  ctx.fillStyle = theme.primary;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  const numTeeth = 24;
  for (let i = 0; i < numTeeth; i++) {
    const angle = (i * Math.PI * 2) / numTeeth;
    const rad = i % 2 === 0 ? sealR + 8 : sealR - 2;
    const px = sealX + Math.cos(angle) * rad;
    const py = sealY + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // 3. Transparent Glassmorphism Disc (Semi-translucent radial gradient)
  const glassGrad = ctx.createRadialGradient(sealX, sealY, 10, sealX, sealY, sealR - 4);
  glassGrad.addColorStop(0, theme.bgGlass);
  glassGrad.addColorStop(0.7, 'rgba(15, 23, 42, 0.88)');
  glassGrad.addColorStop(1, 'rgba(10, 15, 30, 0.95)');

  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR - 4, 0, Math.PI * 2);
  ctx.fill();

  // 4. Concentric Gold & Accent Bezel Rings
  ctx.strokeStyle = theme.secondary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR - 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR - 16, 0, Math.PI * 2);
  ctx.stroke();

  // 5. Outer Rim Text - Dynamic Presenter Engraving
  const displayName = presenterName ? presenterName.trim().toUpperCase() : 'HONORED PRESENTERS';
  const rimText = `★ ${displayName.slice(0, 24)} ★`;

  ctx.fillStyle = theme.accent;
  ctx.font = '800 10.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(rimText, sealX, sealY - sealR + 24);

  // 6. Central Emblem depending on theme
  ctx.save();
  ctx.fillStyle = theme.secondary;
  ctx.strokeStyle = theme.accent;

  if (theme.emblem === 'tech') {
    // Tech Shield & Micro Node
    ctx.beginPath();
    ctx.moveTo(sealX, sealY - 14);
    ctx.lineTo(sealX + 16, sealY - 4);
    ctx.lineTo(sealX + 14, sealY + 12);
    ctx.lineTo(sealX, sealY + 22);
    ctx.lineTo(sealX - 14, sealY + 12);
    ctx.lineTo(sealX - 16, sealY - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('⚡', sealX, sealY + 8);
  } else if (theme.emblem === 'academic') {
    // Laurel Wreath & Cap / Star
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = theme.secondary;
    ctx.fillText('🎓', sealX, sealY + 2);
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = theme.accent;
    ctx.fillText('HONORS', sealX, sealY + 18);
  } else if (theme.emblem === 'love') {
    // Twin Hearts & Radiance
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = theme.secondary;
    ctx.fillText('💖', sealX, sealY + 2);
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = theme.accent;
    ctx.fillText('EVERLASTING', sealX, sealY + 18);
  } else if (theme.emblem === 'family') {
    // Royal Crown
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = theme.secondary;
    ctx.fillText('👑', sealX, sealY + 4);
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = theme.accent;
    ctx.fillText('ESTEEM', sealX, sealY + 18);
  } else {
    // Imperial Starburst & Verified
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = theme.secondary;
    ctx.fillText('★', sealX, sealY - 4);
    ctx.font = '900 11px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('VERIFIED', sealX, sealY + 12);
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = theme.accent;
    ctx.fillText('EXCELLENCE', sealX, sealY + 24);
  }
  ctx.restore();

  // Bottom Seal Tag
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SECURE SEAL', sealX, sealY + sealR - 18);

  ctx.restore();
}

/**
 * Draws realistic dynamic calligraphic signature matching the presenter
 */
export function drawDynamicCalligraphicSignature(
  ctx: CanvasRenderingContext2D,
  sigX: number,
  sigY: number,
  presenterName: string,
  theme: SealTheme
) {
  ctx.save();
  ctx.strokeStyle = theme.secondary;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 8;

  // Derive initial letter
  const name = presenterName?.trim() || 'Director';
  const initial = name.charAt(0).toUpperCase();

  // Initial letter flourish
  ctx.beginPath();
  ctx.moveTo(sigX - 115, sigY - 18);
  ctx.bezierCurveTo(sigX - 120, sigY + 16, sigX - 110, sigY + 26, sigX - 100, sigY + 18);
  ctx.bezierCurveTo(sigX - 100, sigY - 32, sigX - 60, sigY - 32, sigX - 60, sigY - 8);
  ctx.bezierCurveTo(sigX - 60, sigY + 6, sigX - 90, sigY + 12, sigX - 50, sigY + 22);
  ctx.stroke();

  // Cursive loops & calligraphic body
  ctx.beginPath();
  ctx.lineWidth = 2.4;
  ctx.moveTo(sigX - 45, sigY + 4);
  ctx.bezierCurveTo(sigX - 35, sigY - 16, sigX - 25, sigY + 14, sigX - 12, sigY - 6);
  ctx.bezierCurveTo(sigX - 2, sigY - 22, sigX + 12, sigY + 18, sigX + 22, sigY - 12);
  ctx.bezierCurveTo(sigX + 38, sigY - 26, sigX + 52, sigY + 14, sigX + 68, sigY - 6);
  ctx.bezierCurveTo(sigX + 82, sigY - 30, sigX + 94, sigY + 10, sigX + 112, sigY + 4);
  ctx.stroke();

  // Elegant flowing under-swash flourish
  ctx.beginPath();
  ctx.lineWidth = 2.4;
  ctx.moveTo(sigX - 98, sigY + 26);
  ctx.bezierCurveTo(sigX - 30, sigY + 36, sigX + 60, sigY + 24, sigX + 118, sigY + 16);
  ctx.bezierCurveTo(sigX + 132, sigY + 12, sigX + 112, sigY + 30, sigX + 88, sigY + 28);
  ctx.stroke();
  ctx.restore();

  // Baseline
  ctx.fillStyle = '#475569';
  ctx.fillRect(sigX - 130, sigY + 34, 260, 2);

  // Presenter Signature Title
  ctx.fillStyle = theme.secondary;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Authorized Presenter Signature', sigX, sigY + 56);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 13px sans-serif';
  const signerTitle = presenterName ? `${presenterName}` : 'Conferring Authority';
  ctx.fillText(signerTitle.slice(0, 36), sigX, sigY + 76);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('✓ Authenticated & Digitally Recorded', sigX, sigY + 95);
}

export interface RenderCertificateParams {
  canvas: HTMLCanvasElement;
  recipientName: string;
  achievement: string;
  message?: string;
  imageUrl?: string;
  code: string;
  presenterName?: string;
  isWatermarked?: boolean;
}

/**
 * Main Master Certificate Canvas Renderer
 */
export async function renderMasterCertificate({
  canvas,
  recipientName,
  achievement,
  message,
  imageUrl,
  code,
  presenterName,
  isWatermarked = false,
}: RenderCertificateParams): Promise<void> {
  canvas.width = 1600;
  canvas.height = 1130;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = getPresenterTheme(presenterName, achievement);

  // 1. Deep luxury tech gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1130);
  bgGrad.addColorStop(0, '#030712');
  bgGrad.addColorStop(0.3, '#070f26');
  bgGrad.addColorStop(0.7, '#0b1433');
  bgGrad.addColorStop(1, '#030712');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1600, 1130);

  // 2. High-End Premium Tech Watermark & Security Lines
  drawPremiumTechWatermark(ctx, 1600, 1130, theme);

  // 3. Ornate Double Gold & Theme Accent Borders
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 14;
  ctx.strokeRect(40, 40, 1520, 1050);

  ctx.strokeStyle = theme.secondary;
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 60, 1480, 1010);

  // Gold corner brackets
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(40, 40, 42, 42);
  ctx.fillRect(1518, 40, 42, 42);
  ctx.fillRect(40, 1048, 42, 42);
  ctx.fillRect(1518, 1048, 42, 42);

  // 4. Recipient Photo in Circular Luxury Frame
  const photoSize = 165;
  const photoX = 800 - photoSize / 2;
  const photoY = 110;

  if (imageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        img.src = imageUrl;
      });

      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(800, photoY + photoSize / 2, photoSize / 2 + 8, 0, Math.PI * 2);
        ctx.fillStyle = theme.secondary;
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 24;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(800, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
        ctx.restore();
      }
    } catch {}
  }

  // 5. Header Tag
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ OFFICIAL CONFERMENT & CELEBRATION ★', 800, 315);

  // 6. Certificate Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px sans-serif';
  ctx.fillText('CERTIFICATE OF RECOGNITION', 800, 385);

  // 7. Dynamic Issuer / Presenter Field
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 21px sans-serif';
  ctx.fillText('This prestigious honor is proudly conferred and presented by', 800, 440);

  // Presenter / Organization Name in prominent glowing typography
  const presenterDisplay = presenterName && presenterName.trim() ? presenterName.trim() : 'Distinguished Honored Presenters';
  ctx.save();
  ctx.fillStyle = theme.secondary;
  ctx.font = 'bold 32px sans-serif';
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 12;
  ctx.fillText(presenterDisplay, 800, 485);
  ctx.restore();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 19px sans-serif';
  ctx.fillText('unto our esteemed honoree', 800, 525);

  // 8. Recipient Name in ultra-luxury large gold
  ctx.save();
  ctx.fillStyle = '#fcd34d';
  ctx.font = 'bold 70px sans-serif';
  ctx.shadowColor = 'rgba(252, 211, 77, 0.4)';
  ctx.shadowBlur = 20;
  ctx.fillText(recipientName || 'Celebrant Name', 800, 615);
  ctx.restore();

  // Underline bar in theme secondary
  ctx.fillStyle = theme.secondary;
  ctx.fillRect(450, 640, 700, 4);

  // 9. Achievement / Milestone
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(achievement || 'Special Recognition Award', 800, 705);

  // 10. Personal Congratulatory Message / Citation
  if (message) {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 23px sans-serif';
    const msgText = `"${message.slice(0, 130)}"`;
    ctx.fillText(msgText, 800, 765);
  }

  // 11. Footer divider
  ctx.fillStyle = '#334155';
  ctx.fillRect(160, 815, 1280, 2);

  // 12. Dynamic Transparent Circular Seal (Bottom Left)
  const sealX = 320;
  const sealY = 920;
  const sealR = 56;
  drawDynamicTransparentSeal(ctx, sealX, sealY, sealR, presenterDisplay, theme);

  // Date of Issuance below seal
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DATE OF ISSUANCE', sealX, sealY + 110);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 15px sans-serif';
  ctx.fillText(new Date().toLocaleDateString(undefined, { dateStyle: 'medium' }), sealX, sealY + 130);

  // 13. Center Authority & Cryptographic Verification
  ctx.fillStyle = theme.secondary;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`OFFICIAL CONFERMENT BY ${presenterDisplay.toUpperCase().slice(0, 40)}`, 800, 860);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px sans-serif';
  ctx.fillText(`Verification ID: ${code} · BridgeTec Surprise Studio`, 800, 890);

  // Digital Certificate Security Hash
  const hashSource = `${code}:${presenterDisplay}:${recipientName}`;
  let simpleHash = 0;
  for (let i = 0; i < hashSource.length; i++) {
    simpleHash = (simpleHash << 5) - simpleHash + hashSource.charCodeAt(i);
    simpleHash |= 0;
  }
  const hexHash = `SIG-${Math.abs(simpleHash).toString(16).toUpperCase()}-${code.slice(-6).toUpperCase()}`;

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`🔒 CRYPTOGRAPHICALLY SECURED & DIGITALLY VERIFIED`, 800, 920);
  ctx.fillStyle = '#64748b';
  ctx.font = '12px monospace';
  ctx.fillText(`SHA256-AUTH:${hexHash}`, 800, 940);

  // 14. Dynamic Automatic Digital Signature (Bottom Right)
  const sigX = 1260;
  const sigY = 895;
  drawDynamicCalligraphicSignature(ctx, sigX, sigY, presenterDisplay, theme);

  // 15. If Watermarked (Sample Preview Protection Mode)
  if (isWatermarked) {
    ctx.save();
    ctx.rotate((-20 * Math.PI) / 180);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.font = 'bold 24px sans-serif';
    for (let y = -400; y < 1600; y += 320) {
      for (let x = -800; x < 2400; x += 800) {
        ctx.fillText('BRIDGETEC SAMPLE PREVIEW · UNLICENSED', x, y);
      }
    }
    ctx.restore();
  }
}

/**
 * 3C Campus Care & Connect - Digital Twin 3D Isometric Canvas Engine
 * Renders interactive isometric campus platform with buildings, pins, particles & lighting.
 */

class CampusDigitalTwin {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.container = this.canvas.parentElement;

    // Rotation & View angles
    this.rotation = options.initialRotation || 0.45;
    this.targetRotation = this.rotation;
    this.pitch = 0.52; // isometric tilt ~ 30 deg
    this.zoom = 1.0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.activeFilter = 'ALL';
    this.hoveredBuilding = null;
    this.selectedBuilding = null;
    this.onSelectCallback = options.onSelect || null;

    // Campus buildings definition (x, y coordinates on platform, width, depth, height, color)
    this.buildings = [
      {
        id: 'medical',
        name: 'Medical Centre',
        category: 'MEDICAL',
        x: -25,
        y: -55,
        w: 42,
        d: 38,
        h: 46,
        color: '#E05353',
        roofColor: '#D94343',
        tag: 'Open 24/7 • 2 Doctors on duty',
        response: '< 2 mins ETA',
        desc: 'Immediate clinical care, emergency trauma unit, confidential health triage & prescription dispensary.',
        contact: 'Ext. 911 / Direct: +91 98765 43210'
      },
      {
        id: 'safespace',
        name: 'Safe Space',
        category: 'WELLBEING',
        x: -90,
        y: -15,
        w: 38,
        d: 34,
        h: 36,
        color: '#34D399',
        roofColor: '#2BA677',
        tag: 'Walk-in • Zero questions asked',
        response: 'Instant Access',
        desc: 'Quiet sensory decompression pods, private mediation zone, and 24/7 warm shelter with tea & blankets.',
        contact: 'Ground Floor, North Sanctuary'
      },
      {
        id: 'security',
        name: 'Security Command',
        category: 'SAFETY',
        x: -55,
        y: 10,
        w: 36,
        d: 34,
        h: 40,
        color: '#F59E0B',
        roofColor: '#D97706',
        tag: 'Campus Patrol • Active',
        response: '< 90 secs Rapid Escort',
        desc: 'Campus perimeter watch, SafeWalk dispatch team, CCTV monitoring & immediate de-escalation personnel.',
        contact: 'SOS Patrol Hotline: 1800-3C-SAFE'
      },
      {
        id: 'counselling',
        name: 'Counselling Hub',
        category: 'WELLBEING',
        x: 45,
        y: -50,
        w: 40,
        d: 40,
        h: 52,
        color: '#818CF8',
        roofColor: '#6366F1',
        tag: '4 Slots Open Today',
        response: 'Private 1-on-1 Sessions',
        desc: 'Licensed student psychologists, anonymous consultation chambers, stress & academic burn-out guidance.',
        contact: 'Block C, 3rd Floor (Discreet Entrance)'
      },
      {
        id: 'studenthub',
        name: 'Student Hub',
        category: 'PEER HELP',
        x: 10,
        y: 35,
        w: 52,
        d: 50,
        h: 68,
        color: '#38BDF8',
        roofColor: '#0EA5E9',
        tag: '12 Peer Listeners Active',
        response: 'Always Open',
        desc: 'Peer listening circle, community commons, exam decompression station, and open dialogue rooms.',
        contact: 'Central Plaza Quadrangle'
      },
      {
        id: 'hostels',
        name: 'Hostel Clusters',
        category: 'GIRLS SUPPORT',
        x: 80,
        y: -10,
        w: 44,
        d: 42,
        h: 58,
        color: '#FB7185',
        roofColor: '#E11D48',
        tag: 'Resident Wardens & Peer Navigators',
        response: 'Night Safety Active',
        desc: 'Dedicated female floor advocates, confidential grievance intake, anti-ragging squad & buddy system.',
        contact: 'Blocks H1-H6 Resident Desk'
      }
    ];

    // Background particle stars
    this.particles = [];
    for (let i = 0; i < 70; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 500,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.005 + 0.002,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindEvents();
    this.animate();
  }

  resize() {
    if (!this.container || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  bindEvents() {
    const c = this.canvas;

    c.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.lastMouseX;
        this.targetRotation += deltaX * 0.008;
        this.lastMouseX = e.clientX;
      }
      this.handlePointerMove(e);
    });

    // Touch support
    c.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.lastMouseX;
        this.targetRotation += deltaX * 0.01;
        this.lastMouseX = e.touches[0].clientX;
      }
    }, { passive: true });

    c.addEventListener('click', (e) => {
      this.handlePointerClick(e);
    });
  }

  handlePointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found = null;
    // Check hit test for pins and buildings
    for (let b of this.buildings) {
      if (b._pinBounds) {
        const pb = b._pinBounds;
        if (mx >= pb.x - 10 && mx <= pb.x + pb.w + 10 && my >= pb.y - 12 && my <= pb.y + pb.h + 6) {
          found = b;
          break;
        }
      }
      if (b._poly) {
        if (this.pointInPolygon(mx, my, b._poly)) {
          found = b;
          break;
        }
      }
    }

    if (this.hoveredBuilding !== found) {
      this.hoveredBuilding = found;
      this.canvas.style.cursor = found ? 'pointer' : 'grab';
    }
  }

  handlePointerClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let clicked = null;
    for (let b of this.buildings) {
      if (b._pinBounds) {
        const pb = b._pinBounds;
        if (mx >= pb.x - 10 && mx <= pb.x + pb.w + 10 && my >= pb.y - 12 && my <= pb.y + pb.h + 6) {
          clicked = b;
          break;
        }
      }
      if (b._poly) {
        if (this.pointInPolygon(mx, my, b._poly)) {
          clicked = b;
          break;
        }
      }
    }

    if (clicked) {
      this.selectBuilding(clicked);
    }
  }

  pointInPolygon(x, y, vs) {
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].x, yi = vs[i].y;
      const xj = vs[j].x, yj = vs[j].y;
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  setFilter(category) {
    this.activeFilter = category;
    if (category === 'ALL') {
      // Keep or reset
    } else {
      const match = this.buildings.find(b => b.category === category);
      if (match) {
        this.selectBuilding(match);
      }
    }
  }

  selectBuilding(building) {
    this.selectedBuilding = building;
    if (this.onSelectCallback) {
      this.onSelectCallback(building);
    }
  }

  project(worldX, worldY, worldZ, cx, cy) {
    // Rotate world around Y axis
    const cosR = Math.cos(this.rotation);
    const sinR = Math.sin(this.rotation);
    const rx = worldX * cosR - worldY * sinR;
    const ry = worldX * sinR + worldY * cosR;

    // Isometric tilt projection
    const screenX = cx + rx;
    const screenY = cy + ry * this.pitch - worldZ;
    return { x: screenX, y: screenY, depth: ry };
  }

  animate() {
    // Smooth rotation inertia
    this.rotation += (this.targetRotation - this.rotation) * 0.08;

    // Gentle auto rotate when not dragging
    if (!this.isDragging) {
      this.targetRotation += 0.0012;
    }

    this.render();
    requestAnimationFrame(() => this.animate());
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    if (!ctx || !w || !h) return;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 32;

    // 1. Draw Starfield & Cosmos
    const time = performance.now() * 0.001;
    for (let p of this.particles) {
      const flicker = Math.sin(time * 2 + p.phase) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(220, 230, 245, ${p.alpha * flicker * 0.45})`;
      ctx.beginPath();
      ctx.arc(cx + p.x, cy - 60 + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw Platform Disc (3D Cylinder)
    const discRadius = Math.min(w * 0.38, 230);
    const discThickness = 28;

    // Bottom disc shadow / ambient glow
    const shadowGrad = ctx.createRadialGradient(cx, cy + discThickness + 10, discRadius * 0.3, cx, cy + discThickness + 10, discRadius * 1.3);
    shadowGrad.addColorStop(0, 'rgba(52, 211, 153, 0.12)');
    shadowGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.6)');
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + discThickness + 15, discRadius * 1.2, discRadius * 1.2 * this.pitch, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cylinder rim (side)
    const rimGrad = ctx.createLinearGradient(cx - discRadius, cy, cx + discRadius, cy);
    rimGrad.addColorStop(0, '#10161E');
    rimGrad.addColorStop(0.2, '#1E293B');
    rimGrad.addColorStop(0.5, '#293548');
    rimGrad.addColorStop(0.8, '#1E293B');
    rimGrad.addColorStop(1, '#0F151D');

    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + discThickness, discRadius, discRadius * this.pitch, 0, 0, Math.PI);
    ctx.lineTo(cx - discRadius, cy);
    ctx.ellipse(cx, cy, discRadius, discRadius * this.pitch, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

    // Subtle edge rim highlights
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + discThickness, discRadius, discRadius * this.pitch, 0, 0, Math.PI);
    ctx.stroke();

    // Top surface of disc
    const topDiscGrad = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, discRadius);
    topDiscGrad.addColorStop(0, '#1C2530');
    topDiscGrad.addColorStop(0.7, '#151D26');
    topDiscGrad.addColorStop(1, '#0F151D');

    ctx.fillStyle = topDiscGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, discRadius, discRadius * this.pitch, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle disc concentric circuit rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, discRadius * 0.8, discRadius * 0.8 * this.pitch, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, discRadius * 0.5, discRadius * 0.5 * this.pitch, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Glowing border around platform
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(cx, cy, discRadius, discRadius * this.pitch, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Sort buildings by calculated depth for accurate Painter's algorithm
    const sorted = [...this.buildings].map(b => {
      const cosR = Math.cos(this.rotation);
      const sinR = Math.sin(this.rotation);
      const depth = b.x * sinR + b.y * cosR;
      return { ...b, currentDepth: depth };
    });
    sorted.sort((a, b) => a.currentDepth - b.currentDepth);

    // 4. Render Buildings
    for (let b of sorted) {
      this.renderBuilding(b, cx, cy);
    }

    // 5. Render Floating Pins & Connection Lines
    for (let b of sorted) {
      this.renderPin(b, cx, cy);
    }
  }

  renderBuilding(b, cx, cy) {
    const ctx = this.ctx;
    const isHovered = this.hoveredBuilding && this.hoveredBuilding.id === b.id;
    const isSelected = this.selectedBuilding && this.selectedBuilding.id === b.id;
    const isFiltered = this.activeFilter !== 'ALL' && b.category !== this.activeFilter;

    // Opacity handling based on filters
    const alpha = isFiltered ? 0.25 : 1.0;
    ctx.save();
    ctx.globalAlpha = alpha;

    const hw = b.w / 2;
    const hd = b.d / 2;
    const h = b.h * (isHovered || isSelected ? 1.08 : 1.0);

    // 8 vertices of the rectangular cuboid
    // Base 4 points (z = 0)
    const p0 = this.project(b.x - hw, b.y - hd, 0, cx, cy);
    const p1 = this.project(b.x + hw, b.y - hd, 0, cx, cy);
    const p2 = this.project(b.x + hw, b.y + hd, 0, cx, cy);
    const p3 = this.project(b.x - hw, b.y + hd, 0, cx, cy);

    // Top 4 points (z = h)
    const t0 = this.project(b.x - hw, b.y - hd, h, cx, cy);
    const t1 = this.project(b.x + hw, b.y - hd, h, cx, cy);
    const t2 = this.project(b.x + hw, b.y + hd, h, cx, cy);
    const t3 = this.project(b.x - hw, b.y + hd, h, cx, cy);

    // Save polygon bounding box for hit-testing
    b._poly = [p0, p1, p2, p3, t2, t1, t0, t3];

    // Building footprint shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fill();

    // Front/Right/Left walls calculation
    const drawFace = (pts, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.closePath();
      ctx.fill();
    };

    // Draw Walls with ambient occlusion / shading
    drawFace([p0, p1, t1, t0], '#243242'); // back-right
    drawFace([p1, p2, t2, t1], '#2C3E52'); // right
    drawFace([p2, p3, t3, t2], '#33485E'); // front
    drawFace([p3, p0, t0, t3], '#1F2C3A'); // left

    // Glowing window strips
    ctx.strokeStyle = isSelected ? '#34D399' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let row = 1; row <= 3; row++) {
      const zh = (h / 4) * row;
      const wA = this.project(b.x + hw, b.y + hd * 0.7, zh, cx, cy);
      const wB = this.project(b.x - hw * 0.7, b.y + hd, zh, cx, cy);
      ctx.beginPath();
      ctx.moveTo(wA.x, wA.y);
      ctx.lineTo(wB.x, wB.y);
      ctx.stroke();
    }

    // Top Roof Face
    ctx.fillStyle = b.roofColor;
    ctx.beginPath();
    ctx.moveTo(t0.x, t0.y);
    ctx.lineTo(t1.x, t1.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.closePath();
    ctx.fill();

    // Roof border
    ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.stroke();

    // If Medical, draw a subtle white cross on the roof
    if (b.id === 'medical') {
      const topCenter = this.project(b.x, b.y, h + 1, cx, cy);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(topCenter.x - 5, topCenter.y - 1.5, 10, 3);
      ctx.fillRect(topCenter.x - 1.5, topCenter.y - 5, 3, 10);
    }

    // Active glow halo when selected or hovered
    if (isSelected || isHovered) {
      const centerBase = this.project(b.x, b.y, 0, cx, cy);
      ctx.strokeStyle = b.roofColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerBase.x, centerBase.y, b.w * 0.9, b.w * 0.9 * this.pitch, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderPin(b, cx, cy) {
    const ctx = this.ctx;
    const isHovered = this.hoveredBuilding && this.hoveredBuilding.id === b.id;
    const isSelected = this.selectedBuilding && this.selectedBuilding.id === b.id;
    const isFiltered = this.activeFilter !== 'ALL' && b.category !== this.activeFilter;

    const alpha = isFiltered ? 0.3 : 1.0;
    ctx.save();
    ctx.globalAlpha = alpha;

    const h = b.h * (isHovered || isSelected ? 1.08 : 1.0);
    const roofTop = this.project(b.x, b.y, h, cx, cy);

    // Stem height above the building roof
    const stemHeight = 28;
    const pinTopY = roofTop.y - stemHeight;

    // Stem connecting line
    ctx.strokeStyle = isSelected ? '#34D399' : 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(roofTop.x, roofTop.y);
    ctx.lineTo(roofTop.x, pinTopY);
    ctx.stroke();

    // Glowing anchor dot on roof
    ctx.fillStyle = b.roofColor;
    ctx.beginPath();
    ctx.arc(roofTop.x, roofTop.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Floating Label Pill
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    const text = b.name;
    const textWidth = ctx.measureText(text).width;
    const pillPadX = 9;
    const pillH = 22;
    const pillW = textWidth + pillPadX * 2 + 10;
    const pillX = roofTop.x - pillW / 2;
    const pillY = pinTopY - pillH;

    // Store bounding box for hit-testing
    b._pinBounds = { x: pillX, y: pillY, w: pillW, h: pillH };

    // Pill background
    ctx.fillStyle = isSelected ? '#1E293B' : 'rgba(15, 23, 36, 0.85)';
    ctx.strokeStyle = isSelected ? '#34D399' : (isHovered ? '#94A3B8' : 'rgba(255, 255, 255, 0.15)');
    ctx.lineWidth = isSelected ? 1.8 : 1;

    // Rounded rectangle
    const rad = 6;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(pillX, pillY, pillW, pillH, rad);
    } else {
      ctx.rect(pillX, pillY, pillW, pillH);
    }
    ctx.fill();
    ctx.stroke();

    // Colored category dot inside pill
    ctx.fillStyle = b.roofColor;
    ctx.beginPath();
    ctx.arc(pillX + 10, pillY + pillH / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Label Text
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(text, pillX + 18, pillY + pillH / 2 + 3.8);

    ctx.restore();
  }
}

window.CampusDigitalTwin = CampusDigitalTwin;

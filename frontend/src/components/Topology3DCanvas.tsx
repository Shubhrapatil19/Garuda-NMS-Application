"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  RotateCcw,
  Box,
  Layers,
  ZoomIn,
  ZoomOut,
  Activity,
  Cpu,
  Server,
  Wifi,
} from "lucide-react";
import { CarrierSite } from "@/data/sitesData";

interface Topology3DCanvasProps {
  site: CarrierSite;
}

// 3D Vector Math Types
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Point2D {
  x: number;
  y: number;
  z_view: number;
  scale: number;
}

interface NodeHitbox {
  id: string;
  title: string;
  role: string;
  model?: string;
  ip: string;
  status: string;
  interface?: string;
  bandwidth?: string;
  latency?: string;
  screenX: number;
  screenY: number;
  radius: number;
}

interface QuadFace {
  pts: Point2D[];
  color: string;
  stroke: string;
  strokeWidth: number;
  avgZ: number;
  isFront?: boolean;
  chassisId: string;
  isHovered: boolean;
  frontCenter?: Point2D;
  ledPos?: Point2D;
  ledColor?: string;
  ports?: Point2D[];
}

export const Topology3DCanvas: React.FC<Topology3DCanvasProps> = ({ site }) => {
  const [is2DFallback, setIs2DFallback] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<NodeHitbox | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default camera angles
  const rotYRef = useRef(-16); // Yaw (degrees)
  const rotXRef = useRef(22);  // Pitch (degrees tilted down from above)
  const zoomRef = useRef(1.05); // Zoom scale
  const velXRef = useRef(0);
  const velYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const pulseOffsetRef = useRef(0);
  const nodeHitboxesRef = useRef<NodeHitbox[]>([]);
  const hoveredNodeIdRef = useRef<string | null>(null);

  // Status colors
  const isWarning = site.status === "warning";
  const isOffline = site.status === "offline";
  const statusColor = isOffline ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";
  const cableColor = isOffline ? "#f43f5e" : isWarning ? "#f59e0b" : "#10b981";

  // Reset to default angle
  const handleReset = () => {
    rotYRef.current = -16;
    rotXRef.current = 22;
    zoomRef.current = 1.05;
    velXRef.current = 0;
    velYRef.current = 0;
    hoveredNodeIdRef.current = null;
    setHoveredNode(null);
  };

  const handleZoom = (delta: number) => {
    zoomRef.current = Math.max(0.7, Math.min(1.45, zoomRef.current + delta));
  };

  // 3D Chassis Node Definitions (Standard Cartesian: X right, Y up, Z towards viewer)
  const chassisList = [
    {
      id: "router-01",
      name: site.primaryRouter,
      role: "Primary Gateway Router",
      hardware: site.hardwareModel,
      ip: site.ipRange ? `${site.ipRange.split(".0/")[0]}.1` : "10.40.10.1",
      bandwidth: site.throughput || "18.4 Gbps",
      latency: site.latency || "14.2 ms",
      pos: { x: 0, y: 95, z: 0 },
      size: { w: 135, h: 28, d: 68 },
      status: site.status,
    },
    {
      id: "core-01",
      name: "Core Distribution Fabric",
      role: "High-Speed L3 Spine",
      hardware: "L3 Spine Fabric Engine",
      ip: site.ipRange ? `${site.ipRange.split(".0/")[0]}.254` : "10.40.10.254",
      bandwidth: "40 Gbps Interlink",
      latency: "Sub-1ms Bus",
      pos: { x: 0, y: 22, z: 0 },
      size: { w: 155, h: 32, d: 74 },
      status: site.status,
    },
    {
      id: "cpe-left",
      name: "CPE Branch Gateway 1",
      role: "LAN & DIA Termination",
      hardware: "Cisco Catalyst 1000",
      ip: site.ipRange ? `${site.ipRange.split(".0/")[0]}.2` : "10.40.10.2",
      bandwidth: site.circuits[0]?.configuredCIR || "6 Mbps",
      interface: site.circuits[0]?.interface || "lan1",
      pos: { x: -125, y: -52, z: 15 },
      size: { w: 112, h: 26, d: 62 },
      status: isOffline ? "offline" : "online",
    },
    {
      id: "cpe-right",
      name: "CPE Branch Gateway 2",
      role: "WAN MPLS Gateway",
      hardware: "Arista 7050SX3",
      ip: site.ipRange ? `${site.ipRange.split(".0/")[0]}.3` : "10.40.10.3",
      bandwidth: site.circuits[1]?.configuredCIR || "6 Mbps",
      interface: site.circuits[1]?.interface || "wan",
      pos: { x: 125, y: -52, z: 15 },
      size: { w: 112, h: 26, d: 62 },
      status: isWarning ? "warning" : isOffline ? "offline" : "online",
    },
  ];

  // Leaf Underlay Drops (resting on floor grid at y = -120)
  const leafNodes = [
    { id: "leaf-1", x: -160, y: -120, z: 25, label: "lan1-A", role: "VLAN 10 Workstation Drop", ip: "192.168.10.11", cir: "1 Gbps Full Duplex" },
    { id: "leaf-2", x: -125, y: -120, z: 25, label: "lan1-B", role: "VLAN 20 VoIP Drop", ip: "192.168.20.15", cir: "1 Gbps Full Duplex" },
    { id: "leaf-3", x: -90, y: -120, z: 25, label: "lan1-C", role: "VLAN 30 WiFi AP Controller", ip: "192.168.30.22", cir: "1 Gbps Full Duplex" },
    { id: "leaf-4", x: 105, y: -120, z: 25, label: "wan1-A", role: "Primary DIA Fiber Trunk", ip: site.circuits[0]?.ipAddress || "121.244.104.198", cir: site.circuits[0]?.configuredCIR || "6 Mbps" },
    { id: "leaf-5", x: 145, y: -120, z: 25, label: "wan1-B", role: "Backup MPLS L3VPN Trunk", ip: site.circuits[1]?.ipAddress || "10.200.66.14", cir: site.circuits[1]?.configuredCIR || "6 Mbps" },
  ];

  // 3D Projection Matrix Transformation
  const project3D = useCallback(
    (
      p: Point3D,
      width: number,
      height: number,
      yaw: number,
      pitch: number,
      zoom: number
    ): Point2D => {
      const radY = (yaw * Math.PI) / 180;
      const radX = (pitch * Math.PI) / 180;

      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);

      // 1. Rotate around Y axis (Yaw)
      const rx = p.x * cosY + p.z * sinY;
      const ry = p.y;
      const rz = -p.x * sinY + p.z * cosY;

      // 2. Pitch camera down by pitch angle (looking from above)
      const vx = rx;
      const vy = ry * cosX - rz * sinX;
      const vz = ry * sinX + rz * cosX;

      // 3. Perspective Projection
      const cameraDistance = 560;
      const fov = 420;
      const scale = (fov / (cameraDistance - vz)) * zoom;

      return {
        x: width / 2 + vx * scale,
        y: height / 2 - vy * scale, // Minus sign: positive world Y is UP, canvas Y is DOWN
        z_view: vz,
        scale,
      };
    },
    []
  );

  // Normal vector transformed into view space
  const getNormalZ = useCallback(
    (nx: number, ny: number, nz: number, yaw: number, pitch: number): number => {
      const radY = (yaw * Math.PI) / 180;
      const radX = (pitch * Math.PI) / 180;

      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);

      // Rotate around Y
      const n_ry = ny;
      const n_rz = -nx * sinY + nz * cosY;

      // Rotate around X (view space Z component)
      return n_ry * sinX + n_rz * cosX;
    },
    []
  );

  // Render Loop
  useEffect(() => {
    if (is2DFallback) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Inertia & Friction
      if (!isDraggingRef.current) {
        rotYRef.current += velXRef.current;
        rotXRef.current += velYRef.current;
        velXRef.current *= 0.92;
        velYRef.current *= 0.92;
        rotXRef.current = Math.max(8, Math.min(48, rotXRef.current));
      }

      pulseOffsetRef.current = (pulseOffsetRef.current + 0.012) % 1;

      const yaw = rotYRef.current;
      const pitch = rotXRef.current;
      const zoom = zoomRef.current;

      const project = (p: Point3D) => project3D(p, width, height, yaw, pitch, zoom);

      // ─── 1. RENDER PERSPECTIVE FLOOR GRID (Floor at y = -120) ───
      const floorY = -120;
      const gridSize = 260;
      const gridSteps = 10;
      ctx.strokeStyle = "rgba(203, 213, 225, 0.45)"; // Crisp slate-300 grid lines
      ctx.lineWidth = 1;

      for (let i = -gridSteps; i <= gridSteps; i++) {
        const coord = (i / gridSteps) * gridSize;

        // X-parallel lines
        const p1 = project({ x: -gridSize, y: floorY, z: coord });
        const p2 = project({ x: gridSize, y: floorY, z: coord });
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Z-parallel lines
        const p3 = project({ x: coord, y: floorY, z: -gridSize });
        const p4 = project({ x: coord, y: floorY, z: gridSize });
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      // Collect Screen Hitboxes for Hover Detection
      const currentHitboxes: NodeHitbox[] = [];

      // ─── 2. CONTACT GROUND SHADOWS BENEATH CHASSIS ───
      chassisList.forEach((chassis) => {
        const { pos, size } = chassis;
        const hw = (size.w / 2) * 1.05;
        const hd = (size.d / 2) * 1.05;

        const s1 = project({ x: pos.x - hw, y: floorY, z: pos.z - hd });
        const s2 = project({ x: pos.x + hw, y: floorY, z: pos.z - hd });
        const s3 = project({ x: pos.x + hw, y: floorY, z: pos.z + hd });
        const s4 = project({ x: pos.x - hw, y: floorY, z: pos.z + hd });

        ctx.fillStyle = "rgba(15, 23, 42, 0.08)";
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.lineTo(s3.x, s3.y);
        ctx.lineTo(s4.x, s4.y);
        ctx.closePath();
        ctx.fill();
      });

      // ─── 3. 3D CONNECTING CABLES WITH MOVING DATA PACKETS ───
      const draw3DCable = (pA: Point3D, pB: Point3D, color: string, pulse: boolean, pulseSpeed = 1) => {
        const pt1 = project(pA);
        const pt2 = project(pB);

        // Cable shadow on floor
        const sA = project({ x: pA.x, y: floorY, z: pA.z });
        const sB = project({ x: pB.x, y: floorY, z: pB.z });
        ctx.strokeStyle = "rgba(15, 23, 42, 0.04)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sA.x, sA.y);
        ctx.lineTo(sB.x, sB.y);
        ctx.stroke();

        // Core Cable Line
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();

        // Traveling Light Packets
        if (pulse) {
          const t = (pulseOffsetRef.current * pulseSpeed) % 1;
          const px = pt1.x + (pt2.x - pt1.x) * t;
          const py = pt1.y + (pt2.y - pt1.y) * t;

          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      };

      // Blue Cable: Gateway (y=95 - 14) to Core (y=22 + 16)
      draw3DCable({ x: 0, y: 81, z: 0 }, { x: 0, y: 38, z: 0 }, "#2563eb", true, 1.2);

      // Green Link: Core (y=22 - 16) to Left CPE (y=-52 + 13)
      draw3DCable({ x: -35, y: 6, z: 0 }, { x: -125, y: -39, z: 15 }, cableColor, true, 1);

      // Green Link: Core (y=22 - 16) to Right CPE (y=-52 + 13)
      draw3DCable({ x: 35, y: 6, z: 0 }, { x: 125, y: -39, z: 15 }, cableColor, true, 1);

      // Drops from Left CPE to 3 Floor Leaves
      leafNodes.slice(0, 3).forEach((leaf) => {
        draw3DCable({ x: -125, y: -65, z: 15 }, { x: leaf.x, y: leaf.y + 6, z: leaf.z }, cableColor, false);
      });

      // Drops from Right CPE to 2 Floor Leaves
      leafNodes.slice(3, 5).forEach((leaf) => {
        draw3DCable({ x: 125, y: -65, z: 15 }, { x: leaf.x, y: leaf.y + 6, z: leaf.z }, cableColor, false);
      });

      // ─── 4. BUILD 3D SOLID CHASSIS FACES WITH ACCURATE LIGHTING ───
      const renderQueue: QuadFace[] = [];

      chassisList.forEach((chassis) => {
        const { pos, size } = chassis;
        const hw = size.w / 2;
        const hh = size.h / 2;
        const hd = size.d / 2;

        const center2D = project(pos);
        const isHovered = hoveredNodeIdRef.current === chassis.id;

        currentHitboxes.push({
          id: chassis.id,
          title: chassis.name,
          role: chassis.role,
          model: chassis.hardware,
          ip: chassis.ip,
          status: chassis.status,
          bandwidth: chassis.bandwidth,
          latency: chassis.latency,
          interface: chassis.interface,
          screenX: center2D.x,
          screenY: center2D.y,
          radius: (size.w / 2) * center2D.scale * 0.9,
        });

        // 8 Vertices (Y up: pos.y + hh is Top, pos.y - hh is Bottom)
        const v = [
          { x: pos.x - hw, y: pos.y + hh, z: pos.z - hd }, // 0: Top-Back-Left
          { x: pos.x + hw, y: pos.y + hh, z: pos.z - hd }, // 1: Top-Back-Right
          { x: pos.x + hw, y: pos.y + hh, z: pos.z + hd }, // 2: Top-Front-Right
          { x: pos.x - hw, y: pos.y + hh, z: pos.z + hd }, // 3: Top-Front-Left
          { x: pos.x - hw, y: pos.y - hh, z: pos.z - hd }, // 4: Bottom-Back-Left
          { x: pos.x + hw, y: pos.y - hh, z: pos.z - hd }, // 5: Bottom-Back-Right
          { x: pos.x + hw, y: pos.y - hh, z: pos.z + hd }, // 6: Bottom-Front-Right
          { x: pos.x - hw, y: pos.y - hh, z: pos.z + hd }, // 7: Bottom-Front-Left
        ];

        const pv = v.map((pt) => project(pt));

        // 6 Solid Quads with outward normal vectors
        const faces = [
          // 1. TOP FACE: Normal = (0, 1, 0)
          {
            idx: [0, 3, 2, 1],
            norm: { x: 0, y: 1, z: 0 },
            color: isHovered ? "#3b537a" : "#222f42", // Metallic slate highlight
            stroke: isHovered ? "#38bdf8" : "#374a63",
          },
          // 2. FRONT FACE: Normal = (0, 0, 1)
          {
            idx: [3, 7, 6, 2],
            norm: { x: 0, y: 0, z: 1 },
            color: isHovered ? "#16233b" : "#0d1527", // Deep enterprise matte black
            stroke: isHovered ? "#38bdf8" : "#1a2538",
            isFront: true,
          },
          // 3. RIGHT FACE: Normal = (1, 0, 0)
          {
            idx: [2, 6, 5, 1],
            norm: { x: 1, y: 0, z: 0 },
            color: isHovered ? "#1e2c44" : "#141c2c",
            stroke: isHovered ? "#38bdf8" : "#243247",
          },
          // 4. LEFT FACE: Normal = (-1, 0, 0)
          {
            idx: [0, 4, 7, 3],
            norm: { x: -1, y: 0, z: 0 },
            color: isHovered ? "#1e2c44" : "#141c2c",
            stroke: isHovered ? "#38bdf8" : "#243247",
          },
          // 5. BOTTOM FACE: Normal = (0, -1, 0)
          {
            idx: [7, 4, 5, 6],
            norm: { x: 0, y: -1, z: 0 },
            color: "#0a0f1d",
            stroke: "#0f172a",
          },
          // 6. BACK FACE: Normal = (0, 0, -1)
          {
            idx: [1, 5, 4, 0],
            norm: { x: 0, y: 0, z: -1 },
            color: "#0f172a",
            stroke: "#192437",
          },
        ];

        faces.forEach((face) => {
          // Check outward normal in view coordinates
          const nzView = getNormalZ(face.norm.x, face.norm.y, face.norm.z, yaw, pitch);
          if (nzView <= 0.001) return; // Backface culling: discard backfacing faces!

          const pts = face.idx.map((i) => pv[i]);
          const avgZ = (pts[0].z_view + pts[1].z_view + pts[2].z_view + pts[3].z_view) / 4;

          let ledPoint: Point2D | undefined;
          let frontCenter: Point2D | undefined;
          let ports: Point2D[] = [];

          if (face.isFront) {
            // Front faceplate center
            frontCenter = project({ x: pos.x, y: pos.y, z: pos.z + hd + 1 });

            // Project status LED on the right side of the front faceplate
            const led3D = {
              x: pos.x + hw - 14,
              y: pos.y,
              z: pos.z + hd + 1,
            };
            ledPoint = project(led3D);

            // Project 4 tiny RJ45 port slots on the left side of the front faceplate
            ports = [-hw + 16, -hw + 32, -hw + 48, -hw + 64].map((px) =>
              project({ x: pos.x + px, y: pos.y, z: pos.z + hd + 1 })
            );
          }

          renderQueue.push({
            pts,
            color: face.color,
            stroke: face.stroke,
            strokeWidth: isHovered ? 2 : 1,
            avgZ,
            isFront: face.isFront,
            chassisId: chassis.id,
            isHovered,
            frontCenter,
            ledPos: ledPoint,
            ledColor: statusColor,
            ports,
          });
        });
      });

      // ─── 5. BUILD 3D SOLID CYLINDRICAL DISKS (LEAF NODES) ───
      leafNodes.forEach((leaf) => {
        const radius = 10;
        const heightCyl = 10;
        const segments = 12;

        const leafCenter = project({ x: leaf.x, y: leaf.y, z: leaf.z });
        const isHovered = hoveredNodeIdRef.current === leaf.id;

        currentHitboxes.push({
          id: leaf.id,
          title: `Port: ${leaf.label}`,
          role: leaf.role,
          ip: leaf.ip,
          status: "online",
          bandwidth: leaf.cir,
          interface: leaf.label,
          screenX: leafCenter.x,
          screenY: leafCenter.y,
          radius: 18,
        });

        const topY = leaf.y + heightCyl / 2;
        const botY = leaf.y - heightCyl / 2;
        const topCenter = project({ x: leaf.x, y: topY, z: leaf.z });

        // Cylinder side quads
        for (let i = 0; i < segments; i++) {
          const a1 = (i / segments) * Math.PI * 2;
          const a2 = ((i + 1) / segments) * Math.PI * 2;

          const pTop1 = project({ x: leaf.x + Math.cos(a1) * radius, y: topY, z: leaf.z + Math.sin(a1) * radius });
          const pTop2 = project({ x: leaf.x + Math.cos(a2) * radius, y: topY, z: leaf.z + Math.sin(a2) * radius });
          const pBot2 = project({ x: leaf.x + Math.cos(a2) * radius, y: botY, z: leaf.z + Math.sin(a2) * radius });
          const pBot1 = project({ x: leaf.x + Math.cos(a1) * radius, y: botY, z: leaf.z + Math.sin(a1) * radius });

          // Mid angle normal
          const midA = (a1 + a2) / 2;
          const nzView = getNormalZ(Math.cos(midA), 0, Math.sin(midA), yaw, pitch);
          if (nzView > 0) {
            renderQueue.push({
              pts: [pTop1, pTop2, pBot2, pBot1],
              color: isHovered ? "#059669" : "#047857",
              stroke: isHovered ? "#38bdf8" : "#065f46",
              strokeWidth: isHovered ? 1.5 : 0.5,
              avgZ: (pTop1.z_view + pTop2.z_view) / 2,
              chassisId: leaf.id,
              isHovered,
            });
          }
        }

        // Top circular face (always facing up, visible when pitched down)
        const nzTop = getNormalZ(0, 1, 0, yaw, pitch);
        if (nzTop > 0) {
          const topCirclePts: Point2D[] = [];
          for (let i = 0; i < segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            topCirclePts.push(
              project({
                x: leaf.x + Math.cos(a) * radius,
                y: topY,
                z: leaf.z + Math.sin(a) * radius,
              })
            );
          }

          renderQueue.push({
            pts: topCirclePts,
            color: isHovered ? "#34d399" : "#10b981",
            stroke: isHovered ? "#38bdf8" : "#34d399",
            strokeWidth: isHovered ? 2 : 1,
            avgZ: topCenter.z_view + 1,
            chassisId: leaf.id,
            isHovered,
          });
        }
      });

      // Update hitboxes reference for mouse events
      nodeHitboxesRef.current = currentHitboxes;

      // ─── 6. DEPTH SORT AND RENDER (PAINTER'S ALGORITHM) ───
      // Farther objects (smaller avgZ in view space) rendered first, closer objects on top
      renderQueue.sort((a, b) => a.avgZ - b.avgZ);

      renderQueue.forEach((poly) => {
        ctx.fillStyle = poly.color;
        ctx.beginPath();
        poly.pts.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fill();

        // Stroke Outline
        if (poly.stroke) {
          ctx.strokeStyle = poly.stroke;
          ctx.lineWidth = poly.strokeWidth;
          if (poly.isHovered) {
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 10;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Front Faceplate Details: RJ45 Ports & Status LED
        if (poly.isFront) {
          // Render RJ45 Port Slots
          if (poly.ports && poly.ports.length > 0) {
            poly.ports.forEach((ptPort) => {
              ctx.fillStyle = "#1e293b";
              ctx.fillRect(ptPort.x - 3, ptPort.y - 3, 6, 6);
              ctx.strokeStyle = "#334155";
              ctx.lineWidth = 0.8;
              ctx.strokeRect(ptPort.x - 3, ptPort.y - 3, 6, 6);

              // Tiny green link light above port
              ctx.fillStyle = "#10b981";
              ctx.fillRect(ptPort.x - 1, ptPort.y - 5.5, 2, 1.5);
            });
          }

          // Pulsing Front Status LED
          if (poly.ledPos && poly.ledColor) {
            const led = poly.ledPos;

            // Soft glowing halo
            ctx.fillStyle = poly.ledColor;
            ctx.shadowColor = poly.ledColor;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(led.x, led.y, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Bright core
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(led.x, led.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [is2DFallback, project3D, getNormalZ, cableColor, statusColor, site.status, site.primaryRouter, site.hardwareModel]);

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    velXRef.current = 0;
    velYRef.current = 0;
    setHoveredNode(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      rotYRef.current += dx * 0.45;
      rotXRef.current = Math.max(8, Math.min(48, rotXRef.current - dy * 0.35));
      velXRef.current = dx * 0.25;
      velYRef.current = -dy * 0.2;
      setHoveredNode(null);
    } else {
      // Hover hit-test
      const hit = nodeHitboxesRef.current.find((h) => {
        const dist = Math.hypot(mx - h.screenX, my - h.screenY);
        return dist <= h.radius;
      });

      if (hit) {
        hoveredNodeIdRef.current = hit.id;
        setHoveredNode(hit);
        setTooltipPos({ x: hit.screenX, y: hit.screenY });
      } else {
        hoveredNodeIdRef.current = null;
        setHoveredNode(null);
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    hoveredNodeIdRef.current = null;
    setHoveredNode(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    handleZoom(delta);
  };

  return (
    <div className="relative bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden">
      {/* ─── Top Control Header ─── */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-[#14233a] pb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">
          <span className="font-bold">3D Network Topology</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono text-xs text-slate-400 dark:text-slate-500 font-normal">
            Service: {site.serviceId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!is2DFallback && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl p-0.5 border border-slate-200/80 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => handleZoom(0.1)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
                title="Zoom in"
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(-0.1)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
                title="Zoom out"
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
                title="Reset rotation angle"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIs2DFallback(!is2DFallback);
              setHoveredNode(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-[#1e324d] bg-slate-50/80 dark:bg-[#0c1a2d] hover:bg-slate-100 dark:hover:bg-[#12243e] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
          >
            {is2DFallback ? (
              <>
                <Box size={13} className="text-blue-500" />
                <span>Switch to 3D View</span>
              </>
            ) : (
              <>
                <Layers size={13} className="text-blue-500" />
                <span>Switch to 2D Fallback</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Main 3D Canvas / 2D Fallback Area ─── */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className={`relative w-full h-90 sm:h-100 flex items-center justify-center select-none overflow-hidden ${
          !is2DFallback
            ? hoveredNode
              ? "cursor-pointer"
              : "cursor-grab active:cursor-grabbing"
            : ""
        }`}
      >
        {!is2DFallback ? (
          <>
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* ─── FLOATING HOVER INFO TOOLTIP ─── */}
            {hoveredNode && tooltipPos && (
              <div
                style={{
                  left: `${Math.min(
                    (containerRef.current?.clientWidth || 400) - 240,
                    Math.max(16, tooltipPos.x - 110)
                  )}px`,
                  top: `${
                    tooltipPos.y < 140 ? tooltipPos.y + 40 : tooltipPos.y - 150
                  }px`,
                }}
                className="absolute pointer-events-none z-30 w-56 sm:w-60 rounded-xl bg-slate-900/95 dark:bg-[#060c16]/95 backdrop-blur-md border border-slate-700/80 dark:border-blue-500/40 p-3.5 shadow-2xl animate-fade-in text-white text-xs select-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                  <div className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                    {hoveredNode.title}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      hoveredNode.status === "online"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : hoveredNode.status === "warning"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        hoveredNode.status === "online"
                          ? "bg-emerald-400"
                          : hoveredNode.status === "warning"
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      }`}
                    />
                    {hoveredNode.status.toUpperCase()}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-2 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Activity size={12} className="text-blue-400" />
                      Role:
                    </span>
                    <span className="font-medium text-slate-200 truncate max-w-30">
                      {hoveredNode.role}
                    </span>
                  </div>

                  {hoveredNode.model && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Cpu size={12} className="text-purple-400" />
                        Model:
                      </span>
                      <span className="font-mono text-slate-200 truncate max-w-30">
                        {hoveredNode.model}
                      </span>
                    </div>
                  )}

                  {hoveredNode.ip && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Server size={12} className="text-cyan-400" />
                        IP:
                      </span>
                      <span className="font-mono text-cyan-300 font-semibold">
                        {hoveredNode.ip}
                      </span>
                    </div>
                  )}

                  {hoveredNode.bandwidth && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Wifi size={12} className="text-emerald-400" />
                        Bandwidth:
                      </span>
                      <span className="font-semibold text-slate-200">
                        {hoveredNode.bandwidth}
                      </span>
                    </div>
                  )}

                  {hoveredNode.latency && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Latency:</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {hoveredNode.latency}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={`mt-2.5 h-0.5 rounded-full ${
                    hoveredNode.status === "online"
                      ? "bg-emerald-500"
                      : hoveredNode.status === "warning"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
              </div>
            )}
          </>
        ) : (
          /* ─── 2D SCHEMATIC FALLBACK VIEW ─── */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-4">
            {/* Top Gateway */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-[#0f192a] text-white border border-slate-700 shadow-md text-xs font-mono font-semibold flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${statusColor === "#10b981" ? "bg-emerald-500" : statusColor === "#f59e0b" ? "bg-amber-500" : "bg-rose-500"}`} />
                <span>Gateway: {site.primaryRouter}</span>
              </div>
              <div className="w-0.5 h-5 bg-blue-500" />
            </div>

            {/* Core Aggregator */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-[#12233c] text-white border border-slate-600 shadow-md text-xs font-mono font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Spine Core: {site.hardwareModel}</span>
              </div>
              <div className="w-0.5 h-5 bg-emerald-500" />
            </div>

            {/* Dual CPE Cards */}
            <div className="w-full max-w-lg grid grid-cols-2 gap-3">
              {site.circuits.map((c) => (
                <div
                  key={c.name}
                  className="p-3 rounded-xl border border-slate-200 dark:border-[#1e324d] bg-slate-50 dark:bg-[#0c1a2d] text-center"
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{c.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                    {c.interface} · {c.configuredCIR}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {c.ipAddress}
                  </div>
                </div>
              ))}
            </div>

            {/* 5 Leaf Underlays */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {leafNodes.map((leaf) => (
                <div
                  key={leaf.id}
                  className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-[10px] font-mono font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{leaf.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom-right helper text */}
        {!is2DFallback && (
          <div className="absolute right-3.5 bottom-2.5 text-[11px] text-slate-400 dark:text-slate-500 select-none pointer-events-none bg-white/75 dark:bg-[#081220]/75 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-[#14233a]/60">
            Click &amp; drag to rotate 3D chassis · Hover node for info
          </div>
        )}
      </div>
    </div>
  );
};

export default Topology3DCanvas;
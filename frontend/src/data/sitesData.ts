export interface SiteCircuit {
  name: string;
  type: string;
  dotColor: "blue" | "purple" | "emerald" | "amber";
  status: "online" | "warning" | "offline";
  ipAddress: string;
  interface: string;
  configuredCIR: string;
  connectedNodes: string;
}

export interface CarrierSite {
  id: string;
  name: string;
  serviceId: string;
  status: "online" | "warning" | "offline";
  location: string;
  fullLocation: string;
  state: string;
  city: string;
  primaryRouter: string;
  hardwareModel: string;
  deviceCpeCount: number;
  underlayCount: number;
  devicesCount?: number;
  underlaysCount?: number;
  devicesAndUnderlaysText: string;
  correlationLogic: string;
  circuits: SiteCircuit[];
  latency?: string;
  packetLoss?: string;
  throughput?: string;
  ipRange?: string;
  underlays?: Array<{
    name: string;
    type: "Dark Fiber" | "Subsea Cable" | "MPLS" | "Broadband";
    bandwidth: string;
    status: "up" | "degraded" | "down";
  }>;
  devices?: Array<{
    hostname: string;
    model: string;
    ip: string;
    status: "online" | "warning" | "offline";
    role: string;
  }>;
}

export const CARRIER_SITES: CarrierSite[] = [
  {
    id: "west-mh03-mumbai",
    name: "West-MH03-Mumbai",
    serviceId: "091MUM34990A209835",
    status: "online",
    location: "Maharashtra",
    fullLocation: "Mumbai, Maharashtra, India",
    state: "Maharashtra",
    city: "Mumbai",
    primaryRouter: "TAH-IND-MUMBAI-003-R-01",
    hardwareModel: "Fortinet FortiGate 60F",
    deviceCpeCount: 2,
    underlayCount: 2,
    devicesAndUnderlaysText: "2 Device(s) • 2 Underlay",
    correlationLogic: "Site health is derived automatically from child underlays (Online & Online).",
    circuits: [
      {
        name: "TCL-INET1",
        type: "Internet DIA",
        dotColor: "blue",
        status: "online",
        ipAddress: "121.244.104.198/29",
        interface: "lan1",
        configuredCIR: "6 Mbps",
        connectedNodes: "3 Interfaces",
      },
      {
        name: "TCL-MPLS1",
        type: "MPLS L3VPN",
        dotColor: "purple",
        status: "online",
        ipAddress: "10.200.66.14/30",
        interface: "wan",
        configuredCIR: "6 Mbps",
        connectedNodes: "2 Interfaces",
      },
    ],
    latency: "14.2 ms",
    packetLoss: "0.01%",
    throughput: "18.4 Gbps",
    ipRange: "10.40.10.0/24",
    underlays: [
      { name: "MUM-BKC-Primary-Fiber", type: "Dark Fiber", bandwidth: "40 Gbps", status: "up" },
      { name: "MUM-Subsea-Gateway-01", type: "Subsea Cable", bandwidth: "100 Gbps", status: "up" },
    ],
    devices: [
      { hostname: "TAH-IND-MUMBAI-003-R-01", model: "Fortinet FortiGate 60F", ip: "10.40.10.1", status: "online", role: "Primary Router" },
      { hostname: "MUM-CPE-SW-02", model: "Cisco Catalyst 1000", ip: "10.40.10.2", status: "online", role: "L3 Edge Switch" },
    ],
  },
  {
    id: "west-mh05-pune",
    name: "West-MH05-Pune",
    serviceId: "091PUN34990A212236",
    status: "online",
    location: "Maharashtra",
    fullLocation: "Pune, Maharashtra, India",
    state: "Maharashtra",
    city: "Pune",
    primaryRouter: "TAH-IND-PUNE-005-R-01",
    hardwareModel: "Cisco Catalyst 8300",
    deviceCpeCount: 1,
    underlayCount: 2,
    devicesAndUnderlaysText: "1 Device(s) • 2 Underlay",
    correlationLogic: "Site health is derived automatically from child underlays (Online & Online).",
    circuits: [
      {
        name: "PUN-INET1",
        type: "Internet DIA",
        dotColor: "blue",
        status: "online",
        ipAddress: "121.244.108.42/29",
        interface: "lan1",
        configuredCIR: "10 Mbps",
        connectedNodes: "2 Interfaces",
      },
      {
        name: "PUN-MPLS1",
        type: "MPLS L3VPN",
        dotColor: "purple",
        status: "online",
        ipAddress: "10.200.70.18/30",
        interface: "wan",
        configuredCIR: "10 Mbps",
        connectedNodes: "2 Interfaces",
      },
    ],
    latency: "16.8 ms",
    packetLoss: "0.02%",
    throughput: "9.6 Gbps",
    ipRange: "10.40.20.0/24",
    underlays: [
      { name: "PUN-Hinjawadi-Interlink", type: "Dark Fiber", bandwidth: "20 Gbps", status: "up" },
      { name: "PUN-MUM-Express-Ring", type: "MPLS", bandwidth: "10 Gbps", status: "up" },
    ],
    devices: [
      { hostname: "TAH-IND-PUNE-005-R-01", model: "Cisco Catalyst 8300", ip: "10.40.20.1", status: "online", role: "Primary Router" },
    ],
  },
  {
    id: "west-mh07-nagpur",
    name: "West-MH07-Nagpur",
    serviceId: "091NAG34990A209515",
    status: "warning",
    location: "Maharashtra",
    fullLocation: "Nagpur, Maharashtra, India",
    state: "Maharashtra",
    city: "Nagpur",
    primaryRouter: "TAH-IND-NAGPUR-007-R-01",
    hardwareModel: "Fortinet FortiGate 80F",
    deviceCpeCount: 2,
    underlayCount: 3,
    devicesAndUnderlaysText: "2 Device(s) • 3 Underlay",
    correlationLogic: "Site health is in Warning state due to degraded child underlay (Online & Degraded).",
    circuits: [
      {
        name: "NAG-INET1",
        type: "Internet DIA",
        dotColor: "blue",
        status: "online",
        ipAddress: "121.244.112.55/29",
        interface: "lan1",
        configuredCIR: "4 Mbps",
        connectedNodes: "2 Interfaces",
      },
      {
        name: "NAG-MPLS1",
        type: "MPLS L3VPN",
        dotColor: "amber",
        status: "warning",
        ipAddress: "10.200.74.22/30",
        interface: "wan",
        configuredCIR: "4 Mbps",
        connectedNodes: "1 Interface",
      },
    ],
    latency: "28.4 ms",
    packetLoss: "0.35%",
    throughput: "4.8 Gbps",
    ipRange: "10.40.30.0/24",
    underlays: [
      { name: "NAG-MIHAN-Trunk-01", type: "Dark Fiber", bandwidth: "10 Gbps", status: "up" },
      { name: "NAG-Central-Failover", type: "MPLS", bandwidth: "5 Gbps", status: "degraded" },
      { name: "NAG-Sec-Carrier-Link", type: "Broadband", bandwidth: "1 Gbps", status: "up" },
    ],
    devices: [
      { hostname: "TAH-IND-NAGPUR-007-R-01", model: "Fortinet FortiGate 80F", ip: "10.40.30.1", status: "warning", role: "Primary Router" },
      { hostname: "NAG-SW-02", model: "Cisco Catalyst 1000", ip: "10.40.30.2", status: "online", role: "Access Switch" },
    ],
  },
  {
    id: "west-mh09-nashik",
    name: "West-MH09-Nashik",
    serviceId: "091NAS34990A212573",
    status: "online",
    location: "Maharashtra",
    fullLocation: "Nashik, Maharashtra, India",
    state: "Maharashtra",
    city: "Nashik",
    primaryRouter: "TAH-IND-NASHIK-009-R-01",
    hardwareModel: "Arista 7050SX3",
    deviceCpeCount: 1,
    underlayCount: 2,
    devicesAndUnderlaysText: "1 Device(s) • 2 Underlay",
    correlationLogic: "Site health is derived automatically from child underlays (Online & Online).",
    circuits: [
      {
        name: "NAS-INET1",
        type: "Internet DIA",
        dotColor: "blue",
        status: "online",
        ipAddress: "121.244.116.12/29",
        interface: "lan1",
        configuredCIR: "6 Mbps",
        connectedNodes: "2 Interfaces",
      },
      {
        name: "NAS-MPLS1",
        type: "MPLS L3VPN",
        dotColor: "purple",
        status: "online",
        ipAddress: "10.200.78.30/30",
        interface: "wan",
        configuredCIR: "6 Mbps",
        connectedNodes: "2 Interfaces",
      },
    ],
    latency: "19.1 ms",
    packetLoss: "0.00%",
    throughput: "6.2 Gbps",
    ipRange: "10.40.40.0/24",
    underlays: [
      { name: "NAS-MIDC-Ring-1", type: "Dark Fiber", bandwidth: "10 Gbps", status: "up" },
      { name: "NAS-Thane-Carrier-Link", type: "MPLS", bandwidth: "10 Gbps", status: "up" },
    ],
    devices: [
      { hostname: "TAH-IND-NASHIK-009-R-01", model: "Arista 7050SX3", ip: "10.40.40.1", status: "online", role: "Primary Router" },
    ],
  },
  {
    id: "west-gj03-ahmedabad",
    name: "West-GJ03-Ahmedabad",
    serviceId: "091AHM34990A224821",
    status: "online",
    location: "Gujarat",
    fullLocation: "Ahmedabad, Gujarat, India",
    state: "Gujarat",
    city: "Ahmedabad",
    primaryRouter: "TAH-IND-AHM-003-R-01",
    hardwareModel: "Cisco ASR 9904",
    deviceCpeCount: 2,
    underlayCount: 2,
    devicesAndUnderlaysText: "2 Device(s) • 2 Underlay",
    correlationLogic: "Site health is derived automatically from child underlays (Online & Online).",
    circuits: [
      {
        name: "AHM-INET1",
        type: "Internet DIA",
        dotColor: "blue",
        status: "online",
        ipAddress: "121.244.120.88/29",
        interface: "lan1",
        configuredCIR: "12 Mbps",
        connectedNodes: "3 Interfaces",
      },
      {
        name: "AHM-MPLS1",
        type: "MPLS L3VPN",
        dotColor: "purple",
        status: "online",
        ipAddress: "10.200.82.10/30",
        interface: "wan",
        configuredCIR: "12 Mbps",
        connectedNodes: "3 Interfaces",
      },
    ],
    latency: "15.6 ms",
    packetLoss: "0.01%",
    throughput: "14.1 Gbps",
    ipRange: "10.42.10.0/24",
    underlays: [
      { name: "AHM-GIFT-City-Express", type: "Dark Fiber", bandwidth: "40 Gbps", status: "up" },
      { name: "AHM-West-Transit-02", type: "Dark Fiber", bandwidth: "20 Gbps", status: "up" },
    ],
    devices: [
      { hostname: "TAH-IND-AHM-003-R-01", model: "Cisco ASR 9904", ip: "10.42.10.1", status: "online", role: "Primary Router" },
      { hostname: "AHM-DIST-SW-02", model: "Arista 7280R3", ip: "10.42.10.2", status: "online", role: "Distribution Switch" },
    ],
  },
  {
    id: "west-gj05-surat",
    name: "West-GJ05-Surat",
    serviceId: "091SUR34990A224832",
    status: "online",
    location: "Gujarat",
    fullLocation: "Surat, Gujarat, India",
    state: "Gujarat",
    city: "Surat",
    primaryRouter: "TAH-IND-SURAT-005-R-01",
    hardwareModel: "Juniper MX204",
    deviceCpeCount: 1,
    underlayCount: 2,
    devicesAndUnderlaysText: "1 Device(s) • 2 Underlay",
    correlationLogic: "Site health is derived automatically from child underlays (Online & Online).",
    circuits: [
      {
        name: "SUR-INET1",
        type: "Internet DIA",
        dotColor: "blue",
        status: "online",
        ipAddress: "121.244.124.64/29",
        interface: "lan1",
        configuredCIR: "8 Mbps",
        connectedNodes: "2 Interfaces",
      },
      {
        name: "SUR-MPLS1",
        type: "MPLS L3VPN",
        dotColor: "purple",
        status: "online",
        ipAddress: "10.200.86.44/30",
        interface: "wan",
        configuredCIR: "8 Mbps",
        connectedNodes: "2 Interfaces",
      },
    ],
    latency: "18.3 ms",
    packetLoss: "0.02%",
    throughput: "7.8 Gbps",
    ipRange: "10.42.20.0/24",
    underlays: [
      { name: "SUR-Diamond-Bourse-Ring", type: "Dark Fiber", bandwidth: "20 Gbps", status: "up" },
      { name: "SUR-Hazira-Transit", type: "MPLS", bandwidth: "10 Gbps", status: "up" },
    ],
    devices: [
      { hostname: "TAH-IND-SURAT-005-R-01", model: "Juniper MX204", ip: "10.42.20.1", status: "online", role: "Primary Router" },
    ],
  },
  {
    id: "west-gj07-vadodara",
    name: "West-GJ07-Vadodara",
    serviceId: "091VAD34990A215420",
    status: "warning",
    location: "Gujarat",
    fullLocation: "Vadodara, Gujarat, India",
    state: "Gujarat",
    city: "Vadodara",
    primaryRouter: "TAH-IND-VAD-007-R-01",
    hardwareModel: "Cisco Catalyst 9500",
    deviceCpeCount: 2,
    underlayCount: 2,
    devicesAndUnderlaysText: "2 Device(s) • 2 Underlay",
    correlationLogic: "Site health is in Warning state due to degraded child underlay (Degraded & Online).",
    circuits: [
      {
        name: "VAD-INET1",
        type: "Internet DIA",
        dotColor: "amber",
        status: "warning",
        ipAddress: "121.244.128.32/29",
        interface: "lan1",
        configuredCIR: "6 Mbps",
        connectedNodes: "2 Interfaces",
      },
      {
        name: "VAD-MPLS1",
        type: "MPLS L3VPN",
        dotColor: "purple",
        status: "online",
        ipAddress: "10.200.90.16/30",
        interface: "wan",
        configuredCIR: "6 Mbps",
        connectedNodes: "2 Interfaces",
      },
    ],
    latency: "32.0 ms",
    packetLoss: "0.42%",
    throughput: "5.4 Gbps",
    ipRange: "10.42.30.0/24",
    underlays: [
      { name: "VAD-Alkapuri-Metro", type: "Dark Fiber", bandwidth: "10 Gbps", status: "degraded" },
      { name: "VAD-Carrier-Backup", type: "MPLS", bandwidth: "5 Gbps", status: "up" },
    ],
    devices: [
      { hostname: "TAH-IND-VAD-007-R-01", model: "Cisco Catalyst 9500", ip: "10.42.30.1", status: "warning", role: "Primary Router" },
      { hostname: "VAD-SEC-FW-02", model: "FortiGate 100F", ip: "10.42.30.2", status: "online", role: "Perimeter Security" },
    ],
  },
  {
    id: "west-gj09-rajkot",
    name: "West-GJ09-Rajkot",
    serviceId: "091RAJ34990A213289",
    status: "offline",
    location: "Gujarat",
    fullLocation: "Rajkot, Gujarat, India",
    state: "Gujarat",
    city: "Rajkot",
    primaryRouter: "TAH-IND-RAJKOT-009-R-01",
    hardwareModel: "Cisco ISR 4451",
    deviceCpeCount: 1,
    underlayCount: 1,
    devicesAndUnderlaysText: "1 Device(s) • 1 Underlay",
    correlationLogic: "Site health is Offline: All parent underlays unreachable (Offline).",
    circuits: [
      {
        name: "RAJ-INET1",
        type: "Internet DIA",
        dotColor: "blue",
        status: "offline",
        ipAddress: "121.244.132.18/29",
        interface: "lan1",
        configuredCIR: "4 Mbps",
        connectedNodes: "0 Interfaces",
      },
    ],
    latency: "Timeout",
    packetLoss: "100.0%",
    throughput: "0.0 Gbps",
    ipRange: "10.42.40.0/24",
    underlays: [
      { name: "RAJ-Saurashtra-Trunk", type: "Dark Fiber", bandwidth: "10 Gbps", status: "down" },
    ],
    devices: [
      { hostname: "TAH-IND-RAJKOT-009-R-01", model: "Cisco ISR 4451", ip: "10.42.40.1", status: "offline", role: "Primary Router" },
    ],
  },
  {
    id: "north-rj03-jaipur",
    name: "North-RJ03-Jaipur",
    serviceId: "091JAI34990A209845",
    status: "online",
    location: "Rajasthan",
    fullLocation: "Jaipur, Rajasthan, India",
    state: "Rajasthan",
    city: "Jaipur",
    primaryRouter: "TAH-IND-JAIPUR-003-R-01",
    hardwareModel: "Juniper MX480",
    deviceCpeCount: 2,
    underlayCount: 3,
    devicesAndUnderlaysText: "2 Device(s) • 3 Underlay",
    correlationLogic: "Site health is derived automatically from child underlays (Online & Online).",
    circuits: [
      {
        name: "JAI-INET1",
        type: "Internet DIA",
        dotColor: "blue",
        status: "online",
        ipAddress: "121.244.136.70/29",
        interface: "lan1",
        configuredCIR: "10 Mbps",
        connectedNodes: "3 Interfaces",
      },
      {
        name: "JAI-MPLS1",
        type: "MPLS L3VPN",
        dotColor: "purple",
        status: "online",
        ipAddress: "10.200.94.50/30",
        interface: "wan",
        configuredCIR: "10 Mbps",
        connectedNodes: "3 Interfaces",
      },
    ],
    latency: "21.5 ms",
    packetLoss: "0.01%",
    throughput: "11.2 Gbps",
    ipRange: "10.44.10.0/24",
    underlays: [
      { name: "JAI-Sitapura-Primary", type: "Dark Fiber", bandwidth: "20 Gbps", status: "up" },
      { name: "JAI-DEL-Express-Path", type: "Dark Fiber", bandwidth: "40 Gbps", status: "up" },
      { name: "JAI-Regional-Backup", type: "MPLS", bandwidth: "10 Gbps", status: "up" },
    ],
    devices: [
      { hostname: "TAH-IND-JAIPUR-003-R-01", model: "Juniper MX480", ip: "10.44.10.1", status: "online", role: "Primary Router" },
      { hostname: "JAI-SW-CLUSTER-02", model: "Arista 7050SX3", ip: "10.44.10.2", status: "online", role: "Cluster Switch" },
    ],
  },
];

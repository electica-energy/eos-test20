"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

type Severity = "critical" | "high" | "medium" | "info";

interface Kpi {
  label: string;
  value: string;
  change: string;
  changePositive: boolean;
}

interface Fleet {
  id: string;
  name: string;
  assets: number;
  uptime: number;
  energyMwh: number;
  alerts: number;
}

interface Alert {
  id: string;
  severity: Severity;
  subject: string;
  message: string;
  time: string;
}

interface ActivityItem {
  id: string;
  time: string;
  message: string;
}

interface HealthBucket {
  name: string;
  value: number;
}

const KPIS: Kpi[] = [
  {
    label: "Total Energy Managed",
    value: "12.4 MWh",
    change: "+8.2% vs last 7 days",
    changePositive: true
  },
  {
    label: "Fleet Uptime",
    value: "99.2%",
    change: "3 critical alerts",
    changePositive: false
  },
  {
    label: "Battery Life Gain",
    value: "+32%",
    change: "Average extended cycles",
    changePositive: true
  },
  {
    label: "Daily Energy Revenue",
    value: "₹3.8L",
    change: "+₹42k vs last week",
    changePositive: true
  },
  {
    label: "Active Assets",
    value: "186",
    change: "Fleets, BESS, drones",
    changePositive: true
  },
  {
    label: "Open Alerts",
    value: "7",
    change: "2 high, 5 medium",
    changePositive: false
  }
];

const POWER_FLOW_DATA = [
  { time: "00:00", charge: 40, discharge: 18, net: 22 },
  { time: "04:00", charge: 32, discharge: 12, net: 20 },
  { time: "08:00", charge: 26, discharge: 24, net: 2 },
  { time: "12:00", charge: 18, discharge: 38, net: -20 },
  { time: "16:00", charge: 22, discharge: 34, net: -12 },
  { time: "20:00", charge: 30, discharge: 20, net: 10 },
  { time: "24:00", charge: 36, discharge: 16, net: 20 }
];

const SOC_DATA = [
  { time: "00:00", soc: 68 },
  { time: "04:00", soc: 72 },
  { time: "08:00", soc: 78 },
  { time: "12:00", soc: 70 },
  { time: "16:00", soc: 64 },
  { time: "20:00", soc: 74 },
  { time: "24:00", soc: 76 }
];

const REVENUE_DATA = [
  { time: "Mon", energy: 2.4, services: 0.9 },
  { time: "Tue", energy: 2.1, services: 1.2 },
  { time: "Wed", energy: 2.7, services: 1.0 },
  { time: "Thu", energy: 3.0, services: 1.3 },
  { time: "Fri", energy: 3.2, services: 1.4 },
  { time: "Sat", energy: 2.9, services: 1.1 },
  { time: "Sun", energy: 2.6, services: 1.0 }
];

const FLEETS: Fleet[] = [
  { id: "fleet-01", name: "EV Bus Fleet – North", assets: 42, uptime: 99.4, energyMwh: 4.2, alerts: 1 },
  { id: "fleet-02", name: "Last-mile 3W Fleet – City A", assets: 65, uptime: 98.8, energyMwh: 3.8, alerts: 2 },
  { id: "fleet-03", name: "Drone Ops – Defense Cluster", assets: 14, uptime: 99.9, energyMwh: 1.1, alerts: 0 },
  { id: "fleet-04", name: "C&I BESS – Campus East", assets: 8, uptime: 97.6, energyMwh: 3.3, alerts: 3 }
];

const HEALTH_BUCKETS: HealthBucket[] = [
  { name: "Excellent (>90% SoH)", value: 96 },
  { name: "Good (80–90%)", value: 54 },
  { name: "Monitor (70–80%)", value: 26 },
  { name: "Critical (<70%)", value: 10 }
];

const HEALTH_COLORS = ["#22C55E", "#0EA5E9", "#F97316", "#EF4444"];

const ALERTS: Alert[] = [
  {
    id: "a1",
    severity: "critical",
    subject: "BESS-04 / Campus East",
    message: "Rapid temperature rise on string #3",
    time: "14:12"
  },
  {
    id: "a2",
    severity: "high",
    subject: "Fleet-02 / City A",
    message: "SoH drift above threshold on 3 units",
    time: "13:58"
  },
  {
    id: "a3",
    severity: "medium",
    subject: "Bus-17 / Fleet-01",
    message: "Charge time longer than baseline",
    time: "13:25"
  },
  {
    id: "a4",
    severity: "medium",
    subject: "Drone Pack-09 / Cluster",
    message: "Cycle count approaching limit",
    time: "12:40"
  },
  {
    id: "a5",
    severity: "info",
    subject: "Grid Market / Region West",
    message: "New tariff window configuration synced",
    time: "12:10"
  }
];

const ACTIVITY_LOG: ActivityItem[] = [
  {
    id: "log1",
    time: "14:05",
    message: "Dispatched 120 kW from BESS-04 to peak tariff window."
  },
  {
    id: "log2",
    time: "13:42",
    message: "Reduced charge rate for Fleet-02 due to ambient temperature."
  },
  {
    id: "log3",
    time: "13:20",
    message: "Rebalanced SoC across Fleet-01 overnight parking depot."
  },
  {
    id: "log4",
    time: "12:55",
    message: "Submitted updated bid profile for ancillary services market."
  },
  {
    id: "log5",
    time: "12:30",
    message: "Pushed firmware configuration to 16 assets in Fleet-03."
  }
];

const MARKET_DATA = [
  { time: "10:00", price: 5.2, dispatch: 0.8 },
  { time: "11:00", price: 5.8, dispatch: 1.0 },
  { time: "12:00", price: 6.4, dispatch: 1.4 },
  { time: "13:00", price: 6.1, dispatch: 1.2 },
  { time: "14:00", price: 5.5, dispatch: 0.9 },
  { time: "15:00", price: 4.9, dispatch: 0.6 }
];

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, { label: string; color: string }> = {
    critical: { label: "Critical", color: "bg-critical/10 text-critical border-critical/40" },
    high: { label: "High", color: "bg-warning/10 text-warning border-warning/40" },
    medium: { label: "Medium", color: "bg-amber-100 text-amber-700 border-amber-200" },
    info: { label: "Info", color: "bg-sky-100 text-sky-700 border-sky-200" }
  };
  const cfg = map[severity];
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.color
      )}
    >
      {cfg.label}
    </span>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{kpi.label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{kpi.value}</div>
      <div
        className={classNames(
          "mt-1 text-xs font-medium",
          kpi.changePositive ? "text-emerald-600" : "text-rose-600"
        )}
      >
        {kpi.change}
      </div>
    </div>
  );
}

function Sidebar({
  current,
  onSelect
}: {
  current: string;
  onSelect: (section: string) => void;
}) {
  const items = [
    "Overview",
    "Fleets",
    "Assets",
    "Grid & Markets",
    "Alerts",
    "Settings"
  ];
  return (
    <aside className="hidden h-screen w-64 border-r border-slate-200 bg-white/80 px-4 py-6 lg:flex lg:flex-col lg:backdrop-blur">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          EO
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">ElecticaOS</span>
          <span className="text-xs text-slate-500">Control Center</span>
        </div>
      </div>
      <nav className="mt-8 space-y-1 text-sm">
        {items.map((item) => {
          const active = current === item;
          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={classNames(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <span>{item}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
        <div className="font-semibold text-slate-700">System Status</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-success" />
          <span>Active · All clusters nominal</span>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Dashboard</span>
          <span>•</span>
          <span>Overview</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-900">ElecticaOS Overview</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 sm:flex">
          <button className="rounded px-2 py-1 text-primary hover:bg-primary/5">Today</button>
          <button className="rounded px-2 py-1 hover:bg-slate-100">7D</button>
          <button className="rounded px-2 py-1 hover:bg-slate-100">30D</button>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>System Active</span>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
          AY
        </div>
      </div>
    </header>
  );
}

function PowerChart({ mode }: { mode: "power" | "soc" | "revenue" }) {
  if (mode === "soc") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={SOC_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="time" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" domain={[50, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="soc" stroke="#0EA5E9" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (mode === "revenue") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={REVENUE_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="time" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="energy"
            stackId="1"
            stroke="#0EA5E9"
            fill="#0EA5E9"
            fillOpacity={0.25}
          />
          <Area
            type="monotone"
            dataKey="services"
            stackId="1"
            stroke="#22C55E"
            fill="#22C55E"
            fillOpacity={0.25}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={POWER_FLOW_DATA}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="time" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="charge"
          name="Charging (kW)"
          stroke="#0EA5E9"
          fill="#0EA5E9"
          fillOpacity={0.22}
        />
        <Area
          type="monotone"
          dataKey="discharge"
          name="Discharging (kW)"
          stroke="#22C55E"
          fill="#22C55E"
          fillOpacity={0.22}
        />
        <Line
          type="monotone"
          dataKey="net"
          name="Net Export (kW)"
          stroke="#F97316"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function HealthDistribution() {
  const total = HEALTH_BUCKETS.reduce((acc, b) => acc + b.value, 0);
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Battery Health Distribution</h3>
          <p className="mt-1 text-xs text-slate-500">Assets grouped by SoH buckets.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-1 items-center gap-4">
        <div className="h-44 w-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={HEALTH_BUCKETS}
                innerRadius={45}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
              >
                {HEALTH_BUCKETS.map((entry, index) => (
                  <Cell key={entry.name} fill={HEALTH_COLORS[index % HEALTH_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {HEALTH_BUCKETS.map((bucket, i) => (
            <div key={bucket.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: HEALTH_COLORS[i % HEALTH_COLORS.length] }}
                />
                <span className="text-xs text-slate-600">{bucket.name}</span>
              </div>
              <span className="text-xs font-semibold text-slate-900">
                {bucket.value} ({Math.round((bucket.value / total) * 100)}%)
              </span>
            </div>
          ))}
          <div className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{total}</span> total assets monitored
            across fleets, BESS and drone packs.
          </div>
        </div>
      </div>
    </div>
  );
}

function FleetsTable({ onView }: { onView: (fleet: Fleet) => void }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Top Fleets by Uptime</h3>
          <p className="mt-1 text-xs text-slate-500">
            Live view of uptime, energy, and alerts across key fleets.
          </p>
        </div>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Fleet</th>
              <th className="px-3 py-2 text-right font-medium text-slate-500">Assets</th>
              <th className="px-3 py-2 text-right font-medium text-slate-500">Uptime</th>
              <th className="px-3 py-2 text-right font-medium text-slate-500">Energy (MWh)</th>
              <th className="px-3 py-2 text-right font-medium text-slate-500">Alerts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {FLEETS.map((fleet) => (
              <tr
                key={fleet.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => onView(fleet)}
              >
                <td className="px-3 py-2 text-left text-xs text-slate-700">{fleet.name}</td>
                <td className="px-3 py-2 text-right text-xs text-slate-700">{fleet.assets}</td>
                <td className="px-3 py-2 text-right text-xs text-emerald-700">
                  {fleet.uptime.toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-right text-xs text-slate-700">
                  {fleet.energyMwh.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-right text-xs text-slate-700">{fleet.alerts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Active Alerts</h3>
          <p className="mt-1 text-xs text-slate-500">
            Highest-priority events affecting safety, uptime, or financials.
          </p>
        </div>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Severity</th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Subject</th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Message</th>
              <th className="px-3 py-2 text-right font-medium text-slate-500">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td className="px-3 py-2 text-left">
                  <SeverityBadge severity={alert.severity} />
                </td>
                <td className="px-3 py-2 text-left text-xs font-medium text-slate-800">
                  {alert.subject}
                </td>
                <td className="px-3 py-2 text-left text-xs text-slate-600">{alert.message}</td>
                <td className="px-3 py-2 text-right text-xs text-slate-500">{alert.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityLogPanel({ items }: { items: ActivityItem[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">System Activity</h3>
          <p className="mt-1 text-xs text-slate-500">
            Decisions and actions taken automatically by ElecticaOS.
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-2 overflow-y-auto text-xs text-slate-600">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 rounded-md bg-slate-50 px-3 py-2">
            <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
              •
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">{item.time}</div>
              <div className="text-xs text-slate-700">{item.message}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GridMarketsPanel() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Grid & Market Activity</h3>
          <p className="mt-1 text-xs text-slate-500">
            Real-time price signals and dispatched power for active markets.
          </p>
        </div>
        <div className="flex flex-col items-end text-xs text-slate-500">
          <span>
            Markets active: <span className="font-semibold text-slate-800">3</span>
          </span>
          <span>
            Spread today: <span className="font-semibold text-slate-800">₹4.3 / kWh</span>
          </span>
        </div>
      </div>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MARKET_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              name="Market Price (₹/kWh)"
              stroke="#0EA5E9"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="dispatch"
              name="Dispatched (MWh)"
              stroke="#22C55E"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SnapshotPanel() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Current System Snapshot</h3>
          <p className="mt-1 text-xs text-slate-500">
            Aggregated power, SoC and market participation in this window.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-500">Real-time power</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">420 kW export</div>
          <div className="mt-1 text-[11px] text-emerald-700">Supplying peak demand window</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-500">Average SoC</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">76%</div>
          <div className="mt-1 text-[11px] text-slate-600">Within optimal operations band</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-500">Connected fleets</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">12</div>
          <div className="mt-1 text-[11px] text-slate-600">Buses, 2W/3W, drones</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-500">Active markets</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">3</div>
          <div className="mt-1 text-[11px] text-slate-600">Energy + ancillary services</div>
        </div>
      </div>
    </div>
  );
}

function FleetDrawer({ fleet, onClose }: { fleet: Fleet | null; onClose: () => void }) {
  if (!fleet) return null;
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/20">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white px-4 py-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Fleet</div>
            <h2 className="mt-1 text-base font-semibold text-slate-900">{fleet.name}</h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-success" />
              <span>Healthy · Uptime {fleet.uptime.toFixed(2)}%</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-slate-500">Assets</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{fleet.assets}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-slate-500">Energy this week</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              {fleet.energyMwh.toFixed(1)} MWh
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-slate-500">Open alerts</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{fleet.alerts}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-slate-500">Predicted life gain</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">+29%</div>
          </div>
        </div>
        <div className="mt-5">
          <div className="text-xs font-semibold text-slate-700">Recent events</div>
          <ul className="mt-2 space-y-2 text-xs text-slate-600">
            <li className="rounded-md bg-slate-50 px-3 py-2">
              SoC rebalancing executed across depot parking window.
            </li>
            <li className="rounded-md bg-slate-50 px-3 py-2">
              Charge profile updated to lower degradation on high-usage units.
            </li>
            <li className="rounded-md bg-slate-50 px-3 py-2">
              Forecast adjusted using latest route and load patterns.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [chartMode, setChartMode] = useState<"power" | "soc" | "revenue">("power");
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [navSection, setNavSection] = useState<string>("Overview");

  const chartTitle = useMemo(() => {
    if (chartMode === "soc") return "Fleet State of Charge";
    if (chartMode === "revenue") return "Energy Revenue Breakdown";
    return "Power Flow (Charging / Discharging / Net)";
  }, [chartMode]);

  const chartSubtitle = useMemo(() => {
    if (chartMode === "soc") return "Weighted average SoC across all active assets.";
    if (chartMode === "revenue")
      return "Separation of core energy revenue vs grid-services stack.";
    return "Time-of-day power flows aggregated across fleets and BESS.";
  }, [chartMode]);

  return (
    <div className="flex min-h-screen">
      <Sidebar current={navSection} onSelect={setNavSection} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 pb-6 pt-4 lg:px-6">
          {/* KPI Row */}
          <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {KPIS.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </section>

          {/* Charts Row */}
          <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{chartTitle}</h3>
                  <p className="mt-1 text-xs text-slate-500">{chartSubtitle}</p>
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  <button
                    className={classNames(
                      "rounded-md px-2 py-1",
                      chartMode === "power"
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-600"
                    )}
                    onClick={() => setChartMode("power")}
                  >
                    Power
                  </button>
                  <button
                    className={classNames(
                      "rounded-md px-2 py-1",
                      chartMode === "soc"
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-600"
                    )}
                    onClick={() => setChartMode("soc")}
                  >
                    SoC
                  </button>
                  <button
                    className={classNames(
                      "rounded-md px-2 py-1",
                      chartMode === "revenue"
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-600"
                    )}
                    onClick={() => setChartMode("revenue")}
                  >
                    Revenue
                  </button>
                </div>
              </div>
              <div className="mt-3 h-72">
                <PowerChart mode={chartMode} />
              </div>
            </div>
            <SnapshotPanel />
          </section>

          {/* Fleets / Health Row */}
          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <FleetsTable onView={setSelectedFleet} />
            <HealthDistribution />
          </section>

          {/* Grid & Activity Row */}
          <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <GridMarketsPanel />
            <ActivityLogPanel items={ACTIVITY_LOG} />
          </section>

          {/* Alerts Row */}
          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <AlertsPanel alerts={ALERTS} />
            {/* Empty space for future panels (e.g. "Config Drift", "Upcoming Maintenance") */}
            <div className="flex h-full flex-col justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center text-xs text-slate-400">
              Placeholder for additional module (config drift, maintenance, or ROI view).
            </div>
          </section>
        </main>
      </div>
      <FleetDrawer fleet={selectedFleet} onClose={() => setSelectedFleet(null)} />
    </div>
  );
}

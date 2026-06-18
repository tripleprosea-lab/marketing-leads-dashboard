import { NavLink } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

const ITEMS: NavItem[] = [
  { to: "/", label: "Leads dashboard", icon: "🗂️", end: true },
  { to: "/marketing", label: "Marketing dashboard", icon: "📊" },
  { to: "/automatiseringen", label: "Automatiseringen", icon: "⚡" },
  { to: "/instellingen", label: "Instellingen", icon: "⚙️" },
];

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="text-sm font-bold text-slate-800">TriplePro</div>
        <div className="text-[11px] text-slate-500">Leads &amp; Marketing</div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 px-5 py-3 text-[10px] text-slate-400">
        v0.1 · MVP
      </div>
    </aside>
  );
}

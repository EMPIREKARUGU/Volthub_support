import { useState } from "react";
import {
  MessageSquare,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Monitor,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Zap,
  Bell,
  Search,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { icon: MessageSquare, label: "Live Chat", active: true },
  { icon: BarChart3, label: "Analytics" },
  { icon: Bell, label: "Notifications", badge: 3 },
  { icon: Search, label: "Search" },
  { icon: Zap, label: "Automations" },
  { icon: Headphones, label: "Voice" },
  { icon: HelpCircle, label: "Help Center" },
  { icon: Settings, label: "Settings" },
];

const THEME_OPTIONS = [
  { value: "light" as const, icon: Sun, label: "Light" },
  { value: "dark" as const, icon: Moon, label: "Dark" },
  { value: "system" as const, icon: Monitor, label: "System" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showAccount, setShowAccount] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen border-r bg-card flex flex-col shrink-0 overflow-hidden relative"
    >
      {/* Logo / Header */}
      <div className="h-16 border-b flex items-center px-4 gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Headphones className="w-4 h-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-bold text-foreground whitespace-nowrap overflow-hidden"
            >
              SupportDesk
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors relative group ${
              item.active
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {item.badge && (
              <span
                className={`ml-auto shrink-0 min-w-5 h-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold ${
                  collapsed ? "absolute -top-1 -right-1 min-w-4 h-4 text-[9px]" : ""
                }`}
              >
                {item.badge}
              </span>
            )}
            {/* Tooltip on collapsed */}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Theme switcher */}
      <div className="px-2 pb-2">
        <div className={`flex items-center rounded-xl bg-secondary p-1 ${collapsed ? "flex-col gap-1" : "gap-0.5"}`}>
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-all flex-1 ${
                theme === opt.value
                  ? "bg-card text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              } ${collapsed ? "w-full" : ""}`}
              title={opt.label}
            >
              <opt.icon className="w-3.5 h-3.5 shrink-0" />
              {!collapsed && <span>{opt.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Account section */}
      <div className="border-t px-2 py-3 shrink-0 relative">
        <button
          onClick={() => setShowAccount(!showAccount)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-left overflow-hidden"
              >
                <p className="text-sm font-medium text-foreground leading-none truncate">
                  Alex Johnson
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  alex@support.io
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Account popup */}
        <AnimatePresence>
          {showAccount && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-full left-2 right-2 mb-2 bg-card border rounded-xl shadow-lg p-3 space-y-2 z-50"
            >
              <div className="flex items-center gap-3 pb-2 border-b">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Alex Johnson</p>
                  <p className="text-xs text-muted-foreground">Agent • Online</p>
                </div>
              </div>
              <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <User className="w-4 h-4" /> Profile Settings
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 -right-3 w-6 h-6 rounded-full border bg-card text-muted-foreground hover:text-foreground shadow-sm z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </Button>
    </motion.aside>
  );
};

export default AppSidebar;

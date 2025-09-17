import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Target, 
  Users,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Career Survey",
    href: "/survey",
    icon: FileText,
  },
  {
    name: "Recommendations",
    href: "/recommendations",
    icon: Target,
  },
  {
    name: "Mentors",
    href: "/mentors",
    icon: Users,
  },
  {
    name: "Growth Tracker",
    href: "/growth",
    icon: TrendingUp,
  },
  {
    name: "Learning Path",
    href: "/learning",
    icon: BookOpen,
  },
];

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
                isActive
                  ? "bg-sidebar-active text-sidebar-active-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
                !isOpen && "justify-center"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-active rounded-r-full" />
                )}
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-sidebar-active-foreground")} />
                {isOpen && (
                  <span className="truncate">{item.name}</span>
                )}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.name}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
import { Menu, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 shadow-card">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="p-2 hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CC</span>
            </div>
            <h1 className="text-xl font-medium text-foreground">CareerCompass</h1>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search careers, skills, or mentors..."
              className="pl-10 bg-muted/50 border-border focus:bg-card"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
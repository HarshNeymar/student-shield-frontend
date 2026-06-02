import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield, LayoutDashboard, School, Users, GraduationCap, FileText,
  Phone, ChevronLeft, ChevronRight, LogOut, Menu, BarChart3, Settings, Bell,
  UserCircle, BookOpen, Heart, ClipboardList, CreditCard,
  UserPlus
} from "lucide-react";
import { ShieldAlert } from "lucide-react";
interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: "company" | "school" | "teacher" | "student";
  userName?: string;
}

const navItems: Record<string, NavItem[]> = {
  company: [
    { label: "Dashboard", href: "/company", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Schools", href: "/company/schools", icon: <School className="w-5 h-5" /> },
    // { label: "Teachers", href: "/company/teachers", icon: <Users className="w-5 h-5" /> },
    // { label: "Students", href: "/company/students", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "Payments", href: "/company/payments", icon: <CreditCard className="w-5 h-5" /> },
    { label: "Sessions", href: "/company/sessions", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Claims", href: "/company/claims", icon: <ShieldAlert className="w-5 h-5" /> },
  ],
  school: [
    { label: "Dashboard", href: "/school", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Teachers", href: "/school/teachers", icon: <Users className="w-5 h-5" /> },
    {
  label: "Add Student",
  href: "/school/add-student",
  icon: <UserPlus className="w-5 h-5" />,
},
    { label: "Students", href: "/school/students", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "Payments", href: "/school/payments", icon: <CreditCard className="w-5 h-5" /> },
      { label: "Claims", href: "/school/claims", icon: <ShieldAlert className="w-5 h-5" /> },

  ],
  teacher: [
    { label: "Dashboard", href: "/teacher", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "My Students", href: "/teacher/students", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "Add Student", href: "/teacher/add-student", icon: <Users className="w-5 h-5" /> },
    { label: "Wellness Reports", href: "/teacher/wellness", icon: <Heart className="w-5 h-5" /> },
    // { label: "Raise Claim", href: "/teacher/claims", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Contact Us", href: "/teacher/contact", icon: <Phone className="w-5 h-5" /> },
      { label: "Claims", href: "/teacher/claims", icon: <ShieldAlert className="w-5 h-5" /> },
  ],
  student: [
    { label: "Dashboard", href: "/student", icon: <LayoutDashboard className="w-5 h-5" /> },
    // { label: "My Benefits", href: "/student/benefits", icon: <Shield className="w-5 h-5" /> },
    { label: "Smart Buddy", href: "/student/smart-buddy", icon: <UserCircle className="w-5 h-5" /> },
    { label: "Wellness", href: "/student/wellness-reports", icon: <Heart className="w-5 h-5" /> },
    { label: "Sessions", href: "/student/sessions", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Claims", href: "/student/claims", icon: <ShieldAlert className="w-5 h-5" /> },


// {
//   label: "Claim Status",
//   href: "/student/claim-status",
//  icon: <ShieldAlert className="w-5 h-5" />,
// },
  ],
};

const roleLabels = {
  company: "Company Admin",
  school: "School Admin",
  teacher: "Teacher",
  student: "Student",
};

export default function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const items = navItems[role];
  const displayName = userName || profile?.full_name || user?.email || "User";
  const handleLogout = async () => { await signOut(); navigate("/login"); };


  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <Shield className="w-8 h-8 text-sidebar-primary flex-shrink-0" />
          {!collapsed && <span className="font-bold text-lg">Student Shield</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:flex items-center justify-center py-3 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "lg:ml-20" : "lg:ml-64")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
              <p className="text-sm font-semibold">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-muted">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

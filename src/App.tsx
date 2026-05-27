import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import SchoolsManage from "./pages/company/SchoolsManage";
import CompanyStudents from "./pages/company/Students";
import CompanyTeachers from "./pages/company/Teachers";
import CompanyPayments from "./pages/company/Payments";
import CompanySessions from "./pages/company/Sessions";
import SchoolDashboard from "./pages/school/SchoolDashboard";
import SchoolTeachers from "./pages/school/Teachers";
import SchoolStudents from "./pages/school/Students";
import SchoolPayments from "./pages/school/Payments";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import AddStudent from "./pages/teacher/AddStudent";
import WellnessReport from "./pages/teacher/WellnessReport";
import Claims from "./pages/teacher/Claims";
import MyStudents from "./pages/teacher/MyStudents";
import ContactUs from "./pages/teacher/ContactUs";
import StudentDashboard from "./pages/student/StudentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/company" element={<ProtectedRoute allow={["company_admin"]}><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/company/schools" element={<ProtectedRoute allow={["company_admin"]}><SchoolsManage /></ProtectedRoute>} />
            <Route path="/company/students" element={<ProtectedRoute allow={["company_admin"]}><CompanyStudents /></ProtectedRoute>} />
            <Route path="/company/teachers" element={<ProtectedRoute allow={["company_admin"]}><CompanyTeachers /></ProtectedRoute>} />
            <Route path="/company/payments" element={<ProtectedRoute allow={["company_admin"]}><CompanyPayments /></ProtectedRoute>} />
            <Route path="/company/sessions" element={<ProtectedRoute allow={["company_admin"]}><CompanySessions /></ProtectedRoute>} />

            <Route path="/school" element={<ProtectedRoute allow={["school_admin","company_admin"]}><SchoolDashboard /></ProtectedRoute>} />
            <Route path="/school/teachers" element={<ProtectedRoute allow={["school_admin","company_admin"]}><SchoolTeachers /></ProtectedRoute>} />
            <Route path="/school/students" element={<ProtectedRoute allow={["school_admin","company_admin"]}><SchoolStudents /></ProtectedRoute>} />
            <Route path="/school/payments" element={<ProtectedRoute allow={["school_admin","company_admin"]}><SchoolPayments /></ProtectedRoute>} />

            <Route path="/teacher" element={<ProtectedRoute allow={["teacher","school_admin","company_admin"]}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/add-student" element={<ProtectedRoute allow={["teacher","school_admin","company_admin"]}><AddStudent /></ProtectedRoute>} />
            <Route path="/teacher/students" element={<ProtectedRoute allow={["teacher"]}><MyStudents /></ProtectedRoute>} />
            <Route path="/teacher/contact" element={<ProtectedRoute allow={["teacher"]}><ContactUs /></ProtectedRoute>} />
            <Route path="/teacher/wellness" element={<ProtectedRoute allow={["teacher"]}><WellnessReport /></ProtectedRoute>} />
            <Route path="/teacher/claims" element={<ProtectedRoute allow={["teacher"]}><Claims /></ProtectedRoute>} />

            <Route path="/student" element={<ProtectedRoute allow={["student"]}><StudentDashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

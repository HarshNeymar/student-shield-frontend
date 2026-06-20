import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function authHeaders(isFormData = false): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return {
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(await authHeaders(isFormData)),
      ...(options.headers ?? {}),
    },
  });

  const contentType = res.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof payload === 'object' && payload && 'error' in payload ? String((payload as any).error) : String(payload);
    throw new Error(message || `Request failed with ${res.status}`);
  }
  return payload as T;
}

export type SmartBuddyLaunchResponse = {
  launch_token: string;
  launch_url: string | null;
  expires_at: string;
  student: {
    id: string;
    full_name: string;
    school_id: string;
  };
};

export type SmartBuddyReport = {
  id: string;
  report_title: string;
  file_name: string;
  mime_type: string;
  file_size: number | null;
  generated_at: string;
  created_at: string;
  download_url: string | null;
};

export type SmartBuddyProfileResponse = {
  student: any;
  school: any;
  saved_profile: {
    form_data: Record<string, unknown>;
    assessment_data: Record<string, unknown>;
    created_at: string | null;
    updated_at: string | null;
  };
};


async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
console.log(formData)
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data1 = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data1?.error ?? "Request failed");
  }

  return data1;
}

function buildClaimFormData(body: any) {
  const formData = new FormData();

  Object.entries(body).forEach(([key, value]) => {
    if (key === "documents") return;

    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const documents = body.documents ?? [];

  for (const file of documents) {
    formData.append("documents", file);
  }

  return formData;
}

export const api = {
  me: () => request<{ profile: any; role: any }>('/api/auth/me'),
  companyAdminExists: () => request<{ exists: boolean; count: number }>('/api/onboarding/company-admin-exists'),
  claimCompanyAdmin: () => request<{ success: boolean }>('/api/onboarding/claim-company-admin', { method: 'POST' }),

  companyDashboard: () => request<any>('/api/company/dashboard'),
  companySchools: () => request<any[]>('/api/company/schools'),
  createCompanySchool: (body: any) => request<any>('/api/company/schools', { method: 'POST', body: JSON.stringify(body) }),
  createSchoolAdmin: (schoolId: string, body: any) => request<any>(`/api/company/schools/${schoolId}/admin`, { method: 'POST', body: JSON.stringify(body) }),
  companyPayments: () => request<any>('/api/company/payments'),
  companyStudents: () => request<any[]>('/api/company/students'),
  companyTeachers: () => request<any[]>('/api/company/teachers'),
  companySessionSchools: () => request<any[]>('/api/company/sessions/schools'),
  companySessions: () => request<any[]>('/api/company/sessions'),
  createCompanySession: (formData: FormData) => request<any>('/api/company/sessions', { method: 'POST', body: formData }),
  sessionRecordingUrl: (path: string) => request<{ signedUrl: string }>(`/api/company/sessions/recording-url?path=${encodeURIComponent(path)}`),
companySchoolOverview: (schoolId: string) =>
  request<any>(`/api/company/schools/${schoolId}/overview`),
  schoolDashboard: (schoolId: string) => request<any>(`/api/school/dashboard?schoolId=${encodeURIComponent(schoolId)}`),
  schoolStudents: (schoolId: string) => request<any[]>(`/api/school/students?schoolId=${encodeURIComponent(schoolId)}`),
  schoolTeachers: (schoolId: string) => request<any[]>(`/api/school/teachers?schoolId=${encodeURIComponent(schoolId)}`),
  createSchoolTeacher: (body: any) => request<any>('/api/school/teachers', { method: 'POST', body: JSON.stringify(body) }),
  schoolPayments: (schoolId: string) => request<any>(`/api/school/payments?schoolId=${encodeURIComponent(schoolId)}`),

  studentDashboard: () => request<any>('/api/student/dashboard'),

  teacherDashboard: () => request<any>('/api/teacher/dashboard'),
  teacherStudents: () => request<any[]>('/api/teacher/students'),
  createStudent: (body: any) => request<any>('/api/teacher/students', { method: 'POST', body: JSON.stringify(body) }),
  createTeacherClaim: (body: any) => request<any>('/api/teacher/claims', { method: 'POST', body: JSON.stringify(body) }),
  submitTeacherContact: (body: any) => request<any>('/api/teacher/contact', { method: 'POST', body: JSON.stringify(body) }),
  teacherWellnessStudents: () => request<any[]>('/api/teacher/wellness/students'),
  submitWellnessReport: (body: any) => request<any>('/api/teacher/wellness', { method: 'POST', body: JSON.stringify(body) }),
  studentClaims: () => request<any[]>("/api/student/claims"),



teacherClaims: () => request<any[]>("/api/teacher/claims"),


schoolClaims: () => request<any[]>("/api/school/claims"),
raiseStudentClaim: (body: any) =>
  requestForm<any>("/api/student/claims", buildClaimFormData(body)),

raiseTeacherClaim: (body: any) =>
  requestForm<any>("/api/teacher/claims", buildClaimFormData(body)),

raiseSchoolClaim: (body: any) =>
  requestForm<any>("/api/school/claims", buildClaimFormData(body)),

companyClaims: () => request<any[]>("/api/company/claims"),

updateCompanyClaimStatus: (claimId: string, status: string) =>
  request<any>(`/api/company/claims/${claimId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }),
updateCompanySchoolPlan: (schoolId: string, selected_plan_tier: string) =>
  request<any>(`/api/company/schools/${schoolId}/plan`, {
    method: "PUT",
    body: JSON.stringify({ selected_plan_tier }),
  }),

schoolAssignedPlan: () => request<any>("/api/school/plan"),

teacherAssignedPlan: () => request<any>("/api/teacher/plan"),

createSchoolStudent: (body: any) =>
  request<any>("/api/school/students", {
    method: "POST",
    body: JSON.stringify(body),
  }),

  // studentDashboard: () => request<any>("/api/student/dashboard"),

studentWellnessReports: () =>
  request<any[]>("/api/student/wellness-reports"),

studentSessions: () => request<any[]>("/api/student/sessions"),

studentSessionRecordingUrl: (sessionId: string) =>
  request<any>(`/api/student/sessions/${sessionId}/recording-url`),

// studentClaims: () => request<any[]>("/api/student/claims"),

studentMyClaims: () => request<any[]>("/api/student/my-claims"),

deleteCompanySchool: (schoolId: string) =>
  request<any>(`/api/company/schools/${schoolId}`, {
    method: "DELETE",
  }),
payTeacherStudentPendingFees: (studentId: string) =>
  request<any>(`/api/teacher/students/${studentId}/pay-pending-fees`, {
    method: "POST",
  }),

paySchoolStudentPendingFees: (studentId: string) =>
  request<any>(`/api/school/students/${studentId}/pay-pending-fees`, {
    method: "POST",
  }),
    createStudentSmartBuddyLaunch: () =>
    request<SmartBuddyLaunchResponse>("/api/smart-buddy/launch", {
      method: "POST",
    }),

  studentSmartBuddyProfile: () =>
    request<SmartBuddyProfileResponse>("/api/smart-buddy/profile"),

  saveStudentSmartBuddyProfile: (body: {
    form_data?: Record<string, unknown>;
    assessment_data?: Record<string, unknown>;
  }) =>
    request<any>("/api/smart-buddy/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  studentSmartBuddyReports: () =>
    request<SmartBuddyReport[]>("/api/smart-buddy/reports"),

  uploadStudentSmartBuddyReport: (formData: FormData) =>
    request<{ success: boolean; report: SmartBuddyReport }>(
      "/api/smart-buddy/reports",
      {
        method: "POST",
        body: formData,
      }
    ),

  studentSmartBuddyReportDownload: (reportId: string) =>
    request<SmartBuddyReport>(
      `/api/smart-buddy/reports/${reportId}/download`
    ),
// raiseStudentClaim: (body: any) =>
//   requestForm<any>("/api/student/claims", buildClaimFormData(body)),
};

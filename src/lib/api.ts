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

  schoolDashboard: (schoolId: string) => request<any>(`/api/school/dashboard?schoolId=${encodeURIComponent(schoolId)}`),
  schoolStudents: (schoolId: string) => request<any[]>(`/api/school/students?schoolId=${encodeURIComponent(schoolId)}`),
  schoolTeachers: (schoolId: string) => request<any[]>(`/api/school/teachers?schoolId=${encodeURIComponent(schoolId)}`),
  createSchoolTeacher: (body: any) => request<any>('/api/school/teachers', { method: 'POST', body: JSON.stringify(body) }),
  schoolPayments: (schoolId: string) => request<any>(`/api/school/payments?schoolId=${encodeURIComponent(schoolId)}`),

  studentDashboard: () => request<any>('/api/student/dashboard'),

  teacherDashboard: () => request<any>('/api/teacher/dashboard'),
  teacherStudents: () => request<any[]>('/api/teacher/students'),
  createStudent: (body: any) => request<any>('/api/teacher/students', { method: 'POST', body: JSON.stringify(body) }),
  teacherClaims: () => request<any[]>('/api/teacher/claims'),
  createTeacherClaim: (body: any) => request<any>('/api/teacher/claims', { method: 'POST', body: JSON.stringify(body) }),
  submitTeacherContact: (body: any) => request<any>('/api/teacher/contact', { method: 'POST', body: JSON.stringify(body) }),
  teacherWellnessStudents: () => request<any[]>('/api/teacher/wellness/students'),
  submitWellnessReport: (body: any) => request<any>('/api/teacher/wellness', { method: 'POST', body: JSON.stringify(body) }),
};

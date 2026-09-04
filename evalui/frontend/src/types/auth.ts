export type UserRole = 'PLATFORM_ADMIN' | 'ORG_ADMIN' | 'STAFF' | 'STUDENT';

export interface Organization {
  id: string;
  name: string;
  code: string;
  domain: string;
  logo_url?: string;
  student_email_pattern: string;
  departments: string[];
  batches: string[];
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization_id: string;
  organization_name: string;
  organization_code: string;
  department?: string;
  batch?: string;
  student_id?: string;
  avatar_url?: string;
}

export interface ParsedIdentity {
  name: string;
  email: string;
  domain: string;
  organization_name: string;
  organization_code: string;
  role: UserRole;
  department?: string;
  batch?: string;
}

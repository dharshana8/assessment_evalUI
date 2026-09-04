import { ParsedIdentity, UserRole } from '../types/auth';

export const KNOWN_ORGANIZATIONS = [
  {
    id: 'org-sece',
    name: 'Sri Eshwar College of Engineering',
    code: 'SECE',
    domain: 'sece.ac.in',
    student_pattern: 'name.s{batch}{department}@sece.ac.in',
    departments: ['CSBS', 'CSE', 'ECE', 'EEE', 'IT', 'MECH'],
    batches: ['2024', '2025', '2026', '2027']
  },
  {
    id: 'org-abc',
    name: 'ABC Institute of Technology',
    code: 'ABC',
    domain: 'abc.edu.in',
    student_pattern: 'roll.s{batch}{department}@abc.edu.in',
    departments: ['CSE', 'ECE', 'AI_DS'],
    batches: ['2024', '2025', '2026']
  }
];

export function parseInstitutionalEmail(email: string): ParsedIdentity {
  const cleanEmail = email.trim().toLowerCase();
  const domain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : '';

  // Match Organization by domain
  let org = KNOWN_ORGANIZATIONS.find(o => o.domain === domain);
  
  if (!org) {
    // Default fallback organization for generic emails
    org = {
      id: 'org-default',
      name: domain ? `${domain.split('.')[0].toUpperCase()} Institute` : 'Sri Eshwar College of Engineering',
      code: domain ? domain.split('.')[0].toUpperCase() : 'SECE',
      domain: domain || 'sece.ac.in',
      student_pattern: '{name}.s{batch}{department}@domain',
      departments: ['CSBS', 'CSE', 'ECE', 'IT'],
      batches: ['2024', '2025', '2026']
    };
  }

  // Determine Role & Metadata from Email
  const localPart = cleanEmail.split('@')[0] || '';

  if (cleanEmail === 'admin@sece.ac.in' || cleanEmail.startsWith('admin@')) {
    return {
      name: 'Organization Admin',
      email: cleanEmail,
      domain: org.domain,
      organization_name: org.name,
      organization_code: org.code,
      role: 'ORG_ADMIN',
      department: 'ADMIN',
      batch: undefined
    };
  }

  if (cleanEmail === 'superadmin@evalui.com') {
    return {
      name: 'Platform Superadmin',
      email: cleanEmail,
      domain: 'evalui.com',
      organization_name: 'EvalUI Platform',
      organization_code: 'PLATFORM',
      role: 'PLATFORM_ADMIN'
    };
  }

  // Check if student pattern matched (e.g. dharshana.s2024csbs@sece.ac.in)
  // Pattern: {name}.s{year}{dept}
  const studentRegex = /^([a-z0-9._]+)\.s(\d{4})([a-z]+)$/i;
  const match = localPart.match(studentRegex);

  if (match) {
    const rawName = match[1].replace(/[._]/g, ' ');
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const batch = match[2];
    const dept = match[3].toUpperCase();

    return {
      name: formattedName,
      email: cleanEmail,
      domain: org.domain,
      organization_name: org.name,
      organization_code: org.code,
      role: 'STUDENT',
      department: dept,
      batch: batch
    };
  }

  // Default to Staff / Faculty
  const staffName = localPart
    .split('.')[0]
    .replace(/[._]/g, ' ');
  const formattedStaffName = 'Dr. ' + (staffName.charAt(0).toUpperCase() + staffName.slice(1) || 'Dharshana');

  return {
    name: formattedStaffName,
    email: cleanEmail,
    domain: org.domain,
    organization_name: org.name,
    organization_code: org.code,
    role: 'STAFF',
    department: 'CSBS',
    batch: undefined
  };
}

export const parseEmailIdentity = parseInstitutionalEmail;


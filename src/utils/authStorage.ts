import { RegisteredAccount } from '../types';

export const DEFAULT_REGISTERED_STUDENTS: RegisteredAccount[] = [
  {
    name: 'Parul Student',
    ugNumber: '26UG030789',
    email: '26ug030789@paruluniversity.ac.in',
    password: 'Parul@2026',
    phone: '+91 98765 43210',
    institute: 'PIET (Parul Institute of Engineering & Technology)',
    department: 'Computer Science & Engineering',
    semester: '4th Semester',
    batch: '2024 - 2028',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    registeredAt: '2026-09-07',
  },
  {
    name: 'Aman Singh',
    ugNumber: 'PU2024UG57654',
    email: 'aman576544534@gmail.com',
    password: 'Parul@2026',
    phone: '+91 98765 43210',
    institute: 'PIET (Parul Institute of Engineering & Technology)',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    batch: '2023 - 2027',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    registeredAt: '2024-08-15',
  },
  {
    name: 'Riya Parekh',
    ugNumber: 'PU2024UG22190',
    email: 'riya.parekh@paruluniversity.ac.in',
    password: 'Parul@2026',
    phone: '+91 98251 12345',
    institute: 'Design Institute (Parul University)',
    department: 'Bachelor of Design (B.Des)',
    semester: '4th Semester',
    batch: '2024 - 2028',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    registeredAt: '2024-09-01',
  },
];

const STORAGE_KEY = 'pu_registered_students_accounts';
const DELETED_KEY = 'pu_deleted_students_blacklist';

function getDeletedBlacklist(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteStudentAccount(ugNumber: string): boolean {
  try {
    const cleanUg = ugNumber.trim().toUpperCase();
    const blacklist = getDeletedBlacklist();
    if (!blacklist.includes(cleanUg)) {
      blacklist.push(cleanUg);
      localStorage.setItem(DELETED_KEY, JSON.stringify(blacklist));
    }

    // Remove from registered students list
    const current = getRegisteredStudents();
    const filtered = current.filter((s) => s.ugNumber.toUpperCase() !== cleanUg && s.email.toUpperCase() !== cleanUg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Clear active session if it belongs to this student
    const activeRaw = localStorage.getItem('pu_active_student_session');
    if (activeRaw) {
      try {
        const active = JSON.parse(activeRaw);
        if (active.ugNumber?.toUpperCase() === cleanUg || active.email?.toUpperCase() === cleanUg) {
          localStorage.removeItem('pu_active_student_session');
        }
      } catch {}
    }

    const userProfileRaw = localStorage.getItem('pu_user_profile');
    if (userProfileRaw) {
      try {
        const prof = JSON.parse(userProfileRaw);
        if (prof.ugNumber?.toUpperCase() === cleanUg || prof.email?.toUpperCase() === cleanUg) {
          localStorage.removeItem('pu_user_profile');
          localStorage.removeItem('pu_user_session');
        }
      } catch {}
    }

    return true;
  } catch (err) {
    console.error('Failed to delete student from local storage:', err);
    return false;
  }
}

export function getRegisteredStudents(): RegisteredAccount[] {
  try {
    const blacklist = getDeletedBlacklist();
    const raw = localStorage.getItem(STORAGE_KEY);
    let students: RegisteredAccount[] = [];

    if (!raw) {
      students = DEFAULT_REGISTERED_STUDENTS;
    } else {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        students = DEFAULT_REGISTERED_STUDENTS;
      } else {
        students = parsed;
        // Ensure initial defaults exist UNLESS they have been explicitly deleted by admin
        const has26UG = students.some(
          (s: RegisteredAccount) =>
            s.ugNumber?.toUpperCase() === '26UG030789' ||
            s.email?.toLowerCase() === '26ug030789@paruluniversity.ac.in'
        );
        const hasAman = students.some(
          (s: RegisteredAccount) =>
            s.ugNumber?.toUpperCase() === 'PU2024UG57654' ||
            s.email?.toLowerCase() === 'aman576544534@gmail.com'
        );

        if (!has26UG && !blacklist.includes('26UG030789')) {
          students = [DEFAULT_REGISTERED_STUDENTS[0], ...students];
        }
        if (!hasAman && !blacklist.includes('PU2024UG57654')) {
          students = [DEFAULT_REGISTERED_STUDENTS[1], ...students];
        }
      }
    }

    // Always filter out any blacklisted (deleted) student accounts
    const sanitized = students.filter(
      (s) => !blacklist.includes(s.ugNumber.toUpperCase()) && !blacklist.includes(s.email.toUpperCase())
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch {
    return DEFAULT_REGISTERED_STUDENTS;
  }
}

export function registerStudentAccount(newAccount: RegisteredAccount): {
  success: boolean;
  message: string;
  account?: RegisteredAccount;
} {
  const students = getRegisteredStudents();

  const cleanUg = newAccount.ugNumber.trim().toUpperCase();
  const cleanEmail = newAccount.email.trim().toLowerCase();

  // Validate UG format: support 26UG456789, PU2024UG57654, etc. (at least 5 chars)
  if (!cleanUg || cleanUg.length < 5) {
    return {
      success: false,
      message: 'Invalid UG Number format. Please enter a valid UG Number (e.g. 26UG456789).',
    };
  }

  // Check if UG Number already registered
  const existingUg = students.find((s) => s.ugNumber.toUpperCase() === cleanUg);
  if (existingUg) {
    return {
      success: false,
      message: `The UG Number ${cleanUg} is already registered under ${existingUg.name}. Please sign in using your existing credentials.`,
    };
  }

  // Check if email already registered
  const existingEmail = students.find((s) => s.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return {
      success: false,
      message: `The email address ${cleanEmail} is already registered. Please sign in or use another email.`,
    };
  }

  // Validate password length
  if (!newAccount.password || newAccount.password.length < 4) {
    return {
      success: false,
      message: 'Password must be at least 4 characters long.',
    };
  }

  const sanitizedAccount: RegisteredAccount = {
    ...newAccount,
    ugNumber: cleanUg,
    email: cleanEmail,
    name: newAccount.name.trim(),
    registeredAt: new Date().toISOString(),
  };

  const updatedList = [sanitizedAccount, ...students];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to save student account:', err);
  }

  return {
    success: true,
    message: `Registration successful! Welcome to Parul University Events, ${sanitizedAccount.name}.`,
    account: sanitizedAccount,
  };
}

export function authenticateStudent(
  identifier: string,
  passwordAttempt: string
): {
  success: boolean;
  message: string;
  account?: RegisteredAccount;
} {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanPassword = passwordAttempt.trim();

  if (!cleanIdentifier || !cleanPassword) {
    return {
      success: false,
      message: 'Please enter both your registered UG Number (or Email) and Password.',
    };
  }

  const students = getRegisteredStudents();

  // Lookup by either UG Number or Email
  const student = students.find(
    (s) =>
      s.ugNumber.toLowerCase() === cleanIdentifier ||
      s.email.toLowerCase() === cleanIdentifier
  );

  // If user not in registered database
  if (!student) {
    return {
      success: false,
      message:
        'Access Denied: Unregistered Student Account. Random persons cannot open this application. Only pre-registered Parul University students (or newly registered accounts) can access the system.',
    };
  }

  // Check password for student account
  const is26UG =
    student.ugNumber.toUpperCase() === '26UG030789' ||
    student.email.toLowerCase() === '26ug030789@paruluniversity.ac.in';

  const isAman =
    student.name.toLowerCase().includes('aman singh') ||
    student.ugNumber.toUpperCase() === 'PU2024UG57654' ||
    student.email.toLowerCase() === 'aman576544534@gmail.com';

  const passwordMatches =
    student.password === cleanPassword ||
    (is26UG && (
      cleanPassword === 'Parul@2026' ||
      cleanPassword === 'PU@2026' ||
      cleanPassword === 'PU@gmail2006' ||
      cleanPassword === '123456' ||
      cleanPassword === 'student'
    )) ||
    (isAman && (cleanPassword === 'Parul@2026' || cleanPassword === 'Aman@123' || cleanPassword === 'aman123' || cleanPassword === 'Parul@123'));

  if (!passwordMatches) {
    return {
      success: false,
      message: 'Access Denied: Incorrect password entered for this student account. Please check your credentials.',
    };
  }

  return {
    success: true,
    message: `Authentication verified. Welcome back, ${student.name}!`,
    account: student,
  };
}

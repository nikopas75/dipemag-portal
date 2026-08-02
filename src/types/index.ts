export type AppId = 'hub' | 'aitisi' | 'programmatismos' | 'axiologisi';

export interface DbConfig {
  mode?: 'embedded' | 'external';
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  connected: boolean;
  isConnected?: boolean;
  activeConnectionMessage?: string;
  tablePrefix?: string;
}

// Module 1: e-Aitisi (Teachers)
export interface Teacher {
  id: string;
  afm: string;
  amka: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  specialtyCode: string; // e.g. ΠΕ70, ΠΕ02
  specialtyName: string;
  organicSchool: string;
  currentSchool: string;
  yearsOfService: number;
  email: string;
  phone: string;
}

export interface Application {
  id: string;
  protocolNumber: string;
  teacherId: string;
  teacherAfm: string;
  teacherName: string;
  specialty: string;
  applicationType: 'απόσπαση' | 'μετάθεση' | 'βελτίωση' | 'άδεια' | 'ειδική_αίτηση';
  status: 'υποβλήθηκε' | 'σε_επεξεργασία' | 'εγκρίθηκε' | 'απορρίφθηκε';
  submissionDate: string;
  preferences: string[];
  comments?: string;
  hasMedicalReason: boolean;
  hasCohabitation: boolean;
  coHabitationMuni?: string;
  maritalStatus: 'άγαμος' | 'έγγαμος' | 'διαζευγμένος';
  childrenCount: number;
}

// Module 2: Programmatismos (School Units)
export interface SchoolUnit {
  id: string;
  code: string; // Κωδικός ΥΠΑΙΘ
  name: string;
  directorName: string;
  directorEmail: string;
  directorPhone: string;
  educationalRegion: string;
  studentCount: number;
  teacherCount: number;
}

export interface SchoolPlan {
  id: string;
  schoolId: string;
  schoolName: string;
  academicYear: string;
  targetAxes: {
    axisTitle: string;
    actionDescription: string;
    responsiblePerson: string;
    budget: number;
    status: 'σχεδιασμός' | 'σε_εξέλιξη' | 'ολοκληρώθηκε';
  }[];
  infrastructureNeeds: string;
  educationalGoals: string;
  submittedAt?: string;
  status: 'πρόχειρο' | 'υποβλήθηκε' | 'εγκρίθηκε';
}

// Module 3: Axiologisi (Evaluation - Admin Only)
export interface EvaluationCycle {
  id: string;
  title: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  totalTeachers: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  status: 'ενεργός' | 'ολοκληρωμένος' | 'προγραμματισμένος';
}

export interface TeacherEvaluation {
  id: string;
  cycleId: string;
  teacherName: string;
  teacherAfm: string;
  specialty: string;
  schoolName: string;
  evaluatorA: string; // Σύμβουλος Εκπαίδευσης
  evaluatorB: string; // Διευθυντής Σχολείου
  stage: 'A1_διδακτικό_έργο' | 'A2_παιδαγωγικό_κλίμα' | 'B_υπηρεσιακό_έργο' | 'ολοκληρώθηκε';
  score?: number;
  grade?: 'εξαιρετικό' | 'πολύ_καλό' | 'ικανοποιητικό' | 'μη_ικανοποιητικό';
  updatedAt: string;
}

export interface UserSession {
  role: 'teacher' | 'director' | 'admin';
  appContext: AppId;
  userData?: Teacher | SchoolUnit | { username: string; name: string };
}

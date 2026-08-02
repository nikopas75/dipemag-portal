export type SchoolCategory = 'dim' | 'nip' | 'eid_dim' | 'eid_nip';

export interface AdminRecord {
  SchID: number;
  SchCode: string;
  SchName: string;
  PrName?: string;
  Organ?: number;
  Location?: string;
  category: SchoolCategory;
  StuTotal?: number;
  ClassTotal?: number;
  MathTimeStamp?: string;
  DiaTotal?: number;
  ProTotal?: number;
  EkpTimeStamp?: string;
}

export interface SchoolUser {
  SchID: number;
  SchCode: string;
  SchName: string;
  Organ: number;
  Location: string;
  PrID: string;
  PrName: string;
}

export interface DimMathData {
  dataID?: number;
  SchID?: number;
  SchCode: string;
  SchName?: string;
  StuA: number;
  StuB: number;
  StuC: number;
  StuD: number;
  StuE: number;
  StuF: number;
  StuTotal: number;
  ClassA: number;
  ClassB: number;
  ClassC: number;
  ClassD: number;
  ClassE: number;
  ClassF: number;
  ClassTotal: number;
  OloType: number;
  StuOloPZ: number;
  StuOloZ1: number;
  StuOloZ2: number;
  StuOloZ3: number;
  StuOloTotal: number;
  StuTE: number;
  StuTEVEV: number;
  StuTY: number;
  StuKatOik: number;
  Parat: string;
  TimeStamp?: string;
}

export interface NipMathData {
  dataID?: number;
  SchID?: number;
  SchCode: string;
  SchName?: string;
  StuA: number; // Προνήπια
  StuB: number; // Νήπια
  StuTotal: number; // Σύνολο
  StuPY: number; // Πρωινή Ζώνη
  StuOloA: number; // Ολοήμερο Προνήπια
  StuOloB: number; // Ολοήμερο Νήπια
  StuOloTotal: number; // Σύνολο Ολοημέρου
  StuTE: number; // Τμήμα Ένταξης (Μαθητές)
  StuApor: number; // Μαθητές χωρίς δυνατότητα Απορρόφησης
  Parat: string;
  TimeStamp?: string;
}

export interface EidNipMathData extends NipMathData {
  DE1EVP?: number; // ΕΒΠ
  PE21?: number; // Ψυχολόγοι
  PE23?: number; // Κοινωνικοί Λειτουργοί
  PE25?: number; // Σχολικοί Νοσηλευτές
  PE26?: number; // Λογοθεραπευτές
  PE28?: number; // Φυσιοθεραπευτές
  PE29?: number; // Εργοθεραπευτές
  PE30?: number; // Λοιπό ΕΕΠ
}

export interface EidMathData {
  dataID?: number;
  SchID?: number;
  SchCode: string;
  SchName?: string;
  StuProp: number; // Προπαρασκευαστική
  StuA: number;
  StuB: number;
  StuC: number;
  StuD: number;
  StuE: number;
  StuF: number;
  StuTotal: number;
  ClassProp: number;
  ClassA: number;
  ClassB: number;
  ClassC: number;
  ClassD: number;
  ClassE: number;
  ClassF: number;
  ClassTotal: number;
  StuOloPZ: number;
  StuOlo: number;
  Parat: string;
  TimeStamp?: string;
}

export interface DimEkpData {
  dataID?: number;
  SchID?: number;
  SchCode: string;
  SchName?: string;
  DiaPE70: number; DiaPE05: number; DiaPE06: number; DiaPE07: number; DiaPE08: number; DiaPE11: number; DiaPE79: number; DiaPE86: number; DiaPE91: number; DiaTotal: number;
  ProPE70: number; ProPE05: number; ProPE06: number; ProPE07: number; ProPE08: number; ProPE11: number; ProPE79: number; ProPE86: number; ProPE91: number; ProTotal: number;
  EZPE70: number; EZPE05: number; EZPE06: number; EZPE07: number; EZPE08: number; EZPE11: number; EZPE79: number; EZPE86: number; EZPE91: number; EZTotal: number;
  PYPE70: number; PYPE05: number; PYPE06: number; PYPE07: number; PYPE08: number; PYPE11: number; PYPE79: number; PYPE86: number; PYPE91: number; PYTotal: number;
  OloPE70: number; OloPE05: number; OloPE06: number; OloPE07: number; OloPE08: number; OloPE11: number; OloPE79: number; OloPE86: number; OloPE91: number; OloTotal: number;
  SitPE70: number; SitPE05: number; SitPE06: number; SitPE07: number; SitPE08: number; SitPE11: number; SitPE79: number; SitPE86: number; SitPE91: number; SitTotal: number;
  BibPE70: number; BibPE05: number; BibPE06: number; BibPE07: number; BibPE08: number; BibPE11: number; BibPE79: number; BibPE86: number; BibPE91: number; BibTotal: number;
  Parat: string;
  TimeStamp?: string;
}

export interface EidEkpData extends DimEkpData {
  DE1EVP?: number;
  PE21?: number;
  PE23?: number;
  PE25?: number;
  PE26?: number;
  PE28?: number;
  PE29?: number;
  PE30?: number;
}

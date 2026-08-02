import { DimMathData, NipMathData, EidNipMathData, EidMathData, DimEkpData, EidEkpData } from './types';

export const defaultDimMathData = (schCode: string, schName = ''): DimMathData => ({
  SchCode: schCode, SchName: schName,
  StuA: 0, StuB: 0, StuC: 0, StuD: 0, StuE: 0, StuF: 0, StuTotal: 0,
  ClassA: 0, ClassB: 0, ClassC: 0, ClassD: 0, ClassE: 0, ClassF: 0, ClassTotal: 0,
  OloType: 0, StuOloPZ: 0, StuOloZ1: 0, StuOloZ2: 0, StuOloZ3: 0, StuOloTotal: 0,
  StuTE: 0, StuTEVEV: 0, StuTY: 0, StuKatOik: 0, Parat: ''
});

export const defaultNipMathData = (schCode: string, schName = ''): NipMathData => ({
  SchCode: schCode, SchName: schName,
  StuA: 0, StuB: 0, StuTotal: 0, StuPY: 0, StuOloA: 0, StuOloB: 0, StuOloTotal: 0,
  StuTE: 0, StuApor: 0, Parat: ''
});

export const defaultEidNipMathData = (schCode: string, schName = ''): EidNipMathData => ({
  ...defaultNipMathData(schCode, schName),
  DE1EVP: 0, PE21: 0, PE23: 0, PE25: 0, PE26: 0, PE28: 0, PE29: 0, PE30: 0
});

export const defaultEidMathData = (schCode: string, schName = ''): EidMathData => ({
  SchCode: schCode, SchName: schName,
  StuProp: 0, StuA: 0, StuB: 0, StuC: 0, StuD: 0, StuE: 0, StuF: 0, StuTotal: 0,
  ClassProp: 0, ClassA: 0, ClassB: 0, ClassC: 0, ClassD: 0, ClassE: 0, ClassF: 0, ClassTotal: 0,
  StuOloPZ: 0, StuOlo: 0, Parat: ''
});

export const defaultDimEkpData = (schCode: string, schName = ''): DimEkpData => ({
  SchCode: schCode, SchName: schName,
  DiaPE70: 0, DiaPE05: 0, DiaPE06: 0, DiaPE07: 0, DiaPE08: 0, DiaPE11: 0, DiaPE79: 0, DiaPE86: 0, DiaPE91: 0, DiaTotal: 0,
  ProPE70: 0, ProPE05: 0, ProPE06: 0, ProPE07: 0, ProPE08: 0, ProPE11: 0, ProPE79: 0, ProPE86: 0, ProPE91: 0, ProTotal: 0,
  EZPE70: 0, EZPE05: 0, EZPE06: 0, EZPE07: 0, EZPE08: 0, EZPE11: 0, EZPE79: 0, EZPE86: 0, EZPE91: 0, EZTotal: 0,
  PYPE70: 0, PYPE05: 0, PYPE06: 0, PYPE07: 0, PYPE08: 0, PYPE11: 0, PYPE79: 0, PYPE86: 0, PYPE91: 0, PYTotal: 0,
  OloPE70: 0, OloPE05: 0, OloPE06: 0, OloPE07: 0, OloPE08: 0, OloPE11: 0, OloPE79: 0, OloPE86: 0, OloPE91: 0, OloTotal: 0,
  SitPE70: 0, SitPE05: 0, SitPE06: 0, SitPE07: 0, SitPE08: 0, SitPE11: 0, SitPE79: 0, SitPE86: 0, SitPE91: 0, SitTotal: 0,
  BibPE70: 0, BibPE05: 0, BibPE06: 0, BibPE07: 0, BibPE08: 0, BibPE11: 0, BibPE79: 0, BibPE86: 0, BibPE91: 0, BibTotal: 0,
  Parat: ''
});

export const defaultEidEkpData = (schCode: string, schName = ''): EidEkpData => ({
  ...defaultDimEkpData(schCode, schName),
  DE1EVP: 0, PE21: 0, PE23: 0, PE25: 0, PE26: 0, PE28: 0, PE29: 0, PE30: 0
});

export const getSchoolTypeLabel = (sourceTable: string) => {
  if (sourceTable === 'dim_users' || sourceTable === 'dim') return 'Δημοτικό';
  if (sourceTable === 'nip_users' || sourceTable === 'nip') return 'Νηπιαγωγείο';
  if (sourceTable === 'eid_dim_users' || sourceTable === 'eid_users' || sourceTable === 'eid_dim') return 'Ειδικό Δημοτικό';
  if (sourceTable === 'eid_nip_users' || sourceTable === 'eid_nip') return 'Ειδικό Νηπιαγωγείο';
  return 'Σχολείο';
};

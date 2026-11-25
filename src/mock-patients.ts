import { IPatient } from './services/patient.types';
import { attachPatientWhoNihGoals } from './utils/who-nih-goals-catalog';
import { p001 } from './mock-patients/p001';
import { p002 } from './mock-patients/p002';
import { p003 } from './mock-patients/p003';
import { p004 } from './mock-patients/p004';
import { p005 } from './mock-patients/p005';
import { p006 } from './mock-patients/p006';
import { p007 } from './mock-patients/p007';
import { p008 } from './mock-patients/p008';
import { p009 } from './mock-patients/p009';
import { p010 } from './mock-patients/p010';
import { p011 } from './mock-patients/p011';
import { p_mara_santos } from './mock-patients/p_mara_santos';
import { p_frida_kahlo } from './mock-patients/p_frida_kahlo';
import { p_edwin_smith_3 } from './mock-patients/p_edwin_smith_3';
import { p_charles_darwin } from './mock-patients/p_charles_darwin';
import { p_marie_curie } from './mock-patients/p_marie_curie';
import { p_srinivasa_ramanujan } from './mock-patients/p_srinivasa_ramanujan';
import { p_ada_lovelace } from './mock-patients/p_ada_lovelace';
import { p_default_patient } from './mock-patients/p_default_patient';
import { p_poms_adolescent } from './mock-patients/p_poms_adolescent';
import { p_loms_elder } from './mock-patients/p_loms_elder';
import { p_who_oral_sibi } from './mock-patients/p_who_oral_sibi';
import { p_who_amr_exposome } from './mock-patients/p_who_amr_exposome';
import { p_nih_recover_heal } from './mock-patients/p_nih_recover_heal';
import { p_nih_pgx_circadian } from './mock-patients/p_nih_pgx_circadian';

const RAW_MOCK_PATIENTS: IPatient[] = [
  p_ada_lovelace,
  p001,
  p002,
  p003,
  p004,
  p005,
  p006,
  p007,
  p008,
  p009,
  p010,
  p011,
  p_mara_santos,
  p_poms_adolescent,
  p_loms_elder,
  p_frida_kahlo,
  p_edwin_smith_3,
  p_charles_darwin,
  p_marie_curie,
  p_srinivasa_ramanujan,
  p_who_oral_sibi,
  p_who_amr_exposome,
  p_nih_recover_heal,
  p_nih_pgx_circadian,
  p_default_patient
];

export const MOCK_PATIENTS: IPatient[] = RAW_MOCK_PATIENTS.map(attachPatientWhoNihGoals);

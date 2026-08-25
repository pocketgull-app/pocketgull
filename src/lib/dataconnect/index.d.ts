import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CarePlan_Key {
  id: UUIDString;
  __typename?: 'CarePlan_Key';
}

export interface Clinician_Key {
  uid: string;
  __typename?: 'Clinician_Key';
}

export interface ConsultationSession_Key {
  id: UUIDString;
  __typename?: 'ConsultationSession_Key';
}

export interface CreateCarePlanData {
  carePlan_insert: CarePlan_Key;
}

export interface CreateCarePlanVariables {
  patientId: UUIDString;
  diagnosis: string;
  recommendations: string[];
}

export interface CreateConsultationSessionData {
  consultationSession_insert: ConsultationSession_Key;
}

export interface CreateConsultationSessionVariables {
  patientId: UUIDString;
  transcript: string;
  aiSummary: string;
}

export interface CreatePatientData {
  patient_insert: Patient_Key;
}

export interface CreatePatientVariables {
  firstName: string;
  lastName: string;
  dateOfBirth: DateString;
  gender?: string | null;
  vitalsHeartRate?: number | null;
  vitalsSystolicBP?: number | null;
  vitalsDiastolicBP?: number | null;
  currentSymptoms?: string[] | null;
}

export interface GetConsultationHistoryData {
  consultationSessions: ({
    id: UUIDString;
    transcript?: string | null;
    aiSummary?: string | null;
    createdAt: TimestampString;
  } & ConsultationSession_Key)[];
}

export interface GetConsultationHistoryVariables {
  patientId: UUIDString;
}

export interface GetPatientWithCarePlanData {
  patient?: {
    id: UUIDString;
    firstName: string;
    lastName: string;
    dateOfBirth: DateString;
    gender?: string | null;
    vitalsHeartRate?: number | null;
    vitalsSystolicBP?: number | null;
    vitalsDiastolicBP?: number | null;
    currentSymptoms?: string[] | null;
    carePlans_on_patient: ({
      id: UUIDString;
      diagnosis: string;
      recommendations: string[];
      createdAt: TimestampString;
    } & CarePlan_Key)[];
  } & Patient_Key;
}

export interface GetPatientWithCarePlanVariables {
  patientId: UUIDString;
}

export interface ListPatientsData {
  patients: ({
    id: UUIDString;
    firstName: string;
    lastName: string;
    currentSymptoms?: string[] | null;
    updatedAt: TimestampString;
  } & Patient_Key)[];
}

export interface Patient_Key {
  id: UUIDString;
  __typename?: 'Patient_Key';
}

export interface UpsertClinicianData {
  clinician_upsert: Clinician_Key;
}

export interface UpsertClinicianVariables {
  displayName: string;
}

interface UpsertClinicianRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertClinicianVariables): MutationRef<UpsertClinicianData, UpsertClinicianVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertClinicianVariables): MutationRef<UpsertClinicianData, UpsertClinicianVariables>;
  operationName: string;
}
export const upsertClinicianRef: UpsertClinicianRef;

export function upsertClinician(vars: UpsertClinicianVariables): MutationPromise<UpsertClinicianData, UpsertClinicianVariables>;
export function upsertClinician(dc: DataConnect, vars: UpsertClinicianVariables): MutationPromise<UpsertClinicianData, UpsertClinicianVariables>;

interface CreatePatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
  operationName: string;
}
export const createPatientRef: CreatePatientRef;

export function createPatient(vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;
export function createPatient(dc: DataConnect, vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;

interface CreateCarePlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCarePlanVariables): MutationRef<CreateCarePlanData, CreateCarePlanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCarePlanVariables): MutationRef<CreateCarePlanData, CreateCarePlanVariables>;
  operationName: string;
}
export const createCarePlanRef: CreateCarePlanRef;

export function createCarePlan(vars: CreateCarePlanVariables): MutationPromise<CreateCarePlanData, CreateCarePlanVariables>;
export function createCarePlan(dc: DataConnect, vars: CreateCarePlanVariables): MutationPromise<CreateCarePlanData, CreateCarePlanVariables>;

interface CreateConsultationSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateConsultationSessionVariables): MutationRef<CreateConsultationSessionData, CreateConsultationSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateConsultationSessionVariables): MutationRef<CreateConsultationSessionData, CreateConsultationSessionVariables>;
  operationName: string;
}
export const createConsultationSessionRef: CreateConsultationSessionRef;

export function createConsultationSession(vars: CreateConsultationSessionVariables): MutationPromise<CreateConsultationSessionData, CreateConsultationSessionVariables>;
export function createConsultationSession(dc: DataConnect, vars: CreateConsultationSessionVariables): MutationPromise<CreateConsultationSessionData, CreateConsultationSessionVariables>;

interface ListPatientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPatientsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPatientsData, undefined>;
  operationName: string;
}
export const listPatientsRef: ListPatientsRef;

export function listPatients(options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, undefined>;
export function listPatients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, undefined>;

interface GetPatientWithCarePlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPatientWithCarePlanVariables): QueryRef<GetPatientWithCarePlanData, GetPatientWithCarePlanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPatientWithCarePlanVariables): QueryRef<GetPatientWithCarePlanData, GetPatientWithCarePlanVariables>;
  operationName: string;
}
export const getPatientWithCarePlanRef: GetPatientWithCarePlanRef;

export function getPatientWithCarePlan(vars: GetPatientWithCarePlanVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientWithCarePlanData, GetPatientWithCarePlanVariables>;
export function getPatientWithCarePlan(dc: DataConnect, vars: GetPatientWithCarePlanVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientWithCarePlanData, GetPatientWithCarePlanVariables>;

interface GetConsultationHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetConsultationHistoryVariables): QueryRef<GetConsultationHistoryData, GetConsultationHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetConsultationHistoryVariables): QueryRef<GetConsultationHistoryData, GetConsultationHistoryVariables>;
  operationName: string;
}
export const getConsultationHistoryRef: GetConsultationHistoryRef;

export function getConsultationHistory(vars: GetConsultationHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetConsultationHistoryData, GetConsultationHistoryVariables>;
export function getConsultationHistory(dc: DataConnect, vars: GetConsultationHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetConsultationHistoryData, GetConsultationHistoryVariables>;


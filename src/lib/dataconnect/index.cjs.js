const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'pocketgull-service',
  location: 'us-west1'
};
exports.connectorConfig = connectorConfig;

const upsertClinicianRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertClinician', inputVars);
}
upsertClinicianRef.operationName = 'UpsertClinician';
exports.upsertClinicianRef = upsertClinicianRef;

exports.upsertClinician = function upsertClinician(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertClinicianRef(dcInstance, inputVars));
}
;

const createPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePatient', inputVars);
}
createPatientRef.operationName = 'CreatePatient';
exports.createPatientRef = createPatientRef;

exports.createPatient = function createPatient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createPatientRef(dcInstance, inputVars));
}
;

const createCarePlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCarePlan', inputVars);
}
createCarePlanRef.operationName = 'CreateCarePlan';
exports.createCarePlanRef = createCarePlanRef;

exports.createCarePlan = function createCarePlan(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCarePlanRef(dcInstance, inputVars));
}
;

const createConsultationSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateConsultationSession', inputVars);
}
createConsultationSessionRef.operationName = 'CreateConsultationSession';
exports.createConsultationSessionRef = createConsultationSessionRef;

exports.createConsultationSession = function createConsultationSession(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createConsultationSessionRef(dcInstance, inputVars));
}
;

const listPatientsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPatients');
}
listPatientsRef.operationName = 'ListPatients';
exports.listPatientsRef = listPatientsRef;

exports.listPatients = function listPatients(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listPatientsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getPatientWithCarePlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPatientWithCarePlan', inputVars);
}
getPatientWithCarePlanRef.operationName = 'GetPatientWithCarePlan';
exports.getPatientWithCarePlanRef = getPatientWithCarePlanRef;

exports.getPatientWithCarePlan = function getPatientWithCarePlan(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getPatientWithCarePlanRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getConsultationHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetConsultationHistory', inputVars);
}
getConsultationHistoryRef.operationName = 'GetConsultationHistory';
exports.getConsultationHistoryRef = getConsultationHistoryRef;

exports.getConsultationHistory = function getConsultationHistory(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getConsultationHistoryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

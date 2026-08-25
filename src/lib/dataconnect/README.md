# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPatients*](#listpatients)
  - [*GetPatientWithCarePlan*](#getpatientwithcareplan)
  - [*GetConsultationHistory*](#getconsultationhistory)
- [**Mutations**](#mutations)
  - [*UpsertClinician*](#upsertclinician)
  - [*CreatePatient*](#createpatient)
  - [*CreateCarePlan*](#createcareplan)
  - [*CreateConsultationSession*](#createconsultationsession)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@pocketgull/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@pocketgull/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@pocketgull/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPatients
You can execute the `ListPatients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listPatients(options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, undefined>;

interface ListPatientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPatientsData, undefined>;
}
export const listPatientsRef: ListPatientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPatients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, undefined>;

interface ListPatientsRef {
  ...
  (dc: DataConnect): QueryRef<ListPatientsData, undefined>;
}
export const listPatientsRef: ListPatientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPatientsRef:
```typescript
const name = listPatientsRef.operationName;
console.log(name);
```

### Variables
The `ListPatients` query has no variables.
### Return Type
Recall that executing the `ListPatients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPatientsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPatientsData {
  patients: ({
    id: UUIDString;
    firstName: string;
    lastName: string;
    currentSymptoms?: string[] | null;
    updatedAt: TimestampString;
  } & Patient_Key)[];
}
```
### Using `ListPatients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPatients } from '@pocketgull/dataconnect';


// Call the `listPatients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPatients();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPatients(dataConnect);

console.log(data.patients);

// Or, you can use the `Promise` API.
listPatients().then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

### Using `ListPatients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPatientsRef } from '@pocketgull/dataconnect';


// Call the `listPatientsRef()` function to get a reference to the query.
const ref = listPatientsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPatientsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

## GetPatientWithCarePlan
You can execute the `GetPatientWithCarePlan` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getPatientWithCarePlan(vars: GetPatientWithCarePlanVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientWithCarePlanData, GetPatientWithCarePlanVariables>;

interface GetPatientWithCarePlanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPatientWithCarePlanVariables): QueryRef<GetPatientWithCarePlanData, GetPatientWithCarePlanVariables>;
}
export const getPatientWithCarePlanRef: GetPatientWithCarePlanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPatientWithCarePlan(dc: DataConnect, vars: GetPatientWithCarePlanVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientWithCarePlanData, GetPatientWithCarePlanVariables>;

interface GetPatientWithCarePlanRef {
  ...
  (dc: DataConnect, vars: GetPatientWithCarePlanVariables): QueryRef<GetPatientWithCarePlanData, GetPatientWithCarePlanVariables>;
}
export const getPatientWithCarePlanRef: GetPatientWithCarePlanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPatientWithCarePlanRef:
```typescript
const name = getPatientWithCarePlanRef.operationName;
console.log(name);
```

### Variables
The `GetPatientWithCarePlan` query requires an argument of type `GetPatientWithCarePlanVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPatientWithCarePlanVariables {
  patientId: UUIDString;
}
```
### Return Type
Recall that executing the `GetPatientWithCarePlan` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPatientWithCarePlanData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetPatientWithCarePlan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPatientWithCarePlan, GetPatientWithCarePlanVariables } from '@pocketgull/dataconnect';

// The `GetPatientWithCarePlan` query requires an argument of type `GetPatientWithCarePlanVariables`:
const getPatientWithCarePlanVars: GetPatientWithCarePlanVariables = {
  patientId: ..., 
};

// Call the `getPatientWithCarePlan()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPatientWithCarePlan(getPatientWithCarePlanVars);
// Variables can be defined inline as well.
const { data } = await getPatientWithCarePlan({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPatientWithCarePlan(dataConnect, getPatientWithCarePlanVars);

console.log(data.patient);

// Or, you can use the `Promise` API.
getPatientWithCarePlan(getPatientWithCarePlanVars).then((response) => {
  const data = response.data;
  console.log(data.patient);
});
```

### Using `GetPatientWithCarePlan`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPatientWithCarePlanRef, GetPatientWithCarePlanVariables } from '@pocketgull/dataconnect';

// The `GetPatientWithCarePlan` query requires an argument of type `GetPatientWithCarePlanVariables`:
const getPatientWithCarePlanVars: GetPatientWithCarePlanVariables = {
  patientId: ..., 
};

// Call the `getPatientWithCarePlanRef()` function to get a reference to the query.
const ref = getPatientWithCarePlanRef(getPatientWithCarePlanVars);
// Variables can be defined inline as well.
const ref = getPatientWithCarePlanRef({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPatientWithCarePlanRef(dataConnect, getPatientWithCarePlanVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patient);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patient);
});
```

## GetConsultationHistory
You can execute the `GetConsultationHistory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getConsultationHistory(vars: GetConsultationHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetConsultationHistoryData, GetConsultationHistoryVariables>;

interface GetConsultationHistoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetConsultationHistoryVariables): QueryRef<GetConsultationHistoryData, GetConsultationHistoryVariables>;
}
export const getConsultationHistoryRef: GetConsultationHistoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getConsultationHistory(dc: DataConnect, vars: GetConsultationHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetConsultationHistoryData, GetConsultationHistoryVariables>;

interface GetConsultationHistoryRef {
  ...
  (dc: DataConnect, vars: GetConsultationHistoryVariables): QueryRef<GetConsultationHistoryData, GetConsultationHistoryVariables>;
}
export const getConsultationHistoryRef: GetConsultationHistoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getConsultationHistoryRef:
```typescript
const name = getConsultationHistoryRef.operationName;
console.log(name);
```

### Variables
The `GetConsultationHistory` query requires an argument of type `GetConsultationHistoryVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetConsultationHistoryVariables {
  patientId: UUIDString;
}
```
### Return Type
Recall that executing the `GetConsultationHistory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetConsultationHistoryData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetConsultationHistoryData {
  consultationSessions: ({
    id: UUIDString;
    transcript?: string | null;
    aiSummary?: string | null;
    createdAt: TimestampString;
  } & ConsultationSession_Key)[];
}
```
### Using `GetConsultationHistory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getConsultationHistory, GetConsultationHistoryVariables } from '@pocketgull/dataconnect';

// The `GetConsultationHistory` query requires an argument of type `GetConsultationHistoryVariables`:
const getConsultationHistoryVars: GetConsultationHistoryVariables = {
  patientId: ..., 
};

// Call the `getConsultationHistory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getConsultationHistory(getConsultationHistoryVars);
// Variables can be defined inline as well.
const { data } = await getConsultationHistory({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getConsultationHistory(dataConnect, getConsultationHistoryVars);

console.log(data.consultationSessions);

// Or, you can use the `Promise` API.
getConsultationHistory(getConsultationHistoryVars).then((response) => {
  const data = response.data;
  console.log(data.consultationSessions);
});
```

### Using `GetConsultationHistory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getConsultationHistoryRef, GetConsultationHistoryVariables } from '@pocketgull/dataconnect';

// The `GetConsultationHistory` query requires an argument of type `GetConsultationHistoryVariables`:
const getConsultationHistoryVars: GetConsultationHistoryVariables = {
  patientId: ..., 
};

// Call the `getConsultationHistoryRef()` function to get a reference to the query.
const ref = getConsultationHistoryRef(getConsultationHistoryVars);
// Variables can be defined inline as well.
const ref = getConsultationHistoryRef({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getConsultationHistoryRef(dataConnect, getConsultationHistoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.consultationSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.consultationSessions);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## UpsertClinician
You can execute the `UpsertClinician` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
upsertClinician(vars: UpsertClinicianVariables): MutationPromise<UpsertClinicianData, UpsertClinicianVariables>;

interface UpsertClinicianRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertClinicianVariables): MutationRef<UpsertClinicianData, UpsertClinicianVariables>;
}
export const upsertClinicianRef: UpsertClinicianRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertClinician(dc: DataConnect, vars: UpsertClinicianVariables): MutationPromise<UpsertClinicianData, UpsertClinicianVariables>;

interface UpsertClinicianRef {
  ...
  (dc: DataConnect, vars: UpsertClinicianVariables): MutationRef<UpsertClinicianData, UpsertClinicianVariables>;
}
export const upsertClinicianRef: UpsertClinicianRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertClinicianRef:
```typescript
const name = upsertClinicianRef.operationName;
console.log(name);
```

### Variables
The `UpsertClinician` mutation requires an argument of type `UpsertClinicianVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertClinicianVariables {
  displayName: string;
}
```
### Return Type
Recall that executing the `UpsertClinician` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertClinicianData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertClinicianData {
  clinician_upsert: Clinician_Key;
}
```
### Using `UpsertClinician`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertClinician, UpsertClinicianVariables } from '@pocketgull/dataconnect';

// The `UpsertClinician` mutation requires an argument of type `UpsertClinicianVariables`:
const upsertClinicianVars: UpsertClinicianVariables = {
  displayName: ..., 
};

// Call the `upsertClinician()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertClinician(upsertClinicianVars);
// Variables can be defined inline as well.
const { data } = await upsertClinician({ displayName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertClinician(dataConnect, upsertClinicianVars);

console.log(data.clinician_upsert);

// Or, you can use the `Promise` API.
upsertClinician(upsertClinicianVars).then((response) => {
  const data = response.data;
  console.log(data.clinician_upsert);
});
```

### Using `UpsertClinician`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertClinicianRef, UpsertClinicianVariables } from '@pocketgull/dataconnect';

// The `UpsertClinician` mutation requires an argument of type `UpsertClinicianVariables`:
const upsertClinicianVars: UpsertClinicianVariables = {
  displayName: ..., 
};

// Call the `upsertClinicianRef()` function to get a reference to the mutation.
const ref = upsertClinicianRef(upsertClinicianVars);
// Variables can be defined inline as well.
const ref = upsertClinicianRef({ displayName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertClinicianRef(dataConnect, upsertClinicianVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.clinician_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.clinician_upsert);
});
```

## CreatePatient
You can execute the `CreatePatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createPatient(vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;

interface CreatePatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
}
export const createPatientRef: CreatePatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPatient(dc: DataConnect, vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;

interface CreatePatientRef {
  ...
  (dc: DataConnect, vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
}
export const createPatientRef: CreatePatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPatientRef:
```typescript
const name = createPatientRef.operationName;
console.log(name);
```

### Variables
The `CreatePatient` mutation requires an argument of type `CreatePatientVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreatePatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePatientData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePatientData {
  patient_insert: Patient_Key;
}
```
### Using `CreatePatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPatient, CreatePatientVariables } from '@pocketgull/dataconnect';

// The `CreatePatient` mutation requires an argument of type `CreatePatientVariables`:
const createPatientVars: CreatePatientVariables = {
  firstName: ..., 
  lastName: ..., 
  dateOfBirth: ..., 
  gender: ..., // optional
  vitalsHeartRate: ..., // optional
  vitalsSystolicBP: ..., // optional
  vitalsDiastolicBP: ..., // optional
  currentSymptoms: ..., // optional
};

// Call the `createPatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPatient(createPatientVars);
// Variables can be defined inline as well.
const { data } = await createPatient({ firstName: ..., lastName: ..., dateOfBirth: ..., gender: ..., vitalsHeartRate: ..., vitalsSystolicBP: ..., vitalsDiastolicBP: ..., currentSymptoms: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPatient(dataConnect, createPatientVars);

console.log(data.patient_insert);

// Or, you can use the `Promise` API.
createPatient(createPatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient_insert);
});
```

### Using `CreatePatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPatientRef, CreatePatientVariables } from '@pocketgull/dataconnect';

// The `CreatePatient` mutation requires an argument of type `CreatePatientVariables`:
const createPatientVars: CreatePatientVariables = {
  firstName: ..., 
  lastName: ..., 
  dateOfBirth: ..., 
  gender: ..., // optional
  vitalsHeartRate: ..., // optional
  vitalsSystolicBP: ..., // optional
  vitalsDiastolicBP: ..., // optional
  currentSymptoms: ..., // optional
};

// Call the `createPatientRef()` function to get a reference to the mutation.
const ref = createPatientRef(createPatientVars);
// Variables can be defined inline as well.
const ref = createPatientRef({ firstName: ..., lastName: ..., dateOfBirth: ..., gender: ..., vitalsHeartRate: ..., vitalsSystolicBP: ..., vitalsDiastolicBP: ..., currentSymptoms: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPatientRef(dataConnect, createPatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_insert);
});
```

## CreateCarePlan
You can execute the `CreateCarePlan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createCarePlan(vars: CreateCarePlanVariables): MutationPromise<CreateCarePlanData, CreateCarePlanVariables>;

interface CreateCarePlanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCarePlanVariables): MutationRef<CreateCarePlanData, CreateCarePlanVariables>;
}
export const createCarePlanRef: CreateCarePlanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCarePlan(dc: DataConnect, vars: CreateCarePlanVariables): MutationPromise<CreateCarePlanData, CreateCarePlanVariables>;

interface CreateCarePlanRef {
  ...
  (dc: DataConnect, vars: CreateCarePlanVariables): MutationRef<CreateCarePlanData, CreateCarePlanVariables>;
}
export const createCarePlanRef: CreateCarePlanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCarePlanRef:
```typescript
const name = createCarePlanRef.operationName;
console.log(name);
```

### Variables
The `CreateCarePlan` mutation requires an argument of type `CreateCarePlanVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCarePlanVariables {
  patientId: UUIDString;
  diagnosis: string;
  recommendations: string[];
}
```
### Return Type
Recall that executing the `CreateCarePlan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCarePlanData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCarePlanData {
  carePlan_insert: CarePlan_Key;
}
```
### Using `CreateCarePlan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCarePlan, CreateCarePlanVariables } from '@pocketgull/dataconnect';

// The `CreateCarePlan` mutation requires an argument of type `CreateCarePlanVariables`:
const createCarePlanVars: CreateCarePlanVariables = {
  patientId: ..., 
  diagnosis: ..., 
  recommendations: ..., 
};

// Call the `createCarePlan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCarePlan(createCarePlanVars);
// Variables can be defined inline as well.
const { data } = await createCarePlan({ patientId: ..., diagnosis: ..., recommendations: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCarePlan(dataConnect, createCarePlanVars);

console.log(data.carePlan_insert);

// Or, you can use the `Promise` API.
createCarePlan(createCarePlanVars).then((response) => {
  const data = response.data;
  console.log(data.carePlan_insert);
});
```

### Using `CreateCarePlan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCarePlanRef, CreateCarePlanVariables } from '@pocketgull/dataconnect';

// The `CreateCarePlan` mutation requires an argument of type `CreateCarePlanVariables`:
const createCarePlanVars: CreateCarePlanVariables = {
  patientId: ..., 
  diagnosis: ..., 
  recommendations: ..., 
};

// Call the `createCarePlanRef()` function to get a reference to the mutation.
const ref = createCarePlanRef(createCarePlanVars);
// Variables can be defined inline as well.
const ref = createCarePlanRef({ patientId: ..., diagnosis: ..., recommendations: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCarePlanRef(dataConnect, createCarePlanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.carePlan_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.carePlan_insert);
});
```

## CreateConsultationSession
You can execute the `CreateConsultationSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createConsultationSession(vars: CreateConsultationSessionVariables): MutationPromise<CreateConsultationSessionData, CreateConsultationSessionVariables>;

interface CreateConsultationSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateConsultationSessionVariables): MutationRef<CreateConsultationSessionData, CreateConsultationSessionVariables>;
}
export const createConsultationSessionRef: CreateConsultationSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createConsultationSession(dc: DataConnect, vars: CreateConsultationSessionVariables): MutationPromise<CreateConsultationSessionData, CreateConsultationSessionVariables>;

interface CreateConsultationSessionRef {
  ...
  (dc: DataConnect, vars: CreateConsultationSessionVariables): MutationRef<CreateConsultationSessionData, CreateConsultationSessionVariables>;
}
export const createConsultationSessionRef: CreateConsultationSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createConsultationSessionRef:
```typescript
const name = createConsultationSessionRef.operationName;
console.log(name);
```

### Variables
The `CreateConsultationSession` mutation requires an argument of type `CreateConsultationSessionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateConsultationSessionVariables {
  patientId: UUIDString;
  transcript: string;
  aiSummary: string;
}
```
### Return Type
Recall that executing the `CreateConsultationSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateConsultationSessionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateConsultationSessionData {
  consultationSession_insert: ConsultationSession_Key;
}
```
### Using `CreateConsultationSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createConsultationSession, CreateConsultationSessionVariables } from '@pocketgull/dataconnect';

// The `CreateConsultationSession` mutation requires an argument of type `CreateConsultationSessionVariables`:
const createConsultationSessionVars: CreateConsultationSessionVariables = {
  patientId: ..., 
  transcript: ..., 
  aiSummary: ..., 
};

// Call the `createConsultationSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createConsultationSession(createConsultationSessionVars);
// Variables can be defined inline as well.
const { data } = await createConsultationSession({ patientId: ..., transcript: ..., aiSummary: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createConsultationSession(dataConnect, createConsultationSessionVars);

console.log(data.consultationSession_insert);

// Or, you can use the `Promise` API.
createConsultationSession(createConsultationSessionVars).then((response) => {
  const data = response.data;
  console.log(data.consultationSession_insert);
});
```

### Using `CreateConsultationSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createConsultationSessionRef, CreateConsultationSessionVariables } from '@pocketgull/dataconnect';

// The `CreateConsultationSession` mutation requires an argument of type `CreateConsultationSessionVariables`:
const createConsultationSessionVars: CreateConsultationSessionVariables = {
  patientId: ..., 
  transcript: ..., 
  aiSummary: ..., 
};

// Call the `createConsultationSessionRef()` function to get a reference to the mutation.
const ref = createConsultationSessionRef(createConsultationSessionVars);
// Variables can be defined inline as well.
const ref = createConsultationSessionRef({ patientId: ..., transcript: ..., aiSummary: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createConsultationSessionRef(dataConnect, createConsultationSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.consultationSession_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.consultationSession_insert);
});
```


# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertClinician, createPatient, createCarePlan, createConsultationSession, listPatients, getPatientWithCarePlan, getConsultationHistory } from '@pocketgull/dataconnect';


// Operation UpsertClinician:  For variables, look at type UpsertClinicianVars in ../index.d.ts
const { data } = await UpsertClinician(dataConnect, upsertClinicianVars);

// Operation CreatePatient:  For variables, look at type CreatePatientVars in ../index.d.ts
const { data } = await CreatePatient(dataConnect, createPatientVars);

// Operation CreateCarePlan:  For variables, look at type CreateCarePlanVars in ../index.d.ts
const { data } = await CreateCarePlan(dataConnect, createCarePlanVars);

// Operation CreateConsultationSession:  For variables, look at type CreateConsultationSessionVars in ../index.d.ts
const { data } = await CreateConsultationSession(dataConnect, createConsultationSessionVars);

// Operation ListPatients: 
const { data } = await ListPatients(dataConnect);

// Operation GetPatientWithCarePlan:  For variables, look at type GetPatientWithCarePlanVars in ../index.d.ts
const { data } = await GetPatientWithCarePlan(dataConnect, getPatientWithCarePlanVars);

// Operation GetConsultationHistory:  For variables, look at type GetConsultationHistoryVars in ../index.d.ts
const { data } = await GetConsultationHistory(dataConnect, getConsultationHistoryVars);


```
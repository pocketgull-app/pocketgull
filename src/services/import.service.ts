import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';
import { IDynamicMarker, IDiagnosticScan, IPatientVitals, BODY_PART_MAPPING } from './patient.types';

export interface IParseResult {
  success: boolean;
  message: string;
  scansAdded?: number;
  conditionsAdded?: number;
  medsAdded?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private patientState = inject(PatientStateService);
  private patientManager = inject(PatientManagementService);

  /**
   * Process an uploaded File payload.
   * Supports PocketGull Native exports and standard FHIR/Epic Lucy JSON bundles.
   */
  async processFile(file: File): Promise<IParseResult> {
    try {
      let data: any;
      let text = await file.text();

      // Check if it's an XML file (e.g. CCDA from Share Everywhere)
      if (file.name.endsWith('.xml') || text.trim().startsWith('<')) {
          return this.importCCDAXml(text);
      }

      data = JSON.parse(text);

      // Check for PocketGull Native format
      if (data._format === 'pocket-gull-native') {
        return this.importNative(data);
      }

      // Check for FHIR Bundle format (Epic Lucy generally comes as a Bundle)
      if (data.resourceType === 'Bundle' && Array.isArray(data.entry)) {
        return this.importFhirBundle(data);
      }

      return { success: false, message: 'Unrecognized file format. Expected a PocketGull Native export or a FHIR JSON Bundle.' };

    } catch (e: any) {
      console.error('[ImportService] File parse error:', e);
      return { success: false, message: `Failed to parse file: ${e.message}` };
    }
  }

  /**
   * Directly map over PocketGull exports back into the system state.
   */
  private importNative(data: any): IParseResult {
    const p = data.patient;
    if (!p || !p.name) return { success: false, message: 'Invalid PocketGull export.' };

    const currentPatientId = this.patientManager.selectedPatientId();
    if (!currentPatientId) {
      return { success: false, message: 'Please select a patient first to import data into their profile.' };
    }

    // Merge native history and scans into the current patient object
    const currentPatientInfo = this.patientManager.selectedPatient();
    if (currentPatientInfo) {
      if (p.scans) {
        currentPatientInfo.scans = [...(currentPatientInfo.scans || []), ...p.scans];
      }
      if (p.history) {
        currentPatientInfo.history = [...(currentPatientInfo.history || []), ...p.history];
      }
      if (p.bookmarks) {
        currentPatientInfo.bookmarks = [...(currentPatientInfo.bookmarks || []), ...p.bookmarks];
      }
      
      // Re-trigger patient select to force UI update
      this.patientManager.selectedPatientId.set(currentPatientId);
      
      // Load any vital/state properties from the export if they don't exist
      if (p.vitals) {
        Object.entries(p.vitals).forEach(([key, value]) => {
           if (!this.patientState.vitals()[key as keyof IPatientVitals]) {
             this.patientState.updateVital(key as keyof IPatientVitals, String(value));
           }
        });
      }
    }

    return { 
      success: true, 
      message: 'Successfully imported native data.',
      scansAdded: p.scans?.length || 0
    };
  }

  /**
   * Parse a FHIR / Epic Lucy JSON bundle. 
   * Maps DiagnosticReport, DocumentReference, Observation, and Condition resources.
   */
  private importFhirBundle(bundle: any): IParseResult {
    const currentPatient = this.patientManager.selectedPatient();
    if (!currentPatient) {
      return { success: false, message: 'Please select a patient profile first to receive the imported FHIR/Lucy data.' };
    }

    let scansAdded = 0;
    let conditionsAdded = 0;
    let medsAdded = 0;

    const entries = bundle.entry || [];
    const newScans: IDiagnosticScan[] = [];

    entries.forEach((e: any) => {
      const resource = e.resource;
      if (!resource) return;

      switch (resource.resourceType) {
        case 'DiagnosticReport': {
          let scanDesc = resource.conclusion || resource.code?.text || 'Imported Diagnostic Report';
          try {
             if (resource.presentedForm?.[0]?.data) {
                scanDesc = atob(resource.presentedForm[0].data);
             }
          } catch(err) { /* ignore atob failure */ }
          
          newScans.push({
            id: resource.id || `fhir_scan_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            type: resource.category?.[0]?.coding?.[0]?.display || 'Lab Report',
            title: resource.code?.text || 'Diagnostic Report',
            date: resource.effectiveDateTime?.split('T')[0] || new Date().toISOString().split('T')[0],
            bodyPartId: 'full_body', // Default to full body for unmapped FHIR imports
            description: scanDesc,
            status: 'Pending',
          });
          scansAdded++;
          break;
        }
        case 'DocumentReference': {
          // Epic Lucy often stores clinical notes or PDFs as DocumentReferences
          const docTitle = resource.type?.text || resource.content?.[0]?.attachment?.title || 'Clinical Document';
          const docDate = resource.date?.split('T')[0] || new Date().toISOString().split('T')[0];
          let embeddedText = '';
          
          if (resource.content?.[0]?.attachment?.contentType === 'text/plain') {
            const data = resource.content[0].attachment.data;
            if (data) {
                try { embeddedText = atob(data); } catch(err) { console.warn('[ImportService] Failed to decode base64 FHIR attachment:', err); }
            }
          }

          newScans.push({
            id: resource.id || `fhir_doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: docTitle,
            date: docDate,
            type: 'Document',
            description: embeddedText || 'Imported Document Reference (Attachment unmapped)',
            status: 'Pending'
          });
          scansAdded++;
          break;
        }
        case 'Condition': {
          const codings = resource.code?.coding || [];
          let westernName = '';
          let tcmPattern = '';
          let ayurvedicImbalance = '';

          codings.forEach((c: any) => {
            const system = (c.system || '').toLowerCase();
            const display = c.display || c.code || '';
            if (system.includes('tcm') || system.includes('traditional-chinese-medicine') || (system.includes('icd-11') && c.code?.startsWith('SF'))) {
              tcmPattern = display;
            } else if (system.includes('ayur') || system.includes('namaste')) {
              ayurvedicImbalance = display;
            } else {
              if (!westernName) westernName = display;
            }
          });

          if (!westernName) {
            westernName = resource.code?.text || 'Unspecified Condition';
          }

          if (westernName && !currentPatient.preexistingConditions.includes(westernName)) {
            currentPatient.preexistingConditions.push(westernName);
          }

          let bodyPartId = 'full_body';
          const bodySiteDisplay = resource.bodySite?.[0]?.coding?.[0]?.display || resource.bodySite?.[0]?.text;
          if (bodySiteDisplay) {
            const mapped = BODY_PART_MAPPING[bodySiteDisplay.toLowerCase()];
            if (mapped) bodyPartId = mapped;
          } else {
            const nameLower = westernName.toLowerCase();
            for (const [key, val] of Object.entries(BODY_PART_MAPPING)) {
              if (nameLower.includes(key)) {
                bodyPartId = val;
                break;
              }
            }
          }

          currentPatient.issues = currentPatient.issues || {};
          currentPatient.issues[bodyPartId] = currentPatient.issues[bodyPartId] || [];

          let existingIssue = currentPatient.issues[bodyPartId].find(issue => issue.name === westernName);
          if (existingIssue) {
            if (tcmPattern) existingIssue.tcmPattern = tcmPattern;
            if (ayurvedicImbalance) existingIssue.ayurvedicImbalance = ayurvedicImbalance;
          } else {
            currentPatient.issues[bodyPartId].push({
              id: bodyPartId,
              noteId: `imported_cond_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              name: westernName,
              painLevel: 5,
              description: resource.note?.[0]?.text || resource.code?.text || `Imported condition: ${westernName}`,
              symptoms: [],
              tcmPattern,
              ayurvedicImbalance
            });
            conditionsAdded++;
          }

          currentPatient.history = currentPatient.history || [];
          currentPatient.history.push({
            type: 'PatientSummaryUpdate',
            date: new Date().toISOString().split('T')[0],
            summary: `Imported multi-coded FHIR Condition: ${westernName} (TCM: ${tcmPattern || 'None'}, Ayurveda: ${ayurvedicImbalance || 'None'})`
          });
          break;
        }
        case 'MedicationRequest':
        case 'MedicationStatement': {
          // Map to Dynamic Medications
          const medName = resource.medicationCodeableConcept?.text || 
                          resource.medicationReference?.display || 
                          resource.medicationCodeableConcept?.coding?.[0]?.display;
          
          if (medName) {
            let dosage = '';
            if (resource.dosageInstruction && resource.dosageInstruction.length > 0) {
              dosage = resource.dosageInstruction[0].text || '';
            }
            this.patientState.medications.update(meds => [
              ...meds,
              { id: Date.now().toString() + Math.random(), name: medName, value: dosage }
            ]);
            medsAdded++;
          }
          break;
        }
        case 'Observation': {
          // Map common biometrics if applicable (e.g., BP, HR, Weight)
          this.parseFhirObservation(resource);
          break;
        }
        case 'Device':
        case 'DeviceDefinition': {
          const deviceName = resource.deviceName?.[0]?.name || resource.name || 'AI Co-Pilot Device';
          const manufacturer = resource.manufacturer || 'Google DeepMind';
          const modelName = resource.modelNumber || resource.deviceVersion?.[0]?.value || 'Gemini 2.5 Flash';
          
          newScans.push({
            id: resource.id || `fhir_device_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: `System Attribution: ${deviceName}`,
            date: new Date().toISOString().split('T')[0],
            type: 'Document',
            description: `Registered medical AI software device. Manufacturer: ${manufacturer}, Model/Version: ${modelName}. Active as co-pilot for Clinical Intelligence Strategy.`,
            status: 'Normal'
          });
          scansAdded++;
          break;
        }
        case 'Evidence': {
          const title = resource.title || resource.description || 'Clinical Evidence Trail';
          const url = resource.url || resource.citeAs?.relatedArtifact?.[0]?.document?.url || '';
          const publisher = resource.publisher || 'NCBI PubMed';
          const publicationDate = resource.date?.split('T')[0] || '';
          
          currentPatient.bookmarks = currentPatient.bookmarks || [];
          currentPatient.bookmarks.push({
            title,
            url,
            publisher,
            publicationDate,
            cited: true,
            isPeerReviewed: true
          });
          break;
        }
      }
    });

    // Save mutated arrays to the patient object
    if (newScans.length > 0) {
      currentPatient.scans = [...(currentPatient.scans || []), ...newScans];
    }

    // Force UI refresh
    this.patientManager.selectedPatientId.set(currentPatient.id);

    return {
      success: true,
      message: `FHIR/Lucy data imported successfully. Added ${scansAdded} scans/docs, ${conditionsAdded} conditions, and ${medsAdded} medications.`,
      scansAdded,
      conditionsAdded,
      medsAdded
    };
  }

  /**
   * Parse a HL7 CCDA XML Document. 
   * This is typically downloaded directly from Share Everywhere.
   */
  private importCCDAXml(xmlText: string): IParseResult {
    const currentPatient = this.patientManager.selectedPatient();
    if (!currentPatient) {
      return { success: false, message: 'Please select a patient profile first to receive the imported XML data.' };
    }

    let scansAdded = 0;
    let conditionsAdded = 0;

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const newScans: IDiagnosticScan[] = [];

      // Look for result/observation sections (Labs/Scans)
      const observationNodes = xmlDoc.getElementsByTagName("observation");
      for (let i = 0; i < observationNodes.length; i++) {
         const obs = observationNodes[i];
         const codeNode = obs.getElementsByTagName("code")[0];
         const valueNode = obs.getElementsByTagName("value")[0];
         
         const obsName = codeNode?.getAttribute("displayName") || "Clinical Observation";
         const obsValue = valueNode?.getAttribute("value");
         const obsUnit = valueNode?.getAttribute("unit") || "";
         
         // If it's a structural observation that feels like a discrete lab log
         if (obsName && obsValue) {
           newScans.push({
             id: `xml_scan_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
             type: 'Lab Report',
             title: obsName,
             date: new Date().toISOString().split('T')[0],
             description: `${obsValue} ${obsUnit}`,
             status: 'Pending',
           });
           scansAdded++;
         }
      }

      // Look for Problem/Condition sections
      // CCDA typically uses <observation> inside a <section> with a specific templateId for problems
      // For simplicity, we search for nodes that might indicate conditions globally
      const problemNodes = xmlDoc.getElementsByTagName("value");
      for (let i = 0; i < problemNodes.length; i++) {
        const problem = problemNodes[i];
        if (problem.getAttribute("xsi:type") === "CD" && problem.getAttribute("displayName")) {
           const conditionName = problem.getAttribute("displayName");
           if (conditionName && !currentPatient.preexistingConditions.includes(conditionName)) {
              currentPatient.preexistingConditions.push(conditionName);
              conditionsAdded++;
           }
        }
      }

      if (newScans.length > 0) {
        currentPatient.scans = [...(currentPatient.scans || []), ...newScans];
      }

      this.patientManager.selectedPatientId.set(currentPatient.id);

      return {
        success: true,
        message: `XML (CCDA) data imported successfully. Added ${scansAdded} lab/scan entries and ${conditionsAdded} conditions.`,
        scansAdded,
        conditionsAdded
      };

    } catch (e: any) {
      console.error('[ImportService] XML parse error:', e);
      return { success: false, message: `Failed to parse XML file: ${e.message}` };
    }
  }

  /**
   * Helper to extract basic vitals from FHIR Observations
   */
  private parseFhirObservation(obs: any) {
    if (!obs.code || !obs.code.coding) return;
    
    // Look for LOINC codes typical in Epic Lucy / MyChart
    // Example: 85354-9 (Blood Pressure), 8867-4 (Heart Rate), 29463-7 (Body Weight)
    const loincCode = obs.code.coding.find((c: any) => c.system === 'http://loinc.org')?.code;
    
    if (loincCode === '8867-4' && obs.valueQuantity?.value) {
      // HR
      this.patientState.updateVital('hr', String(obs.valueQuantity.value));
    } else if (loincCode === '3141-9' || loincCode === '29463-7') {
      // Weight
      if (obs.valueQuantity?.value) {
         this.patientState.updateVital('weight', obs.valueQuantity.value + " " + (obs.valueQuantity.unit || 'lbs'));
      }
    } else if (loincCode === '85354-9') {
      // BP panel usually has components
      if (obs.component && obs.component.length >= 2) {
        let sys = '', dia = '';
        obs.component.forEach((comp: any) => {
          const compCode = comp.code?.coding?.find((c: any) => c.system === 'http://loinc.org')?.code;
          if (compCode === '8480-6') sys = comp.valueQuantity?.value; // Systolic
          if (compCode === '8462-4') dia = comp.valueQuantity?.value; // Diastolic
        });
        if (sys && dia) {
          this.patientState.updateVital('bp', sys + "/" + dia);
        }
      }
    }
  }
}

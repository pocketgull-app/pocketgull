/**
 * FHIR R4 Clinical Bundle Serialization
 */

export interface IFhirObservationOptions {
  patientId: string;
  loincCode: string;
  loincDisplay: string;
  value: number;
  unit: string;
  category?: string;
  effectiveDateTime?: string;
}

/**
 * Creates a standard FHIR R4 Observation Bundle
 */
export function createFhirR4ObservationBundle(options: IFhirObservationOptions): Record<string, any> {
  const bundleId = `bundle-obs-${Date.now()}`;
  const obsId = `obs-${Date.now()}`;
  const timestamp = options.effectiveDateTime || new Date().toISOString();

  return {
    resourceType: 'Bundle',
    id: bundleId,
    meta: {
      lastUpdated: timestamp,
      profile: ['http://hl7.org/fhir/StructureDefinition/bundle']
    },
    type: 'collection',
    entry: [
      {
        fullUrl: `urn:uuid:${obsId}`,
        resource: {
          resourceType: 'Observation',
          id: obsId,
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: options.category || 'vital-signs',
                  display: options.category || 'Vital Signs'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: options.loincCode,
                display: options.loincDisplay
              }
            ]
          },
          subject: {
            reference: `Patient/${options.patientId}`
          },
          effectiveDateTime: timestamp,
          valueQuantity: {
            value: options.value,
            unit: options.unit,
            system: 'http://unitsofmeasure.org',
            code: options.unit
          }
        }
      }
    ]
  };
}

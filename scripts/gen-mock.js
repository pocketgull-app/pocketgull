import fs from 'fs';
import path from 'path';

const serviceFile = path.join(process.cwd(), 'src/services/patient-management.service.ts');
let content = fs.readFileSync(serviceFile, 'utf8');

const regex = /const MOCK_PATIENTS: Patient\[\] = (\[[\s\S]*?\]);\n@Injectable/m;
const match = content.match(regex);
if (!match) {
    console.error("Could not find MOCK_PATIENTS");
    process.exit(1);
}

const mockPatientsStr = match[1];
const MOCK_PATIENTS = eval("(" + mockPatientsStr + ")");

function generateReport(patient, lens) {
    const name = patient.name.split(' ')[0];
    const condition = patient.demographics?.occupation || "their condition";
    
    if (lens === 'Summary Overview') {
        return `### Clinical Assessment
${patient.name} presents with a complex clinical picture primarily characterized by ${patient.issues ? Object.values(patient.issues).flat().map(i => i.name).join(', ') : 'general health maintenance'}. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.

### Priority List
*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.
*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.
*   **Symptom Management**: Provide relief for primary presenting complaints.

### Plan of Care
*   Initiate targeted anti-inflammatory protocol.
*   Begin functional medicine assessment for underlying root causes.
*   Schedule follow-up to re-evaluate response to initial interventions.

### Goals
*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.
*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.

### References
*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.`;
    }
    
    if (lens === 'Functional Protocols') {
        return `### Immediate Actions (To start within 72 hours)
*   Begin comprehensive elimination diet to identify potential food triggers.
*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).

### Foundation (Diet & Lifestyle)
*   Transition to a Mediterranean-style, whole-foods diet.
*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.
*   Incorporate daily 10-minute mindfulness or breathwork practice.

### Supplementation
| Intervention | Dose | Timing | Rationale |
| :--- | :--- | :--- | :--- |
| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |
| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |
| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |

### Functional Protocols
A comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.`;
    }
    
    if (lens === 'Nutrition') {
        return `### Biochemical Assessment
Analysis of ${name}'s nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.

### Nutrition Targets
*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.
*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.
*   **Methylation Pathway Optimization**: Suggested by historical clinical context.

### Nutritional Interventions
| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |
| :--- | :--- | :--- | :--- |
| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |
| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |
| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |

### Dietary Adjustments
Increase intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.`;
    }

    if (lens === 'Monitoring & Follow-up') {
        return `### Immediate Next Steps (0-30 days)
1.  Complete baseline advanced functional laboratory panels.
2.  Initiate foundational diet and lifestyle modifications.
3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.

### Ongoing (Month 1-3)
| Parameter | Target | Frequency | Escalation Trigger |
| :--- | :--- | :--- | :--- |
| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |
| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |
| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |

### Long-term Trajectory (6+ months)
Expect gradual but sustained improvement across major functional domains. ${name} should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.`;
    }

    if (lens === 'Patient Education') {
        return `### Understanding Your Condition
Your current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.

### What Was Found
*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.
*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.
*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.

### Current Plan
*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.
*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.
*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.

### Important Notes
> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.`;
    }

    return "No report generated.";
}

async function processPatient(patient) {
    // Remove all previous AnalysisRuns
    patient.history = patient.history.filter(h => h.type !== 'AnalysisRun');

    const report = {
        'Summary Overview': generateReport(patient, 'Summary Overview'),
        'Functional Protocols': generateReport(patient, 'Functional Protocols'),
        'Nutrition': generateReport(patient, 'Nutrition'),
        'Monitoring & Follow-up': generateReport(patient, 'Monitoring & Follow-up'),
        'Patient Education': generateReport(patient, 'Patient Education')
    };
    
    const analysisEntry = {
        type: 'AnalysisRun',
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        summary: 'Comprehensive Clinical Analysis',
        report: report
    };
    
    patient.history.unshift(analysisEntry);
}

async function main() {
    for (const patient of MOCK_PATIENTS) {
        await processPatient(patient);
    }
    
    let newMockStr = JSON.stringify(MOCK_PATIENTS, null, 4);
    
    let newContent = content.replace(regex, "const MOCK_PATIENTS: Patient[] = " + newMockStr + ";\n@Injectable");
    fs.writeFileSync(serviceFile, newContent);
    console.log("Done updating patient-management.service.ts");
}

main().catch(console.error);

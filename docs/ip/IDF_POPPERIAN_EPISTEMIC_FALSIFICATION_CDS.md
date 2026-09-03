# INVENTION DISCLOSURE FORM (IDF)
## CONFIDENTIAL ATTORNEY-CLIENT PRIVILEGE / PROPRIETARY TECH DOSSIER

**Docket Reference**: PG-CDS-2026-005  
**Filing Target**: United States Patent and Trademark Office (USPTO) Non-Provisional / Utility Application  
**Assignee**: PocketGull Inc. / Phil Gear Technologies  
**Classification**: IPC G16H 50/20 (Computer-aided medical diagnosis), G16H 10/60 (EHR systems), G06F 21/64 (Data integrity and attestation)  
**Title**: COMPUTER-IMPLEMENTED SYSTEM AND METHOD FOR MITIGATING DIAGNOSTIC CONFIRMATION BIAS VIA RUNTIME POPPERIAN FALSIFICATION, ORTHOGONAL COUNTER-HYPOTHESES GENERATION, AND CRYPTOGRAPHICALLY ATTESTED FHIR R4 PROVENANCE EXTENSIONS

---

## 1. ABSTRACT
A computer-implemented clinical decision support (CDS) system and method for mitigating premature cognitive closure and diagnostic confirmation bias in electronic health records (EHR). In contrast to conventional CDS systems that suggest confirmatory evidence for a suspected clinical condition, the present invention implements a runtime Popperian epistemic engine. Upon receipt of a candidate clinical diagnosis, the system: (i) automatically synthesizes a minimum of three orthogonal disconfirming counter-hypotheses; (ii) executes runtime two-tailed null-hypothesis ($H_0$) statistical rejection tests against normative population epidemiological baselines; (iii) computes Cochrane Risk of Bias 2 (RoB 2) epistemic discounts; and (iv) locks diagnostic commitment behind an affirmative physical exam disconfirmation gating interface. Once verified by the clinician, the candidate condition, its orthogonal counter-hypotheses, empirical $p$-values, and bedside exam attestations are serialized into an extended HL7 FHIR R4 `Condition` resource bound to an immutable FDA 21 CFR Part 11 cryptographic `Provenance` digital signature seal (`application/jose`, SHA-256 digest).

---

## 2. BACKGROUND & PRIOR ART SHORTCOMINGS

### 2.1 The Clinical Dilemma of Diagnostic Confirmation Bias
Diagnostic errors contribute to an estimated 40,000 to 80,000 hospital deaths annually in the United States alone. Cognitive root-cause analyses reveal that **confirmation bias** and **premature closure**—the tendency to latch onto an initial diagnostic hunch and selectively seek corroborating evidence while disregarding contradictory signs—account for over $70\%$ of preventable diagnostic failures.

### 2.2 Shortcomings of Conventional Electronic Health Record (EHR) Systems
Contemporary EHR platforms (e.g., Epic Systems, Oracle Cerner, AthenaHealth) and clinical AI tools function as "confirmatory echo chambers." When an ICD-10 code is entered, the system suggests billing documentation templates, matching lab orders, and confirmatory clinical findings. No commercial EHR systematically challenges the clinician’s working diagnosis with statistically grounded falsification criteria before order commitment.

---

## 3. SUMMARY OF THE INVENTION

```
                                [ THE POPPERIAN CDS PIPELINE ]
                                
       Clinician / AI Candidate Diagnosis
       (e.g., "Acute Lumbar Radiculopathy")
                       │
                       ▼
       [ ORTHOGONAL COUNTER-HYPOTHESIS GENERATOR ]
       ├─ Counter-Hypothesis 1: Piriformis Muscle Spasm (Myofascial)
       ├─ Counter-Hypothesis 2: Sacroiliac Joint Dysfunction (Articular)
       └─ Counter-Hypothesis 3: Spinal Epidural Abscess / Cauda Equina (Red Flag)
                       │
                       ▼
       [ POPPERIAN NULL-HYPOTHESIS (H₀) REJECTION ENGINE ]
       • Computes two-tailed z-score & p-value against baseline:
         z = (x̄ - μ₀) / (σ₀ / √n),   p = 2·(1 - Φ(|z|))
       • If p ≥ 0.05: Flags warning ("Null hypothesis cannot be rejected; evidence weak")
                       │
                       ▼
       [ BEDSIDE PHYSICAL EXAM FALSIFICATION GATING ]
       • Straight Leg Raise (SLR) Test Checkbox
       • Contralateral Crossed SLR Checkbox
       • Sensation / Motor Reflex Attestation Checkbox
       (Diagnostic commitment locked until affirmative disconfirmation review)
                       │
                       ▼
       [ CRYPTOGRAPHIC FHIR R4 PROVENANCE SERIALIZATION ]
       • FHIR R4 Condition with Grounded Assertion Extensions
       • FDA 21 CFR Part 11 Digital Signature Seal (JOSE / SHA-256)
```

---

## 4. DETAILED SPECIFICATION & CLAIMS

### 4.1 Independent Claim 1 (System):
> A clinical decision support system for preventing diagnostic confirmation bias in clinical workflows, comprising:  
> (a) a clinical intake interface configured to receive patient telemetry data and a candidate diagnostic assertion;  
> (b) an epistemological falsification engine executed by a hardware processor and configured to:  
>     (i) query a medical ontology database to identify at least three orthogonal counter-hypotheses representing non-overlapping differential diagnostic etiologies for said candidate diagnostic assertion;  
>     (ii) compute a null-hypothesis test statistic and two-tailed p-value evaluating whether observed patient telemetry significantly deviates from a non-pathological population baseline mean; and  
>     (iii) generate a skeptical clinical notice when said two-tailed p-value is greater than or equal to a predetermined significance alpha threshold of 0.05;  
> (c) a bedside disconfirmation gating module configured to display said three orthogonal counter-hypotheses and lock commitment of said candidate diagnostic assertion into an electronic health record until receiving affirmative clinician validation of at least one physical examination falsification maneuver; and  
> (d) an interoperability serialization engine configured to generate an extended Health Level Seven (HL7) Fast Healthcare Interoperability Resources (FHIR) Release 4 Condition resource containing said candidate diagnostic assertion, said orthogonal counter-hypotheses, and said computed p-value, wherein said Condition resource is cryptographically bound to an FDA 21 CFR Part 11 compliant Provenance resource comprising a SHA-256 cryptographic attestation digest.

### 4.2 Independent Claim 8 (Method):
> A computer-implemented method for cryptographically attesting diagnostic falsification in a healthcare network, comprising:  
> (a) capturing an encounter diagnosis for a patient on a client device;  
> (b) algorithmically synthesizing three orthogonal differential diagnoses spanning mechanical, inflammatory, and neurological causal pathways;  
> (c) discounting an aggregate diagnostic confidence score utilizing Cochrane Risk of Bias 2 assessment matrices across patient study domains;  
> (d) requiring affirmative completion of physical examination disconfirmation checkpoints on a bedside user interface prior to diagnostic authorization; and  
> (e) encoding said encounter diagnosis, said orthogonal differential diagnoses, and said physical examination checkpoints into an immutable JSON data bundle conforming to the HL7 FHIR R4 specification sealed with an electronic signature in compliance with 21 CFR Part 11.

---

## 5. COMMERCIAL UTILITY & MALPRACTICE DEFENSE
1. **Malpractice Insurance Premium Discounting**: Healthcare institutions deploying the Popperian Epistemic Falsification Engine can demonstrate affirmative diagnostic rigor, qualifying for reduced medical liability insurance underwriting rates.
2. **Joint Commission / CMS Quality Standards**: Fulfills the National Academy of Medicine (NAM) STEEEP quality dimensions for "Safe" and "Effective" healthcare delivery.
3. **Audit Non-Repudiation**: FDA Part 11 cryptographic hashing ensures diagnostic assertions cannot be back-dated or altered post-incident.

---
*Signed and sealed for incorporation into USPTO patent filings Docket PG-CDS-2026-005.*

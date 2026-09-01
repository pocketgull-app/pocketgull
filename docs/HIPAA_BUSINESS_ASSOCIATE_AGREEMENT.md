# Standard HIPAA Business Associate Agreement (BAA)

**Effective Date:** ________________________, 2026  
**Between:**  
1. **Covered Entity:** ____________________________________________________ ("Covered Entity")  
2. **Business Associate:** PocketGull LLC, an Oregon limited liability company based in Portland, Oregon ("Business Associate" or "PocketGull")  

---

## Recitals

WHEREAS, Covered Entity is a "covered entity" as defined under the Health Insurance Portability and Accountability Act of 1996 ("HIPAA"), Public Law 104-191, the Health Information Technology for Economic and Clinical Health Act ("HITECH Act"), Title XIII of Division A of Public Law 111-5, and the regulations promulgated thereunder at 45 C.F.R. Parts 160 and 164 (collectively, the "HIPAA Privacy and Security Rules"); and

WHEREAS, Business Associate provides real-time clinical intelligence, care plan strategy, FHIR R4 data orchestration, and AI-assisted clinical workflow support services (the "Services") to Covered Entity pursuant to an underlying Master Services Agreement or Software License Agreement (the "Underlying Agreement"); and

WHEREAS, in connection with providing the Services, Business Associate may create, receive, maintain, transmit, or process electronic Protected Health Information ("ePHI") on behalf of Covered Entity;

NOW, THEREFORE, in consideration of the mutual promises contained herein, the parties agree as follows:

---

## 1. Definitions

* **"Breach"** shall have the same meaning as given in 45 C.F.R. § 164.402.
* **"Designated Record Set"** shall have the same meaning as given in 45 C.F.R. § 164.501.
* **"Electronic Protected Health Information" ("ePHI")** shall have the meaning given in 45 C.F.R. § 160.103, limited to information created, received, maintained, or transmitted by Business Associate on behalf of Covered Entity.
* **"Individual"** shall have the same meaning as given in 45 C.F.R. § 160.103 and shall include a person who qualifies as a personal representative under 45 C.F.R. § 164.502(g).
* **"Security Incident"** shall have the same meaning as given in 45 C.F.R. § 164.304.

---

## 2. Obligations and Activities of Business Associate

### 2.1 Limitations on Use and Disclosure
Business Associate agrees to not use or disclose ePHI other than as permitted or required by this Agreement, the Underlying Agreement, or as Required By Law.

### 2.2 Appropriate Safeguards & Security Rule Compliance (§ 164.312)
Business Associate agrees to implement administrative, physical, and technical safeguards that reasonably and appropriately protect the confidentiality, integrity, and availability of the ePHI that it creates, receives, maintains, or transmits on behalf of Covered Entity as required by Subpart C of 45 C.F.R. Part 164:
- **Encryption Standards**: All ePHI shall be encrypted in transit using TLS 1.3 / mTLS and encrypted at rest using AES-256.
- **Audit Controls (§ 164.312(b))**: Business Associate shall maintain immutable, chronological telemetry audit logs (via CNCF OpenTelemetry) recording system access, model inference events, and cryptographic operation signatures.
- **Data Integrity (§ 164.312(c)(1))**: Business Associate shall compute and verify SHA-256 digital digests for all clinical transactions and FHIR R4 resource bundles.

### 2.3 Subcontractors & Downstream Assurances (§ 164.502(e)(1)(ii))
In accordance with 45 C.F.R. § 164.502(e)(1)(ii) and § 164.308(b)(2), Business Associate shall ensure that any subcontractors that create, receive, maintain, or transmit ePHI on behalf of Business Associate agree in writing to the same restrictions and conditions that apply to Business Associate with respect to such information.

### 2.4 AI Model Governance & Zero-Training Covenant
Business Associate covenants that:
- **Zero Base Model Training**: ePHI provided by Covered Entity will **never** be used to train, retrain, fine-tune, or distill foundation AI models (including Google Gemini or proprietary deep learning weights).
- **Transient Inference Enclaves**: AI inference is performed exclusively inside HIPAA-compliant private cloud enclaves (Google Cloud Vertex AI) covered under an active Business Associate Agreement.

### 2.5 Reporting of Breaches and Security Incidents (§ 164.410)
Business Associate shall report to Covered Entity any Breach of Unsecured Protected Health Information without unreasonable delay and in no case later than sixty (60) calendar days after discovery of the Breach, in accordance with 45 C.F.R. § 164.410.

### 2.6 Safe Harbor De-Identification (§ 164.514)
Business Associate is authorized to de-identify ePHI in accordance with 45 C.F.R. § 164.514(b)(2) (Safe Harbor Method) using automated edge middleware, stripping all 18 direct and indirect identifiers.

---

## 3. Permitted Uses and Disclosures by Business Associate

Except as otherwise limited in this Agreement, Business Associate may:
1. Use or disclose ePHI to perform functions, activities, or services for, or on behalf of, Covered Entity as specified in the Underlying Agreement.
2. Use ePHI for the proper management and administration of Business Associate or to carry out the legal responsibilities of Business Associate.
3. Provide Data Aggregation services relating to the health care operations of Covered Entity if requested.

---

## 4. Term and Termination

### 4.1 Term
This Agreement shall be effective as of the Effective Date and shall terminate when all of the ePHI provided by Covered Entity to Business Associate is destroyed or returned to Covered Entity.

### 4.2 Effect of Termination (§ 164.504(e)(2)(ii)(J))
Upon termination of the Underlying Agreement, Business Associate shall return or destroy all ePHI received from Covered Entity, or created, maintained, or received by Business Associate on behalf of Covered Entity. If return or destruction is infeasible, Business Associate shall extend the protections of this Agreement to the information and limit further uses and disclosures to those purposes that make the return or destruction infeasible.

---

## 5. Signatures

**COVERED ENTITY:**  
By: _________________________________________  
Name: _______________________________________  
Title: ________________________________________  
Date: ________________________________________  

**POCKETGULL LLC:**  
By: _________________________________________  
Name: Phillip Gear  
Title: Authorized Representative  
Date: ________________________________________  

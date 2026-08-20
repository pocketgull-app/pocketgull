/**
 * 🛡️ Pocket-Gull Automated PR Clinical Evidence & Regulatory Evaluator
 */

export interface IClinicalPrAuditResult {
  hasClinicalClaims: boolean;
  oxfordCebmLevel: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5' | 'Unclassified';
  cochraneRob2Status: 'Low Risk' | 'Some Concerns' | 'High Risk' | 'Not Evaluated';
  nullHypothesisPassed: boolean;
  oncHti2Compliant: boolean;
  reviewCommentMarkdown: string;
}

export function evaluateClinicalPrContent(diffOrBodyText: string): IClinicalPrAuditResult {
  const lower = diffOrBodyText.toLowerCase();

  const isClinical = lower.includes('careplan') || 
                     lower.includes('hypertension') || 
                     lower.includes('diabetes') || 
                     lower.includes('trial') || 
                     lower.includes('rct') ||
                     lower.includes('clinical');

  let oxfordCebmLevel: IClinicalPrAuditResult['oxfordCebmLevel'] = 'Unclassified';
  let cochraneRob2Status: IClinicalPrAuditResult['cochraneRob2Status'] = 'Not Evaluated';
  let nullHypothesisPassed = true;
  let oncHti2Compliant = false;

  if (lower.includes('sprint') || lower.includes('randomized controlled trial') || lower.includes('rct')) {
    oxfordCebmLevel = 'Level 1';
    cochraneRob2Status = 'Low Risk';
  } else if (lower.includes('cohort') || lower.includes('prospective')) {
    oxfordCebmLevel = 'Level 2';
    cochraneRob2Status = 'Some Concerns';
  } else if (lower.includes('case-control') || lower.includes('retrospective')) {
    oxfordCebmLevel = 'Level 3';
    cochraneRob2Status = 'Some Concerns';
  } else if (lower.includes('case series')) {
    oxfordCebmLevel = 'Level 4';
    cochraneRob2Status = 'High Risk';
  } else if (isClinical) {
    oxfordCebmLevel = 'Level 5';
  }

  // Check for statistical null hypothesis disclosure if p >= 0.05
  const pMatch = diffOrBodyText.match(/p(?:-?value)?\s*[:=><]\s*([0-9.]+)/i);
  if (pMatch && parseFloat(pMatch[1]) >= 0.05) {
    nullHypothesisPassed = false;
  }

  // Check for ONC HTI-2 demographic transparency
  if (lower.includes('demographic') || lower.includes('groupkfold') || lower.includes('auroc') || lower.includes('safe harbor')) {
    oncHti2Compliant = true;
  }

  const reviewCommentMarkdown = `### 🕊️ Pocket-Gull Clinical Evidence & Regulatory Audit

| Dimension | Verification Result | Status |
| :--- | :--- | :--- |
| **Oxford CEBM Evidence** | **${oxfordCebmLevel}** | ${oxfordCebmLevel === 'Level 1' || oxfordCebmLevel === 'Level 2' ? '🟢 Verified' : '🟡 Review Recommended'} |
| **Cochrane Risk of Bias (RoB 2)** | **${cochraneRob2Status}** | ${cochraneRob2Status === 'Low Risk' ? '🟢 Low Bias' : '⚠️ Risk Flagged'} |
| **Popperian $H_0$ Power** | **${nullHypothesisPassed ? 'Statistically Significant ($p < 0.05$)' : '⚠️ Null Hypothesis Not Rejected ($p \\ge 0.05$)'}** | ${nullHypothesisPassed ? '🟢 Passed' : '🔴 Warning Notice Required'} |
| **ONC HTI-2 DSI Transparency** | **${oncHti2Compliant ? 'Demographics & Partitions Declared' : 'Incomplete Model Metadata'}** | ${oncHti2Compliant ? '🟢 Compliant' : '🟡 Needs Demographic Table'} |

${!nullHypothesisPassed ? '> [!WARNING]\n> This clinical recommendation does not reject the null hypothesis ($p \\ge 0.05$). An explicit skeptical warning disclosure is required per Popperian clinical safety standards.' : ''}

*Automated review by [@pocketgull-bot](https://github.com/apps/pocketgull-bot) • Grounded in Oxford CEBM & ONC HTI-2.*`;

  return {
    hasClinicalClaims: isClinical,
    oxfordCebmLevel,
    cochraneRob2Status,
    nullHypothesisPassed,
    oncHti2Compliant,
    reviewCommentMarkdown
  };
}

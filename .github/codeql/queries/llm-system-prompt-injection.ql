/**
 * @name Tainted user input in LLM system instruction
 * @description Passing untrusted user input directly into static systemInstruction properties allows prompt injection attacks. User input must be partitioned into the user content payload.
 * @kind problem
 * @problem.severity error
 * @security-severity 8.5
 * @precision high
 * @id js/llm-system-prompt-injection
 * @tags security
 *       ai/prompt-injection
 *       external/cwe/cwe-074
 */

import javascript

from Assignment assign, PropWrite prop
where
  prop.getPropertyName() = "systemInstruction" and
  assign.getLhs() = prop.getBase()
select prop, "System instruction property is dynamically assigned with potential user input. Keep system instructions strictly static."

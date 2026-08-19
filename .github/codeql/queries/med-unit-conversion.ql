/**
 * @name Unsafe clinical unit conversion without bounds check
 * @description Manual mathematical scaling between medical dosage units (e.g. mg to mcg or mmol/L) without explicit range validation can lead to fatal medication errors.
 * @kind problem
 * @problem.severity warning
 * @security-severity 6.0
 * @precision medium
 * @id js/clinical-unit-conversion-bounds
 * @tags reliability
 *       clinical/dosage-safety
 *       external/cwe/cwe-682
 */

import javascript

from BinaryExpr expr
where
  expr.getOperator() = "*" and
  expr.getAnOperand().getIntValue() = 1000 and
  not exists(IfStmt ifStmt | ifStmt.getAChild*() = expr)
select expr, "Multiplication by 1000 detected for possible unit conversion without surrounding bounds guard."

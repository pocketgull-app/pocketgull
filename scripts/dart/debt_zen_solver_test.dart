// ---------------------------------------------------------------------------
// Zen Debt Solver Unit & Strategy Invariant Test Suite
// Verifies Avalanche, Snowball, and Zen Hybrid allostatic stress optimizations.
// ---------------------------------------------------------------------------

import 'debt_zen_solver.dart';

void main() {
  print('Running Zen Debt Solver Test Suite...');

  final testDebts = [
    DebtItem(id: '1', name: 'Credit Card', balance: 3000.0, apr: 24.0, minPayment: 100.0, stressScore: 9),
    DebtItem(id: '2', name: 'Medical Debt', balance: 1000.0, apr: 0.0, minPayment: 50.0, stressScore: 8),
    DebtItem(id: '3', name: 'Personal Loan', balance: 5000.0, apr: 8.0, minPayment: 150.0, stressScore: 4),
  ];

  final solver = ZenDebtSolver(debts: testDebts, monthlyBudget: 600.0);

  // 1. Verify Avalanche ranks highest APR first
  final avalancheRanked = solver.rankDebts(PayoffStrategy.avalanche);
  assert(avalancheRanked.first.id == '1', 'Avalanche must prioritize Credit Card (24% APR)');

  // 2. Verify Snowball ranks lowest balance first
  final snowballRanked = solver.rankDebts(PayoffStrategy.snowball);
  assert(snowballRanked.first.id == '2', 'Snowball must prioritize Medical Debt (\$1000)');

  // 3. Verify Zen Hybrid produces valid simulation
  final zenResult = solver.simulate(PayoffStrategy.zenHybrid);
  assert(zenResult.totalMonths > 0 && zenResult.totalMonths < 360, 'Simulation must converge');
  assert(zenResult.totalPrincipalPaid == 9000.0, 'Total principal paid must equal sum of balances');
  assert(zenResult.payoffOrder.length == 3, 'All debts must be resolved');

  print('✅ [PASS] All 3 Zen Debt Solver invariant tests passed successfully.');
}

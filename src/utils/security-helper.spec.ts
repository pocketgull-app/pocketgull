// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from 'vitest';
import { OFAC_SANCTIONED_COUNTRIES, renderOfacRestrictedHtml } from './security-helper';

describe('OFAC Sanctioned Jurisdictions & Regulatory Compliance (Issue #432)', () => {
  it('enforces comprehensive embargo status for active sanctioned jurisdictions (CU, IR, KP)', () => {
    expect(OFAC_SANCTIONED_COUNTRIES.has('CU')).toBe(true);
    expect(OFAC_SANCTIONED_COUNTRIES.has('IR')).toBe(true);
    expect(OFAC_SANCTIONED_COUNTRIES.has('KP')).toBe(true);
  });

  it('permits Syria (SY) access following E.O. 14312 / termination of comprehensive sanctions', () => {
    // Under E.O. 14312 / PAARSSR, broad territory-wide economic blockades on Syria were lifted.
    // Syria must no longer be subject to blanket HTTP 451 geographic denial of service.
    expect(OFAC_SANCTIONED_COUNTRIES.has('SY')).toBe(false);
  });

  it('renders HTTP 451 legal restriction response document correctly', () => {
    const html = renderOfacRestrictedHtml();
    expect(html).toContain('451 &bull; Service Restricted In This Territory');
    expect(html).toContain('OFAC-sanctioned jurisdictions');
  });
});

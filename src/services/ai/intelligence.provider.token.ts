import { InjectionToken } from '@angular/core';
import { IIntelligenceProvider } from './intelligence.provider';

export const IntelligenceProviderToken = new InjectionToken<IIntelligenceProvider>('IIntelligenceProvider');

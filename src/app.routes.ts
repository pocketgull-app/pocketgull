// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    children: []
  },
  {
    path: 'chart',
    loadComponent: () =>
      import('./components/medical-chart.component').then(m => m.MedicalChartComponent)
  },
  {
    path: 'analysis',
    loadComponent: () =>
      import('./components/analysis-container.component').then(m => m.AnalysisContainerComponent)
  },
  {
    path: 'research',
    loadComponent: () =>
      import('./components/research-frame.component').then(m => m.ResearchFrameComponent)
  },
  {
    path: 'directory',
    loadComponent: () =>
      import('./components/patient-directory.component').then(m => m.PatientDirectoryComponent)
  },
  {
    path: 'typeface',
    loadComponent: () =>
      import('./components/shared/pocketgull-typeface-site.component').then(m => m.PocketgullTypefaceSiteComponent)
  },
  {
    path: 'billing',
    loadComponent: () =>
      import('./components/billing-dashboard.component').then(m => m.BillingDashboardComponent)
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./components/api-pricing.component').then(m => m.ApiPricingComponent)
  },
  {
    path: 'portal',
    loadComponent: () =>
      import('./components/patient-portal.component').then(m => m.PatientPortalComponent)
  },
  {
    path: 'docs',
    loadComponent: () =>
      import('./components/docs-study.component').then(m => m.DocsStudyComponent)
  },
  {
    path: 'fhir-callback',
    loadComponent: () =>
      import('./components/fhir-callback.component').then(m => m.FhirCallbackComponent)
  },
  {
    path: '**',
    children: []
  }
];

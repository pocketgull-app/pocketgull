// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { Injectable } from '@angular/core';
import {
  IsmpClinicalGuard,
  type ILasaDrugProfile,
  type LasaCategory,
  type ILasaDrugPair,
  type ILasaTrainingCard,
  type IsmpViolationType,
  type IsmpSeverity,
  type IIsmpViolation,
  type IIsmpSafetyAudit
} from '@pocketgull/ismp-clinical-guard';

export type {
  ILasaDrugProfile,
  LasaCategory,
  ILasaDrugPair,
  ILasaTrainingCard,
  IsmpViolationType,
  IsmpSeverity,
  IIsmpViolation,
  IIsmpSafetyAudit
};

@Injectable({
  providedIn: 'root'
})
export class IsmpSafetyGuardService {
  private readonly guard = new IsmpClinicalGuard();

  /**
   * Sanitizes a clinical dosage string according to ISMP & FDA standards.
   */
  sanitizeClinicalDosage(text: string): string {
    return this.guard.sanitizeClinicalDosage(text);
  }

  /**
   * Formats a numeric calculation or laboratory value according to strict ISMP posology rules.
   */
  formatIsmpNumber(value: number | string, unit?: string, maxDecimals: number = 3): string {
    return this.guard.formatIsmpNumber(value, unit, maxDecimals);
  }

  /**
   * Formats a mathematical or pharmacokinetic formula string to adhere to ISMP standards.
   */
  formatIsmpMathFormula(formula: string): string {
    return this.guard.formatIsmpMathFormula(formula);
  }

  /**
   * Formats a drug name using official FDA/ISMP Tall Man casing if present in catalog.
   */
  formatTallMan(drugName: string): string {
    return this.guard.formatTallMan(drugName);
  }

  /**
   * Finds the canonical LASA drug pair profile for a given medication name.
   */
  getLasaPair(drugName: string): ILasaDrugPair | undefined {
    return this.guard.getLasaPair(drugName);
  }

  /**
   * Returns all canonical LASA drug pairs.
   */
  getAllLasaPairs(): ReadonlyArray<ILasaDrugPair> {
    return this.guard.getAllLasaPairs();
  }

  /**
   * Generates interactive clinical training flashcards for educational drills.
   */
  getLasaTrainingDeck(): ILasaTrainingCard[] {
    return this.guard.getLasaTrainingDeck();
  }

  /**
   * Performs an exhaustive ISMP safety audit against a clinical order or note.
   */
  auditSafety(text: string): IIsmpSafetyAudit {
    return this.guard.auditSafety(text);
  }

  auditPrescription(text: string): IIsmpSafetyAudit {
    return this.guard.auditPrescription(text);
  }
}

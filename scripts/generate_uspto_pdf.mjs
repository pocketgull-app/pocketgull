#!/usr/bin/env node
/**
 * @file generate_uspto_pdf.mjs
 * @description Compiles the PocketGull Provisional Patent Specification into a
 * USPTO-compliant Letter-sized PDF with standard 1-inch margins and page numbers.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { jsPDF } from 'jspdf';

const INPUT_MD = resolve(process.cwd(), 'docs/patents/USPTO_PROVISIONAL_TRI_PARADIGM_CONFORMAL_SEPSIS.md');
const OUTPUT_PDF = resolve(process.cwd(), 'USPTO_PROVISIONAL_SPECIFICATION_PG_CONF_001.pdf');

console.log('⚖️ [USPTO PDF] Generating formal USPTO Provisional Patent Specification PDF...');

const rawMarkdown = readFileSync(INPUT_MD, 'utf8');

// Initialize jsPDF in Letter portrait mode
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'pt',
  format: 'letter' // 612 x 792 pt
});

const pageWidth = 612;
const pageHeight = 792;
const margin = 72; // 1 inch = 72 points
const contentWidth = pageWidth - 2 * margin;
const contentHeight = pageHeight - 2 * margin;

let yPos = margin;
let currentPage = 1;

function checkPageBreak(requiredSpace = 20) {
  if (yPos + requiredSpace > pageHeight - margin) {
    // Add page number at bottom
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Docket PG-PAT-2026-CONF-001  |  Page ${currentPage}`, pageWidth / 2, pageHeight - 36, { align: 'center' });

    doc.addPage('letter', 'portrait');
    currentPage++;
    yPos = margin;
  }
}

// Strip markdown decorative elements and parse line by line
const lines = rawMarkdown.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trimEnd();

  if (line.startsWith('# ')) {
    checkPageBreak(36);
    yPos += 14;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    const text = line.replace(/^#\s*/, '').replace(/^[⚖️📑⭐]+\s*/, '');
    const splitLines = doc.splitTextToSize(text, contentWidth);
    doc.text(splitLines, margin, yPos);
    yPos += splitLines.length * 18 + 8;
  } else if (line.startsWith('## ')) {
    checkPageBreak(28);
    yPos += 10;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    const text = line.replace(/^##\s*/, '').replace(/^[⚖️📑⭐]+\s*/, '');
    const splitLines = doc.splitTextToSize(text, contentWidth);
    doc.text(splitLines, margin, yPos);
    yPos += splitLines.length * 15 + 6;
  } else if (line.startsWith('### ')) {
    checkPageBreak(22);
    yPos += 6;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    const text = line.replace(/^###\s*/, '');
    const splitLines = doc.splitTextToSize(text, contentWidth);
    doc.text(splitLines, margin, yPos);
    yPos += splitLines.length * 13 + 4;
  } else if (line.startsWith('```') || line.startsWith('+---') || line.startsWith('|')) {
    // Monospace / ASCII art / code blocks
    checkPageBreak(12);
    doc.setFont('Courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitLines = doc.splitTextToSize(line, contentWidth);
    doc.text(splitLines, margin, yPos);
    yPos += splitLines.length * 9.5;
  } else if (line.startsWith('---')) {
    checkPageBreak(15);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 12;
  } else if (line === '') {
    yPos += 6;
  } else {
    // Normal body paragraph
    checkPageBreak(16);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    // Clean inline markdown
    const cleanLine = line
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\$+(.*?)\$+/g, '$1');

    const splitLines = doc.splitTextToSize(cleanLine, contentWidth);
    doc.text(splitLines, margin, yPos);
    yPos += splitLines.length * 13 + 3;
  }
}

// Add page footer to the final page
doc.setFont('Helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(120, 120, 120);
doc.text(`Docket PG-PAT-2026-CONF-001  |  Page ${currentPage}`, pageWidth / 2, pageHeight - 36, { align: 'center' });

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
writeFileSync(OUTPUT_PDF, pdfBuffer);

console.log(`✅ USPTO PDF generated successfully: ${OUTPUT_PDF}`);
console.log(`📄 Total Pages: ${currentPage}`);
console.log(`📏 File Size  : ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

import {
  Component, ChangeDetectionStrategy, inject, signal, input, output,
  computed, OnDestroy, ViewChild, ElementRef, AfterViewChecked, HostListener, effect,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ISummaryNode, ISummaryNodeItem } from './analysis-report.types';
import { DictationService } from '../services/dictation.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { ClinicalIcons } from '../assets/clinical-icons';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullInputComponent } from './shared/pocket-gull-input.component';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { MarkdownService } from '../services/markdown.service';
import { RichMediaService, IRichMediaCard } from '../services/rich-media.service';
import { Medical3DViewerComponent } from './anatomy-3d/medical-3d-viewer.component';
import { SafeHtmlPipe } from '../pipes/safe-html-new.pipe';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ClinicalIconComponent } from './shared/clinical-icon.component';

// ─── Types ───────────────────────────────────────────────────────────────────

interface IClaimUnit {
  id: string;
  type: 'paragraph' | 'list-item' | 'heading' | 'other';
  text: string; // plain text for drilling
  html: string; // rendered HTML for display
}

interface IInlineChatEntry {
  role: 'user' | 'model';
  text: string;
  html?: string;
  claims?: IClaimUnit[];    // parsed claim units for model messages
  richCards?: IRichMediaCard[]; // resolved rich media cards
  feedback?: 'up' | 'down';
}

interface IBracketedClaim {
  id: string;
  text: string;
  drillContext?: string; // what breadcrumb level it came from
}

// ─── Helper: Parse HTML → ClaimUnits ─────────────────────────────────────────

function getStableClaimId(text: string, idx: number): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return `claim-${Math.abs(hash).toString(36)}-${idx}`;
}

function parseHtmlToClaims(html: string): IClaimUnit[] {
  const claims: IClaimUnit[] = [];
  let idx = 0;

  // Split at block-level HTML boundaries
  // Capture content of <p>, <li>, <h2>, 3, <h4> as claim units
  const blockPattern = /<(p|li|h2|h3|h4)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const innerHtml = match[3].trim();
    const innerText = innerHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!innerText || innerText.length < 8) continue;

    let type: IClaimUnit['type'] = 'other';
    if (tag === 'p') type = 'paragraph';
    else if (tag === 'li') type = 'list-item';
    else if (tag === 'h2' || tag === 'h3' || tag === 'h4') type = 'heading';

    claims.push({
      id: getStableClaimId(innerText, idx++),
      type,
      text: innerText.slice(0, 300),
      html: innerHtml,
    });
  }

  // Fallback: if no block tags found, treat whole response as one claim
  if (claims.length === 0) {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 0) {
      claims.push({ id: getStableClaimId(text, 0), type: 'paragraph', text, html });
    }
  }

  return claims;
}

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-summary-node',
  standalone: true,
  imports: [CommonModule, FormsModule, PocketGullBadgeComponent, PocketGullButtonComponent, PocketGullInputComponent, Medical3DViewerComponent, SafeHtmlPipe, NgOptimizedImage, ClinicalIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: [`
        .bracket-removed { text-decoration: line-through; opacity: 0.5; transition: all 0.3s ease; }
        .bracket-added   { background-color: #f0fdf4; border-bottom: 1px solid #4ade80; padding-left: 4px; padding-right: 4px; border-radius: 2px; transition: all 0.3s ease; }
        .dark .bracket-added { background-color: #16a34a20; border-bottom-color: #16a34a; }

        /* ─── Evidence Popover ─────────────────── */
        .evidence-popover {
            position: absolute; left: 0; top: calc(100% + 8px); z-index: 40;
            width: 280px; background: #1C1C1C; color: #FFFFFF;
            border-radius: 4px; padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #333;
            pointer-events: none; opacity: 0; transform: translate3d(0, 4px, 0);
            transition: opacity .15s ease-out, transform .15s cubic-bezier(0.16, 1, 0.3, 1);
            transform-origin: top left;
            will-change: transform, opacity;
        }
        .evidence-popover::before {
            content:''; position:absolute; top:-5px; left:22px;
            width:10px; height:10px; background: #1C1C1C;
            transform:rotate(45deg); border-radius: 1px 0 0 0;
            border-top: 1px solid #333;
            border-left: 1px solid #333;
        }
        .node-wrapper:hover .evidence-popover { opacity:1; pointer-events:auto; transform:translate3d(0, 0, 0); }
        .node-wrapper.has-inline-chat .evidence-popover { display:none; }
        .evidence-label { font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#9CA3AF; margin-bottom:5px; }
        .evidence-hint  { font-size:11px; line-height:1.5; color:#D1D5DB; margin-bottom:8px; }
        .evidence-status-row { display:flex; align-items:center; gap:6px; padding-top:7px; border-top:1px solid rgba(255,255,255,.08); }
        .evidence-status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .evidence-status-dot--verified   { background:#22C55E; }
        .evidence-status-dot--warning    { background:#F59E0B; }
        .evidence-status-dot--error      { background:#EF4444; }
        .evidence-status-dot--unverified { background:#6B7280; }
        .evidence-status-text { font-size:10px; color:#9CA3AF; }

        /* ─── Hover Toolbar ─────────────────────── */
        .node-toolbar {
            opacity: 0;
            pointer-events: none;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px;
            z-index: 50;
            padding: 4px 0;
            max-width: 100%;
            overflow-x: auto;
            transform: translate3d(0, -2px, 0);
            transition: opacity .15s ease-out, transform .15s ease-out;
            will-change: transform, opacity;
        }
        .node-wrapper:hover .node-toolbar,
        .node-wrapper:focus-within .node-toolbar {
            opacity: 1;
            pointer-events: auto;
            transform: translate3d(0, 0, 0);
            position: relative;
            z-index: 60;
        }

        .node-toolbar ::ng-deep .btn-base.size-sm.icon-only {
            height: 32px !important;
            width: 36px !important;
            min-width: 32px !important;
            border-radius: 10px !important;
        }

        /* ─── Inline Chat ────────────────────────── */
        .inline-chat {
            margin-top:8px; border-radius:10px;
            border:1px solid #E5E7EB; background:#FAFAFA; overflow:hidden;
            animation: chat-expand .2s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes chat-expand {
            from { opacity:0; transform:translateY(-6px) scaleY(.96); }
            to   { opacity:1; transform:translateY(0) scaleY(1); }
        }

        /* Chat header — always visible, sticky within the right panel scroll */
        .inline-chat-header {
            display:flex; align-items:center; gap:7px; padding:8px 12px;
            background:#F3F4F6; border-bottom:1px solid #E5E7EB;
        }
        .inline-chat-title { flex:1; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#6B7280; }
        .inline-chat-section { font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; color:#689F38; background:#F0F7E8; border:1px solid #C8E6C9; border-radius:10px; padding:2px 7px; }

        /* ─── Breadcrumb ─────────────────────────── */
        .breadcrumb-bar {
            display:flex; align-items:center; gap:4px; flex-wrap:wrap;
            padding:5px 12px; background:#F8F8F8; border-bottom:1px solid #E5E7EB;
        }
        .breadcrumb-item {
            font-size:9px; font-weight:600; color:#9CA3AF;
            cursor:pointer; border:none; background:none; padding:1px 0;
            max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
            transition:color .12s;
        }
        .breadcrumb-item:hover  { color:#374151; }
        .breadcrumb-item.active { color:#689F38; cursor:default; }
        .breadcrumb-sep { font-size:9px; color:#D1D5DB; flex-shrink:0; }

        /* Chat body: no internal scroll — parent right-panel handles all scrolling */
        .inline-chat-body { padding:10px 12px; display:flex; flex-direction:column; gap:8px; }

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ─── Messages ───────────────────────────── */
        .inline-msg { display:flex; gap:7px; align-items:flex-start; animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .inline-msg--user { flex-direction:row-reverse; }
        .inline-avatar {
            flex-shrink:0; width:20px; height:20px; border-radius:50%;
            background:#1C1C1C; color:white;
            display:flex; align-items:center; justify-content:center; margin-top:1px;
        }
        .inline-bubble {
            font-size:12.5px; line-height:1.65; color:#111827;
            background:#F9FAFB; border:1px solid transparent;
            box-shadow:0 1px 2px rgba(0,0,0,0.05);
            border-radius:10px 10px 10px 2px; padding:10px 14px; width: 100%;
            max-width:calc(100% - 30px);
            display: flex; flex-direction: column; gap: 8px; /* added gap for generic content */
        }
        .inline-msg--user .inline-bubble {
            background:#1C1C1C; color:#FFFFFF; border-color:transparent; box-shadow:none;
            border-radius:10px 10px 2px 10px;
        }

        /* Tighter margin collapsing inside chat bubbles to prevent padding blowouts */
        .inline-bubble :where(p):first-child { margin-top: 0; }
        .inline-bubble :where(p):last-child { margin-bottom: 0; }
        .inline-bubble :where(ul):last-child { margin-bottom: 0; }
        .inline-bubble :where(h2, h3):first-child { margin-top: 0; }

        /* ─── Claim Units (AI response parsing) ──── */
        .claim-unit {
            position:relative; border-radius:6px;
            padding:4px 6px 4px 8px; margin:2px 0;
            transition:background .12s;
            border-left:2px solid transparent;
            animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .claim-unit:nth-child(1) { animation-delay: 0.05s; }
        .claim-unit:nth-child(2) { animation-delay: 0.1s; }
        .claim-unit:nth-child(3) { animation-delay: 0.15s; }
        .claim-unit:nth-child(4) { animation-delay: 0.2s; }
        .claim-unit:nth-child(5) { animation-delay: 0.25s; }
        .claim-unit:nth-child(n+6) { animation-delay: 0.3s; }
        
        .claim-unit:hover { background:#F0F7E8; border-left-color:#C8E6C9; }
        .claim-unit--heading { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#1C1C1C; border-left:none; background:transparent !important; padding-top:8px; }

        /* Claim micro-toolbar (appears on hover) */
        .claim-toolbar {
            position:absolute; right:4px; top:50%; transform:translateY(-50%);
            display:flex; gap:2px; align-items:center;
            opacity:0; transition:opacity .1s; pointer-events:none;
        }
        .claim-unit:hover .claim-toolbar { opacity:1; pointer-events:auto; }
        .claim-action {
            min-width:44px; min-height:44px; width:44px; height:44px; border-radius:8px; border:none;
            background:rgba(255,255,255,.9); cursor:pointer;
            display:flex; align-items:center; justify-content:center;
            box-shadow:0 1px 3px rgba(0,0,0,.12); transition:all .1s;
            flex-shrink:0; position:relative; z-index:10;
        }
        .claim-action:hover { transform:scale(1.12); }
        .claim-action--bracket { color:#689F38; }
        .claim-action--bracket:hover { background:#F0F7E8; }
        .claim-action--drill   { color:#3B82F6; }
        .claim-action--drill:hover   { background:#EFF6FF; }
        .claim-action--bracketed { color:#FFFFFF !important; background:#689F38 !important; cursor:default; }

        /* Tooltips for claim actions */
        .claim-action[data-tooltip]::before,
        .claim-action[data-tooltip]::after {
            position: absolute; opacity: 0; pointer-events: none;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 50; font-family: inherit; font-size: 10px;
        }
        .claim-action[data-tooltip]::after {
            content: attr(data-tooltip);
            bottom: calc(100% + 6px); right: 0;
            transform: translateY(4px);
            background: #1C1C1C; color: #FFFFFF;
            padding: 4px 8px; border-radius: 2px; font-weight: 500;
            white-space: nowrap; letter-spacing: 0.05em;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #333;
        }
        .claim-action[data-tooltip]::before {
            content: ''; bottom: calc(100% + 2px); left: 50%;
            transform: translateX(-50%) translateY(4px);
            border-width: 4px 4px 0; border-style: solid;
            border-color: #333 transparent transparent transparent;
        }
        .claim-action[data-tooltip]:hover::after {
            opacity: 1; transform: translateY(0);
        }
        .claim-action[data-tooltip]:hover::before {
            opacity: 1; transform: translateX(-50%) translateY(0);
        }

        /* Claim unit content padding when toolbar is shown */
        .claim-unit:hover .claim-content { padding-right:46px; }
        .claim-content { display:block; }

        /* ─── Bracketed Claims Panel ─────────────── */
        .bracketed-panel {
            padding:7px 12px; background:#F0F7E8;
            border-top:1px solid #C8E6C9;
            animation: chat-expand .15s ease;
        }
        .bracketed-panel-label { font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#689F38; margin-bottom:6px; display:flex; align-items:center; gap:5px; }
        .bracketed-claim-item {
            display:flex; align-items:flex-start; gap:6px;
            padding:4px 0; border-bottom:1px solid rgba(104,159,56,.15);
        }
        .bracketed-claim-item:last-child { border-bottom:none; }
        .bracketed-claim-text { flex:1; font-size:10.5px; line-height:1.5; color:#374151; }
        .bracketed-claim-source { font-size:8px; color:#9CA3AF; margin-top:1px; }
        .bracketed-claim-remove {
            flex-shrink:0; width:14px; height:14px; border-radius:3px; border:none;
            background:none; color:#9CA3AF; cursor:pointer; display:flex;
            align-items:center; justify-content:center; transition:color .1s;
        }
        .bracketed-claim-remove:hover { color:#EF4444; }

        /* ─── Drill context banner ───────────────── */
        .drill-banner {
            display:flex; align-items:center; gap:6px;
            padding:6px 12px; background:#EFF6FF; border-top:1px solid #BFDBFE;
            border-bottom:1px solid #BFDBFE; font-size:10px; color:#374151;
        }
        .drill-banner-label { font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#3B82F6; }
        .drill-banner-text { flex:1; font-style:italic; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .drill-banner-clear { font-size:8px; font-weight:600; color:#3B82F6; cursor:pointer; border:none; background:none; padding:0; }

        /* ─── Suggestion pills ───────────────────── */
        .inline-pills { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px 0; border-top: 1px solid #F3F4F6; }
        .inline-pill {
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 8px; font-weight: 700; color: #1C1C1C;
            text-transform: uppercase; letter-spacing: 0.1em;
            background: transparent; border: 0.5pt solid #1C1C1C; border-radius: 0;
            padding: 4px 8px; cursor: pointer; transition: all 0.15s;
            display: inline-flex; align-items: center; gap: 5px;
        }
        .inline-pill:hover { background: #1C1C1C; color: #FFFFFF; }

        /* ─── Thinking dots ──────────────────────── */
        .thinking-dots { display:flex; gap:3px; align-items:center; padding:4px 0; }
        .thinking-dots span { display:inline-block; width:5px; height:5px; background:#9CA3AF; border-radius:50%; animation:dot-pulse 1.2s infinite ease-in-out; }
        .thinking-dots span:nth-child(2) { animation-delay:.2s; }
        .thinking-dots span:nth-child(3) { animation-delay:.4s; }
        @keyframes dot-pulse { 0%,80%,100%{transform:scale(.8);opacity:.4}40%{transform:scale(1);opacity:1} }

        /* ─── Input row ──────────────────────────── */
        .inline-input-container { border-top:1px solid #E5E7EB; background:#FAFAFA; border-radius: 0 0 10px 10px; }
        .inline-file-preview { display:flex; flex-wrap:wrap; gap:5px; padding:6px 10px 0; }
        .inline-file-chip { display:flex; align-items:center; gap:4px; background:#F3F4F6; border:1px solid #D1D5DB; border-radius:4px; padding:2px 6px; font-size:9px; color:#374151; max-width:140px; }
        .inline-file-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .inline-file-remove { background:none; border:none; color:#9CA3AF; cursor:pointer; padding:0; display:flex; align-items:center; justify-content:center; }
        .inline-file-remove:hover { color:#EF4444; }
        .inline-input-row { display:flex; gap:6px; padding:7px 10px; align-items:center; }
        .inline-attach { flex-shrink:0; width:28px; height:28px; border-radius:50%; background:transparent; color:#9CA3AF; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:color .13s, background .13s; }
        .inline-attach:hover:not(:disabled) { color:#1C1C1C; background:#E5E7EB; }
        .inline-attach:disabled { opacity:.35; cursor:not-allowed; }
        .inline-input {
            flex:1; font-family:inherit; font-size:11.5px; color:#1C1C1C;
            background:#FFFFFF; border:1px solid #E5E7EB; border-radius:16px;
            padding:6px 12px; outline:none; transition:border-color .13s;
        }
        .inline-input:focus { border-color:#689F38; }
        .inline-send {
            flex-shrink:0; width:28px; height:28px; border-radius:50%;
            background:#1C1C1C; color:white; border:none; cursor:pointer;
            display:flex; align-items:center; justify-content:center; transition:background .13s;
        }
        .inline-send:hover:not(:disabled) { background:#333; }
        .inline-send:disabled { opacity:.35; cursor:not-allowed; }

        /* ─── Markdown in bubbles ────────────────── */
        .inline-bubble h2,.inline-bubble h3,.inline-bubble h4 { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin:12px 0 4px; color:#111827; line-height: 1.4; }
        .inline-bubble h2:first-child,.inline-bubble h3:first-child,.inline-bubble h4:first-child { margin-top:0; }
        .inline-bubble p { margin-top:0; margin-bottom:0; line-height:1.65; }
        .inline-bubble ul,.inline-bubble ol { padding-left:18px; margin-top:0; margin-bottom:0; }
        .inline-bubble li { margin-bottom:4px; }
        .inline-bubble li:last-child { margin-bottom:0; }
        .inline-bubble strong { font-weight:700; color:#111827; }
        .inline-msg--user .inline-bubble strong { color:#FFFFFF; }


        /* ─── Dark Mode Overrides ────────────────── */
        .dark .inline-chat { border-color: #27272a; background: #09090b; }
        .dark .inline-chat-header { background: #18181b; border-bottom-color: #27272a; }
        .dark .inline-chat-title { color: #a1a1aa; }
        .dark .inline-chat-section { color: #8bc34a; background: #1a2e0530; border-color: #416b1f; }
        .dark .breadcrumb-bar { background: #000000; border-bottom-color: #27272a; }
        .dark .breadcrumb-item { color: #71717a; }
        .dark .breadcrumb-item:hover { color: #e4e4e7; }
        .dark .breadcrumb-item.active { color: #8bc34a; }
        .dark .inline-bubble { background: #18181b; border-color: transparent; color: #F3F4F6; }
        .dark .inline-msg--user .inline-bubble { background: #fafafa; color: #18181b; }
        .dark .claim-unit:hover { background: #1a2e0530; border-left-color: #8bc34a; }
        .dark .claim-unit--heading { color: #e4e4e7; }
        .dark .claim-action { background: rgba(24, 24, 27, 0.9); }
        .dark .bracketed-panel { background: #1a2e0530; border-top-color: #416b1f; }
        .dark .bracketed-claim-text { color: #e4e4e7; }
        .dark .drill-banner { background: #1e3a8a30; border-color: #1e3a8a; color: #e4e4e7; }
        .dark .inline-pills { border-top-color: #27272a; }
        .dark .inline-pill { color: #e4e4e7; border-color: #52525b; }
        .dark .inline-pill:hover { background: #e4e4e7; color: #18181b; }
        .dark .inline-input-container { border-top-color: #27272a; background: #09090b; }
        .dark .inline-input { background: #18181b; border-color: #27272a; color: #e4e4e7; }
        .dark .inline-file-chip { background: #27272a; border-color: #3f3f46; color: #e4e4e7; }
        .dark .inline-bubble h2, .dark .inline-bubble h3, .dark .inline-bubble h4, .dark .inline-bubble strong { color: #F3F4F6; }
        .dark .inline-msg--user .inline-bubble strong { color: #18181b; }

        /* Dark mode overrides for new tooltips and popover */
        .dark .evidence-popover {
            background: #FAFAFA; color: #18181b;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            border-color: #E5E7EB;
        }
        .dark .evidence-popover::before {
            background: #FAFAFA;
            border-top: 1px solid #E5E7EB;
            border-left: 1px solid #E5E7EB;
        }
        .dark .evidence-label {
            color: #52525b; border-bottom-color: #E5E7EB;
        }
        .dark .evidence-popover a { color: #8B5CF6; }
        .dark .evidence-popover a:hover { color: #7C3AED; }

        .dark .claim-action[data-tooltip]::after {
            background: #FAFAFA; color: #1C1C1C;
            border-color: #E5E7EB;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        .dark .claim-action[data-tooltip]::before {
            border-color: #E5E7EB transparent transparent transparent;
        }

        /* ─── Alternate Nostril Breathing Animation ─ */
        @keyframes nostril-breathing {
            0%, 100% { box-shadow: -4px 0 10px -2px rgba(104, 159, 56, 0.4), 4px 0 10px -2px rgba(104, 159, 56, 0); }
            50% { box-shadow: -4px 0 10px -2px rgba(104, 159, 56, 0), 4px 0 10px -2px rgba(104, 159, 56, 0.4); }
        }
        @keyframes dark-nostril-breathing {
            0%, 100% { box-shadow: -4px 0 10px -2px rgba(139, 195, 74, 0.4), 4px 0 10px -2px rgba(139, 195, 74, 0); }
            50% { box-shadow: -4px 0 10px -2px rgba(139, 195, 74, 0), 4px 0 10px -2px rgba(139, 195, 74, 0.4); }
        }
        .active-breathing {
            animation: nostril-breathing 5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
            border-color: rgba(104, 159, 56, 0.3) !important;
        }
        .dark .active-breathing {
            animation: dark-nostril-breathing 5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
            border-color: rgba(139, 195, 74, 0.3) !important;
        }
    `],
  template: `
    <div class="relative node-wrapper group/node mb-4"
         [class.has-inline-chat]="showChat()"
         [class.mb-2]="type() === 'list-item'"
         [class.opacity-50]="isRejected()"
         [class.grayscale]="isRejected()">

      <!-- ─── Main Node Content ──────────────── -->
      @if (type() === 'paragraph') {
        <p class="flex items-start gap-2 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-900/50 rounded-xl p-2 transition-all duration-200"
           [class.bracket-removed]="node().bracketState === 'removed'"
           [class.bracket-added]="node().bracketState === 'added'"
           (dblclick)="toggleBracket()"
           (click)="detectAndHighlightBodyPart(node(), false)"
           (mouseenter)="detectAndHighlightBodyPart(node(), true)"
           (mouseleave)="clearHoverState()">
          @if (node().bracketState === 'added') {
            <span class="inline-flex items-center text-green-600 dark:text-green-400 mt-0.5" [innerHTML]="ClinicalIcons.Verified | safeHtml" title="Approved / Bracketed Claim"></span>
          } @else if (node().bracketState === 'removed') {
            <span class="inline-flex items-center text-red-500 dark:text-red-400 mt-0.5" [innerHTML]="ClinicalIcons.Clear | safeHtml" title="Removed / Excluded Claim"></span>
          }
          <span [innerHTML]="rawHtml() | safeHtml" class="flex-1"></span>
        </p>
      } @else if (type() === 'list-item') {
        <div class="flex items-start gap-2 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-900/50 rounded-xl p-2 transition-all duration-200"
             [class.bracket-removed]="node().bracketState === 'removed'"
             [class.bracket-added]="node().bracketState === 'added'"
             (dblclick)="toggleBracket()"
             (click)="detectAndHighlightBodyPart(node(), false)"
             (mouseenter)="detectAndHighlightBodyPart(node(), true)"
             (mouseleave)="clearHoverState()">
          @if (node().bracketState === 'added') {
            <span class="inline-flex items-center text-green-600 dark:text-green-400 mt-0.5" [innerHTML]="ClinicalIcons.Verified | safeHtml" title="Approved / Bracketed Claim"></span>
          } @else if (node().bracketState === 'removed') {
            <span class="inline-flex items-center text-red-500 dark:text-red-400 mt-0.5" [innerHTML]="ClinicalIcons.Clear | safeHtml" title="Removed / Excluded Claim"></span>
          }
          <span [innerHTML]="listItemHtml() | safeHtml" class="block flex-1"></span>
        </div>
      }

      <!-- ─── Evidence Popover ───────────────── -->
      <div class="evidence-popover no-print">
        @if (node().verificationIssues?.length) {
          <div class="evidence-hint">
            {{ node().verificationIssues![0].message }}
          </div>
        }
        @if (node().verificationStatus) {
          <div class="evidence-status-row">
            <span class="evidence-status-dot"
              [class.evidence-status-dot--verified]="node().verificationStatus === 'verified'"
              [class.evidence-status-dot--warning]="node().verificationStatus === 'warning'"
              [class.evidence-status-dot--error]="node().verificationStatus === 'error'"
              [class.evidence-status-dot--unverified]="!node().verificationStatus || node().verificationStatus === 'unverified'">
            </span>
            <span class="evidence-status-text">
              {{ node().verificationStatus === 'verified' ? 'Verified against patient data'
               : node().verificationStatus === 'warning' ? 'Accuracy concern flagged'
               : node().verificationStatus === 'error' ? 'Critical accuracy error'
               : 'Verification pending' }}
            </span>
          </div>
        }
      </div>

      <!-- ─── Hover Toolbar ─────────────────── -->
      <div class="node-toolbar no-print max-w-full flex-wrap sm:flex-nowrap overflow-x-auto hide-scrollbar shrink">
        <pocket-gull-button (click)="rejectNode()" variant="ghost" size="sm"
          class="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800" ariaLabel="Flag Issue"
          [class.text-red-600]="isRejected()"
          [icon]="ClinicalIcons.Flag">
        </pocket-gull-button>
        <pocket-gull-button (click)="toggleBracket()" variant="ghost" size="sm"
          class="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800" ariaLabel="Finalize"
          [icon]="ClinicalIcons.Verified">
        </pocket-gull-button>
        <pocket-gull-button (click)="onDoubleClick()" variant="ghost" size="sm"
          class="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800" ariaLabel="Add Note"
          [icon]="ClinicalIcons.Assessment">
        </pocket-gull-button>
        <pocket-gull-button (click)="searchPubMed()" variant="ghost" size="sm"
          class="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800" ariaLabel="Search PubMed"
          [icon]="ClinicalIcons.PubMed">
        </pocket-gull-button>
        <pocket-gull-button (click)="searchGoogle()" variant="ghost" size="sm"
          class="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800" ariaLabel="Search Google"
          [icon]="ClinicalIcons.Google">
        </pocket-gull-button>
        @if (isPurchasableRecommendation()) {
          <a [href]="getAmazonSearchUrl()" target="_blank" rel="noopener noreferrer"
             class="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold font-mono transition flex items-center gap-1 shadow-xs"
             title="View Recommended Supply Item (Affiliate Link)">
            <app-clinical-icon name="AmazonStore" size="xs" theme="ayurvedic"></app-clinical-icon>
            <span>Recommended Supply</span>
          </a>
        }
        <pocket-gull-button (click)="toggleChat()" variant="ghost" size="sm"
          class="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800"
          [class.active-breathing]="!hasDiscoveredEvidenceFocus()"
          [class.text-green-600]="!showChat()" [class.text-gray-500]="showChat()"
          [class.dark:text-[#8bc34a]]="!showChat()" [class.dark:text-zinc-400]="showChat()"
          [ariaLabel]="showChat() ? 'Close Agent' : 'Ask Agent'"
          [icon]="showChat() ? ClinicalIcons.Clear : ClinicalIcons.EvidenceFocus">
        </pocket-gull-button>
      </div>

      <!-- ─── Suggestions & Proposals ─────────── -->
      @if (node().suggestions?.length || node().proposedText) {
        <div class="mt-2 flex flex-col gap-2 no-print">
          @if (node().suggestions?.length) {
            <div class="flex flex-wrap gap-1.5 align-center">
              <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mr-1 mt-1">Suggestions:</span>
              @for (sugg of node().suggestions; track sugg) {
                <pocket-gull-badge [label]="sugg" severity="info" [hasIcon]="true"
                  class="cursor-pointer hover:scale-105 transition-transform"
                  (click)="insertSuggestion(sugg)">
                  <div badge-icon [innerHTML]="ClinicalIcons.Suggestion | safeHtml"></div>
                </pocket-gull-badge>
              }
            </div>
          }
          @if (node().proposedText && !proposalAccepted()) {
            <div class="bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 rounded-sm p-3 text-sm">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">Proposed Improvement:</span>
                <pocket-gull-button (click)="acceptProposal()" variant="primary" size="sm"
                  icon="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z">
                  Accept Change
                </pocket-gull-button>
              </div>
              <p class="text-amber-900 dark:text-amber-200 italic">"{{ node().proposedText }}"</p>
            </div>
          }
        </div>
      }

      <!-- ─── Verification Issues ───────────── -->
      @if (node().verificationStatus !== 'verified' && node().verificationIssues?.length) {
        <div class="mt-2 p-3 rounded-sm border flex flex-col gap-2 no-print"
             [class.bg-red-50]="node().verificationStatus === 'error'"
             [class.dark:bg-red-950]="node().verificationStatus === 'error'"
             [class.border-red-100]="node().verificationStatus === 'error'"
             [class.dark:border-red-900]="node().verificationStatus === 'error'"
             [class.bg-amber-50]="node().verificationStatus === 'warning'"
             [class.dark:bg-amber-950]="node().verificationStatus === 'warning'"
             [class.border-amber-100]="node().verificationStatus === 'warning'"
             [class.dark:border-amber-900]="node().verificationStatus === 'warning'">
          <div class="flex items-center gap-2">
            <pocket-gull-badge
              [label]="node().verificationStatus === 'error' ? 'Critical Accuracy Error' : 'Accuracy Warning'"
              [severity]="node().verificationStatus === 'error' ? 'error' : 'warning'" [hasIcon]="true">
              <div badge-icon [innerHTML]="ClinicalIcons.Risk | safeHtml"></div>
            </pocket-gull-badge>
            @if (hasAcmViolation()) {
              <pocket-gull-badge
                [label]="'ACM 1.3 Ethics Flag'"
                [severity]="'error'" [hasIcon]="true">
                <div badge-icon [innerHTML]="ClinicalIcons.Risk | safeHtml"></div>
              </pocket-gull-badge>
            }
            <span class="text-xs font-bold text-gray-555 dark:text-zinc-400 uppercase tracking-widest">Medical Audit Result</span>
          </div>
          <div class="pl-1 flex flex-col gap-1">
            @for (issue of node().verificationIssues; track issue.message) {
              <div class="flex items-start gap-2 text-xs">
                <span [class.text-red-600]="node().verificationStatus === 'error'"
                      [class.dark:text-red-400]="node().verificationStatus === 'error'"
                      [class.text-amber-600]="node().verificationStatus === 'warning'"
                      [class.dark:text-amber-400]="node().verificationStatus === 'warning'">•</span>
                <span class="text-gray-700 dark:text-zinc-300 leading-relaxed">{{ issue.message }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- ─── Note Editor ────────────────────── -->
      @if (node().showNote) {
        <div class="mt-2 ml-4 p-3 bg-[#f9fbf7] dark:bg-[#1a2e05]/30 border-l-2 border-[#416B1F] dark:border-[#8bc34a] rounded-r-sm">
          <pocket-gull-input type="textarea" [rows]="2" [placeholder]="'Add medical rationale...'"
            [value]="node().note || ''" (valueChange)="updateNote($event)">
          </pocket-gull-input>
        </div>
      }

      <!-- ─── Print-Only: Evidence Trail (Dieter Rams) ─── -->
      @if (bracketedClaims().length > 0) {
        <div class="print-only evidence-trail-print">
          <div class="et-header">
            <span class="et-label">AI Evidence Trail</span>
            <span class="et-count">{{ bracketedClaims().length }} claim{{ bracketedClaims().length > 1 ? 's' : '' }} bracketed</span>
          </div>
          <ol class="et-list">
            @for (claim of bracketedClaims(); track claim.id; let i = $index) {
              <li class="et-item">
                <span class="et-num">{{ i + 1 }}</span>
                <div class="et-content">
                  <span class="et-text">{{ claim.text }}</span>
                  @if (claim.drillContext) {
                    <span class="et-drill">↳ Drilled from: {{ claim.drillContext }}</span>
                  }
                </div>
              </li>
            }
          </ol>
        </div>
      }

      <!-- ─── Inline Agent Chat ──────────────── -->
      @if (showChat()) {
        <div class="inline-chat no-print" #chatContainer>

          <!-- Header -->
          <div class="inline-chat-header">
            <span class="flex items-center justify-center bg-[#F0F7E8] text-[#689F38] rounded-sm p-0.5 border border-[#C8E6C9]" [innerHTML]="ClinicalIcons.EvidenceFocus | safeHtml"></span>
            <span class="inline-chat-title ml-1">Evidence Focus</span>
            <span class="inline-chat-section">{{ sectionTitle() }}</span>
            @if (chatIsLoading()) {
              <div class="w-3 h-3 border-2 border-gray-300 border-t-[#689F38] rounded-sm animate-spin ml-auto"></div>
            }
          </div>

          <!-- Breadcrumb trail -->
          @if (drillStack().length > 0) {
            <div class="breadcrumb-bar">
              <button class="breadcrumb-item" (click)="popToRoot()">Overview</button>
              @for (crumb of drillStack(); track $index; let last = $last) {
                <span class="breadcrumb-sep">›</span>
                <button class="breadcrumb-item" [class.active]="last"
                        (click)="popToLevel($index)">
                  {{ crumb.slice(0, 28) }}{{ crumb.length > 28 ? '…' : '' }}
                </button>
              }
            </div>
          }

          <!-- Active drill context banner -->
          @if (activeDrillText()) {
            <div class="drill-banner">
              <span class="drill-banner-label">Drilling into</span>
              <span class="drill-banner-text">{{ activeDrillText() }}</span>
              <button class="drill-banner-clear" (click)="popToRoot()">✕ Clear</button>
            </div>
          }

          <!-- Messages -->
          <div class="inline-chat-body" #chatBody>
            @for (msg of chatHistory(); track $index) {

              @if (msg.role === 'user') {
                <div class="inline-msg inline-msg--user">
                  <div class="inline-bubble" [innerHTML]="(msg.html || msg.text) | safeHtml"></div>
                </div>
              } @else {
                <!-- Model message: render as interactive claim units -->
                <div class="inline-msg">
                  <div class="inline-avatar">
                    <svg viewBox="0 -960 960 960" fill="currentColor" width="11" height="11">
                      <path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z"/>
                    </svg>
                  </div>
                  <div class="inline-bubble claim-bubble" style="padding: 6px 8px;">
                    @if (msg.claims && msg.claims.length > 0) {
                      @for (claim of msg.claims; track claim.id) {
                        <div class="claim-unit" [class.claim-unit--heading]="claim.type === 'heading'">
                          <span class="claim-content" [innerHTML]="(claim.type === 'list-item'
                            ? '• ' + claim.html
                            : claim.html) | safeHtml"></span>
                          @if (claim.type !== 'heading') {
                            <div class="claim-toolbar">
                              <!-- Bracket / extract button -->
                              @if (isBracketed(claim.id)) {
                                <button class="claim-action claim-action--bracketed" title="Bracketed into plan" data-tooltip="Bracketed into plan">
                                  <svg viewBox="0 -960 960 960" fill="currentColor" width="8" height="8">
                                    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                                  </svg>
                                </button>
                              } @else {
                                <button class="claim-action claim-action--bracket"
                                        title="Bracket this claim into care plan"
                                        data-tooltip="Bracket this claim into care plan"
                                        (click)="bracketClaim(claim)">
                                  <svg viewBox="0 -960 960 960" fill="currentColor" width="9" height="9">
                                    <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Z"/>
                                  </svg>
                                </button>
                              }
                              <!-- Drill deeper button -->
                              <button class="claim-action claim-action--drill"
                                      title="Drill deeper into this claim"
                                      data-tooltip="Drill deeper into this claim"
                                      [disabled]="chatIsLoading()"
                                      (click)="drillInto(claim)">
                                <svg viewBox="0 -960 960 960" fill="currentColor" width="9" height="9">
                                  <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
                                </svg>
                              </button>
                            </div>
                          }
                        </div>
                      }
                    } @else {
                      <div [innerHTML]="(msg.html || msg.text) | safeHtml"></div>
                    }

                    <!-- ─── Rich Media Cards ──────────────────────── -->
                    @if (msg.richCards && msg.richCards.length > 0) {
                      <div class="rm-panel spark-theme">
                        @for (card of msg.richCards; track card.query) {

                          <!-- 3D Model -->
                          @if (card.kind === 'model-3d' && card.models?.length) {
                            <div class="rm-card rm-card--model">
                              <div class="rm-card-header">
                                <svg viewBox="0 -960 960 960" fill="currentColor" width="12" height="12"><path d="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-40-343 237-137-237-137-237 137 237 137ZM160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11L160-252Z"/></svg>
                                <span class="rm-card-title">{{ card.models[0].name }}</span>
                                <span class="rm-card-badge">3D Model</span>
                              </div>
                              <div class="rm-model-frame-wrap aspect-[1.618/1] w-full relative overflow-hidden rounded-sm">
                                @defer (on viewport; prefetch on idle) {
                                  <app-medical-3d-viewer 
                                    [threejsId]="card.models[0].threejsId"
                                    [severity]="card.severity"
                                    [afflictionHighlight]="card.afflictionHighlight"
                                    [particles]="card.particles"
                                    class="rm-model-frame absolute inset-0 w-full h-full">
                                  </app-medical-3d-viewer>
                                } @placeholder {
                                  <div class="absolute inset-0 w-full h-full flex items-center justify-center bg-[#FDFDFD] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                                    <div class="w-6 h-6 rounded-sm border-2 border-gray-300 border-t-black animate-spin"></div>
                                  </div>
                                }
                              </div>
                              <div class="rm-card-footer">Interactive Volume · Procedural Generation</div>
                            </div>
                          }

                          <!-- Image Gallery -->
                          @if (card.kind === 'image-gallery') {
                            <div class="rm-card rm-card--gallery">
                              <div class="rm-card-header">
                                <svg viewBox="0 -960 960 960" fill="currentColor" width="12" height="12"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-800v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Z"/></svg>
                                <span class="rm-card-title">Medical Illustrations: {{ card.query }}</span>
                                <span class="rm-card-badge">Wikimedia</span>
                              </div>
                              @if (card.loading) {
                                <div class="rm-loading">Searching Wikimedia Commons…</div>
                              } @else if (card.images?.length) {
                                <div class="rm-gallery-strip">
                                  @for (img of card.images; track img.url) {
                                    <a [href]="img.descriptionUrl" target="_blank" rel="noopener" class="rm-gallery-item relative block overflow-hidden">
                                      <img [ngSrc]="img.thumbUrl" fill [alt]="img.title" class="rm-gallery-img">
                                      <span class="rm-gallery-caption">{{ img.title | slice:0:40 }}</span>
                                    </a>
                                  }
                                </div>
                              } @else {
                                <div class="rm-empty">No illustrations found for "{{ card.query }}"</div>
                              }
                              <div class="rm-card-footer">Public domain · <a [href]="getWikimediaSearchUrl(card.query)" target="_blank" rel="noopener" class="hover:underline hover:text-purple-600 transition-colors">Wikimedia Commons</a></div>
                            </div>
                          }

                          <!-- PubMed Citations -->
                          @if (card.kind === 'pubmed-refs') {
                            <div class="rm-card rm-card--pubmed">
                              <div class="rm-card-header">
                                <svg viewBox="0 -960 960 960" fill="currentColor" width="12" height="12"><path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>
                                <span class="rm-card-title">Research: {{ card.query }}</span>
                                <span class="rm-card-badge">PubMed</span>
                              </div>
                              @if (card.loading) {
                                <div class="rm-loading">Searching PubMed…</div>
                              } @else if (card.citations?.length) {
                                <div class="rm-citations">
                                  @for (cite of card.citations; track cite.pmid) {
                                    <a [href]="cite.url" target="_blank" rel="noopener" class="rm-citation">
                                      <div class="rm-citation-title">{{ cite.title }}</div>
                                      <div class="rm-citation-meta">{{ cite.authors }} · <em>{{ cite.journal }}</em> · {{ cite.year }}</div>
                                      <div class="rm-citation-pmid">PMID {{ cite.pmid }} ↗</div>
                                    </a>
                                  }
                                </div>
                              } @else {
                                <div class="rm-empty">No results found</div>
                              }
                              <div class="rm-card-footer">NIH National Library of Medicine</div>
                            </div>
                          }

                          <!-- PHIL Image -->
                          @if (card.kind === 'phil-image' && card.philImages?.length) {
                            <div class="rm-card rm-card--phil">
                              <div class="rm-card-header">
                                <svg viewBox="0 -960 960 960" fill="currentColor" width="12" height="12"><path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z"/></svg>
                                <span class="rm-card-title">{{ card.philImages[0].title }}</span>
                                <span class="rm-card-badge">CDC PHIL</span>
                              </div>
                              <div class="rm-gallery-strip">
                                @for (img of card.philImages; track img.id) {
                                  <div class="rm-gallery-item">
                                    <img [src]="img.thumbUrl" [alt]="img.title" class="rm-gallery-img" loading="lazy"
                                         (error)="img.thumbUrl = img.url">
                                    <span class="rm-gallery-caption">{{ img.credit }}</span>
                                  </div>
                                }
                              </div>
                              <div class="rm-card-footer">Public domain · CDC Public Health Image Library</div>
                            </div>
                          }

                        }
                      </div>
                    }

                    <!-- Feedback Actions -->
                    <div class="mt-2 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5 pt-2">
                      <pocket-gull-button variant="ghost" size="xs" (click)="actionThumbsUp(msg)" [icon]="ClinicalIcons.Helpful" ariaLabel="Mark as Helpful" [class.text-green-600]="msg.feedback === 'up'" [class.dark:text-green-400]="msg.feedback === 'up'"></pocket-gull-button>
                      <pocket-gull-button variant="ghost" size="xs" (click)="actionThumbsDown(msg)" [icon]="ClinicalIcons.Flag" ariaLabel="Flag Issue" [class.text-red-600]="msg.feedback === 'down'" [class.dark:text-red-400]="msg.feedback === 'down'"></pocket-gull-button>
                    </div>

                  </div>
                </div>
              }
            }

            @if (chatIsLoading()) {
              <div class="inline-msg">
                <div class="inline-avatar">
                  <svg viewBox="0 -960 960 960" fill="currentColor" width="11" height="11">
                    <path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z"/>
                  </svg>
                </div>
                <div class="inline-bubble">
                  <div class="thinking-dots"><span></span><span></span><span></span></div>
                </div>
              </div>
            }
          </div>

          <!-- Suggestion pills (persist while idle) -->
          @if (showSuggestions() && !chatIsLoading() && drillStack().length === 0) {
            <div class="flex flex-wrap items-center justify-center gap-2 mt-4 mb-2 w-full px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              @for (s of suggestionPills(); track s) {
                <button type="button" (click)="sendPill(s)" class="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-[#689F38] dark:hover:text-[#8bc34a] transition-all shadow-sm flex items-center gap-1.5">
                   <div [innerHTML]="ClinicalIcons.Suggestion | safeHtml" class="w-3.5 h-3.5 opacity-70"></div>
                   {{ s }}
                </button>
              }
              <!-- Rich media action pills -->
              <button type="button" (click)="requestImage()" class="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm flex items-center gap-1.5">
                <div [innerHTML]="ClinicalIcons.Image | safeHtml" class="w-3.5 h-3.5 opacity-70"></div>
                Request Image
              </button>
              <button type="button" (click)="request3DModel()" class="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all shadow-sm flex items-center gap-1.5">
                <div [innerHTML]="ClinicalIcons.Model3D | safeHtml" class="w-3.5 h-3.5 opacity-70"></div>
                3D Model
              </button>
              <button type="button" (click)="requestResearch()" class="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-amber-600 dark:hover:text-amber-400 transition-all shadow-sm flex items-center gap-1.5">
                <div [innerHTML]="ClinicalIcons.Research | safeHtml" class="w-3.5 h-3.5 opacity-70"></div>
                Research
              </button>
            </div>
          }

          <!-- Bracketed claims panel -->
          @if (bracketedClaims().length > 0) {
            <div class="bracketed-panel">
              <div class="bracketed-panel-label">
                <svg viewBox="0 -960 960 960" fill="currentColor" width="10" height="10">
                  <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                </svg>
                {{ bracketedClaims().length }} Claim{{ bracketedClaims().length === 1 ? '' : 's' }} Bracketed into Plan
              </div>
              @for (claim of bracketedClaims(); track claim.id) {
                <div class="bracketed-claim-item">
                  <div class="flex-1">
                    <div class="bracketed-claim-text">{{ claim.text }}</div>
                    @if (claim.drillContext) {
                      <div class="bracketed-claim-source">from: {{ claim.drillContext.slice(0, 40) }}…</div>
                    }
                  </div>
                  <button class="bracketed-claim-remove" title="Remove" (click)="removeClaim(claim.id)">
                    <svg viewBox="0 -960 960 960" fill="currentColor" width="8" height="8">
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          }

          <!-- Input -->
          <div class="inline-input-container">
            @if (selectedFiles().length > 0) {
              <div class="inline-file-preview">
                @for (file of selectedFiles(); track $index) {
                  <div class="inline-file-chip">
                    <span class="inline-file-name" [title]="file.name">{{ file.name }}</span>
                    <button class="inline-file-remove" (click)="removeFile($index)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                }
              </div>
            }
            <div class="inline-input-row">
              <button class="inline-attach" (click)="triggerFileInput()" [disabled]="chatIsLoading()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <input type="file" #fileInput [name]="'fileInput-' + node().key" [id]="'fileInput-' + node().key" (change)="onFileSelected($event)" multiple accept="image/*,video/*" class="hidden" style="display: none;">
              <input #chatInput class="inline-input" type="text"
                [name]="'chatInput-' + node().key"
                [id]="'chatInput-' + node().key"
                [(ngModel)]="chatInputText"
                [placeholder]="drillStack().length > 0 ? 'Ask about this specific claim…' : 'Ask a follow-up…'"
                (keydown.enter)="sendMessage()"
                [disabled]="chatIsLoading()">
              <button class="inline-send" (click)="sendMessage()"
                      [disabled]="chatIsLoading() || (!chatInputText.trim() && selectedFiles().length === 0)">
                <svg viewBox="0 -960 960 960" fill="currentColor" width="14" height="14">
                  <path d="M120-160v-240l320-80-320-80v-240l760 320-760 320Z"/>
                </svg>
              </button>
            </div>
          </div>
          <!-- Scroll anchor: scrollIntoView here to avoid inner scroll trap -->
          <div #chatBottom style="height:1px"></div>
        </div>
      }
    </div>
    `,
})
export class SummaryNodeComponent implements AfterViewChecked {
  private secureStorage = inject(SecureStorageService);
  node = input.required<ISummaryNode | ISummaryNodeItem>();
  nodeItem = input<ISummaryNodeItem>({} as any);
  type = input<'paragraph' | 'list-item'>('paragraph');
  sectionTitle = input<string>('');
  saveStatus = input<string | undefined>();
  protocolInsights = input<string[]>([]);

  update = output<{ key: string; note?: string; showNote?: boolean; bracketState?: 'normal' | 'added' | 'removed'; acceptedProposal?: string }>();
  dictationToggle = output<void>();
  askAgent = output<{ nodeKey: string; nodeText: string; sectionTitle: string }>();

  @ViewChild('chatBottom') chatBottomRef!: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('chatContainer') chatContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private intel = inject(ClinicalIntelligenceService);
  private markdown = inject(MarkdownService);
  private dictation = inject(DictationService);
  private richMedia = inject(RichMediaService);
  private sanitizer = inject(DomSanitizer);
  private patientState = inject(PatientStateService);

  safeEmbedUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  proposalAccepted = signal(false);
  isRejected = signal(false);
  rawHtml = computed(() => (this.node() as any).rawHtml || '');
  listItemHtml = computed(() => (this.node() as any).rawHtml || (this.node() as any).html || '');
  hasAcmViolation = computed(() => {
    const issues = this.node().verificationIssues;
    if (!issues) return false;
    return issues.some(issue => issue.message && issue.message.includes('ACM 1.3'));
  });

  // ─── Inline chat ─────────────────────────────
  showChat = signal(false);
  chatHistory = signal<IInlineChatEntry[]>([]);
  chatIsLoading = signal(false);
  showSuggestions = signal(true);
  selectedFiles = signal<File[]>([]);
  chatInputText = '';
  hasDiscoveredEvidenceFocus = signal(true);

  constructor() {
    const discovered = this.secureStorage.getItem('pocketgull_evidence_focus_discovered');
    this.hasDiscoveredEvidenceFocus.set(discovered === 'true');
  }

  // ─── Claim bracketing ────────────────────────
  bracketedClaims = signal<IBracketedClaim[]>([]);
  bracketedIds = signal<Set<string>>(new Set());

  // ─── Drill stack (breadcrumb) ─────────────────
  drillStack = signal<string[]>([]);
  activeDrillText = computed(() => {
    const stack = this.drillStack();
    return stack.length > 0 ? stack[stack.length - 1] : null;
  });

  private sessionStarted = false;
  private needsScroll = false;

  suggestionPills = computed<string[]>(() => {
    const s = this.sectionTitle().toLowerCase();
    if (s.includes('overview') || s.includes('summary'))
      return ['What evidence supports this?', 'Alternative approaches?', 'Key risks?'];
    if (s.includes('protocol') || s.includes('functional') || s.includes('intervention'))
      return ['Dosing rationale?', 'Drug interactions?', 'Supporting trials?'];
    if (s.includes('monitoring') || s.includes('follow'))
      return ['What outcomes to track?', 'Warning signs?', 'How urgent?'];
    if (s.includes('education'))
      return ['Simplify for patient', 'Expected patient questions?'];
    return ['Clinical rationale?', 'Alternatives?', 'Contraindications?'];
  });

  ngAfterViewChecked() {
    if (this.needsScroll) { this.scrollBottom(); this.needsScroll = false; }
  }

  // ─── Feedback Actions ─────────────────────────
  rejectNode() {
    this.isRejected.set(!this.isRejected());
  }

  actionThumbsUp(entry: IInlineChatEntry) {
    entry.feedback = entry.feedback === 'up' ? undefined : 'up';
    this.chatHistory.update(h => [...h]);
  }

  actionThumbsDown(entry: IInlineChatEntry) {
    entry.feedback = entry.feedback === 'down' ? undefined : 'down';
    this.chatHistory.update(h => [...h]);
  }

  // ─── isBracketed ─────────────────────────────
  isBracketed(claimId: string): boolean {
    return this.bracketedIds().has(claimId);
  }

  // ─── Bracket a claim ─────────────────────────
  // ─── Bracket a claim ─────────────────────────
  bracketClaim(claim: IClaimUnit) {
    if (this.isBracketed(claim.id)) return;
    const drill = this.activeDrillText();
    
    const decodeHtml = (html: string) => {
      if (typeof document !== 'undefined') {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
      }
      return html.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    };

    const cleanText = decodeHtml(claim.text);
    const newClaim: IBracketedClaim = { id: claim.id, text: cleanText, drillContext: drill ?? undefined };
    
    this.bracketedClaims.update(c => [...c, newClaim]);
    this.bracketedIds.update(s => new Set([...s, claim.id]));
    
    // Formulate the contextual breadcrumbs [Category][Subcomponent]
    const section = this.sectionTitle();
    const cat = section ? `[${section}]` : '';
    // Use the root of the drill stack or the current node's active html header to infer the subcategory
    const rootDrill = this.drillStack().length > 0 ? this.drillStack()[0] : '';
    const subCatRaw = rootDrill || this.listItemHtml().replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const subCat = subCatRaw ? `[${decodeHtml(subCatRaw).slice(0, 35).trim()}]` : '';
    const prefix = (cat || subCat) ? `${cat}${subCat}` : `[Bracketed claim]`;

    // Push to node notes as well
    const existingNote = this.node().note || '';
    const noteAddition = `${prefix} ${cleanText}`;
    this.update.emit({ key: this.node().key, note: existingNote ? `${existingNote}\n${noteAddition}` : noteAddition });
  }

  removeClaim(claimId: string) {
    this.bracketedClaims.update(c => c.filter(x => x.id !== claimId));
    this.bracketedIds.update(s => { const n = new Set(s); n.delete(claimId); return n; });
  }

  // ─── Drill deeper into a claim ───────────────
  async drillInto(claim: IClaimUnit) {
    if (this.chatIsLoading()) return;
    this.drillStack.update(s => [...s, claim.text.slice(0, 50)]);
    const prompt = `Go deeper on this specific clinical claim: "${claim.text}"\n\nProvide detailed evidence, supporting guidelines, clinical studies, or specific contraindications relevant to this single statement. Be precise and evidence-based.`;
    await this._sendPrompt(prompt);
  }

  // ─── Pop back to root ─────────────────────────
  popToRoot() { this.drillStack.set([]); }

  // ─── Pop to a specific breadcrumb level ───────
  popToLevel(idx: number) {
    this.drillStack.update(s => s.slice(0, idx + 1));
  }

  // ─── Toggle chat open/closed ──────────────────
  toggleChat() {
    if (!this.hasDiscoveredEvidenceFocus()) {
      this.hasDiscoveredEvidenceFocus.set(true);
      this.secureStorage.setItem('pocketgull_evidence_focus_discovered', 'true');
    }

    if (this.showChat()) {
      this.showChat.set(false);
    } else {
      this.showChat.set(true);
      if (!this.sessionStarted) { this.sessionStarted = true; this.startInlineSession(); }
    }
  }

  // --- External Research Integration ---
  searchPubMed() {
    this.executeSearch('pubmed');
  }

  searchGoogle() {
    this.executeSearch('google');
  }

  private executeSearch(engine: 'google' | 'pubmed') {
    const rawContent = this.type() === 'list-item' ? this.listItemHtml() : (this.node() as any).rawHtml || '';
    // Strip HTML to get queryable text
    const textContent = rawContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (textContent) {
      this.patientState.requestResearchSearch(textContent, engine);
    }
  }

  private patientManager = inject(PatientManagementService);

  private async startInlineSession() {
    this.chatIsLoading.set(true);
    try {
      const nodeText = this.listItemHtml().replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const section = this.sectionTitle();
      
      const patientId = this.patientManager.selectedPatientId();
      const patientObj = this.patientManager.patients().find(p => p.id === patientId);
      const history = patientObj?.history || [];
      const bookmarks = patientObj?.bookmarks || [];
      const patient = this.patientState.getAllDataForPrompt(history, bookmarks);

      const context = `You are a focused clinical evidence assistant embedded in the PocketGull Clinical Intelligence Platform.
A clinician is reviewing a specific recommendation from the "${section}" section of an AI-generated care plan.

The recommendation under review:
"""
${nodeText.slice(0, 400)}${nodeText.length > 400 ? '...' : ''}
"""

Patient context is available. Your role:
1. Briefly explain the clinical rationale (2-3 sentences).
2. Cite supporting evidence or guidelines if applicable using strict UKRIO-compliant scientific reference formats. You MUST hyperlink DOI or PubMed URLs directly within your markdown (e.g. \`[Author et al. (2024)](https://pubmed.ncbi.nlm.nih.gov/...)\`).
3. Answer follow-up questions about alternatives, risks, or nuances.
Keep responses concise and clinically precise. Use short paragraphs and bullet lists for structure.

VISUAL GROUNDING: When the user asks for images, a 3D model, or research (e.g. "show me an image", "3D model of", "find research on"), respond with a \`\`\`rich-media\`\`\` JSON block BEFORE your prose explanation. Format:
\`\`\`rich-media
{ "cards": [{ "kind": "model-3d"|"image-gallery"|"pubmed-refs"|"phil-image", "query": "<anatomical or clinical term>", "severity": "green"|"yellow"|"red", "afflictionHighlight": "<anatomical part>", "particles": true|false }] }
\`\`\`
Only include a rich-media block when the user explicitly requests visual or research content. Use kind "model-3d" for 3D anatomy. Include severity, afflictionHighlight, and particles if relevant. For "image-gallery" use medical illustrations, "pubmed-refs" for clinical research, and "phil-image" for CDC health photographs.`;

      await this.intel.ai.startChat(patient, context);
      const seedQ = `Explain the clinical rationale for this recommendation: "${nodeText.slice(0, 200)}${nodeText.length > 200 ? '...' : ''}"`;
      const response = await this.intel.ai.sendMessage(seedQ);
      this._appendModel(response);
    } catch (e: any) {
      this._appendModel(`Unable to connect: ${e?.message ?? e}`);
    } finally {
      this.chatIsLoading.set(false);
      this.needsScroll = true;
      setTimeout(() => this.chatInputRef?.nativeElement?.focus(), 50);
    }
  }

  triggerFileInput() {
    this.fileInputRef?.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesToAdd = Array.from(input.files);
      this.selectedFiles.update(current => [...current, ...filesToAdd]);
      input.value = '';
    }
  }

  removeFile(index: number) {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
  }

  async sendMessage() {
    const text = this.chatInputText.trim();
    const files = this.selectedFiles();
    if ((!text && files.length === 0) || this.chatIsLoading()) return;

    this.chatInputText = '';
    this.selectedFiles.set([]);
    this.showSuggestions.set(false);

    // create message with text and file indicators for user UI
    let userDisplayHtml = text ? `<p>${text}</p>` : '';
    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ');
      userDisplayHtml += `<p style="font-size: 9px; color: #9CA3AF; margin-top: 4px;">📎 Attached: ${fileNames}</p>`;
    }

    this._appendUser(text, userDisplayHtml);
    await this._sendPrompt(text, files);
  }

  sendPill(text: string) { this.chatInputText = text; this.sendMessage(); }

  private async _sendPrompt(prompt: string, files: File[] = []) {
    this.chatIsLoading.set(true);
    this.needsScroll = true;
    try {
      const response = await this.intel.ai.sendMessage(prompt, files);
      this._appendModel(response);
    } catch (e: any) {
      this._appendModel(`Error: ${e?.message ?? e}`);
    } finally {
      this.chatIsLoading.set(false);
      this.needsScroll = true;
    }
  }

  private _appendUser(text: string, htmlOverride?: string) {
    const html = htmlOverride || `<p>${text}</p>`;
    this.chatHistory.update(h => [...h, { role: 'user', text, html }]);
    this.needsScroll = true;
  }

  private _appendModel(md: string) {
    // ─── Parse out any rich-media fenced block ───────────────────────────────
    let richCards: IRichMediaCard[] | undefined;
    let cleanMd = md;

    const fencedRegex = /```[a-z0-9-]*\s*(\{[\s\S]*?"cards"\s*:[\s\S]*?\})\s*```/i;
    let match = md.match(fencedRegex);
    let jsonStr = '';

    if (match) {
      jsonStr = match[1];
      cleanMd = md.replace(match[0], '').trim();
    } else if (md.includes('"cards"')) {
      const startIdx = md.indexOf('{');
      const endIdx = md.lastIndexOf('}');
      if (startIdx !== -1 && endIdx > startIdx) {
        jsonStr = md.substring(startIdx, endIdx + 1);
        cleanMd = md.replace(jsonStr, '').trim();
        cleanMd = cleanMd.replace(/```[a-z0-9-]*\s*```/gi, '').trim();
      }
    }

    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr.trim());
        const rawCards: Array<{ kind: string; query: string; severity?: string; afflictionHighlight?: string; particles?: boolean }> = parsed.cards ?? [];
        richCards = rawCards
          .filter(c => ['model-3d', 'image-gallery', 'pubmed-refs', 'phil-image'].includes(c.kind))
          .map(c => ({
            kind: c.kind as any,
            query: c.query,
            severity: c.severity as any,
            afflictionHighlight: c.afflictionHighlight,
            particles: c.particles,
            loading: true
          }));
      } catch (e) { console.debug('[SummaryNode] Malformed rich card JSON:', (e as Error)?.message); }
    }

    let html = cleanMd;
    const parser = this.markdown.parser();
    if (parser) { try { html = (parser as any).parse(cleanMd); } catch (e) { console.debug('[SummaryNode] Markdown parse fallback:', (e as Error)?.message); html = `<p>${cleanMd}</p>`; } }
    const claims = parseHtmlToClaims(html);

    const entry: IInlineChatEntry = { role: 'model', text: cleanMd, html, claims, richCards };
    this.chatHistory.update(h => [...h, entry]);
    this.needsScroll = true;

    // Now resolve cards asynchronously and patch the last message when they arrive
    if (richCards && richCards.length > 0) {
      Promise.all(richCards.map(card => this.richMedia.resolveCard(card))).then(resolved => {
        this.chatHistory.update(h => {
          const next = [...h];
          const last = next[next.length - 1];
          if (last && last.role === 'model') {
            next[next.length - 1] = { ...last, richCards: resolved };
          }
          return next;
        });
        this.needsScroll = true;
      });
    }
  }

  private scrollBottom() {
    // Scroll the outer right-panel to bring the bottom of the chat into view,
    // rather than scrolling an inner container (which creates a scroll trap).
    this.chatBottomRef?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ─── Rich media pill actions ──────────────────
  requestImage() {
    const topic = this.sectionTitle() || 'this clinical topic';
    this.chatInputText = `Show me medical images of ${topic}`;
    this.sendMessage();
  }

  request3DModel() {
    const nodeText = this.listItemHtml().replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
    const anatomy = nodeText || this.sectionTitle() || 'relevant anatomy';
    this.chatInputText = `Show me a 3D anatomical model related to: ${anatomy}`;
    this.sendMessage();
  }

  requestResearch() {
    const topic = this.sectionTitle() || 'this clinical recommendation';
    this.chatInputText = `Find clinical research on ${topic}`;
    this.sendMessage();
  }

  // ─── Existing node interactions ───────────────
  onDoubleClick() { this.update.emit({ key: this.node().key, note: this.node().note || '', showNote: true }); }
  isPurchasableRecommendation(): boolean {
    const n = this.node();
    if (!n) return false;
    if ((n as any).isPurchasable || (n as any).category === 'purchasable_recommendation') return true;

    const fullText = (this.sectionTitle() + ' ' + (n.note || '') + ' ' + (n.proposedText || '')).toLowerCase();
    const purchasableKeywords = [
      'supplement', 'herb', 'botanical', 'ergonomic', 'cushion', 'brace',
      'bandage', 'monitoring kit', 'cgm sensor', 'pulse oximeter', 'foraging kit',
      'art canvas', 'tea', 'essential oil', 'diffuser', 'exercise band', 'compression'
    ];
    return purchasableKeywords.some(kw => fullText.includes(kw));
  }

  getAmazonSearchUrl(query?: string): string {
    const text = query || this.sectionTitle() || 'nutraceutical';
    const clean = String(text).replace(/<[^>]*>/g, ' ').replace(/[^\w\s-]/g, '').trim().slice(0, 50);
    return `https://www.amazon.com/s?k=${encodeURIComponent(clean)}&tag=pgdpo-20`;
  }
  getWikimediaSearchUrl(query: string): string {
    return `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(query + ' anatomy medical')}&title=Special:MediaSearch&go=Go&type=image`;
  }

  toggleBracket() {
    let next: 'normal' | 'added' | 'removed' = 'added';
    if (this.node().bracketState === 'added') next = 'removed';
    else if (this.node().bracketState === 'removed') next = 'normal';
    this.update.emit({ key: this.node().key, bracketState: next });
  }

  updateNote(text: string) { this.update.emit({ key: this.node().key, note: text }); }

  insertSuggestion(sugg: string) {
    const note = this.node().note ? `${this.node().note}\n${sugg}` : sugg;
    this.update.emit({ key: this.node().key, note });
  }

  @HostListener('click', ['$event'])
  onGlobalClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && anchor.href && anchor.href.startsWith('http')) {
      event.preventDefault();
      event.stopPropagation();

      // Native Publishers like PubMed set X-Frame-Options: SAMEORIGIN which block classic iframing.
      // So, extract the PMID from the URL and route it natively through our PocketGull JSON Research Proxy!
      const pubmedMatch = anchor.href.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/i);
      if (pubmedMatch && pubmedMatch[1]) {
        this.patientState.requestResearchSearch(pubmedMatch[1], 'pubmed');
        return;
      }

      this.patientState.requestResearchUrl(anchor.href);
    }
  }

  acceptProposal() {
    if (this.node().proposedText) {
      this.proposalAccepted.set(true);
      this.update.emit({ key: this.node().key, acceptedProposal: this.node().proposedText });
    }
  }

  detectAndHighlightBodyPart(node: ISummaryNode | ISummaryNodeItem, isHover = false): void {
    const text = (
      ((node as any).title || '') + ' ' +
      ((node as any).text || '') + ' ' +
      ((node as any).rawHtml || '') + ' ' +
      ((node as any).html || '')
    ).toLowerCase();

    let partId: string | null = null;
    let viewMode: 'skin' | 'muscle' | 'skeleton' | 'organs' | 'eastern' | 'ayurvedic' | null = null;

    // Chakras
    if (text.includes('sahasrara') || text.includes('crown chakra')) {
      partId = 'chakra_sahasrara';
      viewMode = 'ayurvedic';
    } else if (text.includes('ajna') || text.includes('third eye')) {
      partId = 'chakra_ajna';
      viewMode = 'ayurvedic';
    } else if (text.includes('vishuddha') || text.includes('throat chakra')) {
      partId = 'chakra_vishuddha';
      viewMode = 'ayurvedic';
    } else if (text.includes('anahata') || text.includes('heart chakra') || text.includes('heart center')) {
      partId = 'chakra_anahata';
      viewMode = 'ayurvedic';
    } else if (text.includes('manipura') || text.includes('solar plexus')) {
      partId = 'chakra_manipura';
      viewMode = 'ayurvedic';
    } else if (text.includes('svadhisthana') || text.includes('sacral chakra')) {
      partId = 'chakra_svadhisthana';
      viewMode = 'ayurvedic';
    } else if (text.includes('muladhara') || text.includes('root chakra')) {
      partId = 'chakra_muladhara';
      viewMode = 'ayurvedic';
    }
    // Acupoints
    else if (text.includes('gv-20') || text.includes('gv20') || text.includes('baihui')) {
      partId = 'acupoint_gv20';
      viewMode = 'eastern';
    } else if (text.includes('cv-17') || text.includes('cv17') || text.includes('danzhong')) {
      partId = 'acupoint_cv17';
      viewMode = 'eastern';
    } else if (text.includes('cv-12') || text.includes('cv12') || text.includes('zhongwan')) {
      partId = 'acupoint_cv12';
      viewMode = 'eastern';
    } else if (text.includes('st-36') || text.includes('st36') || text.includes('zusanli')) {
      partId = 'acupoint_st36_r';
      viewMode = 'eastern';
    } else if (text.includes('li-4') || text.includes('li4') || text.includes('hegu')) {
      partId = 'acupoint_li4_r';
      viewMode = 'eastern';
    } else if (text.includes('sp-6') || text.includes('sp6') || text.includes('sanyinjiao')) {
      partId = 'acupoint_sp6_r';
      viewMode = 'eastern';
    }
    // Organs / Body Parts
    else if (text.includes('brain') || text.includes('neuro') || text.includes('nervous system') || text.includes('cognitive')) {
      partId = 'brain';
      viewMode = 'organs';
    } else if (text.includes('heart') || text.includes('cardio') || text.includes('myocard') || text.includes('vagal') || text.includes('vagus') || text.includes('circulation')) {
      partId = 'heart';
      viewMode = 'organs';
    } else if (text.includes('lung') || text.includes('respirat') || text.includes('breath') || text.includes('bronch')) {
      partId = 'lungs';
      viewMode = 'organs';
    } else if (text.includes('liver') || text.includes('hepat') || text.includes('detox')) {
      partId = 'liver';
      viewMode = 'organs';
    } else if (text.includes('stomach') || text.includes('gastric') || text.includes('digestion') || text.includes('gut') || text.includes('celiac')) {
      partId = 'stomach';
      viewMode = 'organs';
    } else if (text.includes('kidney') || text.includes('renal') || text.includes('adrenal')) {
      partId = 'kidneys';
      viewMode = 'organs';
    } else if (text.includes('thyroid') || text.includes('endocrine') || text.includes('goiter')) {
      partId = 'thyroid';
      viewMode = 'organs';
    } else if (text.includes('abdomen') || text.includes('digestive') || text.includes('bowel') || text.includes('intestine')) {
      partId = 'abdomen';
      viewMode = 'organs';
    } else if (text.includes('spine') || text.includes('vertebra') || text.includes('cervical') || text.includes('lumbar')) {
      partId = 'spine_thoracic';
      viewMode = 'skeleton';
    } else if (text.includes('pelvis') || text.includes('hip')) {
      partId = 'pelvis';
      viewMode = 'skeleton';
    } else if (text.includes('head') || text.includes('skull') || text.includes('migraine') || text.includes('headache')) {
      partId = 'head';
      viewMode = 'skin';
    }

    if (partId) {
      if (isHover) {
        this.patientState.hoveredPartIdForOverlay.set(partId);
        this.patientState.hoveredViewModeForOverlay.set(viewMode);
      } else {
        this.patientState.selectedPartId.set(partId);
        if (viewMode) {
          this.patientState.anatomyViewMode.set(viewMode);
        }
      }
    } else if (isHover) {
      this.clearHoverState();
    }
  }

  clearHoverState(): void {
    this.patientState.hoveredPartIdForOverlay.set(null);
    this.patientState.hoveredViewModeForOverlay.set(null);
  }

  protected readonly ClinicalIcons = ClinicalIcons;
}

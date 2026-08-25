import { ITranscriptEntry } from '../services/clinical-intelligence.service';

export interface IVerificationIssue {
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestedFix?: string;
    claim?: string; // The specific text in the report that is being flagged
}

export interface ISummaryNodeItem {
    id: string;
    html: string;
    bracketState: 'normal' | 'added' | 'removed';
    note: string;
    showNote: boolean;
    isDictating?: boolean;
    key: string;
    suggestions?: string[];
    proposedText?: string;
    verificationStatus?: 'verified' | 'unverified' | 'warning' | 'error';
    verificationIssues?: IVerificationIssue[];
}

export interface ISummaryNode {
    id: string;
    type: 'raw' | 'paragraph' | 'list';
    rawHtml?: string;
    ordered?: boolean;
    items?: ISummaryNodeItem[];
    bracketState: 'normal' | 'added' | 'removed';
    note: string;
    showNote: boolean;
    isDictating?: boolean;
    key: string;
    suggestions?: string[];
    proposedText?: string;
    verificationStatus?: 'verified' | 'unverified' | 'warning' | 'error';
    verificationIssues?: IVerificationIssue[];
}

export interface IReportSection {
    raw: string;
    heading: string;
    title: string;
    icon: string;
    nodes: ISummaryNode[];
}

export interface IParsedTranscriptEntry extends ITranscriptEntry {
    htmlContent?: string;
}

export type NodeAnnotation = {
    note: string,
    bracketState: 'normal' | 'added' | 'removed',
    modifiedText?: string
};
export type LensAnnotations = Record<string, Record<string, NodeAnnotation>>;

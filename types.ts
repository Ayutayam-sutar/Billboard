export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; 
  contributionScore: number;
}

export enum ViolationType {
  Placement = 'Placement',
  Content = 'Content',
  Structural = 'Structural',
  Size = 'Size',
  Authorization = 'Authorization',
  Other = 'Other',
}

export enum Severity {
    High = 'High',
    Medium = 'Medium',
    Low = 'Low'
}

export interface Violation {
  violation_type: ViolationType;
  details: string;
  severity: Severity;
}

export interface AnalysisResult {
  is_compliant: boolean;
  violations: Violation[];
  summary: string;
  location_details: string;
}

export interface Report extends AnalysisResult {
    _id: string;
    userId: string;
    imageUrl: string; 
    timestamp: string; 
    violations: Violation[];
    status: 'Pending' | 'Reported';
}


export interface Billboard {
  _id: string; 
  imageUrl: string;
  violations: string[];
  timestamp: string; 
  uploadedBy: string; 
}

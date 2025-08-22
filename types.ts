export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // URL to an avatar image
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
    imageUrl: string; // The base64 image data url
    timestamp: string; // ISO string
    violations: Violation[];
    status: 'Pending' | 'Reported';
}


export interface Billboard {
  _id: string; // The unique ID from the MongoDB database
  imageUrl: string;
  violations: string[];
  timestamp: string; // The date and time it was created
  uploadedBy: string; // The ID of the user who uploaded it
}

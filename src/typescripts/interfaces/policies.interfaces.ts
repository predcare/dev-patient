export interface IGetPoliciesRoot {
  status: number;
  success: boolean;
  message: string;
  data: IPolicies;
}

export interface IPolicies {
  terms: ITerms;
  privacy_policy: IPrivacyPolicy;
  informed_consent: IInformedConsent;
}

export interface ITerms {
  id: string;
  type: string;
  title: string;
  version: number;
  content: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface IPrivacyPolicy {
  id: string;
  type: string;
  title: string;
  version: number;
  content: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export type IPrivacy = IPrivacyPolicy;

export interface IInformedConsent {
  id: string;
  type: string;
  title: string;
  version: number;
  content: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface IPolicyAcceptanceDocumentItem {
  document_kind: 'terms' | 'privacy' | 'informed_consent' | string;
  document_id: number;
  document_version: number;
}

export interface IPolicyAcceptancePayload {
  audience?: 'doctor' | 'patient';
  source?: 'signup' | 'forced_reaccept' | 'mobile_app' | 'web_portal';
  documents?: IPolicyAcceptanceDocumentItem[];
}

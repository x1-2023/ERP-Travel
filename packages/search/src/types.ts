export enum SearchableEntity {
  CUSTOMER = 'customer',
  PRODUCT = 'product',
  ORDER = 'order',
  INVOICE = 'invoice',
  EMPLOYEE = 'employee',
  PROJECT = 'project',
  TASK = 'task',
  LEAD = 'lead',
  PRODUCTION_ORDER = 'production_order',
  DOCUMENT = 'document',
}

export enum SearchModule {
  CRM = 'crm',
  INVENTORY = 'inventory',
  SALES = 'sales',
  ACCOUNTING = 'accounting',
  HR = 'hr',
  PROJECT_MANAGEMENT = 'project_management',
  PRODUCTION = 'production',
  DOCUMENT_MANAGEMENT = 'document_management',
}

export interface SearchHighlight {
  field: string;
  snippet: string;
}

export interface SearchResult {
  id: string;
  entity: SearchableEntity;
  module: SearchModule;
  title: string;
  description: string;
  highlights: SearchHighlight[];
  score: number;
  url: string;
  metadata: Record<string, unknown>;
}

export interface SearchFilter {
  field: string;
  value: string | number | boolean | string[] | number[];
}

export interface SearchOptions {
  query: string;
  entities?: SearchableEntity[];
  modules?: SearchModule[];
  filters?: SearchFilter[];
  sort?: string[];
  limit: number;
  offset: number;
  highlightPreTag?: string;
  highlightPostTag?: string;
  attributesToHighlight?: string[];
}

export interface SuggestOption {
  query: string;
  entity: SearchableEntity;
  module: SearchModule;
  count: number;
}

export interface IndexConfig {
  name: string;
  primaryKey: string;
  searchableAttributes: string[];
  filterableAttributes: string[];
  sortableAttributes: string[];
  displayedAttributes: string[];
  synonyms?: Record<string, string[]>;
  stopWords?: string[];
}

export interface DocumentIndexPayload {
  id: string;
  entity: SearchableEntity;
  module: SearchModule;
  title: string;
  description: string;
  url: string;
  metadata: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BatchIndexPayload {
  documents: DocumentIndexPayload[];
  entity: SearchableEntity;
}

export interface SearchSyncPayload {
  entity: SearchableEntity;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  documentId: string;
  data?: DocumentIndexPayload;
}

export interface SearchClientConfig {
  host: string;
  apiKey: string;
  timeout?: number;
}

export interface IndexerConfig {
  client: SearchClientConfig;
  indices: IndexConfig[];
  vietnameseSettings?: {
    enableDiacritics?: boolean;
    customStopWords?: string[];
  };
}

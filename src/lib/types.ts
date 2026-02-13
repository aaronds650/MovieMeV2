export type SortField = 'title' | 'added' | 'year';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface PaginationConfig {
  page: number;
  perPage: number;
  total: number;
}

export interface MovieListConfig {
  sort: SortConfig;
  pagination: PaginationConfig;
}

export interface SearchLimits {
  core: number;
  premium: number;
}

export interface SearchUsage {
  searchCount: number;
  lastReset: Date;
  remainingSearches: number;
}
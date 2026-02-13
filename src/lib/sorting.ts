import type { SortConfig } from './types';

export function sortMovies<T extends { title: string; created_at: string; year: number }>(
  movies: T[],
  sort: SortConfig
): T[] {
  return [...movies].sort((a, b) => {
    switch (sort.field) {
      case 'title':
        return sort.order === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      
      case 'added':
        return sort.order === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      
      case 'year':
        return sort.order === 'asc'
          ? a.year - b.year
          : b.year - a.year;
      
      default:
        return 0;
    }
  });
}

export function paginateMovies<T>(
  movies: T[],
  page: number,
  perPage: number
): T[] {
  const start = (page - 1) * perPage;
  return movies.slice(start, start + perPage);
}
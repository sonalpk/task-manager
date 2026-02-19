export interface Task {
  id?: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TaskFilter {
  isCompleted?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: ApiError;
    meta?: ResponseMeta;
  }
  
  export interface ApiError {
    code: string;
    message: string;
    details?: any;
    field?: string;
  }
  
  export interface ResponseMeta {
    timestamp: Date;
    requestId: string;
    version: string;
  }
  
  // Pagination
  export interface PaginationParams {
    page: number;
    limit: number;
    offset?: number;
  }
  
  export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
  }
  
  // Sorting and filtering
  export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
  }
  
  export interface FilterOptions {
    [key: string]: any;
  }
  
  export interface SearchOptions {
    query: string;
    fields?: string[];
    exact?: boolean;
  }
  
  // File handling
  export interface FileInfo {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
  }
  
  export interface FileUploadOptions {
    maxSize?: number;
    allowedTypes?: string[];
    folder?: string;
  }
  
  // Notification system
  export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    userId: string;
    actionUrl?: string;
    actionText?: string;
    metadata?: any;
  }
  
  export type NotificationType = 
    | 'info' 
    | 'success' 
    | 'warning' 
    | 'error'
    | 'test-completed'
    | 'new-recommendation'
    | 'achievement'
    | 'reminder';
  
  // Toast notifications
  export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    action?: ToastAction;
  }
  
  export interface ToastAction {
    label: string;
    onClick: () => void;
  }
  
  // Loading states
  export interface LoadingState {
    isLoading: boolean;
    error: string | null;
    lastUpdated?: Date;
  }
  
  export interface AsyncState<T> extends LoadingState {
    data: T | null;
  }
  
  // Form validation
  export interface ValidationError {
    field: string;
    message: string;
    code?: string;
  }
  
  export interface FormState {
    isSubmitting: boolean;
    isDirty: boolean;
    isValid: boolean;
    errors: ValidationError[];
    touched: Set<string>;
  }
  
  // Date and time
  export interface DateRange {
    start: Date;
    end: Date;
  }
  
  export interface TimeRange {
    start: string; // HH:MM format
    end: string;
  }
  
  // Chart and visualization data
  export interface ChartDataPoint {
    x: string | number | Date;
    y: number;
    label?: string;
    color?: string;
    metadata?: any;
  }
  
  export interface ChartOptions {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    colors?: string[];
    height?: number;
    width?: number;
  }
  
  // UI Component props
  export interface BaseComponentProps {
    className?: string;
    id?: string;
    'data-testid'?: string;
  }
  
  export interface ButtonProps extends BaseComponentProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }
  
  export interface InputProps extends BaseComponentProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
  }
  
  // Modal and dialog
  export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeable?: boolean;
    children: React.ReactNode;
  }
  
  export interface ConfirmDialogOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'warning' | 'danger';
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }
  
  // Application settings
  export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    notifications: NotificationSettings;
  }
  
  export interface NotificationSettings {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
    testReminders: boolean;
    progressUpdates: boolean;
    newFeatures: boolean;
  }
  
  // Performance monitoring
  export interface PerformanceMetrics {
    pageLoadTime: number;
    apiResponseTime: number;
    renderTime: number;
    memoryUsage: number;
    timestamp: Date;
  }
  
  // Error boundaries
  export interface ErrorInfo {
    componentStack: string;
    errorBoundary?: string;
  }
  
  export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
  }
  
  // Analytics and tracking
  export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
    timestamp?: Date;
    userId?: string;
    sessionId?: string;
  }
  
  export interface UserActivity {
    action: string;
    timestamp: Date;
    duration?: number;
    page?: string;
    metadata?: any;
  }
  
  // Utility types
  export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };
  
  export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  
  export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
  
  export type Nullable<T> = T | null;
  
  export type KeyValuePair<T = any> = {
    key: string;
    value: T;
  };
  
  // Constants and enums
  export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  } as const;
  
  export const LOCAL_STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    USER_ROLE: 'userRole',
    USER_PREFERENCES: 'userPreferences',
    THEME: 'theme',
    LANGUAGE: 'language',
  } as const;
  
  export const BREAKPOINTS = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  } as const;
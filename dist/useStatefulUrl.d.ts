export interface HashStateOptions<T = Record<string, unknown>> {
    /** Delay in ms before updating URL to avoid too frequent updates */
    debounceMs?: number;
    /** Whether to use pushState instead of replaceState */
    usePushState?: boolean;
    /** Custom serializer functions */
    serializers?: HashSerializers<T>;
    /** Whether to initialize state on mount (default: true) */
    initializeOnMount?: boolean;
    /** Delimiters to isolate useStatefulUrl content from existing hash params */
    delimiters?: {
        start?: string;
        end?: string;
    };
    /** Position strategy for useStatefulUrl content (default: 'end') */
    positionStrategy?: "preserve" | "end" | "start";
}
export interface HashSerializers<T = Record<string, unknown>> {
    /** Serialize state to URL hash params */
    serialize?: (state: T) => Record<string, string>;
    /** Deserialize URL hash params to state */
    deserialize?: (params: URLSearchParams) => T;
}
export interface useStatefulUrlReturn<T> {
    /** Current state */
    state: T;
    /** Update state (will also update URL) */
    setState: (newState: T | ((prevState: T) => T)) => void;
    /** Whether the hook has been initialized from URL */
    isInitialized: boolean;
    /** Manually sync current state to URL */
    syncToUrl: () => void;
    /** Clear hash from URL and reset to initial state */
    clearHash: () => void;
    /** Get the current hash without useStatefulUrl content */
    getHashWithoutState: () => string;
    /** Get only the useStatefulUrl content from hash */
    getStateFromHash: () => string;
}
export declare const hashSerializers: {
    /** Serialize arrays as comma-separated strings */
    stringArray: {
        serialize: (value: string[]) => string;
        deserialize: (value: string) => string[];
    };
    /** Serialize Set as comma-separated strings */
    stringSet: {
        serialize: (value: Set<string>) => string;
        deserialize: (value: string) => Set<string>;
    };
    /** Serialize boolean values */
    boolean: {
        serialize: (value: boolean) => string;
        deserialize: (value: string) => value is "true";
    };
    /** Serialize number values */
    number: {
        serialize: (value: number) => string;
        deserialize: (value: string) => number;
    };
    /** Serialize objects as JSON */
    json: {
        serialize: (value: Record<string, unknown>) => string;
        deserialize: (value: string) => Record<string, unknown> | null;
    };
};
export declare const hashUtils: {
    /** Get the current hash without useStatefulUrl content */
    getHashWithoutState: (delimiters?: {
        start: string;
        end: string;
    }) => string;
    /** Get only the useStatefulUrl content from hash */
    getStateFromHash: (delimiters?: {
        start: string;
        end: string;
    }) => string;
    /** Check if hash contains useStatefulUrl content */
    hasHashState: (delimiters?: {
        start: string;
        end: string;
    }) => boolean;
    /** Safely update the non-useStatefulUrl portion of the hash */
    updateExternalHash: (newExternalHash: string, delimiters?: {
        start: string;
        end: string;
    }, usePushState?: boolean) => void;
};
/**
 * Custom hook for managing state synchronized with URL hash parameters
 *
 * @param initialState - Initial state object
 * @param options - Configuration options
 * @returns Object with state, setState, and utility functions
 */
export declare function useStatefulUrl<T extends Record<string, unknown>>(initialState: T, options?: HashStateOptions<T>): useStatefulUrlReturn<T>;
export declare function useStatefulUrlArray<T extends string>(key: string, initialValue?: T[], validValues?: T[]): {
    /** Whether the hook has been initialized from URL */
    isInitialized: boolean;
    /** Manually sync current state to URL */
    syncToUrl: () => void;
    /** Clear hash from URL and reset to initial state */
    clearHash: () => void;
    /** Get the current hash without useStatefulUrl content */
    getHashWithoutState: () => string;
    /** Get only the useStatefulUrl content from hash */
    getStateFromHash: () => string;
    value: T[];
    setValue: (newValue: T[] | ((prev: T[]) => T[])) => void;
};
export declare function useStatefulUrlSet<T extends string>(key: string, initialValue?: Set<T>, validValues?: T[]): {
    /** Whether the hook has been initialized from URL */
    isInitialized: boolean;
    /** Manually sync current state to URL */
    syncToUrl: () => void;
    /** Clear hash from URL and reset to initial state */
    clearHash: () => void;
    /** Get the current hash without useStatefulUrl content */
    getHashWithoutState: () => string;
    /** Get only the useStatefulUrl content from hash */
    getStateFromHash: () => string;
    value: Set<T>;
    setValue: (newValue: Set<T> | ((prev: Set<T>) => Set<T>)) => void;
};
export declare function useStatefulUrlString(key: string, initialValue?: string): {
    /** Whether the hook has been initialized from URL */
    isInitialized: boolean;
    /** Manually sync current state to URL */
    syncToUrl: () => void;
    /** Clear hash from URL and reset to initial state */
    clearHash: () => void;
    /** Get the current hash without useStatefulUrl content */
    getHashWithoutState: () => string;
    /** Get only the useStatefulUrl content from hash */
    getStateFromHash: () => string;
    value: string;
    setValue: (newValue: string | ((prev: string) => string)) => void;
};
//# sourceMappingURL=useStatefulUrl.d.ts.map
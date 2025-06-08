import { useMemo, useState, useRef, useCallback, useEffect } from 'react';

// Utility functions for common serialization patterns
const hashSerializers = {
    /** Serialize arrays as comma-separated strings */
    stringArray: {
        serialize: (value) => value.join(","),
        deserialize: (value) => (value ? value.split(",") : []),
    },
    /** Serialize Set as comma-separated strings */
    stringSet: {
        serialize: (value) => Array.from(value).join(","),
        deserialize: (value) => new Set(value ? value.split(",") : []),
    },
    /** Serialize boolean values */
    boolean: {
        serialize: (value) => value.toString(),
        deserialize: (value) => value === "true",
    },
    /** Serialize number values */
    number: {
        serialize: (value) => value.toString(),
        deserialize: (value) => {
            const num = Number(value);
            return isNaN(num) ? 0 : num;
        },
    },
    /** Serialize objects as JSON */
    json: {
        serialize: (value) => JSON.stringify(value),
        deserialize: (value) => {
            try {
                return JSON.parse(value);
            }
            catch {
                return null;
            }
        },
    },
};
// Default serializer for simple objects
const defaultSerializer = {
    serialize: (state) => {
        const result = {};
        for (const [key, value] of Object.entries(state)) {
            if (value == null)
                continue;
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    result[key] = value.join(",");
                }
            }
            else if (value instanceof Set) {
                if (value.size > 0) {
                    result[key] = Array.from(value).join(",");
                }
            }
            else if (typeof value === "object") {
                result[key] = JSON.stringify(value);
            }
            else {
                result[key] = String(value);
            }
        }
        return result;
    },
    deserialize: (params, initialState) => {
        const result = { ...initialState };
        for (const [key, value] of Array.from(params.entries())) {
            if (key in initialState) {
                const initialValue = initialState[key];
                if (Array.isArray(initialValue)) {
                    result[key] = value
                        ? value.split(",")
                        : [];
                }
                else if (initialValue instanceof Set) {
                    result[key] = new Set(value ? value.split(",") : []);
                }
                else if (typeof initialValue === "boolean") {
                    result[key] = value === "true";
                }
                else if (typeof initialValue === "number") {
                    const num = Number(value);
                    result[key] = isNaN(num)
                        ? initialValue
                        : num;
                }
                else if (typeof initialValue === "object" && initialValue !== null) {
                    try {
                        result[key] = JSON.parse(value);
                    }
                    catch {
                        result[key] = initialValue;
                    }
                }
                else {
                    result[key] = value;
                }
            }
        }
        return result;
    },
};
// Utility functions
const isClient = () => typeof window !== "undefined";
// Default delimiters for isolating useStatefulUrl content
const DEFAULT_DELIMITERS = {
    start: "__UHS-",
    end: "-UHS__",
};
const extractHashParts = (hash, delimiters = DEFAULT_DELIMITERS) => {
    const startDelim = delimiters.start;
    const endDelim = delimiters.end;
    const startIndex = hash.indexOf(startDelim);
    const endIndex = hash.indexOf(endDelim);
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        return {
            before: hash,
            useStatefulUrl: "",
            after: "",
        };
    }
    return {
        before: hash.substring(0, startIndex),
        useStatefulUrl: hash.substring(startIndex + startDelim.length, endIndex),
        after: hash.substring(endIndex + endDelim.length),
    };
};
const parseHash = (delimiters = DEFAULT_DELIMITERS) => {
    if (!isClient())
        return new URLSearchParams();
    const hash = window.location.hash.substring(1);
    const { useStatefulUrl } = extractHashParts(hash, delimiters);
    return new URLSearchParams(useStatefulUrl);
};
const updateHash = (params, usePushState = false, delimiters = DEFAULT_DELIMITERS, positionStrategy = "end") => {
    if (!isClient())
        return;
    const currentHash = window.location.hash.substring(1);
    const { before, after, useStatefulUrl: existingState, } = extractHashParts(currentHash, delimiters);
    const urlParams = new URLSearchParams();
    // Only add non-empty values
    for (const [key, value] of Object.entries(params)) {
        if (value && value.length > 0) {
            urlParams.set(key, value);
        }
    }
    const stateContent = urlParams.toString();
    // Reconstruct hash based on position strategy
    let newHash = "";
    if (stateContent) {
        const delimitedContent = delimiters.start + stateContent + delimiters.end;
        switch (positionStrategy) {
            case "start":
                newHash =
                    delimitedContent +
                        (before || after ? (before || "") + (after || "") : "");
                break;
            case "end":
                const externalContent = (before || "") + (after || "");
                newHash =
                    externalContent + (externalContent ? "" : "") + delimitedContent;
                break;
            case "preserve":
            default:
                // Preserve original position, or append to end if first time
                if (existingState) {
                    // Replace in original position
                    newHash = before + delimitedContent + after;
                }
                else {
                    // First time: append to end
                    const externalContent = (before || "") + (after || "");
                    newHash =
                        externalContent + (externalContent ? "" : "") + delimitedContent;
                }
                break;
        }
    }
    else {
        // No state content, just return external content
        newHash = (before || "") + (after || "");
    }
    const newUrl = newHash
        ? `#${newHash}`
        : window.location.pathname + window.location.search;
    if (usePushState) {
        window.history.pushState(null, "", newUrl);
    }
    else {
        window.history.replaceState(null, "", newUrl);
    }
};
// Utility functions for hash manipulation
const hashUtils = {
    /** Get the current hash without useStatefulUrl content */
    getHashWithoutState: (delimiters = DEFAULT_DELIMITERS) => {
        if (!isClient())
            return "";
        const hash = window.location.hash.substring(1);
        const { before, after } = extractHashParts(hash, delimiters);
        return before + after;
    },
    /** Get only the useStatefulUrl content from hash */
    getStateFromHash: (delimiters = DEFAULT_DELIMITERS) => {
        if (!isClient())
            return "";
        const hash = window.location.hash.substring(1);
        const { useStatefulUrl } = extractHashParts(hash, delimiters);
        return useStatefulUrl;
    },
    /** Check if hash contains useStatefulUrl content */
    hasHashState: (delimiters = DEFAULT_DELIMITERS) => {
        if (!isClient())
            return false;
        const hash = window.location.hash.substring(1);
        return hash.includes(delimiters.start) && hash.includes(delimiters.end);
    },
    /** Safely update the non-useStatefulUrl portion of the hash */
    updateExternalHash: (newExternalHash, delimiters = DEFAULT_DELIMITERS, usePushState = false) => {
        if (!isClient())
            return;
        const currentHash = window.location.hash.substring(1);
        const { useStatefulUrl } = extractHashParts(currentHash, delimiters);
        let newHash = newExternalHash;
        if (useStatefulUrl) {
            // Add delimiter and useStatefulUrl content to the end for consistency
            newHash += delimiters.start + useStatefulUrl + delimiters.end;
        }
        const newUrl = newHash
            ? `#${newHash}`
            : window.location.pathname + window.location.search;
        if (usePushState) {
            window.history.pushState(null, "", newUrl);
        }
        else {
            window.history.replaceState(null, "", newUrl);
        }
        // Trigger hashchange event for useStatefulUrl to pick up the change
        window.dispatchEvent(new HashChangeEvent("hashchange"));
    },
};
// Debounce utility
const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(undefined);
    return useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
};
/**
 * Custom hook for managing state synchronized with URL hash parameters
 *
 * @param initialState - Initial state object
 * @param options - Configuration options
 * @returns Object with state, setState, and utility functions
 */
function useStatefulUrl(initialState, options = {}) {
    const { debounceMs = 100, usePushState = false, serializers, initializeOnMount = true, delimiters = DEFAULT_DELIMITERS, positionStrategy = "end", } = options;
    // Ensure delimiters have default values for function calls - memoize to prevent re-renders
    const resolvedDelimiters = useMemo(() => ({
        start: delimiters.start || DEFAULT_DELIMITERS.start,
        end: delimiters.end || DEFAULT_DELIMITERS.end,
    }), [delimiters.start, delimiters.end]);
    const [state, setStateInternal] = useState(initialState);
    const [isInitialized, setIsInitialized] = useState(false);
    const isInitializedRef = useRef(false);
    // Extract serializer functions and their string representations for ESLint
    const serializeFn = serializers?.serialize;
    const deserializeFn = serializers?.deserialize;
    const serializeString = serializeFn?.toString();
    const deserializeString = deserializeFn?.toString();
    // Memoize serializers to prevent infinite re-renders when defined inline
    const memoizedSerializers = useMemo(() => {
        if (!serializeFn && !deserializeFn)
            return null;
        // Create stable references for the serializer functions
        return { serialize: serializeFn, deserialize: deserializeFn };
        // preventing linter ignore for now - eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serializeString, deserializeString]);
    // Use memoized serializers if provided, otherwise use default
    const serialize = useMemo(() => {
        return memoizedSerializers?.serialize || defaultSerializer.serialize;
    }, [memoizedSerializers?.serialize]);
    const deserialize = useMemo(() => {
        return (memoizedSerializers?.deserialize ||
            ((params) => defaultSerializer.deserialize(params, initialState)));
    }, [memoizedSerializers?.deserialize, initialState]);
    // Debounced URL update function - memoize the callback to prevent infinite re-renders
    const updateHashCallback = useCallback((newState) => {
        if (!isInitializedRef.current)
            return;
        const serialized = serialize(newState);
        updateHash(serialized, usePushState, resolvedDelimiters, positionStrategy);
    }, [serialize, usePushState, resolvedDelimiters, positionStrategy]);
    const debouncedUpdateHash = useDebounce(updateHashCallback, debounceMs);
    // Initialize state from URL hash on mount
    useEffect(() => {
        if (!initializeOnMount || !isClient()) {
            setIsInitialized(true);
            isInitializedRef.current = true;
            return;
        }
        const params = parseHash(resolvedDelimiters);
        const initializedState = deserialize(params);
        setStateInternal(initializedState);
        setIsInitialized(true);
        isInitializedRef.current = true;
    }, [initializeOnMount, deserialize, resolvedDelimiters]);
    // Update URL when state changes (only after initialization)
    useEffect(() => {
        if (!isInitialized)
            return;
        debouncedUpdateHash(state);
    }, [state, isInitialized, debouncedUpdateHash]);
    // Handle browser navigation
    useEffect(() => {
        if (!isClient() || !isInitialized)
            return;
        const handleHashChange = () => {
            const params = parseHash(resolvedDelimiters);
            const newState = deserialize(params);
            setStateInternal(newState);
        };
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [isInitialized, deserialize, resolvedDelimiters]);
    // State setter function
    const setState = useCallback((newState) => {
        setStateInternal((prev) => {
            const nextState = typeof newState === "function"
                ? newState(prev)
                : newState;
            return nextState;
        });
    }, []);
    // Utility functions
    const syncToUrl = useCallback(() => {
        const serialized = serialize(state);
        updateHash(serialized, usePushState, resolvedDelimiters, positionStrategy);
    }, [state, serialize, usePushState, resolvedDelimiters, positionStrategy]);
    const clearHash = useCallback(() => {
        if (!isClient())
            return;
        // Clear only the useStatefulUrl portion, preserve existing hash content
        const currentHash = window.location.hash.substring(1);
        const { before, after } = extractHashParts(currentHash, resolvedDelimiters);
        const newHash = before + after;
        const newUrl = newHash
            ? `#${newHash}`
            : window.location.pathname + window.location.search;
        window.history.replaceState(null, "", newUrl);
        setStateInternal(initialState);
    }, [initialState, resolvedDelimiters]);
    const getHashWithoutState = useCallback(() => {
        return hashUtils.getHashWithoutState(resolvedDelimiters);
    }, [resolvedDelimiters]);
    const getStateFromHash = useCallback(() => {
        return hashUtils.getStateFromHash(resolvedDelimiters);
    }, [resolvedDelimiters]);
    return {
        state,
        setState,
        isInitialized,
        syncToUrl,
        clearHash,
        getHashWithoutState,
        getStateFromHash,
    };
}
// Convenience hooks for common patterns
function useStatefulUrlArray(key, initialValue = [], validValues) {
    const initialState = { [key]: initialValue };
    const options = {
        serializers: {
            serialize: (state) => ({
                [key]: state[key]?.length > 0 ? state[key].join(",") : "",
            }),
            deserialize: (params) => {
                const value = params.get(key);
                const array = value ? value.split(",") : [];
                const filtered = validValues
                    ? array.filter((item) => validValues.includes(item))
                    : array;
                return { [key]: filtered };
            },
        },
    };
    const { state, setState, ...rest } = useStatefulUrl(initialState, options);
    return {
        value: state[key],
        setValue: (newValue) => {
            setState((prev) => ({
                ...prev,
                [key]: typeof newValue === "function" ? newValue(prev[key]) : newValue,
            }));
        },
        ...rest,
    };
}
function useStatefulUrlSet(key, initialValue = new Set(), validValues) {
    const initialState = { [key]: initialValue };
    const options = {
        serializers: {
            serialize: (state) => ({
                [key]: state[key]?.size > 0 ? Array.from(state[key]).join(",") : "",
            }),
            deserialize: (params) => {
                const value = params.get(key);
                const array = value ? value.split(",") : [];
                const filtered = validValues
                    ? array.filter((item) => validValues.includes(item))
                    : array;
                return { [key]: new Set(filtered) };
            },
        },
    };
    const { state, setState, ...rest } = useStatefulUrl(initialState, options);
    return {
        value: state[key],
        setValue: (newValue) => {
            setState((prev) => ({
                ...prev,
                [key]: typeof newValue === "function" ? newValue(prev[key]) : newValue,
            }));
        },
        ...rest,
    };
}
function useStatefulUrlString(key, initialValue = "") {
    const initialState = { [key]: initialValue };
    const { state, setState, ...rest } = useStatefulUrl(initialState);
    return {
        value: state[key],
        setValue: (newValue) => {
            setState((prev) => ({
                ...prev,
                [key]: typeof newValue === "function" ? newValue(prev[key]) : newValue,
            }));
        },
        ...rest,
    };
}

export { hashSerializers, hashUtils, useStatefulUrl, useStatefulUrlArray, useStatefulUrlSet, useStatefulUrlString };
//# sourceMappingURL=useStatefulUrl.esm.js.map

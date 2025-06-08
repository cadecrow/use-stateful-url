# use-stateful-url

A React hook for managing state synchronized with URL hash parameters. Useful for allowing specified pieces of state to be copy-able for sending in links or for state changes to be navigable via forward and back in the browser. Perfect for creating shareable URLs with filters, active modals, and other stateful UI components.

I would love to expand this to more frameworks / communities in the future. I know many frameworks do not have the same "UI is a function of state" philosophy as React, but I could see the intended function for this project being useful in a mutated form appropriate for each framework. (Where are my other Solid.js interested folks)

## Features

- 🔗 Automatic URL hash synchronization
- 🎯 Type-safe with full TypeScript support
- 🚀 SSR/SSG compatible (Next.js ready)
- 🎨 Customizable serialization strategies
- ⚡ Debounced updates to prevent URL spam
- 🔄 Browser navigation support (back/forward buttons)
- 🛠 Utility hooks for common patterns
- 📦 Zero dependencies (except React)
- ✨ **Automatic memoization** - define serializers inline without performance issues!

## Installation

!!! npm package on the way. not yet published. feel free to copy /src for now !!!

```bash
npm install use-stateful-url
# or
yarn add use-stateful-url
# or
pnpm add use-stateful-url
```

## Quick Start

```tsx
import { useStatefulUrl } from "use-stateful-url";

function MyComponent() {
	const { state, setState, isInitialized } = useStatefulUrl({
		filters: new Set<string>(),
		page: 1,
	});
	{ /* URL will be: example.com/gallery#filters=tag1,tag2&page=2 */ }
	{ /* Actually, there will be special delimiters. More on that later. */ }

	if (!isInitialized) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<button
				onClick={(e) =>
					setState((prev) => {
						const updatedPage = prev.page - 1;
						return { ...prev, page: updatedPage };
					})
				}
			>
				Previous Page
			</button>
			<span>Current page: {state.page}</span>
			<button
				onClick={(e) =>
					setState((prev) => {
						const updatedPage = prev.page + 1;
						return { ...prev, page: updatedPage };
					})
				}
			>
				Next Page
			</button>
		</div>
	);
}
```

## ✨ Inline Serializers (New!)

You can now define serializers inline without worrying about performance! The hook automatically memoizes them for you:

```tsx
const { state, setState } = useStatefulUrl(
	{
		tags: new Set<string>(),
		selectedId: null,
	},
	{
		// ✅ This is now perfectly fine! No infinite re-renders!
		serializers: {
			serialize: (state) => ({
				tags: state.tags.size > 0 ? Array.from(state.tags).join(",") : "",
				item: state.selectedId || "",
			}),
			deserialize: (params) => ({
				tags: new Set(params.get("tags")?.split(",") || []),
				selectedId: params.get("item") || null,
			}),
		},
	}
);
```

## API Reference

### `useStatefulUrl<T>(initialState, options?)`

Main hook for managing hash state.

#### Parameters

- `initialState: T` - Initial state object
- `options?: StatefulUrlHashOptions<T>` - Configuration options

#### Returns

```tsx
{
  state: T;                    // Current state
  setState: (newState) => void; // Update state function
  isInitialized: boolean;      // Whether initialized from URL
  syncToUrl: () => void;       // Manually sync state to URL
  clearHash: () => void;       // Clear hash and reset state
  getHashWithoutState: () => string; // Get hash without useStatefulUrl content
  getStateFromHash: () => string;    // Get only useStatefulUrl content
}
```

#### Options

```tsx
interface StatefulUrlHashOptions<T> {
	debounceMs?: number; // Debounce delay (default: 100ms)
	usePushState?: boolean; // Use pushState vs replaceState
	serializers?: StatefulUrlHashSerializers<T>; // Custom serialization
	initializeOnMount?: boolean; // Initialize from URL (default: true)
	delimiters?: {
		// Delimiters to isolate useStatefulUrl content
		start?: string; // Default: "__UHS-"
		end?: string; // Default: "-UHS__"
	};
	positionStrategy?: "preserve" | "end" | "start"; // Where to place content (default: 'end')
}
```

### Convenience Hooks

#### `useStatefulUrlArray<T>(key, initialValue?, validValues?)`

For managing string arrays:

```tsx
const { value, setValue, isInitialized } = useStatefulUrlArray(
	"tags",
	[],
	["react", "typescript", "javascript"] // optional validation
);

// URL: #tags=react,typescript
```

#### `useStatefulUrlSet<T>(key, initialValue?, validValues?)`

For managing Sets:

```tsx
const { value, setValue, isInitialized } = useStatefulUrlSet(
	"categories",
	new Set(),
	["tech", "design", "business"]
);

// URL: #categories=tech,design
```

#### `useStatefulUrlString(key, initialValue?)`

For managing single strings:

```tsx
const { value, setValue, isInitialized } = useStatefulUrlString("search", "");

// URL: #search=hello%20world
```

## 🔗 Coexisting with Existing Hash Usage

**useStatefulUrl automatically isolates its content using delimiters**, so it won't interfere with existing hash parameters in your app!

### How It Works

The package wraps its state content between special delimiters:

```
# Your existing hash params remain untouched!
https://yourapp.com/page#existing=value&more=params__UHS-search=hello&filters=react,vue-UHS__other=stuff
```

### Default Behavior

By default, useStatefulUrl uses `__UHS-` and `-UHS__` delimiters:

```tsx
const { state, setState } = useStatefulUrl({
	search: "",
	filters: new Set(),
});

// URL becomes: #existing=value__UHS-search=hello&filters=react,vue-UHS__more=stuff
// Your existing hash content is completely preserved!
```

### Custom Delimiters

You can customize the delimiters to match your preferences:

```tsx
const { state, setState } = useStatefulUrl(
	{ search: "", page: 1 },
	{
		delimiters: {
			start: "<<MYAPP>>",
			end: "<</MYAPP>>",
		},
	}
);

// URL: #existing=value<<MYAPP>>search=hello&page=2<</MYAPP>>more=stuff
```

### Position Strategies

Control where useStatefulUrl content appears in the hash:

```tsx
// Default: 'end' - always places useStatefulUrl content at the end (performance optimized)
const { state } = useStatefulUrl(initialState); // Uses 'end' by default

// 'preserve' - keeps original position, appends to end if first time
const { state } = useStatefulUrl(initialState, {
	positionStrategy: "preserve", // For maintaining existing URL structure
});

// 'start' - always places useStatefulUrl content at the beginning
const { state } = useStatefulUrl(initialState, {
	positionStrategy: "start", // For priority visibility
});
```

**Why 'end' is the default**: This prevents "thrashing" string work where external hash updates cause useStatefulUrl content to move around in the URL, leading to better performance and more predictable behavior. No reconstructing strings from within on every state update if hash state is always at the end (fewer string operations).

### Utility Functions for Hash Management

Access different parts of the hash easily:

```tsx
const { getHashWithoutState, getStateFromHash } = useStatefulUrl({
	search: "",
	filters: [],
});

// If URL is: #analytics=enabled__UHS-search=react&filters=js,ts-UHS__debug=true

console.log(getHashWithoutState()); // "analytics=enabled&debug=true"
console.log(getStateFromHash()); // "search=react&filters=js,ts"
```

### Global Hash Utilities

For advanced use cases, import the global utilities:

```tsx
import { hashUtils } from "use-hash-state";

// Check if hash contains useStatefulUrl content
const hasState = hashUtils.hasHashState();

// Get hash parts with custom delimiters
const hashWithoutState = hashUtils.getHashWithoutState({
	start: "<<START>>",
	end: "<<END>>",
});

// Safely update the non-useStatefulUrl portion of the hash
hashUtils.updateExternalHash("tab=profile&debug=true");
// This preserves useStatefulUrl content while updating external parameters
```

### Safe External Hash Updates

Need to update your non-useStatefulUrl parameters? Use the utility function:

```tsx
import { hashUtils } from "use-hash-state";

// Your existing code that updates hash
function changeTab(newTab: string) {
	// OLD WAY (unsafe - overwrites useStatefulUrl content):
	// window.location.hash = `tab=${newTab}&debug=true`;

	// NEW WAY (safe - preserves useStatefulUrl content):
	hashUtils.updateExternalHash(`tab=${newTab}&debug=true`);
}

// useStatefulUrl content is automatically preserved!
```

### Migration from Existing Hash Usage

Perfect for gradual migration! You can introduce useStatefulUrl without breaking existing functionality:

```tsx
// Before: Your app uses #tab=profile&section=settings
// After: Add useStatefulUrl alongside existing usage

const { state } = useStatefulUrl({
	searchQuery: "",
	selectedItems: new Set(),
});

// URL becomes: #tab=profile&section=settings__UHS-searchQuery=hello&selectedItems=item1,item2-UHS__

// Your existing hash reading logic continues to work:
const currentTab = new URLSearchParams(window.location.hash.substring(1)).get(
	"tab"
); // Still works!

// Update existing params safely:
hashUtils.updateExternalHash(`tab=settings&section=profile`); // useStatefulUrl content preserved
```

## Advanced Usage

### Custom Serialization

Thanks to automatic memoization, you can define complex serializers inline:

```tsx
const { state, setState } = useStatefulUrl(
	{
		complexData: { nested: { value: "test" } },
		filters: new Set(["tag1", "tag2"]),
		currentPage: 1,
	},
	{
		serializers: {
			serialize: (state) => ({
				// Complex logic can be defined inline safely
				data: JSON.stringify(state.complexData),
				filters:
					state.filters.size > 0 ? Array.from(state.filters).join(",") : "",
				page: state.currentPage.toString(),
			}),
			deserialize: (params) => ({
				complexData: (() => {
					try {
						return JSON.parse(params.get("data") || "{}");
					} catch {
						return { nested: { value: "test" } };
					}
				})(),
				filters: new Set(
					params.get("filters")?.split(",").filter(Boolean) || []
				),
				currentPage: parseInt(params.get("page") || "1", 10),
			}),
		},
	}
);
```

### Portfolio Gallery Example

```tsx
import { useStatefulUrl } from "use-hash-state";

function PortfolioGallery({ projects }) {
	const { state, setState, isInitialized } = useStatefulUrl(
		{
			selectedTags: new Set<string>(),
			selectedItemId: null as string | null,
		},
		{
			// Inline serializers work perfectly!
			serializers: {
				serialize: (state) => {
					const result = {};
					if (state.selectedTags.size > 0) {
						result.tags = Array.from(state.selectedTags).join(",");
					}
					if (state.selectedItemId) {
						result.item = state.selectedItemId;
					}
					return result;
				},
				deserialize: (params) => ({
					selectedTags: new Set(params.get("tags")?.split(",") || []),
					selectedItemId: params.get("item") || null,
				}),
			},
		}
	);

	const toggleTag = (tag: string) => {
		setState((prev) => {
			const newTags = new Set(prev.selectedTags);
			if (newTags.has(tag)) {
				newTags.delete(tag);
			} else {
				newTags.add(tag);
			}
			return { ...prev, selectedTags: newTags };
		});
	};

	const filteredProjects =
		state.selectedTags.size === 0
			? projects
			: projects.filter((p) =>
					p.tags.some((tag) => state.selectedTags.has(tag))
			  );

	if (!isInitialized) return <div>Loading...</div>;

	return (
		<div>
			{/* Filter UI */}
			{["react", "vue", "angular"].map((tag) => (
				<button
					key={tag}
					onClick={() => toggleTag(tag)}
					className={state.selectedTags.has(tag) ? "active" : ""}
				>
					{tag}
				</button>
			))}

			{/* Projects */}
			{filteredProjects.map((project) => (
				<div
					key={project.id}
					onClick={() =>
						setState((prev) => ({ ...prev, selectedItemId: project.id }))
					}
				>
					{project.title}
				</div>
			))}

			{/* Modal */}
			{state.selectedItemId && (
				<Modal
					onClose={() =>
						setState((prev) => ({ ...prev, selectedItemId: null }))
					}
				>
					{/* Modal content */}
				</Modal>
			)}
		</div>
	);
}
```

## Utility Serializers

The package includes pre-built serializers for common data types:

```tsx
import { hashSerializers } from "use-hash-state";

// String arrays
hashSerializers.stringArray.serialize(["a", "b", "c"]); // "a,b,c"
hashSerializers.stringArray.deserialize("a,b,c"); // ['a', 'b', 'c']

// Sets
hashSerializers.stringSet.serialize(new Set(["x", "y"])); // "x,y"
hashSerializers.stringSet.deserialize("x,y"); // Set(['x', 'y'])

// Booleans
hashSerializers.boolean.serialize(true); // "true"
hashSerializers.boolean.deserialize("true"); // true

// Numbers
hashSerializers.number.serialize(42); // "42"
hashSerializers.number.deserialize("42"); // 42

// JSON objects
hashSerializers.json.serialize({ a: 1 }); // '{"a":1}'
hashSerializers.json.deserialize('{"a":1}'); // {a: 1}
```

## URL Encoding & Hash Parameters

### Understanding URL Hash Parameters

URL hash parameters work like regular query parameters but come after the `#` symbol:

- Regular URL: `https://example.com/page?param=value&other=123`
- Hash parameters: `https://example.com/page#param=value&other=123`

The key difference is that hash parameters don't trigger server requests and are perfect for client-side state.

### How This Package Handles URL Encoding

The `useStatefulUrl` package uses the browser's built-in `URLSearchParams` API for all URL encoding and decoding operations. This means:

#### ✅ Automatic Encoding/Decoding

Values containing special characters are automatically handled:

```tsx
// If your state contains: { search: "cats & dogs", category: "Q&A" }
// The URL becomes: #search=cats%20%26%20dogs&category=Q%26A
// When parsed back: { search: "cats & dogs", category: "Q&A" }
```

Common characters that get encoded:

- `&` becomes `%26`
- `=` becomes `%3D`
- `+` becomes `%2B`
- Space becomes `%20`
- `#` becomes `%23`

#### ✅ Safe Serializer Pattern

Your custom serializers should return plain string values - encoding is handled automatically:

```tsx
// ✅ CORRECT - Return plain strings, encoding handled automatically
serializers: {
  serialize: (state) => ({
    search: state.searchTerm,           // "cats & dogs" → automatically encoded
    tags: state.tags.join(","),        // ["React", "Q&A"] → "React,Q%26A"
    data: JSON.stringify(state.object), // Complex object → JSON string → encoded
  }),
  deserialize: (params) => ({
    searchTerm: params.get("search") || "",     // Automatically decoded
    tags: params.get("tags")?.split(",") || [], // Automatically decoded then split
    object: JSON.parse(params.get("data") || "{}"), // Decoded then parsed
  }),
}
```

#### ❌ Common Mistakes to Avoid

Never manually construct URL parameter strings in your serializers:

```tsx
// ❌ WRONG - This breaks URL parsing!
serializers: {
  serialize: (state) => ({
    // This creates malformed URLs if values contain & or =
    combined: `search=${state.search}&type=${state.type}`,
  }),
}

// ❌ WRONG - Manual encoding is unnecessary and error-prone
serializers: {
  serialize: (state) => ({
    search: encodeURIComponent(state.search), // URLSearchParams does this!
  }),
}
```

#### 📝 Edge Cases to Consider

1. **Comma-separated values**: If your values might contain commas, consider JSON serialization:

   ```tsx
   // If tags can contain commas: ["React, Vue", "Next.js"]
   serialize: (state) => ({
     tags: JSON.stringify(Array.from(state.tags)), // Safer than join(",")
   }),
   deserialize: (params) => ({
     tags: new Set(JSON.parse(params.get("tags") || "[]")),
   }),
   ```

2. **Empty vs undefined**: URLSearchParams treats missing parameters as `null`:

   ```tsx
   deserialize: (params) => ({
     search: params.get("search") || "", // params.get() returns null if missing
   }),
   ```

3. **Array splitting edge cases**: Handle empty strings carefully:
   ```tsx
   deserialize: (params) => ({
     tags: params.get("tags")?.split(",").filter(Boolean) || [], // Remove empty strings
   }),
   ```

## ⚠️ Common Pitfalls & Solutions

Check above for [common pitfalls with url serialization](#-common-mistakes-to-avoid)

### 1. State Lifecycle Mismatch (URL vs User Interaction)

**The Problem**: When state is loaded from a URL hash on mount, it loads ALL values at once. This is different from user interaction patterns where state typically builds up incrementally, potentially causing unexpected behavior.

```tsx
// ❌ PROBLEMATIC: Component expects incremental state changes
function SearchFilters() {
	const { state, setState } = useStatefulUrl({
		selectedFilters: [] as string[],
		searchQuery: "",
	});

	// This effect expects filters to be added one at a time
	useEffect(() => {
		if (state.selectedFilters.length > 0) {
			// 🚨 This fires once with ALL filters when loaded from URL
			// but fires multiple times when user adds filters individually
			trackFilterAdded(state.selectedFilters[state.selectedFilters.length - 1]);
		}
	}, [state.selectedFilters]);

	// Animation that expects step-by-step changes
	useEffect(() => {
		state.selectedFilters.forEach((filter, index) => {
			// 🚨 All animations fire simultaneously when loaded from URL
			setTimeout(() => animateFilterIn(filter), index * 100);
		});
	}, [state.selectedFilters]);
}
```

**✅ Solution Pattern**: Differentiate between mount initialization and user interaction:

```tsx
function SearchFilters() {
	const { state, setState, isInitialized } = useStatefulUrl({
		selectedFilters: [] as string[],
		searchQuery: "",
	});

	const [hasUserInteracted, setHasUserInteracted] = useState(false);
	const prevFiltersRef = useRef<string[]>([]);

	// Track when user actually interacts vs URL initialization
	const addFilter = useCallback(
		(filter: string) => {
			setHasUserInteracted(true);
			setState((prev) => ({
				...prev,
				selectedFilters: [...prev.selectedFilters, filter],
			}));
		},
		[setState]
	);

	// Handle analytics differently for URL load vs user interaction
	useEffect(() => {
		if (!isInitialized) return; // Wait for URL state to load

		const newFilters = state.selectedFilters.filter(
			(filter) => !prevFiltersRef.current.includes(filter)
		);

		if (hasUserInteracted && newFilters.length > 0) {
			// Only track for actual user interactions, not URL loads
			newFilters.forEach((filter) => trackFilterAdded(filter));
		}

		prevFiltersRef.current = state.selectedFilters;
	}, [state.selectedFilters, isInitialized, hasUserInteracted]);

	// Handle animations based on context
	useEffect(() => {
		if (!isInitialized) return;

		if (hasUserInteracted) {
			// Animate only new filters for user interaction
			const newFilters = state.selectedFilters.filter(
				(filter) => !prevFiltersRef.current.includes(filter)
			);
			newFilters.forEach((filter) => animateFilterIn(filter));
		} else {
			// For URL loads, animate all at once or skip animation
			animateAllFiltersIn(state.selectedFilters);
		}
	}, [state.selectedFilters, isInitialized, hasUserInteracted]);
}
```

### 2. URL Length Explosion

**The Problem**: Large state objects can create extremely long URLs that browsers might truncate.

```tsx
// ❌ PROBLEMATIC: Can create massive URLs
const { state } = useStatefulUrl({
	userProfiles: [], // Array of 100+ user objects
	searchHistory: [], // Large array of search terms
	detailedSettings: {}, // Complex nested object
});
```

**✅ Solution**: Be selective about what gets synchronized:

```tsx
// ✅ BETTER: Only sync essential, shareable state
const { state: urlState, setState: setUrlState } = useStatefulUrl({
	selectedUserId: null,
	searchQuery: "",
	activeTab: "users",
});

// Keep non-shareable state local
const [userProfiles, setUserProfiles] = useState([]);
const [searchHistory, setSearchHistory] = useState([]);
```

### 3. Browser History Pollution

**The Problem**: Rapid state changes create too many browser history entries.

```tsx
// ❌ PROBLEMATIC: Every keystroke creates history entry
function SearchInput() {
	const { state, setState } = useStatefulUrl({ query: "" });

	return (
		<input
			value={state.query}
			onChange={(e) => setState({ query: e.target.value })} // 🚨 History entry per keystroke
		/>
	);
}
```

**✅ Solution**: Use debouncing and consider when to use push vs replace:
Additionally, consider adding search terms, or other similar types of state that accumulate input, to hash state only after a submit like event.

OR

add a **_second hash state_** with a much longer debounce window and **_ITS OWN UNIQUE DELIMITERS_**

For the first option:
It adds more work to you as a developer to ensure proper sync and usage of "submitted" state with "active input" state, but would result in UX more accurate to a user's mental model.
When a user clicks "back" in the browser, it will remove the entire search, not just one or two characters from the search depending on how debounce is handled. This is more likely the expected behavior of a user

For the second option:
This could be a better option when you are "optimistically" handling search as a user types. Once a user has stopped typing for a given amount of time (say 1.5 seconds), it is probably safe to assume that they intended for what had been typed to be considered a "search submission."

Improvement for this type of "debounced" handling is being considered for future releases.

```tsx
// ✅ SOLUTION: Debounce and selective history strategy
function SearchInput() {
	const { state, setState } = useStatefulUrl(
		{ query: "" },
		{
			debounceMs: 300, // Debounce URL updates
			usePushState: false, // Use replaceState for transient changes
		}
	);

	const [localQuery, setLocalQuery] = useState(state.query);

	// Update local state immediately for responsive UI
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLocalQuery(e.target.value);
		setState({ query: e.target.value }); // Debounced URL update
	};

	return <input value={localQuery} onChange={handleChange} />;
}
```

### 4. SSR Hydration Mismatches

**The Problem**: Server-rendered content doesn't match client state from URL hash.

```tsx
// ❌ PROBLEMATIC: Hydration mismatch
function FilteredList() {
	const { state } = useStatefulUrl({ showExpanded: false });

	// 🚨 Server renders false, client might have true from URL
	return (
		<div>{state.showExpanded ? <ExpandedContent /> : <CollapsedContent />}</div>
	);
}
```

**✅ Solution**: Always check initialization status:

```tsx
// ✅ SOLUTION: Prevent hydration mismatches
function FilteredList() {
	const { state, isInitialized } = useStatefulUrl({ showExpanded: false });

	// Don't render state-dependent content until initialized
	if (!isInitialized) {
		return <CollapsedContent />; // Always match server render
	}

	return (
		<div>{state.showExpanded ? <ExpandedContent /> : <CollapsedContent />}</div>
	);
}
```

### 5. Race Conditions with Async Operations

**The Problem**: State updates and URL updates happening out of sync with async operations.

```tsx
// ❌ PROBLEMATIC: Race condition potential
function DataLoader() {
	const { state, setState } = useStatefulUrl({ userId: null, userData: null });

	useEffect(() => {
		if (state.userId) {
			fetchUser(state.userId).then((userData) => {
				// 🚨 What if userId changed while fetching?
				setState((prev) => ({ ...prev, userData }));
			});
		}
	}, [state.userId]);
}
```

**✅ Solution**: Use cleanup and current state checks:

```tsx
// ✅ SOLUTION: Handle race conditions properly
function DataLoader() {
	const { state, setState } = useStatefulUrl({ userId: null, userData: null });

	useEffect(() => {
		if (!state.userId) return;

		let cancelled = false;

		fetchUser(state.userId).then((userData) => {
			if (!cancelled) {
				setState((prev) => {
					// Double-check state hasn't changed
					if (prev.userId === state.userId) {
						return { ...prev, userData };
					}
					return prev;
				});
			}
		});

		return () => {
			cancelled = true;
		};
	}, [state.userId]);
}
```

### 6. Multiple useStatefulUrl Hooks - Delimiter Conflicts - Nested use of useStatefulUrl

**The Problem**: Using multiple `useStatefulUrl` hooks on the same page without unique delimiters could cause unpredictable behavior. Be aware of parents and their children consuming useStatefulUrl

```tsx
// ❌ PROBLEMATIC: Multiple hooks with default delimiters will conflict
function ParentComponent() {
	const { state: userFilters } = useStatefulUrl({
		selectedUsers: new Set<string>(),
		userPage: 1,
	});
	// Uses default delimiters: __UHS- and -UHS__

	return (
		<div>
			<UserList filters={userFilters} />
			<ProductSearch /> {/* This component also uses useStatefulUrl! */}
		</div>
	);
}

function ProductSearch() {
	const { state: searchState } = useStatefulUrl({
		query: "",
		category: "all",
	});
	// 🚨 CONFLICT: Also uses __UHS- and -UHS__ delimiters!
	// Both hooks will overwrite each other's URL content
}
```

**The Result**: Both hooks compete for the same URL space, causing:

- State from one hook overwrites the other
- Unpredictable initialization behavior
- Lost state when components re-render
- Difficult debugging due to intermittent issues

**✅ Solution**: Use unique delimiters for each hook instance:

```tsx
// ✅ SOLUTION: Unique delimiters prevent conflicts
function ParentComponent() {
	const { state: userFilters } = useStatefulUrl(
		{
			selectedUsers: new Set<string>(),
			userPage: 1,
		},
		{
			delimiters: {
				start: "__USER_FILTERS_",
				end: "_USER_FILTERS__",
			},
		}
	);

	return (
		<div>
			<UserList filters={userFilters} />
			<ProductSearch />
		</div>
	);
}

function ProductSearch() {
	const { state: searchState } = useStatefulUrl(
		{
			query: "",
			category: "all",
		},
		{
			delimiters: {
				start: "__PRODUCT_SEARCH_",
				end: "_PRODUCT_SEARCH__",
			},
		}
	);
}

// URL will be: #existing=params__USER_FILTERS_selectedUsers=id1,id2&userPage=2_USER_FILTERS____PRODUCT_SEARCH_query=laptop&category=electronics_PRODUCT_SEARCH__
```

**Best Practices for Multiple Hooks**:

1. **Always use descriptive, unique delimiters** when you might have multiple hooks:

   ```tsx
   // ✅ Good: Descriptive and unique
   delimiters: { start: "__MODAL_STATE_", end: "_MODAL_STATE__" }
   delimiters: { start: "__FILTERS_", end: "_FILTERS__" }
   delimiters: { start: "__PAGINATION_", end: "_PAGINATION__" }
   ```

2. **Consider a delimiter naming convention** for your app:

   ```tsx
   // Pattern: __COMPONENT_PURPOSE_
   delimiters: { start: "__HEADER_SEARCH_", end: "_HEADER_SEARCH__" }
   delimiters: { start: "__SIDEBAR_FILTERS_", end: "_SIDEBAR_FILTERS__" }
   delimiters: { start: "__MODAL_GALLERY_", end: "_MODAL_GALLERY__" }
   ```

3. **Document delimiter usage** in deeply nested component trees:

   ```tsx
   // Add comments when hooks might be nested unknowingly
   function DeepChild() {
   	// NOTE: Parent components may also use useStatefulUrl
   	// Using unique delimiters to prevent conflicts
   	// Consider using a utility function like below or some type of hashing function (not to be confused with url hash fragments) for truly unique names
   	const { state } = useStatefulUrl(initialState, {
   		delimiters: {
   			start: "__DEEP_CHILD_sdhiweruh_",
   			end: "_DEEP_CHILD_sdhiweruh___",
   		}, // pretend this was a proper hash
   	});
   }
   ```

4. **Create utility functions** for consistent delimiter generation:

   ```tsx
   // ✅ Utility for consistent delimiter naming
   const createDelimiters = (componentName: string) => ({
   	start: `__${componentName.toUpperCase()}_`,
   	end: `_${componentName.toUpperCase()}__`,
   });

   // Usage
   const { state } = useStatefulUrl(initialState, {
   	delimiters: createDelimiters("userFilters"),
   });
   ```

**When You Don't Control Parent Components**: If you're building a reusable component that might be used in apps with existing `useStatefulUrl` usage, always use unique delimiters as a defensive practice, even if you don't know about other hooks in the component tree.

## Best Practices

1. **Always check `isInitialized`** before rendering state-dependent content to prevent hydration mismatches
2. **Differentiate URL initialization from user interaction** using patterns like the `hasUserInteracted` flag
3. **Use validation** in custom deserializers to handle malformed URLs gracefully
4. **Debounce rapid updates** using the `debounceMs` option to prevent browser history pollution
5. **Keep URLs readable** by using meaningful parameter names and avoiding overly complex state
6. **Handle edge cases** like empty arrays/sets in your serializers
7. **Let URLSearchParams handle encoding** - never manually encode/decode values
8. **Consider JSON for complex values** that might contain special characters
9. **Customize delimiters** if the defaults conflict with your existing hash usage
10. **Use `clearHash()`** to preserve existing hash content when resetting state
11. **✨ Feel free to define serializers inline** - memoization is automatic!

## Performance

The hook automatically handles performance optimizations:

- **Automatic memoization** of serializer functions
- **Debounced URL updates** to prevent excessive browser history entries
- **Efficient change detection** using function stringification
- **SSR-safe initialization** with proper hydration handling

## Browser Support

- Modern browsers with URLSearchParams support
- Works with SSR frameworks like Next.js, Nuxt.js

## Contributing

Contributions welcome! Please read our contributing guide and submit PRs.

## License

MIT License - see LICENSE file for details.

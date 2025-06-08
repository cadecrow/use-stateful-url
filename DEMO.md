# 🚀 useStatefulUrl Demo

This demo showcases the power of the `useStatefulUrl` hook for managing URL state in React applications.

## Running the Demo

1. **Local File**: Open `demo.html` directly in your browser
2. **Live Server**: Use a local development server for best experience
3. **Online**: Host the HTML file on any static hosting service

## Demo Features

### 🎯 **What You'll See**

- **10 Project Cards** with realistic data
- **Text Search** that filters projects by title, description, or category  
- **Tag Filters** with active state styling
- **Modal Dialogs** for detailed project views
- **Live URL Updates** showing state changes in real-time
- **Shareable URLs** - copy and paste to share exact view states

### 🔗 **URL State Management**

The demo manages three pieces of state in the URL hash:

```javascript
{
  selectedTags: new Set(),     // #tags=React,TypeScript,Node.js
  searchQuery: '',             // #search=ecommerce
  selectedItemId: null         // #item=ai-chatbot
}
```

### 📱 **Try These Interactions**

1. **Search for "AI"** → URL updates to `#search=AI`
2. **Filter by "React"** → URL becomes `#search=AI&tags=React`  
3. **Click a card** → Adds `#item=project-id` to URL
4. **Copy the URL** and paste in new tab → Same view loads!
5. **Use browser back/forward** → Navigation works perfectly

### 🎨 **UI Features**

- **Responsive Design** - works on mobile and desktop
- **Smooth Animations** - hover effects and transitions
- **Active State Indicators** - selected filters are highlighted
- **Results Counter** - shows filtered results count
- **Live URL Display** - see the current URL in real-time

## Code Highlights

### **Inline Serializers** (Great DX!)
```javascript
const { state, setState } = useStatefulUrl({
  selectedTags: new Set(),
  searchQuery: '',
  selectedItemId: null
}, {
  serializers: {
    // ✅ Define serializers inline - no performance issues!
    serialize: (state) => {
      const result = {};
      if (state.selectedTags.size > 0) {
        result.tags = Array.from(state.selectedTags).join(',');
      }
      if (state.searchQuery) result.search = state.searchQuery;
      if (state.selectedItemId) result.item = state.selectedItemId;
      return result;
    },
    deserialize: (params) => ({
      selectedTags: new Set(params.get('tags')?.split(',') || []),
      searchQuery: params.get('search') || '',
      selectedItemId: params.get('item') || null
    })
  }
});
```

### **Complex State Updates**
```javascript
// Multiple filters work together seamlessly
const filteredProjects = sampleProjects.filter(project => {
  const matchesSearch = !state.searchQuery || 
    project.title.toLowerCase().includes(state.searchQuery.toLowerCase());
  
  const matchesTags = state.selectedTags.size === 0 || 
    project.tags.some(tag => state.selectedTags.has(tag));
  
  return matchesSearch && matchesTags;
});
```

### **Modal State Management**
```javascript
// Modal state is automatically synced to URL
const selectedItem = state.selectedItemId 
  ? sampleProjects.find(p => p.id === state.selectedItemId) 
  : null;

// Opening modal updates URL
const openModal = (project) => {
  setState(prev => ({ ...prev, selectedItemId: project.id }));
};
```

## Real-World Benefits

### 🔗 **Shareable Links**
- Share exact search results: `yourapp.com#search=AI&tags=Python`
- Link to specific items: `yourapp.com#item=ml-pipeline`
- Combine multiple filters: `yourapp.com#search=web&tags=React,TypeScript`

### 🔄 **Browser Navigation**
- Back/forward buttons work intuitively
- Page refresh preserves all filters and state
- Deep linking works out of the box

### ⚡ **Developer Experience**
- No manual URL manipulation required
- Automatic serialization/deserialization
- Type-safe state management
- Works with any React state pattern

## Package Installation

```bash
npm install use-hash-state
```

```javascript
import { useStatefulUrl } from 'use-stateful-url';
```

## Next Steps

1. **Explore the Demo** - interact with all features
2. **View Source** - check the implementation in `demo.html`
3. **Read the Docs** - see `README.md` for full API reference
4. **Try in Your App** - install the package and start building!

---

**💡 Tip**: Open the demo in multiple browser tabs with different filter combinations to see how URL state works! 
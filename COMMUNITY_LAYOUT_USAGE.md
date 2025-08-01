# Community Post List Layout Modifications

## Overview

The PostCard and PostList components have been successfully modified to support hiding images and creating a more compact, text-only layout. This provides flexibility to display community posts in different formats based on user preferences or specific use cases.

## New Features

### PostCard Component Props

**New Props Added:**
- `showImages?: boolean` - Controls whether images are displayed (default: `true`)
- `compact?: boolean` - Enables compact layout with reduced spacing and smaller text (default: `false`)

### PostList Component Props

**New Props Added:**
- `showImages?: boolean` - Controls image display for all posts in the list (default: `true`)
- `compact?: boolean` - Enables compact layout for the entire list (default: `false`)

## Usage Examples

### 1. Default Layout (with images)
```tsx
import { PostList } from "@/components/community/PostList";

// Default behavior - shows images
<PostList
  posts={posts}
  onPostClick={handlePostClick}
/>
```

### 2. Text-Only Layout (hide images)
```tsx
import { PostList } from "@/components/community/PostList";

// Hide images, show only text content
<PostList
  posts={posts}
  onPostClick={handlePostClick}
  showImages={false}
/>
```

### 3. Compact Text-Only Layout
```tsx
import { PostList } from "@/components/community/PostList";

// Most compact layout - no images, reduced spacing
<PostList
  posts={posts}
  onPostClick={handlePostClick}
  showImages={false}
  compact={true}
/>
```

### 4. Individual PostCard Usage
```tsx
import { PostCard } from "@/components/community/PostCard";

// Text-only individual post card
<PostCard
  post={post}
  onClick={handleClick}
  showImages={false}
  compact={true}
/>
```

## Layout Changes

### Text-Only Mode (`showImages={false}`)
- **Images Hidden**: All post images are completely hidden from view
- **Image Indicator**: A small, subtle icon shows the number of images (e.g., "사진 3장")
- **Preserved Functionality**: Image count information is still accessible to users
- **Clean Layout**: Text content takes full width without image layout constraints

### Compact Mode (`compact={true}`)
- **Reduced Padding**: Container padding reduced from `p-4 sm:p-5` to `p-3 sm:p-4`
- **Smaller Typography**: 
  - Title size reduced from `text-base` to `text-sm`
  - Body text reduced from `text-sm` to `text-xs`
  - Body text limited to single line (`line-clamp-1`)
- **Tighter Spacing**: 
  - Content spacing reduced from `space-y-2` to `space-y-1`
  - Footer spacing reduced from `mt-4 pt-3` to `mt-2 pt-2`
  - List spacing reduced from `space-y-3 sm:space-y-4` to `space-y-1 sm:space-y-2`

### Image Indicator in Text-Only Mode
When images are hidden, a small visual indicator is shown:
- **Icon**: Miniature image icon (smaller than normal)
- **Text**: "사진 N장" in lighter gray text
- **Positioning**: Inline with content, minimal visual impact
- **Purpose**: Maintains user awareness of image presence without visual clutter

## Benefits

1. **Improved Scanning**: Text-only layout allows users to quickly scan through post titles and content
2. **Reduced Bandwidth**: Loading pages without images saves data usage
3. **Faster Loading**: Pages load faster without image processing
4. **Accessibility**: Better for users with slow connections or screen readers
5. **Density**: More posts visible in the same screen space
6. **Flexibility**: Components can adapt to different contexts and user preferences

## Implementation Notes

- **Backward Compatible**: All existing implementations continue to work without changes
- **Progressive Enhancement**: New props are optional with sensible defaults
- **Consistent Styling**: Maintains the existing Daangn-style design system
- **Responsive**: All modes work correctly across mobile and desktop breakpoints
- **Accessible**: Proper ARIA labels and semantic HTML structure preserved

## Future Enhancements

Consider adding these features in future iterations:
- User preference storage for layout choices
- Toggle button to switch between image/text-only modes
- Additional compact levels (ultra-compact, medium, etc.)
- Custom image placeholder options
- Lazy loading optimizations for text-only mode
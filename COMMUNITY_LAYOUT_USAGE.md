# Community Post List Layout Modifications

## Overview

The PostCard and PostList components have been successfully modified to support multiple layout modes, including hiding images, compact layouts, and a **Daangn-style list layout** that matches the reference design from Daangn community pages. This provides maximum flexibility to display community posts in different formats based on user preferences or specific use cases.

## New Features

### PostCard Component Props

**New Props Added:**
- `showImages?: boolean` - Controls whether images are displayed (default: `true`)
- `compact?: boolean` - Enables compact layout with reduced spacing and smaller text (default: `false`)
- `listMode?: boolean` - **NEW:** Enables Daangn-style horizontal list layout (default: `false`)

### PostList Component Props

**New Props Added:**
- `showImages?: boolean` - Controls image display for all posts in the list (default: `true`)
- `compact?: boolean` - Enables compact layout for the entire list (default: `false`)
- `listMode?: boolean` - **NEW:** Enables Daangn-style list layout for the entire list (default: `false`)

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

### 4. Daangn-Style List Layout
```tsx
import { PostList } from "@/components/community/PostList";

// Daangn-style horizontal list layout with small thumbnails
<PostList
  posts={posts}
  onPostClick={handlePostClick}
  listMode={true}
/>
```

### 5. Daangn-Style List Layout (No Images)
```tsx
import { PostList } from "@/components/community/PostList";

// Pure text list layout like traditional forums
<PostList
  posts={posts}
  onPostClick={handlePostClick}
  listMode={true}
  showImages={false}
/>
```

### 6. Individual PostCard Usage
```tsx
import { PostCard } from "@/components/community/PostCard";

// Text-only individual post card
<PostCard
  post={post}
  onClick={handleClick}
  showImages={false}
  compact={true}
/>

// Daangn-style individual post card
<PostCard
  post={post}
  onClick={handleClick}
  listMode={true}
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

### Daangn-Style List Mode (`listMode={true}`)
- **Horizontal Layout**: Each post is a single horizontal row (not cards)
- **Right-aligned Thumbnails**: Small 64x64px square images positioned on the far right
- **Clean Typography**: 
  - Bold titles with hover effects (`text-base font-medium`)
  - Small gray metadata in single row (`text-xs text-gray-500`)
  - Content preview shown only when both title and body exist
- **Minimal Spacing**: Tight, forum-like appearance with thin borders
- **Metadata Row**: Category · Location · Time · Engagement metrics in single line
- **Multiple Images**: Shows "+N" indicator on thumbnail for additional images
- **Container Styling**: White background with rounded borders and subtle shadows

### Image Indicator in Text-Only Mode
When images are hidden, a small visual indicator is shown:
- **Icon**: Miniature image icon (smaller than normal)
- **Text**: "사진 N장" in lighter gray text
- **Positioning**: Inline with content, minimal visual impact
- **Purpose**: Maintains user awareness of image presence without visual clutter

## Benefits

1. **Improved Scanning**: Text-only and list layouts allow users to quickly scan through post titles and content
2. **Daangn-Style Familiarity**: List mode provides the familiar, clean layout that Korean users expect from Daangn
3. **Maximum Density**: List mode shows significantly more posts per screen than card layouts
4. **Reduced Bandwidth**: Loading pages without images saves data usage
5. **Faster Loading**: Pages load faster without image processing
6. **Professional Appearance**: Clean, forum-like layout appears more serious and content-focused
7. **Accessibility**: Better for users with slow connections or screen readers
8. **Mobile Optimized**: Horizontal layout works well on narrow mobile screens
9. **Flexibility**: Components can adapt to different contexts and user preferences

## Implementation Notes

- **Backward Compatible**: All existing implementations continue to work without changes
- **Progressive Enhancement**: New props are optional with sensible defaults
- **Consistent Styling**: Maintains the existing Daangn-style design system
- **Responsive**: All modes work correctly across mobile and desktop breakpoints
- **Accessible**: Proper ARIA labels and semantic HTML structure preserved

## Layout Comparison

### Original Card Layout (Default)
- **Style**: Social media-style cards with full images
- **Spacing**: Generous padding and margins
- **Images**: Large, prominent display with multiple layout modes
- **Best For**: Visual content, engagement-focused communities

### Compact Mode
- **Style**: Reduced spacing version of card layout
- **Spacing**: Tighter padding and smaller typography
- **Images**: Same display patterns but more condensed
- **Best For**: Mobile devices, information-dense displays

### Daangn-Style List Mode ⭐️ **NEW**
- **Style**: Clean, horizontal rows matching Korean community standards
- **Spacing**: Minimal, forum-like appearance
- **Images**: Small 64px thumbnails aligned right
- **Best For**: High-density browsing, Korean user expectations, professional appearance

## Implementation Priority

**Recommended Usage by Context:**
1. **Korean Community Sites**: Use `listMode={true}` for familiar Daangn-style experience
2. **Mobile Applications**: Use `compact={true}` for space efficiency
3. **Visual Communities**: Use default card layout for engagement
4. **Forum-Style Discussions**: Use `listMode={true} showImages={false}` for pure text focus

## Future Enhancements

Consider adding these features in future iterations:
- User preference storage for layout choices
- Toggle button to switch between layout modes
- Additional list mode variations (ultra-dense, medium, etc.)
- Custom thumbnail sizes for list mode
- Lazy loading optimizations for all modes
- Sort/filter integration optimized for each layout type
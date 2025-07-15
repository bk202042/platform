Community Page UI Layout Guide
This guide defines the visual structure and layout principles for the community page, ensuring a consistent and user-friendly experience across different devices.

1.0 Global Principles
Grid: The layout is based on a standard 12-column grid system for desktop views.
Spacing: Use a base unit of 4px for all margins, padding, and spacing. (e.g., space-1: 4px, space-2: 8px, space-4: 16px).
Responsive Breakpoints:
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
2.0 Header Layout
The header provides primary navigation and key actions. It remains fixed at the top of the viewport on scroll.

2.1 Container:

Placement: Full-width, pinned to the top.
Height: 64px.
Padding: 16px horizontal padding.
Layout: Use Flexbox with align-items: center and justify-content: space-between.
2.2 Left Group:

Logo: Aligned to the far left.
Location Selector: Positioned immediately to the right of the logo, with 16px of left margin. It should be a clear clickable element (button or styled link) with a dropdown indicator icon (e.g., a chevron-down).
2.3 Right Group:

Layout: Use Flexbox with align-items: center.
Search Icon: A clickable icon button.
Write Post Button: A primary CTA button, positioned to the far right, with 16px of left margin from the search icon.
3.0 Main Content Area
This area contains the core content of the page.

3.1 Container:

Placement: Sits below the header.
Max-width: 1100px, centered on the page for desktop views.
Padding: 24px horizontal padding.
3.2 Page Header:

Breadcrumbs: Placed at the top of the content area.
Page Title (<h1>): Placed below the breadcrumbs with a 16px top margin.
3.3 Two-Column Layout (Desktop):

Layout: The main content area is split into two columns with a 24px gap between them.
Left Sidebar (Categories):
Width: 25% of the container width (or a fixed width like 220px).
Content: A vertical list of navigation links. The active category should have a distinct visual style.
Main Feed (Post List):
Width: 75% of the container width (or the remaining flexible space).
Content: A vertical stack of Post Item components. Each post should be separated by a 16px margin.
3.4 Responsive Behavior (Mobile):

The two-column layout collapses into a single column.
The Left Sidebar can be hidden behind a "Categories" hamburger menu button or transformed into a horizontally scrollable list of filter chips placed below the Page Title.
4.0 Post Item Component
This component is the basic building block of the community feed.

4.1 Container:

Style: A card-like container with a subtle border or box-shadow to separate it from other posts.
Padding: 16px on all sides.
4.2 Layout:

With Image: If an image is present, it should be on the right side, taking up ~25-30% of the card's width. The text content flows to its left.
Without Image: Text content spans the full width of the card.
4.3 Content Structure (Vertical Flow):

Post Title: Bold, larger font size.
Post Snippet: Standard font size, with a 4px top margin.
Metadata: Smaller, muted text color (Author, Time), with an 8px top margin.
Engagement: (Likes, Comments) Aligned to the bottom-left, often grouped with metadata.
5.0 Location Selector (Modal)
This modal appears as an overlay when the user clicks the Location Selector in the header.

5.1 Overlay:

A semi-transparent dark background that covers the entire viewport to focus the user's attention.
5.2 Modal Container:

Placement: Centered horizontally and vertically.
Width: Fixed width, e.g., 480px.
Style: Rounded corners, a subtle box-shadow, and a solid background color.
Padding: 24px on all sides.
5.3 Modal Header:

Layout: Flexbox with justify-content: space-between.
Title: "Change Location" on the left.
Close Button: An 'X' icon on the right.
5.4 Modal Content (Vertical Stack):

Search Bar: Full-width input field, 16px below the header.
Use Current Location Button: A full-width button with an icon, 16px below the search bar.
Location List: A scrollable list of suggested locations, 24px below the button. Each list item should be a clickable row with consistent padding.

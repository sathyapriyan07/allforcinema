# CineStream - YouTube Video Discovery Platform

## Project Overview
- **Project Name**: CineStream
- **Type**: Premium curated video discovery webapp
- **Core Functionality**: A curated discovery system where admins manage YouTube videos via embedded iframes - no streaming/upload, all content is admin-controlled
- **Target Users**: Content curators, video enthusiasts, casual viewers seeking curated video collections

---

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Styling**: Tailwind CSS
- **Theme**: Dark (#0f0f0f base, Apple/Netflix inspired)
- **State**: Zustand
- **Routing**: React Router
- **DnD**: @dnd-kit/core, @dnd-kit/sortable

---

## UI/UX Specification

### Layout Structure
- **Header**: Fixed top navbar (64px height)
- **Main Content**: Full-width with max-width 1800px, centered
- **Grid**: 12-column grid system
- **Responsive Breakpoints**:
  - Mobile: < 640px (1 column)
  - Tablet: 640px - 1024px (2-3 columns)
  - Desktop: 1024px - 1440px (4 columns)
  - Large: > 1440px (5-6 columns)

### Visual Design

#### Color Palette
```css
--bg-primary: #0f0f0f;        /* Base background */
--bg-secondary: #1a1a1a;    /* Cards, elevated surfaces */
--bg-tertiary: #262626;      /* Hover states, inputs */
--bg-gradients: linear-gradient(180deg, rgba(20,20,20,0) 0%, #0f0f0f 100%);

--accent-primary: #e50914;   /* Netflix red - CTAs, highlights */
--accent-secondary: #b20710;/* Darker red - hover */
--accent-gold: #ffd700;     /* Premium/featured indicators */

--text-primary: #ffffff;    /* Headings, primary text */
--text-secondary: #a3a3a3; /* Body text, descriptions */
--text-muted: #737373;      /* Metadata, timestamps */

--border-subtle: #333333;   /* Card borders */
--border-focus: #e50914;     /* Input focus states */
```

#### Typography
- **Font Family**: "Sora", sans-serif (headings), "DM Sans", sans-serif (body)
- **Sizes**:
  - Display: 56px/64px, font-weight: 700
  - H1: 40px/48px, font-weight: 600
  - H2: 32px/40px, font-weight: 600
  - H3: 24px/32px, font-weight: 500
  - Body: 16px/24px, font-weight: 400
  - Small: 14px/20px, font-weight: 400
  - Caption: 12px/16px, font-weight: 500

#### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128

#### Visual Effects
- **Card Shadows**: 0 4px 24px rgba(0,0,0,0.4)
- **Hover Scale**: transform: scale(1.05)
- **Transitions**: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Glassmorphism**: backdrop-blur(12px), bg-opacity-80
- **Gradients**: Linear overlays on thumbnails

### Components

#### VideoCard
- Aspect ratio: 16:9
- Thumbnail with gradient overlay (bottom)
- Title (max 2 lines, ellipsis)
- Duration badge (top-right)
- Play icon on hover (centered, scale animation)
- Category badge (top-left)
- Subtle border glow on hover

#### PlaylistCard
- Large cover image (2:1 aspect)
- Gradient overlay (bottom gradient)
- Title bottom-left positioned
- Video count badge
- "Featured" gold badge option
- Hover: slight lift + glow

#### Navbar
- Logo (left)
- Search bar (center, expandable)
- Navigation links: Categories, Playlists, Discover
- Profile/Admin button (right)
- Glassmorphism background on scroll

#### Sidebar
- Collapsible
- Navigation items with icons
- Admin section (if admin)
- Active state: accent border left

#### Player
- 16:9 responsive iframe
- Title and info below
- Autoplay toggle
- Queue sidebar option

---

## Database Schema (Supabase)

### videos
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| title | text | NOT NULL |
| description | text | |
| youtube_url | text | NOT NULL |
| youtube_id | text | NOT NULL, UNIQUE |
| thumbnail | text | |
| category_id | uuid | FK -> categories.id |
| creator_id | uuid | FK -> creators.id |
| tags | text[] | DEFAULT '{}' |
| duration | text | |
| is_featured | boolean | DEFAULT false |
| is_trending | boolean | DEFAULT false |
| view_count | integer | DEFAULT 0 |
| created_at | timestamptz | DEFAULT NOW() |
| updated_at | timestamptz | DEFAULT NOW() |

### categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | text | NOT NULL, UNIQUE |
| slug | text | NOT NULL, UNIQUE |
| description | text | |
| color | text | DEFAULT '#e50914' |
| icon | text | |
| created_at | timestamptz | DEFAULT NOW() |

### creators
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| youtube_channel_url | text | |
| avatar | text | |
| bio | text | |
| created_at | timestamptz | DEFAULT NOW() |

### playlists
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| title | text | NOT NULL |
| description | text | |
| cover_image | text | |
| is_featured | boolean | DEFAULT false |
| is_public | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT NOW() |
| updated_at | timestamptz | DEFAULT NOW() |

### playlist_videos
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| playlist_id | uuid | FK -> playlists.id, NOT NULL |
| video_id | uuid | FK -> videos.id, NOT NULL |
| position | integer | NOT NULL |
| created_at | timestamptz | DEFAULT NOW() |

### profiles (user roles)
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, FK -> auth.users |
| username | text | |
| avatar_url | text | |
| role | text | DEFAULT 'user', CHECK (role IN ('user', 'admin')) |
| continue_watching | jsonb | DEFAULT '{}' |
| created_at | timestamptz | DEFAULT NOW() |

---

## Functionality Specification

### Core Features

#### Video Management (Admin)
1. Add video via YouTube URL
   - Auto-extract youtube_id (regex from URL)
   - Auto-generate thumbnail URL
   - Manual: title, description, tags, category, creator
2. Edit video metadata
3. Delete video (cascade delete from playlists)
4. Toggle featured/trending

#### Playlist Management (Admin)
1. Create playlist (title, description, cover)
2. Add videos to playlist (search + select)
3. Remove videos from playlist
4. Reorder via drag-and-drop
5. Set cover image
6. Mark as featured

#### Category Management (Admin)
1. Create category (name, slug, color, icon)
2. Edit category
3. Delete category (set videos to uncategorized)

#### User Features
1. Browse all videos (paginated)
2. Filter by category, tags
3. Sort by (new, popular, featured)
4. Search (title, tags, creator)
5. View playlists
6. View video detail
7. Watch video (embedded player)

### User Interactions
- Click video card → navigate to video detail
- Click "Play All" → start playlist with autoplay
- Click queue item → play that video
- Search → instant results with debounce

### Data Handling
- All data from Supabase
- React Query for caching
- Optimistic updates for admin actions

---

## Pages Specification

### 1. Homepage (`/`)
- Hero banner (featured playlist or video)
- Trending videos (horizontal row)
- Featured playlists (horizontal row)
- Categories quick links
- Recently added (horizontal row)
- Featured creators (if exists)

### 2. Video Detail (`/video/:id`)
- Large player (16:9)
- Video title, description
- Tags list
- Category link
- Creator info (if exists)
- Related videos (same category, 6 items)

### 3. Playlists (`/playlists`)
- Grid of playlist cards
- Featured first, then by date

### 4. Playlist Detail (`/playlist/:id`)
- Banner (cover image + title + description)
- "Play All" button
- Layout:
  - Left: Video player (main)
  - Right: Playlist queue (scrollable)
- Click queue item → play
- Auto-play next (toggle)
- Progress indicator

### 5. Categories (`/categories`)
- Grid of category cards
- Each click → category video list

### 6. Category Videos (`/category/:slug`)
- Filtered videos for category
- Same layout as discover

### 7. Discover (`/discover`)
- Filters: Category dropdown, Tags multi-select, Duration range
- Sort: New (default), Popular, Featured
- Grid layout

### 8. Search (`/search?q=:query`)
- Search input (header)
- Results grid
- Empty state for no results

### 9. Creator (Optional) (`/creator/:id`)
- Creator info banner
- All videos by creator

---

## Admin Panel (`/admin`)

### Routes
- `/admin` - Dashboard
- `/admin/videos` - Video list + add
- `/admin/videos/new` - Add video form
- `/admin/videos/:id/edit` - Edit video
- `/admin/playlists` - Playlist list + add
- `/admin/playlists/:id` - Edit playlist (add videos, reorder)
- `/admin/categories` - Category management

### Admin Components
- Sidebar navigation
- Table/grid view for items
- Forms for add/edit
- Drag-and-drop for reordering

---

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme (#0f0f0f base) applied throughout
- [ ] Video cards have 16:9 thumbnails with hover effects
- [ ] Playlist cards show large covers with gradients
- [ ] Navbar has glassmorphism effect on scroll
- [ ] Smooth transitions on all interactive elements

### Functional Checkpoints
- [ ] YouTube URLs extract video IDs correctly
- [ ] Video player embeds work (iframe)
- [ ] Playlist auto-play advances to next video
- [ ] Search returns relevant results
- [ ] Admin can CRUD videos, playlists, categories
- [ ] Drag-and-drop reordering works

### Performance
- [ ] Lazy loading for thumbnails
- [ ] Skeleton loaders during fetch
- [ ] Fast navigation (client-side routing)

---

## Folder Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── video/
│   │   ├── VideoCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoGrid.tsx
│   │   └── ...
│   ├── playlist/
│   │   ├── PlaylistCard.tsx
│   │   ├── PlaylistQueue.tsx
│   │   └── ...
│   └── admin/
│       ├── VideoForm.tsx
│       ├── PlaylistForm.tsx
│       └── ...
├── pages/
│   ├── Home.tsx
│   ├── VideoDetail.tsx
│   ├── Playlists.tsx
│   ├── PlaylistDetail.tsx
│   ├── Categories.tsx
│   ├── Discover.tsx
│   ├── Search.tsx
│   └── admin/
│       ├── AdminVideos.tsx
│       ├── AdminPlaylists.tsx
│       └── AdminCategories.tsx
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── youtube.ts
├── store/
│   └── playerStore.ts
├── hooks/
│   └── useVideos.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```
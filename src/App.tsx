import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/Home';
import { VideoDetailPage } from './pages/VideoDetail';
import { PlaylistsPage } from './pages/Playlists';
import { PlaylistDetailPage } from './pages/PlaylistDetail';
import { CategoriesPage, CategoryPage } from './pages/Categories';
import { DiscoverPage } from './pages/Discover';
import { SearchPage } from './pages/Search';
import { AdminLayout, AdminDashboard } from './pages/admin/AdminLayout';
import { AdminVideosPage } from './pages/admin/AdminVideos';
import { AdminPlaylistsPage } from './pages/admin/AdminPlaylists';
import { AdminCategoriesPage } from './pages/admin/AdminCategories';
import { AuthProvider, useAuthContext } from './hooks/AuthContext';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, profile, user } = useAuthContext();
  console.log('ProtectedAdminRoute - isAdmin:', isAdmin, 'loading:', loading, 'profile:', profile, 'user:', user);
  if (loading) return <div className="p-8 text-center text-text-muted">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (!isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bg-primary">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/video/:id" element={<VideoDetailPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/search" element={<SearchPage />} />
              
{/* Admin Routes */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="videos" element={<AdminVideosPage />} />
              <Route path="playlists" element={<AdminPlaylistsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
            </Route>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
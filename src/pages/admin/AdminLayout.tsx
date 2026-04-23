import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/admin/videos', label: 'Videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { path: '/admin/playlists', label: 'Playlists', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7.5 17l5-3.5V8.5L7.5 12l5 3.5V17z' },
  { path: '/admin/categories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4zM11 11v5a1 1 0 002 0v-5a1 1 0 00-2 0z' },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-secondary border-r border-border-subtle fixed left-0 top-16 bottom-0 overflow-y-auto">
        <div className="p-4">
          <h2 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Admin
          </h2>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-accent-primary/20 text-accent-primary'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  )}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-subtle">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">
        Admin Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/videos"
          className="p-6 bg-bg-secondary rounded-xl hover:bg-bg-tertiary transition-colors card-glow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text-primary">Videos</h3>
              <p className="text-text-muted text-sm">Manage video library</p>
            </div>
          </div>
        </Link>
        
        <Link
          to="/admin/playlists"
          className="p-6 bg-bg-secondary rounded-xl hover:bg-bg-tertiary transition-colors card-glow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-gold/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7.5 17l5-3.5V8.5L7.5 12l5 3.5V17z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text-primary">Playlists</h3>
              <p className="text-text-muted text-sm">Curate playlists</p>
            </div>
          </div>
        </Link>
        
        <Link
          to="/admin/categories"
          className="p-6 bg-bg-secondary rounded-xl hover:bg-bg-tertiary transition-colors card-glow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text-primary">Categories</h3>
              <p className="text-text-muted text-sm">Organize content</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
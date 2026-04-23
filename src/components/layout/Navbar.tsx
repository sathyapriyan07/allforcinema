import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuthContext } from '../../hooks/AuthContext';

export function Navbar() {
  const [query, setQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, signIn, signUp, signOut } = useAuthContext();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const navLinks = [
    { to: '/categories', label: 'Categories' },
    { to: '/playlists', label: 'Playlists' },
    { to: '/channels', label: 'Channels' },
    { to: '/discover', label: 'Discover' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'glass border-b border-border-subtle' : 'bg-transparent'
        )}
      >
        <div className="max-w-[1800px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-accent-primary flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="font-heading text-xl font-bold text-text-primary hidden sm:block">
                AllForCinema
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-text-primary',
                    location.pathname === link.to ? 'text-text-primary' : 'text-text-secondary'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className={cn('relative transition-all duration-300 overflow-hidden', isSearchOpen ? 'w-48 md:w-64' : 'w-10')}>
                {isSearchOpen ? (
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full h-10 px-4 bg-bg-tertiary rounded-lg text-text-primary text-sm"
                      autoFocus
                      onBlur={() => !query && setIsSearchOpen(false)}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-bg-tertiary"
                  >
                    <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-bg-tertiary"
              >
                <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Desktop Auth/User */}
              {!mobileMenuOpen && (
                <div className="hidden md:flex items-center gap-2">
                  {user ? (
                    <>
                      {isAdmin && (
                        <Link to="/admin" className="p-2 hover:bg-bg-tertiary rounded-lg">
                          <svg className="w-5 h-5 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </Link>
                      )}
                      <button onClick={() => signOut()} className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                        className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                        className="px-3 py-1.5 text-sm bg-accent-primary hover:bg-accent-secondary text-white rounded"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div ref={menuRef} className="md:hidden absolute top-16 left-0 right-0 glass border-b border-border-subtle p-4 space-y-4">
            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    location.pathname === link.to
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:bg-bg-tertiary'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth */}
            <div className="border-t border-border-subtle pt-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="px-4 py-2 rounded-lg text-sm font-medium text-accent-primary hover:bg-bg-tertiary"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-bg-tertiary text-left"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-text-secondary border border-border-subtle"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-accent-primary text-white"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-bg-secondary rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {authError && <p className="text-red-500 text-sm">{authError}</p>}
              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-tertiary rounded text-text-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-bg-tertiary rounded text-text-primary"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowAuthModal(false)} className="flex-1 py-2 bg-bg-tertiary rounded">
                  Cancel
                </button>
                <button type="submit" disabled={authLoading} className="flex-1 py-2 bg-accent-primary text-white rounded disabled:opacity-50">
                  {authLoading ? 'Loading...' : authMode === 'login' ? 'Login' : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
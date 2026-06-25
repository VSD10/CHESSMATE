import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { api } from '@/lib/api';

interface SearchResult {
  id: string;
  username: string;
  playerCode: string;
  user: {
    name: string;
  };
}

export function PlayerSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/players/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (username: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/player/${username}`);
  };

  return (
    <div ref={wrapperRef} className="relative hidden lg:flex items-center">
      <div className={`flex items-center transition-all duration-300 ${isOpen ? 'w-64' : 'w-52'} bg-white/5 border border-white/10 rounded-full hover:bg-white/10 focus-within:bg-white/10 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20`}>
        <div className="pl-3 pr-2 py-2">
          <Search size={14} className="text-on-surface-variant" />
        </div>
        <input
          type="text"
          placeholder="Find ID (CM-...) or Name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-on-surface-variant py-2 pr-3"
        />
        {query && (
          <button onClick={() => setQuery('')} className="pr-3 pl-1 text-on-surface-variant hover:text-white transition-colors cursor-pointer">
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full min-w-[280px] right-0 bg-surface-container border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] backdrop-blur-3xl animate-slide-down">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-on-surface-variant font-mono">Searching records...</div>
          ) : results.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5 space-y-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result.username)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                    {result.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors leading-tight">{result.user.name}</p>
                    <p className="text-2xs text-on-surface-variant truncate">@{result.username}</p>
                  </div>
                  {result.playerCode && (
                    <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-black text-amber-500 tracking-widest shadow-sm">
                      {result.playerCode}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-on-surface-variant font-mono">No players found matching "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}

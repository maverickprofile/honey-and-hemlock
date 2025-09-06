import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, Users, User, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

interface SearchResult {
  type: 'script' | 'contractor' | 'user';
  id: string;
  title: string;
  subtitle: string;
  metadata?: any;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayDebounceFn = setTimeout(() => {
        performSearch();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    const results: SearchResult[] = [];

    try {
      // Search scripts
      const { data: scripts, error: scriptsError } = await supabase
        .from('scripts')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,user_name.ilike.%${searchQuery}%,user_email.ilike.%${searchQuery}%`)
        .limit(5);

      if (!scriptsError && scripts) {
        scripts.forEach(script => {
          results.push({
            type: 'script',
            id: script.id,
            title: script.title || 'Untitled Script',
            subtitle: `Uploaded by ${script.user_name || script.user_email || 'Unknown'}`,
            metadata: script
          });
        });
      }

      // Search contractors/judges
      const { data: contractors, error: contractorsError } = await supabase
        .from('judges')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5);

      if (!contractorsError && contractors) {
        contractors.forEach(contractor => {
          results.push({
            type: 'contractor',
            id: contractor.id,
            title: contractor.name || 'Unnamed Contractor',
            subtitle: contractor.email || 'No email',
            metadata: contractor
          });
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onNavigate) {
      switch (result.type) {
        case 'script':
          onNavigate('scripts');
          break;
        case 'contractor':
          onNavigate('contractors');
          break;
        default:
          break;
      }
    }
    onClose();
    setSearchQuery('');
    setSearchResults([]);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'script':
        return <FileText className="w-4 h-4" />;
      case 'contractor':
        return <Users className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#282828] border-gray-600 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-portfolio-white flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scripts, contractors, users by name or email..."
              className="pl-10 bg-gray-700 border-gray-500 text-portfolio-white placeholder-gray-400 focus:border-portfolio-gold focus:ring-portfolio-gold"
              autoFocus
            />
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-portfolio-white"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-portfolio-gold mx-auto"></div>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-all duration-300 border border-transparent hover:border-portfolio-gold/30"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-portfolio-gold">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-portfolio-white font-medium">{result.title}</p>
                      <p className="text-gray-400 text-sm">{result.subtitle}</p>
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {result.type}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && searchQuery.length > 2 && searchResults.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}

          {searchQuery.length > 0 && searchQuery.length <= 2 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Type at least 3 characters to search
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
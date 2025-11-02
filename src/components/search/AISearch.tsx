
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Loader2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AISearchProps {
  onSearch?: (query: string, filters: any) => void;
}

const AISearch: React.FC<AISearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<Array<{ id: string; query: string; created_at: string }>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('search_history')
      .select('id, query, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setSearchHistory(data);
    }
  };

  const processAIQuery = async (userQuery: string) => {
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query: userQuery, userId: user?.id }
      });

      if (error) {
        console.error('AI search error:', error);
        if (error.message?.includes('429')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many searches. Please try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "Credits Exhausted",
            description: "AI search credits have run out. Please contact support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Search Error",
            description: "Failed to process your search. Please try again.",
            variant: "destructive",
          });
        }
        setIsProcessing(false);
        return;
      }

      const { filters } = data;
      console.log('AI extracted filters:', filters);

      // Set suggestions from AI response
      if (filters.suggestions && filters.suggestions.length > 0) {
        setAiSuggestions(filters.suggestions);
      }

      // Reload search history
      await loadSearchHistory();

      // Navigate to properties page with filters
      const searchParams = new URLSearchParams();
      if (filters.propertyType) searchParams.set('type', filters.propertyType);
      if (filters.minPrice) searchParams.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice.toString());
      if (filters.bedrooms) searchParams.set('bedrooms', filters.bedrooms.toString());
      if (filters.bathrooms) searchParams.set('bathrooms', filters.bathrooms.toString());
      if (filters.city) searchParams.set('city', filters.city);
      
      navigate(`/properties?${searchParams.toString()}`);
      
      if (onSearch) {
        onSearch(userQuery, filters);
      }
    } catch (error) {
      console.error('Search processing error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      processAIQuery(query);
    }
  };

  const quickSearches = [
    "Modern apartments under $500k",
    "3 bedroom houses in Miami",
    "Electric cars under $40k",
    "Luxury condos with pool"
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI Search</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Describe what you're looking for... (e.g., '2 bedroom apartment under $400k in New York')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isProcessing || !query.trim()}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">AI understood:</p>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((suggestion, index) => (
                <Badge key={index} variant="secondary">
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Recent searches:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((search) => (
                <button
                  key={search.id}
                  onClick={() => {
                    setQuery(search.query);
                    processAIQuery(search.query);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  "{search.query}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Search Suggestions */}
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Try these searches:</p>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(search);
                  processAIQuery(search);
                }}
                className="text-sm text-primary hover:underline"
              >
                "{search}"
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISearch;

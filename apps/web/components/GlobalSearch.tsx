'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, Target, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SearchResult {
  people: Array<{
    id: string;
    fullName: string;
    location?: string;
    relevance: number;
    connections: number;
  }>;
  goals: Array<{
    id: string;
    title: string;
    kind: string;
    relevance: number;
  }>;
  tags: Array<{
    tag: string;
    count: number;
    relevance: number;
  }>;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (type: string, id: string, label: string) => {
    setOpen(false);
    setQuery('');
    
    if (type === 'person') {
      router.push(`/people?highlight=${id}`);
    } else if (type === 'goal') {
      router.push(`/goals?highlight=${id}`);
    } else if (type === 'tag') {
      router.push(`/graph?tag=${encodeURIComponent(label)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-sm text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          Search people, goals, tags...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            ref={searchRef}
            placeholder="Search people, goals, tags..."
            value={query}
            onValueChange={setQuery}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Searching...' : 'No results found.'}
            </CommandEmpty>
            
            {results && (
              <>
                {results.people.length > 0 && (
                  <CommandGroup heading="People">
                    {results.people.slice(0, 3).map((person) => (
                      <CommandItem
                        key={person.id}
                        onSelect={() => handleSelect('person', person.id, person.fullName)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{person.fullName}</span>
                          {person.location && (
                            <Badge variant="secondary" className="text-xs">
                              {person.location}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{person.connections} connections</span>
                          <span>•</span>
                          <span>{person.relevance}% match</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.goals.length > 0 && (
                  <CommandGroup heading="Goals">
                    {results.goals.slice(0, 2).map((goal) => (
                      <CommandItem
                        key={goal.id}
                        onSelect={() => handleSelect('goal', goal.id, goal.title)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>{goal.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {goal.kind}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {goal.relevance}% match
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.tags.length > 0 && (
                  <CommandGroup heading="Tags">
                    {results.tags.slice(0, 3).map((tag) => (
                      <CommandItem
                        key={tag.tag}
                        onSelect={() => handleSelect('tag', tag.tag, tag.tag)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4" />
                          <span>{tag.tag}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{tag.count} people</span>
                          <span>•</span>
                          <span>{tag.relevance}% match</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

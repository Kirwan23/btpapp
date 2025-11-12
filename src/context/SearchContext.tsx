import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type SearchChantier = {
  id: number;
  name: string;
  location: string;
  status: string;
  cost?: string;
  url?: string;
};

export type SearchProspect = {
  id: number;
  name: string;
  project: string;
  status: string;
  email?: string;
  phone?: string;
};

interface SearchContextValue {
  query: string;
  setQuery: (value: string) => void;
  chantiers: SearchChantier[];
  prospects: SearchProspect[];
  registerChantiers: (items: SearchChantier[]) => void;
  registerProspects: (items: SearchProspect[]) => void;
  clear: () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [chantiers, setChantiers] = useState<SearchChantier[]>([]);
  const [prospects, setProspects] = useState<SearchProspect[]>([]);

  const registerChantiers = useCallback((items: SearchChantier[]) => {
    setChantiers(items);
  }, []);

  const registerProspects = useCallback((items: SearchProspect[]) => {
    setProspects(items);
  }, []);

  const clear = useCallback(() => {
    setQuery("");
  }, []);

  const value = useMemo(
    () => ({ query, setQuery, chantiers, prospects, registerChantiers, registerProspects, clear }),
    [query, chantiers, prospects, registerChantiers, registerProspects, clear],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }

  return context;
}

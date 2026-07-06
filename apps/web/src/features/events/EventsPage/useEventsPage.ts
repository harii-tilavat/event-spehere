import { useState } from "react";
import { useGetCategories, useGetEvents } from "@/api";
import { useDebounce } from "@/hooks/useDebounce";

const ALL_FILTER = "all";

export function useEventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(ALL_FILTER);
  const [city, setCity] = useState("");
  const debouncedSearch = useDebounce(search);
  const debouncedCity = useDebounce(city);

  const categoriesQuery = useGetCategories();
  const eventsQuery = useGetEvents({
    page,
    search: debouncedSearch || undefined,
    categoryId: categoryId === ALL_FILTER ? undefined : Number(categoryId),
    city: debouncedCity || undefined,
  });

  return {
    events: eventsQuery.data?.rows ?? [],
    meta: eventsQuery.data?.meta,
    isLoading: eventsQuery.isPending,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
    categories: categoriesQuery.data ?? [],
    search,
    categoryId,
    city,
    allFilter: ALL_FILTER,
    setPage,
    handleSearchChange: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    handleCategoryChange: (value: string) => {
      setCategoryId(value);
      setPage(1);
    },
    handleCityChange: (value: string) => {
      setCity(value);
      setPage(1);
    },
  };
}

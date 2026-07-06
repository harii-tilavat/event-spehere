import { useQuery } from "@tanstack/react-query";
import { getCall } from "@/api/core";
import { queryEndpoints } from "./endpoints";
import type { CategoriesResponse, GetCategoriesParams } from "./types";

export const useGetCategories = (params?: GetCategoriesParams) => {
  const { queryKey, url } = queryEndpoints.getCategories(params);
  return useQuery({
    queryKey,
    queryFn: () => getCall<CategoriesResponse>(url, params as Record<string, unknown> | undefined),
    select: (res) => res.data.data.categories,
  });
};

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = useMemo(() => {
    const paramsObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    return paramsObj;
  }, [searchParams]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      const newURL = `${window.location.pathname}?${newParams.toString()}`;
      router.push(newURL, { scroll: false });
    },
    [router, searchParams]
  );

  const setParams = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      const newURL = `${window.location.pathname}?${params.toString()}`;
      router.push(newURL, { scroll: false });
    },
    [router, searchParams]
  );

  const removeParam = useCallback(
    (key: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(key);
      const newURL = `${window.location.pathname}?${newParams.toString()}`;
      router.push(newURL, { scroll: false });
    },
    [router, searchParams]
  );

  const clearParams = useCallback(() => {
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  return {
    params,
    setParam,
    setParams,
    removeParam,
    clearParams,
    getParam: (key: string) => searchParams.get(key),
    hasParam: (key: string) => searchParams.has(key),
  };
}

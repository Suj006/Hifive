"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ApiState<T> {
  status: "loading" | "success" | "error";
  data: T | null;
  error: string | null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export function useApi<T>(url: string) {
  const [state, setState] = useState<ApiState<T>>(() => ({
    status: "loading",
    data: null,
    error: null,
  }));
  const cancelledRef = useRef(false);

  const refetch = useCallback(() => {
    cancelledRef.current = false;
    setState((s) => ({ ...s, status: "loading", error: null }));
    return fetchJson<T>(url).then(
      (data) => {
        if (!cancelledRef.current) setState({ status: "success", data, error: null });
      },
      (err) => {
        if (!cancelledRef.current)
          setState({
            status: "error",
            data: null,
            error: err instanceof Error ? err.message : "Something went wrong",
          });
      }
    );
  }, [url]);

  useEffect(() => {
    cancelledRef.current = false;
    fetchJson<T>(url).then(
      (data) => {
        if (!cancelledRef.current) setState({ status: "success", data, error: null });
      },
      (err) => {
        if (!cancelledRef.current)
          setState({
            status: "error",
            data: null,
            error: err instanceof Error ? err.message : "Something went wrong",
          });
      }
    );
    return () => {
      cancelledRef.current = true;
    };
  }, [url]);

  return {
    data: state.data,
    loading: state.status === "loading",
    error: state.error,
    refetch,
  };
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body as T;
}

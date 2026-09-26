"use client";

import type { CurrentUser } from "@watchnotes/shared";
import { useEffect, useState } from "react";
import { getSession } from "../api/auth.api";

export function useCurrentSession() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getSession()
      .then(({ user: currentUser }) => {
        if (isMounted) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    isLoading,
    setUser,
  };
}

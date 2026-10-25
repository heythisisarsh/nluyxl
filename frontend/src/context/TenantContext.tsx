"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_id: string;
  credits_used: number;
  credits_limit: number;
  member_count?: number;
  current_user_role?: string;
}

interface TenantContextType {
  currentOrg: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  switchOrg: (orgId: string) => void;
  createOrg: (name: string, plan_id?: string) => Promise<Organization>;
  refreshOrg: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgs = async () => {
    try {
      const res = await fetch("/api/orgs");
      if (res.ok) {
        const data: Organization[] = await res.json();
        setOrganizations(data);
        if (data.length > 0 && !currentOrg) {
          const savedOrgId = typeof window !== "undefined" ? localStorage.getItem("nluyxl_active_org") : null;
          const match = data.find((o) => o.id === savedOrgId) || data[0];
          setCurrentOrg(match);
        }
      }
    } catch (e) {
      console.error("Failed to load organizations:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const switchOrg = (orgId: string) => {
    const target = organizations.find((o) => o.id === orgId);
    if (target) {
      setCurrentOrg(target);
      if (typeof window !== "undefined") {
        localStorage.setItem("nluyxl_active_org", orgId);
      }
    }
  };

  const createOrg = async (name: string, plan_id: string = "free"): Promise<Organization> => {
    const res = await fetch("/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, plan_id }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to create organization");
    }
    const newOrg: Organization = await res.json();
    setOrganizations((prev) => [...prev, newOrg]);
    setCurrentOrg(newOrg);
    if (typeof window !== "undefined") {
      localStorage.setItem("nluyxl_active_org", newOrg.id);
    }
    return newOrg;
  };

  const refreshOrg = async () => {
    await fetchOrgs();
  };

  return (
    <TenantContext.Provider
      value={{
        currentOrg,
        organizations,
        isLoading,
        switchOrg,
        createOrg,
        refreshOrg,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

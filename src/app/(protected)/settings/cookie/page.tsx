"use client";

import { Heading } from "@/components/Heading";
import { useMemo, useState } from "react";
import { CookieCategoryData, CookiePreferencesState } from "@/types/cookie";
import { CookiePreferences } from "./_components/CookiePreferences";
import { CookieCategory } from "./_components/CookieCategory";
import { CookiePolicyInfo } from "./_components/CookiePolicyInfo";
import { useToast } from '@/hooks/use-toast';

const Page = () => {
  const { toast } = useToast();

  // Initial cookie categories data
  const [cookieCategories, setCookieCategories] = useState<
    CookieCategoryData[]
  >([
    {
      id: "essential",
      title: "Essential Cookies",
      description:
        "These cookies are required for core platform operations such as secure sign-in, access to pastoral tools, and protected administrative sessions.",
      isRequired: true,
      isEnabled: true,
      cookieCount: 4,
      cookies: [
        {
          name: "session_token",
          purpose:
            "Maintains secure login sessions for staff, ministry leaders, and administrators",
          duration: "Session (until browser closes)",
          type: "First-party",
          provider: "Pearl of the Orient",
        },
        {
          name: "csrf_token",
          purpose: "Protects forms and requests from cross-site attacks",
          duration: "Session",
          type: "First-party",
          provider: "Pearl of the Orient",
        },
        {
          name: "cookie_consent",
          purpose: "Stores your cookie consent and privacy preferences",
          duration: "1 year",
          type: "First-party",
          provider: "Pearl of the Orient",
        },
        {
          name: "security_hash",
          purpose:
            "Verifies secure connections when accessing member and chaplaincy records",
          duration: "Session",
          type: "First-party",
          provider: "Pearl of the Orient",
        },
      ],
    },
    {
      id: "functional",
      title: "Worship and Ministry Experience Cookies",
      description:
        "These cookies remember ministry workflow preferences so the platform can provide a more consistent seminary and chaplaincy experience.",
      isRequired: false,
      isEnabled: true,
      cookieCount: 3,
      cookies: [
        {
          name: "ministry_preferences",
          purpose:
            "Stores dashboard preferences such as language, layout, and ministry module defaults",
          duration: "1 year",
          type: "First-party",
          provider: "Pearl of the Orient",
        },
        {
          name: "pastoral_timezone",
          purpose:
            "Displays liturgy, visitation, and counseling schedules in your local timezone",
          duration: "6 months",
          type: "First-party",
          provider: "Pearl of the Orient",
        },
        {
          name: "worship_dashboard_config",
          purpose:
            "Remembers preferred dashboard widgets for announcements, prayer requests, and service planning",
          duration: "1 year",
          type: "First-party",
          provider: "Pearl of the Orient",
        },
      ],
    },
    {
      id: "analytics",
      title: "Ministry Insights Cookies",
      description:
        "These cookies help us understand how people use seminary and chaplaincy features so we can improve accessibility, guidance, and ministry workflows.",
      isRequired: false,
      isEnabled: false,
      cookieCount: 3,
      cookies: [
        {
          name: "_ga",
          purpose:
            "Distinguishes unique users to measure overall platform usage trends",
          duration: "2 years",
          type: "Third-party",
          provider: "Google Analytics",
        },
        {
          name: "_gid",
          purpose:
            "Tracks page-level engagement to identify which resources are most used",
          duration: "24 hours",
          type: "Third-party",
          provider: "Google Analytics",
        },
        {
          name: "ministry_analytics_session",
          purpose:
            "Measures session activity patterns to improve navigation across ministry tools",
          duration: "30 minutes",
          type: "First-party",
          provider: "Pearl of the Orient",
        },
      ],
    },
  ]);

  const [initialState, setInitialState] = useState<CookiePreferencesState>({
    essential: true,
    functional: true,
    analytics: false,
  });

  const getCurrentPreferencesState = (
    categories: CookieCategoryData[],
  ): CookiePreferencesState => ({
    essential:
      categories.find((category) => category.id === "essential")?.isEnabled ??
      true,
    functional:
      categories.find((category) => category.id === "functional")?.isEnabled ??
      false,
    analytics:
      categories.find((category) => category.id === "analytics")?.isEnabled ??
      false,
  });

  const hasChanges = useMemo(() => {
    const currentState = getCurrentPreferencesState(cookieCategories);
    return (
      currentState.functional !== initialState.functional ||
      currentState.analytics !== initialState.analytics
    );
  }, [cookieCategories, initialState]);

  const handleToggleCategory = (categoryId: string, enabled: boolean) => {
    setCookieCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isEnabled: enabled } : cat,
      ),
    );
  };

  const handleAcceptAll = () => {
    setCookieCategories((prev) =>
      prev.map((cat) => ({ ...cat, isEnabled: true })),
    );

    toast({
      title: "Preferences Saved",
      description: "All cookies have been enabled.",
    });

    // Update initial state
    setInitialState({
      essential: true,
      functional: true,
      analytics: true,
    });
  };

  const handleRejectAll = () => {
    setCookieCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        isEnabled: cat.isRequired ? true : false,
      })),
    );

    toast({
      title: "Preferences Saved",
      description:
        "Optional cookies have been disabled. Only essential cookies remain active.",
    });

    // Update initial state
    setInitialState({
      essential: true,
      functional: false,
      analytics: false,
    });
  };

  const handleSavePreferences = () => {
    // TODO: Save preferences to backend/localStorage
    const currentState = getCurrentPreferencesState(cookieCategories);

    setInitialState(currentState);

    toast({
      title: "Preferences Saved",
      description: "Your cookie preferences have been updated successfully.",
    });
  };

  return (
    <div>
      <Heading
        title="Cookie Settings"
        description="Manage how we use cookies to improve your experience on our platform."
      />

      <div className="space-y-6 mt-10">
        {/* Quick Actions */}
        <CookiePreferences
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onSavePreferences={handleSavePreferences}
          hasChanges={hasChanges}
        />

        {/* Cookie Categories */}
        <div className="space-y-6">
          {cookieCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              <CookieCategory
                title={category.title}
                description={category.description}
                isRequired={category.isRequired}
                isEnabled={category.isEnabled}
                onToggle={(enabled) =>
                  handleToggleCategory(category.id, enabled)
                }
                cookieCount={category.cookieCount}
                cookies={category.cookies}
              />
            </div>
          ))}
        </div>

        {/* Cookie Policy Information */}
        <CookiePolicyInfo />
      </div>
    </div>
  );
};

export default Page;

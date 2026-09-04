import React, { useMemo, useRef } from "react";
import type { AxiosError } from "axios";
import { AlertCircle, RefreshCw } from "lucide-react";

import { useTopics } from "./hooks/useTopics";
import { useUIStore } from "./store/uiStore";

import { AppLayout } from "./components/layout/AppLayout";
import { Header } from "./components/layout/Header";
import { SheetHeader } from "./components/sheet/SheetHeader";
import { SheetStats } from "./components/sheet/SheetStats";
import { SheetFilterBar } from "./components/sheet/SheetFilterBar";
import { Sheet } from "./components/sheet/Sheet";

import {
  StatsSkeleton,
  SheetSkeleton,
} from "./components/common/LoadingSkeleton";

import { TopicModals } from "./components/topic/TopicModals";
import { SubTopicModals } from "./components/subtopic/SubTopicModals";
import { QuestionModals } from "./components/question/QuestionModals";

const App: React.FC = () => {
  const {
    data: topics = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTopics();

  const { isQuestionSolved } = useUIStore();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute live sheet statistics
  const { totalQuestions, solvedQuestions, availablePlatforms } = useMemo(() => {
    let qCount = 0;
    let sCount = 0;

    const platforms = new Set<string>();

    topics.forEach((topic) => {
      (topic.subTopics || []).forEach((sub) => {
        (sub.questions || []).forEach((q) => {
          qCount++;

          if (isQuestionSolved(q.id)) {
            sCount++;
          }

          if (q.platform && q.platform.trim()) {
            platforms.add(q.platform.trim().toLowerCase());
          }
        });
      });
    });

    return {
      totalQuestions: qCount,
      solvedQuestions: sCount,
      availablePlatforms: Array.from(platforms).sort(),
    };
  }, [topics, isQuestionSolved]);

  const handleSearchFocus = () => {
    searchInputRef.current?.focus();
  };

  const getErrorMessage = (err: unknown): string => {
    const axiosError = err as AxiosError<{ message?: string }>;

    return (
      axiosError?.response?.data?.message ||
      axiosError?.message ||
      "Something went wrong while communicating with the server. Please check your connection and retry."
    );
  };

  return (
    <AppLayout>
      {/* Top Navigation Bar */}
      <Header
        totalQuestions={totalQuestions}
        solvedCount={solvedQuestions}
        onSearchFocus={handleSearchFocus}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SheetHeader />

        {isLoading ? (
          <>
            <StatsSkeleton />
            <SheetSkeleton />
          </>
        ) : isError ? (
          <div className="my-12 flex flex-col items-center justify-center p-8 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-center">
            <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Unable to load the sheet
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-5">
              {getErrorMessage(error)}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Fetching
            </button>
          </div>
        ) : (
          <>
            <SheetStats
              totalTopics={topics.length}
              totalQuestions={totalQuestions}
              solvedQuestions={solvedQuestions}
            />

            <SheetFilterBar
              topics={topics}
              searchRef={searchInputRef}
              availablePlatforms={availablePlatforms}
            />

            <Sheet topics={topics} />
          </>
        )}
      </main>

      {/* Global Modals for Topics, Sub-topics, and Questions */}
      <TopicModals />
      <SubTopicModals />
      <QuestionModals />
    </AppLayout>
  );
};

export default App;
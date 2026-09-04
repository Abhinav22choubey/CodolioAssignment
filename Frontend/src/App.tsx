import { useRef, useMemo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { AxiosError } from "axios";
import { useTopics } from "./hooks/useTopics";
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

export default function App() {
  const { data: topics = [], isLoading, isError, error, refetch } = useTopics();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute live admin statistics
  const {
    totalSubTopics,
    totalQuestions,
    easyCount,
    mediumCount,
    hardCount,
    availablePlatforms,
  } = useMemo(() => {
    let subCount = 0;
    let qCount = 0;
    let easy = 0;
    let med = 0;
    let hard = 0;
    const platforms = new Set<string>();

    topics.forEach((topic) => {
      const subs = topic.subTopics || [];
      subCount += subs.length;
      subs.forEach((sub) => {
        (sub.questions || []).forEach((q) => {
          qCount++;
          const diff = (q.difficulty || "").trim().toLowerCase();
          if (diff === "easy") easy++;
          else if (diff === "medium") med++;
          else if (diff === "hard") hard++;

          if (q.platform && q.platform.trim()) {
            platforms.add(q.platform.trim().toLowerCase());
          }
        });
      });
    });

    return {
      totalSubTopics: subCount,
      totalQuestions: qCount,
      easyCount: easy,
      mediumCount: med,
      hardCount: hard,
      availablePlatforms: Array.from(platforms).sort(),
    };
  }, [topics]);

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
        totalTopics={topics.length}
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Fetching
            </button>
          </div>
        ) : (
          <>
            <SheetStats
              totalTopics={topics.length}
              totalSubTopics={totalSubTopics}
              totalQuestions={totalQuestions}
              easyCount={easyCount}
              mediumCount={mediumCount}
              hardCount={hardCount}
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
}

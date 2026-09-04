
import { AlertCircle, RefreshCw } from "lucide-react";
import type { AxiosError } from "axios";

import { useTopics } from "./hooks/useTopics";

import { AppLayout } from "./components/layout/AppLayout";
import { Header } from "./components/layout/Header";
import { SheetHeader } from "./components/sheet/SheetHeader";
import { Sheet } from "./components/sheet/Sheet";

import {
  StatsSkeleton,
  SheetSkeleton,
} from "./components/common/LoadingSkeleton";

import { TopicModals } from "./components/topic/TopicModals";
import { SubTopicModals } from "./components/subtopic/SubTopicModals";
import { QuestionModals } from "./components/question/QuestionModals";

export default function App() {
  const {
    data: topics = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTopics();

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
      <Header
        totalTopics={topics.length}
      />

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
          <Sheet topics={topics} />
        )}
      </main>

      <TopicModals />
      <SubTopicModals />
      <QuestionModals />
    </AppLayout>
  );
}

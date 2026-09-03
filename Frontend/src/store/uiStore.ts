import { create } from "zustand";
import type { Topic, SubTopic, Question } from "../types/sheet";

export type ModalType =
  | "create-topic"
  | "edit-topic"
  | "delete-topic"
  | "create-subtopic"
  | "edit-subtopic"
  | "delete-subtopic"
  | "create-question"
  | "edit-question"
  | "delete-question";

export type DifficultyFilter = "ALL" | "Easy" | "Medium" | "Hard";
export type SolvedFilter = "ALL" | "SOLVED" | "UNSOLVED";

export interface ModalPayload {
  topic?: Topic;
  subTopic?: SubTopic;
  question?: Question;
  topicId?: string;
  subTopicId?: string;
}

interface UIState {
  // Expansion state
  expandedTopics: Record<string, boolean>;
  expandedSubTopics: Record<string, boolean>;

  // Search and filters
  searchQuery: string;
  difficultyFilter: DifficultyFilter;
  solvedFilter: SolvedFilter;
  platformFilter: string;

  // Solved state (client-side persisted)
  solvedQuestions: Record<string, boolean>;

  // Theme
  isDarkMode: boolean;

  // Modals
  activeModal: ModalType | null;
  modalPayload: ModalPayload | null;

  // Actions
  toggleTopic: (id: string) => void;
  toggleSubTopic: (id: string) => void;
  setTopicExpanded: (id: string, expanded: boolean) => void;
  setSubTopicExpanded: (id: string, expanded: boolean) => void;
  expandAll: (topics: Topic[]) => void;
  collapseAll: () => void;

  setSearchQuery: (query: string) => void;
  setDifficultyFilter: (diff: DifficultyFilter) => void;
  setSolvedFilter: (solved: SolvedFilter) => void;
  setPlatformFilter: (platform: string) => void;
  resetFilters: () => void;

  toggleQuestionSolved: (questionId: string) => void;
  isQuestionSolved: (questionId: string) => boolean;

  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;

  openModal: (type: ModalType, payload?: ModalPayload) => void;
  closeModal: () => void;
}

const STORAGE_KEY_SOLVED = "codolio_solved_questions_v1";
const STORAGE_KEY_THEME = "codolio_theme_preference";
const STORAGE_KEY_EXPANDED_TOPICS = "codolio_expanded_topics";
const STORAGE_KEY_EXPANDED_SUBTOPICS = "codolio_expanded_subtopics";

function getInitialSolved(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SOLVED);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function getInitialTheme(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved !== null) {
      return saved === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function getInitialExpandedTopics(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_EXPANDED_TOPICS);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function getInitialExpandedSubTopics(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_EXPANDED_SUBTOPICS);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export const useUIStore = create<UIState>((set, get) => {
  const initialDark = getInitialTheme();
  if (typeof document !== "undefined") {
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return {
    expandedTopics: getInitialExpandedTopics(),
    expandedSubTopics: getInitialExpandedSubTopics(),
    searchQuery: "",
    difficultyFilter: "ALL",
    solvedFilter: "ALL",
    platformFilter: "ALL",
    solvedQuestions: getInitialSolved(),
    isDarkMode: initialDark,
    activeModal: null,
    modalPayload: null,

    toggleTopic: (id: string) => {
      const next = {
        ...get().expandedTopics,
        [id]: !get().expandedTopics[id],
      };
      try {
        localStorage.setItem(STORAGE_KEY_EXPANDED_TOPICS, JSON.stringify(next));
      } catch {
        // ignore
      }
      set({ expandedTopics: next });
    },

    toggleSubTopic: (id: string) => {
      const next = {
        ...get().expandedSubTopics,
        [id]: !get().expandedSubTopics[id],
      };
      try {
        localStorage.setItem(STORAGE_KEY_EXPANDED_SUBTOPICS, JSON.stringify(next));
      } catch {
        // ignore
      }
      set({ expandedSubTopics: next });
    },

    setTopicExpanded: (id: string, expanded: boolean) => {
      const next = { ...get().expandedTopics, [id]: expanded };
      try {
        localStorage.setItem(STORAGE_KEY_EXPANDED_TOPICS, JSON.stringify(next));
      } catch {
        // ignore
      }
      set({ expandedTopics: next });
    },

    setSubTopicExpanded: (id: string, expanded: boolean) => {
      const next = { ...get().expandedSubTopics, [id]: expanded };
      try {
        localStorage.setItem(STORAGE_KEY_EXPANDED_SUBTOPICS, JSON.stringify(next));
      } catch {
        // ignore
      }
      set({ expandedSubTopics: next });
    },

    expandAll: (topics: Topic[]) => {
      const topicsMap: Record<string, boolean> = {};
      const subTopicsMap: Record<string, boolean> = {};

      topics.forEach((t) => {
        topicsMap[t.id] = true;
        t.subTopics?.forEach((s) => {
          subTopicsMap[s.id] = true;
        });
      });

      try {
        localStorage.setItem(STORAGE_KEY_EXPANDED_TOPICS, JSON.stringify(topicsMap));
        localStorage.setItem(STORAGE_KEY_EXPANDED_SUBTOPICS, JSON.stringify(subTopicsMap));
      } catch {
        // ignore
      }

      set({
        expandedTopics: topicsMap,
        expandedSubTopics: subTopicsMap,
      });
    },

    collapseAll: () => {
      try {
        localStorage.setItem(STORAGE_KEY_EXPANDED_TOPICS, JSON.stringify({}));
        localStorage.setItem(STORAGE_KEY_EXPANDED_SUBTOPICS, JSON.stringify({}));
      } catch {
        // ignore
      }
      set({
        expandedTopics: {},
        expandedSubTopics: {},
      });
    },

    setSearchQuery: (searchQuery: string) => set({ searchQuery }),
    setDifficultyFilter: (difficultyFilter: DifficultyFilter) => set({ difficultyFilter }),
    setSolvedFilter: (solvedFilter: SolvedFilter) => set({ solvedFilter }),
    setPlatformFilter: (platformFilter: string) => set({ platformFilter }),
    resetFilters: () =>
      set({
        searchQuery: "",
        difficultyFilter: "ALL",
        solvedFilter: "ALL",
        platformFilter: "ALL",
      }),

    toggleQuestionSolved: (questionId: string) => {
      const current = get().solvedQuestions;
      const updated = {
        ...current,
        [questionId]: !current[questionId],
      };
      try {
        localStorage.setItem(STORAGE_KEY_SOLVED, JSON.stringify(updated));
      } catch {
        // ignore
      }
      set({ solvedQuestions: updated });
    },

    isQuestionSolved: (questionId: string) => {
      return Boolean(get().solvedQuestions[questionId]);
    },

    toggleDarkMode: () => {
      const nextMode = !get().isDarkMode;
      if (typeof document !== "undefined") {
        if (nextMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      try {
        localStorage.setItem(STORAGE_KEY_THEME, nextMode ? "dark" : "light");
      } catch {
        // ignore
      }
      set({ isDarkMode: nextMode });
    },

    setDarkMode: (dark: boolean) => {
      if (typeof document !== "undefined") {
        if (dark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      try {
        localStorage.setItem(STORAGE_KEY_THEME, dark ? "dark" : "light");
      } catch {
        // ignore
      }
      set({ isDarkMode: dark });
    },

    openModal: (type: ModalType, payload: ModalPayload = {}) =>
      set({ activeModal: type, modalPayload: payload }),

    closeModal: () => set({ activeModal: null, modalPayload: null }),
  };
});


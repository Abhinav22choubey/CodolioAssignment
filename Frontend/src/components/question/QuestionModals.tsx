import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, ExternalLink, Video } from "lucide-react";
import type { AxiosError } from "axios";
import { Modal } from "../common/Modal";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useUIStore } from "../../store/uiStore";
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "../../hooks/useQuestions";
import type { Question } from "../../types/sheet";

function getErrorMessage(err: unknown, fallback: string): string {
  const axiosError = err as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || axiosError?.message || fallback;
}

function validateUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    new URL(url.trim());
    return true;
  } catch {
    return false;
  }
}

interface CreateQuestionFormProps {
  subTopicId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateQuestionForm = ({
  subTopicId,
  onSuccess,
  onCancel,
}: CreateQuestionFormProps) => {
  const createQuestionMutation = useCreateQuestion();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [platform, setPlatform] = useState<string>("leetcode");
  const [problemUrl, setProblemUrl] = useState<string>("");
  const [resource, setResource] = useState<string>("");
  const [titleError, setTitleError] = useState("");
  const [urlError, setUrlError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Question title is required");
      return;
    }

    if (!validateUrl(problemUrl)) {
      setUrlError("Please enter a valid problem URL (e.g. https://...)");
      return;
    }
    if (!validateUrl(resource)) {
      setUrlError("Please enter a valid resource URL (e.g. https://...)");
      return;
    }

    createQuestionMutation.mutate(
      {
        subTopicId,
        data: {
          title: trimmedTitle,
          difficulty: difficulty || null,
          platform: platform.trim() || null,
          problemUrl: problemUrl.trim() || null,
          resource: resource.trim() || null,
        },
      },
      {
        onSuccess: (newQ) => {
          toast.success(`Question "${newQ.title}" added successfully!`);
          onSuccess();
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to add question"));
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="create-q-title"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          Question Title *
        </label>
        <input
          id="create-q-title"
          type="text"
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError("");
          }}
          placeholder="e.g. Trapping Rain Water"
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
        />
        {titleError && <p className="mt-1.5 text-xs text-rose-500 font-medium">{titleError}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="create-q-diff"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            Difficulty
          </label>
          <select
            id="create-q-diff"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="create-q-platform"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            Platform
          </label>
          <input
            id="create-q-platform"
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g. leetcode, codestudio, gfg"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="create-q-url"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Problem URL
        </label>
        <input
          id="create-q-url"
          type="url"
          value={problemUrl}
          onChange={(e) => {
            setProblemUrl(e.target.value);
            if (urlError) setUrlError("");
          }}
          placeholder="https://leetcode.com/problems/..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
        />
      </div>

      <div>
        <label
          htmlFor="create-q-resource"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          <Video className="w-3.5 h-3.5" />
          Resource / Solution Video URL
        </label>
        <input
          id="create-q-resource"
          type="url"
          value={resource}
          onChange={(e) => {
            setResource(e.target.value);
            if (urlError) setUrlError("");
          }}
          placeholder="https://youtu.be/..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
        />
        {urlError && <p className="mt-1.5 text-xs text-rose-500 font-medium">{urlError}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createQuestionMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {createQuestionMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Add Question
        </button>
      </div>
    </form>
  );
};

interface EditQuestionFormProps {
  question: Question;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditQuestionForm = ({
  question,
  onSuccess,
  onCancel,
}: EditQuestionFormProps) => {
  const updateQuestionMutation = useUpdateQuestion();
  const [title, setTitle] = useState(question.title || "");
  const [difficulty, setDifficulty] = useState<string>(question.difficulty || "Medium");
  const [platform, setPlatform] = useState<string>(question.platform || "leetcode");
  const [problemUrl, setProblemUrl] = useState<string>(question.problemUrl || "");
  const [resource, setResource] = useState<string>(question.resource || "");
  const [titleError, setTitleError] = useState("");
  const [urlError, setUrlError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Question title is required");
      return;
    }

    if (!validateUrl(problemUrl)) {
      setUrlError("Please enter a valid problem URL (e.g. https://...)");
      return;
    }
    if (!validateUrl(resource)) {
      setUrlError("Please enter a valid resource URL (e.g. https://...)");
      return;
    }

    updateQuestionMutation.mutate(
      {
        id: question.id,
        data: {
          title: trimmedTitle,
          difficulty: difficulty || null,
          platform: platform.trim() || null,
          problemUrl: problemUrl.trim() || null,
          resource: resource.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Question updated successfully!");
          onSuccess();
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to update question"));
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="edit-q-title"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          Question Title *
        </label>
        <input
          id="edit-q-title"
          type="text"
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError("");
          }}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
        />
        {titleError && <p className="mt-1.5 text-xs text-rose-500 font-medium">{titleError}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="edit-q-diff"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            Difficulty
          </label>
          <select
            id="edit-q-diff"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="edit-q-platform"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            Platform
          </label>
          <input
            id="edit-q-platform"
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="edit-q-url"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Problem URL
        </label>
        <input
          id="edit-q-url"
          type="url"
          value={problemUrl}
          onChange={(e) => {
            setProblemUrl(e.target.value);
            if (urlError) setUrlError("");
          }}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
        />
      </div>

      <div>
        <label
          htmlFor="edit-q-resource"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          <Video className="w-3.5 h-3.5" />
          Resource / Solution Video URL
        </label>
        <input
          id="edit-q-resource"
          type="url"
          value={resource}
          onChange={(e) => {
            setResource(e.target.value);
            if (urlError) setUrlError("");
          }}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
        />
        {urlError && <p className="mt-1.5 text-xs text-rose-500 font-medium">{urlError}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateQuestionMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {updateQuestionMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
};

export const QuestionModals = () => {
  const { activeModal, modalPayload, closeModal } = useUIStore();
  const deleteQuestionMutation = useDeleteQuestion();

  const isCreateOpen = activeModal === "create-question";
  const isEditOpen = activeModal === "edit-question";
  const isDeleteOpen = activeModal === "delete-question";

  const subTopicId = modalPayload?.subTopicId || modalPayload?.subTopic?.id || "";

  const handleDelete = () => {
    if (!modalPayload?.question) return;

    deleteQuestionMutation.mutate(modalPayload.question.id, {
      onSuccess: () => {
        toast.success(`Question "${modalPayload.question?.title}" deleted`);
        closeModal();
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "Failed to delete question"));
      },
    });
  };

  return (
    <>
      {/* Create Question Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={closeModal}
        title="Add Coding Question"
        description="Add a new DSA problem with platform links and solution resources."
        maxWidth="lg"
      >
        {isCreateOpen && subTopicId && (
          <CreateQuestionForm
            subTopicId={subTopicId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        )}
      </Modal>

      {/* Edit Question Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeModal}
        title="Edit Question"
        description="Update problem details, difficulty, or reference links."
        maxWidth="lg"
      >
        {isEditOpen && modalPayload?.question && (
          <EditQuestionForm
            key={modalPayload.question.id}
            question={modalPayload.question}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        )}
      </Modal>

      {/* Delete Question Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={closeModal}
        onConfirm={handleDelete}
        isLoading={deleteQuestionMutation.isPending}
        title="Delete Question?"
        message={`Are you sure you want to delete "${modalPayload?.question?.title}"? This question will be permanently removed from your sheet.`}
        confirmText="Delete Question"
      />
    </>
  );
};


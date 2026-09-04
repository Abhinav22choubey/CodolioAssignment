import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { AxiosError } from "axios";
import { Modal } from "../common/Modal";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useUIStore } from "../../store/uiStore";
import {
  useCreateSubTopic,
  useUpdateSubTopic,
  useDeleteSubTopic,
} from "../../hooks/useSubTopics";
import type { SubTopic } from "../../types/sheet";

function getErrorMessage(err: unknown, fallback: string): string {
  const axiosError = err as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || axiosError?.message || fallback;
}

interface CreateSubTopicFormProps {
  topicId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateSubTopicForm = ({ topicId, onSuccess, onCancel }: CreateSubTopicFormProps) => {
  const createSubTopicMutation = useCreateSubTopic();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Sub-topic title is required");
      return;
    }
    if (trimmed.length > 80) {
      setError("Sub-topic title must be 80 characters or fewer");
      return;
    }

    createSubTopicMutation.mutate(
      { topicId, title: trimmed },
      {
        onSuccess: (newSubTopic) => {
          toast.success(`Sub-topic "${newSubTopic.title}" created successfully!`);
          onSuccess();
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to create sub-topic"));
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="create-subtopic-title"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          Sub-Topic Name *
        </label>
        <input
          id="create-subtopic-title"
          type="text"
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          placeholder="e.g. Prefix Sum & Sliding Window"
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all"
        />
        {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
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
          disabled={createSubTopicMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-lg shadow-sm shadow-orange-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {createSubTopicMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Add Sub-Topic
        </button>
      </div>
    </form>
  );
};

interface EditSubTopicFormProps {
  subTopic: SubTopic;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditSubTopicForm = ({ subTopic, onSuccess, onCancel }: EditSubTopicFormProps) => {
  const updateSubTopicMutation = useUpdateSubTopic();
  const [title, setTitle] = useState(subTopic.title);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Sub-topic title is required");
      return;
    }
    if (trimmed.length > 80) {
      setError("Sub-topic title must be 80 characters or fewer");
      return;
    }

    updateSubTopicMutation.mutate(
      { id: subTopic.id, title: trimmed },
      {
        onSuccess: () => {
          toast.success("Sub-topic updated successfully!");
          onSuccess();
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to update sub-topic"));
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="edit-subtopic-title"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          Sub-Topic Name *
        </label>
        <input
          id="edit-subtopic-title"
          type="text"
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all"
        />
        {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
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
          disabled={updateSubTopicMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-lg shadow-sm shadow-orange-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {updateSubTopicMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
};

export const SubTopicModals = () => {
  const { activeModal, modalPayload, closeModal } = useUIStore();
  const deleteSubTopicMutation = useDeleteSubTopic();

  const isCreateOpen = activeModal === "create-subtopic";
  const isEditOpen = activeModal === "edit-subtopic";
  const isDeleteOpen = activeModal === "delete-subtopic";

  const topicId = modalPayload?.topicId || modalPayload?.topic?.id || "";

  const handleDelete = () => {
    if (!modalPayload?.subTopic) return;

    deleteSubTopicMutation.mutate(modalPayload.subTopic.id, {
      onSuccess: () => {
        toast.success(`Sub-topic "${modalPayload.subTopic?.title}" deleted`);
        closeModal();
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "Failed to delete sub-topic"));
      },
    });
  };

  return (
    <>
      {/* Create Sub-Topic Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={closeModal}
        title="Add Sub-Topic"
        description="Organize questions inside a specific sub-group (e.g. Kadane's Algorithm, Two Pointer)."
      >
        {isCreateOpen && topicId && (
          <CreateSubTopicForm
            topicId={topicId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        )}
      </Modal>

      {/* Edit Sub-Topic Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeModal}
        title="Edit Sub-Topic"
        description="Rename this sub-topic."
      >
        {isEditOpen && modalPayload?.subTopic && (
          <EditSubTopicForm
            key={modalPayload.subTopic.id}
            subTopic={modalPayload.subTopic}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        )}
      </Modal>

      {/* Delete Sub-Topic Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={closeModal}
        onConfirm={handleDelete}
        isLoading={deleteSubTopicMutation.isPending}
        title="Delete Sub-Topic?"
        message={`Are you sure you want to delete "${modalPayload?.subTopic?.title}"? All questions organized under this sub-topic will also be deleted.`}
        confirmText="Delete Sub-Topic"
      />
    </>
  );
};

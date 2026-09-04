import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { AxiosError } from "axios";
import { Modal } from "../common/Modal";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useUIStore } from "../../store/uiStore";
import {
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
} from "../../hooks/useTopics";
import type { Topic } from "../../types/sheet";

function getErrorMessage(err: unknown, fallback: string): string {
  const axiosError = err as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || axiosError?.message || fallback;
}

interface CreateTopicFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateTopicForm = ({ onSuccess, onCancel }: CreateTopicFormProps) => {
  const createTopicMutation = useCreateTopic();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Topic title is required");
      return;
    }
    if (trimmed.length > 80) {
      setError("Topic title must be 80 characters or fewer");
      return;
    }

    createTopicMutation.mutate(trimmed, {
      onSuccess: (newTopic) => {
        toast.success(`Topic "${newTopic.title}" created successfully!`);
        onSuccess();
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "Failed to create topic"));
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="create-topic-title"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          Topic Name *
        </label>
        <input
          id="create-topic-title"
          type="text"
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          placeholder="e.g. Binary Search Trees"
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
          disabled={createTopicMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-lg shadow-sm shadow-orange-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {createTopicMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Topic
        </button>
      </div>
    </form>
  );
};

interface EditTopicFormProps {
  topic: Topic;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditTopicForm = ({ topic, onSuccess, onCancel }: EditTopicFormProps) => {
  const updateTopicMutation = useUpdateTopic();
  const [title, setTitle] = useState(topic.title);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Topic title is required");
      return;
    }
    if (trimmed.length > 80) {
      setError("Topic title must be 80 characters or fewer");
      return;
    }

    updateTopicMutation.mutate(
      { id: topic.id, title: trimmed },
      {
        onSuccess: () => {
          toast.success("Topic updated successfully!");
          onSuccess();
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to update topic"));
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="edit-topic-title"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          Topic Name *
        </label>
        <input
          id="edit-topic-title"
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
          disabled={updateTopicMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-lg shadow-sm shadow-orange-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {updateTopicMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
};

export const TopicModals = () => {
  const { activeModal, modalPayload, closeModal } = useUIStore();
  const deleteTopicMutation = useDeleteTopic();

  const isCreateOpen = activeModal === "create-topic";
  const isEditOpen = activeModal === "edit-topic";
  const isDeleteOpen = activeModal === "delete-topic";

  const handleDelete = () => {
    if (!modalPayload?.topic) return;

    deleteTopicMutation.mutate(modalPayload.topic.id, {
      onSuccess: () => {
        toast.success(`Topic "${modalPayload.topic?.title}" deleted`);
        closeModal();
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "Failed to delete topic"));
      },
    });
  };

  return (
    <>
      {/* Create Topic Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={closeModal}
        title="Create New Topic"
        description="Add a top-level category for your problem curriculum (e.g. Dynamic Programming, Graphs)."
      >
        {isCreateOpen && (
          <CreateTopicForm onSuccess={closeModal} onCancel={closeModal} />
        )}
      </Modal>

      {/* Edit Topic Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeModal}
        title="Edit Topic"
        description="Rename this topic category."
      >
        {isEditOpen && modalPayload?.topic && (
          <EditTopicForm
            key={modalPayload.topic.id}
            topic={modalPayload.topic}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        )}
      </Modal>

      {/* Delete Topic Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={closeModal}
        onConfirm={handleDelete}
        isLoading={deleteTopicMutation.isPending}
        title="Delete Topic?"
        message={`Are you sure you want to delete "${modalPayload?.topic?.title}"? This action cannot be undone and will permanently delete all of its sub-topics and questions.`}
        confirmText="Delete Topic"
      />
    </>
  );
};

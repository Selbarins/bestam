const KEY = "bestam-offline-queue";

export type QueuedExpense = {
  id: string;
  amount: number;
  category_id: string | null;
  note: string | null;
  createdAt: string;
};

export function getQueue(): QueuedExpense[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as QueuedExpense[];
  } catch {
    return [];
  }
}

function saveQueue(items: QueuedExpense[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function enqueueExpense(
  item: Omit<QueuedExpense, "id" | "createdAt">
) {
  const queue = getQueue();
  queue.push({
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  saveQueue(queue);
  return queue.length;
}

export function clearQueue() {
  saveQueue([]);
}

export function removeFromQueue(id: string) {
  saveQueue(getQueue().filter((q) => q.id !== id));
}

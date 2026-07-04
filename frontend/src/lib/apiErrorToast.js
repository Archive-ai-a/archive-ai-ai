import { toast } from "sonner";

export function apiErrorToast(err, fallback = "Failed") {
  toast.error(err?.response?.data?.detail || fallback);
}

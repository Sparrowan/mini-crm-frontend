import { format } from "date-fns";

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), "MMMM dd, yyyy h:mm a");
};

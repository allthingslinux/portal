export type Notification = {
  id: number;
  body: string;
  dismissed: boolean;
  type: "info" | "warning" | "error";
  created_at: string;
  link: string | null;
};

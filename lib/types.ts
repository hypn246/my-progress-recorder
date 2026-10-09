export type RecordRow = {
  id: number;
  check_in: string;
  check_out: string | null;
};

export type Settings = {
  start_date: string;
  target_date: string;
  target_hours: number;
};

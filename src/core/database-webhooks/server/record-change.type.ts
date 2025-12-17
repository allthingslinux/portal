export type Tables = Record<
  string,
  {
    Row: Record<string, unknown>;
  }
>;

export type TableChangeType = "INSERT" | "UPDATE" | "DELETE";

export type RecordChange<
  Table extends keyof Tables,
  Row = Tables[Table]["Row"],
> = {
  type: TableChangeType;
  table: Table;
  record: Row;
  schema: "public";
  old_record: null | Row;
};

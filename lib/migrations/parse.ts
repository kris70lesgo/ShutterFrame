export function isPostgresMigration(filename: string) {
  return filename.endsWith(".sql") && !filename.includes("/");
}

export function countSqlStatements(sql: string) {
  return sql
    .split(";")
    .map((statement) => statement.replace(/--.*$/gm, "").trim())
    .filter(Boolean).length;
}

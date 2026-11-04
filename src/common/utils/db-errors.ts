type PgLikeError = { code?: string; driverError?: { code?: string } };

const codeOf = (err: unknown) => (err as PgLikeError)?.code ?? (err as PgLikeError)?.driverError?.code;

/** PostgreSQL 23505: unique_violation */
export const isUniqueViolation = (err: unknown) => codeOf(err) === '23505';

/** PostgreSQL 23503: foreign_key_violation */
export const isForeignKeyViolation = (err: unknown) => codeOf(err) === '23503';

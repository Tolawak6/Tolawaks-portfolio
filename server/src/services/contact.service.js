import { query } from '../db/pool.js';

const MESSAGE_COLUMNS = `
  id,
  name,
  email,
  subject,
  message,
  created_at AS "createdAt"
`;

export async function createMessage({ name, email, subject, message }) {
  const { rows } = await query(
    `INSERT INTO contact_messages (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING ${MESSAGE_COLUMNS}`,
    [name, email, subject, message],
  );

  const saved = rows[0];
  // Swap this for an email/CRM notification when you are ready - the message is
  // already persisted, so nothing is lost if this line is removed.
  console.log(`[contact] new message #${saved.id} from ${saved.email}`);
  return saved;
}

export async function findAllMessages({ limit = 100 } = {}) {
  const { rows } = await query(
    `SELECT ${MESSAGE_COLUMNS} FROM contact_messages ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  return rows;
}

-- =============================================================
--  Portfolio database schema
--  Safe to run repeatedly: every statement is idempotent.
--  Run with:  npm run db:migrate
-- =============================================================

-- Keeps `updated_at` honest without relying on the application to remember.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------
--  projects
--  The single source of truth for the Projects section.
--  Nothing about a project is hardcoded in the React app.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  image       TEXT         NOT NULL DEFAULT '',
  link        TEXT         NOT NULL DEFAULT '',
  description TEXT         NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT projects_name_not_blank        CHECK (length(btrim(name)) > 0),
  CONSTRAINT projects_description_not_blank CHECK (length(btrim(description)) > 0),
  CONSTRAINT projects_name_length           CHECK (length(name) <= 150)
);

-- Stores the storage provider's identifier for an uploaded image, so that
-- replacing or deleting a project can clean up the asset it left behind.
-- Empty for projects whose image is a pasted URL, which we never delete.
-- Added separately from CREATE TABLE so existing databases pick it up too.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS image_public_id TEXT NOT NULL DEFAULT '';

COMMENT ON TABLE  projects             IS 'Portfolio projects rendered by the frontend Projects section.';
COMMENT ON COLUMN projects.image       IS 'Image URL (absolute https:// or site-relative /path). May be empty.';
COMMENT ON COLUMN projects.image_public_id IS 'Storage asset id for images uploaded through the admin dashboard. Empty for externally hosted images.';
COMMENT ON COLUMN projects.link        IS 'Live project or repository URL. May be empty.';
COMMENT ON COLUMN projects.description IS 'Short description shown on the project card.';

CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects (created_at DESC);

DROP TRIGGER IF EXISTS projects_set_updated_at ON projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- -------------------------------------------------------------
--  contact_messages
--  Contact form submissions are stored so they are never silently lost.
--  Swap notifyNewMessage() for an email/CRM integration later if you like.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(254) NOT NULL,
  subject    VARCHAR(200),
  message    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT contact_messages_name_not_blank    CHECK (length(btrim(name)) > 0),
  CONSTRAINT contact_messages_message_not_blank CHECK (length(btrim(message)) > 0)
);

COMMENT ON TABLE contact_messages IS 'Messages submitted through the portfolio contact form.';

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON contact_messages (created_at DESC);

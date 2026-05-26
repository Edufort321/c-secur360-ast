-- Migration 049: Module To-Do / Tâches
-- Tables: todo_tasks (tâches) + todo_steps (étapes/checklist)
-- Storage: créer manuellement le bucket 'todo-attachments' (public) dans Supabase > Storage

CREATE TABLE IF NOT EXISTS todo_tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT        NOT NULL,
  title        TEXT        NOT NULL DEFAULT '',
  description  TEXT        NOT NULL DEFAULT '',
  status       TEXT        NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo','in_progress','blocked','done','archived')),
  priority     TEXT        NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('urgent','high','normal','low')),
  assignee     TEXT        NOT NULL DEFAULT '',
  site         TEXT        NOT NULL DEFAULT '',
  due_date     DATE,
  photo_urls   JSONB       NOT NULL DEFAULT '[]',
  steps_total  INT         NOT NULL DEFAULT 0,
  steps_done   INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_todo_tasks_tenant  ON todo_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_status  ON todo_tasks(tenant_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS todo_steps (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID        NOT NULL REFERENCES todo_tasks(id) ON DELETE CASCADE,
  tenant_id   TEXT        NOT NULL,
  label       TEXT        NOT NULL DEFAULT '',
  done        BOOLEAN     NOT NULL DEFAULT false,
  assignee    TEXT        NOT NULL DEFAULT '',
  order_index INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_todo_steps_task ON todo_steps(task_id);

ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_todo_tasks" ON todo_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_todo_steps" ON todo_steps FOR ALL USING (true) WITH CHECK (true);

import { sql as dbSql } from "./client.js";

export const ensureProjectTables = async () => {
  const existingProjectTables = await dbSql`
    select table_name
    from information_schema.tables
    where table_schema = current_schema()
      and table_name in ('sql_projects', 'er_projects', 'project_collaborators', 'project_shares')
  `;

  const tableNames = new Set(existingProjectTables.map((row) => row.table_name));

  if (!tableNames.has("sql_projects")) {
    await dbSql`
      create table sql_projects (
        id uuid primary key default gen_random_uuid(),
        user_id text not null references "user"(id) on delete cascade,
        name varchar(150) not null,
        sql text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;
  }

  if (!tableNames.has("er_projects")) {
    await dbSql`
      create table er_projects (
        id uuid primary key default gen_random_uuid(),
        user_id text not null references "user"(id) on delete cascade,
        name varchar(150) not null,
        er_json text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;
  }

  if (!tableNames.has("project_collaborators")) {
    await dbSql`
      create table project_collaborators (
        id uuid primary key default gen_random_uuid(),
        project_type varchar(16) not null,
        project_id uuid not null,
        owner_user_id text not null references "user"(id) on delete cascade,
        collaborator_user_id text references "user"(id) on delete set null,
        collaborator_email varchar(320) not null,
        permission varchar(16) not null default 'can_view',
        status varchar(16) not null default 'pending',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;
  }

  if (!tableNames.has("project_shares")) {
    await dbSql`
      create table project_shares (
        id uuid primary key default gen_random_uuid(),
        project_type varchar(16) not null,
        project_id uuid not null,
        owner_user_id text not null references "user"(id) on delete cascade,
        public_access varchar(16) not null default 'private',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;
  }

  const legacyProjectsExists = await dbSql`
    select exists (
      select 1
      from information_schema.tables
      where table_schema = current_schema()
        and table_name = 'projects'
    ) as exists
  `;

  if (!legacyProjectsExists[0]?.exists) {
    return;
  }

  await dbSql`
    insert into sql_projects (id, user_id, name, sql, created_at, updated_at)
    select id, user_id, name, sql, created_at, updated_at
    from projects
    where coalesce(project_type, 'sql') = 'sql'
      and sql is not null
      and btrim(sql) <> ''
    on conflict (id) do nothing
  `;

  await dbSql`
    insert into er_projects (id, user_id, name, er_json, created_at, updated_at)
    select id, user_id, name, er_json, created_at, updated_at
    from projects
    where coalesce(project_type, 'sql') = 'er'
      and er_json is not null
      and btrim(er_json) <> ''
    on conflict (id) do nothing
  `;
};

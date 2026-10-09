create table if not exists users (
  id serial primary key,
  username text unique not null,
  password text not null
);

create table if not exists settings (
  user_id int primary key references users(id) on delete cascade,
  start_date date not null,
  target_date date not null,
  target_hours numeric not null
);

create table if not exists records (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  check_in timestamptz not null,
  check_out timestamptz
);

create index if not exists records_user_check_in on records (user_id, check_in desc);

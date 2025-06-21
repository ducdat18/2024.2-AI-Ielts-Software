-- 1. Create & select database
-- CREATE DATABASE ielts
--   WITH
--     TEMPLATE   = template0
--     ENCODING   = 'UTF8'
--     LC_COLLATE = 'en_US.UTF-8'
--     LC_CTYPE   = 'en_US.UTF-8';

-- \c ielts

-- 2. Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Core tables

CREATE TABLE users (
  user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  date_of_birth   DATE,
  country         VARCHAR(100),
  registration_date DATE,
  last_login      TIMESTAMP WITHOUT TIME ZONE,
  user_role       varchar(10) NOT NULL DEFAULT 'user' CHECK(user_role IN ('user', 'admin')),
  profile_image_path VARCHAR(255) DEFAULT NULL
);

-- Add the only admin account
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    date_of_birth,
    country,
    registration_date,
    last_login,
    user_role
)
VALUES (
    'admin@example.com',
    'JAvlGPq9JyTdtvBO6x2llnRI1+gxwIyPqCKAn3THIKk=', -- SHA256 hash for 'admin123'
    'Admin',
    'User',
    CURRENT_DATE,
    'System',
    CURRENT_DATE,
    CURRENT_TIMESTAMP,
    'admin'
);
-- Add a constraint to ensure only one admin exists:
CREATE UNIQUE INDEX single_admin
ON users ((CASE WHEN user_role = 'admin' THEN 1 ELSE null END));

CREATE TABLE test_types (
  test_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         varchar(10) NOT NULL CHECK(name IN ('Reading', 'Listening', 'Writing', 'Speaking')),
  description  TEXT,
  time_limit   INT NOT NULL,     -- minutes
  total_marks  INT NOT NULL,
  instructions TEXT
);

INSERT INTO test_types (name, description, time_limit, total_marks, instructions)
VALUES ('Reading', 'Reading test', 60, 40, 'Read the passage and answer the questions.');

INSERT INTO test_types (name, description, time_limit, total_marks, instructions)
VALUES ('Listening', 'Listening test', 30, 40, 'Listen to the audio and answer the questions.');

INSERT INTO test_types (name, description, time_limit, total_marks, instructions)
VALUES ('Writing', 'Writing test', 60, 0, 'Write a paragraph to meet the requirements of the prompt.');

INSERT INTO test_types (name, description, time_limit, total_marks, instructions)
VALUES ('Speaking', 'Speaking test', 15, 0, 'Read the question and speak into the microphone.');

CREATE TABLE tests (
  test_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name          VARCHAR(255) NOT NULL,
  test_type_id       UUID NOT NULL REFERENCES test_types(test_type_id)
                       ON UPDATE CASCADE ON DELETE CASCADE,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  creation_date      TIMESTAMP WITHOUT TIME ZONE,
  last_updated_date  TIMESTAMP WITHOUT TIME ZONE,
  audio_path   VARCHAR(255) DEFAULT NULL -- only for listening tests
);

CREATE TABLE test_parts (
  part_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id    UUID NOT NULL REFERENCES tests(test_id)
               ON UPDATE CASCADE ON DELETE CASCADE,
  part_number INT NOT NULL,
  title       TEXT,
  description TEXT,
  content     TEXT NOT NULL,
  image_path  VARCHAR(255) DEFAULT NULL
);

CREATE TABLE sections (
  section_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id        UUID NOT NULL REFERENCES test_parts(part_id)
                   ON UPDATE CASCADE ON DELETE CASCADE,
  section_number INT NOT NULL,
  instructions    TEXT NOT NULL,
  content   TEXT   DEFAULT NULL,
  question_type  VARCHAR(100),
  image_path     VARCHAR(255) DEFAULT NULL
);

CREATE TABLE questions (
  question_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      UUID NOT NULL REFERENCES sections(section_id)
                     ON UPDATE CASCADE ON DELETE CASCADE,
  question_number INT   NOT NULL,
  content         JSONB  NOT NULL,
  marks           INT   NOT NULL DEFAULT 1
);

CREATE TABLE answers (
  answer_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id        UUID UNIQUE NOT NULL REFERENCES questions(question_id)
                       ON UPDATE CASCADE ON DELETE CASCADE,
  correct_answer     TEXT NOT NULL,
  explanation        TEXT,
  alternative_answers TEXT
);

CREATE TABLE user_tests (
  user_test_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(user_id)
                       ON UPDATE CASCADE ON DELETE CASCADE,
  test_id           UUID NOT NULL REFERENCES tests(test_id)
                       ON UPDATE CASCADE ON DELETE CASCADE,
  start_time        TIMESTAMP WITHOUT TIME ZONE,
  end_time          TIMESTAMP WITHOUT TIME ZONE,
  status            varchar(20) NOT NULL DEFAULT 'in progress' CHECK(status IN ('in progress', 'abandoned', 'completed')),
  num_correct_answer INT NOT NULL DEFAULT 0,
  feedback          TEXT
);

CREATE TABLE user_responses (
  response_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_test_id    UUID NOT NULL REFERENCES user_tests(user_test_id)
                     ON UPDATE CASCADE ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES questions(question_id)
                     ON UPDATE CASCADE ON DELETE CASCADE,
  user_answer     TEXT NOT NULL,
  marks_awarded   INT DEFAULT 0
);

-- CREATE TABLE writing_responses (
--   writing_response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_test_id        UUID NOT NULL REFERENCES user_tests(user_test_id)
--                          ON UPDATE CASCADE ON DELETE CASCADE,
--   question_id         UUID NOT NULL REFERENCES questions(question_id)
--                          ON UPDATE CASCADE ON DELETE CASCADE,
--   response_text       TEXT,
--   submission_time     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
--   word_count          INT,
--   overall_score         NUMERIC(4,2)
-- );




-- CREATE TABLE speaking_responses (
--   assessment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_test_id       UUID NOT NULL REFERENCES user_tests(user_test_id)
--                          ON UPDATE CASCADE ON DELETE CASCADE,
--   duration           INT,  -- seconds
--   recording_path     TEXT,
--   overall_score      NUMERIC(4,2),
--   feedback           TEXT
-- );

-- CREATE TABLE user_progress (
--   progress_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id       UUID NOT NULL REFERENCES users(user_id)
--                    ON UPDATE CASCADE ON DELETE CASCADE,
--   skill_type    test_type_enum,
--   weak_areas    JSONB,
--   strong_areas  JSONB,
--   average_score NUMERIC(4,2),
--   total_tests_taken INT DEFAULT 0,
--   last_updated  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
-- );

-- CREATE TABLE study_materials (
--   material_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   title          VARCHAR(255) NOT NULL,
--   description    TEXT,
--   content        TEXT,
--   skill_type     test_type_enum,
--   difficulty_level VARCHAR(50),
--   upload_date    DATE NOT NULL DEFAULT CURRENT_DATE,
--   views_count    INT NOT NULL DEFAULT 0
-- );

-- CREATE TABLE practice_schedules (
--   schedule_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id          UUID NOT NULL UNIQUE REFERENCES users(user_id)
--                        ON UPDATE CASCADE ON DELETE CASCADE,
--   title            VARCHAR(255),
--   description      TEXT,
--   start_date       DATE,
--   target_band_score NUMERIC(4,2),
--   real_test_date   DATE,
--   is_active        BOOLEAN NOT NULL DEFAULT TRUE
-- );

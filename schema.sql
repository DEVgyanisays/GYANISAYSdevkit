-- =====================================================================================
-- Saarthi by Gyani Says (SETU coach app + Saarthi training) — MySQL schema
-- kit v0.1 · matches Prototype/GYS_Coach_Platform_Rig_v0.3.html · 16 Oct 2026
-- Source of truth for meaning: data-model.md (same kit). Regenerate from it, never edit apart.
--
-- Conventions
--  * MySQL 8.0+, InnoDB, utf8mb4. snake_case. Plural table names.
--  * Ids: BIGINT UNSIGNED AUTO_INCREMENT owned by Saarthi. Aarambh's ids (personId, sittingId,
--    bookingId) are stored as *_ref VARCHAR(40) external references — never as our keys.
--  * Datetimes are DATETIME in UTC. The UI shows Asia/Kolkata. Dates (DATE) are India calendar dates.
--  * Money = amount_minor INT (integer minor units) + currency CHAR(3). Money lives ONLY in the
--    tables marked [MONEY] — Finance admin only; the API leaves these out for every other role.
--  * [PERSONAL] marks personal data. [PRIVATE] marks coach-only text no other role may read.
--  * Nothing is hard-deleted except the reading cache (aarambh_* tables, deleted when the debrief
--    closes plus the audit window). Everything else is soft: state columns, closed_at, ended_at.
--  * Every admin write is refused without a reason and is written to activity_log (append-only).
--  * Foreign keys use the default RESTRICT, except the reading cache children (CASCADE from
--    aarambh_readings so one delete clears a sitting).
-- =====================================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================================
-- 1 · PEOPLE & ACCESS
-- =====================================================================================

CREATE TABLE users (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name         VARCHAR(120) NOT NULL,                 -- [PERSONAL]
  first_name        VARCHAR(60)  NOT NULL,                 -- [PERSONAL] greeting
  email             VARCHAR(254) NULL,                     -- [PERSONAL] phone or email required
  phone             VARCHAR(20)  NULL,                     -- [PERSONAL] E.164
  state             ENUM('invited','active','suspended','deactivated') NOT NULL DEFAULT 'invited',
  password_hash     VARCHAR(255) NULL,                     -- set ONLY by the person via an emailed link; never readable or settable by any admin endpoint
  session_version   INT UNSIGNED NOT NULL DEFAULT 1,       -- bumped on role change / suspend: forces re-login
  invited_at        DATETIME NULL,
  last_sign_in_at   DATETIME NULL,
  deactivated_at    DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone),
  KEY idx_users_state (state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE roles (
  role              ENUM('admin','finance_admin','faculty','mentor','coach_ours','coach_org','aarambh_reviewer') NOT NULL PRIMARY KEY,
  label             VARCHAR(60) NOT NULL,
  may_open          VARCHAR(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_roles (
  user_id           BIGINT UNSIGNED NOT NULL,
  role              ENUM('admin','finance_admin','faculty','mentor','coach_ours','coach_org','aarambh_reviewer') NOT NULL,
  granted_by        BIGINT UNSIGNED NULL,
  granted_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role) REFERENCES roles(role),
  CONSTRAINT fk_user_roles_by   FOREIGN KEY (granted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE password_reset_tokens (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL,
  token_hash        CHAR(64) NOT NULL,                     -- SHA-256 of the single-use token; the token itself is never stored
  expires_at        DATETIME NOT NULL,
  used_at           DATETIME NULL,
  requested_by      BIGINT UNSIGNED NULL,                  -- admin who sent the link (never sees the token)
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prt_hash (token_hash),
  KEY idx_prt_user (user_id),
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_prt_by   FOREIGN KEY (requested_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE languages (
  code              VARCHAR(10) NOT NULL PRIMARY KEY,      -- ISO 639-1
  name              VARCHAR(40) NOT NULL,
  sort_order        TINYINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_languages (
  user_id           BIGINT UNSIGNED NOT NULL,
  language_code     VARCHAR(10) NOT NULL,
  proficiency       ENUM('primary','secondary','other') NOT NULL,
  PRIMARY KEY (user_id, language_code),
  KEY idx_ul_lang (language_code, proficiency),
  CONSTRAINT fk_ul_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_ul_lang FOREIGN KEY (language_code) REFERENCES languages(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_profiles (
  user_id             BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  city                VARCHAR(60)  NULL,                   -- [PERSONAL]
  years_of_work       TINYINT UNSIGNED NULL,
  current_work        VARCHAR(200) NULL,                   -- [PERSONAL]
  experience_text     TEXT NULL,                           -- [PERSONAL]
  qualifications_text TEXT NULL,                           -- [PERSONAL]
  photo_file_id       BIGINT UNSIGNED NULL,                -- [PERSONAL] not public until a card is approved
  bio                 VARCHAR(400) NULL,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_up_user  FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_up_photo FOREIGN KEY (photo_file_id) REFERENCES files(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE files (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  owner_user_id     BIGINT UNSIGNED NULL,                  -- NULL for a public applicant's CV until enrolment
  kind              ENUM('cv','photo','credential_pdf') NOT NULL,
  mime              VARCHAR(60) NOT NULL,
  bytes             INT UNSIGNED NOT NULL,
  storage_key       VARCHAR(255) NOT NULL,                 -- [PERSONAL] private object store key; never a public URL
  scanned_at        DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_files_owner (owner_user_id),
  CONSTRAINT fk_files_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE undertaking_versions (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  version           VARCHAR(10) NOT NULL,
  published_on      DATE NOT NULL,
  owner_label       VARCHAR(80) NOT NULL,
  body              JSON NOT NULL,                         -- the parts, in order
  is_current        TINYINT(1) NOT NULL DEFAULT 0,          -- exactly one row is current (enforced in publish)
  published_by      BIGINT UNSIGNED NULL,
  UNIQUE KEY uq_uv_version (version),
  CONSTRAINT fk_uv_by FOREIGN KEY (published_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE undertaking_signatures (
  id                     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id                BIGINT UNSIGNED NOT NULL,
  undertaking_version_id BIGINT UNSIGNED NOT NULL,
  coach_type             ENUM('ours','org') NULL,          -- NULL for faculty / mentors
  organisation_id        BIGINT UNSIGNED NULL,             -- the appointing organisation for coach_type 'org'
  signed_at              DATETIME NOT NULL,                -- server time only
  access_state           ENUM('open','closed_unsigned','ended') NOT NULL DEFAULT 'open',  -- THE GATE: no 'open' row at the current version = no reading, no coach copy, no opened list
  ended_at               DATETIME NULL,
  end_reason             TEXT NULL,
  UNIQUE KEY uq_us_user_version (user_id, undertaking_version_id),
  KEY idx_us_state (access_state),
  CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_us_ver  FOREIGN KEY (undertaking_version_id) REFERENCES undertaking_versions(id),
  CONSTRAINT fk_us_org  FOREIGN KEY (organisation_id) REFERENCES organisations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE code_versions (
  version           VARCHAR(10) NOT NULL PRIMARY KEY,
  published_on      DATE NOT NULL,
  what_changed      TEXT NULL,
  body_ref          VARCHAR(255) NOT NULL,
  is_current        TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE code_signatures (
  id                     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id                BIGINT UNSIGNED NOT NULL,
  code_version           VARCHAR(10) NOT NULL,
  read_to_end_at         DATETIME NULL,                    -- required before the first signing (S4)
  signed_at              DATETIME NOT NULL,                -- server time; first signing (S4) and every re-accept (C1)
  includes_public_rating TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_cs_user_version (user_id, code_version),
  CONSTRAINT fk_cs_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_cs_ver  FOREIGN KEY (code_version) REFERENCES code_versions(version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================================================
-- 2 · TRAINING
-- =====================================================================================

CREATE TABLE programmes (
  code              ENUM('core','track','adv','org','induct') NOT NULL PRIMARY KEY,
  name              VARCHAR(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE applications (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  applying_as          ENUM('coach','trainer') NOT NULL,   -- trainer = trainer or mentor
  full_name            VARCHAR(120) NOT NULL,              -- [PERSONAL]
  phone                VARCHAR(20)  NULL,                  -- [PERSONAL] phone or email required
  email                VARCHAR(254) NULL,                  -- [PERSONAL]
  city                 VARCHAR(60)  NOT NULL,
  years_of_work        TINYINT UNSIGNED NULL,
  current_work         VARCHAR(200) NULL,                  -- [PERSONAL]
  experience_text      TEXT NULL,                          -- [PERSONAL]
  qualifications_text  TEXT NULL,                          -- [PERSONAL]
  cv_file_id           BIGINT UNSIGNED NULL,               -- [PERSONAL] viewed inside SETU only, never downloaded
  time_band            ENUM('u5','5_10','10_20','20p') NULL,
  attend_mode          ENUM('in_person','online','either') NOT NULL,
  start_window         VARCHAR(40) NOT NULL,
  attend_days          SET('mon','tue','wed','thu','fri','sat','sun') NULL,
  source_tag           VARCHAR(40) NULL,
  consent_given        TINYINT(1) NOT NULL,
  consent_at           DATETIME NOT NULL,
  consent_text_version VARCHAR(10) NOT NULL,
  state                ENUM('new','screened','interviewing','offered','waitlisted','enrolled') NOT NULL DEFAULT 'new',
  offered_batch_id     BIGINT UNSIGNED NULL,
  submitted_at         DATETIME NOT NULL,
  delete_after         DATE NULL,                          -- retention period still open
  KEY idx_app_state (state),
  KEY idx_app_source (source_tag),
  KEY idx_app_email (email),
  KEY idx_app_phone (phone),
  CONSTRAINT fk_app_cv    FOREIGN KEY (cv_file_id) REFERENCES files(id),
  CONSTRAINT fk_app_batch FOREIGN KEY (offered_batch_id) REFERENCES batches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE application_languages (
  application_id    BIGINT UNSIGNED NOT NULL,
  language_code     VARCHAR(10) NOT NULL,
  proficiency       ENUM('primary','secondary','other') NOT NULL,
  PRIMARY KEY (application_id, language_code),
  CONSTRAINT fk_al_app  FOREIGN KEY (application_id) REFERENCES applications(id),
  CONSTRAINT fk_al_lang FOREIGN KEY (language_code) REFERENCES languages(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE application_preferences (
  application_id    BIGINT UNSIGNED NOT NULL,
  value             VARCHAR(40) NOT NULL,                  -- coach: tracks; trainer: what they could teach
  PRIMARY KEY (application_id, value),
  CONSTRAINT fk_ap_app FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE batches (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  programme_code    ENUM('core','track','adv','org','induct') NOT NULL,
  name              VARCHAR(80) NOT NULL,
  mode              ENUM('both','in_person','online') NOT NULL,
  city              VARCHAR(60) NULL,
  venue             VARCHAR(160) NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  seats_in_person   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  seats_online      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  curriculum_label  VARCHAR(120) NULL,
  organisation_id   BIGINT UNSIGNED NULL,                  -- org-update batches
  created_by        BIGINT UNSIGNED NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at         DATETIME NULL,
  close_reason      TEXT NULL,
  KEY idx_batch_prog_start (programme_code, start_date),
  CONSTRAINT chk_batch_dates CHECK (end_date >= start_date),
  CONSTRAINT fk_batch_prog FOREIGN KEY (programme_code) REFERENCES programmes(code),
  CONSTRAINT fk_batch_org  FOREIGN KEY (organisation_id) REFERENCES organisations(id),
  CONSTRAINT fk_batch_by   FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE batch_sessions (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  batch_id          BIGINT UNSIGNED NOT NULL,
  session_date      DATE NOT NULL,
  start_time        TIME NOT NULL,
  title             VARCHAR(160) NOT NULL,
  module_id         BIGINT UNSIGNED NULL,
  KEY idx_bs_batch_date (batch_id, session_date),
  CONSTRAINT fk_bs_batch  FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_bs_module FOREIGN KEY (module_id) REFERENCES modules(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE batch_staff (
  batch_id          BIGINT UNSIGNED NOT NULL,
  faculty_id        BIGINT UNSIGNED NOT NULL,
  role              ENUM('faculty','mentor') NOT NULL,
  PRIMARY KEY (batch_id, faculty_id, role),
  KEY idx_bst_faculty (faculty_id),
  CONSTRAINT fk_bst_batch   FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_bst_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE batch_module_versions (
  batch_id          BIGINT UNSIGNED NOT NULL,
  module_id         BIGINT UNSIGNED NOT NULL,
  version           VARCHAR(10) NOT NULL,                  -- fixed at batch creation
  PRIMARY KEY (batch_id, module_id),
  CONSTRAINT fk_bmv_batch  FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_bmv_module FOREIGN KEY (module_id) REFERENCES modules(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE batch_waitlist (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  batch_id          BIGINT UNSIGNED NOT NULL,
  application_id    BIGINT UNSIGNED NOT NULL,
  seat_type         ENUM('in_person','online') NOT NULL,
  position          SMALLINT UNSIGNED NOT NULL,
  added_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  state             ENUM('waiting','offered_seat','moved','withdrawn') NOT NULL DEFAULT 'waiting',
  KEY idx_bw_batch (batch_id, seat_type, state, position),
  CONSTRAINT fk_bw_batch FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_bw_app   FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE batch_date_changes (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  batch_id          BIGINT UNSIGNED NOT NULL,
  old_start         DATE NOT NULL,
  old_end           DATE NOT NULL,
  new_start         DATE NOT NULL,
  new_end           DATE NOT NULL,
  reason            TEXT NOT NULL,
  changed_by        BIGINT UNSIGNED NOT NULL,
  changed_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_bdc_batch (batch_id),
  CONSTRAINT fk_bdc_batch FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_bdc_by    FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE enrolments (
  id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id                     BIGINT UNSIGNED NOT NULL,
  application_id              BIGINT UNSIGNED NULL,
  batch_id                    BIGINT UNSIGNED NOT NULL,
  seat_type                   ENUM('in_person','online') NOT NULL,
  coach_type                  ENUM('ours','org') NULL,     -- NULL for a trainer's induction seat
  organisation_id             BIGINT UNSIGNED NULL,
  enrolled_tracks             SET('student','executive','mid_management','senior') NULL,
  mentor_faculty_id           BIGINT UNSIGNED NULL,
  first_login_state           ENUM('invited','confirmed') NOT NULL DEFAULT 'invited',
  first_login_confirmed_at    DATETIME NULL,
  confidentiality_promised_at DATETIME NULL,
  own_assessment_state        ENUM('not_started','done','n_a') NOT NULL DEFAULT 'not_started',
  own_assessment_due          DATE NULL,                   -- batch start minus 2 days; recomputed on a date move
  own_assessment_ref          VARCHAR(40) NULL,            -- Aarambh sittingId (reference only; no reading stored)
  own_debrief_coach_id        BIGINT UNSIGNED NULL,
  own_debrief_done_at         DATETIME NULL,
  created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_enr_user_batch (user_id, batch_id),
  KEY idx_enr_batch_seat (batch_id, seat_type),
  KEY idx_enr_mentor (mentor_faculty_id),
  CONSTRAINT chk_enr_org CHECK (coach_type IS NULL OR coach_type <> 'org' OR organisation_id IS NOT NULL),
  CONSTRAINT fk_enr_user   FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_enr_app    FOREIGN KEY (application_id) REFERENCES applications(id),
  CONSTRAINT fk_enr_batch  FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_enr_org    FOREIGN KEY (organisation_id) REFERENCES organisations(id),
  CONSTRAINT fk_enr_mentor FOREIGN KEY (mentor_faculty_id) REFERENCES faculty(id),
  CONSTRAINT fk_enr_owncoach FOREIGN KEY (own_debrief_coach_id) REFERENCES coaches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE modules (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  programme_code      ENUM('core','track','adv','org','induct') NOT NULL,
  number              VARCHAR(4) NOT NULL,
  title               VARCHAR(160) NOT NULL,
  summary             VARCHAR(300) NULL,
  current_version     VARCHAR(10) NOT NULL,
  status              ENUM('draft','current','needs_update') NOT NULL DEFAULT 'draft',
  needs_update_reason VARCHAR(300) NULL,
  owner_faculty_id    BIGINT UNSIGNED NULL,
  owner_label         VARCHAR(60) NULL,                    -- when the owner is Gyani Says itself
  exam_note           VARCHAR(200) NULL,
  organisation_id     BIGINT UNSIGNED NULL,                -- organisation-update modules
  UNIQUE KEY uq_mod_prog_num (programme_code, number, organisation_id),
  CONSTRAINT fk_mod_prog  FOREIGN KEY (programme_code) REFERENCES programmes(code),
  CONSTRAINT fk_mod_owner FOREIGN KEY (owner_faculty_id) REFERENCES faculty(id),
  CONSTRAINT fk_mod_org   FOREIGN KEY (organisation_id) REFERENCES organisations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE module_versions (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  module_id         BIGINT UNSIGNED NOT NULL,
  version           VARCHAR(10) NOT NULL,
  published_on      DATE NOT NULL,
  change_note       VARCHAR(300) NOT NULL,
  practice_text     TEXT NULL,
  published_by      BIGINT UNSIGNED NULL,
  UNIQUE KEY uq_mv_mod_ver (module_id, version),
  CONSTRAINT fk_mv_module FOREIGN KEY (module_id) REFERENCES modules(id),
  CONSTRAINT fk_mv_by     FOREIGN KEY (published_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE module_version_items (
  module_version_id BIGINT UNSIGNED NOT NULL,
  kind              ENUM('outcome','plan','material') NOT NULL,
  position          TINYINT UNSIGNED NOT NULL,
  text              VARCHAR(300) NOT NULL,
  PRIMARY KEY (module_version_id, kind, position),
  CONSTRAINT fk_mvi_mv FOREIGN KEY (module_version_id) REFERENCES module_versions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE module_progress (
  enrolment_id         BIGINT UNSIGNED NOT NULL,
  module_id            BIGINT UNSIGNED NOT NULL,
  state                ENUM('locked','in_progress','done') NOT NULL DEFAULT 'locked',
  sessions_attended    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  signed_by_faculty_id BIGINT UNSIGNED NULL,
  signed_at            DATETIME NULL,
  faculty_feedback     TEXT NULL,
  PRIMARY KEY (enrolment_id, module_id),
  CONSTRAINT fk_mp_enr     FOREIGN KEY (enrolment_id) REFERENCES enrolments(id),
  CONSTRAINT fk_mp_module  FOREIGN KEY (module_id) REFERENCES modules(id),
  CONSTRAINT fk_mp_faculty FOREIGN KEY (signed_by_faculty_id) REFERENCES faculty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE update_module_assignments (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  module_id         BIGINT UNSIGNED NOT NULL,
  version           VARCHAR(10) NOT NULL,
  what_changed      VARCHAR(300) NOT NULL,
  length_minutes    SMALLINT UNSIGNED NOT NULL,
  state             ENUM('due','done') NOT NULL DEFAULT 'due',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  done_at           DATETIME NULL,
  UNIQUE KEY uq_uma (coach_id, module_id, version),
  CONSTRAINT fk_uma_coach  FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_uma_module FOREIGN KEY (module_id) REFERENCES modules(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE library_documents (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(120) NOT NULL,
  owner_label       VARCHAR(60) NOT NULL,
  word_count        INT UNSIGNED NOT NULL DEFAULT 0,
  current_version   VARCHAR(10) NOT NULL,
  source_ref        VARCHAR(255) NOT NULL                  -- read in-app only; no download endpoint
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE library_document_versions (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  document_id       BIGINT UNSIGNED NOT NULL,
  version           VARCHAR(10) NOT NULL,
  published_on      DATE NOT NULL,
  change_note       VARCHAR(300) NULL,
  published_by      BIGINT UNSIGNED NULL,
  UNIQUE KEY uq_ldv (document_id, version),
  CONSTRAINT fk_ldv_doc FOREIGN KEY (document_id) REFERENCES library_documents(id),
  CONSTRAINT fk_ldv_by  FOREIGN KEY (published_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE library_reads (
  user_id           BIGINT UNSIGNED NOT NULL,
  document_id       BIGINT UNSIGNED NOT NULL,
  version_read      VARCHAR(10) NOT NULL,
  read_at           DATETIME NOT NULL,
  PRIMARY KEY (user_id, document_id),
  CONSTRAINT fk_lr_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_lr_doc  FOREIGN KEY (document_id) REFERENCES library_documents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE guide_versions (
  version           VARCHAR(10) NOT NULL PRIMARY KEY,
  published_on      DATE NOT NULL,
  whats_new         TEXT NULL,
  body              MEDIUMTEXT NOT NULL,
  status            ENUM('current','parked','superseded') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE guide_model_map (
  model             ENUM('GROW','OPAL','CLEAR') NOT NULL,
  setu_step         ENUM('settle','empathise','think','undertake') NOT NULL,
  model_step        VARCHAR(80) NULL,                      -- NULL = no match
  note              VARCHAR(200) NULL,
  PRIMARY KEY (model, setu_step)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE guide_acks (
  user_id           BIGINT UNSIGNED NOT NULL,
  guide_version     VARCHAR(10) NOT NULL,
  read_at           DATETIME NOT NULL,
  PRIMARY KEY (user_id, guide_version),
  CONSTRAINT fk_ga_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_ga_ver  FOREIGN KEY (guide_version) REFERENCES guide_versions(version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE practice_debriefs (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  enrolment_id        BIGINT UNSIGNED NOT NULL,
  synthetic_report_id VARCHAR(64) NOT NULL,                -- synthetic only; never client history
  report_version      ENUM('student','executive','mid_management','senior') NOT NULL,
  state               ENUM('not_started','in_progress','feedback_given') NOT NULL DEFAULT 'not_started',
  feedback            TEXT NULL,
  given_by_faculty_id BIGINT UNSIGNED NULL,
  KEY idx_pd_enr (enrolment_id),
  CONSTRAINT fk_pd_enr FOREIGN KEY (enrolment_id) REFERENCES enrolments(id),
  CONSTRAINT fk_pd_fac FOREIGN KEY (given_by_faculty_id) REFERENCES faculty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE exam_part_defs (
  part              ENUM('written','dossier_practical','observed_debrief','oral_viva') NOT NULL PRIMARY KEY,
  title             VARCHAR(60) NOT NULL,
  description       VARCHAR(300) NULL,
  sort_order        TINYINT UNSIGNED NOT NULL              -- weights and pass marks live in settings
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE exam_attempts (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  enrolment_id      BIGINT UNSIGNED NOT NULL,
  part              ENUM('written','dossier_practical','observed_debrief','oral_viva') NOT NULL,
  attempt_no        TINYINT UNSIGNED NOT NULL,             -- 1..3 (2 resits, failed part only)
  scheduled_at      DATETIME NULL,
  result            ENUM('booked','passed','not_passed') NOT NULL DEFAULT 'booked',
  feedback          TEXT NULL,
  mark              DECIMAL(5,2) NULL,                     -- faculty / admin only; never returned to the coach
  half_a_plan       TEXT NULL,                             -- dossier practical half A
  half_b_comparison TEXT NULL,                             -- dossier practical half B
  marked_at         DATETIME NULL,
  UNIQUE KEY uq_ea (enrolment_id, part, attempt_no),
  CONSTRAINT chk_ea_attempt CHECK (attempt_no BETWEEN 1 AND 3),
  CONSTRAINT fk_ea_enr  FOREIGN KEY (enrolment_id) REFERENCES enrolments(id),
  CONSTRAINT fk_ea_part FOREIGN KEY (part) REFERENCES exam_part_defs(part)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE exam_markers (
  enrolment_id      BIGINT UNSIGNED NOT NULL,
  part              ENUM('written','dossier_practical','observed_debrief','oral_viva') NOT NULL,
  faculty_id        BIGINT UNSIGNED NOT NULL,              -- never the trainee's own mentor (server rule)
  assigned_by       BIGINT UNSIGNED NOT NULL,
  assigned_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (enrolment_id, part, faculty_id),
  CONSTRAINT fk_em_enr FOREIGN KEY (enrolment_id) REFERENCES enrolments(id),
  CONSTRAINT fk_em_fac FOREIGN KEY (faculty_id) REFERENCES faculty(id),
  CONSTRAINT fk_em_by  FOREIGN KEY (assigned_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED NOT NULL,
  kind                  ENUM('faculty','mentor','faculty_mentor') NOT NULL,
  route                 ENUM('external_trainer','promoted_coach') NOT NULL,
  application_id        BIGINT UNSIGNED NULL,
  teaches               SET('core','track','adv','org','induct') NULL,
  modules_note          VARCHAR(120) NULL,
  may_mark              SET('written','dossier_practical','observed_debrief','oral_viva') NULL,
  city                  VARCHAR(60) NULL,
  teaches_online        TINYINT(1) NOT NULL DEFAULT 0,
  cap_batches_per_month TINYINT UNSIGNED NOT NULL DEFAULT 1,
  state                 ENUM('in_induction','active','paused') NOT NULL DEFAULT 'in_induction',
  promotion_reason      TEXT NULL,
  induction_batch_id    BIGINT UNSIGNED NULL,
  UNIQUE KEY uq_fac_user (user_id),
  KEY idx_fac_state (state),
  CONSTRAINT fk_fac_user  FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_fac_app   FOREIGN KEY (application_id) REFERENCES applications(id),
  CONSTRAINT fk_fac_batch FOREIGN KEY (induction_batch_id) REFERENCES batches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_agreements (
  faculty_id        BIGINT UNSIGNED NOT NULL,
  agreement_version VARCHAR(10) NOT NULL,
  signed_on         DATE NOT NULL,
  PRIMARY KEY (faculty_id, agreement_version),
  CONSTRAINT fk_fa_fac FOREIGN KEY (faculty_id) REFERENCES faculty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_calibrations (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  faculty_id        BIGINT UNSIGNED NOT NULL,
  calibrated_on     DATE NOT NULL,
  due_on            DATE NOT NULL,                         -- calibrated_on + 182 days
  note              VARCHAR(300) NULL,
  recorded_by       BIGINT UNSIGNED NOT NULL,
  KEY idx_fcal (faculty_id, calibrated_on),
  CONSTRAINT fk_fcal_fac FOREIGN KEY (faculty_id) REFERENCES faculty(id),
  CONSTRAINT fk_fcal_by  FOREIGN KEY (recorded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE traits (
  code              VARCHAR(40) NOT NULL PRIMARY KEY,      -- Aarambh's trait list (names cross the wire)
  name              VARCHAR(80) NOT NULL,
  default_lane      ENUM('fit','performance') NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE bank_questions (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  trait_code        VARCHAR(40) NULL,
  step              ENUM('E','T','U') NOT NULL,
  text              VARCHAR(500) NOT NULL,
  why               ENUM('general_routine','specific_high','specific_low','caret','discrepancy','median','other') NULL,
  state             ENUM('active','retired') NOT NULL DEFAULT 'active',
  from_proposal_id  BIGINT UNSIGNED NULL,
  approved_by       BIGINT UNSIGNED NULL,
  approved_at       DATETIME NULL,
  KEY idx_bq_trait (trait_code, state),
  CONSTRAINT fk_bq_trait FOREIGN KEY (trait_code) REFERENCES traits(code),
  CONSTRAINT fk_bq_prop  FOREIGN KEY (from_proposal_id) REFERENCES question_proposals(id),
  CONSTRAINT fk_bq_by    FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE question_proposals (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  text              VARCHAR(500) NOT NULL,
  origin            ENUM('own_question','follow_up_in_room','gap_note','faculty') NOT NULL,
  debrief_id        BIGINT UNSIGNED NULL,                  -- where it came from (never shown with client details)
  proposed_by       BIGINT UNSIGNED NOT NULL,
  trait_code        VARCHAR(40) NULL,
  point_kind        ENUM('integrity','check','must','caret','median','high','low') NULL,
  proposed_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  state             ENUM('proposed','approved','declined') NOT NULL DEFAULT 'proposed',
  decided_by        BIGINT UNSIGNED NULL,
  decided_at        DATETIME NULL,
  KEY idx_qp_state (state),
  CONSTRAINT fk_qp_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_qp_by      FOREIGN KEY (proposed_by) REFERENCES users(id),
  CONSTRAINT fk_qp_trait   FOREIGN KEY (trait_code) REFERENCES traits(code),
  CONSTRAINT fk_qp_dec     FOREIGN KEY (decided_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================================================
-- 3 · COACHES & GRADING
-- =====================================================================================

CREATE TABLE coaches (
  id                     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id                BIGINT UNSIGNED NOT NULL,
  coach_type             ENUM('ours','org') NOT NULL,
  organisation_id        BIGINT UNSIGNED NULL,             -- appointing organisation; required for 'org'
  stage                  ENUM('invited','in_training','exam_passed','provisional','provisional_lapsed','active','paused','withdrawn') NOT NULL DEFAULT 'invited',
  stage_before_pause     ENUM('provisional','active') NULL,
  `rank`                 ENUM('certified','senior','lead') NULL,
  level                  TINYINT UNSIGNED NULL,            -- 1..4, set by training only; read-only elsewhere
  growth                 ENUM('growing','fixed','allrounder') NOT NULL DEFAULT 'growing',
  category               ENUM('A','B','C','D') NULL,       -- the coach sees the letter only; D switched off by setting
  cant_say_rule          ENUM('default','yes','no') NOT NULL DEFAULT 'default',
  hours_target_month     SMALLINT UNSIGNED NULL,           -- coach's own; one of the allowed values
  provisional_start      DATE NULL,
  provisional_end        DATE NULL,
  provisional_extended   TINYINT(1) NOT NULL DEFAULT 0,    -- once only, by admin
  mentor_signoff_at      DATETIME NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_coach_user (user_id),
  KEY idx_coach_stage (stage),
  KEY idx_coach_org (organisation_id),
  CONSTRAINT chk_coach_org CHECK (coach_type <> 'org' OR organisation_id IS NOT NULL),
  CONSTRAINT fk_coach_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_coach_org  FOREIGN KEY (organisation_id) REFERENCES organisations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE role_track_defs (
  track             ENUM('student','executive','mid_management','senior') NOT NULL PRIMARY KEY,
  code              VARCHAR(4) NOT NULL,
  title             VARCHAR(60) NOT NULL,
  days              TINYINT UNSIGNED NULL                   -- training length in days; set by admin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE rank_defs (
  `rank`            ENUM('certified','senior','lead') NOT NULL PRIMARY KEY,
  label             VARCHAR(60) NOT NULL,
  how_earned        VARCHAR(300) NOT NULL,
  adds              VARCHAR(300) NOT NULL,
  sort_order        TINYINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coach_tracks (
  coach_id                 BIGINT UNSIGNED NOT NULL,
  track                    ENUM('student','executive','mid_management','senior') NOT NULL,
  state                    ENUM('opened','passed','passed_at_entry') NOT NULL,
  opened_by                BIGINT UNSIGNED NULL,
  opened_at                DATETIME NULL,
  batch_id                 BIGINT UNSIGNED NULL,
  signed_off_by_faculty_id BIGINT UNSIGNED NULL,
  passed_at                DATETIME NULL,
  PRIMARY KEY (coach_id, track),
  CONSTRAINT fk_ct_coach FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_ct_by    FOREIGN KEY (opened_by) REFERENCES users(id),
  CONSTRAINT fk_ct_batch FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_ct_fac   FOREIGN KEY (signed_off_by_faculty_id) REFERENCES faculty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE advanced_enrolments (
  coach_id          BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  batch_id          BIGINT UNSIGNED NULL,
  state             ENUM('not_started','in_progress','passed') NOT NULL DEFAULT 'not_started',
  passed_at         DATETIME NULL,
  CONSTRAINT fk_ae_coach FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_ae_batch FOREIGN KEY (batch_id) REFERENCES batches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coach_org_certifications (
  coach_id          BIGINT UNSIGNED NOT NULL,
  organisation_id   BIGINT UNSIGNED NOT NULL,
  state             ENUM('in_training','certified','update_due','paused','expired') NOT NULL,
  certified_at      DATE NULL,
  batch_id          BIGINT UNSIGNED NULL,                  -- certification comes only from a G2 batch
  PRIMARY KEY (coach_id, organisation_id),
  KEY idx_coc_org (organisation_id, state),
  CONSTRAINT fk_coc_coach FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_coc_org   FOREIGN KEY (organisation_id) REFERENCES organisations(id),
  CONSTRAINT fk_coc_batch FOREIGN KEY (batch_id) REFERENCES batches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE time_commitments (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  band              ENUM('u5','5_10','10_20','20p') NOT NULL,
  days              SET('mon','tue','wed','thu','fri','sat','sun') NULL,
  times_of_day      SET('morning','afternoon','evening') NULL,
  months            TINYINT UNSIGNED NOT NULL,             -- 6, 12, 18 or 24
  state             ENUM('active','pending_approval','superseded','declined') NOT NULL,
  effective_from    DATE NULL,
  approved_by       BIGINT UNSIGNED NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_tc_coach_state (coach_id, state),
  CONSTRAINT chk_tc_months CHECK (months IN (6,12,18,24)),
  CONSTRAINT fk_tc_coach FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_tc_by    FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE credentials (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  credential_number CHAR(18) NOT NULL,                     -- GYS-SAR-YYYY-XXXXC (Crockford base-32 + check char); generated once server-side; never edited or reused
  issued_on         DATE NOT NULL,
  valid_to          DATE NOT NULL,
  status            ENUM('active','lapsed','paused','withdrawn') NOT NULL DEFAULT 'active',
  withdrawn_at      DATETIME NULL,
  withdrawn_reason  TEXT NULL,
  pdf_file_id       BIGINT UNSIGNED NULL,
  UNIQUE KEY uq_cred_number (credential_number),
  UNIQUE KEY uq_cred_coach (coach_id),
  CONSTRAINT fk_cred_coach FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_cred_pdf   FOREIGN KEY (pdf_file_id) REFERENCES files(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE credential_attestations (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  credential_id     BIGINT UNSIGNED NOT NULL,
  attested_at       DATETIME NOT NULL,
  valid_to          DATE NOT NULL,
  KEY idx_catt (credential_id, attested_at),
  CONSTRAINT fk_catt_cred FOREIGN KEY (credential_id) REFERENCES credentials(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE supervised_debriefs (
  coach_id          BIGINT UNSIGNED NOT NULL,
  debrief_id        BIGINT UNSIGNED NOT NULL,
  mentor_faculty_id BIGINT UNSIGNED NOT NULL,
  mentor_signed_at  DATETIME NULL,
  PRIMARY KEY (coach_id, debrief_id),
  CONSTRAINT fk_sd_coach   FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_sd_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_sd_mentor  FOREIGN KEY (mentor_faculty_id) REFERENCES faculty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE mentor_hours_log (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  mentor_faculty_id BIGINT UNSIGNED NOT NULL,
  hours             DECIMAL(4,2) NOT NULL,
  on_date           DATE NOT NULL,
  KEY idx_mhl_coach (coach_id),
  CONSTRAINT fk_mhl_coach  FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_mhl_mentor FOREIGN KEY (mentor_faculty_id) REFERENCES faculty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coach_public_cards (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  years_experience  TINYINT UNSIGNED NULL,
  worked_with       VARCHAR(160) NULL,
  about             TEXT NULL,                             -- at most 80 words (server-checked); no contact details or money
  photo_file_id     BIGINT UNSIGNED NULL,
  status            ENUM('draft','pending','approved') NOT NULL DEFAULT 'draft',
  submitted_at      DATETIME NULL,
  approved_at       DATETIME NULL,
  approved_by       BIGINT UNSIGNED NULL,
  approved_snapshot JSON NULL,                             -- the version that stays live while a new draft waits
  UNIQUE KEY uq_cpc_coach (coach_id),
  CONSTRAINT fk_cpc_coach FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_cpc_photo FOREIGN KEY (photo_file_id) REFERENCES files(id),
  CONSTRAINT fk_cpc_by    FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coach_card_specialities (
  card_id           BIGINT UNSIGNED NOT NULL,
  speciality        ENUM('first_time_managers','career_change','students_early_career','senior_leaders','returning_to_work','high_pressure_roles','team_leads','founders') NOT NULL,
  PRIMARY KEY (card_id, speciality),                       -- at most 3 per card (server rule)
  CONSTRAINT fk_ccs_card FOREIGN KEY (card_id) REFERENCES coach_public_cards(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coach_prefs (
  coach_id          BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  report_view       ENUM('split','own') NOT NULL DEFAULT 'split',
  split_width_pct   TINYINT UNSIGNED NOT NULL DEFAULT 50,
  swap_sides        TINYINT(1) NOT NULL DEFAULT 0,
  hide_report       TINYINT(1) NOT NULL DEFAULT 0,
  report_zoom_pct   SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  CONSTRAINT chk_cp_split CHECK (split_width_pct BETWEEN 25 AND 70),
  CONSTRAINT chk_cp_zoom  CHECK (report_zoom_pct BETWEEN 60 AND 160),
  CONSTRAINT fk_cp_coach FOREIGN KEY (coach_id) REFERENCES coaches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE client_ratings (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id        BIGINT UNSIGNED NOT NULL,
  coach_id          BIGINT UNSIGNED NOT NULL,
  score             TINYINT UNSIGNED NOT NULL,
  comment           TEXT NULL,                             -- [PERSONAL] validated client feedback from Aarambh (H7)
  rated_at          DATETIME NOT NULL,
  UNIQUE KEY uq_cr_debrief (debrief_id),
  KEY idx_cr_coach (coach_id, rated_at),
  CONSTRAINT chk_cr_score CHECK (score BETWEEN 1 AND 5),
  CONSTRAINT fk_cr_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_cr_coach   FOREIGN KEY (coach_id) REFERENCES coaches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE rating_flags (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  rule              ENUM('trend_drop','low_ratings_month','coach_client_gap','warnings_month','late_drops','retake_offers') NOT NULL,
  detail            VARCHAR(300) NOT NULL,                 -- what SETU saw; never a proposed grade
  quarter           CHAR(7) NOT NULL,                      -- YYYY-Qn
  state             ENUM('flagged','in_review','decided','dismissed') NOT NULL DEFAULT 'flagged',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_rf_coach_q (coach_id, quarter),
  KEY idx_rf_state (state),
  CONSTRAINT fk_rf_coach FOREIGN KEY (coach_id) REFERENCES coaches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE rating_reviews (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  flag_id           BIGINT UNSIGNED NULL,
  reviewer_id       BIGINT UNSIGNED NOT NULL,
  outcome           ENUM('no_change','warning','category_change','pause','slab_request') NOT NULL,
  category_from     ENUM('A','B','C','D') NULL,
  category_to       ENUM('A','B','C','D') NULL,
  reason            TEXT NOT NULL,
  decided_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_rr_coach (coach_id),
  CONSTRAINT fk_rr_coach FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_rr_flag  FOREIGN KEY (flag_id) REFERENCES rating_flags(id),
  CONSTRAINT fk_rr_by    FOREIGN KEY (reviewer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE rating_exclusions (
  client_rating_id  BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  reason            TEXT NOT NULL,
  excluded_by       BIGINT UNSIGNED NOT NULL,
  excluded_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rx_rating FOREIGN KEY (client_rating_id) REFERENCES client_ratings(id),
  CONSTRAINT fk_rx_by     FOREIGN KEY (excluded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================================================
-- 4 · CALENDAR & BOOKINGS
-- =====================================================================================

CREATE TABLE slots (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,   -- crosses to Aarambh as slotId (H1); never with a coach name
  coach_id          BIGINT UNSIGNED NOT NULL,
  slot_date         DATE NOT NULL,                         -- India date
  start_minute      SMALLINT UNSIGNED NOT NULL,            -- minutes from 00:00 India time
  duration_min      SMALLINT UNSIGNED NOT NULL DEFAULT 45,
  status            ENUM('open','booked','closed') NOT NULL DEFAULT 'open',
  debrief_id        BIGINT UNSIGNED NULL,
  created_by        BIGINT UNSIGNED NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at         DATETIME NULL,
  UNIQUE KEY uq_slot (coach_id, slot_date, start_minute),
  KEY idx_slot_date (slot_date, status),
  CONSTRAINT chk_slot_minute CHECK (start_minute < 1440),
  CONSTRAINT fk_slot_coach   FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_slot_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_slot_by      FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coach_unavailability (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  kind              ENUM('range','weekday') NOT NULL,
  date_from         DATE NULL,
  date_to           DATE NULL,
  weekday           ENUM('mon','tue','wed','thu','fri','sat','sun') NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  removed_at        DATETIME NULL,
  KEY idx_cu_coach (coach_id),
  CONSTRAINT fk_cu_coach FOREIGN KEY (coach_id) REFERENCES coaches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE assignment_queue (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id        BIGINT UNSIGNED NOT NULL,
  source            ENUM('new','upgrade','key','rebook','coaching_lead','move_request','paused_coach') NOT NULL,
  previous_coach_id BIGINT UNSIGNED NULL,
  request_id        BIGINT UNSIGNED NULL,                  -- the move request that put it back
  assign_by         DATETIME NOT NULL,                     -- arrival + assign-within setting
  state             ENUM('waiting','assigned','cant_fill') NOT NULL DEFAULT 'waiting',
  entered_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at       DATETIME NULL,
  resolved_by       BIGINT UNSIGNED NULL,
  KEY idx_aq_state (state, assign_by),
  KEY idx_aq_debrief (debrief_id),
  CONSTRAINT fk_aq_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_aq_prev    FOREIGN KEY (previous_coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_aq_req     FOREIGN KEY (request_id) REFERENCES requests(id),
  CONSTRAINT fk_aq_by      FOREIGN KEY (resolved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE debrief_assignments (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id        BIGINT UNSIGNED NOT NULL,
  coach_id          BIGINT UNSIGNED NOT NULL,
  slot_id           BIGINT UNSIGNED NULL,
  assigned_by       BIGINT UNSIGNED NOT NULL,
  assigned_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  meeting_ref       VARCHAR(120) NULL,                     -- meeting on a Gyani Says-owned account
  ended_at          DATETIME NULL,
  end_reason        ENUM('moved','late_drop','paused','cancelled','access_ended') NULL,
  KEY idx_da_debrief (debrief_id),
  KEY idx_da_coach (coach_id, ended_at),
  CONSTRAINT fk_da_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_da_coach   FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_da_slot    FOREIGN KEY (slot_id) REFERENCES slots(id),
  CONSTRAINT fk_da_by      FOREIGN KEY (assigned_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE late_drops (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  debrief_id        BIGINT UNSIGNED NOT NULL,
  request_id        BIGINT UNSIGNED NULL,
  dropped_at        DATETIME NOT NULL,
  KEY idx_ld_coach (coach_id, dropped_at),
  CONSTRAINT fk_ld_coach   FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_ld_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_ld_req     FOREIGN KEY (request_id) REFERENCES requests(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================================================
-- 5 · DEBRIEFS & THE READING CACHE
-- =====================================================================================

CREATE TABLE debriefs (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,   -- Saarthi's debriefId
  booking_ref         VARCHAR(40) NOT NULL,                -- Aarambh bookingId (external reference)
  person_ref          VARCHAR(40) NOT NULL,                -- Aarambh personId (external reference; no person record is kept)
  sitting_ref         VARCHAR(40) NULL,                    -- Aarambh sittingId
  first_name          VARCHAR(60) NOT NULL,                -- [PERSONAL] first name only; never surname
  client_type         ENUM('student','executive','mid_management','senior','cant_say') NOT NULL,
  language_code       VARCHAR(10) NOT NULL,
  session_type        ENUM('debrief','coaching') NOT NULL DEFAULT 'debrief',
  engagement_id       BIGINT UNSIGNED NULL,
  session_no          TINYINT UNSIGNED NULL,
  report_kind         ENUM('pancha_bhuta','trayi','paradox','team') NULL,
  report_version      ENUM('student','executive','mid_management','senior') NULL,
  sitting_type        ENUM('core','full') NULL,
  integrity           ENUM('reliable','caution') NULL,     -- Aarambh 'hold' is refused at intake and never stored here
  tier                ENUM('standard','plus','premium') NOT NULL DEFAULT 'standard',
  organisation_id     BIGINT UNSIGNED NULL,
  pack_size           TINYINT UNSIGNED NULL,               -- 3 or 5 when a pack was bought at purchase
  consent_at_booking  ENUM('record','transcript','none') NULL,
  scheduled_at        DATETIME NOT NULL,
  slot_id             BIGINT UNSIGNED NULL,
  coach_id            BIGINT UNSIGNED NULL,                -- current assigned coach; NULL while unassigned
  supervised          TINYINT(1) NOT NULL DEFAULT 0,        -- counts toward a provisional coach's supervised debriefs
  status              ENUM('unassigned','assigned','prep','debriefed','after','sentback','validated','closed','cancel_early','cancel_late','noshow') NOT NULL DEFAULT 'unassigned',
  prep_stale          TINYINT(1) NOT NULL DEFAULT 0,        -- reading superseded by a retake
  on_hold             TINYINT(1) NOT NULL DEFAULT 0,        -- held after a sitting event (superseded / withdrawn)
  status_changed_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at           DATETIME NULL,
  reading_purge_after DATETIME NULL,                        -- closed_at + audit window; reading cache deleted then
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_debrief_booking (booking_ref, session_no),
  KEY idx_debrief_coach_status (coach_id, status),
  KEY idx_debrief_status (status, scheduled_at),
  KEY idx_debrief_person (person_ref),
  KEY idx_debrief_purge (reading_purge_after),
  CONSTRAINT fk_debrief_lang  FOREIGN KEY (language_code) REFERENCES languages(code),
  CONSTRAINT fk_debrief_eng   FOREIGN KEY (engagement_id) REFERENCES coaching_engagements(id),
  CONSTRAINT fk_debrief_org   FOREIGN KEY (organisation_id) REFERENCES organisations(id),
  CONSTRAINT fk_debrief_slot  FOREIGN KEY (slot_id) REFERENCES slots(id),
  CONSTRAINT fk_debrief_coach FOREIGN KEY (coach_id) REFERENCES coaches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE debrief_status_log (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id        BIGINT UNSIGNED NOT NULL,
  from_status       VARCHAR(20) NULL,
  to_status         VARCHAR(20) NOT NULL,
  changed_by        BIGINT UNSIGNED NULL,                  -- NULL = system / Aarambh feed
  source            ENUM('coach','admin','aarambh','system') NOT NULL,
  changed_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason            TEXT NULL,
  KEY idx_dsl_debrief (debrief_id, changed_at),
  CONSTRAINT fk_dsl_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_dsl_by      FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Reading cache: Aarambh's finished fields only (INTEGRATION_AARAMBH.md §5).
-- Never stored: raw answers, raw or mirror scores, timings, item ids, surname, email, phone, report text, report URLs.
CREATE TABLE aarambh_readings (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id           BIGINT UNSIGNED NOT NULL,
  sitting_ref          VARCHAR(40) NOT NULL,               -- Aarambh sittingId (external reference)
  person_ref           VARCHAR(40) NOT NULL,               -- Aarambh personId (external reference)
  sitting_type         ENUM('core','full') NOT NULL,
  sitting_completed_at DATETIME NOT NULL,
  payload_version      VARCHAR(8) NOT NULL,
  generated_at         DATETIME NOT NULL,
  received_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  route                ENUM('api','file') NOT NULL DEFAULT 'api',  -- file = admin route only
  integrity            ENUM('reliable','caution') NOT NULL,
  state                ENUM('active','superseded','withdrawn') NOT NULL DEFAULT 'active',
  intake_log           JSON NULL,                          -- field NAMES found / missing / dropped; never values
  KEY idx_ar_debrief (debrief_id, state),
  KEY idx_ar_sitting (sitting_ref),
  CONSTRAINT fk_ar_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[PERSONAL] reading cache — deleted at debrief close + audit window';

CREATE TABLE aarambh_reading_traits (
  reading_id        BIGINT UNSIGNED NOT NULL,
  trait_code        VARCHAR(40) NOT NULL,
  level             TINYINT UNSIGNED NULL,                 -- Aarambh L0..L5 as 0..5 (0 = most of the trait); NULL = unreadable; never derived
  lane              ENUM('fit','performance') NULL,
  gap_band          ENUM('none','check','probe') NOT NULL DEFAULT 'none',  -- band only; the number never crosses
  trait_status      ENUM('readable','agreed','median','unreadable') NOT NULL,
  caret             TINYINT UNSIGNED NOT NULL DEFAULT 0,   -- 0/1 today; 0/1/2 from payload v1.3
  PRIMARY KEY (reading_id, trait_code),
  CONSTRAINT chk_art_level CHECK (level IS NULL OR level <= 5),
  CONSTRAINT fk_art_reading FOREIGN KEY (reading_id) REFERENCES aarambh_readings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[PERSONAL] reading cache';

CREATE TABLE aarambh_reading_reports (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  reading_id        BIGINT UNSIGNED NOT NULL,
  report_type       VARCHAR(40) NOT NULL,                  -- as Aarambh labels it
  copy_kind         ENUM('person','coach') NOT NULL,
  report_version    VARCHAR(20) NOT NULL,
  integrity         ENUM('reliable','caution') NULL,
  sort_order        TINYINT UNSIGNED NOT NULL DEFAULT 0,   -- NO URL column: links are fetched fresh per request (H4)
  KEY idx_arr_reading (reading_id),
  CONSTRAINT fk_arr_reading FOREIGN KEY (reading_id) REFERENCES aarambh_readings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='reading cache';

CREATE TABLE aarambh_opened_items (
  reading_id        BIGINT UNSIGNED NOT NULL,
  item_ref          VARCHAR(60) NOT NULL,                  -- Aarambh's id
  report            VARCHAR(40) NOT NULL,
  kind              ENUM('job','group','situation') NOT NULL,
  name              VARCHAR(120) NOT NULL,
  band              VARCHAR(30) NULL,
  times_opened      SMALLINT UNSIGNED NOT NULL,            -- the person's own opens only
  sort_rank         SMALLINT UNSIGNED NOT NULL,            -- most opened first
  PRIMARY KEY (reading_id, item_ref),
  CONSTRAINT fk_aoi_reading FOREIGN KEY (reading_id) REFERENCES aarambh_readings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[PERSONAL] reading cache — served only behind a signed undertaking';

CREATE TABLE report_link_requests (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id          BIGINT UNSIGNED NOT NULL,
  user_id             BIGINT UNSIGNED NOT NULL,
  copy_kind           ENUM('person','coach') NOT NULL,
  report_type         VARCHAR(40) NOT NULL,
  undertaking_version VARCHAR(10) NULL,                    -- version on record when a coach copy was asked for
  present_mode        TINYINT(1) NOT NULL DEFAULT 0,        -- present mode is always served the person copy
  requested_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at          DATETIME NULL,                       -- as Aarambh set it; the URL itself is never stored
  revoked_at          DATETIME NULL,                       -- set when the debrief closes (revoke call)
  result              ENUM('issued','refused') NOT NULL,
  KEY idx_rlr_debrief (debrief_id),
  CONSTRAINT fk_rlr_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_rlr_user    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE prep (
  debrief_id        BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  understanding     TEXT NULL,                             -- coach; Aarambh on audit
  private_notes     TEXT NULL,                             -- [PRIVATE] coach only — no other role, no API but the coach's own
  caution_ack       TINYINT(1) NOT NULL DEFAULT 0,
  prep_done         TINYINT(1) NOT NULL DEFAULT 0,
  prep_done_at      DATETIME NULL,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prep_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE prep_questions (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id          BIGINT UNSIGNED NULL,
  practice_debrief_id BIGINT UNSIGNED NULL,                -- exactly one of debrief_id / practice_debrief_id
  step                ENUM('E','T','U') NOT NULL,
  text                VARCHAR(500) NOT NULL,
  source              ENUM('bank','guide','own') NOT NULL,
  bank_question_id    BIGINT UNSIGNED NULL,
  why                 ENUM('general_routine','specific_high','specific_low','caret','discrepancy','median','other') NULL,
  note                VARCHAR(200) NULL,
  point_kind          ENUM('integrity','check','must','caret','median','high','low') NULL,
  trait_code          VARCHAR(40) NULL,
  sort_order          SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  KEY idx_pq_debrief (debrief_id),
  KEY idx_pq_practice (practice_debrief_id),
  CONSTRAINT chk_pq_owner CHECK ((debrief_id IS NULL) <> (practice_debrief_id IS NULL)),
  CONSTRAINT fk_pq_debrief  FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_pq_practice FOREIGN KEY (practice_debrief_id) REFERENCES practice_debriefs(id),
  CONSTRAINT fk_pq_bank     FOREIGN KEY (bank_question_id) REFERENCES bank_questions(id),
  CONSTRAINT fk_pq_trait    FOREIGN KEY (trait_code) REFERENCES traits(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE prep_question_options (
  question_id       BIGINT UNSIGNED NOT NULL,
  ord               TINYINT UNSIGNED NOT NULL,             -- 2..4 options, or none
  label             VARCHAR(80) NOT NULL,
  follow_up         VARCHAR(300) NULL,
  PRIMARY KEY (question_id, ord),
  CONSTRAINT fk_pqo_q FOREIGN KEY (question_id) REFERENCES prep_questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE live_runs (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id           BIGINT UNSIGNED NULL,               -- real run
  practice_debrief_id  BIGINT UNSIGNED NULL,               -- practice run (sent to faculty; never client history)
  mode                 ENUM('real','practice') NOT NULL,
  started_at           DATETIME NOT NULL,
  ended_at             DATETIME NULL,
  consent_at_session   ENUM('record','transcript','none') NULL,  -- required before leaving Settle or ending
  consent_changed      TINYINT(1) NOT NULL DEFAULT 0,
  covers_done          TINYINT(1) NOT NULL DEFAULT 0,
  confidentiality_done TINYINT(1) NOT NULL DEFAULT 0,
  current_step         ENUM('S','E','T','U','END') NOT NULL DEFAULT 'S',
  client_state         ENUM('here','fast','flat') NULL,
  state_since_min      SMALLINT UNSIGNED NULL,
  outcome              ENUM('completed','ended_early','no_show') NULL,
  ended_early_reason   TEXT NULL,                          -- stays with Gyani Says admin; same-day alert
  UNIQUE KEY uq_lr_debrief (debrief_id),
  UNIQUE KEY uq_lr_practice (practice_debrief_id),
  CONSTRAINT chk_lr_owner CHECK ((debrief_id IS NULL) <> (practice_debrief_id IS NULL)),
  CONSTRAINT fk_lr_debrief  FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_lr_practice FOREIGN KEY (practice_debrief_id) REFERENCES practice_debriefs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE run_step_log (
  run_id            BIGINT UNSIGNED NOT NULL,
  seq               SMALLINT UNSIGNED NOT NULL,
  at_min            SMALLINT UNSIGNED NOT NULL,
  step              ENUM('S','E','T','U','END') NOT NULL,
  stepped_back      TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (run_id, seq),
  CONSTRAINT fk_rsl_run FOREIGN KEY (run_id) REFERENCES live_runs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE run_answers (
  run_id            BIGINT UNSIGNED NOT NULL,
  question_id       BIGINT UNSIGNED NOT NULL,
  mark              ENUM('covered','put_aside') NULL,
  answer_text       TEXT NULL,                             -- [PERSONAL] what they said, in their words
  option_ord        TINYINT UNSIGNED NULL,
  follow_up_answer  TEXT NULL,                             -- [PERSONAL]
  from_transcript   TINYINT(1) NOT NULL DEFAULT 0,
  put_aside_reason  VARCHAR(200) NULL,
  PRIMARY KEY (run_id, question_id),
  CONSTRAINT fk_ra_run FOREIGN KEY (run_id) REFERENCES live_runs(id),
  CONSTRAINT fk_ra_q   FOREIGN KEY (question_id) REFERENCES prep_questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE run_followups (
  run_id            BIGINT UNSIGNED NOT NULL,
  question_id       BIGINT UNSIGNED NOT NULL,
  ord               TINYINT UNSIGNED NOT NULL,
  question          VARCHAR(300) NOT NULL,
  answer            TEXT NULL,                             -- [PERSONAL]
  PRIMARY KEY (run_id, question_id, ord),
  CONSTRAINT fk_rf_run FOREIGN KEY (run_id) REFERENCES live_runs(id),
  CONSTRAINT fk_rf_q   FOREIGN KEY (question_id) REFERENCES prep_questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE run_jots (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  run_id            BIGINT UNSIGNED NOT NULL,
  step              ENUM('S','E','T','U') NOT NULL,
  at_min            SMALLINT UNSIGNED NOT NULL,
  text              TEXT NOT NULL,                         -- [PERSONAL]
  KEY idx_rj_run (run_id),
  CONSTRAINT fk_rj_run FOREIGN KEY (run_id) REFERENCES live_runs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================================================
-- 6 · AFTER THE DEBRIEF (and further coaching)
-- =====================================================================================

CREATE TABLE after_debriefs (
  debrief_id               BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  due_at                   DATETIME NOT NULL,              -- ended_at + 24 h
  submitted_at             DATETIME NULL,                  -- server time
  no_recommendation        TINYINT(1) NOT NULL DEFAULT 0,
  no_recommendation_reason VARCHAR(200) NULL,
  letter_status            ENUM('draft','awaiting_validation','sent_back','validated') NOT NULL DEFAULT 'draft',
  letter_read_ack          TINYINT(1) NOT NULL DEFAULT 0,
  rate_settled             TINYINT UNSIGNED NULL,          -- coach's rating of the conversation, 1..5; never shown to the client; not a grade input
  rate_understood          TINYINT UNSIGNED NULL,
  rate_covered             TINYINT UNSIGNED NULL,
  rate_next_step           TINYINT UNSIGNED NULL,
  rate_comment             TEXT NULL,
  reflection               TEXT NULL,                      -- [PRIVATE] coach (+ mentor if provisional); never leaves Saarthi
  recording_url            VARCHAR(500) NULL,              -- [PERSONAL] https on a Gyani Says-owned meeting account only
  recording_missing_reason ENUM('technical_failure','not_recorded_by_mistake') NULL,
  transcript_meeting_id    CHAR(36) NULL,                  -- transcript tool meeting UUID; the transcript itself is never stored
  transcript_fetched_at    DATETIME NULL,
  gap_note                 TEXT NULL,
  disposition_sent_at      DATETIME NULL,                  -- H6 sent
  KEY idx_ad_due (submitted_at, due_at),
  CONSTRAINT chk_ad_rates CHECK ((rate_settled IS NULL OR rate_settled BETWEEN 1 AND 5)
                             AND (rate_understood IS NULL OR rate_understood BETWEEN 1 AND 5)
                             AND (rate_covered IS NULL OR rate_covered BETWEEN 1 AND 5)
                             AND (rate_next_step IS NULL OR rate_next_step BETWEEN 1 AND 5)),
  CONSTRAINT fk_ad_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE recommendations (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id        BIGINT UNSIGNED NOT NULL,
  source            ENUM('aarambh','organisation') NOT NULL,
  product_ref       VARCHAR(40) NULL,                      -- Aarambh productId (external reference)
  org_programme_id  BIGINT UNSIGNED NULL,
  based_on          SET('said','own_next_step','reading_point','observation') NOT NULL,  -- at least one
  who_raised        ENUM('client_asked','coach_suggested') NOT NULL,
  why               VARCHAR(200) NULL,
  setu_pointer      VARCHAR(120) NULL,
  ord               TINYINT UNSIGNED NOT NULL,             -- at most 3 per debrief (server rule)
  UNIQUE KEY uq_rec_ord (debrief_id, ord),
  CONSTRAINT chk_rec_ord CHECK (ord BETWEEN 1 AND 3),
  CONSTRAINT chk_rec_target CHECK ((source = 'aarambh' AND product_ref IS NOT NULL) OR (source = 'organisation' AND org_programme_id IS NOT NULL)),
  CONSTRAINT fk_rec_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_rec_prog    FOREIGN KEY (org_programme_id) REFERENCES organisation_programmes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE feedback_letters (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id        BIGINT UNSIGNED NOT NULL,
  version           SMALLINT UNSIGNED NOT NULL,            -- +1 on each resubmit
  talked_about      TEXT NULL,                             -- [PERSONAL]
  stood_out         TEXT NULL,                             -- [PERSONAL]
  next_steps        TEXT NULL,                             -- [PERSONAL]
  coach_note        TEXT NULL,
  language_code     VARCHAR(10) NOT NULL,
  word_count        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  submitted_at      DATETIME NULL,
  decision          ENUM('approved','sent_back') NULL,     -- Aarambh (H7); Aarambh never edits the letter
  decision_comment  TEXT NULL,
  decided_at        DATETIME NULL,
  UNIQUE KEY uq_fl (debrief_id, version),
  CONSTRAINT fk_fl_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_fl_lang    FOREIGN KEY (language_code) REFERENCES languages(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE retake_offers (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id        BIGINT UNSIGNED NOT NULL,
  person_ref        VARCHAR(40) NOT NULL,
  sitting_ref       VARCHAR(40) NOT NULL,
  coach_id          BIGINT UNSIGNED NOT NULL,
  reason            TEXT NOT NULL,
  called_at         ENUM('prep','live') NOT NULL,           -- reading the report (C5) or during the debrief (C6). Either way, no debrief happens on this reading (MS, 17 Oct 2026)
  offered_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  aarambh_status    ENUM('received','issued','declined') NOT NULL DEFAULT 'received',
  UNIQUE KEY uq_ro_coach_person (coach_id, person_ref),   -- one per person per coach
  CONSTRAINT fk_ro_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_ro_coach   FOREIGN KEY (coach_id) REFERENCES coaches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coaching_engagements (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  person_ref        VARCHAR(40) NOT NULL,
  started_on        DATE NOT NULL,
  last_booking_on   DATE NOT NULL,
  state             ENUM('active','ended') NOT NULL DEFAULT 'active',
  ended_reason      ENUM('no_booking_60d','coach_closed','admin_closed') NULL,
  KEY idx_ce_coach (coach_id, state),
  CONSTRAINT fk_ce_coach FOREIGN KEY (coach_id) REFERENCES coaches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coaching_keys (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  debrief_id        BIGINT UNSIGNED NOT NULL,              -- the booking that issued it (one key per booking)
  coach_id          BIGINT UNSIGNED NOT NULL,
  key_code          CHAR(12) NOT NULL,
  issued_at         DATETIME NOT NULL,                     -- = letter approval
  expires_at        DATETIME NOT NULL,                     -- issued + 60 days
  status            ENUM('issued','used','expired') NOT NULL DEFAULT 'issued',
  used_debrief_id   BIGINT UNSIGNED NULL,
  UNIQUE KEY uq_ck_debrief (debrief_id),
  UNIQUE KEY uq_ck_code (key_code),
  CONSTRAINT fk_ck_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_ck_coach   FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_ck_used    FOREIGN KEY (used_debrief_id) REFERENCES debriefs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coaching_session_notes (
  debrief_id        BIGINT UNSIGNED NOT NULL PRIMARY KEY,  -- session_type = 'coaching'
  focus             VARCHAR(300) NULL,
  current_node      ENUM('S','S2','E','E2','T','T2','U','END') NOT NULL DEFAULT 'S',
  state_read        ENUM('here_curious','fast_anxious','flat_fine') NULL,
  action            VARCHAR(300) NULL,
  follow_up_on      DATE NULL,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_csn_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[PRIVATE] the assigned coach only';

CREATE TABLE coaching_step_notes (
  debrief_id        BIGINT UNSIGNED NOT NULL,
  node              ENUM('S','S2','E','E2','T','T2','U','END') NOT NULL,
  note              TEXT NULL,                             -- [PRIVATE]
  PRIMARY KEY (debrief_id, node),
  CONSTRAINT fk_csteps_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================================================
-- 7 · ORGANISATIONS
-- =====================================================================================

CREATE TABLE organisations (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(160) NOT NULL,
  type              ENUM('corporate','university','industry') NOT NULL,
  brief             TEXT NULL,
  aarambh_org_ref   VARCHAR(40) NULL,                      -- Aarambh's organisation id from H2
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_org_ref (aarambh_org_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE engagements (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  organisation_id   BIGINT UNSIGNED NOT NULL,
  starts_on         DATE NOT NULL,
  ends_on           DATE NOT NULL,
  state             ENUM('draft','active','closed') NOT NULL DEFAULT 'draft',
  expected_sessions INT UNSIGNED NULL,
  KEY idx_eng_org (organisation_id, state),
  CONSTRAINT chk_eng_dates CHECK (ends_on >= starts_on),
  CONSTRAINT fk_eng_org FOREIGN KEY (organisation_id) REFERENCES organisations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE organisation_programmes (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  organisation_id   BIGINT UNSIGNED NOT NULL,
  name              VARCHAR(160) NOT NULL,
  kind              ENUM('learning','training','mentoring','counselling') NOT NULL,
  description       TEXT NULL,
  active            TINYINT(1) NOT NULL DEFAULT 1,
  KEY idx_op_org (organisation_id),
  CONSTRAINT fk_op_org FOREIGN KEY (organisation_id) REFERENCES organisations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE vetted_coaches (
  coach_id          BIGINT UNSIGNED NOT NULL,
  organisation_id   BIGINT UNSIGNED NOT NULL,
  granted_by        BIGINT UNSIGNED NOT NULL,
  granted_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at        DATETIME NULL,
  PRIMARY KEY (coach_id, organisation_id),
  CONSTRAINT fk_vc_coach FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_vc_org   FOREIGN KEY (organisation_id) REFERENCES organisations(id),
  CONSTRAINT fk_vc_by    FOREIGN KEY (granted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE client_share_consents (
  debrief_id        BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  consented         TINYINT(1) NOT NULL,
  consented_at      DATETIME NOT NULL,
  source            ENUM('booking_feed','settle') NOT NULL DEFAULT 'booking_feed',
  CONSTRAINT fk_csc_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================================================
-- 8 · MONEY  [MONEY] — Finance admin only. Every endpoint touching these returns 403 for any
--     other role; money fields are left out of every other role's responses.
-- =====================================================================================

CREATE TABLE pay_slabs (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code              VARCHAR(10) NOT NULL,
  commitment_band   ENUM('u5','5_10','10_20','20p') NULL,
  UNIQUE KEY uq_ps_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[MONEY] Finance admin only';

CREATE TABLE pay_slab_rates (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pay_slab_id       BIGINT UNSIGNED NOT NULL,
  component         ENUM('monthly_commitment','debrief','coaching_one_to_one','coaching_group') NOT NULL,
  amount_minor      INT UNSIGNED NULL,                     -- [MONEY] blank until agreed
  currency          CHAR(3) NOT NULL DEFAULT 'INR',
  effective_from    DATE NOT NULL,
  KEY idx_psr (pay_slab_id, component, effective_from),
  CONSTRAINT fk_psr_slab FOREIGN KEY (pay_slab_id) REFERENCES pay_slabs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[MONEY] Finance admin only';

CREATE TABLE coach_pay_agreements (
  id                     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id               BIGINT UNSIGNED NOT NULL,
  kind                   ENUM('standard_slab','fixed_per_session','share_of_client_fee') NOT NULL,
  pay_slab_id            BIGINT UNSIGNED NULL,             -- the coach's slab lives HERE only (not on coaches)
  rate_debrief_minor     INT UNSIGNED NULL,                -- [MONEY]
  rate_one_to_one_minor  INT UNSIGNED NULL,                -- [MONEY]
  rate_group_minor       INT UNSIGNED NULL,                -- [MONEY]
  currency               CHAR(3) NULL,
  share_basis_points     INT UNSIGNED NULL,                -- [MONEY] share of the client fee
  effective_from         DATE NOT NULL,                    -- today or later
  superseded_at          DATETIME NULL,
  reason                 TEXT NOT NULL,
  agreed_by              BIGINT UNSIGNED NOT NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_cpa_coach (coach_id, effective_from),
  CONSTRAINT fk_cpa_coach FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_cpa_slab  FOREIGN KEY (pay_slab_id) REFERENCES pay_slabs(id),
  CONSTRAINT fk_cpa_by    FOREIGN KEY (agreed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[MONEY] Finance admin only';

CREATE TABLE faculty_pay_terms (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  faculty_id        BIGINT UNSIGNED NOT NULL,
  rate_band         VARCHAR(10) NOT NULL,                  -- [MONEY] band code only
  effective_from    DATE NOT NULL,
  set_by            BIGINT UNSIGNED NOT NULL,
  KEY idx_fpt (faculty_id, effective_from),
  CONSTRAINT fk_fpt_fac FOREIGN KEY (faculty_id) REFERENCES faculty(id),
  CONSTRAINT fk_fpt_by  FOREIGN KEY (set_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[MONEY] Finance admin only';

CREATE TABLE tier_rates (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  client_type       ENUM('student','executive','mid_management','senior') NOT NULL,
  tier_key          ENUM('standard','plus','premium') NOT NULL,
  session_type      ENUM('debrief','coaching_one_to_one','coaching_group') NOT NULL,
  amount_minor      INT UNSIGNED NOT NULL,                 -- [MONEY] billed to Aarambh; no formula links it to coach pay
  currency          CHAR(3) NOT NULL DEFAULT 'INR',
  effective_from    DATE NOT NULL,
  set_by            BIGINT UNSIGNED NOT NULL,
  KEY idx_tr (client_type, tier_key, session_type, effective_from),
  CONSTRAINT fk_tr_tier FOREIGN KEY (tier_key) REFERENCES upgrade_tiers(tier_key),
  CONSTRAINT fk_tr_by   FOREIGN KEY (set_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[MONEY] Finance admin only';

CREATE TABLE pay_runs (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  period            CHAR(7) NOT NULL,                      -- YYYY-MM
  state             ENUM('draft','approved','paid','held_no_bank') NOT NULL DEFAULT 'draft',
  approved_by       BIGINT UNSIGNED NULL,
  approved_at       DATETIME NULL,
  UNIQUE KEY uq_pr_period (period),
  CONSTRAINT fk_pr_by FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[MONEY] Finance admin only';

CREATE TABLE pay_lines (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pay_run_id        BIGINT UNSIGNED NOT NULL,
  coach_id          BIGINT UNSIGNED NOT NULL,
  debrief_id        BIGINT UNSIGNED NULL,                  -- the session it pays for (NULL for the monthly commitment)
  component         ENUM('monthly_commitment','debrief','coaching_one_to_one','coaching_group','late_cancel_share','did_not_join') NOT NULL,
  amount_minor      INT NOT NULL,                          -- [MONEY]
  currency          CHAR(3) NOT NULL DEFAULT 'INR',
  KEY idx_pl_run_coach (pay_run_id, coach_id),
  CONSTRAINT fk_pl_run     FOREIGN KEY (pay_run_id) REFERENCES pay_runs(id),
  CONSTRAINT fk_pl_coach   FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_pl_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[MONEY] Finance admin only';

-- =====================================================================================
-- 9 · SETTINGS
-- =====================================================================================

CREATE TABLE settings (
  setting_key       VARCHAR(80) NOT NULL PRIMARY KEY,
  group_key         ENUM('assigning','calendar_drops','money_packs','training_credential','consent_recording','coaching_rules','wording_lists','organisations') NOT NULL,
  label             VARCHAR(120) NOT NULL,
  value_type        ENUM('int','decimal','bool','enum','text','list','money','json') NOT NULL,
  value_int         INT NULL,
  value_text        TEXT NULL,
  value_json        JSON NULL,
  amount_minor      INT NULL,                              -- [MONEY] money_packs group only; left out of Admin responses
  currency          CHAR(3) NULL,
  owner_role        ENUM('admin','finance_admin') NOT NULL,
  effective_from    DATETIME NOT NULL,
  updated_by        BIGINT UNSIGNED NULL,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_set_group (group_key),
  CONSTRAINT fk_set_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE setting_changes (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  setting_key       VARCHAR(80) NOT NULL,
  old_value         JSON NULL,                             -- money settings: Finance admin only
  new_value         JSON NOT NULL,
  effective_from    DATETIME NOT NULL,                     -- now or later; never backwards
  reason            TEXT NOT NULL,
  changed_by        BIGINT UNSIGNED NOT NULL,
  changed_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_sc_key (setting_key, effective_from),
  CONSTRAINT fk_sc_key FOREIGN KEY (setting_key) REFERENCES settings(setting_key),
  CONSTRAINT fk_sc_by  FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE upgrade_tiers (
  tier_key          ENUM('standard','plus','premium') NOT NULL PRIMARY KEY,
  label             VARCHAR(40) NOT NULL,
  delivers          TEXT NOT NULL,
  qualifies_rule    JSON NULL,                             -- category set + level or all-rounder needed
  availability      ENUM('included','upgrade_at_booking') NOT NULL,
  effective_from    DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coaching_packs (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sessions          TINYINT UNSIGNED NOT NULL,             -- price is a Finance-admin money setting, never here
  active            TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_cpk_sessions (sessions)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================================================
-- 10 · REQUESTS, ALERTS & LOG
-- =====================================================================================

CREATE TABLE requests (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL,              -- who asked (a trainee may ask before a coach row matters)
  coach_id          BIGINT UNSIGNED NULL,
  type              ENUM('detail_correction','time_commitment','public_card','move_debrief','locked_slot') NOT NULL,
  summary           VARCHAR(300) NOT NULL,
  reason            TEXT NULL,                             -- the coach's why
  payload           JSON NULL,                             -- the proposed new value
  slot_id           BIGINT UNSIGNED NULL,
  debrief_id        BIGINT UNSIGNED NULL,
  is_late_drop      TINYINT(1) NOT NULL DEFAULT 0,
  state             ENUM('open','approved','declined') NOT NULL DEFAULT 'open',
  decided_by        BIGINT UNSIGNED NULL,
  decided_at        DATETIME NULL,
  decision_reason   TEXT NULL,                             -- required for a decline
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_req_state (state, created_at),
  KEY idx_req_coach (coach_id, type, state),
  CONSTRAINT fk_req_user    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_req_coach   FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_req_slot    FOREIGN KEY (slot_id) REFERENCES slots(id),
  CONSTRAINT fk_req_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_req_by      FOREIGN KEY (decided_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE same_day_alerts (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  coach_id          BIGINT UNSIGNED NOT NULL,
  debrief_id        BIGINT UNSIGNED NULL,
  kind              ENUM('ended_early','did_not_join','late_drop') NOT NULL,
  severity          ENUM('call_today','logged') NOT NULL,
  summary           VARCHAR(200) NOT NULL,                 -- no client surname
  occurred_at       DATETIME NOT NULL,
  acknowledged_by   BIGINT UNSIGNED NULL,
  acknowledged_at   DATETIME NULL,
  KEY idx_sda_open (acknowledged_at, occurred_at),
  CONSTRAINT fk_sda_coach   FOREIGN KEY (coach_id) REFERENCES coaches(id),
  CONSTRAINT fk_sda_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_sda_by      FOREIGN KEY (acknowledged_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE notifications (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL,
  kind              ENUM('new_debrief','cancelled_late','no_show','moved','batch_dates_changed','undertaking_reminder','own_assessment_reminder','request_decided','offer','invite','guide_updated','code_updated') NOT NULL,
  debrief_id        BIGINT UNSIGNED NULL,
  batch_id          BIGINT UNSIGNED NULL,
  request_id        BIGINT UNSIGNED NULL,
  body              VARCHAR(300) NOT NULL,
  reason            TEXT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at           DATETIME NULL,
  KEY idx_notif_user (user_id, read_at),
  CONSTRAINT fk_notif_user    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_notif_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id),
  CONSTRAINT fk_notif_batch   FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_notif_req     FOREIGN KEY (request_id) REFERENCES requests(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE integration_events (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  direction         ENUM('in','out') NOT NULL,
  call_code         ENUM('H1','H2','H3','H4','H5','H6','H7','H8','REVOKE') NOT NULL,
  idempotency_key   VARCHAR(80) NOT NULL,
  debrief_id        BIGINT UNSIGNED NULL,
  external_ref      VARCHAR(40) NULL,                      -- bookingId / sittingId it concerned
  event_kind        VARCHAR(40) NULL,                      -- e.g. H5 superseded / integrity_changed / withdrawn / opened_updated
  http_status       SMALLINT UNSIGNED NULL,
  result            ENUM('ok','rejected','retrying','failed') NOT NULL,
  occurred_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- NO body: personal fields are never logged
  UNIQUE KEY uq_ie_idem (direction, call_code, idempotency_key),
  KEY idx_ie_debrief (debrief_id),
  CONSTRAINT fk_ie_debrief FOREIGN KEY (debrief_id) REFERENCES debriefs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE activity_log (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  occurred_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor_user_id     BIGINT UNSIGNED NULL,                  -- NULL = system job
  actor_role        ENUM('admin','finance_admin','faculty','mentor','coach_ours','coach_org','aarambh_reviewer','system') NOT NULL,
  entity_type       VARCHAR(40) NOT NULL,
  entity_id         BIGINT UNSIGNED NULL,
  action            VARCHAR(80) NOT NULL,
  before_json       JSON NULL,                             -- money entries readable by Finance admin only
  after_json        JSON NULL,
  reason            TEXT NOT NULL,                         -- required on every admin write
  is_money          TINYINT(1) NOT NULL DEFAULT 0,
  KEY idx_al_entity (entity_type, entity_id),
  KEY idx_al_actor (actor_user_id, occurred_at),
  KEY idx_al_time (occurred_at),
  CONSTRAINT fk_al_actor FOREIGN KEY (actor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='append-only: grant INSERT and SELECT only; no UPDATE or DELETE';

SET FOREIGN_KEY_CHECKS = 1;

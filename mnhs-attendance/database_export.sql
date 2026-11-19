-- Database Export
-- Exported: 2026-09-08 08:13:43
-- Database: mnhs-attendance

CREATE TABLE "academic_years" ("id" varchar not null, "name" varchar not null, "start_date" date not null, "end_date" date not null, "is_current" tinyint(1) not null default '0', "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, primary key ("id"));

INSERT INTO "academic_years" VALUES ('6922f783-f367-4b89-aa3d-94d8c7f8ceba','2026-2027','2026-06-01 00:00:00','2027-03-31 00:00:00',1,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);

CREATE TABLE "admission_slips" ("id" varchar not null, "student_id" varchar not null, "absence_date" date not null, "reason" text not null, "guardian_reference" varchar, "attachment_path" varchar, "status" varchar check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "reviewed_by" integer, "review_notes" text, "reviewed_at" datetime, "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, foreign key("student_id") references "students"("id") on delete cascade, foreign key("reviewed_by") references "users"("id") on delete set null, primary key ("id"));

INSERT INTO "admission_slips" VALUES ('7b073fc0-07f0-40fd-b269-62ef463a4f1a','0e5dc839-e708-41ba-8f23-2812371b9018','2026-09-05','Family emergency',NULL,NULL,'pending',NULL,NULL,NULL,'2026-09-06T17:07:43.450164','2026-09-06T17:07:43.450164',NULL);

CREATE TABLE "attendance_records" ("id" varchar not null, "student_id" varchar not null, "section_id" varchar not null, "date" date not null, "status" varchar check ("status" in ('present', 'late', 'absent')) not null default 'absent', "time_in" time, "source" varchar check ("source" in ('scan', 'manual')) not null default 'scan', "recorded_by" integer, "metadata" text, "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, foreign key("student_id") references "students"("id") on delete cascade, foreign key("section_id") references "sections"("id") on delete cascade, foreign key("recorded_by") references "users"("id") on delete set null, primary key ("id"));

INSERT INTO "attendance_records" VALUES ('26907e6a-1606-4b7d-b091-1bb65ae1d673','0e5dc839-e708-41ba-8f23-2812371b9018','85a57ea4-d844-44af-9e39-148cff74197f','2026-09-06','present','07:30:00','scan',NULL,NULL,'2026-09-06T16:58:05.162130','2026-09-06T16:58:05.162130',NULL);
INSERT INTO "attendance_records" VALUES ('eca83276-3826-45ff-b212-38a23dddd34e','96ce2f3c-467c-4f45-9096-d6e70cceaca8','a9837aff-22e8-4a57-abf4-a192bb396714','2026-09-06','present','07:30:00','scan',NULL,NULL,'2026-09-06T16:58:05.164130','2026-09-06T16:58:05.164130',NULL);
INSERT INTO "attendance_records" VALUES ('c242a456-7d04-4259-8cfa-a554541e3d43','b5551263-d089-4bcf-b315-7ab6b9abd3b7','caf9c3b6-042a-4da3-a275-e165ae1f51ba','2026-09-06','present','07:30:00','scan',NULL,NULL,'2026-09-06T16:58:05.164130','2026-09-06T16:58:05.164130',NULL);

CREATE TABLE "audit_logs" ("id" varchar not null, "user_id" integer, "event" varchar not null, "auditable_type" varchar not null, "auditable_id" varchar not null, "old_values" text, "new_values" text, "ip_address" varchar, "user_agent" varchar, "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete set null, primary key ("id"));

CREATE TABLE "cache" ("key" varchar not null, "value" text not null, "expiration" integer not null, primary key ("key"));

CREATE TABLE "cache_locks" ("key" varchar not null, "owner" varchar not null, "expiration" integer not null, primary key ("key"));

CREATE TABLE "failed_jobs" ("id" integer primary key autoincrement not null, "uuid" varchar not null, "connection" varchar not null, "queue" varchar not null, "payload" text not null, "exception" text not null, "failed_at" datetime not null default CURRENT_TIMESTAMP);

CREATE TABLE "grade_levels" ("id" varchar not null, "name" varchar not null, "level_number" integer not null, "academic_year_id" varchar not null, "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, foreign key("academic_year_id") references "academic_years"("id") on delete cascade, primary key ("id"));

INSERT INTO "grade_levels" VALUES ('4bab36a9-ffa4-4286-a15b-a25cf5f82d08','Grade 7',7,'6922f783-f367-4b89-aa3d-94d8c7f8ceba','2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "grade_levels" VALUES ('ae918f73-ae3b-4713-97ee-713478ce8bf9','Grade 8',8,'6922f783-f367-4b89-aa3d-94d8c7f8ceba','2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "grade_levels" VALUES ('6d4539e0-21a4-4751-bd93-5d2af5e51039','Grade 9',9,'6922f783-f367-4b89-aa3d-94d8c7f8ceba','2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "grade_levels" VALUES ('199299d3-6a04-4374-8105-31a5ef06f7fc','Grade 10',10,'6922f783-f367-4b89-aa3d-94d8c7f8ceba','2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);

CREATE TABLE "guardian_notifications" ("id" varchar not null, "student_id" varchar not null, "attendance_record_id" varchar, "guardian_email" varchar not null, "subject" varchar not null, "body" text not null, "status" varchar check ("status" in ('pending', 'sent', 'failed')) not null default 'pending', "failure_reason" text, "attempts" integer not null default '0', "sent_at" datetime, "created_at" datetime, "updated_at" datetime, foreign key("student_id") references "students"("id") on delete cascade, foreign key("attendance_record_id") references "attendance_records"("id") on delete set null, primary key ("id"));

INSERT INTO "guardian_notifications" VALUES ('f3833e3d-d404-43e3-90b1-ba1a7009f220','0e5dc839-e708-41ba-8f23-2812371b9018','1','maria.parent@email.com','Attendance Notification - Maria Santos has arrived at school','Your child Maria Santos has arrived at school at 07:30 AM on September 06, 2026.','sent',NULL,0,NULL,'2026-09-06T16:58:05.164130','2026-09-06T16:58:05.164130');
INSERT INTO "guardian_notifications" VALUES ('d58ba5fa-1753-4212-9e64-df97a977b0a6','96ce2f3c-467c-4f45-9096-d6e70cceaca8','2','jose.parent@email.com','Attendance Notification - Jose Reyes has arrived at school','Your child Jose Reyes has arrived at school at 07:30 AM on September 06, 2026.','sent',NULL,0,NULL,'2026-09-06T16:58:05.164130','2026-09-06T16:58:05.164130');
INSERT INTO "guardian_notifications" VALUES ('e2e5a4a6-5ee0-43cf-9bb8-a6762857789c','b5551263-d089-4bcf-b315-7ab6b9abd3b7','3','ana.parent@email.com','Attendance Notification - Ana Cruz has arrived at school','Your child Ana Cruz has arrived at school at 07:30 AM on September 06, 2026.','sent',NULL,0,NULL,'2026-09-06T16:58:05.164130','2026-09-06T16:58:05.164130');

CREATE TABLE "job_batches" ("id" varchar not null, "name" varchar not null, "total_jobs" integer not null, "pending_jobs" integer not null, "failed_jobs" integer not null, "failed_job_ids" text not null, "options" text, "cancelled_at" integer, "created_at" integer not null, "finished_at" integer, primary key ("id"));

CREATE TABLE "jobs" ("id" integer primary key autoincrement not null, "queue" varchar not null, "payload" text not null, "attempts" integer not null, "reserved_at" integer, "available_at" integer not null, "created_at" integer not null);

CREATE TABLE "migrations" ("id" integer primary key autoincrement not null, "migration" varchar not null, "batch" integer not null);

INSERT INTO "migrations" VALUES (1,'0001_01_01_000000_create_users_table',1);
INSERT INTO "migrations" VALUES (2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO "migrations" VALUES (3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO "migrations" VALUES (4,'2026_09_05_035252_create_personal_access_tokens_table',1);
INSERT INTO "migrations" VALUES (5,'2026_09_05_035931_add_role_to_users_table',1);
INSERT INTO "migrations" VALUES (6,'2026_09_05_035932_create_academic_years_table',1);
INSERT INTO "migrations" VALUES (7,'2026_09_05_035933_create_grade_levels_table',1);
INSERT INTO "migrations" VALUES (8,'2026_09_05_035934_create_sections_table',1);
INSERT INTO "migrations" VALUES (9,'2026_09_05_035935_create_section_schedules_table',1);
INSERT INTO "migrations" VALUES (10,'2026_09_05_035936_create_students_table',1);
INSERT INTO "migrations" VALUES (11,'2026_09_05_035937_create_teacher_section_assignments_table',1);
INSERT INTO "migrations" VALUES (12,'2026_09_05_035938_create_attendance_records_table',1);
INSERT INTO "migrations" VALUES (13,'2026_09_05_035939_create_admission_slips_table',1);
INSERT INTO "migrations" VALUES (14,'2026_09_05_035940_create_guardian_notifications_table',1);
INSERT INTO "migrations" VALUES (15,'2026_09_05_035941_create_audit_logs_table',1);
INSERT INTO "migrations" VALUES (16,'2026_09_05_041023_add_qr_token_to_students_table',1);

CREATE TABLE "password_reset_tokens" ("email" varchar not null, "token" varchar not null, "created_at" datetime, primary key ("email"));

CREATE TABLE "personal_access_tokens" ("id" integer primary key autoincrement not null, "tokenable_type" varchar not null, "tokenable_id" integer not null, "name" text not null, "token" varchar not null, "abilities" text, "last_used_at" datetime, "expires_at" datetime, "created_at" datetime, "updated_at" datetime);

CREATE TABLE "section_schedules" ("id" varchar not null, "section_id" varchar not null, "day_of_week" varchar not null, "start_time" time not null, "end_time" time not null, "grace_minutes" integer not null default '15', "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, foreign key("section_id") references "sections"("id") on delete cascade, primary key ("id"));

INSERT INTO "section_schedules" VALUES ('adf41ccf-2425-4117-afd1-cd27d9fdc65d','85a57ea4-d844-44af-9e39-148cff74197f','Monday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('1fc3917e-50ee-4561-afc4-6570f381e955','85a57ea4-d844-44af-9e39-148cff74197f','Tuesday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('fda1b19a-34c6-4a0e-b4a7-d2e8c89f1c4c','85a57ea4-d844-44af-9e39-148cff74197f','Wednesday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('e6589f21-cdc0-4700-a837-5d32eba0a9ff','85a57ea4-d844-44af-9e39-148cff74197f','Thursday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('07e0d59c-3335-4507-a6f2-2ff913c20796','85a57ea4-d844-44af-9e39-148cff74197f','Friday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('880a085e-fb19-49c5-baea-205ad2fb6316','a9837aff-22e8-4a57-abf4-a192bb396714','Monday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('edb16e71-23b8-42f4-a753-46208fb0eb1e','a9837aff-22e8-4a57-abf4-a192bb396714','Tuesday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('23b6e2e5-9ec5-4691-9729-8a1e1ee0fa44','a9837aff-22e8-4a57-abf4-a192bb396714','Wednesday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('849f51cb-44e1-4e87-b94d-ed2937bd4f09','a9837aff-22e8-4a57-abf4-a192bb396714','Thursday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('22cb00e3-9f3d-4de6-9e70-80454b3be45b','a9837aff-22e8-4a57-abf4-a192bb396714','Friday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('ee3d172b-5922-4124-bc57-aaac1f086433','caf9c3b6-042a-4da3-a275-e165ae1f51ba','Monday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('d21a8a2a-66fa-4cb4-8f7e-d3d326382677','caf9c3b6-042a-4da3-a275-e165ae1f51ba','Tuesday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('fe6f31a4-cca4-4f5b-a08e-74bf6b13cc98','caf9c3b6-042a-4da3-a275-e165ae1f51ba','Wednesday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('4317d807-5fd3-4e12-a352-5ae74d7d030a','caf9c3b6-042a-4da3-a275-e165ae1f51ba','Thursday','07:30','16:00',15,'2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "section_schedules" VALUES ('5e357ee4-7ccf-4bdb-9ac3-5c559d91cde5','caf9c3b6-042a-4da3-a275-e165ae1f51ba','Friday','07:30','16:00',15,'2026-09-05 07:28:23','2026-09-05 07:28:23',NULL);
INSERT INTO "section_schedules" VALUES ('2f21e7c0-54ca-412f-b5a1-67459add6cc3','456f9e23-7e17-441b-ba75-5c145699b888','Monday','07:30','16:00',15,'2026-09-05 07:28:23','2026-09-05 07:28:23',NULL);
INSERT INTO "section_schedules" VALUES ('6057ab26-b152-42b9-9576-0a5c221c08a2','456f9e23-7e17-441b-ba75-5c145699b888','Tuesday','07:30','16:00',15,'2026-09-05 07:28:23','2026-09-05 07:28:23',NULL);
INSERT INTO "section_schedules" VALUES ('89bee474-6cc1-4169-b837-19e795ca570c','456f9e23-7e17-441b-ba75-5c145699b888','Wednesday','07:30','16:00',15,'2026-09-05 07:28:23','2026-09-05 07:28:23',NULL);
INSERT INTO "section_schedules" VALUES ('df1e52ea-dd23-4e8e-9ccd-9cbb9ac3b7e6','456f9e23-7e17-441b-ba75-5c145699b888','Thursday','07:30','16:00',15,'2026-09-05 07:28:23','2026-09-05 07:28:23',NULL);
INSERT INTO "section_schedules" VALUES ('e52030a8-106c-4ec2-8491-caf9f0d86edf','456f9e23-7e17-441b-ba75-5c145699b888','Friday','07:30','16:00',15,'2026-09-05 07:28:23','2026-09-05 07:28:23',NULL);

CREATE TABLE "sections" ("id" varchar not null, "name" varchar not null, "grade_level_id" varchar not null, "academic_year_id" varchar not null, "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, foreign key("grade_level_id") references "grade_levels"("id") on delete cascade, foreign key("academic_year_id") references "academic_years"("id") on delete cascade, primary key ("id"));

INSERT INTO "sections" VALUES ('85a57ea4-d844-44af-9e39-148cff74197f','Grade 7 - A','4bab36a9-ffa4-4286-a15b-a25cf5f82d08','6922f783-f367-4b89-aa3d-94d8c7f8ceba','2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "sections" VALUES ('a9837aff-22e8-4a57-abf4-a192bb396714','Grade 8 - A','ae918f73-ae3b-4713-97ee-713478ce8bf9','6922f783-f367-4b89-aa3d-94d8c7f8ceba','2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "sections" VALUES ('caf9c3b6-042a-4da3-a275-e165ae1f51ba','Grade 9 - A','6d4539e0-21a4-4751-bd93-5d2af5e51039','6922f783-f367-4b89-aa3d-94d8c7f8ceba','2026-09-05 07:28:22','2026-09-05 07:28:22',NULL);
INSERT INTO "sections" VALUES ('456f9e23-7e17-441b-ba75-5c145699b888','Grade 10 - A','199299d3-6a04-4374-8105-31a5ef06f7fc','6922f783-f367-4b89-aa3d-94d8c7f8ceba','2026-09-05 07:28:23','2026-09-05 07:28:23',NULL);

CREATE TABLE "sessions" ("id" varchar not null, "user_id" integer, "ip_address" varchar, "user_agent" text, "payload" text not null, "last_activity" integer not null, primary key ("id"));

CREATE TABLE "students" ("id" varchar not null, "user_id" integer not null, "lrn" varchar not null, "first_name" varchar not null, "last_name" varchar not null, "middle_name" varchar, "grade_level" varchar not null, "section_id" varchar, "photo_path" varchar, "guardian_name" varchar, "guardian_email" varchar, "is_active" tinyint(1) not null default '1', "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, "qr_token" varchar not null, foreign key("user_id") references "users"("id") on delete cascade, foreign key("section_id") references "sections"("id") on delete set null, primary key ("id"));

INSERT INTO "students" VALUES ('0e5dc839-e708-41ba-8f23-2812371b9018',5,'2026-00001','Maria','Santos',NULL,'Grade 7','85a57ea4-d844-44af-9e39-148cff74197f',NULL,'Parent of Maria','maria.parent@email.com',1,'2026-09-05 07:28:23','2026-09-05 07:28:23',NULL,'12249703-77e0-47a0-a66a-ebea6906a046');
INSERT INTO "students" VALUES ('96ce2f3c-467c-4f45-9096-d6e70cceaca8',6,'2026-00002','Jose','Reyes',NULL,'Grade 7','a9837aff-22e8-4a57-abf4-a192bb396714',NULL,'Parent of Jose','jose.parent@email.com',1,'2026-09-05 07:28:23','2026-09-05 07:28:23',NULL,'e1339ae4-2479-4bf9-ac5f-13fc108f6d17');
INSERT INTO "students" VALUES ('b5551263-d089-4bcf-b315-7ab6b9abd3b7',7,'2026-00003','Ana','Cruz',NULL,'Grade 7','caf9c3b6-042a-4da3-a275-e165ae1f51ba',NULL,'Parent of Ana','ana.parent@email.com',1,'2026-09-05 07:28:23','2026-09-05 07:28:23',NULL,'25c3c4de-ef24-4bd7-b6a4-df5313f0e564');
INSERT INTO "students" VALUES ('4f4ffda3-ab28-4ab8-8711-936f98ee8f10',8,'2026-00004','Pedro','Garcia',NULL,'Grade 7','456f9e23-7e17-441b-ba75-5c145699b888',NULL,'Parent of Pedro','pedro.parent@email.com',1,'2026-09-05 07:28:24','2026-09-05 07:28:24',NULL,'803525bb-dbbc-4bd2-a43e-09f74d4863f9');
INSERT INTO "students" VALUES ('3f0e7f50-da60-487f-baf1-865d5eed3507',9,'2026-00005','Rosa','Mendoza',NULL,'Grade 7','85a57ea4-d844-44af-9e39-148cff74197f',NULL,'Parent of Rosa','rosa.parent@email.com',1,'2026-09-05 07:28:24','2026-09-05 07:28:24',NULL,'19257353-d1d9-48ba-9c4b-a031e7f7536e');
INSERT INTO "students" VALUES ('98ec24b8-335d-4fe0-ad2a-ca2fc7fd7203',10,'123456789012','Juan','Dela Cruz','Santos','Grade 7','456f9e23-7e17-441b-ba75-5c145699b888',NULL,'Maria Dela Cruz','maria.delacruz@email.com',1,'2026-09-06T17:00:15.673368','2026-09-06T17:00:15.673368',NULL,'2646745b-00e0-4652-a74f-605ef0ee6050');
INSERT INTO "students" VALUES ('45caa328-813e-45a6-ac16-57dc8026eb63',11,'987654321098','Pedro','Penduko',NULL,'Grade 7','456f9e23-7e17-441b-ba75-5c145699b888',NULL,'Bathala dela Cruz','bathala@email.com',1,'2026-09-06T17:00:15.673368','2026-09-06T17:00:15.673368',NULL,'a41dc66a-708c-4abe-87e0-d8db9bd6622d');
INSERT INTO "students" VALUES ('1d5a6de4-2465-47a9-bb0d-bdf41f93630b',12,'555555555555','Ana','Claudia','Resureccion','Grade 7','456f9e23-7e17-441b-ba75-5c145699b888',NULL,'Parent of Ana','ana.parent@email.com',1,'2026-09-06T17:00:15.673368','2026-09-06T17:00:15.673368',NULL,'966cc296-ce66-45f7-af0d-2bf00b3ffb97');
INSERT INTO "students" VALUES ('dab4bed1-d87c-4a1d-8097-bdee75892986',13,'999999999999','Inactive','Student',NULL,'Grade 7',NULL,NULL,'Parent of Inactive','inactive.parent@email.com',0,'2026-09-06T17:07:43.451166','2026-09-06T17:07:43.451166',NULL,'4a994748-4aa9-40fe-9f70-7e588ef1263a');

CREATE TABLE "teacher_section_assignments" ("id" varchar not null, "user_id" integer not null, "section_id" varchar not null, "academic_year_id" varchar not null, "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, foreign key("user_id") references "users"("id") on delete cascade, foreign key("section_id") references "sections"("id") on delete cascade, foreign key("academic_year_id") references "academic_years"("id") on delete cascade, primary key ("id"));

INSERT INTO "teacher_section_assignments" VALUES ('8066aa42-f62c-4f8b-83e1-4f4e7aba035f',3,'85a57ea4-d844-44af-9e39-148cff74197f','6922f783-f367-4b89-aa3d-94d8c7f8ceba','2026-09-05 07:28:23','2026-09-05 07:28:23',NULL);

CREATE TABLE "users" ("id" integer primary key autoincrement not null, "name" varchar not null, "email" varchar not null, "email_verified_at" datetime, "password" varchar not null, "remember_token" varchar, "created_at" datetime, "updated_at" datetime, "role" varchar not null default 'student', "phone" varchar, "is_active" tinyint(1) not null default '1', "force_password_change" tinyint(1) not null default '0', "deleted_at" datetime);

INSERT INTO "users" VALUES (1,'Super Admin','superadmin@mnhs.edu','2026-09-05 07:28:22','$2y$12$eV/SBLKDC1o20/bZPiOKQeIGFOcXxuZzmbTBNQp1DmI86/VJS63Qi',NULL,'2026-09-05 07:28:22','2026-09-05 07:28:22','super_admin',NULL,1,1,NULL);
INSERT INTO "users" VALUES (2,'School Admin','admin@mnhs.edu','2026-09-05 07:28:22','$2y$12$eV/SBLKDC1o20/bZPiOKQeIGFOcXxuZzmbTBNQp1DmI86/VJS63Qi',NULL,'2026-09-05 07:28:22','2026-09-05 07:28:22','admin',NULL,1,1,NULL);
INSERT INTO "users" VALUES (3,'Juan Dela Cruz','teacher@mnhs.edu','2026-09-05 07:28:22','$2y$12$eV/SBLKDC1o20/bZPiOKQeIGFOcXxuZzmbTBNQp1DmI86/VJS63Qi',NULL,'2026-09-05 07:28:22','2026-09-05 07:28:22','teacher',NULL,1,1,NULL);
INSERT INTO "users" VALUES (4,'Pedro Guard','guard@mnhs.edu','2026-09-05 07:28:22','$2y$12$eV/SBLKDC1o20/bZPiOKQeIGFOcXxuZzmbTBNQp1DmI86/VJS63Qi',NULL,'2026-09-05 07:28:22','2026-09-05 07:28:22','security_guard',NULL,1,1,NULL);
INSERT INTO "users" VALUES (5,'Maria Santos','student@mnhs.edu','2026-09-05 07:28:22','$2y$12$eV/SBLKDC1o20/bZPiOKQeIGFOcXxuZzmbTBNQp1DmI86/VJS63Qi',NULL,'2026-09-05 07:28:22','2026-09-05 07:28:22','student',NULL,1,1,NULL);
INSERT INTO "users" VALUES (6,'Jose Reyes','jose.reyes@student.mnhs.edu','2026-09-05 07:28:23','$2y$12$SV/ZZUCIuXzqzSwxIQWmpepb.JwESGPQit3z07jRSDuMfetKVXA0y',NULL,'2026-09-05 07:28:23','2026-09-05 07:28:23','student',NULL,1,1,NULL);
INSERT INTO "users" VALUES (7,'Ana Cruz','ana.cruz@student.mnhs.edu','2026-09-05 07:28:23','$2y$12$PE702D7.O0Ava8ecv/y9seqZAc9LGfZWnmZyocjqOWN1UOaPd2tEq',NULL,'2026-09-05 07:28:23','2026-09-05 07:28:23','student',NULL,1,1,NULL);
INSERT INTO "users" VALUES (8,'Pedro Garcia','pedro.garcia@student.mnhs.edu','2026-09-05 07:28:24','$2y$12$XO9OchFQDUoUDh4yqDNtReSECoZLpQDVZ/MJ9SVuFS4wJg/y24Zma',NULL,'2026-09-05 07:28:24','2026-09-05 07:28:24','student',NULL,1,1,NULL);
INSERT INTO "users" VALUES (9,'Rosa Mendoza','rosa.mendoza@student.mnhs.edu','2026-09-05 07:28:24','$2y$12$cpbVmQWBVjpoHurGtD9VWuFLoeSmnemgw9FbTeW5CvUjg8aR3iJ52',NULL,'2026-09-05 07:28:24','2026-09-05 07:28:24','student',NULL,1,1,NULL);
INSERT INTO "users" VALUES (10,'Juan Dela Cruz','juan.dela.cruz@student.mnhs.edu','2026-09-06T17:00:15.672366','$2y$12$eV/SBLKDC1o20/bZPiOKQeIGFOcXxuZzmbTBNQp1DmI86/VJS63Qi',NULL,'2026-09-06T17:00:15.672366','2026-09-06T17:00:15.672366','student',NULL,1,1,NULL);
INSERT INTO "users" VALUES (11,'Pedro Penduko','pedro.penduko@student.mnhs.edu','2026-09-06T17:00:15.673368','$2y$12$eV/SBLKDC1o20/bZPiOKQeIGFOcXxuZzmbTBNQp1DmI86/VJS63Qi',NULL,'2026-09-06T17:00:15.673368','2026-09-06T17:00:15.673368','student',NULL,1,1,NULL);
INSERT INTO "users" VALUES (12,'Ana Claudia','ana.claudia@student.mnhs.edu','2026-09-06T17:00:15.673368','$2y$12$eV/SBLKDC1o20/bZPiOKQeIGFOcXxuZzmbTBNQp1DmI86/VJS63Qi',NULL,'2026-09-06T17:00:15.673368','2026-09-06T17:00:15.673368','student',NULL,1,1,NULL);
INSERT INTO "users" VALUES (13,'Inactive Student','inactive.student@student.mnhs.edu','2026-09-06T17:07:43.451166','$2y$12$eV/SBLKDC1o20/bZPiOKQeIGFOcXxuZzmbTBNQp1DmI86/VJS63Qi',NULL,'2026-09-06T17:07:43.451166','2026-09-06T17:07:43.451166','student',NULL,0,1,NULL);

CREATE UNIQUE INDEX "users_email_unique" on "users" ("email");
CREATE INDEX "sessions_user_id_index" on "sessions" ("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions" ("last_activity");
CREATE INDEX "cache_expiration_index" on "cache" ("expiration");
CREATE INDEX "cache_locks_expiration_index" on "cache_locks" ("expiration");
CREATE INDEX "jobs_queue_index" on "jobs" ("queue");
CREATE INDEX "failed_jobs_connection_queue_failed_at_index" on "failed_jobs" ("connection", "queue", "failed_at");
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs" ("uuid");
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" on "personal_access_tokens" ("tokenable_type", "tokenable_id");
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" on "personal_access_tokens" ("token");
CREATE INDEX "personal_access_tokens_expires_at_index" on "personal_access_tokens" ("expires_at");
CREATE INDEX "sections_grade_level_id_academic_year_id_index" on "sections" ("grade_level_id", "academic_year_id");
CREATE INDEX "section_schedules_section_id_day_of_week_index" on "section_schedules" ("section_id", "day_of_week");
CREATE INDEX "students_section_id_is_active_index" on "students" ("section_id", "is_active");
CREATE INDEX "students_lrn_index" on "students" ("lrn");
CREATE UNIQUE INDEX "students_lrn_unique" on "students" ("lrn");
CREATE UNIQUE INDEX "teacher_section_assignments_user_id_section_id_academic_year_id_unique" on "teacher_section_assignments" ("user_id", "section_id", "academic_year_id");
CREATE UNIQUE INDEX "attendance_records_student_id_date_unique" on "attendance_records" ("student_id", "date");
CREATE INDEX "attendance_records_section_id_date_index" on "attendance_records" ("section_id", "date");
CREATE INDEX "attendance_records_date_status_index" on "attendance_records" ("date", "status");
CREATE INDEX "admission_slips_student_id_status_index" on "admission_slips" ("student_id", "status");
CREATE INDEX "admission_slips_absence_date_index" on "admission_slips" ("absence_date");
CREATE INDEX "guardian_notifications_status_created_at_index" on "guardian_notifications" ("status", "created_at");
CREATE INDEX "audit_logs_auditable_type_auditable_id_index" on "audit_logs" ("auditable_type", "auditable_id");
CREATE INDEX "audit_logs_created_at_index" on "audit_logs" ("created_at");
CREATE UNIQUE INDEX "students_qr_token_unique" on "students" ("qr_token");
### Veritabanı Tabloları (Markdown Table Format)

#### users
| Column       | Type                                   | Constraints/Notes                                  |
|--------------|----------------------------------------|----------------------------------------------------|
| id           | uuid                                   | pk                                                 |
| user_name    | varchar                                | unique                                             |
| email        | varchar                                | unique, nullable                                   |
| phone        | varchar                                | nullable                                           |
| password_hash| varchar                                | nullable                                           |
| role         | enum(super_user, authorized_user, reviewer) |                                                    |
| status       | enum(active, suspended, deleted)       |                                                    |
| created_at   | timestamptz                            |                                                    |
| updated_at   | timestamptz                            |                                                    |

#### sectors
| Column     | Type    | Constraints/Notes                |
|------------|---------|----------------------------------|
| id         | serial  | pk                               |
| code       | varchar | unique                           |
| name       | varchar |                                  |
| description| text    | nullable                         |

#### invites
| Column            | Type                                           | Constraints/Notes                                                                 |
|-------------------|------------------------------------------------|-----------------------------------------------------------------------------------|
| id                | uuid                                           | pk                                                                                |
| type              | enum(register_invite, view_invite)             |                                                                                   |
| created_by        | uuid                                           | fk -> users.id                                                                    |
| invite_jwt_hash   | varchar                                        | unique                                                                            |
| raw_jwt           | text                                           | encrypted at rest, nullable                                                       |
| expires_at        | timestamptz                                    | nullable; view_invite için zorunlu önerilir                                       |
| scope_list        | text[]                                         | örn: ['register-invite','view-invite','user-list']                                |
| filter_snapshot   | jsonb                                          | nullable                                                                          |
| status            | enum(pending, used, expired, revoked)          |                                                                                   |
| created_at        | timestamptz                                    |                                                                                   |
| used_at           | timestamptz                                    | nullable                                                                          |

#### applications
| Column                 | Type                                          | Constraints/Notes                                                                 |
|------------------------|-----------------------------------------------|-----------------------------------------------------------------------------------|
| id                     | uuid                                          | pk                                                                                |
| user_id                | uuid                                          | fk -> users.id (application owner)                                                |
| status                 | enum(draft, submitted, under_review, accepted, rejected, withdrawn) |                                            |
| primary_location       | varchar                                       | nullable                                                                          |
| primary_sector_id      | int                                           | fk -> sectors.id, nullable                                                        |
| token_filter_snapshot  | jsonb                                         | nullable (başvuru oluşturma/güncelleme anındaki token filtre aynası)             |
| created_at             | timestamptz                                   |                                                                                   |
| updated_at             | timestamptz                                   |                                                                                   |
| submitted_at           | timestamptz                                   | nullable                                                                          |

#### application_sectors
| Column         | Type | Constraints/Notes                       |
|----------------|------|-----------------------------------------|
| id             | serial | pk                                    |
| application_id | uuid  | fk -> applications.id                  |
| sector_id      | int   | fk -> sectors.id                       |

#### application_personal_info
| Column         | Type        | Constraints/Notes                 |
|----------------|-------------|-----------------------------------|
| id             | serial      | pk                                |
| application_id | uuid        | fk -> applications.id, unique     |
| first_name     | varchar     |                                   |
| last_name      | varchar     |                                   |
| email          | varchar     |                                   |
| phone          | varchar     | nullable                          |
| location       | varchar     | nullable                          |
| dob            | date        | nullable                          |
| nationality    | varchar     | nullable                          |
| updated_at     | timestamptz |                                   |

#### documents
| Column        | Type    | Constraints/Notes                       |
|---------------|---------|-----------------------------------------|
| id            | uuid    | pk                                      |
| application_id| uuid    | fk -> applications.id                   |
| doc_type      | enum(cv, motivation_letter, attachment) |         |
| file_name     | varchar |                                         |
| storage_url   | varchar |                                         |
| mime_type     | varchar |                                         |
| size_bytes    | bigint  |                                         |
| hash_sha256   | varchar | nullable                                |
| uploaded_at   | timestamptz |                                      |

#### reviews
| Column                 | Type   | Constraints/Notes                                                                 |
|------------------------|--------|-----------------------------------------------------------------------------------|
| id                     | uuid   | pk                                                                                |
| application_id         | uuid   | fk -> applications.id                                                             |
| reviewer_user_id       | uuid   | fk -> users.id, nullable (davetli anonim olabilir)                                |
| invite_id              | uuid   | fk -> invites.id, nullable                                                        |
| visibility_matched     | boolean| davet token filter-list ile uyum kontrolü                                        |
| reviewer_filter_snapshot| jsonb | nullable                                                                          |
| created_at             | timestamptz |                                                                               |

#### review_notes
| Column     | Type        | Constraints/Notes            |
|------------|-------------|------------------------------|
| id         | serial      | pk                           |
| review_id  | uuid        | fk -> reviews.id             |
| note       | text        |                              |
| created_at | timestamptz |                              |
| created_by | uuid        | fk -> users.id, nullable     |

#### audit_logs
| Column                | Type        | Constraints/Notes                                                                 |
|-----------------------|-------------|-----------------------------------------------------------------------------------|
| id                    | bigserial   | pk                                                                                |
| actor_user_id         | uuid        | fk -> users.id, nullable                                                          |
| actor_ip              | varchar     | nullable                                                                          |
| actor_user_agent      | varchar     | nullable                                                                          |
| action                | varchar     | örn: INVITE_LIST, INVITE_CREATE, TOKEN_VERIFY, APPLICATION_CREATE, DOCUMENT_UPLOAD, USER_AUDIT_VIEW |
| target_type           | varchar     | invites, users, applications, documents, reviews                                  |
| target_id             | varchar     | nullable                                                                          |
| token_scope_snapshot  | text[]      | nullable (örn: ['user-list'])                                                     |
| token_filter_snapshot | jsonb       | nullable                                                                          |
| metadata              | jsonb       | PII maskeli                                                                       |
| outcome               | enum(success, denied, error) |                                                                               |
| created_at            | timestamptz |                                                                                   |

#### user_audit_views
Kullanıcı auditlerini kimlerin görüntülediğini açıkça izlemek ve bildirim tetiklemek için.

| Column         | Type        | Constraints/Notes                                                                 |
|----------------|-------------|-----------------------------------------------------------------------------------|
| id             | bigserial   | pk                                                                                |
| viewer_user_id | uuid        | fk -> users.id (görüntüleyen)                                                     |
| viewed_user_id | uuid        | fk -> users.id (auditleri görüntülenen kullanıcı)                                 |
| invite_id      | uuid        | fk -> invites.id, nullable                                                        |
| token_scope_snapshot | text[]| örn: ['user-list']                                                                |
| token_filter_snapshot| jsonb | nullable                                                                          |
| created_at     | timestamptz |                                                                                   |

Not: user-list scope’una sahip kullanıcı bir başkasının kullanıcı auditlerini görüntülediğinde bir satır eklenir.

#### notifications
register-invite yetkisine sahip kullanıcıların başvuru görüntüleme olaylarından haberdar edilmesi için.

| Column         | Type        | Constraints/Notes                                                                 |
|----------------|-------------|-----------------------------------------------------------------------------------|
| id             | uuid        | pk                                                                                |
| user_id        | uuid        | fk -> users.id (bildirimi alacak kullanıcı; tipik olarak application owner)       |
| type           | enum(application_viewed, user_audit_viewed, generic) |                                        |
| title          | varchar     | kısa başlık                                                                       |
| body           | text        | mesaj                                                                             |
| metadata       | jsonb       | örn: {application_id, reviewer_user_id, invite_id}                                |
| is_read        | boolean     | default false                                                                     |
| read_at        | timestamptz | nullable                                                                          |
| created_at     | timestamptz |                                                                                   |

#### tokens_issued (opsiyonel)
| Column          | Type      | Constraints/Notes                             |
|-----------------|-----------|-----------------------------------------------|
| id              | bigserial | pk                                            |
| subject_user_id | uuid      | fk -> users.id, nullable                      |
| invite_id       | uuid      | fk -> invites.id, nullable                    |
| scopes          | text[]    |                                               |
| filter_snapshot | jsonb     | nullable                                      |
| exp             | timestamptz | nullable                                    |
| jti             | varchar   | unique                                        |
| created_at      | timestamptz |                                             |

#### auth_keys (opsiyonel)
| Column    | Type                                            | Constraints/Notes          |
|-----------|-------------------------------------------------|----------------------------|
| id        | serial                                          | pk                         |
| key_type  | enum(auth_service_private, main_app_public)     |                            |
| kid       | varchar                                         | unique                     |
| pem       | text                                            | encrypted at rest          |
| is_active | boolean                                         |                            |
| created_at| timestamptz                                     |                            |
| rotated_at| timestamptz                                     | nullable                   |

---

### Önerilen İndeksler
- users(user_name) unique, users(email) unique.
- invites(invite_jwt_hash) unique; invites(expires_at), invites(created_by), invites(status).
- applications(user_id), applications(status), applications(primary_sector_id).
- application_sectors(application_id, sector_id).
- documents(application_id, doc_type).
- reviews(application_id), reviews(invite_id), reviews(created_at).
- audit_logs(action, created_at), audit_logs(target_type, target_id, created_at), audit_logs(actor_user_id, created_at).
- user_audit_views(viewed_user_id, created_at), user_audit_views(viewer_user_id, created_at).
- notifications(user_id, is_read, created_at).

# ScholarPass: Technical Product Requirements Document

**Version:** 2.0  
**Date:** January 29, 2026  
**Document Type:** Technical Specification  
**Classification:** Engineering Reference

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [Database Schema](#3-database-schema)
4. [API Specifications](#4-api-specifications)
5. [Feature Implementation](#5-feature-implementation)
6. [AI/ML Integration](#6-aiml-integration)
7. [Video Call System](#7-video-call-system)
8. [Authentication & Security](#8-authentication--security)
9. [Real-Time Systems](#9-real-time-systems)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Code Examples](#11-code-examples)
12. [Testing Requirements](#12-testing-requirements)

---

# 1. System Overview

## 1.1 Technology Stack

### Frontend Stack
```yaml
Framework:
  - Next.js 14+ (React 18+, App Router)
  - TypeScript 5+

UI/Styling:
  - Tailwind CSS 3+
  - shadcn/ui (Radix UI components)
  - Framer Motion (animations)

State Management:
  - Zustand (global state)
  - TanStack Query (server state)

Real-Time:
  - Socket.io-client 4+
  - PeerJS 1.5+ (WebRTC)

Eye Tracking:
  - WebGazer.js 3+
  - TensorFlow.js

Testing:
  - Jest + React Testing Library
  - Playwright (E2E)
```

### Backend Stack
```yaml
Runtime:
  - Node.js 20 LTS
  - TypeScript 5+

Framework:
  - Express 4+ or Fastify 4+

Authentication:
  - Passport.js
  - jsonwebtoken (JWT)
  - bcrypt

Real-Time:
  - Socket.io 4+ (WebSocket)
  - PeerJS Server (WebRTC signaling)

Job Queue:
  - BullMQ 4+ (Redis-based)

Testing:
  - Jest
  - Supertest (API tests)
```

### Database Stack
```yaml
Primary Database:
  - PostgreSQL 16+
  - node-postgres (pg)
  - Prisma or Kysely (type-safe queries)

Caching:
  - Redis 7+
  - ioredis client

Document Store (Optional):
  - MongoDB 7+ OR PostgreSQL JSONB

Migrations:
  - node-pg-migrate or Prisma Migrate
```

### AI/ML Stack
```yaml
LLM:
  - Ollama (self-hosted)
  - Model: Llama 3.1 8B
  - Fallback: OpenAI GPT-4o-mini

Transcription:
  - Whisper.cpp (self-hosted)
  - Fallback: OpenAI Whisper API

Computer Vision:
  - WebGazer.js (client-side)
  - TensorFlow.js
```

---

# 2. Technical Architecture

## 2.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Layer (Browser)                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ Next.js  │  │  PeerJS  │  │ Socket.io  │  │  WebGazer.js │  │
│  │ Frontend │  │  WebRTC  │  │   Client   │  │ Eye Tracking │  │
│  └──────────┘  └──────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (Nginx/Caddy)                     │
│             SSL Termination | Rate Limiting | CORS               │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                       Backend Services                           │
│  ┌───────────┐  ┌────────────┐  ┌───────────┐  ┌────────────┐  │
│  │   User    │  │  Content   │  │  Roadmap  │  │Study Buddy │  │
│  │  Service  │  │  Service   │  │  Service  │  │  Service   │  │
│  └───────────┘  └────────────┘  └───────────┘  └────────────┘  │
│  ┌───────────┐  ┌────────────┐  ┌───────────┐  ┌────────────┐  │
│  │   Video   │  │Transcription│  │    AI     │  │ Analytics  │  │
│  │Call Manager│  │  Service   │  │ Assistant │  │  Service   │  │
│  └───────────┘  └────────────┘  └───────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                         Data Layer                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │PostgreSQL│  │  Redis   │  │ MongoDB  │  │ Object Store │   │
│  │    16+   │  │    7+    │  │  (Opt)   │  │   (MinIO)    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                            │
│  YouTube API │ Whisper │ Ollama │ Daily.co │ Coturn (TURN)     │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 Service Architecture

### Microservices Breakdown

```typescript
// services/user.service.ts
class UserService {
  async register(data: RegisterDTO): Promise<User>
  async login(credentials: LoginDTO): Promise<AuthTokens>
  async refreshToken(refreshToken: string): Promise<AuthTokens>
  async updateProfile(userId: number, data: ProfileDTO): Promise<User>
  async getUserPermissions(userId: number): Promise<Permission[]>
}

// services/content.service.ts
class ContentService {
  async aggregateContent(source: string): Promise<void>
  async searchContent(query: SearchQuery): Promise<Content[]>
  async getRecommendations(userId: number): Promise<Content[]>
  async trackProgress(userId: number, contentId: number): Promise<void>
}

// services/roadmap.service.ts
class RoadmapService {
  async assessSkills(userId: number): Promise<Assessment>
  async generateRoadmap(assessment: Assessment): Promise<Roadmap>
  async updateProgress(userId: number, moduleId: number): Promise<void>
  async adaptRoadmap(userId: number): Promise<Roadmap>
}

// services/studyBuddy.service.ts
class StudyBuddyService {
  async findMatches(userId: number): Promise<Match[]>
  async sendRequest(fromUserId: number, toUserId: number): Promise<void>
  async scheduleSession(data: SessionDTO): Promise<Session>
  async getUpcomingSessions(userId: number): Promise<Session[]>
}

// services/videoCall.service.ts
class VideoCallService {
  async createRoom(sessionId: number): Promise<RoomCredentials>
  async joinRoom(userId: number, roomId: string): Promise<void>
  async endSession(sessionId: number): Promise<SessionSummary>
}

// services/transcription.service.ts
class TranscriptionService {
  async transcribeAudio(audioData: Buffer): Promise<Transcript>
  async storeTranscript(sessionId: number, transcript: Transcript): Promise<void>
  async getSessionTranscript(sessionId: number): Promise<Transcript[]>
}

// services/aiAssistant.service.ts
class AIAssistantService {
  async generateRoadmap(prompt: string): Promise<RoadmapData>
  async answerQuestion(question: string, context: string[]): Promise<string>
  async summarizeSession(transcript: string): Promise<Summary>
  async analyzeContext(transcript: string): Promise<Insights>
}
```

---

# 3. Database Schema

## 3.1 Schema Organization

**Based on DB 1 (APP ACCESS) and DB 2 (MASTER DATA)**

### Database Modules

```
scholarpass_db
├── app_access (DB 1)
│   ├── Users & Authentication
│   ├── Roles & Permissions
│   ├── Sessions & Devices
│   └── Subscriptions & Payments
│
├── master_data (DB 2)
│   ├── Geographic (Countries, States, Cities)
│   ├── Localization (Languages, Timezones, Currencies)
│   ├── AI Models & Prompts
│   ├── Tags & Taxonomy
│   └── Subscription Types
│
├── learning_management (New)
│   ├── Assessments
│   ├── Roadmaps
│   ├── Content
│   └── Progress
│
└── study_buddy (New)
    ├── Matching
    ├── Sessions
    ├── Transcription
    └── Analytics
```

## 3.2 Core Tables from DB 1 (APP ACCESS)

### Users & Authentication

```sql
-- Main user table (from DB 1)
CREATE TABLE public.app_users (
  id                      SERIAL PRIMARY KEY,
  username                VARCHAR(256) NOT NULL UNIQUE,
  password_hash           VARCHAR(1024) NOT NULL,
  first_name              VARCHAR(128) NOT NULL,
  last_name               VARCHAR(128),
  email                   VARCHAR(256) NOT NULL UNIQUE,
  phone_number            VARCHAR(50),
  master_hub_id           INTEGER,
  master_country_id       INTEGER,
  country_phone_id        INTEGER,
  active_or_archive       BOOLEAN NOT NULL DEFAULT TRUE,
  email_confirmed         BOOLEAN NOT NULL DEFAULT FALSE,
  account_lock            BOOLEAN NOT NULL DEFAULT FALSE,
  phone_number_confirmed  BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
  lockout_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  access_failed_count     INTEGER NOT NULL DEFAULT 0,
  lockout_end             TIMESTAMP,
  profile_picture_url     VARCHAR(1024),
  whatsapp_subscribed     BOOLEAN NOT NULL DEFAULT FALSE,
  email_subscribed        BOOLEAN NOT NULL DEFAULT FALSE,
  sms_subscribed          BOOLEAN NOT NULL DEFAULT FALSE,
  is_public_user_internal BOOLEAN NOT NULL DEFAULT FALSE,
  address                 VARCHAR(1024),
  city                    VARCHAR(256),
  state                   VARCHAR(256),
  zip_code                VARCHAR(50),
  user_profile_tags_json  JSONB,
  user_profile_tags_url   VARCHAR(1024),
  json_file_updated_at    TIMESTAMP,
  primary_role_id         INTEGER,
  primary_learning_hub_id INTEGER,
  created_by_user_id      INTEGER,
  created_at              TIMESTAMP NOT NULL DEFAULT now(),
  updated_at              TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_app_users_country_phone
    FOREIGN KEY (country_phone_id) REFERENCES public.master_country_phones(id),
  CONSTRAINT fk_app_users_primary_role
    FOREIGN KEY (primary_role_id) REFERENCES public.app_access_master_roles(id)
);

CREATE INDEX idx_users_email ON public.app_users(email);
CREATE INDEX idx_users_username ON public.app_users(username);
CREATE INDEX idx_users_active ON public.app_users(active_or_archive);
```

### Roles & Permissions

```sql
-- Roles table (from DB 1)
CREATE TABLE public.app_access_master_roles (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(128) NOT NULL UNIQUE,
  description        TEXT,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  display_sequence   INTEGER,
  created_by_user_id INTEGER,
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_app_roles_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES public.app_users(id)
);

-- Permissions table (from DB 1)
CREATE TABLE public.app_permissions_masters (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(128) NOT NULL,
  module_name        VARCHAR(128),
  module_display_sequence INTEGER,
  feature_name       VARCHAR(128),
  feature_display_sequence INTEGER,
  class_name         VARCHAR(128),
  functions_name     VARCHAR(256),
  permission_key     VARCHAR(1024) UNIQUE,
  created_by_user_id INTEGER,
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now()
);

-- Role-Permission mapping (from DB 1)
CREATE TABLE public.app_access_role_menu_maps (
  id                 SERIAL PRIMARY KEY,
  role_id            INTEGER NOT NULL,
  role_access_json   JSONB,
  permission_id      INTEGER NOT NULL,
  menu_id            INTEGER,
  menu_access_json   JSONB,
  created_by_user_id INTEGER,
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_app_role_menu_permissions_role_permission_menu
    UNIQUE (role_id, permission_id, menu_id),
  CONSTRAINT fk_app_role_menu_permissions_role
    FOREIGN KEY (role_id) REFERENCES public.app_access_master_roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_role_menu_permissions_permission
    FOREIGN KEY (permission_id) REFERENCES public.app_permissions_masters(id) ON DELETE CASCADE
);

-- User multiple roles (from DB 1)
CREATE TABLE public.app_access_user_multiple_roles (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL,
  role_id            INTEGER NOT NULL,
  assigned_date      TIMESTAMP NOT NULL DEFAULT now(),
  expiry_date        TIMESTAMP,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_by_user_id INTEGER,
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_app_user_roles_user_role UNIQUE (user_id, role_id),
  CONSTRAINT fk_app_user_roles_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_user_roles_role
    FOREIGN KEY (role_id) REFERENCES public.app_access_master_roles(id) ON DELETE CASCADE
);
```

### Sessions & Devices

```sql
-- User sessions (from DB 1)
CREATE TABLE public.app_access_user_sessions (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL,
  session_token      VARCHAR(512) NOT NULL UNIQUE,
  device_type        VARCHAR(50),
  device_os          VARCHAR(50),
  device_browser     VARCHAR(100),
  device_ip          VARCHAR(50),
  login_at           TIMESTAMP NOT NULL DEFAULT now(),
  logout_at          TIMESTAMP,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_app_user_sessions_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON public.app_access_user_sessions(user_id);
CREATE INDEX idx_sessions_token ON public.app_access_user_sessions(session_token);
CREATE INDEX idx_sessions_active ON public.app_access_user_sessions(is_active);

-- User devices (from DB 1)
CREATE TABLE public.app_access_user_devices (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL,
  device_type        VARCHAR(50),
  device_os          VARCHAR(50),
  device_browser     VARCHAR(100),
  device_ip          VARCHAR(50),
  last_login_at      TIMESTAMP NOT NULL DEFAULT now(),
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_app_user_devices_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE
);

-- OTP verification (from DB 1)
CREATE TABLE public.app_access_user_otps (
  id               SERIAL PRIMARY KEY,
  otp              VARCHAR(6) NOT NULL,
  otp_type         VARCHAR(50) NOT NULL DEFAULT 'email',
  purpose          VARCHAR(50),
  expiry_time      TIMESTAMP NOT NULL,
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at      TIMESTAMP,
  resend_attempts  INTEGER NOT NULL DEFAULT 0,
  max_attempts     INTEGER NOT NULL DEFAULT 3,
  user_id          INTEGER NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_app_user_otps_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE
);
```

### User Tags (Skills & Interests)

```sql
-- User tags (from DB 1)
CREATE TABLE public.app_user_tags (
  id                     SERIAL PRIMARY KEY,
  user_id                INTEGER NOT NULL,
  tag_name               VARCHAR(255) NOT NULL,
  tag_value              TEXT,
  master_tag_group_id    INTEGER,
  master_tag_category_id INTEGER,
  master_tag_id          INTEGER,
  tag_group_name         VARCHAR(128),
  tag_category_name      VARCHAR(128),
  display_sequence       INTEGER,
  rating_score           INTEGER,
  is_filled              BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified            BOOLEAN NOT NULL DEFAULT FALSE,
  is_default_tag         BOOLEAN DEFAULT FALSE,
  verified_at            TIMESTAMP,
  verified_by_user_id    INTEGER,
  ai_suggested           BOOLEAN NOT NULL DEFAULT FALSE,
  ai_confidence_score    NUMERIC(3,2),
  ai_suggestion_date     TIMESTAMP,
  user_accepted_ai       BOOLEAN,
  source_type            VARCHAR(50),
  created_by_user_id     INTEGER,
  created_at             TIMESTAMP NOT NULL DEFAULT now(),
  updated_at             TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_user_tags_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_tags_group
    FOREIGN KEY (master_tag_group_id) REFERENCES public.master_tag_groups(id),
  CONSTRAINT fk_user_tags_category
    FOREIGN KEY (master_tag_category_id) REFERENCES public.master_tag_categories(id),
  CONSTRAINT fk_user_tags_tag
    FOREIGN KEY (master_tag_id) REFERENCES public.master_tags(id)
);

CREATE INDEX idx_user_tags_user ON public.app_user_tags(user_id);
CREATE INDEX idx_user_tags_group ON public.app_user_tags(master_tag_group_id);
CREATE INDEX idx_user_tags_filled ON public.app_user_tags(user_id, is_filled);
```

## 3.3 Master Data Tables from DB 2

### Geographic Data

```sql
-- Countries (from DB 2)
CREATE TABLE public.master_countries (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(128) NOT NULL,
  ticker             VARCHAR(50),
  flag_icon          VARCHAR(128),
  country_phone_code VARCHAR(50),
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now()
);

-- States (from DB 2)
CREATE TABLE public.master_states (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(128) NOT NULL,
  ticker            VARCHAR(50),
  master_country_id INTEGER,
  created_at        TIMESTAMP NOT NULL DEFAULT now(),
  updated_at        TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_master_states_country
    FOREIGN KEY (master_country_id) REFERENCES public.master_countries(id)
);

-- Cities (from DB 2)
CREATE TABLE public.master_cities (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(128),
  master_country_id INTEGER,
  master_state_id   INTEGER,
  master_county_id  INTEGER,
  created_at        TIMESTAMP NOT NULL DEFAULT now(),
  updated_at        TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_master_cities_country
    FOREIGN KEY (master_country_id) REFERENCES public.master_countries(id),
  CONSTRAINT fk_master_cities_state
    FOREIGN KEY (master_state_id) REFERENCES public.master_states(id)
);

-- Time zones (from DB 2)
CREATE TABLE public.master_time_zones (
  id                 SERIAL PRIMARY KEY,
  timezone_name      VARCHAR(128) NOT NULL UNIQUE,
  utc_offset_minutes INTEGER NOT NULL,
  is_default         BOOLEAN NOT NULL DEFAULT FALSE,
  master_country_id  INTEGER,
  master_city_id     INTEGER,
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now()
);

-- Languages (from DB 2)
CREATE TABLE public.master_languages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(128) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Currencies (from DB 2)
CREATE TABLE public.master_currencies (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(256),
  ticker            VARCHAR(32),
  icon              VARCHAR(256),
  master_country_id INTEGER,
  created_at        TIMESTAMP NOT NULL DEFAULT now(),
  updated_at        TIMESTAMP NOT NULL DEFAULT now()
);
```

### AI Models & Prompts

```sql
-- AI Models (from DB 2)
CREATE TABLE public.master_ai_models (
  id                SERIAL PRIMARY KEY,
  model_name        VARCHAR(255) NOT NULL,
  provider_name     VARCHAR(255) NOT NULL,
  model_version     VARCHAR(255),
  best_for          TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT FALSE,
  display_sequence  INTEGER DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT now(),
  updated_at        TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_master_ai_models_name_version UNIQUE (model_name, model_version)
);

-- AI Prompt Libraries (from DB 2)
CREATE TABLE public.master_ai_prompt_libraries (
  id                     SERIAL PRIMARY KEY,
  title                  VARCHAR(1024) NOT NULL,
  category               VARCHAR(128),
  prompt_template        TEXT NOT NULL,
  usage_instructions     TEXT,
  applicable_entities    VARCHAR(1024),
  recommended_ai_model_id INTEGER,
  temperature            NUMERIC(3,2) DEFAULT 0.7,
  max_tokens             INTEGER DEFAULT 2000,
  example_input          TEXT,
  example_output         TEXT,
  is_published           BOOLEAN NOT NULL DEFAULT FALSE,
  is_system_template     BOOLEAN NOT NULL DEFAULT FALSE,
  tags                   VARCHAR(512),
  usage_count            INTEGER DEFAULT 0,
  avg_rating             NUMERIC(3,2),
  created_by_user_id     INTEGER,
  created_at             TIMESTAMP NOT NULL DEFAULT now(),
  updated_at             TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_master_ai_prompt_model
    FOREIGN KEY (recommended_ai_model_id) REFERENCES public.master_ai_models(id)
);

CREATE INDEX idx_prompt_libraries_category ON public.master_ai_prompt_libraries(category);
CREATE INDEX idx_prompt_libraries_published ON public.master_ai_prompt_libraries(is_published);
```

### Tags & Taxonomy

```sql
-- Tag Groups (from DB 2)
CREATE TABLE public.master_tag_groups (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(1024),
  description               TEXT,
  is_public_or_private_tag  BOOLEAN NOT NULL,
  created_by_user_id        INTEGER,
  created_at                TIMESTAMP NOT NULL DEFAULT now(),
  updated_at                TIMESTAMP NOT NULL DEFAULT now()
);

-- Tag Categories (from DB 2)
CREATE TABLE public.master_tag_categories (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(1024) NOT NULL,
  description               TEXT,
  is_public_or_private_tag  BOOLEAN NOT NULL,
  master_tag_group_id       INTEGER,
  created_by_user_id        INTEGER,
  created_at                TIMESTAMP NOT NULL DEFAULT now(),
  updated_at                TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_master_tag_categories_group
    FOREIGN KEY (master_tag_group_id) REFERENCES public.master_tag_groups(id)
);

-- Tags (from DB 2)
CREATE TABLE public.master_tags (
  id                     SERIAL PRIMARY KEY,
  name                   VARCHAR(128) NOT NULL,
  description            TEXT,
  synonyms               VARCHAR(5000),
  display_sequence       INTEGER,
  image_url              VARCHAR(1024),
  master_tag_group_id    INTEGER,
  tag_group_name         VARCHAR(1024),
  tag_category_name      VARCHAR(1024),
  master_tag_category_id INTEGER,
  created_at             TIMESTAMP NOT NULL DEFAULT now(),
  updated_at             TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_master_tags_group
    FOREIGN KEY (master_tag_group_id) REFERENCES public.master_tag_groups(id),
  CONSTRAINT fk_master_tags_category
    FOREIGN KEY (master_tag_category_id) REFERENCES public.master_tag_categories(id)
);

CREATE INDEX idx_master_tags_group ON public.master_tags(master_tag_group_id);
CREATE INDEX idx_master_tags_category ON public.master_tags(master_tag_category_id);
```

## 3.4 Learning Management Tables (New)

### Skill Assessment

```sql
CREATE TABLE public.user_skill_assessments (
  id                    SERIAL PRIMARY KEY,
  user_id               INTEGER NOT NULL,
  subject_id            INTEGER NOT NULL,
  questions_answered    INTEGER NOT NULL,
  correct_answers       INTEGER NOT NULL,
  time_spent_seconds    INTEGER NOT NULL,
  skill_scores          JSONB NOT NULL,
  completed_at          TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_assessments_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_assessments_user ON public.user_skill_assessments(user_id);
```

### Learning Roadmaps

```sql
CREATE TABLE public.user_learning_roadmaps (
  id                    SERIAL PRIMARY KEY,
  user_id               INTEGER NOT NULL,
  subject               VARCHAR(255) NOT NULL,
  learning_goal         TEXT NOT NULL,
  skill_gaps            JSONB NOT NULL,
  roadmap_data          JSONB NOT NULL,
  hours_per_week        INTEGER NOT NULL,
  estimated_weeks       INTEGER NOT NULL,
  status                VARCHAR(50) DEFAULT 'active',
  progress_percentage   NUMERIC(5,2) DEFAULT 0.00,
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_roadmaps_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE
);

CREATE TABLE public.roadmap_modules (
  id                    SERIAL PRIMARY KEY,
  roadmap_id            INTEGER NOT NULL,
  module_name           VARCHAR(255) NOT NULL,
  module_description    TEXT,
  topics                JSONB NOT NULL,
  estimated_hours       INTEGER NOT NULL,
  sequence_order        INTEGER NOT NULL,
  status                VARCHAR(50) DEFAULT 'not_started',
  started_at            TIMESTAMP,
  completed_at          TIMESTAMP,
  
  CONSTRAINT fk_modules_roadmap
    FOREIGN KEY (roadmap_id) REFERENCES public.user_learning_roadmaps(id) ON DELETE CASCADE
);

CREATE INDEX idx_roadmaps_user ON public.user_learning_roadmaps(user_id);
CREATE INDEX idx_modules_roadmap ON public.roadmap_modules(roadmap_id);
```

### Content Management

```sql
CREATE TABLE public.content_sources (
  id                    SERIAL PRIMARY KEY,
  name                  VARCHAR(100) NOT NULL,
  type                  VARCHAR(50) NOT NULL,
  base_url              TEXT NOT NULL,
  api_key_encrypted     TEXT,
  is_active             BOOLEAN DEFAULT TRUE,
  last_crawled_at       TIMESTAMP,
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE public.educational_content (
  id                    SERIAL PRIMARY KEY,
  source_id             INTEGER NOT NULL,
  external_id           VARCHAR(255) NOT NULL,
  title                 VARCHAR(500) NOT NULL,
  description           TEXT,
  content_url           TEXT NOT NULL,
  thumbnail_url         TEXT,
  duration_seconds      INTEGER,
  difficulty_level      VARCHAR(50),
  language              VARCHAR(10) DEFAULT 'en',
  transcript            TEXT,
  topics                JSONB,
  quality_score         NUMERIC(3,2) DEFAULT 0.00,
  view_count            INTEGER DEFAULT 0,
  like_count            INTEGER DEFAULT 0,
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_content_source
    FOREIGN KEY (source_id) REFERENCES public.content_sources(id),
  UNIQUE (source_id, external_id)
);

CREATE INDEX idx_content_topics ON public.educational_content USING GIN(topics);
CREATE INDEX idx_content_search ON public.educational_content USING GIN(
  to_tsvector('english', title || ' ' || description)
);

CREATE TABLE public.user_content_progress (
  id                    SERIAL PRIMARY KEY,
  user_id               INTEGER NOT NULL,
  content_id            INTEGER NOT NULL,
  watch_time_seconds    INTEGER DEFAULT 0,
  total_duration        INTEGER NOT NULL,
  last_position         INTEGER DEFAULT 0,
  is_completed          BOOLEAN DEFAULT FALSE,
  completed_at          TIMESTAMP,
  started_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_progress_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_content
    FOREIGN KEY (content_id) REFERENCES public.educational_content(id),
  UNIQUE (user_id, content_id)
);

CREATE INDEX idx_progress_user ON public.user_content_progress(user_id);
```

## 3.5 Study Buddy Tables (New)

### Matching System

```sql
CREATE TABLE public.study_buddy_matches (
  id                    SERIAL PRIMARY KEY,
  requester_user_id     INTEGER NOT NULL,
  requested_user_id     INTEGER NOT NULL,
  match_score           NUMERIC(5,2) NOT NULL,
  match_reason          TEXT,
  personal_message      TEXT,
  status                VARCHAR(50) DEFAULT 'pending',
  requested_at          TIMESTAMP DEFAULT NOW(),
  responded_at          TIMESTAMP,
  expires_at            TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  
  CONSTRAINT fk_matches_requester
    FOREIGN KEY (requester_user_id) REFERENCES public.app_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_matches_requested
    FOREIGN KEY (requested_user_id) REFERENCES public.app_users(id) ON DELETE CASCADE,
  UNIQUE (requester_user_id, requested_user_id)
);

CREATE TABLE public.study_buddies (
  id                    SERIAL PRIMARY KEY,
  user_id_1             INTEGER NOT NULL,
  user_id_2             INTEGER NOT NULL,
  connected_at          TIMESTAMP DEFAULT NOW(),
  total_sessions        INTEGER DEFAULT 0,
  last_session_at       TIMESTAMP,
  is_active             BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT fk_buddies_user1
    FOREIGN KEY (user_id_1) REFERENCES public.app_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_buddies_user2
    FOREIGN KEY (user_id_2) REFERENCES public.app_users(id) ON DELETE CASCADE,
  UNIQUE (user_id_1, user_id_2)
);

CREATE TABLE public.user_study_preferences (
  user_id               INTEGER PRIMARY KEY,
  available_times       JSONB,
  timezone              VARCHAR(50),
  preferred_subjects    JSONB,
  skill_levels          JSONB,
  learning_style        VARCHAR(50),
  study_pace            VARCHAR(50),
  collaboration_pref    VARCHAR(50),
  max_study_buddies     INTEGER DEFAULT 5,
  is_findable           BOOLEAN DEFAULT TRUE,
  is_ai_listening_opt_in  BOOLEAN DEFAULT FALSE,
  is_recording_opt_in   BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_preferences_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE
);
```

### Study Sessions

```sql
CREATE TABLE public.study_sessions (
  id                      SERIAL PRIMARY KEY,
  session_name            VARCHAR(255),
  session_description     TEXT,
  host_user_id            INTEGER NOT NULL,
  study_buddy_user_id     INTEGER,
  video_call_type         VARCHAR(50) DEFAULT 'webrtc',
  video_call_room_id      VARCHAR(255) NOT NULL,
  video_call_url          TEXT,
  video_call_meeting_id   VARCHAR(255),
  is_ai_listening_enabled BOOLEAN DEFAULT FALSE,
  is_recording_enabled    BOOLEAN DEFAULT FALSE,
  is_public               BOOLEAN DEFAULT FALSE,
  status                  VARCHAR(50) DEFAULT 'scheduled',
  scheduled_start_time    TIMESTAMP,
  actual_start_time       TIMESTAMP,
  actual_end_time         TIMESTAMP,
  duration_minutes        INTEGER,
  study_topics            JSONB,
  learning_goals          JSONB,
  shared_resources        JSONB,
  ai_transcript           TEXT,
  ai_summary              TEXT,
  ai_key_insights         JSONB,
  ai_action_items         JSONB,
  ai_questions_answered   JSONB,
  engagement_score        NUMERIC(5,2),
  topics_covered          JSONB,
  knowledge_gaps_identified JSONB,
  created_at              TIMESTAMP DEFAULT NOW(),
  updated_at              TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_sessions_host
    FOREIGN KEY (host_user_id) REFERENCES public.app_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sessions_buddy
    FOREIGN KEY (study_buddy_user_id) REFERENCES public.app_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sessions_host ON public.study_sessions(host_user_id);
CREATE INDEX idx_sessions_buddy ON public.study_sessions(study_buddy_user_id);
CREATE INDEX idx_sessions_status ON public.study_sessions(status);
CREATE INDEX idx_sessions_scheduled ON public.study_sessions(scheduled_start_time);
```

### Transcription & AI Assistance

```sql
CREATE TABLE public.study_session_transcription_chunks (
  id                      SERIAL PRIMARY KEY,
  session_id              INTEGER NOT NULL,
  speaker_user_id         INTEGER,
  transcript_text         TEXT NOT NULL,
  timestamp               TIMESTAMP DEFAULT NOW(),
  sequence_number         INTEGER NOT NULL,
  confidence_score        NUMERIC(3,2),
  language_detected       VARCHAR(10),
  duration_seconds        NUMERIC(5,2),
  
  CONSTRAINT fk_transcription_session
    FOREIGN KEY (session_id) REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_transcription_speaker
    FOREIGN KEY (speaker_user_id) REFERENCES public.app_users(id) ON DELETE SET NULL
);

CREATE INDEX idx_transcription_session_seq 
  ON public.study_session_transcription_chunks(session_id, sequence_number);

CREATE TABLE public.study_session_ai_assistance (
  id                      SERIAL PRIMARY KEY,
  session_id              INTEGER NOT NULL,
  user_id                 INTEGER NOT NULL,
  question_text           TEXT NOT NULL,
  ai_response_text        TEXT NOT NULL,
  context_used            JSONB,
  response_confidence     NUMERIC(3,2),
  was_helpful             BOOLEAN,
  asked_at                TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_assistance_session
    FOREIGN KEY (session_id) REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_assistance_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_assistance_session ON public.study_session_ai_assistance(session_id);
```

### Collaboration Tools

```sql
CREATE TABLE public.study_session_whiteboards (
  id                      SERIAL PRIMARY KEY,
  session_id              INTEGER NOT NULL UNIQUE,
  whiteboard_data         JSONB NOT NULL,
  created_by_user_id      INTEGER NOT NULL,
  updated_at              TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_whiteboard_session
    FOREIGN KEY (session_id) REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_whiteboard_creator
    FOREIGN KEY (created_by_user_id) REFERENCES public.app_users(id)
);

CREATE TABLE public.study_session_notes (
  id                      SERIAL PRIMARY KEY,
  session_id              INTEGER NOT NULL,
  user_id                 INTEGER NOT NULL,
  note_content            TEXT NOT NULL,
  note_type               VARCHAR(50) DEFAULT 'general',
  timestamp_in_session    INTEGER,
  created_at              TIMESTAMP DEFAULT NOW(),
  updated_at              TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_notes_session
    FOREIGN KEY (session_id) REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE
);

CREATE TABLE public.study_session_resources (
  id                      SERIAL PRIMARY KEY,
  session_id              INTEGER NOT NULL,
  resource_type           VARCHAR(50) NOT NULL,
  resource_title          VARCHAR(255) NOT NULL,
  resource_url            TEXT,
  resource_file_path      TEXT,
  shared_by_user_id       INTEGER NOT NULL,
  description             TEXT,
  created_at              TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_resources_session
    FOREIGN KEY (session_id) REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_resources_user
    FOREIGN KEY (shared_by_user_id) REFERENCES public.app_users(id)
);
```

### Analytics

```sql
CREATE TABLE public.attention_tracking_data (
  id                    SERIAL PRIMARY KEY,
  session_id            INTEGER NOT NULL,
  user_id               INTEGER NOT NULL,
  focus_percentage      NUMERIC(5,2) NOT NULL,
  total_samples         INTEGER NOT NULL,
  focused_samples       INTEGER NOT NULL,
  distraction_events    INTEGER DEFAULT 0,
  recorded_at           TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_attention_session
    FOREIGN KEY (session_id) REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_attention_user
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE
);

CREATE INDEX idx_attention_session ON public.attention_tracking_data(session_id);
CREATE INDEX idx_attention_user ON public.attention_tracking_data(user_id);
```

---

# 4. API Specifications

## 4.1 Authentication APIs

### POST /api/auth/register
**Description**: Register new user account

**Request**:
```json
{
  "username": "string (required, 3-256 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "firstName": "string (required)",
  "lastName": "string (optional)",
  "masterHubId": "number (optional)",
  "masterCountryId": "number (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2026-01-29T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 604800
    }
  }
}
```

### POST /api/auth/login
**Description**: Login with credentials

**Request**:
```json
{
  "email": "string (required)",
  "password": "string (required)",
  "deviceInfo": {
    "type": "desktop|mobile|tablet",
    "os": "string",
    "browser": "string"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "student",
      "permissions": ["read:content", "create:session"]
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 604800
    },
    "session": {
      "id": 456,
      "sessionToken": "abc123...",
      "loginAt": "2026-01-29T10:00:00Z"
    }
  }
}
```

### POST /api/auth/refresh
**Description**: Refresh access token

**Request**:
```json
{
  "refreshToken": "string (required)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 604800
  }
}
```

### POST /api/auth/logout
**Description**: Logout user

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

## 4.2 User APIs

### GET /api/users/me
**Description**: Get current user profile

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePictureUrl": "https://...",
    "emailConfirmed": true,
    "primaryRole": {
      "id": 3,
      "name": "Student"
    },
    "tags": [
      {
        "tagName": "JavaScript",
        "tagValue": "Intermediate",
        "ratingScore": 7
      }
    ],
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

### PATCH /api/users/me
**Description**: Update user profile

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "profilePictureUrl": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "masterCountryId": "number (optional)"
}
```

### POST /api/users/me/tags
**Description**: Add user skill/interest tag

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "tagName": "string (required)",
  "tagValue": "string (optional)",
  "masterTagId": "number (optional)",
  "ratingScore": "number (1-10, optional)",
  "sourceType": "manual|ai|imported"
}
```

## 4.3 Assessment APIs

### POST /api/assessments/start
**Description**: Start new skill assessment

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "subjectId": 1,
  "subjectName": "Web Development"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "assessmentId": 456,
    "totalQuestions": 25,
    "estimatedMinutes": 15,
    "firstQuestion": {
      "id": 789,
      "questionText": "What is a closure in JavaScript?",
      "options": [
        { "id": "a", "text": "..." },
        { "id": "b", "text": "..." },
        { "id": "c", "text": "..." },
        { "id": "d", "text": "..." }
      ]
    }
  }
}
```

### POST /api/assessments/:id/answer
**Description**: Submit answer to assessment question

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "questionId": 789,
  "answerId": "b",
  "timeSpentSeconds": 45
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "nextQuestion": {
      "id": 790,
      "questionText": "...",
      "options": [...]
    },
    "progress": {
      "answeredQuestions": 5,
      "totalQuestions": 25,
      "percentComplete": 20
    }
  }
}
```

### POST /api/assessments/:id/complete
**Description**: Complete assessment and get results

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "data": {
    "assessmentId": 456,
    "skillScores": {
      "JavaScript Fundamentals": 85,
      "React": 60,
      "Node.js": 45,
      "Databases": 70
    },
    "overallScore": 65,
    "strengths": ["JavaScript", "Databases"],
    "weaknesses": ["Node.js", "React"],
    "recommendedRoadmap": {
      "focus": ["Node.js", "React"],
      "estimatedWeeks": 12
    }
  }
}
```

## 4.4 Roadmap APIs

### POST /api/roadmaps/generate
**Description**: Generate AI-powered learning roadmap

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "assessmentId": 456,
  "learningGoal": "Become a full-stack developer",
  "hoursPerWeek": 10,
  "preferredLearningStyle": "visual|auditory|kinesthetic|reading"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "roadmapId": 789,
    "subject": "Web Development",
    "estimatedWeeks": 12,
    "totalHours": 120,
    "modules": [
      {
        "id": 1,
        "name": "Node.js Fundamentals",
        "description": "...",
        "topics": ["Event Loop", "Modules", "npm"],
        "estimatedHours": 15,
        "difficulty": "intermediate",
        "prerequisites": [],
        "contentIds": [101, 102, 103]
      }
    ],
    "milestones": [
      {
        "week": 3,
        "name": "Build first REST API",
        "description": "..."
      }
    ]
  }
}
```

### GET /api/roadmaps/:id
**Description**: Get roadmap details

### PATCH /api/roadmaps/:id/modules/:moduleId
**Description**: Update module progress

**Request**:
```json
{
  "status": "in_progress|completed",
  "completedAt": "2026-02-15T10:00:00Z"
}
```

## 4.5 Content APIs

### GET /api/content/search
**Description**: Search educational content

**Query Parameters**:
- `q` (string, required): Search query
- `difficulty` (string): beginner|intermediate|advanced
- `duration` (string): short|medium|long
- `source` (string): youtube|mit_ocw|harvard
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": 101,
        "title": "Node.js Tutorial for Beginners",
        "description": "...",
        "contentUrl": "https://youtube.com/watch?v=...",
        "thumbnailUrl": "https://...",
        "durationSeconds": 1800,
        "difficultyLevel": "beginner",
        "qualityScore": 0.95,
        "source": {
          "id": 1,
          "name": "freeCodeCamp",
          "type": "youtube"
        },
        "topics": ["Node.js", "JavaScript", "Backend"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalResults": 150,
      "totalPages": 8
    }
  }
}
```

### GET /api/content/:id
**Description**: Get content details

### POST /api/content/:id/progress
**Description**: Update watch progress

**Request**:
```json
{
  "lastPosition": 450,
  "watchTimeSeconds": 300,
  "isCompleted": false
}
```

### GET /api/content/recommendations
**Description**: Get personalized content recommendations

**Query Parameters**:
- `roadmapId` (number): Filter by roadmap
- `limit` (number): Number of results

## 4.6 Study Buddy APIs

### GET /api/study-buddies/find-match
**Description**: Find compatible study buddies **scoped to the same learning context (same roadmap/course + module)**.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `roadmapId` (number, required): Only match users on the same active roadmap/course context
- `moduleId` (number, optional): Prefer/limit to users currently on the same module
- `limit` (number): Max results (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "learningContext": {
      "roadmapId": 789,
      "moduleId": 3
    },
    "matches": [
      {
        "userId": 456,
        "username": "sarahsmith",
        "firstName": "Sarah",
        "profilePictureUrl": "https://...",
        "matchScore": 85,
        "matchReason": "Same roadmap/course context + compatible schedules + similar level",
        "sharedGoals": ["Learn React", "Build projects"],
        "availableTimes": ["Mon 18:00-22:00", "Wed 18:00-22:00"],
        "timezone": "America/New_York"
      }
    ]
  }
}
```

### POST /api/study-buddies/request
**Description**: Send study buddy request

**Request**:
```json
{
  "requestedUserId": 456,
  "personalMessage": "Hi! I saw we're both learning React. Want to study together?"
}
```

### POST /api/study-buddies/:matchId/accept
**Description**: Accept buddy request and **create a Buddy Assignment** that binds both users to the same roadmap/course context.

**Response**:
```json
{
  "success": true,
  "data": {
    "buddyId": 789,
    "assignment": {
      "assignmentId": 2001,
      "roadmapId": 789,
      "moduleId": 3,
      "status": "active"
    }
  }
}
```

### POST /api/study-buddies/:matchId/reject
**Description**: Reject buddy request

### GET /api/study-buddies/my-buddies
**Description**: Get list of connected study buddies

**Response**:
```json
{
  "success": true,
  "data": {
    "buddies": [
      {
        "buddyId": 789,
        "user": {
          "id": 456,
          "username": "sarahsmith",
          "firstName": "Sarah",
          "profilePictureUrl": "https://..."
        },
        "connectedAt": "2026-01-15T10:00:00Z",
        "totalSessions": 5,
        "lastSessionAt": "2026-01-28T18:00:00Z"
      }
    ]
  }
}
```

### Buddy Assignment APIs (new)

Buddy assignments enforce the rule: **study buddies must be assigned to the same learning goal/course/roadmap**.

#### GET /api/study-buddies/assignments
**Description**: List active buddy-course assignments for the current user.

#### GET /api/study-buddies/assignments/:assignmentId
**Description**: Get assignment details (roadmap/course + current module).

#### PATCH /api/study-buddies/assignments/:assignmentId
**Description**: Update assignment pointer/state (advance module, pause, resume).

**Request**:
```json
{
  "status": "active|paused|ended",
  "moduleId": 4
}
```

#### DELETE /api/study-buddies/assignments/:assignmentId
**Description**: End an assignment (does not delete buddy relationship; stops shared-course binding).

## 4.7 Study Session APIs

### POST /api/sessions/create
**Description**: Create new study session

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "sessionName": "React Hooks Study Session",
  "buddyUserId": 456,
  "scheduledStartTime": "2026-01-30T18:00:00Z",
  "durationMinutes": 60,
  "studyTopics": ["React Hooks", "useEffect", "Custom Hooks"],
  "learningGoals": ["Understand useEffect dependencies"],
  "videoCallType": "webrtc|daily",
  "isAIListeningEnabled": true,
  "isPublic": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": 1001,
    "videoCallRoomId": "abc123xyz",
    "videoCallUrl": "wss://signal.scholarpass.com/abc123xyz",
    "sessionToken": "sess_...",
    "iceServers": [
      { "urls": "stun:stun.l.google.com:19302" },
      {
        "urls": "turn:turn.scholarpass.com:3478",
        "username": "...",
        "credential": "..."
      }
    ]
  }
}
```

### POST /api/sessions/:id/join
**Description**: Join existing session

**Response**:
```json
{
  "success": true,
  "data": {
    "session": {
      "id": 1001,
      "sessionName": "React Hooks Study Session",
      "host": {
        "id": 123,
        "username": "johndoe",
        "firstName": "John"
      },
      "participants": [
        {
          "userId": 123,
          "username": "johndoe",
          "isHost": true,
          "joinedAt": "2026-01-30T18:00:00Z"
        }
      ],
      "isAIListeningEnabled": true
    },
    "videoCallCredentials": {
      "roomId": "abc123xyz",
      "videoCallUrl": "wss://...",
      "sessionToken": "sess_...",
      "iceServers": [...]
    }
  }
}
```

### POST /api/sessions/:id/end
**Description**: End study session

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": 1001,
    "durationMinutes": 62,
    "summary": {
      "topicsCovered": ["React Hooks", "useEffect"],
      "keyInsights": [
        "useEffect cleanup functions prevent memory leaks",
        "Empty dependency array runs only once"
      ],
      "knowledgeGaps": [
        {
          "concept": "Custom Hooks",
          "severity": "medium",
          "recommendation": "Watch tutorial on custom hooks"
        }
      ],
      "actionItems": [
        "Build a timer component using useEffect",
        "Practice custom hooks"
      ]
    },
    "transcriptUrl": "/api/sessions/1001/transcript",
    "analyticsUrl": "/api/sessions/1001/analytics"
  }
}
```

### GET /api/sessions/:id/transcript
**Description**: Get session transcript

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": 1001,
    "transcript": [
      {
        "id": 1,
        "speakerUserId": 123,
        "speakerName": "John",
        "text": "So let's talk about useEffect dependencies",
        "timestamp": "2026-01-30T18:05:23Z",
        "confidenceScore": 0.95
      },
      {
        "id": 2,
        "speakerUserId": 456,
        "speakerName": "Sarah",
        "text": "Yeah, I'm still confused about when to include variables",
        "timestamp": "2026-01-30T18:05:31Z",
        "confidenceScore": 0.92
      }
    ]
  }
}
```

## 4.8 AI Assistant APIs

### POST /api/ai-assistant/ask
**Description**: Ask AI question during session

**Request**:
```json
{
  "sessionId": 1001,
  "question": "What is the difference between useEffect and useLayoutEffect?",
  "context": ["current transcript chunks"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "question": "What is the difference between useEffect and useLayoutEffect?",
    "answer": "useEffect runs after paint, useLayoutEffect runs before paint. Use useLayoutEffect when you need to make DOM measurements or mutations before browser paints...",
    "confidence": 0.92,
    "sources": [
      {
        "title": "React Documentation - Hooks API",
        "url": "https://react.dev/reference/react/useLayoutEffect"
      }
    ]
  }
}
```

### POST /api/ai-assistant/transcribe
**Description**: Transcribe audio chunk

**Request**: multipart/form-data
- `audio` (file): Audio blob (webm)
- `sessionId` (number): Session ID

**Response**:
```json
{
  "success": true,
  "data": {
    "transcriptId": 123,
    "text": "So the cleanup function in useEffect is called before the component unmounts",
    "confidence": 0.94,
    "languageDetected": "en",
    "insights": {
      "currentTopic": "React Hooks - useEffect cleanup",
      "suggestedResources": [
        {
          "title": "useEffect Cleanup - Official Docs",
          "url": "https://..."
        }
      ]
    }
  }
}
```

## 4.9 Analytics APIs

### GET /api/analytics/attention-tracking/:sessionId
**Description**: Get attention tracking data for session

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": 1001,
    "overallFocusPercentage": 78.5,
    "totalDurationMinutes": 62,
    "focusedMinutes": 48.7,
    "distractionEvents": 8,
    "focusTimeline": [
      {
        "minute": 0,
        "focusPercentage": 85
      },
      {
        "minute": 1,
        "focusPercentage": 82
      }
    ],
    "recommendations": [
      "Take short breaks every 25 minutes",
      "Reduce multitasking during study sessions"
    ]
  }
}
```

### GET /api/analytics/progress
**Description**: Get user learning progress

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "currentRoadmap": {
      "id": 789,
      "subject": "Web Development",
      "progressPercentage": 45,
      "completedModules": 5,
      "totalModules": 11
    },
    "skillProgress": {
      "JavaScript": {
        "initialScore": 60,
        "currentScore": 85,
        "improvement": 25
      },
      "React": {
        "initialScore": 30,
        "currentScore": 65,
        "improvement": 35
      }
    },
    "studySessions": {
      "totalSessions": 12,
      "totalHours": 18.5,
      "averageSessionDuration": 92
    }
  }
}
```

## 4.10 Health & Ops APIs

### GET /health
**Description**: Liveness probe; returns 200 if process is running. No dependencies checked.

**Response**: `200 OK` (body optional, e.g. `{ "status": "ok" }`)

### GET /ready
**Description**: Readiness probe; returns 200 only when the app can serve traffic (DB + Redis reachable).

**Response** (200):
```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "redis": "ok"
  }
}
```

**Response** (503): When any dependency is down; body includes which check failed.

### GET /metrics (optional)
**Description**: Prometheus-style or JSON metrics (request counts, latency, active sockets). Protected by API key or internal network only.

---

## 4.11 Admin APIs

**Auth**: Require role `Super Admin` or `Admin` and permission key (e.g. `admin.*`).

### GET /api/admin/users
**Description**: List users with filters (role, status, search). Pagination via `limit`/`offset`.

### PATCH /api/admin/users/:id
**Description**: Update user (activate/archive, lock, assign roles). Audit log to `app_notifications` or audit table.

### GET /api/admin/analytics/overview
**Description**: Platform-wide metrics (DAU, signups, active subscriptions, study session counts).

### POST /api/admin/notifications
**Description**: Send system-wide or targeted notification (uses `app_notifications`).

### GET /api/admin/audit (optional)
**Description**: Audit log of admin actions (who did what, when). Requires audit table or append-only log.

---

# 5. Feature Implementation

## 5.1 Authentication Implementation

### JWT Token Generation

```typescript
// utils/jwt.ts
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}
```

### Password Hashing

```typescript
// utils/password.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### Authentication Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}
```

### RBAC Middleware

```typescript
// middleware/rbac.ts
import { Response, NextFunction } from 'express';
import { db } from '../config/database';
import { AuthRequest } from './auth';

export function requirePermission(permissionKey: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has permission
    const hasPermission = await db.query(`
      SELECT EXISTS(
        SELECT 1 FROM app_access_role_menu_maps rmp
        JOIN app_access_user_multiple_roles umr ON rmp.role_id = umr.role_id
        JOIN app_permissions_masters pm ON rmp.permission_id = pm.id
        WHERE umr.user_id = $1
          AND umr.is_active = TRUE
          AND pm.permission_key = $2
      ) as has_permission
    `, [req.user.id, permissionKey]);

    if (!hasPermission.rows[0].has_permission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
```

## 5.2 Real-Time Transcription

### Audio Capture (Frontend)

```typescript
// utils/audioCapture.ts
export class AudioCaptureService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  
  async startCapture(stream: MediaStream, onChunk: (blob: Blob) => void) {
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 128000
    });
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
    
    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      onChunk(audioBlob);
      this.audioChunks = [];
      
      // Restart recording
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.start();
        setTimeout(() => this.mediaRecorder?.stop(), 5000);
      }
    };
    
    // Record in 5-second chunks
    this.mediaRecorder.start();
    setTimeout(() => this.mediaRecorder?.stop(), 5000);
  }
  
  stopCapture() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
  }
}
```

### Transcription Service (Backend)

```python
# transcription_service.py
from flask import Flask, request, jsonify
import whisper
import tempfile
import os

app = Flask(__name__)
model = whisper.load_model("base")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    audio_file = request.files['audio']
    session_id = request.form['sessionId']
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp:
        audio_file.save(temp.name)
        temp_path = temp.name
    
    result = model.transcribe(temp_path, language='en')
    os.remove(temp_path)
    
    return jsonify({
        'success': True,
        'text': result['text'],
        'language': result['language'],
        'confidence': result.get('confidence', 1.0)
    })
```

## 5.3 WebRTC Video Calls

### Signaling Server

```typescript
// signaling-server.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

const rooms = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId)!.add(socket.id);
    
    // Notify others in room
    socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
    
    // Send existing participants
    const participants = Array.from(rooms.get(roomId)!)
      .filter(id => id !== socket.id);
    socket.emit('room-users', participants);
  });
  
  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    rooms.get(roomId)?.delete(socket.id);
    socket.to(roomId).emit('user-left', { socketId: socket.id });
  });
  
  socket.on('signal', ({ to, signal }) => {
    io.to(to).emit('signal', { from: socket.id, signal });
  });
  
  socket.on('disconnect', () => {
    rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        socket.to(roomId).emit('user-left', { socketId: socket.id });
      }
    });
  });
});

httpServer.listen(3001);
```

---

# 6. AI/ML Integration

## 6.1 AI Components and Responsibilities

- **Roadmap generation**: Generate `user_learning_roadmaps.roadmap_data` JSONB using LLM + prompts from `master_ai_prompt_libraries`.
- **Study buddy matching explanation**: Produce `study_buddy_matches.match_reason` text from structured match inputs (deterministic match score logic; LLM only for explanation).
- **Session AI Q&A**: Use near-real-time transcript context (`study_session_transcription_chunks`) + user question to generate answer; store in `study_session_ai_assistance`.
- **Session summary & analysis**: Generate `study_sessions.ai_summary`, `ai_key_insights`, `knowledge_gaps_identified`, `ai_action_items`.

## 6.2 Model Configuration (DB-aligned)

### 6.2.1 Global model catalog (DB 2)
- **`master_ai_models`**: canonical list of supported models/providers (Ollama local, OpenAI, Anthropic, etc.).
- **`master_ai_prompt_libraries`**: prompt templates with category, recommended model id, temperature, max tokens.

### 6.2.2 Per-user AI provider settings (DB 1)
- **`app_user_ai_service_settings`**:
  - `master_ai_model_id` → references `master_ai_models`.
  - `provider_name`, `model_name`, `api_endpoint` used by runtime router.
  - `api_key_encrypted` / `secondary_api_key_encrypted` store encrypted secrets.
  - `usage_limit_daily`, `usage_count_today`, `last_used_at` used for enforcement and billing-neutral throttling.

## 6.3 AI Routing Policy (local-first)

### 6.3.1 Router decision
- **Default**: Ollama local LLM for all text generation tasks.
- **Fallback**: External API only when:
  - local model unavailable/unhealthy,
  - request exceeds local model context limits,
  - user explicitly configured external provider in `app_user_ai_service_settings` and is active.

### 6.3.2 Prompt safety + determinism
- **System prompts** stored as published templates in `master_ai_prompt_libraries`.
- **Output contracts**: LLM must output JSON for roadmap/summary endpoints; validate with Zod schema server-side.
- **Refusal and redaction**:
  - do not output secrets (api keys, tokens),
  - do not output personal data beyond what is already in session context,
  - redact emails/phone numbers in transcripts before sending to external LLM provider.

## 6.4 Session AI Pipeline (Study Buddy)

### 6.4.1 Data flow
1. Client captures audio (MediaRecorder) and posts chunks to `/api/ai-assistant/transcribe`.
2. Transcription service returns text + confidence.
3. Store chunk in `study_session_transcription_chunks` (with `sequence_number`, `speaker_user_id` optional).
4. AI assistant reads last N chunks (e.g. 10–30) and answers questions or produces periodic insights.

### 6.4.2 Storage rules
- **Raw audio**: never persist by default (unless recording feature enabled).
- **Transcripts**:
  - store incremental chunks only when `study_sessions.is_ai_listening_enabled = TRUE`.
  - allow deletion by session owner (hard delete) and keep a tombstone event for audit.

## 6.5 Prompt Categories (minimum)

Use `master_ai_prompt_libraries.category` with at least:
- `roadmap`: roadmap generation, module structuring
- `session_summary`: session summaries and knowledge gaps
- `qa`: context-aware Q&A
- `matching_explain`: explain match score (not compute)

## 6.6 Rate limiting and quotas

- Enforce per-user AI daily limits using `app_user_ai_service_settings.usage_limit_daily`.
- Update counters atomically with PostgreSQL (transaction) or Redis (then sync).

---

# 7. Video Call System

## 7.1 Primary approach (lowest complexity + cost)

### 7.1.1 WebRTC P2P for 1:1 sessions
- **PeerJS** on client for WebRTC abstraction.
- **Socket.io** signaling server (room + exchange of offers/answers/ICE).
- **STUN**: public STUN servers (e.g. Google STUN) for NAT traversal.
- **TURN**: self-host Coturn for restrictive networks; provide credentials per session.

### 7.1.2 Fallback approach
- **Daily.co** fallback for failures or group calls (optional). Store `study_sessions.video_call_type = 'daily'` and populate `video_call_url`.

## 7.2 Session binding (DB-aligned)

Store all call linkage inside `study_sessions`:
- `video_call_type` (`webrtc` | `daily` | future `sfu`)
- `video_call_room_id` (required)
- `video_call_url` (optional)
- `video_call_meeting_id` (optional, for external providers)

## 7.3 Call security

- WebRTC uses DTLS/SRTP by default.
- Signaling must be over WSS and authenticated (JWT).
- Room join requires:
  - session membership (host or invited buddy),
  - `study_sessions.status in ('scheduled','active')`,
  - session not expired.

## 7.4 Recording (optional)

- If recording enabled, toggle `study_sessions.is_recording_enabled = TRUE`.
- Store recording metadata in `study_sessions.shared_resources` as JSONB items:
  - `{ "type":"recording", "provider":"daily|s3|minio", "url":"...", "created_at":"..." }`

---

# 8. Authentication & Security

## 8.1 Authentication (DB-aligned)

- **Users**: `app_users`
- **Sessions**: `app_access_user_sessions`
- **Devices**: `app_access_user_devices`
- **OTP**: `app_access_user_otps` (login/verification/reset flows)

### 8.1.1 Session token storage
- `app_access_user_sessions.session_token` stores a server-issued token (distinct from JWT access token).
- Set `is_active` false on logout; set `logout_at`.

### 8.1.2 Account lockout
- Use `app_users.access_failed_count`, `lockout_end`, `account_lock`.
- Enforce lockout checks on login.

## 8.2 Authorization (RBAC)

- Roles: `app_access_master_roles`
- Multiple roles: `app_access_user_multiple_roles`
- Permissions: `app_permissions_masters`
- Role-permission mapping: `app_access_role_menu_maps`

### 8.2.1 Permission check algorithm
1. Resolve all active roles for user.
2. Join to permissions via role-menu map.
3. Validate `permission_key` for endpoint.

## 8.3 Secrets management

- **Never** store plaintext secrets.
- Encrypt keys in `app_user_ai_service_settings.api_key_encrypted`.
- Use envelope encryption:
  - DEK stored encrypted with a server master key (KMS or env secret).

## 8.4 Consent & Data Retention

- **Consent**: Store consent records (e.g. `app_user_consents` or JSONB on `app_users`) for:
  - marketing (email/SMS/WhatsApp) — align with `email_subscribed`, `sms_subscribed`, `whatsapp_subscribed`;
  - AI processing of session transcripts;
  - recording of video/audio sessions.
- **Retention**: Define retention periods per data type (e.g. transcripts 90 days, session metadata 1 year). Enforce via scheduled jobs that delete or anonymize expired data. Allow user-initiated data export and account deletion (GDPR-style); deletion must cascade or anonymize PII in learning/study tables.

## 8.5 Audit and notifications

- Use `app_notifications` to alert users about:
  - login from new device (`app_access_user_devices`),
  - password reset,
  - study buddy requests,
  - scheduled session reminders.

## 8.6 Security headers and protections

- CSP, HSTS, X-Content-Type-Options, Referrer-Policy.
- CSRF protection for cookie-based refresh tokens.
- Rate limiting on auth endpoints via Redis.

---

# 9. Real-Time Systems

## 9.1 Socket.io namespaces

- `/rtc`: signaling (join/leave, offer/answer, ICE)
- `/session`: session collaboration (notes, whiteboard, resource share)
- `/ai`: streaming transcripts and AI insights

## 9.2 Event contracts (minimum)

### 9.2.1 RTC namespace
- `join-room` `{ sessionId, roomId }`
- `room-users` `[socketId]`
- `user-joined` `{ userId, socketId }`
- `signal` `{ to, signal }`
- `user-left` `{ socketId }`

### 9.2.2 AI namespace
- `transcript-chunk` `{ sessionId, sequenceNumber, text, confidence }`
- `ai-insight` `{ sessionId, insightType, payload }`

### 9.2.3 Collaboration
- `whiteboard:update` `{ sessionId, whiteboardData }`
- `notes:update` `{ sessionId, noteId, content }`
- `resource:add` `{ sessionId, resource }`

## 9.3 Scaling strategy

- Use Redis adapter for Socket.io when running multiple instances.
- Use Redis pub/sub to broadcast session state updates.
- Persist critical state in PostgreSQL (sessions, notes, resources); keep transient state in Redis.

---

# 10. Deployment Architecture

## 10.1 Minimal production deployment (single host)

### Components
- Nginx (TLS + reverse proxy)
- API (Node.js)
- Signaling (Node.js + Socket.io)
- PostgreSQL
- Redis
- Ollama
- Whisper service (Python) or whisper.cpp wrapper
- Coturn (TURN)

## 10.2 Environment variables (minimum)

```bash
NODE_ENV=production
DATABASE_URL=postgres://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
OLLAMA_ENDPOINT=http://ollama:11434
WHISPER_ENDPOINT=http://whisper:5000
TURN_URL=turn:turn.example.com:3478
TURN_USERNAME=...
TURN_CREDENTIAL=...
FRONTEND_URL=https://app.example.com
```

## 10.3 Observability

- Structured logs (JSON) for API + signaling + AI services.
- Metrics:
  - API latency p95/p99
  - socket active connections
  - transcription latency
  - LLM latency + token usage (update `app_user_ai_service_settings.usage_count_today`)

---

# 11. Code Examples (backend)

## 11.1 Insert transcript chunk (PostgreSQL)

```typescript
await db.query(
  `INSERT INTO study_session_transcription_chunks
   (session_id, speaker_user_id, transcript_text, timestamp, sequence_number, confidence_score, language_detected, duration_seconds)
   VALUES ($1,$2,$3,now(),$4,$5,$6,$7)`,
  [sessionId, speakerUserId ?? null, text, seq, confidence ?? null, language ?? null, durationSeconds ?? null]
);
```

## 11.2 Permission gate for an endpoint

```typescript
app.post(
  '/api/sessions/:id/end',
  authenticateToken,
  requirePermission('study_sessions.end'),
  endSessionHandler
);
```

## 11.3 Content search (PostgreSQL full-text)

```sql
SELECT
  id, title, content_url, quality_score,
  ts_rank(
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')),
    plainto_tsquery('english', $1)
  ) AS rank
FROM educational_content
WHERE to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')) @@ plainto_tsquery('english', $1)
ORDER BY rank DESC, quality_score DESC
LIMIT $2 OFFSET $3;
```

---

# 12. Testing Requirements

## 12.1 Unit tests (minimum)

- Auth:
  - password hashing/verification
  - JWT verify/refresh
  - lockout logic
- Matching:
  - deterministic match score computation
  - schedule overlap function
- Roadmap:
  - validate LLM JSON output schema
  - mapping content IDs to modules

## 12.2 Integration tests

- DB migrations apply cleanly.
- All API routes return expected response shapes.
- RBAC permissions enforced (403 when missing).
- Transcript chunk ingestion stores rows with increasing sequence numbers.

## 12.3 E2E tests (Playwright)

- User registers → logs in → completes assessment → generates roadmap.
- User finds match → sends request → buddy accepts.
- Create session → join call UI loads → toggles AI listening → transcript appears.

## 12.4 Load tests

- Signaling:
  - 1,000 concurrent sockets join/leave rooms
- Transcription:
  - sustained 5-second chunk ingestion
- DB:
  - search queries + progress updates under load

---

**Document Status**: Technical PRD complete (no business sections).  
**Primary schema references**: `DB 1 - APP ACCESS.sql`, `DB 2 - MASTER DATA.sql`.  
**Output**: `/home/alvee/Desktop/Scholarpass/TECHNICAL_PRD.md`

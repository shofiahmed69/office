# ScholarPass Database Connection (EC2)

## ✅ Database is LIVE and Ready!

Your PostgreSQL database is fully configured and running on EC2.

---

## EC2 Host and SSH

- **Host**: `ec2-16-16-143-59.eu-north-1.compute.amazonaws.com`
- **SSH user**: `ec2-user`
- **SSH key**: `database.pem` (in project root)

```bash
ssh -i "database.pem" ec2-user@ec2-16-16-143-59.eu-north-1.compute.amazonaws.com
```

Ensure the key has correct permissions: `chmod 600 database.pem`

---

## Database Credentials

| Item        | Value                    |
|------------|---------------------------|
| **User**   | `Alvee`                   |
| **Password** | `shofimofasselerdhoncuse` |
| **Database** | `scholarpass`          |
| **Port**   | `5432`                    |

---

## Connection URLs

**From the EC2 instance (localhost):**
```
postgresql://Alvee:shofimofasselerdhoncuse@localhost:5432/scholarpass
```

**From your app or another machine (remote):**
```
postgresql://Alvee:shofimofasselerdhoncuse@ec2-16-16-143-59.eu-north-1.compute.amazonaws.com:5432/scholarpass
```

**URL-encoded password (if needed for special characters):**  
Password `shofimofasselerdhoncuse` has no special characters; use as-is. If you change it and use special characters, encode them in the URL.

**Example `.env`:**
```bash
DATABASE_URL=postgresql://Alvee:shofimofasselerdhoncuse@ec2-16-16-143-59.eu-north-1.compute.amazonaws.com:5432/scholarpass
```

---

## Database Status

**PostgreSQL 15.15** is installed and running with:
- ✅ 20 core tables created
- ✅ Master data populated (countries, languages, currencies, timezones, etc.)
- ✅ 3 seed users created (superadmin, admin, student)
- ✅ Remote connections configured
- ✅ pgcrypto extension enabled

### Current Tables

```
app_access_master_roles       master_ai_models              master_countries
app_permissions_masters       master_ai_prompt_libraries    master_currencies
app_users                     master_app_subscription_types master_duration_types
master_cities                 master_country_phones         master_hub_types
master_counties               master_languages              master_states
master_tag_categories         master_tag_groups             master_tags
master_time_zones             master_zip_codes
```

### Seed Users

| Username    | Email                        | Role        | Password (bcrypt hashed)        |
|------------|------------------------------|-------------|---------------------------------|
| superadmin | superadmin@scholarpass.com   | Super Admin | superadmin@scholarpass.com      |
| admin      | admin@scholarpass.com        | Admin       | admin@scholarpass.com           |
| student    | student@scholarpass.com      | Student     | student@scholarpass.com         |

*Note: Passwords are hashed with bcrypt. Use the email as the password for initial login.*

---

## Security notes

- **AWS Security Group**: Open inbound port `5432` only from your app’s IP or VPC CIDR, not `0.0.0.0/0`, in production.
- **SSL**: For production, configure PostgreSQL with SSL and use `?sslmode=require` in the connection URL.
- **Secrets**: Keep `database.pem` and the DB password out of version control; use env vars or a secrets manager for `DATABASE_URL`.

---

## Quick connect (psql)

```bash
# From your machine (after opening port 5432 and running setup)
psql "postgresql://Alvee:shofimofasselerdhoncuse@ec2-16-16-143-59.eu-north-1.compute.amazonaws.com:5432/scholarpass"
```

From EC2:
```bash
psql -h localhost -U Alvee -d scholarpass
# Enter password when prompted: shofimofasselerdhoncuse
```

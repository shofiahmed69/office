# 🔐 ScholarPass Database Credentials

**Last Updated**: January 29, 2026

---

## 📍 Connection URL

```
postgresql://Alvee:shofimofasselerdhoncuse@ec2-16-16-143-59.eu-north-1.compute.amazonaws.com:5432/scholarpass
```

---

## 🔑 Credentials

| Field | Value |
|-------|-------|
| **Host** | `ec2-16-16-143-59.eu-north-1.compute.amazonaws.com` |
| **Port** | `5432` |
| **Database** | `scholarpass` |
| **Username** | `Alvee` |
| **Password** | `shofimofasselerdhoncuse` |

---

## 🔗 For `.env` File

```bash
DATABASE_URL=postgresql://Alvee:shofimofasselerdhoncuse@ec2-16-16-143-59.eu-north-1.compute.amazonaws.com:5432/scholarpass

# Or separate variables:
DB_HOST=ec2-16-16-143-59.eu-north-1.compute.amazonaws.com
DB_PORT=5432
DB_NAME=scholarpass
DB_USER=Alvee
DB_PASSWORD=shofimofasselerdhoncuse
```

---

## 👤 Test Users (for application login)

| Username | Email | Password | Role |
|----------|-------|----------|------|
| `superadmin` | superadmin@scholarpass.com | `superadmin@scholarpass.com` | Super Admin |
| `admin` | admin@scholarpass.com | `admin@scholarpass.com` | Admin |
| `student` | student@scholarpass.com | `student@scholarpass.com` | Student |

---

## ✅ Quick Test

```bash
# Test connection
PGPASSWORD=shofimofasselerdhoncuse psql -h ec2-16-16-143-59.eu-north-1.compute.amazonaws.com -U Alvee -d scholarpass -c "SELECT version();"
```

---

**Status**: ✅ Password updated and verified working!

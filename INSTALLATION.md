# 📦 Installation Guide - Kanban App

## Prerequisites Checklist ✓

Sebelum memulai, pastikan Anda sudah menginstall:

- [ ] Node.js 18 atau lebih baru ([Download](https://nodejs.org/))
- [ ] PostgreSQL 12+ ([Download](https://www.postgresql.org/download/))
- [ ] npm atau yarn (biasanya sudah include dengan Node.js)
- [ ] Text editor (VS Code recommended)

## Step-by-Step Installation

### Step 1: Extract Project 📂

```bash
# Extract file ZIP ke folder yang diinginkan
unzip kanban-app-complete.zip
cd kanban-app
```

### Step 2: Install Dependencies 📚

```bash
# Install semua package yang diperlukan
npm install

# Atau menggunakan yarn
yarn install
```

**Estimated time:** 2-3 menit (tergantung koneksi internet)

### Step 3: Setup PostgreSQL Database 🗄️

#### Option A: Menggunakan psql (Command Line)

```bash
# Login ke PostgreSQL
psql -U postgres

# Di dalam psql prompt, buat database baru:
CREATE DATABASE kanban_db;

# Keluar dari psql
\q
```

#### Option B: Menggunakan pgAdmin (GUI)

1. Buka pgAdmin
2. Right-click pada "Databases"
3. Create → Database
4. Nama: `kanban_db`
5. Save

### Step 4: Configure Environment Variables ⚙️

File `.env` sudah ada di project. Edit jika perlu:

```bash
# Buka .env dengan text editor
nano .env
# atau
code .env
```

Update credentials jika berbeda:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/kanban_db
NEXTAUTH_SECRET=super-secret-key-for-development-only
NEXTAUTH_URL=http://localhost:3000
```

**Note:** 
- Ganti `your_password` dengan password PostgreSQL Anda
- `NEXTAUTH_SECRET` bisa diganti dengan string random untuk production

### Step 5: Initialize Database Schema 🏗️

```bash
# Jalankan script setup untuk membuat tables
npm run db:setup
```

**Expected output:**
```
Connecting to database...
Reading schema file...
Executing schema...
✅ Database setup completed successfully!
```

### Step 6: Seed Sample Data 🌱

```bash
# Populate database dengan data contoh
npm run db:seed
```

**Expected output:**
```
Connecting to database...
Creating demo user...
✅ User created with ID: 1
Creating sample project...
✅ Project created with ID: 1
Creating default columns...
✅ Column created: Inbox
✅ Column created: To Plan
...
🎉 Database seeded successfully!

Login credentials:
Email: admin@example.com
Password: admin123
```

### Step 7: Start Development Server 🚀

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 2.1s
```

### Step 8: Access the Application 🌐

1. Buka browser
2. Navigate to: **http://localhost:3000**
3. Anda akan redirect ke halaman login

**Login dengan:**
- Email: `admin@example.com`
- Password: `admin123`

---

## Verification ✅

Setelah login, Anda harus bisa melihat:
- ✓ Dashboard dengan navigation
- ✓ Project card "Personal Tasks"
- ✓ Tombol "New Project"

Click project untuk melihat Kanban board dengan:
- ✓ 7 default columns
- ✓ 5 sample tasks
- ✓ Drag & drop functionality

---

## Common Issues & Solutions 🔧

### Issue: Cannot connect to database

**Error:** `Error: connect ECONNREFUSED`

**Solutions:**
1. Pastikan PostgreSQL service running:
   ```bash
   # Windows
   pg_ctl status
   
   # macOS (Homebrew)
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Start PostgreSQL jika belum running:
   ```bash
   # Windows
   pg_ctl start
   
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

3. Check DATABASE_URL di `.env` file

---

### Issue: Port 3000 already in use

**Error:** `Port 3000 is already in use`

**Solutions:**

Option 1: Stop aplikasi yang menggunakan port 3000
```bash
# Find process
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

Option 2: Use different port
```bash
PORT=3001 npm run dev
```

---

### Issue: Module not found errors

**Error:** `Cannot find module 'next'` atau similar

**Solution:**
```bash
# Remove node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: Database already exists

**Error:** `database "kanban_db" already exists`

**Solution:**

Jika Anda ingin reset database:
```bash
# Login ke psql
psql -U postgres

# Drop existing database
DROP DATABASE kanban_db;

# Create new database
CREATE DATABASE kanban_db;

# Exit
\q

# Run setup again
npm run db:setup
npm run db:seed
```

---

### Issue: Permission denied on PostgreSQL

**Error:** `permission denied for schema public`

**Solution:**
```sql
-- Login ke psql sebagai superuser
psql -U postgres

-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

---

## Production Deployment 🚀

Untuk deploy ke production:

1. **Setup Production Database**
   - Railway, Supabase, atau AWS RDS
   - Copy connection string

2. **Update Environment Variables**
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db
   NEXTAUTH_SECRET=generate-strong-random-secret
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Deploy to Hosting**
   - Vercel (Recommended)
   - Netlify
   - Railway
   - Digital Ocean

---

## Directory Structure 📁

```
kanban-app/
├── app/                    # Next.js pages (App Router)
│   ├── (dashboard)/       # Protected routes
│   ├── api/               # API endpoints
│   ├── login/             # Auth pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Login form
│   ├── kanban/           # Board components
│   ├── projects/         # Project components
│   ├── tasks/            # Task components
│   └── ui/               # Reusable UI
├── lib/                  # Utilities
│   ├── auth/            # NextAuth config
│   └── db/              # Database connection
├── stores/              # Zustand stores
├── types/               # TypeScript types
├── database/            # SQL schema
└── scripts/             # Setup scripts
```

---

## Scripts Reference 📝

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:setup` | Create database schema |
| `npm run db:seed` | Insert sample data |

---

## Tech Stack Summary 🛠️

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + postgres.js
- **Auth:** NextAuth.js v5
- **State:** Zustand
- **UI:** Tailwind CSS
- **DnD:** @dnd-kit
- **Icons:** Lucide React
- **Dates:** date-fns

---

## Next Steps 🎯

1. ✨ Explore the Kanban board
2. 📝 Create your first project
3. 🏷️ Try adding tags
4. ⏱️ Use the timer feature
5. 🎨 Customize colors
6. 📱 Test on mobile

---

## Getting Help 💬

If you encounter any issues:

1. Check this guide's "Common Issues" section
2. Review the main README.md
3. Check console logs for error messages
4. Verify all prerequisites are installed
5. Ensure PostgreSQL is running

---

**Congratulations! 🎉**

Your Kanban App is now ready to use!

Happy project managing! 🚀

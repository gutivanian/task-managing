# QUICK START GUIDE

## Setup dalam 5 Menit! 🚀

### 1. Extract & Install
```bash
# Extract file ZIP
unzip kanban-app.zip
cd kanban-app

# Install dependencies
npm install
```

### 2. Setup Database
```bash
# Pastikan PostgreSQL sudah running
# Buat database baru
psql -U postgres -c "CREATE DATABASE kanban_db;"

# Update .env dengan kredensial PostgreSQL Anda
# File .env sudah tersedia, tinggal edit jika perlu

# Setup schema & seed data
npm run db:setup
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Login
Buka browser: http://localhost:3000

**Login dengan:**
- Email: `admin@example.com`
- Password: `admin123`

## Troubleshooting

### Error: Database connection failed
- Pastikan PostgreSQL running
- Check kredensial di file `.env`
- Pastikan database `kanban_db` sudah dibuat

### Error: Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 sudah digunakan
```bash
# Gunakan port lain
PORT=3001 npm run dev
```

## Fitur Utama

✅ Login/Logout dengan NextAuth.js
✅ Create/Edit/Delete Projects
✅ Kanban Board dengan Drag & Drop
✅ Create/Edit/Delete Tasks
✅ Timer untuk tracking waktu
✅ Tags & Priority levels
✅ Responsive design (mobile-friendly)

## File Structure
```
kanban-app/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Database & auth utilities
├── stores/           # Zustand state management
├── types/            # TypeScript types
├── database/         # SQL schema
└── scripts/          # Setup & seed scripts
```

## Next Steps

1. ✨ Explore the kanban board
2. 📝 Create your first task
3. ⏱️ Try the timer feature
4. 🎨 Customize project colors
5. 🏷️ Add tags to organize tasks

## Need Help?

Check README.md untuk dokumentasi lengkap!

Happy organizing! 🎯

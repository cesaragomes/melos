# Melos — WebApp Gerenciador de Partituras

Biblioteca privada compartilhada para catalogação, triagem em tela dividida (Split-Screen) e leitura de partituras em PDF integrada ao **Google Drive API v3** e **Supabase (PostgreSQL)**, publicada via **GitHub Pages** com **GitHub Actions Secrets**.

## Estrutura do Pacote

- `index.html`: Aplicação completa pronta para execução com estética clássica em tons de papel creme, madeira de luthieria e dourado/âmbar.
- `public/assets/`: Artes oficiais geradas exclusivamente para o Melos (`logo.jpg`, `hero.jpg`, `inbox.jpg`).
- `.github/workflows/deploy.yml`: Automação que lê seus **GitHub Actions Secrets** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_DRIVE_FOLDER_ID`, `VITE_APP_PASSWORD`) e publica no GitHub Pages.
- `supabase/schema.sql`: Script SQL completo para criar a tabela `scores`, índices de busca textual (Full-Text Search) e políticas de segurança no Supabase.
- `scripts/catalogar_acervo_drive.py`: Utilitário Python para migração e parsing inicial de partituras (`Compositor - Obra (Arranjador).pdf`).
- `src/`: Módulos TypeScript (`src/types/score.ts`, `src/services/googleDrive.ts`) documentados para evolução e migração futura para Home Server / Docker.

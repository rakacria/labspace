# Labspace — Roadmap de Implementação

## Sprint 1: Fundação (Setup & Infra)
- [x] **1.1 Inicializar projeto Next.js**
  - [x] `create-next-app` com App Router + TypeScript
  - [x] Estrutura de pastas (`app/`, `components/`, `lib/`, `types/`)
  - [x] Configurar `.env.local` com variáveis Supabase
- [x] **1.2 Configurar Tailwind + shadcn/ui**
  - [x] Instalar e configurar shadcn/ui
  - [x] Tema escuro como padrão (estética "research lab")
  - [x] Componentes base: Button, Card, Badge, Table, Dialog, Tabs
- [x] **1.3 Setup Supabase (schema do banco)**
  - [x] Tabela `profiles` (id, username, avatar_url, bio, github_username, created_at)
  - [x] Tabela `programs` (id, author_id, title, slug, content, description, forked_from, fork_count, best_val_bpb, is_public, created_at, updated_at)
  - [x] Tabela `submissions` (id, program_id, user_id, val_bpb, hardware, runtime_s, notes, log_url, metadata, created_at)
  - [x] Tabela `comments` (id, program_id, user_id, content, created_at)
  - [x] Tabela `activities` (id, user_id, type, program_id, metadata, created_at)
  - [x] RLS (Row Level Security) policies
  - [x] Triggers: auto-update best_val_bpb, fork_count, activity log
- [x] **1.4 Configurar Auth com GitHub OAuth**
  - [x] Supabase Auth com provider GitHub
  - [x] Middleware de proteção de rotas (proxy.ts no Next.js 16)
  - [x] Server-side auth helpers
  - [x] Trigger para criar profile on signup

## Sprint 2: Core UI + Leaderboard (a LP)
- [x] **2.1 Layout base**
  - [x] Navbar (logo, links, auth button)
  - [x] Footer
  - [x] Layout responsivo
- [x] **2.2 Leaderboard / Landing Page**
  - [x] Hero section (título + descrição curta)
  - [x] Tabela de ranking (posição, programa, val_bpb, autor, forks, data)
  - [x] Empty state (quando não há programas)
- [x] **2.3 Página do Programa (`/program/[slug]`)**
  - [x] Renderização do program.md (Markdown → HTML)
  - [x] Header com título, autor, val_bpb, data, link fork
  - [x] Aba "Resultados" (lista de submissions)
  - [x] Aba "Linhagem" (árvore de forks)
  - [x] Aba "Comentários"
- [x] **2.4 Submissão de Programa (`/submit`)**
  - [x] Formulário: título, conteúdo (editor markdown), descrição
  - [x] Campos de resultado: val_bpb, hardware, runtime, notas
  - [x] Upload de log de treinamento (Supabase Storage)
  - [x] Preview do markdown
  - [x] Validação e submit
- [x] **2.5 Fork de Programa**
  - [x] Botão "Fork" na página do programa
  - [x] Cópia do conteúdo para novo programa (forked_from preenchido)
  - [x] Redirect para editor do fork
  - [x] Incremento do fork_count no original

## Sprint 3: Perfil + Feed + Social
- [x] **3.1 Perfil do Pesquisador (`/user/[username]`)**
  - [x] Dados do perfil (avatar, bio, GitHub)
  - [x] Lista de programas publicados
  - [x] Melhor val_bpb
  - [x] Histórico de forks
- [x] **3.2 Feed de Atividade (`/feed`)**
  - [x] Timeline de atividades recentes
  - [x] Tipos: novo programa, nova submission, fork, novo recorde, comentário
  - [x] Ícones e formatação por tipo
- [x] **3.3 Comentários**
  - [x] Sistema de comentários nas páginas de programas
  - [x] Markdown nos comentários

## Sprint 4: Polish + Deploy
- [ ] **4.1 SEO e Meta tags**
  - [ ] Open Graph tags por página
  - [ ] Sitemap dinâmico
- [ ] **4.2 Responsividade e mobile**
  - [ ] Testar e ajustar todas as páginas
- [ ] **4.3 Deploy**
  - [ ] Deploy Vercel
  - [ ] Domínio customizado
  - [ ] Variáveis de ambiente em produção
- [ ] **4.4 README e documentação**
  - [ ] README.md do projeto
  - [ ] Guia de contribuição

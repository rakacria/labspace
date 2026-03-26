# Labspace — Roadmap de Implementação

## Sprint 1: Fundação (Setup & Infra)
- [ ] **1.1 Inicializar projeto Next.js**
  - [ ] `create-next-app` com App Router + TypeScript
  - [ ] Estrutura de pastas (`app/`, `components/`, `lib/`, `types/`)
  - [ ] Configurar `.env.local` com variáveis Supabase
- [ ] **1.2 Configurar Tailwind + shadcn/ui**
  - [ ] Instalar e configurar shadcn/ui
  - [ ] Tema escuro como padrão (estética "research lab")
  - [ ] Componentes base: Button, Card, Badge, Table, Dialog, Tabs
- [ ] **1.3 Setup Supabase (schema do banco)**
  - [ ] Tabela `profiles` (id, username, avatar_url, bio, github_username, created_at)
  - [ ] Tabela `programs` (id, author_id, title, slug, content, description, forked_from, fork_count, best_val_bpb, is_public, created_at, updated_at)
  - [ ] Tabela `submissions` (id, program_id, user_id, val_bpb, hardware, runtime_s, notes, log_url, metadata, created_at)
  - [ ] Tabela `comments` (id, program_id, user_id, content, created_at)
  - [ ] Tabela `activities` (id, user_id, type, program_id, metadata, created_at)
  - [ ] RLS (Row Level Security) policies
  - [ ] Triggers: auto-update best_val_bpb, fork_count, activity log
- [ ] **1.4 Configurar Auth com GitHub OAuth**
  - [ ] Supabase Auth com provider GitHub
  - [ ] Middleware de proteção de rotas
  - [ ] Hook `useUser` / server-side auth helpers
  - [ ] Trigger para criar profile on signup

## Sprint 2: Core UI + Leaderboard (a LP)
- [ ] **2.1 Layout base**
  - [ ] Navbar (logo, links, auth button)
  - [ ] Footer
  - [ ] Layout responsivo
- [ ] **2.2 Leaderboard / Landing Page**
  - [ ] Hero section (título + descrição curta)
  - [ ] Tabela de ranking (posição, programa, val_bpb, autor, forks, data)
  - [ ] Filtros (período, hardware)
  - [ ] Realtime updates via Supabase
  - [ ] Empty state (quando não há programas)
- [ ] **2.3 Página do Programa (`/program/[slug]`)**
  - [ ] Renderização do program.md (Markdown → HTML)
  - [ ] Header com título, autor, val_bpb, data, link fork
  - [ ] Aba "Resultados" (lista de submissions)
  - [ ] Aba "Linhagem" (árvore de forks)
  - [ ] Aba "Comentários"
- [ ] **2.4 Submissão de Programa (`/submit`)**
  - [ ] Formulário: título, conteúdo (editor markdown), descrição
  - [ ] Campos de resultado: val_bpb, hardware, runtime, notas
  - [ ] Upload de log de treinamento (Supabase Storage)
  - [ ] Preview do markdown
  - [ ] Validação e submit
- [ ] **2.5 Fork de Programa**
  - [ ] Botão "Fork" na página do programa
  - [ ] Cópia do conteúdo para novo programa (forked_from preenchido)
  - [ ] Redirect para editor do fork
  - [ ] Incremento do fork_count no original

## Sprint 3: Perfil + Feed + Social
- [ ] **3.1 Perfil do Pesquisador (`/user/[username]`)**
  - [ ] Dados do perfil (avatar, bio, GitHub)
  - [ ] Lista de programas publicados
  - [ ] Posição no leaderboard
  - [ ] Histórico de forks
- [ ] **3.2 Feed de Atividade (`/feed`)**
  - [ ] Timeline de atividades recentes
  - [ ] Tipos: novo programa, nova submission, fork, novo recorde, comentário
  - [ ] Ícones e formatação por tipo
- [ ] **3.3 Comentários**
  - [ ] Sistema de comentários nas páginas de programas
  - [ ] Markdown nos comentários
  - [ ] Notificação de atividade

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

# Plano de Implementação - BJJ Tournament Manager

Este documento detalha o passo a passo para implementar cada feature do sistema. Cada seção contém instruções específicas de código para a IA seguir até completar a implementação.

---

## FASE 1: TELA INICIAL (Seleção de Entrada)

**Objetivo:** Criar a tela que o usuário vê ao acessar o sistema, com dois botões para escolher entre Admin ou Placar.

### Passos de Implementação

#### Passo 1: Limpar o código boilerplate do Next.js

Editar `app/page.tsx`:
- Remover todo o conteúdo atual
- Manter apenas o import do React (não é necessário em Next.js 16, mas manter se precisar)

#### Passo 2: Criar a estrutura da página

Criar os botões de seleção:
- Container centralizado com flexbox
- Título "BJJ Tournament" no topo
- Dois cards/botões grandes: "Administração" e "Placar"

#### Passo 3: Implementar navegação

- Botão "Administração" → Link para `/admin`
- Botão "Placar" → Link para `/scoreboard/setup`
- Usar componente `Link` do Next.js ou `<a>` tag

#### Passo 4: Aplicar a paleta de cores

- Fundo: Preto (#0A0A0A)
- Cards: Azul Anil (#4338CA) para destaque
- Texto: Branco (#FFFFFF)
- Usar classes Tailwind: `bg-[#4338CA]`, `text-white`, etc.

### Estrutura de Arquivo Esperado

```tsx
// app/page.tsx
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-[#D4AF37] mb-12">🏆 BJJ Tournament</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <Link href="/admin" className="...">
          {/* Card Administração */}
        </Link>
        
        <Link href="/scoreboard/setup" className="...">
          {/* Card Placar */}
        </Link>
      </div>
    </div>
  )
}
```

### Checklist de Validação

- [ ] Página renderiza sem erros
- [ ] Dois botões visíveis claramente
- [ ] Cores aplicadas conforme paleta (Azul Anil, Preto, Dourado)
- [ ] Links funcionam e redirecionam corretamente
- [ ] Layout responsivo (funciona em mobile)

---

## FASE 2: PAINEL ADMINISTRATIVO

**Objetivo:** Criar a base do dashboard do administrador com navegação e estrutura de páginas.

### Passos de Implementação

#### Passo 1: Criar estrutura de pastas

```
app/admin/
├── layout.tsx    # Layout com sidebar
├── page.tsx      # Dashboard principal
```

#### Passo 2: Criar layout com sidebar

Em `app/admin/layout.tsx`:
- Sidebar com navegação (Dashboard, Atletas, Categorias, Lutas)
- Link de retorno para página inicial (`/`)
- Usar paleta de cores: fundo preto, destaque azul anil

#### Passo 3: Criar página inicial do admin

Em `app/admin/page.tsx`:
- Título "Painel Administrativo"
- Cards de atalhos rápidos
- Espaço para métricas futuras

### Estrutura de Arquivo Esperado

```tsx
// app/admin/layout.tsx
import Link from "next/link"

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <aside className="w-64 bg-black border-r border-gray-800 p-4">
        <Link href="/" className="text-[#D4AF37] mb-8 block">← Voltar</Link>
        <nav className="space-y-2">
          <Link href="/admin" className="block p-2 bg-[#4338CA] rounded">Dashboard</Link>
          <Link href="/admin/atletas" className="block p-2 hover:bg-gray-800 rounded">Atletas</Link>
          <Link href="/admin/categorias" className="block p-2 hover:bg-gray-800 rounded">Categorias</Link>
          <Link href="/admin/competicoes" className="block p-2 hover:bg-gray-800 rounded">Competições</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
```

### Checklist de Validação

- [ ] Layout com sidebar visível
- [ ] Navegação entre páginas funciona
- [ ] Botão de retorno para página inicial
- [ ] Cores aplicadas corretamente

---

## FASE 3: CRONÔMETRO

**Objetivo:** Criar o componente de cronômetro com contagem regressiva configurável.

### Passos de Implementação

#### Passo 1: Criar componente de cronômetro

Criar arquivo `app/components/Timer.tsx`:

**Estados necessários:**
- `timeLeft` - tempo restante em segundos
- `isRunning` - se o cronômetro está rodando
- `isPaused` - se está pausado
- `totalTime` - tempo total configurado

**Funcionalidades:**
1. Input para configurar tempo (minutos:segundos)
2. Botão Iniciar → começa contagem regressiva
3. Botão Pausar → para temporariamente
4. Botão Reiniciar → volta ao tempo configurado
5. Alerta visual nos últimos 30 segundos (cor de fundo muda para vermelho)
6./suporte a parcial (mestre/penalt) - dois tempos definidos

#### Passo 2: Implementar lógica do timer

```tsx
// Estrutura base do componente
"use client"
import { useState, useEffect, useRef } from "react"

export function Timer() {
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isWarning, setIsWarning] = useState(false)
  
  // Função para formatar tempo (MM:SS)
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  
  // Lógica de contagem regressiva com useEffect
  // Alerta visual quando timeLeft <= 30
}
```

### Checklist de Validação

- [ ] Timer exibe tempo no formato MM:SS
- [ ] Input permite configurar minutos e segundos
- [ ] Botão Iniciar inicia contagem regressiva
- [ ] Botão Pausar para contagem
- [ ] Botão Reiniciar reseta para tempo configurado
- [ ] Alerta visual nos últimos 30 segundos (fundo vermelho ou destaque)
- [ ] Timer continua mesmo com re-render

---

## FASE 4: SISTEMA DE PONTUAÇÃO

**Objetivo:** Criar painel de pontuação com botões para 2, 3, 4 pontos, vantagens, penalidades e botão desfazer.

### Passos de Implementação

#### Passo 1: Criar estrutura de dados da luta

```ts
// tipos.ts
interface Lutador {
  nome: string
  equipe: string
  pontos: number
  vantagens: number
  penalidades: number
}

interface Pontuacao {
  tipo: "ponto" | "vantagem" | "penalidade"
  valor: number // 2, 3, 4 para pontos
  lutador: "atleta1" | "atleta2"
  timestamp: Date
}
```

#### Passo 2: Criar componente ScorePanel

Criar `app/components/ScorePanel.tsx`:

**Para cada lutador:**
- Nome do lutador
- equipe (ex: "Team Nogueira")
- Categoria (ex: "Branca Infantil")
- Pontos: botões [2] [3] [4]
- Vantagens: botão [+1]
- Penalidades: botão [-1]
- Botão Desfazer (para reverter última ação)



#### Passo 3: Implementar lógica de desfazer

```tsx
// Função para desfazer última pontuação
const undoLastScore = () => {
  if (history.length === 0) return
  
  const lastAction = history[history.length - 1]
  
  // Remover do histórico
  setHistory(prev => prev.slice(0, -1))
  
  // Reverter pontuação
  if (lastAction.tipo === "ponto") {
    // Diminuir pontos do lutador
  } else if (lastAction.tipo === "vantagem") {
    // Diminuir vantagem
  } else if (lastAction.tipo === "penalidade") {
    // Diminuir penalidade
  }
}
```

### Checklist de Validação

- [ ] Botões 2, 3, 4 pontos funcionam para cada lutador
- [ ] Botão +1 vantagem funciona
- [ ] Botão -1 penalidade funciona
- [ ] Botão Desfazer remove última pontuação
- [ ] Histórico de pontuações é exibido
- [ ] Nome, equipe e categoria são exibidos corretamente

---

## FASE 5: TELA DE PRÉ-PLACAR

**Objetivo:** Criar tela de configuração antes do placar: importar JSON da chave e registrar área/árbitro.

### Passos de Implementação

#### Passo 1: Criar página de setup

Criar pasta e arquivo:
```
app/scoreboard/setup/
└── page.tsx
```

#### Passo 2: Implementar importação de JSON

```tsx
// Input de arquivo
<input 
  type="file" 
  accept=".json"
  onChange={handleFileImport}
  className="..."
/>

// Função para validar JSON
const handleFileImport = (event) => {
  const file = event.target.files[0]
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      // Validar estrutura esperada
      // setChaveData(data)
    } catch (err) {
      // Mostrar erro de JSON inválido
    }
  }
  
  reader.readAsText(file)
}
```

**Estrutura esperada do JSON:**
```json
{
  "categoria": "Branca Infantil",
  "luta": {
    "atleta1": {
      "nome": "João Silva",
      "equipe": "Team Brasil"
    },
    "atleta2": {
      "nome": "Maria Santos",
      "equipe": "Team São Paulo"
    }
  }
}
```

#### Passo 3: Campos de área e árbitro

- Input para número/nome da área (ex: "Área 1", "Quadra A")
- Input para nome do árbitro
- Esses dados ficam disponíveis para a página de placar

#### Passo 4: Botão Iniciar Placar

- Redireciona para `/scoreboard`
- Passa os dados via state/URL params ou context
- Valida que importação foi feita ou permite pular

### Checklist de Validação

- [ ] Botão importar arquivo funciona
- [ ] JSON válido é parseado e exibido em preview
- [ ] JSON inválido mostra mensagem de erro clara
- [ ] Campos de área e árbitro funcionam
- [ ] Botão "Iniciar Placar" redireciona corretamente

---

## FASE 6: PLACAR EM TEMPO REAL

**Objetivo:** Criar a tela de exibição pública para telão/projetor com todas as informações da luta.

### Passos de Implementação

#### Passo 1: Criar estrutura de pastas

```
app/scoreboard/
├── layout.tsx    # Layout fullscreen
└── page.tsx      # Placar principal
```

#### Passo 2: Layout fullscreen

Em `app/scoreboard/layout.tsx`:
- Remover scrollbars
- Maximizar tela
- Fundo otimizado para projetor

#### Passo 3: Componente de placar

Em `app/scoreboard/page.tsx`:

**Cabeçalho (topo):**
- Área de luta (ex: "ÁREA 1")
- Nome do árbitro

**Área Central:**
- Dois lados (vermelho/azul tradicionalmente)
- Nome do lutador 1 + equipe
- Nome do lutador 2 + equipe

**Placar de cada lado:**
- Pontuação grande (0, 2, 3, 4...)
- Vantagens
- Penalidades

**Cronômetro:**
- Grande e visível no centro/top

**Categoria:**
- Exibir abaixo dos nomes (ex: "BRANCA INFANTIL")

#### Passo 4: Design para telão

- Fontes grandes (mínimo 48px para pontuação)
- Alto contraste (fundo escuro, texto claro)
- Cores: Dourado para destaque, Azul Anil para elementos

### Estrutura Esperada

```tsx
// app/scoreboard/page.tsx
export default function Scoreboard() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="flex justify-between p-4 border-b border-[#4338CA]">
        <span className="text-[#D4AF37] text-2xl">ÁREA 1</span>
        <span className="text-xl">Árbitro: João Silva</span>
      </header>
      
      {/* Luta */}
      <main className="flex justify-center items-center py-12">
        {/* Lutador 1 */}
        <div className="text-center">
          <h2 className="text-6xl mb-4">João Silva</h2>
          <p className="text-2xl text-gray-400">Team Brasil</p>
          <p className="text-[#D4AF37] text-xl mb-8">Branca Infantil</p>
          <div className="text-9xl font-bold text-[#4338CA]">0</div>
          <div className="flex gap-4 mt-4">
            <span>Vantagens: 0</span>
            <span>Penalidades: 0</span>
          </div>
        </div>
        
        {/* Cronômetro */}
        <div className="text-8xl mx-16 font-mono">05:00</div>
        
        {/* Lutador 2 */}
        <div className="text-center">...</div>
      </main>
    </div>
  )
}
```

### Checklist de Validação

- [ ] Layout fullscreen sem scrollbar
- [ ] Nomes dos lutadores em tamanho grande
- [ ] Equipes exibidas abaixo dos nomes
- [ ] Categoria exibida claramente
- [ ] Pontuação grande e visível
- [ ] Vantagens e penalidades visíveis
- [ ] Cronômetro grande no centro
- [ ] Área e árbitro no topo
- [ ] Cores aplicadas (Azul Anil, Dourado, Preto)

---

## ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **FASE 1** → Tela Inicial (mais simples, verifica setup)
2. **FASE 2** → Painel Admin (estrutura base)
3. **FASE 3** → Cronômetro (funcionalidade core)
4. **FASE 4** → Sistema de Pontuação (funcionalidade core)
5. **FASE 5** → Pré-Placar (importação + configuração)
6. **FASE 6** → Placar em Tempo Real (exibição pública)

---

*Plano de implementação - Versão 1.0 - 2026-05-16*
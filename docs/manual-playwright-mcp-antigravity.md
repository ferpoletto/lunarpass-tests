# Guia Completo: Automação Web com Playwright e MCP no Google Antigravity

Este manual descreve o passo a passo completo para implementar, configurar e utilizar um projeto de testes automatizados com **Playwright** integrado ao **Playwright MCP (Model Context Protocol)** dentro do **Google Antigravity**.

Com essa configuração, você pode pedir ao agente de IA do Antigravity em linguagem natural para navegar no seu sistema local ou web, inspecionar a interface, preencher formulários, mapear elementos no padrão **Page Object Model (POM)** e gerar suítes completas de testes.

---

## 1. Visão Geral e Arquitetura

### O que é o Model Context Protocol (MCP)?
O **MCP** é um protocolo aberto que conecta assistentes de inteligência artificial (como o Google Antigravity) a ferramentas externas e fontes de dados contextuais.

### Por que usar o `@playwright/mcp`?
Diferente de abordagens tradicionais que usam visão computacional pesada (captura e interpretação de screenshots pixel a pixel), o servidor `@playwright/mcp`:
1. Controla uma instância real de navegador Chromium/WebKit/Firefox.
2. Extrai a **Árvore de Acessibilidade** (*Accessibility Tree*) da página via `browser_snapshot`.
3. Fornece identificadores únicos (`ref`) para botões, campos e links, permitindo que a IA interaja com a página de forma determinística, rápida e com baixo consumo de tokens de contexto.

```mermaid
flowchart LR
    User["Desenvolvedor / QA"] -->|"Prompt em Linguagem Natural"| Agent["Google Antigravity Agent"]
    Agent -->|"Chamadas de Ferramenta (MCP)"| MCP["@playwright/mcp Server"]
    MCP -->|"Automação do Navegador"| Browser["Navegador (Chromium / WebKit)"]
    Browser -->|"Árvore de Acessibilidade (Snapshot)"| MCP
    MCP -->|"Nós Semânticos com ref"| Agent
    Agent -->|"Gera Código POM & Specs"| Project["Projeto Playwright Test"]
```

---

## 2. Pré-requisitos

1. **Node.js**: Versão 18 ou 20+ instalada ([nodejs.org](https://nodejs.org)).
2. **NPM** ou **Yarn**.
3. **Google Antigravity**: Versão IDE ou Desktop App 2.0.
4. **Aplicação Alvo**: Aplicação em execução (ex: `http://localhost:3000`).
5. **Banco de Dados (Opcional, se houver persistência)**: PostgreSQL, MySQL ou Docker container com o banco do projeto.

---

## 3. Estrutura Recomendada do Projeto

```text
meu-projeto-testes/
├── .agents/                               # Customizações do Antigravity no projeto
│   ├── plugins/
│   │   └── playwright-mcp/
│   │       ├── plugin.json                # Manifesto do plugin
│   │       ├── mcp_config.json            # Configuração do MCP no workspace
│   │       └── skills/
│   │           └── playwright-navigation/ # Skill espelhada no plugin
│   └── skills/
│       └── playwright-navigation/
│           ├── SKILL.md                   # Instruções da Skill para a IA
│           ├── references/
│           │   └── tools.md               # Especificação detalhada das ferramentas
│           └── examples/
│               └── form-flow.md           # Exemplo prático de fluxo
├── docs/                                  # Documentação de negócio e requisitos
├── pages/                                 # Page Object Model (POM)
│   ├── components/
│   │   └── navbar.ts
│   ├── home/
│   │   └── home.page.ts
│   └── login.page.ts
├── tests/                                 # Especificações de teste (Specs)
│   ├── home/
│   │   └── home.spec.ts
│   └── login.spec.ts
├── support/                               # Utilitários, conexões de banco e mocks
│   ├── db.ts                              # Conexão com banco via Kysely / pg
│   ├── helpers.ts                         # Formatadores e utilitários
│   └── types.ts                           # Tipagens TypeScript
├── package.json                           # Dependências e scripts
├── playwright.config.ts                   # Configuração global do Playwright Test
└── tsconfig.json                          # Configuração do TypeScript
```

---

## 4. Passo a Passo de Implementação

### Passo 1: Inicializar o Projeto Node e Playwright

No terminal do diretório raiz:

```bash
# Inicializar package.json se não existir
npm init -y

# Instalar o Playwright Test e TypeScript
npm install -D @playwright/test @types/node typescript

# Instalar dependências para testes com banco e dados falsos
npm install -D pg @types/pg kysely @faker-js/faker

# Instalar os binários dos navegadores do Playwright
npx playwright install chromium --with-deps
```

### Passo 2: Configurar o `playwright.config.ts`

Crie o arquivo `playwright.config.ts` na raiz:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### Passo 3: Configurar a Camada de Suporte e Banco (`support/db.ts`)

Se sua aplicação necessita de manipulação ou limpeza de banco (como PostgreSQL), configure uma conexão via **Kysely** ou **pg**:

```typescript
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

interface Database {
  missions: {
    id: string;
    rocket: string;
    base_id: string;
    departure_date: string;
    return_date: string;
    price: number;
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lunarpass',
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});

export async function cleanMissionById(id: string) {
  await db.deleteFrom('missions').where('id', '=', id).execute();
}
```

---

## 5. Configurar o Servidor Playwright MCP no Antigravity

Para que o agente do Antigravity consiga invocar as ferramentas de automação web, registre o servidor MCP.

### Opção A: Configuração Global (Recomendada para Todas as Sessões)

Abra ou crie o arquivo no caminho do seu usuário:
* **Windows**: `C:\Users\<SeuUsuario>\.gemini\config\mcp_config.json`
* **Linux / macOS**: `~/.gemini/config/mcp_config.json`

Adicione a configuração:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Opção B: Configuração Local no Projeto (Via Plugin)

Crie a pasta `.agents/plugins/playwright-mcp/` na raiz do repositório:

1. Arquivo `.agents/plugins/playwright-mcp/plugin.json`:
```json
{
  "name": "playwright-mcp",
  "description": "Plugin de navegacao e automacao web com Playwright MCP",
  "version": "1.0.0"
}
```

2. Arquivo `.agents/plugins/playwright-mcp/mcp_config.json`:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

---

## 6. Criar a Skill de Navegação (`playwright-navigation`)

Skills no Antigravity funcionam como "manuais operacionais" sob demanda. A IA lê a descrição no frontmatter e ativa o procedimento sempre que necessário.

Crie o arquivo `.agents/skills/playwright-navigation/SKILL.md`:

```markdown
---
name: playwright-navigation
description: >-
  Guia e procedimentos para navegacao na web, interacao com elementos de paginas,
  inspecao de acessibilidade e automacao de testes utilizando as ferramentas do Playwright MCP.
  Use esta skill sempre que precisar navegar em paginas web, interagir com formularios,
  extrair dados dinamicos ou validar comportamentos no navegador.
---

# Navegacao e Automacao Web com Playwright MCP

## Ciclo de Vida Recomendado

```text
browser_navigate -> browser_snapshot -> [browser_find] -> interacao (click/fill) -> browser_wait_for -> novo snapshot -> browser_close
```

## Regras Importantes
1. **Sempre utilize `browser_snapshot`:** A árvore de acessibilidade fornece identificadores `ref` exatos.
2. **Utilize o argumento `target`:** Em ferramentas como `browser_click` e `browser_type`, passe o identificador `ref` retornado pelo snapshot.
3. **Sincronização:** Aplicações React/Next.js requerem aguardar hidratação de eventos antes de disparar submissões em lote.
```

---

## 7. Como Utilizar no Antigravity (Prompts e Exemplos)

Após configurar, abra o Antigravity na pasta do projeto e use os comandos diretamente no chat:

### Exemplo 1: Verificar se a aplicação está online
> *"Acesse a página http://localhost:3000 com o Playwright MCP e verifique se a aplicação está online."*

O agente executará:
1. `browser_navigate` para `http://localhost:3000`.
2. `browser_snapshot` para capturar a árvore de acessibilidade.
3. Retornará o título da página, elementos do cabeçalho e confirmação de resposta HTTP.

### Exemplo 2: Interagir com elementos da tela
> *"Na página inicial, marque a Base Lunar Orion no filtro de bases e clique em Buscar missões."*

O agente executará:
1. `browser_snapshot` para localizar o checkbox da base Orion.
2. `browser_click` no elemento com `target: "e28"`.
3. `browser_click` no botão de submissão.
4. Mostrará os resultados filtrados que apareceram no navegador.

### Exemplo 3: Gerar Page Object Model (POM) e Testes
> *"Acesse http://localhost:3000, mapeie todos os elementos da Home criando a classe pages/home/home.page.ts no padrão POM e gere os cenários de teste em tests/home/home.spec.ts."*

O agente:
1. Inspecionará toda a estrutura da página ativa.
2. Criará os seletores semânticos e métodos de ação na classe POM.
3. Criará a suíte de testes com asserções em Playwright.
4. Executará os testes e validará que passaram.

---

## 8. Execução e Validação dos Testes

Para rodar os testes gerados pelo agente:

```bash
# Executar todos os testes em modo headless
npx playwright test

# Executar somente a suite da Home
npx playwright test tests/home/home.spec.ts

# Executar com navegador visível (headed) para acompanhar a execução
npx playwright test tests/home/home.spec.ts --headed

# Visualizar o relatório HTML detalhado
npx playwright show-report
```

---

## 9. Boas Práticas e Dicas de Produção

1. **Hidratação em Frameworks Modernos (React / Next.js):**
   * Ao abrir a página no método `go()` do POM, aguarde estabilização de rede caso haja scripts assíncronos:
     ```typescript
     async go() {
         await this.page.goto('http://localhost:3000/');
         await expect(this.heroHeading).toBeVisible();
         await this.page.waitForLoadState('networkidle');
     }
     ```
2. **Seleção de Checkboxes Customizados:**
   * Em inputs onde o clique é interceptado por um `<label>` estilizado, utilize `await locator.click()` em vez de `await locator.check()`.
3. **Isolamento e Limpeza de Dados:**
   * Sempre execute a limpeza prévia do banco nos hooks `beforeEach` utilizando os helpers da camada `support/db.ts` para garantir idempotência dos testes.

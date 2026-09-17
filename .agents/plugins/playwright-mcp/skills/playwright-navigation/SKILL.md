---
name: playwright-navigation
description: >-
  Guia e procedimentos para navegacao na web, interacao com elementos de paginas, inspecao de acessibilidade e automacao de testes utilizando as ferramentas do Playwright MCP. Use esta skill sempre que precisar navegar em paginas web, interagir com formularios, extrair dados dinamicos ou validar comportamentos no navegador.
---

# Navegacao e Automacao Web com Playwright MCP

Esta skill orienta o agente na utilizacao do servidor **Playwright MCP** (`@playwright/mcp`) para controlar navegadores, inspecionar paginas web via accessibility tree e interagir com elementos de forma precisa e deterministica.

---

## 1. Fluxo de Trabalho Padrao

Para interagir com qualquer pagina web de forma segura e confiavel, siga sempre o ciclo:

```text
browser_navigate -> browser_snapshot -> [browser_find / localizar ref] -> acao (click/fill) -> browser_wait_for -> novo snapshot
```

### Passo a Passo

1. **Navegar para a URL:**
   - Execute `browser_navigate` informando o endereco completo (`url: "https://exemplo.com"`).
2. **Obter a Arvore de Acessibilidade (Snapshot):**
   - Execute `browser_snapshot`. O Playwright MCP retorna uma arvore estruturada de acessibilidade com os nós da pagina e seus respectivos identificadores `ref`.
   - **IMPORTANTE:** Sempre utilize `browser_snapshot` em vez de tentar adivinhar seletores CSS ou usar `browser_take_screenshot` para decidir acoes.
3. **Localizar Elementos Especificos:**
   - Para paginas densas ou com muitas informacoes, use `browser_find` passando termos de busca ou expressoes regulares para isolar o nó desejado e obter seu `ref`.
4. **Executar a Acao no Elemento:**
   - **Clique:** `browser_click` usando a referencia obtida do snapshot.
   - **Digitacao / Formularios:** 
     - Use `browser_type` para campos individuais editaveis.
     - Use `browser_fill_form` para preencher multiplos campos simultaneamente com eficiencia.
   - **Selecao em Dropdowns:** `browser_select_option`.
   - **Teclas especiais:** `browser_press_key` (Enter, Escape, Tab, etc.).
5. **Aguardar Estabilizacao:**
   - Sempre que uma acao disparar chamadas de rede ou transicao de tela, utilize `browser_wait_for` (aguardando texto especifico ou tempo minimo).
6. **Validar o Resultado:**
   - Execute um novo `browser_snapshot` para confirmar que a pagina refletiu o estado esperado (mensagens de sucesso, redirecionamentos, novos nós).
7. **Finalizar a Sessao:**
   - Ao concluir a tarefa, execute `browser_close` para liberar os recursos do navegador.

---

## 2. Ferramentas Disponiveis no Playwright MCP

| Ferramenta | Proposito Principal |
| :--- | :--- |
| `browser_navigate` | Carrega uma URL na aba ativa. |
| `browser_navigate_back` | Volta a pagina anterior no historico de navegacao. |
| `browser_snapshot` | Captura a arvore de acessibilidade da pagina ativa (fornece referencias `ref`). |
| `browser_find` | Pesquisa nós especificos por texto ou regex na arvore de acessibilidade. |
| `browser_click` | Clica em um elemento atraves de sua referencia ou coordenadas. |
| `browser_type` | Digita texto em um campo de entrada ativo ou referenciado. |
| `browser_fill_form` | Preenche multiplos campos de formulario em lote. |
| `browser_select_option` | Seleciona opcoes dentro de tags `<select>`. |
| `browser_hover` | Passa o cursor sobre um elemento (util para menus suspensos). |
| `browser_drag` / `browser_drop` | Executa operacoes de arrastar e soltar entre elementos. |
| `browser_press_key` | Envia comandos de teclado (`Enter`, `Tab`, `ArrowDown`, etc.). |
| `browser_wait_for` | Pausa a execucao ate que um texto surja/desapareca ou tempo transcorra. |
| `browser_tabs` | Lista, abre, alterna ou fecha abas do navegador. |
| `browser_handle_dialog` | Aceita ou recusa caixas de dialogo nativas (`alert`, `confirm`, `prompt`). |
| `browser_evaluate` | Executa scripts JavaScript arbitrarios no contexto do DOM. |
| `browser_console_messages` | Consulta mensagens de log, avisos e erros do console do navegador. |
| `browser_network_requests` | Lista e inspeciona requisicoes de rede feitas pela pagina. |
| `browser_take_screenshot` | Captura uma imagem da tela atual (evidencia ou inspecao visual). |
| `browser_close` | Fecha a pagina ou o navegador. |

---

## 3. Diretrizes e Boas Praticas

1. **Sempre Confiar nas Referencias (`ref`):**
   - Nao invente seletores complexos ou caminhos XPath frageis quando o `browser_snapshot` fornecer `ref`s diretos.
2. **Inspecao de Erros de Pagina:**
   - Se uma acao nao surtir o efeito esperado, consulte `browser_console_messages` para checar erros de JavaScript ou `browser_network_requests` para falhas em APIs (status 4xx/5xx).
3. **Tratamento de Janelas Modais e Alertas:**
   - Configure o comportamento de alertas antes ou imediatamente apos o clique usando `browser_handle_dialog`.
4. **Respeito a Delays e Renderizacao:**
   - Aplicacoes modernas (React, Vue, Angular, Next.js) realizam carregamentos assincronos. Utilize `browser_wait_for` garantindo que o elemento alvo esteja renderizado antes de clicar.
5. **Documentacao Complementar:**
   - Consulte [Guia Detalhado de Ferramentas](./references/tools.md) para a especificacao de parametros.
   - Veja [Exemplo Pratico de Fluxo](./examples/form-flow.md) para cenarios de login e formularios.

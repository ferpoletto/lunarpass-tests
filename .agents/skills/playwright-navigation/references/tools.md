# Referencia Completa das Ferramentas Playwright MCP

Este documento detalha cada ferramenta exposta pelo servidor `@playwright/mcp`, seus parametros e padroes recomendados de utilizacao.

---

## 1. Navegacao e Abas

### `browser_navigate`
Carrega uma URL na aba ativa atual.
- **Parametros:**
  - `url` (string, obrigatorio): A URL completa a ser acessada (ex: `https://lunarpass.dev`).
- **Dica:** Sempre execute `browser_snapshot` imediatamente apos a navegacao para inspecionar o estado inicial.

### `browser_navigate_back`
Retorna a pagina anterior no historico de navegacao da sessao.

### `browser_tabs`
Gerencia abas do navegador.
- **Parametros:**
  - `action` (string): `list`, `create`, `close`, `select`.
  - `tabIndex` ou `tabId`: Identificador da aba alvo quando selecionando ou fechando.

---

## 2. Inspecao e Descoberta de Elementos

### `browser_snapshot`
Captura a arvore de acessibilidade da pagina ativa.
- **Por que usar:** Em vez de imagens ou HTML bruto que consom muitos tokens, o snapshot retorna os nós visiveis, papeis semanticos (buttons, inputs, links), rotulos acessiveis e identificadores unicos (`ref`).
- **Dica:** Use o `ref` do elemento alvo para disparar cliques ou digitação.

### `browser_find`
Busca elementos no snapshot filtrando por texto ou expressao regular.
- **Parametros:**
  - `query` (string, obrigatorio): Texto ou padrao regex para buscar.
- **Retorno:** Nós correspondentes com linhas de contexto e seu caminho na arvore de acessibilidade.

---

## 3. Interacao com Elementos

### `browser_click`
Clica em um elemento da pagina.
- **Parametros:**
  - `target` (string, ref ou seletor): O identificador do nó retornado por `browser_snapshot` ou `browser_find`.
  - `button` (opcional): `left`, `right`, `middle` (padrao `left`).

### `browser_type`
Digita uma sequencia de caracteres em um campo de texto ativo ou referenciado.
- **Parametros:**
  - `target` (string, ref ou seletor): O identificador do elemento.
  - `text` (string): O conteudo a ser digitado.

### `browser_fill_form`
Preenche multiplos campos de formulario de forma atomica e eficiente.
- **Parametros:**
  - `fields` (array de objetos): Lista contendo `{ ref, value }` para cada campo.
- **Vantagem:** Evita multiplas chamadas sequenciais de `browser_type`, reduzindo a latencia de comunicacao.

### `browser_select_option`
Seleciona um ou mais valores em um elemento de dropdown (`<select>`).
- **Parametros:**
  - `target` (string, ref ou seletor): O identificador do elemento select.
  - `values` (array de strings): Valores ou rotulos das opcoes a selecionar.

### `browser_press_key`
Envia o pressionamento de teclas do teclado.
- **Parametros:**
  - `key` (string): Nome da tecla (ex: `Enter`, `Tab`, `Escape`, `ArrowDown`, `Backspace`).

### `browser_hover`
Posiciona o cursor do mouse sobre o elemento sem clicar.
- **Parametros:**
  - `target` (string, ref ou seletor): O identificador do elemento.

### `browser_drag` / `browser_drop`
Executa o fluxo de arrastar e soltar (drag and drop) de um nó de origem para um nó de destino.

---

## 4. Sincronizacao e Espera

### `browser_wait_for`
Aguarda condicoes especificas na pagina.
- **Parametros:**
  - `text` (string, opcional): Texto que deve aparecer ou desaparecer da tela.
  - `state` (string, opcional): `visible`, `hidden`.
  - `timeMs` (numero, opcional): Tempo maximo em milissegundos para esperar.

---

## 5. Captura Visual e Depuracao

### `browser_take_screenshot`
Gera uma imagem da viewport ou pagina inteira.
- **Uso recomendado:** Evidencia visual ao final de um teste ou para diagnostico de problemas de layout. Nao utilize imagens para tentar calcular cliques.

### `browser_console_messages`
Retorna as mensagens de log (info, warning, error) emitidas pelo JavaScript da pagina.

### `browser_network_requests` e `browser_network_request`
Permite listar chamadas HTTP e inspecionar cabeçalhos e corpo de respostas das APIs acessadas pela aplicacao web.

### `browser_evaluate`
Executa um script JS no contexto do navegador e retorna o resultado da avaliacao.


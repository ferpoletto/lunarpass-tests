# Exemplo Pratico: Fluxo Completo de Autenticacao e Validacao

Este exemplo demonstra o fluxo recomendado para autenticacao em um portal e verificacao de tela logada utilizando as ferramentas do Playwright MCP.

---

## Cenario: Login no Portal

### 1. Abertura da Pagina
```json
{
  "tool": "browser_navigate",
  "args": {
    "url": "https://meuapp.local/login"
  }
}
```

### 2. Inspecao Inicial do Formulario
```json
{
  "tool": "browser_snapshot",
  "args": {}
}
```
*Suponha que o snapshot retorne:*
- Input "E-mail" com `ref: "input-email-12"`
- Input "Senha" com `ref: "input-password-15"`
- Button "Entrar" com `ref: "btn-submit-20"`

### 3. Preenchimento dos Campos
```json
{
  "tool": "browser_fill_form",
  "args": {
    "fields": [
      { "ref": "input-email-12", "value": "usuario@teste.com" },
      { "ref": "input-password-15", "value": "SenhaSegura123!" }
    ]
  }
}
```

### 4. Submissao do Formulario
```json
{
  "tool": "browser_click",
  "args": {
    "ref": "btn-submit-20"
  }
}
```

### 5. Espera da Transicao de Pagina
```json
{
  "tool": "browser_wait_for",
  "args": {
    "text": "Bem-vindo",
    "state": "visible",
    "timeMs": 5000
  }
}
```

### 6. Validacao e Evidencia
```json
{
  "tool": "browser_snapshot",
  "args": {}
}
```
*Se necessario screenshot como evidencia:*
```json
{
  "tool": "browser_take_screenshot",
  "args": {}
}
```

### 7. Encerramento
```json
{
  "tool": "browser_close",
  "args": {}
}
```

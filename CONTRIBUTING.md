#  **CONTRIBUTING.md**

## **Guia de Contribuição — Projeto NexoCarreira**

Este documento descreve as **boas práticas de colaboração** adotadas pelo grupo NexoCarreira no desenvolvimento da plataforma.  
 O objetivo é manter um **fluxo de trabalho organizado, transparente e de fácil manutenção** para todos os membros e futuros colaboradores.

---

##  **Fluxo de Colaboração**

O projeto segue o **GitHub Flow**, um modelo simples e ágil de colaboração:

**Crie uma branch** a partir da `main` para cada nova funcionalidade ou correção:

 `git checkout -b feature/nome-da-feature`

1.   
2. **Faça commits pequenos e claros** conforme o progresso da tarefa.

**Envie a branch para o repositório remoto:**

 `git push origin feature/nome-da-feature`

3.   
4. **Abra um Pull Request (PR)** no GitHub assim que a funcionalidade estiver concluída.

5. O código será:

   * **testado por Andrew**, que roda os testes localmente;

   * **revisado e integrado por Vinícius**, garantindo qualidade e consistência no repositório principal.

6. Após a aprovação, o PR será integrado à `main`.

🔹 **Observação:** as tarefas são registradas e acompanhadas no **Jira**, e **bugs urgentes** são comunicados pelo grupo de WhatsApp do time.

---

## **Convenções de Branches e Commits**

### **🔹 Nome de branches**

Utilizamos o padrão:

* `feature/nome-da-feature` → para novas funcionalidades

* `fix/descricao-do-bug` → para correções

* `hotfix/descricao` → para ajustes urgentes

* `docs/descricao` → para alterações na documentação

 **Exemplos:**

`feature/integracao-gemini`  
`fix/erro-login`  
`docs/atualiza-readme`

---

### **🔹 Mensagens de commit**

Não há um padrão rígido de formatação, mas:

* Cada mensagem deve **deixar claro o que foi feito**.

* Escreva no **imperativo**, curto e direto.

* Exemplo:

  * `adiciona endpoint de análise do currículo`

  * `corrige erro na autenticação JWT`

  * `atualiza layout do dashboard`

 Evite commits genéricos como “mudanças” ou “ajustes”.

---

##  **Checklist antes de enviar código**

Antes de criar o Pull Request, verifique:

* O código foi **testado localmente** .

A branch está **atualizada com a versão mais recente da `main`**:

 `git pull origin main`

*   
* Não há **arquivos desnecessários** (logs, cache, arquivos de IDE).

* As mensagens de commit são **claras** e correspondem às alterações.

* Todos os **arquivos sensíveis** (ex: `.env`) estão no `.gitignore`.

*Nunca* envie arquivos de configuração pessoal, chaves de API, ou dados de ambiente local.

---

##  **Configuração do Projeto Localmente**

**Clone o repositório:**

 `git clone https://github.com/seuusuario/nexocarreira.git`  
`cd nexocarreira`

1. 

**Crie e ative um ambiente virtual:**

 `python -m venv venv`  
`source venv/bin/activate  # Linux/macOS`  
`venv\Scripts\activate     # Windows`

2. 

**Instale as dependências:**

 `pip install -r requirements.txt`

3. 

**Configure o arquivo `.env`** com as variáveis:

 `GEMINI_API_KEY=sua_chave`  
`JWT_SECRET_KEY=sua_chave_segura`  
`DATABASE_URL=postgresql+psycopg://usuario:senha@host:porta/banco`

4. 

**Execute o servidor local:**

 `uvicorn app.main:app --reload`

5.   
6. O sistema ficará disponível em:  
    👉 [http://127.0.0.1:8000](http://127.0.0.1:8000)  
    (documentação interativa em `/docs`)

---

##  **Integração e Revisão**

* As integrações são feitas **via Pull Request** após aprovação.

* Commits devem ser pequenos e frequentes (“**commit early and often**”).

Sempre sincronize sua branch com a `main` antes de abrir o PR:

 `git pull origin main`

* Pull Requests **devem conter apenas os arquivos relevantes à alteração**, evitando incluir binários, logs ou arquivos de configuração pessoal  
  ConfigurationManagementSlides  
  .

* A mensagem do PR deve **descrever com clareza** o propósito da alteração.

---

##  **Boas Práticas Gerais**

* Use branches **curtas e específicas**, evitando longas divergências da `main`.

* Faça **integrações frequentes** para reduzir conflitos e manter o histórico limpo.

* Evite alterar trechos de código sem necessidade — cada mudança precisa ser revisada por outro membro  
  ConfigurationManagementSlides  
  .

* Tenha certeza de que **todas as dependências** estão listadas no `requirements.txt`.

* Ao resolver conflitos, revise cuidadosamente o código antes de confirmar o merge.

---

## **📜 Resumo do Fluxo**

`graph LR`  
`A[Fork ou clone do repositório] --> B[Cria branch: feature/...]`  
`B --> C[Implementa e testa localmente]`  
`C --> D[Commits claros e organizados]`  
`D --> E[Push para o repositório remoto]`  
`E --> F[Abrir Pull Request no GitHub]`  
`F --> G[Revisão (Andrew / Vinícius)]`  
`G --> H[Merge na main]`  
`H --> I[Deploy / Atualização]`

---


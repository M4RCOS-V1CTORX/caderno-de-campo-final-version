# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


## Versão final — sincronização e celular

Esta versão foi preparada para uso offline no PC e no celular.

### Sincronização

- Dados locais ficam no IndexedDB.
- Cada registro possui UUID para funcionar entre dispositivos.
- Registros normais são sincronizados pelo `sync_data`.
- Fotos são guardadas localmente como `Blob` e enviadas para o bucket `activity-photos`.
- A foto só é marcada como sincronizada depois que o arquivo e seus metadados foram enviados com sucesso.
- O sistema não depende de `crypto.randomUUID()` estar disponível no navegador.
- Datas numéricas antigas em milissegundos são normalizadas antes de serem enviadas ao PostgreSQL.
- Ao voltar a internet, o aplicativo tenta sincronizar novamente.
- Depois da sincronização, a tela atual é atualizada para mostrar os dados recebidos.

### Supabase

O arquivo `supabase/setup.sql` contém a estrutura do `sync_data` e as políticas necessárias para o protótipo de usuário único.

O bucket esperado é:

`activity-photos`

### Desenvolvimento

```bash
npm install
npm run dev
```

Para produção:

```bash
npm run build
```

### Observação de segurança

Esta versão usa acesso `anon` porque o sistema foi projetado para um único usuário e simplicidade de implantação. Para um produto multiusuário, a próxima evolução deve ser autenticação e RLS por usuário.

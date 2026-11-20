# Projeto Gamebox
Para a Feira de Desenvolvimento de Sistemas de 2026, vamos apresentar sobre a indústria dos jogos, sua recente evolução e sua projeção de futuro. 

Como projeto, iremos desenvolver uma página web chamada "Gamebox", inspirada no site Letterboxd. Seu objetivo será organizar a biblioteca de jogos do usuário, que poderá avaliar obras jogadas e adicionar outras em uma *wishlist*.

## Grupo
- Gabriel Costa
- Octavio Woellner
- Gustavo Hykavy
- Henrique Pereira
- Brayan Gomes
- Conrado Augusto
- Kauê Alessandro

## Estrutura de pastas proposta
```
gamebox/
├── backend/
│   ├── public/
│   │   ├── index.html
│   │   ├── pages/
│   │   ├── css/
│   │   └── js/
│   ├── src/ 
│   │   ├── routes/ 
│   │   ├── controllers/ 
│   │   ├── services/ 
│   │   ├── middleware/ 
│   │   └── db/ 
│   ├── .env.example 
│   ├── package.json 
│   └── server.js 
│ 
├── database/ 
│   └── schema.sql 
│ 
├── .gitignore 
└── README.md 
```

## Preparação local

1. Instale Node.js 18.18 ou superior e PostgreSQL.
2. Crie no PostgreSQL o banco indicado no final da `DATABASE_URL`. Para um banco novo, execute `database/schema.sql`. Se já usa uma versão anterior da Gamebox, não reaplique o schema: aplique em ordem as migrações `database/migrations/001_gamebrain_ids.sql`, `database/migrations/002_avaliacoes.sql`, `database/migrations/003_feed_atividade_curtidas.sql`, `database/migrations/004_listas.sql` e `database/migrations/005_relacoes_usuarios.sql` para preservar os dados existentes.
3. Na pasta `backend`, copie `.env.example` para `.env`, ajuste `DATABASE_URL` e defina um segredo de sessão com `openssl rand -hex 32`.
   Configure também `GAMEBRAIN_API_KEY` com uma chave criada em https://gamebrain.co/api/console.
4. Instale as dependências e inicie a API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

5. Abra `http://localhost:3000` para acessar o frontend e confira `http://localhost:3000/api/health` para verificar a API e o banco.

## Deploy no Vercel

1. **Prepare o PostgreSQL de produção.** Crie um banco em um provedor acessível pela internet e aplique `database/schema.sql` uma única vez. Não use `localhost` na URL. Guarde a URL de conexão com segurança.
2. **Importe o repositório no Vercel.** No painel, selecione **Add New → Project**, escolha `Stromoth/semana-ds-2026` e abra as configurações de importação.
3. **Configure a raiz do projeto.** Defina **Root Directory** como `backend` e confirme a alteração. Escolha **Express** em **Framework Preset**. Deixe **Build Command** e **Output Directory** nos valores padrão; não é necessário definir diretório de saída. O Vercel instala as dependências listadas em `backend/package.json`.
4. **Adicione as variáveis de ambiente** em **Environment Variables**, no mínimo para **Production**:
   - `DATABASE_URL`: URL do PostgreSQL hospedado.
   - `SESSION_SECRET`: segredo aleatório com pelo menos 32 caracteres (gere localmente com `openssl rand -hex 32`).
   - `GAMEBRAIN_API_KEY`: chave da API GameBrain; sem ela, busca, detalhes e adição de jogos não funcionam.
   Não copie o `.env` para o Git nem compartilhe seus valores. O Vercel define `NODE_ENV=production` no deploy de produção.
5. **Faça o deploy.** Clique em **Deploy**. O conteúdo estático em `backend/public` é publicado pelo Vercel, enquanto as rotas Express atendem a API no mesmo domínio. Os caminhos relativos do frontend permitem que as páginas e `/api/...` usem o mesmo host.
6. **Valide o endereço gerado.** Abra a URL de produção e confira `/api/health`. Teste cadastro/login, consulta da biblioteca e busca GameBrain. O endpoint de saúde precisa conectar ao banco; se retornar erro, confira `DATABASE_URL` e se o provedor permite conexão a partir do Vercel.
7. **(Opcional) Configure um domínio próprio.** Em **Project → Settings → Domains**, adicione o domínio e siga as instruções de DNS exibidas pelo Vercel. Depois teste novamente login e cookies HTTPS no domínio personalizado.

As páginas e a API devem ser implantadas no mesmo projeto e domínio para que a sessão baseada em cookie funcione com a configuração atual. Se usar Preview Deployments, prefira configurar credenciais e banco de teste separados em vez de reutilizar os dados de produção.

A chave `GAMEBRAIN_API_KEY` não é necessária para iniciar o servidor nem para usar cadastro, login, sessão ou consultar a biblioteca. Para pesquisar, ver detalhes e adicionar jogos, crie uma chave em https://gamebrain.co/api/console e configure-a em `backend/.env`. As rotas de jogos responderão com HTTP 503 até isso ser feito.

Na migração de um banco antigo, os jogos e vínculos existentes são preservados, mas IDs RAWG antigos não são convertidos em IDs GameBrain; esses jogos continuam visíveis na biblioteca sem associação automática ao novo catálogo.

O frontend permite cadastrar e autenticar usuários, consultar a sessão, pesquisar jogos GameBrain, ver detalhes e adicionar jogos à biblioteca. Também é possível alterar o status e remover jogos. A página inicial mostra até 20 jogos reais das bibliotecas da comunidade, priorizados pela quantidade de jogadores e avaliações; as imagens, notas e contagens vêm dos registros salvos, e o catálogo não exibe dados fictícios quando ainda está vazio. A página de jogadores permite encontrar usuários por nome, seguir ou deixar de seguir jogadores e consultar sua rede. Cada perfil público mostra a biblioteca, as avaliações e os totais de seguidores e perfis seguidos; a atividade de quem o usuário segue aparece na seção “Na sua rede”. Usuários podem criar listas de jogos com nome e descrição, editar ou excluir suas listas e escolher se serão públicas ou privadas; listas públicas podem ser consultadas por qualquer visitante. Jogos adicionados às listas devem estar na biblioteca do proprietário. Usuários autenticados podem avaliar jogos da própria biblioteca com nota de 1 a 5, publicar texto de até 2.000 caracteres, editar e excluir sua avaliação; cada usuário pode manter uma avaliação por jogo. O feed público permite ordenar avaliações por data ou popularidade, registrar curtidas e mostra atividades recentes de jogos e avaliações. A busca mantém a ordenação padrão de relevância da GameBrain; filtros de gênero e plataforma são preenchidos com as opções retornadas para a busca e aplicados ao servidor. Cada consulta busca até 10 jogos e os apresenta em grupos de quatro, evitando chamadas extras ao avançar entre os primeiros resultados. O plano gratuito da GameBrain exige um link de atribuição visível para GameBrain.co e é destinado a projetos pessoais/não comerciais.

O frontend e a API usam o mesmo domínio e caminhos relativos. Localmente, o Express serve a aplicação em `http://localhost:3000`; no Vercel, o frontend fica em `backend/public` e a API roda no projeto Express. O GitHub Pages hospeda somente arquivos estáticos; para usá-lo separadamente, publique também a API em um servidor e configure a comunicação entre origens e os cookies de sessão.

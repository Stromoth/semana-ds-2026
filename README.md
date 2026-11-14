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
├── frontend/ 
│   ├── index.html 
│   ├── pages/ 
│   │   ├── login.html 
│   │   ├── biblioteca.html 
│   │   └── jogo.html 
│   ├── css/ 
│   │   └── style.css 
│   └── js/ 
│       ├── api.js 
│       ├── auth.js 
│       ├── biblioteca.js  
│       └── jogo.js 
│ 
├── backend/ 
│   ├── src/ 
│   │   ├── routes/ 
│   │   ├── controllers/ 
│   │   ├── services/ 
│   │   ├── middleware/ 
│   │   └── db/ 
│   ├── .env 
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
2. Crie no PostgreSQL o banco indicado no final da `DATABASE_URL`. Para um banco novo, execute `database/schema.sql`. Se já usa a versão anterior da Gamebox, não reaplique o schema: execute `psql -d game_backlog -f database/migrations/001_gamebrain_ids.sql` para preservar os jogos e bibliotecas.
3. Na pasta `backend`, copie `.env.example` para `.env`, ajuste `DATABASE_URL` e defina um segredo de sessão com `openssl rand -hex 32`.
   Configure também `GAMEBRAIN_API_KEY` com uma chave criada em https://gamebrain.co/api/console.
4. Instale as dependências e inicie a API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

5. Abra `http://localhost:3000` para acessar o frontend e confira `http://localhost:3000/api/health` para verificar a API e o banco.

A chave `GAMEBRAIN_API_KEY` não é necessária para iniciar o servidor nem para usar cadastro, login, sessão ou consultar a biblioteca. Para pesquisar, ver detalhes e adicionar jogos, crie uma chave em https://gamebrain.co/api/console e configure-a em `backend/.env`. As rotas de jogos responderão com HTTP 503 até isso ser feito.

Na migração de um banco antigo, os jogos e vínculos existentes são preservados, mas IDs RAWG antigos não são convertidos em IDs GameBrain; esses jogos continuam visíveis na biblioteca sem associação automática ao novo catálogo.

O frontend permite cadastrar e autenticar usuários, consultar a sessão, pesquisar jogos GameBrain, ver detalhes e adicionar jogos à biblioteca. Também é possível alterar o status e remover jogos. Cada consulta busca até 10 jogos e os apresenta em grupos de quatro, evitando chamadas extras ao avançar entre os primeiros resultados; o catálogo inicial e o feed de avaliações ainda incluem conteúdo demonstrativo. O plano gratuito da GameBrain exige um link de atribuição visível para GameBrain.co e é destinado a projetos pessoais/não comerciais.

O frontend e a API usam caminhos relativos e funcionam juntos quando servidos pelo Express em `http://localhost:3000`. O GitHub Pages hospeda somente arquivos estáticos; para usá-lo, publique também a API em um servidor e configure a comunicação entre origens e os cookies de sessão.

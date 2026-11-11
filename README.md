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
2. Crie no PostgreSQL o banco indicado no final da `DATABASE_URL` e execute `database/schema.sql` nele.
3. Na pasta `backend`, copie `.env.example` para `.env`, ajuste `DATABASE_URL` e defina um segredo de sessão com `openssl rand -hex 32`.
4. Instale as dependências e inicie a API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

5. Abra `http://localhost:3000` para acessar o frontend e confira `http://localhost:3000/api/health` para verificar a API e o banco.

A chave `RAWG_API_KEY` não é necessária para iniciar o servidor nem para usar cadastro, login, sessão ou consultar a biblioteca. As rotas de jogos responderão com HTTP 503 até a chave ser configurada em `backend/.env`.

O frontend já permite cadastrar e autenticar usuários, consultar a sessão e listar, alterar o status ou remover jogos da biblioteca. A busca, a inclusão e os detalhes dos jogos dependem da integração RAWG e permanecem indisponíveis enquanto a chave não estiver configurada. A página inicial e o feed de avaliações ainda usam dados demonstrativos.

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

# API Open Food - Products Parser

## Introdução

Nesse desafio foi desnvolvida uma REST API, com o objetivo de utilizar os dados do projeto Open Food Facts, de forma a manter uma base atualizada e disponivel.

> This is a challenge by [Coodesh](https://coodesh.com/)

## O projeto

- Criar um banco de dados MongoDB usando Atlas: https://www.mongodb.com/cloud/atlas ou algum Banco de Dados SQL se não sentir confortável com NoSQL;
- Criar uma REST API com as melhores práticas de desenvolvimento, Design Patterns, SOLID e DDD.
- Integrar a API com o banco de dados criado para persistir os dados
- Recomendável usar Drivers oficiais para integração com o DB
- Desenvolver Testes Unitários

## Instação do projeto:

- Clone o projeto: `git clone https://github.com/isFernandes/products-parser-api`

### Para rodar localmente (Sem docker):

**_Entendo que você já possui o Node instalado em sua máquina_**

- Instale as dependências: `npm install` ou `yarn install`
  - Node versão: 20.18.0
  - Npm versão: 10.9.0
- Execute o comando `npm run build && npm run start` ou `yarn build && yarn start`

### Para rodar com a imagem Docker:

**_Entendo que você já possui o Docker instalado em sua máquina_**

- Execute o comando `docker-compose up --build`
- Acesse a aplicação em http://localhost:3333

## Escolhas Técnicas:

- `Streams`: Devido a extensão da base de dados da API Open Food, optamos por utilizar streams para realizar as requisições e processar os dados, de forma a não armazenar essas informações localmente, mantendo o Node performatico, realizando todo o processo em tempo de execução.
- `Arquitetura`: Optei pela arquitetura em camadas, pensando de forma que permita o crescimento e alterações futuras ao projeto.
- `Eventos`: O uso de eventos foi aplicado de forma que fosse mais rapido e eficiente, receber alerta de erros.
- `Variavies` de ambiente: utilizada para armazenar dados sensiveis.
- `Docker`: Alem de ser um dos diferenciais, foi utilizado para garantir a consistência e a portabilidade do projeto, alem de me acrescentar a prática.

## Tecnologias

- Typescript, utilizado por conta da tipagem e do suporte ao JavaScript, facilitando o desenvolvimento do projeto como um todo.
- Node.js, utilizado como servidor, pois é uma tecnologia robusta e escalável.
- Routing-controllers, utilizado para criar as rotas e o servidor Express, pois facilita a criação de rotas e o gerenciamento de requisições com seus decorators.
- TypeDI, utilizado para injetar dependências, seguindo um dos principios do SOLID
- MongoDB, pois é o driver nativo do Mongo para o Node
- node-cron, utilizado para agendar tarefas, apesar do Node possuir uma forma de fazer isto, a maneira utilizando o node-cron permite que o funcionamento ocorra sempre durante o horario programado.
- Jest, utilizado para a criação dos testes unitários.

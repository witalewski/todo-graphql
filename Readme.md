# GraphQL server with mock data

## Initialize project
```sh
yarn init -y
yarn add graphql-yoga
```

## Create project files
**src/index.js**
```js
const { GraphQLServer } = require("graphql-yoga");
const Query = require("./resolvers/Query");

const resolvers = {
  Query
};

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers
});
server.start(() => console.log(`Server is running on http://localhost:4000`));
```

**src/resolvers/Query.js**
```js
const tasks = () => [
  {
    id: "task-0",
    name: "Create GraphQL Tutorial"
  },
  {
    id: "task-1",
    name: "Prepare presentation",
    description: "30 minutes, based on tutorial"
  }
];
module.exports = {
  tasks
};
```

**src/schema.graphql**
```gql
type Query {
  tasks: [Task!]!
}

type Task {
    id: ID!
    name: String!
    description: String
}
```

## Run the code
```sh
node src/index.js
```

# Adding Prisma

## Add database files
**database/datamodel.graphql**
```graphql
type Task {
    id: ID! @unique
    createdAt: DateTime!
    name: String!
    description: String
}
```

**database/prisma.yml**
```yml
endpoint: ''
datamodel: datamodel.graphql
secret: R937avfvQx8d
```

## Install Prisma
```sh
npm i -g prisma
```

## Deploy database
```sh
cd database
prisma deploy
```
Use a `Demo server`

## Explore database service in browser

### Go to the address from `prisma deploy` output
### Create autorization token
```sh
prisma token
```
### Add the token to http headers:
```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```

## Add some data
```graphql
mutation {
  createTask(data: {
    name: "Create database"
  }) {
    id
    name
    description
  }
}
```

### Verify that data is stored in the db
```graphql
query {
  tasks {
    id
    createdAt
    name
    description
  }
}
```

## Update server to use the database

### Update the query resolver
***src/resolvers/Query.js***
const tasks = (root, args, context, info) => {
  return context.db.query.tasks({}, info);
};

module.exports = {
  tasks
};

### Add prisma binding

#### Add project dependency
```sh
yarn add prisma-binding
```
#### Attach a prisma binding instance to the context
**src/index.js**
```js
const { GraphQLServer } = require("graphql-yoga");
const { Prisma } = require("prisma-binding");
const Query = require("./resolvers/Query");

const resolvers = {
  Query
};

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: "src/generated/prisma.graphql",
      endpoint: "YOUR_HTTPS_ENDPOINT",
      secret: "9R37avfvQx8d",
      debug: true
    })
  })
});
server.start(() => console.log(`Server is running on http://localhost:4000`));
```

### Create GraphQL config
***.graphqlconfig.yml***
```yml
projects:
  app:
    schemaPath: src/schema.graphql
    extensions:
      endpoints:
        default: http://localhost:4000
  database:
    schemaPath: src/generated/prisma.graphql
    extensions:
      prisma: database/prisma.yml
```

### Add deploy hook to Prisma config
**database/prisma.yml**
```yml
#endpoint: ''
endpoint: https://us1.prisma.sh/krzysztof-witalewski/todo-graphql/dev
datamodel: datamodel.graphql
secret: 9R37avfvQx8d

hooks:
  post-deploy:
    - graphql get-schema --project database
```

### Install GraphQL CLI and deploy prisma again
```sh
yarn global add graphql-cli
prisma deploy
```

### Check if everythong works
```sh
node src/index.js
```
```sh
graphql playground
```
```graphql
query {
  tasks {
    name
    description
  }
}
```
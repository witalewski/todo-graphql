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
      endpoint: "https://us1.prisma.sh/krzysztof-witalewski/todo-graphql/dev",
      secret: "9R37avfvQx8d",
      debug: true
    })
  })
});
server.start(() => console.log(`Server is running on http://localhost:4000`));

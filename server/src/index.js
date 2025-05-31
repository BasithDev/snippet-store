import express from 'express';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginUsageReporting } from '@apollo/server/plugin/usageReporting';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import connectDB from './config/db.js';
import typeDefs from './graphql/typeDefs/schema.js';
import resolvers from './graphql/resolvers/resolvers.js';
import authMiddleware from './middlewares/auth.js';
import { createLoaders } from './loaders/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginUsageReporting({
        graphRef: 'Snippet-store@current',
      }),
    ],
  });

  await server.start();

  app.use(authMiddleware);

  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const loaders = createLoaders();
        
        return {
          userId: req.userId,
          user: { id: req.userId },
          loaders
        };
      },
    })
  );

  // Start the Express server
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startApolloServer();
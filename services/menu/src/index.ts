import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';

dotenv.config();

const port = Number(process.env.PORT) || 4001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => {
    // Verify JWT token for all requests
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new GraphQLError('Session invalid or expired', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 },
        },
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new GraphQLError('Token missing from Authorization header', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 },
        },
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      return { userId: decoded.id };
    } catch (err) {
      throw new GraphQLError('Session invalid or expired', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 },
        },
      });
    }
  },
}).then(({ url }) => {
  logger.info(`Menu Service (GraphQL) ready at ${url}`);
});
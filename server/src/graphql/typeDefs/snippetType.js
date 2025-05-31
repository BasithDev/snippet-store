import { gql } from 'graphql-tag';

const snippetType = gql`
  type Snippet {
    id: ID!
    title: String!
    language: String!
    code: String!
    description: String
    createdAt: String
    updatedAt: String
    owner: User!
    visibility: String!
  }
  
  type PaginatedSnippets {
    snippets: [Snippet!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  input CreateSnippetInput {
    title: String!
    language: String!
    code: String!
    description: String
    visibility: String!
  }

  type Query {
    getAllSnippets(page: Int, limit: Int): PaginatedSnippets!
    getSnippetById(id: ID!): Snippet
    getMySnippets(page: Int, limit: Int): PaginatedSnippets!
    searchSnippets(query: String!, page: Int, limit: Int): PaginatedSnippets!
  }

  type Mutation {
    createSnippet(input: CreateSnippetInput!): Snippet!
    deleteSnippet(id: ID!): Boolean!
  }
`;

export default snippetType;

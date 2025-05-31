import { gql } from '@apollo/client';

export const SNIPPET_FRAGMENT = gql`
  fragment SnippetFields on Snippet {
    id
    title
    description
    code
    language
    visibility
    createdAt
    updatedAt
    owner {
      id
      username
    }
  }
`;

export const GET_SNIPPETS = gql`
  query GetAllSnippets($page: Int, $limit: Int) {
    getAllSnippets(page: $page, limit: $limit) {
      snippets {
        ...SnippetFields
      }
      totalCount
      hasMore
    }
  }
  ${SNIPPET_FRAGMENT}
`;

export const GET_SNIPPET = gql`
  query GetSnippetById($id: ID!) {
    getSnippetById(id: $id) {
      ...SnippetFields
    }
  }
  ${SNIPPET_FRAGMENT}
`;

export const GET_MY_SNIPPETS = gql`
  query GetMySnippets($page: Int, $limit: Int) {
    getMySnippets(page: $page, limit: $limit) {
      snippets {
        ...SnippetFields
      }
      totalCount
      hasMore
    }
  }
  ${SNIPPET_FRAGMENT}
`;

export const SEARCH_SNIPPETS = gql`
  query SearchSnippets($query: String!, $page: Int, $limit: Int) {
    searchSnippets(query: $query, page: $page, limit: $limit) {
      snippets {
        ...SnippetFields
      }
      totalCount
      hasMore
    }
  }
  ${SNIPPET_FRAGMENT}
`;

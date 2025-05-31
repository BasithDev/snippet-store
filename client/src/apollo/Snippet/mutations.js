import { gql } from '@apollo/client';
import { SNIPPET_FRAGMENT } from './queries';

export const CREATE_SNIPPET = gql`
  mutation CreateSnippet($input: CreateSnippetInput!) {
    createSnippet(input: $input) {
      ...SnippetFields
    }
  }
  ${SNIPPET_FRAGMENT}
`;

export const UPDATE_SNIPPET = gql`
  mutation UpdateSnippet($id: ID!, $input: SnippetInput!) {
    updateSnippet(id: $id, input: $input) {
      ...SnippetFields
    }
  }
  ${SNIPPET_FRAGMENT}
`;

export const DELETE_SNIPPET = gql`
  mutation DeleteSnippet($id: ID!) {
    deleteSnippet(id: $id)
  }
`;

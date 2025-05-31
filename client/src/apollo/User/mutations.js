import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    loginUser(input: $input) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser($input: CreateUserInput!) {
    registerUser(input: $input) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      username
      email
    }
  }
`;
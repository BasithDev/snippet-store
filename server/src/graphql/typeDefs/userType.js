import { gql } from 'graphql-tag';

const userType = gql`
    type User {
        id: ID!
        username: String!
        email: String!
        createdAt: String
        updatedAt: String
    }

    input CreateUserInput {
        username: String!
        email: String!
        password: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    type AuthPayload {
        user: User!
        token: String!
    }

    type Query {
        getUser(id: ID!): User!
        getAllUsers: [User!]!
    }

    type Mutation {
        registerUser(input: CreateUserInput!): AuthPayload!
        loginUser(input: LoginInput!): AuthPayload!
    }
`;

export default userType;
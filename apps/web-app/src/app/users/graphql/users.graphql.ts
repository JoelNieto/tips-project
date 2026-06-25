import { gql } from 'apollo-angular';

export const USERS_QUERY = gql`
  query Users {
    users {
      id
      name
      email
      role
      locale
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      locale
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
      locale
      createdAt
      updatedAt
    }
  }
`;

export const RESET_USER_PASSWORD_MUTATION = gql`
  mutation ResetUserPassword($id: ID!, $newPassword: String!) {
    resetUserPassword(id: $id, newPassword: $newPassword)
  }
`;

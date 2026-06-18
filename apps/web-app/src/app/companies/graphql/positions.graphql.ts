import { gql } from 'apollo-angular';

export const POSITIONS_QUERY = gql`
  query Positions($companyId: ID!) {
    positions(companyId: $companyId) {
      id
      name
      code
      companyId
      parentPositionId
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_POSITION_MUTATION = gql`
  mutation CreatePosition($input: CreatePositionInput!) {
    createPosition(input: $input) {
      id
      name
      code
      companyId
      parentPositionId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_POSITION_MUTATION = gql`
  mutation UpdatePosition($id: ID!, $input: UpdatePositionInput!) {
    updatePosition(id: $id, input: $input) {
      id
      name
      code
      companyId
      parentPositionId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_POSITION_MUTATION = gql`
  mutation DeletePosition($id: ID!) {
    deletePosition(id: $id) {
      id
    }
  }
`;

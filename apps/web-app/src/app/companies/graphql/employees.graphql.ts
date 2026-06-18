import { gql } from 'apollo-angular';

export const EMPLOYEES_QUERY = gql`
  query Employees($companyId: ID!) {
    employees(companyId: $companyId) {
      id
      firstName
      lastName
      documentId
      gender
      email
      birthdate
      enrollmentDate
      offDate
      status
      companyId
      positionId
      position {
        id
        name
        code
      }
      createdAt
      updatedAt
    }
  }
`;

export const EMPLOYEE_QUERY = gql`
  query Employee($id: ID!) {
    employee(id: $id) {
      id
      firstName
      lastName
      documentId
      gender
      email
      birthdate
      enrollmentDate
      offDate
      status
      companyId
      positionId
      position {
        id
        name
        code
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_EMPLOYEE_MUTATION = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      id
      firstName
      lastName
      documentId
      gender
      email
      birthdate
      enrollmentDate
      offDate
      status
      companyId
      positionId
      position {
        id
        name
        code
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation UpdateEmployee($id: ID!, $input: UpdateEmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      id
      firstName
      lastName
      documentId
      gender
      email
      birthdate
      enrollmentDate
      offDate
      status
      companyId
      positionId
      position {
        id
        name
        code
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_EMPLOYEE_MUTATION = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id) {
      id
    }
  }
`;

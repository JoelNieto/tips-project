import { gql } from 'apollo-angular';

export const COMPANIES_QUERY = gql`
  query Companies {
    companies {
      id
      name
      legalName
      description
      email
      phone
      website
      street
      city
      state
      postalCode
      country
      taxId
      logo
      industry
      size
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const COMPANY_QUERY = gql`
  query Company($id: ID!) {
    company(id: $id) {
      id
      name
      legalName
      description
      email
      phone
      website
      street
      city
      state
      postalCode
      country
      taxId
      logo
      industry
      size
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_COMPANY_MUTATION = gql`
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) {
      id
      name
      legalName
      description
      email
      phone
      website
      street
      city
      state
      postalCode
      country
      taxId
      logo
      industry
      size
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_COMPANY_MUTATION = gql`
  mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
    updateCompany(id: $id, input: $input) {
      id
      name
      legalName
      description
      email
      phone
      website
      street
      city
      state
      postalCode
      country
      taxId
      logo
      industry
      size
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const DELETE_COMPANY_MUTATION = gql`
  mutation DeleteCompany($id: ID!) {
    deleteCompany(id: $id) {
      id
    }
  }
`;

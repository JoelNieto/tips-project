import { gql } from 'apollo-angular';

export const ORGANIZATIONS_QUERY = gql`
  query Organizations {
    organizations {
      id
      name
      description
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

export const ORGANIZATION_SURVEYS_QUERY = gql`
  query OrganizationSurveys($organizationId: ID!) {
    organizationSurveys(organizationId: $organizationId) {
      id
      organizationId
      surveyId
      createdAt
    }
  }
`;

export const CREATE_ORGANIZATION_MUTATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const ASSIGN_SURVEY_TO_ORGANIZATION_MUTATION = gql`
  mutation AssignSurveyToOrganization($input: AssignSurveyToOrganizationInput!) {
    assignSurveyToOrganization(input: $input) {
      id
      organizationId
      surveyId
      createdAt
    }
  }
`;

export const REMOVE_SURVEY_FROM_ORGANIZATION_MUTATION = gql`
  mutation RemoveSurveyFromOrganization($id: ID!) {
    removeSurveyFromOrganization(id: $id) {
      id
    }
  }
`;

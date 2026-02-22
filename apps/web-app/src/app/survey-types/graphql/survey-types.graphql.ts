import { gql } from 'apollo-angular';

export const SURVEY_TYPES_QUERY = gql`
  query SurveyTypes {
    surveyTypes {
      id
      name
      description
      code
      isActive
      sortOrder
      categoryName
      subcategoryName
      hasCategories
      hasSubcategories
      visibleCategories
      visibleSubcategories
      randomizeQuestions
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

export const SURVEY_TYPE_QUERY = gql`
  query SurveyType($id: ID!) {
    surveyType(id: $id) {
      id
      name
      description
      code
      isActive
      sortOrder
      categoryName
      subcategoryName
      hasCategories
      hasSubcategories
      visibleCategories
      visibleSubcategories
      randomizeQuestions
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

export const CREATE_SURVEY_TYPE_MUTATION = gql`
  mutation CreateSurveyType($input: CreateSurveyTypeInput!) {
    createSurveyType(input: $input) {
      id
      name
      description
      code
      isActive
      sortOrder
      categoryName
      subcategoryName
      hasCategories
      hasSubcategories
      visibleCategories
      visibleSubcategories
      randomizeQuestions
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

export const UPDATE_SURVEY_TYPE_MUTATION = gql`
  mutation UpdateSurveyType($id: ID!, $input: UpdateSurveyTypeInput!) {
    updateSurveyType(id: $id, input: $input) {
      id
      name
      description
      code
      isActive
      sortOrder
      categoryName
      subcategoryName
      hasCategories
      hasSubcategories
      visibleCategories
      visibleSubcategories
      randomizeQuestions
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

export const DELETE_SURVEY_TYPE_MUTATION = gql`
  mutation DeleteSurveyType($id: ID!) {
    deleteSurveyType(id: $id) {
      id
    }
  }
`;

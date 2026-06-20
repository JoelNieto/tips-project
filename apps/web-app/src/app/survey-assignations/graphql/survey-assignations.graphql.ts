import { gql } from 'apollo-angular';

export const SURVEY_ASSIGNATIONS_QUERY = gql`
  query SurveyAssignations($surveyId: ID!) {
    surveyAssignations(surveyId: $surveyId) {
      id
      surveyId
      welcomeMessage
      startDate
      expirationDate
      createdAt
      inviteeCount
      company {
        id
        name
      }
      survey {
        id
        title
      }
    }
  }
`;

export const SURVEY_ASSIGNATION_QUERY = gql`
  query SurveyAssignation($id: ID!) {
    surveyAssignation(id: $id) {
      id
      surveyId
      welcomeMessage
      startDate
      expirationDate
      createdAt
      updatedAt
      company {
        id
        name
        email
      }
      survey {
        id
        title
      }
      invitees {
        id
        email
        name
        token
        createdAt
        fill {
          id
          submittedAt
        }
      }
    }
  }
`;

export const CREATE_SURVEY_ASSIGNATION_MUTATION = gql`
  mutation CreateSurveyAssignation($input: CreateSurveyAssignationInput!) {
    createSurveyAssignation(input: $input) {
      id
      surveyId
      welcomeMessage
      startDate
      expirationDate
      company {
        id
        name
      }
      invitees {
        id
        email
        name
        token
      }
    }
  }
`;

export const SURVEY_ASSIGNATION_FILL_RESULTS_QUERY = gql`
  query SurveyAssignationFillResults($id: ID!) {
    surveyAssignationFillResults(id: $id) {
      surveyType {
        hasCategories
        hasSubcategories
        categoryName
        subcategoryName
        visibleCategories
        visibleSubcategories
      }
      fills {
        inviteeId
        inviteeEmail
        inviteeName
        submittedAt
        mainAnswers {
          dimensionId
          dimensionTitle
          categoryId
          categoryTitle
          answerText
          answerValue
        }
        questionAnswers {
          dimensionQuestionId
          dimensionId
          dimensionTitle
          categoryId
          categoryTitle
          questionText
          answers {
            id
            text
            value
          }
        }
      }
    }
  }
`;

export const DELETE_SURVEY_ASSIGNATION_MUTATION = gql`
  mutation DeleteSurveyAssignation($id: ID!) {
    deleteSurveyAssignation(id: $id) {
      id
    }
  }
`;

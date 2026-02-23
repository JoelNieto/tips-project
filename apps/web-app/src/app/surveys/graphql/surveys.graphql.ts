import { gql } from 'apollo-angular';

export const SURVEYS_QUERY = gql`
  query Surveys {
    surveys {
      id
      title
      description
      createdAt
      surveyType {
        id
        name
        hasCategories
        hasSubcategories
      }
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const SURVEY_QUERY = gql`
  query Survey($id: ID!) {
    survey(id: $id) {
      id
      title
      description
      createdAt
      surveyType {
        id
        name
        hasCategories
        hasSubcategories
      }
      createdBy {
        id
        name
        email
      }
      dimensions {
        id
        title
        description
        weighting
        mainQuestionText
        order
        mainQuestionAnswers {
          id
          text
          sortOrder
          value
          reverseValue
        }
        dimensionQuestions {
          id
          order
          weightOverride
          isReversedOverride
          isMultiAnswerOverride
          question {
            id
            title
            text
            weight
            isReversed
            isMultiAnswer
            answers {
              id
              text
              sortOrder
              value
              reverseValue
            }
          }
        }
        subdimensions {
          id
          title
          description
          weighting
          mainQuestionText
          order
          mainQuestionAnswers {
            id
            text
            sortOrder
            value
            reverseValue
          }
          dimensionQuestions {
            id
            order
            weightOverride
            isReversedOverride
            isMultiAnswerOverride
            question {
              id
              title
              text
              answers {
                id
                text
                value
                reverseValue
              }
            }
          }
        }
      }
    }
  }
`;

export const SURVEY_TYPES_QUERY = gql`
  query SurveyTypesForSurvey {
    surveyTypes {
      id
      name
      hasCategories
      hasSubcategories
    }
  }
`;

export const CREATE_SURVEY_MUTATION = gql`
  mutation CreateSurvey($input: CreateSurveyInput!) {
    createSurvey(input: $input) {
      id
      title
      description
      surveyType {
        id
        name
        hasCategories
        hasSubcategories
      }
    }
  }
`;

export const UPDATE_SURVEY_MUTATION = gql`
  mutation UpdateSurvey($id: ID!, $input: UpdateSurveyInput!) {
    updateSurvey(id: $id, input: $input) {
      id
      title
      description
    }
  }
`;

export const DELETE_SURVEY_MUTATION = gql`
  mutation DeleteSurvey($id: ID!) {
    deleteSurvey(id: $id) {
      id
    }
  }
`;

export const CREATE_DIMENSION_MUTATION = gql`
  mutation CreateDimension($input: CreateDimensionInput!) {
    createDimension(input: $input) {
      id
      title
      description
      order
    }
  }
`;

export const UPDATE_DIMENSION_MUTATION = gql`
  mutation UpdateDimension($id: ID!, $input: UpdateDimensionInput!) {
    updateDimension(id: $id, input: $input) {
      id
      title
      description
    }
  }
`;

export const DELETE_DIMENSION_MUTATION = gql`
  mutation DeleteDimension($id: ID!) {
    deleteDimension(id: $id) {
      id
    }
  }
`;

export const ADD_QUESTION_TO_DIMENSION_MUTATION = gql`
  mutation AddQuestionToDimension($input: AddQuestionToDimensionInput!) {
    addQuestionToDimension(input: $input) {
      id
      dimensionId
      questionId
    }
  }
`;

export const REMOVE_QUESTION_FROM_DIMENSION_MUTATION = gql`
  mutation RemoveQuestionFromDimension($dimensionQuestionId: ID!) {
    removeQuestionFromDimension(dimensionQuestionId: $dimensionQuestionId) {
      id
    }
  }
`;

export const CREATE_MAIN_QUESTION_ANSWER_MUTATION = gql`
  mutation CreateMainQuestionAnswer($input: CreateMainQuestionAnswerInput!) {
    createMainQuestionAnswer(input: $input) {
      id
      text
      value
      reverseValue
    }
  }
`;

import { gql } from 'apollo-angular';

export const SURVEYS_QUERY = gql`
  query Surveys {
    surveys {
      id
      title
      description
      createdAt
      hasCategories
      hasSubcategories
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
      categoryName
      subcategoryName
      hasCategories
      hasSubcategories
      visibleCategories
      visibleSubcategories
      randomizeQuestions
      presentAllQuestionsAtOnce
      allowPreviousQuestion
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
        scoreRanges {
          id
          label
          message
          minValue
          maxValue
          order
        }
        dimensionQuestions {
          id
          order
          weightOverride
          isReversedOverride
          isMultiAnswerOverride
          answerOverrides {
            id
            valueOverride
            reverseValueOverride
            orderOverride
            answer {
              id
              text
              sortOrder
              value
              reverseValue
            }
          }
          question {
            id
            title
            text
            weight
            isReversed
            isMultiAnswer
            answerSet {
              id
              name
              answers {
                id
                text
                sortOrder
                value
                reverseValue
              }
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
          scoreRanges {
            id
            label
            message
            minValue
            maxValue
            order
          }
          dimensionQuestions {
            id
            order
            weightOverride
            isReversedOverride
            isMultiAnswerOverride
            answerOverrides {
              id
              valueOverride
              reverseValueOverride
              orderOverride
              answer {
                id
                text
                sortOrder
                value
                reverseValue
              }
            }
            question {
              id
              title
              text
              weight
              isReversed
              isMultiAnswer
              answerSet {
                id
                name
                answers {
                  id
                  text
                  sortOrder
                  value
                  reverseValue
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const CREATE_SURVEY_MUTATION = gql`
  mutation CreateSurvey($input: CreateSurveyInput!) {
    createSurvey(input: $input) {
      id
      title
      description
      categoryName
      subcategoryName
      hasCategories
      hasSubcategories
      visibleCategories
      visibleSubcategories
      randomizeQuestions
      presentAllQuestionsAtOnce
      allowPreviousQuestion
    }
  }
`;

export const UPDATE_SURVEY_MUTATION = gql`
  mutation UpdateSurvey($id: ID!, $input: UpdateSurveyInput!) {
    updateSurvey(id: $id, input: $input) {
      id
      title
      description
      categoryName
      subcategoryName
      hasCategories
      hasSubcategories
      visibleCategories
      visibleSubcategories
      randomizeQuestions
      presentAllQuestionsAtOnce
      allowPreviousQuestion
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

export const DUPLICATE_SURVEY_MUTATION = gql`
  mutation DuplicateSurvey($id: ID!, $input: DuplicateSurveyInput) {
    duplicateSurvey(id: $id, input: $input) {
      id
      title
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
      question {
        id
      }
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
      sortOrder
      value
      reverseValue
    }
  }
`;

export const UPDATE_MAIN_QUESTION_ANSWER_MUTATION = gql`
  mutation UpdateMainQuestionAnswer($id: ID!, $input: UpdateMainQuestionAnswerInput!) {
    updateMainQuestionAnswer(id: $id, input: $input) {
      id
      text
      sortOrder
      value
      reverseValue
    }
  }
`;

export const DELETE_MAIN_QUESTION_ANSWER_MUTATION = gql`
  mutation DeleteMainQuestionAnswer($id: ID!) {
    deleteMainQuestionAnswer(id: $id) {
      id
    }
  }
`;

export const CREATE_DIMENSION_SCORE_RANGE_MUTATION = gql`
  mutation CreateDimensionScoreRange($input: CreateDimensionScoreRangeInput!) {
    createDimensionScoreRange(input: $input) {
      id
      label
      message
      minValue
      maxValue
      order
    }
  }
`;

export const UPDATE_DIMENSION_SCORE_RANGE_MUTATION = gql`
  mutation UpdateDimensionScoreRange($id: ID!, $input: UpdateDimensionScoreRangeInput!) {
    updateDimensionScoreRange(id: $id, input: $input) {
      id
      label
      message
      minValue
      maxValue
      order
    }
  }
`;

export const DELETE_DIMENSION_SCORE_RANGE_MUTATION = gql`
  mutation DeleteDimensionScoreRange($id: ID!) {
    deleteDimensionScoreRange(id: $id) {
      id
    }
  }
`;

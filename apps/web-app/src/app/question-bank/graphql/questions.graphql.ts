import { gql } from 'apollo-angular';

export const QUESTIONS_QUERY = gql`
  query Questions {
    questions {
      id
      title
      text
      weight
      isReversed
      isMultiAnswer
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
      answers {
        id
        text
        sortOrder
        value
        reverseValue
      }
    }
  }
`;

export const QUESTION_QUERY = gql`
  query Question($id: ID!) {
    question(id: $id) {
      id
      title
      text
      weight
      isReversed
      isMultiAnswer
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
      answers {
        id
        text
        sortOrder
        value
        reverseValue
      }
    }
  }
`;

export const SURVEYS_USING_QUESTION_QUERY = gql`
  query SurveysUsingQuestion($questionId: ID!) {
    surveysUsingQuestion(questionId: $questionId) {
      surveyId
      surveyTitle
      dimensionId
      dimensionTitle
    }
  }
`;

export const CREATE_QUESTION_MUTATION = gql`
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      title
      text
      weight
      isReversed
      isMultiAnswer
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
      answers {
        id
        text
        sortOrder
        value
        reverseValue
      }
    }
  }
`;

export const UPDATE_QUESTION_MUTATION = gql`
  mutation UpdateQuestion($id: ID!, $input: UpdateQuestionInput!) {
    updateQuestion(id: $id, input: $input) {
      id
      title
      text
      weight
      isReversed
      isMultiAnswer
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
      answers {
        id
        text
        sortOrder
        value
        reverseValue
      }
    }
  }
`;

export const DELETE_QUESTION_MUTATION = gql`
  mutation DeleteQuestion($id: ID!) {
    deleteQuestion(id: $id) {
      id
    }
  }
`;

export const CREATE_ANSWER_MUTATION = gql`
  mutation CreateAnswer($input: CreateAnswerInput!) {
    createAnswer(input: $input) {
      id
      text
      sortOrder
      value
      reverseValue
    }
  }
`;

export const UPDATE_ANSWER_MUTATION = gql`
  mutation UpdateAnswer($id: ID!, $input: UpdateAnswerInput!) {
    updateAnswer(id: $id, input: $input) {
      id
      text
      sortOrder
      value
      reverseValue
    }
  }
`;

export const DELETE_ANSWER_MUTATION = gql`
  mutation DeleteAnswer($id: ID!) {
    deleteAnswer(id: $id) {
      id
    }
  }
`;

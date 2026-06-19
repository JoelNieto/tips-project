import { gql } from 'apollo-angular';

export const ANSWER_SET_FRAGMENT = `
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
  answers {
    id
    text
    sortOrder
    value
    reverseValue
  }
`;

export const ANSWER_SETS_QUERY = gql`
  query AnswerSets {
    answerSets {
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

export const ANSWER_SET_QUERY = gql`
  query AnswerSet($id: ID!) {
    answerSet(id: $id) {
      ${ANSWER_SET_FRAGMENT}
    }
  }
`;

export const CREATE_ANSWER_SET_MUTATION = gql`
  mutation CreateAnswerSet($input: CreateAnswerSetInput!) {
    createAnswerSet(input: $input) {
      ${ANSWER_SET_FRAGMENT}
    }
  }
`;

export const UPDATE_ANSWER_SET_MUTATION = gql`
  mutation UpdateAnswerSet($id: ID!, $input: UpdateAnswerSetInput!) {
    updateAnswerSet(id: $id, input: $input) {
      ${ANSWER_SET_FRAGMENT}
    }
  }
`;

export const DELETE_ANSWER_SET_MUTATION = gql`
  mutation DeleteAnswerSet($id: ID!) {
    deleteAnswerSet(id: $id) {
      id
    }
  }
`;

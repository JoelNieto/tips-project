import { gql } from 'apollo-angular';

export const SURVEY_INVITE_BY_TOKEN_QUERY = gql`
  query SurveyInviteByToken($token: String!) {
    surveyInviteByToken(token: $token) {
      token
      email
      name
      welcomeMessage
      companyName
      startDate
      expirationDate
      submittedAt
      survey {
        id
        title
        description
        surveyType {
          id
          name
          hasCategories
          hasSubcategories
          categoryName
          subcategoryName
          visibleCategories
          visibleSubcategories
          randomizeQuestions
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
  }
`;

export const SUBMIT_SURVEY_FILL_MUTATION = gql`
  mutation SubmitSurveyFill($input: SubmitSurveyFillInput!) {
    submitSurveyFill(input: $input) {
      id
      surveyId
      inviteeId
      submittedAt
    }
  }
`;

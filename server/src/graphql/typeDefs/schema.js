import { gql } from 'graphql-tag';

import userType from './userType.js';
import snippetType from './snippetType.js';

export const schema = gql`
    ${userType}
    ${snippetType}
`;

export default schema;
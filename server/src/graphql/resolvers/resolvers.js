import {userResolvers} from "./userResolvers.js";
import {snippetResolvers} from "./snippetResolvers.js";

const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...snippetResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...snippetResolvers.Mutation
    },
    Snippet: {
        ...snippetResolvers.Snippet
    }
};

export default resolvers;
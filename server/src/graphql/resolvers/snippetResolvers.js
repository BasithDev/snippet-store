import Snippet from "../../models/Snippet.js";
import User from "../../models/User.js";

export const snippetResolvers = {
    Query: {
        getAllSnippets: async (_, { page = 1, limit = 10 }, context) => {
            page = Math.max(1, page);
            limit = Math.max(1, Math.min(50, limit));
            
            const skip = (page - 1) * limit;
            
            const snippets = await Snippet.find({ visibility: 'public' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            
            const totalCount = await Snippet.countDocuments({ visibility: 'public' });
            
            if (context.loaders) {
                const ownerIds = [...new Set(snippets.map(snippet => snippet.owner.toString()))];
                
                if (ownerIds.length > 0) {
                    await Promise.all(ownerIds.map(id => context.loaders.userLoader.load(id)));
                }
            }
            
            return {
                snippets,
                totalCount,
                hasMore: skip + snippets.length < totalCount
            };
        },
        getSnippetById: async (_, {id}, context) => {
            if (context.loaders) {
                const snippet = await context.loaders.snippetLoader.load(id);
                if (snippet) {
                    await context.loaders.userLoader.load(snippet.owner);
                }
                return snippet;
            }
            return await Snippet.findById(id).populate("owner","-password");
        },
        getMySnippets: async (_, { page = 1, limit = 10 }, context) => {
            const { userId, loaders } = context;
            
            if (!userId) {
                throw new Error("Authentication required");
            }
            
            page = Math.max(1, page);
            limit = Math.max(1, Math.min(50, limit));
            
            const skip = (page - 1) * limit;
            
            let snippets;
            if (loaders) {
                const allSnippets = await loaders.snippetsByOwnerLoader.load(userId);
                
                const sortedSnippets = allSnippets.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                
                snippets = sortedSnippets.slice(skip, skip + limit);
                
                await loaders.userLoader.load(userId);
                
                return {
                    snippets,
                    totalCount: allSnippets.length,
                    hasMore: skip + snippets.length < allSnippets.length
                };
            }
            
            snippets = await Snippet.find({ owner: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("owner", "-password");
            
            const totalCount = await Snippet.countDocuments({ owner: userId });
            
            return {
                snippets,
                totalCount,
                hasMore: skip + snippets.length < totalCount
            };
        },
        searchSnippets: async (_, { query, page = 1, limit = 10 }, context) => {
            const searchRegex = new RegExp(query, 'i');
            
            page = Math.max(1, page);
            limit = Math.max(1, Math.min(50, limit));
            
            const skip = (page - 1) * limit;
            
            const searchQuery = {
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { code: searchRegex },
                    { language: searchRegex }
                ],
                visibility: 'public'
            };
            
            const snippets = await Snippet.find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            
            const totalCount = await Snippet.countDocuments(searchQuery);
            
            if (context.loaders) {
                const ownerIds = [...new Set(snippets.map(snippet => snippet.owner.toString()))];
                
                if (ownerIds.length > 0) {
                    await Promise.all(ownerIds.map(id => context.loaders.userLoader.load(id)));
                }
            }
            
            return {
                snippets,
                totalCount,
                hasMore: skip + snippets.length < totalCount
            };
        }
    },
    Mutation: {
        createSnippet: async (_, {input}, {userId}) => {
            if (!userId) {
                throw new Error("User not found");
            }
            const snippet = new Snippet({
                ...input,
                owner: userId
            });
            return await snippet.save();
        },
        deleteSnippet: async (_, { id }, context) => {
            const { user } = context;
          
            if (!user) {
              throw new Error("Not authenticated");
            }
          
            const snippet = await Snippet.findById(id);
            if (!snippet) {
              throw new Error("Snippet not found");
            }
            if (snippet.owner.toString() !== user.id) {
              throw new Error("You are not authorized to delete this snippet");
            }
          
            await snippet.deleteOne();
            return true;
          }
    },
    Snippet:{
        owner:async (snippet, _, context)=>{
            if (!context.loaders) {
                return await User.findById(snippet.owner).select("-password");
            }
            return await context.loaders.userLoader.load(snippet.owner);
        }
    }
}
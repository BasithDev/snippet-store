import DataLoader from 'dataloader';
import User from '../models/User.js';
import Snippet from '../models/Snippet.js';

export const createUserLoader = () => {
  return new DataLoader(async (userIds) => {
    const users = await User.find({ _id: { $in: userIds } }).select('-password');
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    return userIds.map(id => userMap[id.toString()] || null);
  });
};

export const createSnippetLoader = () => {
  return new DataLoader(async (snippetIds) => {
    const snippets = await Snippet.find({ _id: { $in: snippetIds } });
    
    const snippetMap = {};
    snippets.forEach(snippet => {
      snippetMap[snippet._id.toString()] = snippet;
    });
    
    return snippetIds.map(id => snippetMap[id.toString()] || null);
  });
};

export const createSnippetsByOwnerLoader = () => {
  return new DataLoader(async (ownerIds) => {
    const snippets = await Snippet.find({ owner: { $in: ownerIds } });
    
    const snippetsByOwner = {};
    ownerIds.forEach(id => {
      snippetsByOwner[id.toString()] = [];
    });
    
    snippets.forEach(snippet => {
      const ownerId = snippet.owner.toString();
      if (snippetsByOwner[ownerId]) {
        snippetsByOwner[ownerId].push(snippet);
      }
    });
    
    return ownerIds.map(id => snippetsByOwner[id.toString()] || []);
  });
};

export const createLoaders = () => {
  return {
    userLoader: createUserLoader(),
    snippetLoader: createSnippetLoader(),
    snippetsByOwnerLoader: createSnippetsByOwnerLoader()
  };
};

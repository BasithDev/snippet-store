import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

export const userResolvers = {
    Query: {
        getUser: async (_, {id}, context) => {
            if (context.loaders) {
                return await context.loaders.userLoader.load(id);
            }
            return await User.findById(id).select("-password");
        },
        getAllUsers: async () =>{
            return await User.find().select("-password");
        }
    },
    Mutation: {
        registerUser: async (_, {input}) => {
            const {username, email, password} = input;
            const existingUser = await User.findOne({email});
            if (existingUser) {
                throw new Error("User already exists");
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({username, email, password: hashedPassword});
            await user.save();
            const token = jwt.sign({id: user._id}, JWT_SECRET,{expiresIn: "3h"});
            return {token,user:{
                id: user._id,
                username: user.username,
                email: user.email,
            }};
        },
        loginUser: async (_, {input}) => {
            const {email, password} = input;
            const user = await User.findOne({email});
            if (!user) {
                throw new Error("User not found");
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid password");
            }
            const token = jwt.sign({id: user._id}, JWT_SECRET,{expiresIn: "3h"});
            return {token,user:{
                id: user._id,
                username: user.username,
                email: user.email,
            }};
        }
    }
}
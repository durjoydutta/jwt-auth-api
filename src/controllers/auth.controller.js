import mongoose from 'mongoose';
import User from '../models/user.model.js';

export const signUp = async  (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {username, email, password} = req.body;
        if (!username || !email) {
            return res.status(400).send('Both Username and email is required');
        }
        if (!password) {
            return res.status(400).send('Password is required');
        }
        const isExistingUser = await User.exists({$or : [{email}, {username}]});
        if (isExistingUser) {
            return res.status(409).send('User already exists');
        }

        const newUser = await User.create([{username, email, password}], {session});

        await session.commitTransaction();

        if (newUser) {
            const accessToken = await newUser[0].generateAuthToken();
            // const verify = await User.findByToken(accessToken);
            // console.log(verify);
            return res.status(201).json({
                success: true,
                message: 'User created successfully',
                token: accessToken,
                data: {
                    id: newUser[0]._id,
                    username: newUser[0].username,
                    email: newUser[0].email,
                }
            })
        } else {
            return res.status(400).send('Unable to create user');
        }
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        return res.status(400).send(error.message);
    } finally {
        await session.endSession();
    }

};

export const signIn = (req, res, next) => {
    res.send('signIn');
};

export const signOut = (req, res, next) => {
    res.send('signOut');
};
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

export const signIn = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user by username and include password for verification
        const user = await User.findOne({ username }).select('+password');

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password is correct
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = await user.generateAuthToken();

        // Set token in HTTP-only cookie
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' // use secure in production
        };

        res.cookie('jwt', token, cookieOptions);

        // Send response
        return res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'An error occurred during sign in',
            error: error.message
        });
    }
};

export const signOut = (req, res, next) => {
    res.send('signOut');
};
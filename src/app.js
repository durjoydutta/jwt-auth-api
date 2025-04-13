import app from '../server.js';
import express from 'express';
import cookieParser from 'cookie-parser';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


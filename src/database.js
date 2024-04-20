import { MongoClient } from 'mongodb';
import fs from 'fs';
import util from 'util';

import { exec } from 'child_process';

import dotenv from 'dotenv';
dotenv.config();

const writeFileAsync = util.promisify(fs.writeFile);

export class MongoDB {
    constructor() {
        this.uri = process.env.URI;
        this.client = new MongoClient(this.uri);
        this.dbName = 'gamification';
        this.collectionName = 'user_data';
    }

    async connect() {
        try {
            this.db = this.client.db(this.dbName);
            this.collection = this.db.collection(this.collectionName);
            console.log("Mongo DB successfully connected. ");
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }

    async closeConnection() {
        try {
            await this.client.close();
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
        }
    }

    async createUser(userName) {
        console.log(`Creating user: ${userName}.`);
        const newUser = {
            _id: userName,
            user_data: {
                xp: 0,
                level: 0,
                gitcoins: 0
            }
        };
        try {
            await this.collection.insertOne(newUser);
            return true
        } catch (error) {
            if (error.code === 11000) {
                console.log('User already exists!');
            } else {
                console.error('Error creating user:', error);
            }
            return false;
        }
    }

    async updateData(userData) {
        const filterQuery = { _id: userData._id };
        const updateQuery = { $set: userData };
        try {
            await this.collection.updateOne(filterQuery, updateQuery, { upsert: true });
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    }

    async downloadUserData(user) {
        try {
            const userDocument = await this.collection.findOne({ _id: user });
            console.log('User Data:', userDocument);
            return userDocument;
        } catch (error) {
            console.error('Error downloading user data:', error);
        }
    }

    async printUserDataToFile(user, filename) {
        try {
            const userDocument = await this.collection.findOne({ _id: user });
            console.log('Fetched user data:', userDocument);
            const data = JSON.stringify(userDocument, null, 2);
            await writeFileAsync(filename, data);
            console.log(`User data for ${user} has been printed to ${filename}`);
        } catch (error) {
            console.error('Error printing user data to file:', error);
        }
    }

    async generateSVG(user) {
        try {
            const userDocument = await this.collection.findOne({ _id: user });
            console.log('Fetched user data:', userDocument);
            
            // Define styles
            const styles = `
            <style>
            text {
                font-family: Arial, sans-serif;
                font-size: 16px;
                fill: #333; /* Text color */
            }
            .label {
                font-weight: bold;
                fill: #666; /* Label color */
            }
            </style>
            `;

            // Generate SVG content with styles
            const svgContent = `
                <svg width="400" height="200">
                ${styles}
                <text class="label" x="10" y="30">XP:</text>
                <text x="60" y="30">${userDocument.user_data.xp}</text>
                <text class="label" x="10" y="60">Level:</text>
                <text x="60" y="60">${userDocument.user_data.level}</text>
                <text class="label" x="10" y="90">Gitcoins:</text>
                <text x="90" y="90">${userDocument.user_data.gitcoins}</text>
                </svg>
            `;

            await writeFileAsync(`${user}_stats.svg`, svgContent);
            console.log(`SVG file for ${user} stats has been generated.`);
        } catch (error) {
            console.error('Error generating SVG:', error);
        }
    }
}

// main
async function main() {
    const user =  'kristiana11';
    const db = new MongoDB();
    await db.connect();

    // Download user data and print to file
    await db.printUserDataToFile(user, 'userdata.json');

    // Generate SVG for user stats
    await db.generateSVG(user);

    await db.closeConnection();
}

// Execute the main function
main().catch(error => {
    console.error('An error occurred:', error);
});

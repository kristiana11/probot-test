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

            // when database updates, svg and readme does too
            await this.generateSVG(userData._id);
            await this.commitAndPushChanges();
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

    async generateSVG(user) {
        try {
            const userDocument = await this.collection.findOne({ _id: user });
            console.log('Fetched user data:', userDocument);

            // Define styles
            const styles = `
            <style>
                .header {
                    font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
                    fill: #21262d;
                    animation: fadeInAnimation 0.8s ease-in-out forwards;
                }
                @supports(-moz-appearance: auto) {
                    /* Selector detects Firefox */
                    .header { font-size: 15.5px; }
                }
                
                .username {
                    font: 600 15px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: black;
                }

                .stat {
                    font: 600 9px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: black;
                }

                .levels {
                    font: 600 12px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: black;
                }

                @supports(-moz-appearance: auto) {
                    /* Selector detects Firefox */
                    .stat { font-size:12px; }
                }
                .stagger {
                    opacity: 0;
                    animation: fadeInAnimation 0.3s ease-in-out forwards;
                }
                .rank-text {
                    font: 800 24px 'Segoe UI', Ubuntu, Sans-Serif; fill: black;
                    animation: scaleInAnimation 0.3s ease-in-out forwards;
                }
                .rank-percentile-header {
                    font-size: 14px;
                }
                .rank-percentile-text {
                    font-size: 16px;
                }
                
                .not_bold { font-weight: 400 }
                .bold { font-weight: 700 }
                .icon {
                    fill: #4c71f2;
                    display: none;
                }

                .rank-circle-rim {
                    stroke: #2f80ed;
                    fill: none;
                    stroke-width: 6;
                    opacity: 0.2;
                }
                .rank-circle {
                    stroke: #2f80ed;
                    stroke-dasharray: 200;
                    fill: none;
                    stroke-width: 6;
                    stroke-linecap: round;
                    opacity: 0.8;
                    transform-origin: -10px 8px;
                    transform: rotate(-90deg);
                    animation: rankAnimation 1s forwards ease-in-out;
                }
                
                @keyframes rankAnimation {
                    from {
                        stroke-dashoffset: 251.32741228718345;
                    }
                    to {
                        stroke-dashoffset: 151.89854433219094;
                    }
                }
                
                /* Animations */
                @keyframes scaleInAnimation {
                    from {
                        transform: translate(-5px, 5px) scale(0);
                    }
                    to {
                        transform: translate(-5px, 5px) scale(1);
                    }
                }
                @keyframes fadeInAnimation {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            </style>
            `;

            // Generate SVG content with styles
            const svgContent = `
            <svg
                width="450"
                height="195"
                viewBox="0 0 450 195"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-labelledby="descId"
            >
                <title id="titleId">User's Quest Stats</title>
                ${styles}
                <rect
                data-testid="card-bg"
                x="0.5"
                y="0.5"
                rx="4.5"
                height="99%"
                stroke="#e4e2e2"
                width="449"
                fill="white"
                stroke-opacity="1"
                />



                <!-- Displays User Stats -->
                <g data-testid="main-card-body" transform="translate(0, 75)">  
                    <g data-testid="rank-circle" transform="translate(365, 30)">
                        <circle class="rank-circle-rim" cx="-300" cy="-20" r="58" />
                        <circle class="rank-circle" cx="17" cy="-282" r="58" />
                        <g class="rank-text">
                        <text x="-292" y="55" 
                            alignment-baseline="middle" 
                            dominant-baseline="middle" 
                            text-anchor="middle" 
                            class="username bold" 
                            fill="#2f80ed">
                            ${userDocument._id}
                        </text>
                        </g>
                    </g>
                </g>

                <!-- Quests Completed -->
                <g data-testid="main-card-body" transform="translate(0, 55)">
                <svg x="130" y="-29" width="550" height="550">

                    <!-- width=3% is the 0% of bar-->
                    <!-- width=33% is the all of bar-->
                    <!-- 30 -->

                    <!-- Level -->
                    <g transform="translate(97, -5)">
                        <g class="stagger" style="animation-delay: 750ms" transform="translate(25, 0)">
                            <text class="stat  bold"  y="12.5">📊LEVEL:</text>
                            <text
                            class="stat  bold"
                            x="41"
                            y="12.5"
                            data-testid="prs">
                            ${userDocument.user_data.level}
                            </text>
                        </g>
                    </g>


                    <!-- XP -->
                    <g transform="translate(165, -5)">
                        <g class="stagger" style="animation-delay: 750ms" transform="translate(25, 0)">
                            <text class="stat  bold"  y="12.5">✨XP:</text>
                            <text
                            class="stat  bold"
                            x="26"
                            y="12.5"
                            data-testid="prs">
                            ${userDocument.user_data.xp}
                            </text>
                        </g>
                    </g>

                    <!-- Gitcoins -->
                    <g transform="translate(215, -5)">
                        <g class="stagger" style="animation-delay: 750ms" transform="translate(25, 0)">
                            <text class="stat  bold"  y="12.5">GITCOINS:</text>
                            <text
                            class="stat  bold"
                            x="50"
                            y="12.5"
                            data-testid="prs">
                            ${userDocument.user_data.gitcoins}
                            </text>
                        </g>
                    </g>



                    <!-- Quests Completed -->
                    <text x="2" y="36" class="levels bold" fill="black">Quests Completed</text>
                    <rect x="120" y="20" width="185" height="25" fill="white" rx="10" stroke="black" stroke-width="2"/>
                    <rect x="123" y="22" width="3%" height="20" fill="#2f80ed" rx="10" />
                    <text x="265" y="35" fill="black" dominant-baseline="middle">0%</text>

                    <!-- Current Progress -->
                    <text x="2" y="70" class="levels bold" fill="black">Current Progress</text>
                    <rect x="120" y="55" width="188" height="25" fill="white" rx="10" stroke="black" stroke-width="2"/>
                    <rect x="123" y="57" width="3%" height="20" fill="#2f80ed" rx="10" />
                    <text x="265" y="70" fill="black" dominant-baseline="middle">0%</text>

                    <!-- Streak  -->
                    <text x="2" y="105" class="levels bold" fill="black">Streak</text>
                    <rect x="120" y="90" width="188" height="25" fill="white" rx="10" stroke="black" stroke-width="2"/>
                    <rect x="123" y="92" width="3%" height="20" fill="#2f80ed" rx="10" />
                    <text x="265" y="105" fill="black" dominant-baseline="middle">0%</text>

                    <!-- Streak  -->
                    <text x="2" y="145" class="levels bold" fill="black">Badges</text>
                    <rect x="120" y="125" width="188" height="25" fill="white" rx="10" stroke="black" stroke-width="2"/>
                    
                </g>
            </svg>
        </svg>`;


            await writeFileAsync(`userStats.svg`, svgContent);
            console.log(`SVG file for ${user} stats has been generated.`);

            // Update the repo with SVG content after SVG file creation
            await this.commitAndPushChanges();
        } catch (error) {
            console.error('Error generating SVG:', error);
        }
    }

    async commitAndPushChanges() {
        exec('git add userStats.svg', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error adding userStats.svg to staging area: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error adding userStats.svg to staging area: ${stderr}`);
                return;
            }
            console.log('userStats.svg added to staging area.');
            
            // Commit changes
            exec('git commit -m "Update userStats.svg"', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error committing changes: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Error committing changes: ${stderr}`);
                    return;
                }
                console.log('Changes committed.');

            // Push changes
            exec('git push', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error pushing changes to GitHub: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Error pushing changes to GitHub: ${stderr}`);
                    return;
                }
                console.log('Changes pushed to GitHub successfully.');
            });
        });
    });
    } catch (error) {
        console.error('Error updating README with SVG:', error);
    }
}

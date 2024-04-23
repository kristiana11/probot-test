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
                    fill="#white"
                    stroke-opacity="1"
                />

                <!-- Displays User Stats -->
                <g data-testid="main-card-body" transform="translate(0, 55)">  
                    
                    <g data-testid="rank-circle" transform="translate(365, 30)">
                        <circle class="rank-circle-rim" cx="-300" cy="-20" r="50" />
                        <circle class="rank-circle" cx="17" cy="-282" r="50" />
                        <g class="rank-text">
                            <text x="-292" y="40" 
                                alignment-baseline="middle" 
                                dominant-baseline="middle" 
                                text-anchor="middle" 
                                class="username bold" 
                                fill="#2f80ed">
                                ${userDocument._id}
                            </text>
                        </g>
                    </g>

                    <!-- XP -->
                    <svg x="4" y="80">
                        <g transform="translate(0, -2)">
                            <g class="stagger" style="animation-delay: 450ms" transform="translate(25, 0)">
                                <text class="stat  bold"  y="12.5">XP:</text>
                                <text
                                    class="stat  bold"
                                    x="18"
                                    y="12.5"
                                    data-testid="stars">
                                    ${userDocument.user_data.xp}
                                </text>
                            </g>  
                        </g>

                        <!-- Level -->
                        <g transform="translate(0, 10)">
                            <g class="stagger" style="animation-delay: 600ms" transform="translate(25, 0)">
                                
                                <text class="stat  bold"  y="12.5">LEVEL:</text>
                                <text
                                    class="stat  bold"
                                    x="35"
                                    y="12.5"
                                    data-testid="commits">
                                    ${userDocument.user_data.level}
                                </text>
                            </g>
                        </g>

                        <!-- Gitcoins -->
                        <g transform="translate(-1, 22)">
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

                    </svg>
                </g>

                <!-- Levels Menu -->
                <g data-testid="main-card-body" transform="translate(0, 55)">
                    <svg x="130" y="-29" width="215" height="200">

                        <!-- width=10% is the 0% of bar-->
                        <!-- width=77% is the all of bar-->

                        <!-- Level 1 Progression Bar -->
                        <text x="-1" y="15" class="levels bold" fill="black">Level 1</text>
                        <rect x="47" y="0" width="165" height="20" fill="white" rx="10" stroke="black" stroke-width="2"/>
                        <rect x="49" y="2.5" width="20%" height="15.5" fill="#2f80ed" rx="10" />
                        <text x="172" y="12" fill="black" dominant-baseline="middle">10%</text>
                        
                        <!-- Level 2 Progression Bar -->
                        <text x="-1" y="45" class="levels bold" fill="black">Level 2</text>
                        <rect x="47" y="30" width="165" height="20" fill="white" rx="10" stroke="black" stroke-width="2"/>
                        <rect x="49" y="32.5" width="10%" height="15.5" fill="#2f80ed" rx="10" />
                        <text x="172" y="42" fill="black" dominant-baseline="middle">0%</text>

                        <!-- Level 3 Progression Bar -->
                        <text x="-1" y="75" class="levels bold" fill="black">Level 3</text>
                        <rect x="47" y="60" width="165" height="20" fill="white" rx="10" stroke="black" stroke-width="2"/>
                        <rect x="49" y="62.5" width="10%" height="15.5" fill="#2f80ed" rx="10" />
                        <text x="172" y="72" fill="black" dominant-baseline="middle">0%</text>

                        <!-- Level 4 Progression Bar -->
                        <text x="-1" y="105" class="levels bold" fill="black">Level 4</text>
                        <rect x="47" y="90" width="165" height="20" fill="white" rx="10" stroke="black" stroke-width="2"/>
                        <rect x="49" y="92.5" width="10%" height="15.5" fill="#2f80ed" rx="10" />
                        <text x="172" y="102" fill="black" dominant-baseline="middle">0%</text>

                        <!-- Level 5 Progression Bar -->
                        <text x="-1" y="135" class="levels bold" fill="black">Level 5</text>
                        <rect x="47" y="120" width="165" height="20" fill="white" rx="10" stroke="black" stroke-width="2"/>
                        <rect x="49" y="122.5" width="10%" height="15.5" fill="#2f80ed" rx="10" />
                        <text x="172" y="132" fill="black" dominant-baseline="middle">0%</text>
                    </svg>
                </g>

                <!-- Medals Title -->
                <g data-testid="card-title" transform="translate(375, 18)">
                    <g transform="translate(0, 0)">
                        <text
                            x="0"
                            y="0"
                            class="levels"
                            data-testid="header">
                            Medals
                        </text>
                    </g>
                </g>

                <!-- Medals -->
                <g data-testid="main-card-body" transform="translate(0, 55)">
                    <svg x="350" y="-180" width="225" height="300">

                        <!-- Level 1 Medals -->
                        <circle cx="14" cy="160" r="13" fill="gold" stroke="black" stroke-width="2"/>
                        <circle cx="45" cy="160" r="13" fill="white" stroke="black" stroke-width="2"/>
                        <circle cx="76" cy="160" r="13" fill="white" stroke="black" stroke-width="2"/>

                        <!-- Level 2 Medals -->
                        <circle cx="14" cy="190" r="13" fill="white" stroke="black" stroke-width="2"/>
                        <circle cx="45" cy="190" r="13" fill="white" stroke="black" stroke-width="2"/>
                        <circle cx="76" cy="190" r="13" fill="white" stroke="black" stroke-width="2"/>

                        <!-- Level 3 Medals -->
                        <circle cx="14" cy="220" r="13" fill="white" stroke="black" stroke-width="2"/>
                        <circle cx="45" cy="220" r="13" fill="white" stroke="black" stroke-width="2"/>
                        <circle cx="76" cy="220" r="13" fill="white" stroke="black" stroke-width="2"/>

                        <!-- Level 4 Medals -->
                        <circle cx="14" cy="250" r="13" fill="white" stroke="black" stroke-width="2"/>
                        <circle cx="45" cy="250" r="13" fill="white" stroke="black" stroke-width="2"/>
                        <circle cx="76" cy="250" r="13" fill="white" stroke="black" stroke-width="2"/>

                        <!-- Level 5 Medals -->
                        <circle cx="14" cy="280" r="13" fill="white" stroke="black" stroke-width="2"/>
                        <circle cx="45" cy="280" r="13" fill="white" stroke="black" stroke-width="2"/>
                        <circle cx="76" cy="280" r="13" fill="white" stroke="black" stroke-width="2"/>
                    </svg>
                </g>
            </svg>
            `;


            await writeFileAsync(`user_stats.svg`, svgContent);
            console.log(`SVG file for ${user} stats has been generated.`);
        } catch (error) {
            console.error('Error generating SVG:', error);
        }
    }

    async updateReadmeWithSVG(user) {
        try {
            // Read the existing README content
            const readmePath = 'README.md';
            let readmeContent = fs.readFileSync(readmePath, 'utf-8');
    
            // Generate the SVG file name
            const svgFileName = `$user_stats.svg`;
    
            // Construct the SVG image markdown
            const svgMarkdown = `![User Stats](${svgFileName})`;
    
            // Find the placeholder in the README content
            const placeholder = '<!-- USER_STATS_SVG -->';
    
            // Replace the placeholder with the SVG markdown
            readmeContent = readmeContent.replace(placeholder, svgMarkdown);
    
            // Write the updated README content back to the file
            fs.writeFileSync(readmePath, readmeContent, 'utf-8');
    
            console.log(`README updated with ${svgFileName}`);
        } catch (error) {
            console.error('Error updating README with SVG:', error);
        }
    }
}

import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'

// 🔹 Replace with your MongoDB Atlas URI
const MONGODB_URI = 'mongodb+srv://marked12:Ngf%24FSn%2EAkH%40w5q@cluster0.ceqna9n.mongodb.net/?appName=Cluster0'
const DB_NAME = 'leaderboardDB'

const app = express()
app.use(cors())
app.use(express.json())

let db

app.post('/api/scores', async (req, res) => {
    try {
        const { team, event, medal } = req.body

        if (!team || !event || !medal) {
            return res.status(400).json({ error: 'Team, event, and medal are required' })
        }

        const collection = db.collection('scores')

        const newScore = {
            team,
            event,
            medal,
            createdAt: new Date(),
        }

        const result = await collection.insertOne(newScore)

        res.status(201).json({
            message: 'Score saved successfully',
            scoreId: result.insertedId,
        })
    } catch (err) {
        console.error('❌ Failed to save score:', err)
        res.status(500).json({ error: 'Failed to save score' })
    }
})
async function startServer() {
    try {
        // Connect to MongoDB Atlas
        const client = await MongoClient.connect(MONGODB_URI)
        db = client.db(DB_NAME)
        console.log('✅ Connected to MongoDB:', DB_NAME)

        // Fetch and print leaderboard immediately
        const collection = db.collection('scores') // Your collection in Atlas
        const data = await collection.find({}).sort({ total: -1 }).toArray()

        // API route
        app.get('/api/leaderboard', async (req, res) => {
            try {
                const collection = db.collection('scores')

                // Fetch all documents
                const data = await collection.find({}).toArray()

                // console.table(
                //   data.map(row => ({
                //     team: row.team ?? 'Unknown',
                //     event: row.event ?? 'Unknown',
                //     medal: row.medal ?? 'None',
                //   }))
                // )
                const rawData = data;
                const uniqueCount = new Set(data.map(e => e.event)).size;
                // Aggregate medals per team
                const leaderboardMap = {}


                data.forEach((row) => {
                    const team = row.team ?? 'Unknown Team'
                    const medal = row.medal?.toLowerCase()

                    if (!leaderboardMap[team]) {
                        leaderboardMap[team] = { team, gold: 0, silver: 0, bronze: 0 }
                    }

                    if (medal === 'gold') leaderboardMap[team].gold += 1
                    else if (medal === 'silver') leaderboardMap[team].silver += 1
                    else if (medal === 'bronze') leaderboardMap[team].bronze += 1
                })

                // Convert map to array and add total
                const leaderboard = Object.values(leaderboardMap).map((teamData) => ({
                    ...teamData,
                    total: teamData.gold + teamData.silver + teamData.bronze,
                }))

                // Sort by total descending
                leaderboard.sort((a, b) => b.total - a.total)

                // console.log('📊 Leaderboard:')
                // console.table(leaderboard)

                res.json({ leaderboard, uniqueCount, rawData })


            } catch (err) {
                console.error('❌ Failed to fetch leaderboard:', err)
                res.status(500).json({ error: 'Failed to fetch leaderboard' })
            }
        })


        const PORT = 4000
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        })
    } catch (err) {
        console.error('❌ MongoDB connection error:', err)
    }
}

startServer()

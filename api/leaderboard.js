import { connectToDatabase } from '../lib/mongodb'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { db } = await connectToDatabase()
        const data = await db.collection('scores').find({}).toArray()

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

        const leaderboard = Object.values(leaderboardMap).map((teamData) => ({
            ...teamData,
            total: teamData.gold + teamData.silver + teamData.bronze,
        }))

        leaderboard.sort((a, b) => b.total - a.total)

        const uniqueCount = new Set(data.map((e) => e.event)).size

        res.json({ leaderboard, uniqueCount, rawData: data })
    } catch (err) {
        console.error('❌ Failed to fetch leaderboard:', err)
        res.status(500).json({ error: 'Failed to fetch leaderboard' })
    }
}

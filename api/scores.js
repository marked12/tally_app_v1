import { connectToDatabase } from '../lib/mongodb'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { team, event, medal } = req.body
    if (!team || !event || !medal) {
        return res.status(400).json({ error: 'Team, event, and medal are required' })
    }

    try {
        const { db } = await connectToDatabase()
        const newScore = { team, event, medal, createdAt: new Date() }
        const result = await db.collection('scores').insertOne(newScore)

        res.status(201).json({
            message: 'Score saved successfully',
            scoreId: result.insertedId,
        })
    } catch (err) {
        console.error('❌ Failed to save score:', err)
        res.status(500).json({ error: 'Failed to save score' })
    }
}

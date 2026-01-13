import { MongoClient } from 'mongodb'

let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
    if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb }

    if (!process.env.MONGO_URI) {
        throw new Error('Please add MONGO_URI to your environment variables')
    }

    const client = await MongoClient.connect(process.env.MONGO_URI)
    const db = client.db() // DB name comes from URI
    cachedClient = client
    cachedDb = db
    return { client, db }
}

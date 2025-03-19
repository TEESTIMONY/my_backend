const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");

// Replace with your actual Upstash Redis URL
const redis = new Redis("rediss://default:AV5mAAIjcDEzMGM5NTdmMDEyMmQ0ZDkwOTAyNWU1NWI2OWRmM2QyN3AxMA@willing-mole-24166.upstash.io:6379");

const app = express();
app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(express.json());

// Save score to Redis
app.post("/api/score", async (req, res) => {
    const { score, player } = req.body;
    if (typeof score !== "number" || !player) {
        return res.status(400).json({ error: "Invalid score or player name" });
    }

    // Get the existing score (if any)
    const currentScore = await redis.zscore("leaderboard", player);
    
    // Calculate new total score
    const newScore = (currentScore ? Number(currentScore) : 0) + score;

    // Update the leaderboard
    await redis.zadd("leaderboard", newScore, player);

    res.json({ message: "Score updated successfully!", player, newScore });
});

// Retrieve top scores from Redis
app.get("/api/leaderboard", async (req, res) => {
    const scores = await redis.zrevrange("leaderboard", 0, -1, "WITHSCORES");
    let formattedScores = [];

    for (let i = 0; i < scores.length; i += 2) {
        formattedScores.push({ player: scores[i], score: Number(scores[i + 1]) });
    }

    res.json(formattedScores);
});

app.listen(3000, () => console.log("Server running on port 3000"));





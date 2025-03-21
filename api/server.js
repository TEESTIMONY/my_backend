const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");

const redis = new Redis(process.env.UPSTASH_REDIS_URL);
const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/score", async (req, res) => {
    const { score, player } = req.body;
    if (typeof score !== "number" || !player) {
        return res.status(400).json({ error: "Invalid score or player name" });
    }

    const currentScore = await redis.zscore("leaderboard", player);
    const newScore = (currentScore ? Number(currentScore) : 0) + score;
    await redis.zadd("leaderboard", newScore, player);

    res.json({ message: "Score updated!", player, newScore });
});

app.get("/api/leaderboard", async (req, res) => {
    const scores = await redis.zrevrange("leaderboard", 0, -1, "WITHSCORES");
    let formattedScores = [];
    for (let i = 0; i < scores.length; i += 2) {
        formattedScores.push({ player: scores[i], score: Number(scores[i + 1]) });
    }
    res.json(formattedScores);
});

app.post("/api/save-player", (req, res) => {
    const { player, wallet } = req.body;

    if (!player || !wallet) {
        return res.status(400).json({ message: "Player and wallet are required" });
    }

    // Save the association (replace with your database logic)
    players[player] = wallet;

    console.log("Saved association:", players);
    res.json({ message: "Player association saved successfully" });
});

module.exports = app;

export const invalidateCache = async (req, input) => {
    const cachedKey = `post:${input}`;
    await req.redisClient.del(cachedKey);

    const key = await req.redisClient.keys("posts:*");

    if (key.length > 0) {
        await req.redisClient.del(key);
    }
};


function cosineSimilarity(a, b){
    const dot = a.reduce((sum, val, i) => sum + val*b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val*val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val*val, 0));
    return dot/(magA*magB);
}

export function retrieveTopK(queryVector, chunks, k=5){
    const finalChunks = (chunks.map(chunk => {
        const score = cosineSimilarity(queryVector, chunk.vector)
        return ({
        ...chunk,
        score
    })})).sort((a,b)=>b.score-a.score).slice(0,k);
    console.log(finalChunks);
    return finalChunks;
}


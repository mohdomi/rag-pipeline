export function chunkText(text, chunkSize=500, overlap=100){
    const chunks = [];
    let start = 0;
    while(start < text.length){
        const end = Math.min(start + chunkSize, text.length);
        chunks.push({
            text : text.slice(start, end),
            index: chunks.length
        });
        start += chunkSize - overlap;
    }
    return chunks;
}
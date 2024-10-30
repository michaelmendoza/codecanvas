/**
 * Tokenizes a Python line into syntax-highlighted tokens.
 * @param {string} line 
 * @returns {Array} - Array of token objects {type, value}
 */
export const tokenizePython = (line) => {  
    const tokens = [];
    const regexPatterns = [
        { type: 'comment', regex: /#.*$/ },
        { type: 'string', regex: /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(\\.[^"\\]*)*"|'[^'\\]*(\\.[^'\\]*)*')/ },
        { type: 'keyword', regex: /\b(def|return|if|else|elif|for|while|import|from|as|class|try|except|finally|with|lambda|pass|break|continue|and|or|not|in|is)\b/ },
        { type: 'number', regex: /\b\d+(\.\d+)?\b/ },
        { type: 'function', regex: /\b\w+(?=\()/ },
        { type: 'operator', regex: /[+\-*/%=<>!&|^~]/ },
        { type: 'variable', regex: /\b\w+\b/ }
    ];

    let remaining = line;
    while (remaining.length > 0) {
        let matched = false;
        for (let pattern of regexPatterns) {
            const match = remaining.match(pattern.regex);
            if (match && match.index === 0) {
                tokens.push({ type: pattern.type, value: match[0] });
                remaining = remaining.slice(match[0].length);
                matched = true;
                break;
            }
        }
        if (!matched) {
            // If no pattern matches, take the first character as default
            tokens.push({ type: 'default', value: remaining[0] });
            remaining = remaining.slice(1);
        }
    }
    return tokens;
}
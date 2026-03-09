const fs = require('fs');
const path = require('path');
const dir = __dirname;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.js'));

const OLD_KEY = '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';
const NEW_KEY = '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';
const NEW_MODEL = 'llama-3.1-8b-instant';

files.forEach(file => {
    if (file === 'update_keys.js' || file === 'build_screens.js') return;

    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let original = content;

    // 1. Replace the plain key occurrences
    content = content.replace(new RegExp(OLD_KEY, 'g'), NEW_KEY);

    // 2. Replace the prompt logic in interview.html
    // Using a more greedy but safer regex that handles nested parentheses in string
    content = content.replace(/const GROQ_API_KEY = storedKey \|\| prompt\("Enter your Groq API Key \(gsk_\.\.\.\) to connect to the AI:"\);/g, 'const GROQ_API_KEY = "' + NEW_KEY + '";');

    // 3. Replace any other variants of the prompt
    content = content.replace(/storedKey \|\| prompt\(.+?\)/g, '"' + NEW_KEY + '"');

    // 4. Replace storedGroq logic
    content = content.replace(/const storedGroq = localStorage\.getItem\("groqApiKey"\) \|\| ".+?";/g, 'const storedGroq = "' + NEW_KEY + '";');

    // 5. Replace models
    content = content.replace(/llama-3\.3-70b-versatile/g, NEW_MODEL);
    content = content.replace(/Llama-3\.3-70b-versatile/g, NEW_MODEL);

    if (content !== original) {
        fs.writeFileSync(path.join(dir, file), content);
        console.log('Updated', file);
    }
});

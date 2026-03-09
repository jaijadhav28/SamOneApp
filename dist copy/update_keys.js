const fs = require('fs');
const path = require('path');
const dir = __dirname;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.js'));

const OLD_KEY = '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';
const NEW_KEY = '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';

files.forEach(file => {
    if (file === 'update_keys.js' || file === 'build_screens.js') return;

    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let original = content;

    // Replace the specific `const GROQ_API_KEY = "old_key"`
    content = content.replace(new RegExp(OLD_KEY, 'g'), NEW_KEY);

    // Replace `const GROQ_API_KEY = storedKey || prompt(...)` in interview.html
    const promptRegex = /const GROQ_API_KEY = storedKey \|\| prompt\([^)]+\);/g;
    content = content.replace(promptRegex, 'const GROQ_API_KEY = "' + NEW_KEY + '";');

    // Replace `const storedGroq = localStorage.getItem(...) || "old_key"` with just the new key string literal
    const storedRegex = /const storedGroq = localStorage\.getItem\([^)]+\) \|\| \"[^\"]+\";/g;
    // Wait, the above logic might replace it with just the key string literal alone making syntax invalid if it expects a string.
    // If it's assigning to storedGroq, it should be: `const storedGroq = "NEW_KEY";`
    content = content.replace(storedRegex, 'const storedGroq = "' + NEW_KEY + '";');

    // Make sure we also update the model specifically from `llama-3.3-70b-versatile` to `llama-3.1-8b-instant`
    content = content.replace(/llama-3\.3-70b-versatile/g, 'llama-3.1-8b-instant');
    content = content.replace(/Llama-3\.3-70b-versatile/g, 'Llama-3.1-8b-instant');

    // In interview.html, if it had "const GROQ_API_KEY = storedKey || prompt", it also does:
    // const storedKey = localStorage.getItem("groqApiKey");
    // We can leave this harmlessly or remove it, but replacing the prompt alone works.

    // There is also `if (!GROQ_API_KEY) { alert... return null }` which is now basically `if (!"gsk_...")` which is always false, harmless.

    if (content !== original) {
        fs.writeFileSync(path.join(dir, file), content);
        console.log('Updated', file);
    }
});


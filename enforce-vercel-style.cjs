const fs = require('fs');
const path = require('path');

const directory = 'resources/js';

// Deep find all ts/tsx files
function findFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(filePath));
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = findFiles(directory);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Colors
    content = content.replace(/text-gray-900/g, 'text-foreground');
    content = content.replace(/text-gray-800/g, 'text-foreground');
    content = content.replace(/text-gray-700/g, 'text-muted-foreground');
    content = content.replace(/text-gray-600/g, 'text-muted-foreground');
    content = content.replace(/text-gray-500/g, 'text-muted-foreground');
    content = content.replace(/text-gray-400/g, 'text-muted-foreground');
    
    // Backgrounds
    content = content.replace(/bg-gray-50/g, 'bg-muted/50');
    content = content.replace(/bg-gray-100/g, 'bg-muted');
    content = content.replace(/bg-gray-200/g, 'bg-secondary');
    content = content.replace(/bg-gray-800/g, 'bg-secondary');
    content = content.replace(/bg-gray-900/g, 'bg-background');
    content = content.replace(/bg-white/g, 'bg-card');
    
    // Borders
    content = content.replace(/border-gray-100/g, 'border-border/50');
    content = content.replace(/border-gray-200/g, 'border-border');
    content = content.replace(/border-gray-300/g, 'border-border');
    content = content.replace(/border-gray-[0-9]{3}/g, 'border-border');

    // Neutral
    content = content.replace(/text-neutral-900/g, 'text-foreground');
    content = content.replace(/text-neutral-[5-8]00/g, 'text-muted-foreground');
    content = content.replace(/text-neutral-400/g, 'text-muted-foreground');
    
    // Dark mode explicitly (since semantic covers it)
    content = content.replace(/dark:bg-gray-[0-9]{3}/g, '');
    content = content.replace(/dark:text-gray-[0-9]{3}/g, '');
    content = content.replace(/dark:border-gray-[0-9]{3}/g, '');
    content = content.replace(/dark:text-white/g, '');
    content = content.replace(/dark:bg-slate-[0-9]{3}/g, '');
    content = content.replace(/dark:border-slate-[0-9]{3}/g, '');
    content = content.replace(/dark:text-slate-[0-9]{3}/g, '');

    // Focus rings
    content = content.replace(/focus:ring-blue-500/g, 'focus:ring-ring');
    content = content.replace(/focus:border-blue-500/g, 'focus:border-ring');
    content = content.replace(/text-blue-600/g, 'text-primary');
    content = content.replace(/text-blue-500/g, 'text-primary');
    content = content.replace(/bg-blue-600/g, 'bg-primary');
    content = content.replace(/bg-blue-500/g, 'bg-primary');
    content = content.replace(/hover:bg-blue-700/g, 'hover:bg-primary/90');
    content = content.replace(/hover:bg-blue-600/g, 'hover:bg-primary/90');

    // Clean up multiple spaces that might result from removals
    content = content.replace(/className="([^"]*)"/g, (match, p1) => {
        return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
    });
    
    content = content.replace(/className={`([^`]+)`}/g, (match, p1) => {
        return `className={\`${p1.replace(/\s+/g, ' ').trim()}\`}`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
console.log('Done!');

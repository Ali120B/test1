import fs from 'fs';
try {
    const data = fs.readFileSync('test-output.log', 'utf8');
    const match = data.match(/\"message\":\s*\"(.*?)\"/);
    if (match) {
        console.log('ERROR MESSAGE:', match[1]);
    } else {
        console.log('No error message found in log.');
    }
} catch (e) {
    console.error('Error reading log:', e.message);
}

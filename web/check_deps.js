import fs from 'fs';
import { exec } from 'child_process';

exec('npm list --depth=0 --json', (err, stdout, stderr) => {
    if (err) {
        fs.writeFileSync('deps_error.txt', JSON.stringify(err) + '\n' + stderr);
    }
    fs.writeFileSync('deps_status.json', stdout);
});

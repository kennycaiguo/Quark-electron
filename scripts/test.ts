import { execSync, spawn } from "child_process";
import * as fs from 'fs-extra';
import * as path from 'path';
import { printConsoleStatus } from './util';

let hasEnded: boolean = false;
const packageJSON = JSON.parse(fs.readFileSync('./package.json').toString());
const version = packageJSON.version;
const filePath = './test/__testResults__/result.json';

runTest().catch(console.error);
async function runTest() {
    setTimeout(() => {
        if (!hasEnded) {
            exitTest();
        }
    }, 1000 * 60 * 2);

    process.platform == 'darwin' ? macOSHandle() : null;

    const testFilePath = './test/__testing__fjdsbfkbsdibsdi__testing__testing.qrk';
    const cp =
        process.platform == 'win32' ?
            spawn(`./build/win-unpacked/Quark.exe`, [testFilePath]) :
            process.platform == 'linux' ?
                spawn(`./build/Quark-linux-x86_64-${version}.AppImage`, [testFilePath]) :
                process.platform == 'darwin' ?
                    // spawn(`open ./build/mac/Quark.app`, [testFilePath]) : null;
                    spawn(`open ./build/Quark-mac-${version}.dmg`, [testFilePath]) : null;
    // './build/mac/Quark.app' : null;
    // 'open ./build/mac/Quark.app' : null;
    // `open ${(`./build/mac/Quark.app`)}` : null;
    // `${path.resolve(`./build/Quark-mac-${version}.dmg`)}` : null;
    // `${path.resolve(`./build/Quark-mac-${version}.pkg`)}` : null;

    // if (!command) {
    //     process.exit(0);
    // }

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // const cp = spawn(command, ['./test/__testing__fjdsbfkbsdibsdi__testing__testing.qrk']);
    cp.stdout.on('data', function (data) { console.log(data.toString()); });
    cp.stderr.on('data', function (data) { console.log(data.toString()); });
    cp.on('close', (e) => {
        // postBuild();
        exitTest();
    });

    cp.on('error', (e) => {
        console.error(e);
    });
}

function exitTest() {
    hasEnded = true;
    if (fs.existsSync(filePath)) {
        const result = fs.readJsonSync(filePath);
        if (result.value == true) {
            const fileData = fs.readFileSync('./test/__testResults__/test-logs.txt').toString();
            console.log(fileData);

            // if (fileData.match(/(\[error\]|UnhandledPromiseRejectionWarning)/)) {
            if (fileData.match(/(UnhandledPromiseRejectionWarning)/)) {
                printConsoleStatus('Test Failed', 'danger');
                throw Error('Test Failed');
            }

            const numberOfErrors = (fileData.match(/\[error\]/g) || []);
            const linuxHeadlessException = (fileData.match(/(no version information available|Timer 'added-libs' does not exist)/g) || []);
            if (numberOfErrors.length - linuxHeadlessException.length !== 0) {
                console.log(`numberOfErrors: ${JSON.stringify(numberOfErrors, undefined, 4)} ${numberOfErrors.length}`);
                console.log(`linuxHeadlessException: ${JSON.stringify(linuxHeadlessException, undefined, 4)} ${linuxHeadlessException.length}`);
                throw Error('Test Failed');
            }

            printConsoleStatus('Test successful', 'success');
            process.exit(0);//required
        }
    }
    printConsoleStatus('Test Failed', 'danger');
    throw Error('Test Failed');
}

function postBuild() {
    const dir = fs.readdirSync('./build').map((val) => {
        return {
            val,
            isDir: fs.statSync(path.join('./build', val)).isDirectory()
        }
    })
    dir.map((val) => {
        if (!!val.val.match(/(mac|unpacked)/) && val.isDir) {
            console.log('build-dir = ', fs.readdirSync(path.join('./build', val.val)));
        }
    });
    console.log('dir = \n\n', JSON.stringify(dir, undefined, 4));

    if (process.platform == 'win32') {
        // const result = execSync(`ls`);
        // console.log(result.toString());
    } else {
        const result = execSync(`ls -la ./build`);
        console.log(result.toString());
    }
}

function macOSHandle() {
    const result = execSync(`chmod -R 777 ./build`);
    console.log(result.toString());
    execSync(`ls -la`);
}

// val =  [ 'Quark.app' ]
// dir =  [ 'Quark-mac-0.2.17.dmg',
//   'Quark-mac-0.2.17.dmg.blockmap',
//   'Quark-mac-0.2.17.zip',
//   'latest-mac.yml',
//   'mac' ]
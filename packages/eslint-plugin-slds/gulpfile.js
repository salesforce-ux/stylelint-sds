import { series, src, dest } from 'gulp';
import { rimraf} from 'rimraf'
import {task} from "gulp-execa";

/**
 * Clean all generated folder
 * @returns 
 */
function cleanDirs(){
    return rimraf(['build']);
}

 /**
  * Compile typescript files
  * */ 
const compileTs = task(`tsc --project ${process.cwd()}/tsconfig.json`);
  
export const build = series(cleanDirs, /* copy, */ compileTs);

export default task('gulp --tasks');